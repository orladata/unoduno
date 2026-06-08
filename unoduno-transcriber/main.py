import os
import time
import json
import random
import urllib.parse
from typing import Optional, Dict, Any, List

# Força o modo offline para o Hugging Face Hub (evita HEAD requests)
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import torch
from transformers import pipeline
import yt_dlp
import boto3

# Lê a lista gigante de proxies se o arquivo existir
PROXIES_LIST = []
if os.path.exists("proxies.txt"):
    with open("proxies.txt", "r") as f:
        PROXIES_LIST = [line.strip() for line in f if line.strip()]

# Variável de configuração de fallback
ENV_PROXY_URL = os.environ.get("RESIDENTIAL_PROXY", "http://brd-customer-hl_50cfa19c-zone-unodunoproxy:voo5cpt5qjsn@brd.superproxy.io:33335")

def get_random_proxy() -> str:
    if PROXIES_LIST:
        return random.choice(PROXIES_LIST)
    return ENV_PROXY_URL

print("[IA] Inicializando ambiente Cerebrium Serverless...")
print("[IA] Carregando pipeline Insanely-Fast-Whisper (Transformers + Native SDPA) em modo OFFLINE...")
pipe = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-large-v3-turbo",
    torch_dtype=torch.float16,
    device="cuda:0",
    model_kwargs={"attn_implementation": "sdpa"}
)
print("[IA] Modelo carregado e pronto.")

def download_audio_com_proxy(video_url: str) -> str:
    # Extrai o ID do vídeo para verificar cache local
    parsed = urllib.parse.urlparse(video_url)
    if "youtu.be" in parsed.netloc:
        video_id = parsed.path.lstrip('/')
    else:
        video_id = urllib.parse.parse_qs(parsed.query).get('v', [''])[0]
    
    if not video_id:
        video_id = "video"

    # Verifica cache em memória/disco (arquivos já baixados nesta sessão do container)
    possiveis_extensoes = ["webm", "m4a", "mp3"]
    for ext in possiveis_extensoes:
        cached_file = f"/tmp/{video_id}.{ext}"
        if os.path.exists(cached_file):
            print(f"[CACHE] Áudio já encontrado localmente em {cached_file}. Pulando download!")
            size_kb = os.path.getsize(cached_file) / 1024
            return cached_file, {"bitrate": 0, "codec": ext, "size_kb": round(size_kb, 2)}

    output_template = f"/tmp/{video_id}.%(ext)s"

    def extrair(proxy_url: Optional[str]):
        ydl_opts = {
            'format': 'worstaudio/bestaudio',
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            'outtmpl': output_template,
        }
        if proxy_url:
            ydl_opts['proxy'] = proxy_url
            safe_proxy = proxy_url.split("@")[-1] if "@" in proxy_url else proxy_url
            print(f"[BOT] Iniciando download (Proxy: {safe_proxy}) de: {video_url}")
        else:
            print(f"[BOT] Iniciando download (Conexão Direta/Sem Proxy) de: {video_url}")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            if 'entries' in info:
                info = info['entries'][0]
            ext = info.get('ext', 'webm')
            abr = info.get('abr', 0)
            acodec = info.get('acodec', 'unknown')
            expected_filename = f"/tmp/{video_id}.{ext}"

        if os.path.exists(expected_filename):
            file_size_kb = os.path.getsize(expected_filename) / 1024
            return expected_filename, {"bitrate": abr, "codec": acodec, "size_kb": round(file_size_kb, 2)}
        else:
            raise FileNotFoundError("Arquivo baixado não foi encontrado.")

    # Tentaremos até 5 proxies diferentes, pois é comum proxies residenciais ficarem offline
    max_tentativas = 5
    for tentativa in range(1, max_tentativas + 1):
        proxy_sorteado = get_random_proxy()
        try:
            return extrair(proxy_url=proxy_sorteado)
        except Exception as e:
            print(f"[!] Erro na tentativa {tentativa}/{max_tentativas} com proxy: {e}")
            if tentativa == max_tentativas:
                print("[~] Tentando Fallback: Baixando SEM proxy diretamente pela Cerebrium...")
                try:
                    return extrair(proxy_url=None)
                except Exception as fallback_e:
                    raise Exception(f"{fallback_e}")
            time.sleep(2)

def rodar_whisper(arquivo_path: str) -> dict:
    print("[IA] Iniciando transcrição com batching acelerado (Insanely-Fast)...")
    
    # O batch_size = 24 e chunk_length_s = 30 são os segredos da velocidade
    outputs = pipe(
        arquivo_path,
        chunk_length_s=30,
        batch_size=24,
        return_timestamps=True,
        generate_kwargs={"task": "transcribe"}
    )
    
    texto_transcrito = outputs.get("text", "").strip()
    chunks = outputs.get("chunks", [])
    
    segmentos_estruturados = []
    
    for chunk in chunks:
        timestamps = chunk.get("timestamp", (0.0, 0.0))
        start_time = timestamps[0] if timestamps[0] is not None else 0.0
        end_time = timestamps[1] if timestamps[1] is not None else 0.0
        
        segmentos_estruturados.append({
            "start": round(start_time, 2),
            "end": round(end_time, 2),
            "text": chunk.get("text", "").strip(),
            "confidence": 0.99
        })

    # Remoção do arquivo omitida para manter em cache local no /tmp/
    # if os.path.exists(arquivo_path):
    #     os.remove(arquivo_path)

    return {
        "transcript": texto_transcrito,
        "segments": segmentos_estruturados,
        "language": "pt",
        "language_probability": 1.0
    }

def salvar_no_r2(video_id: str, data_dict: dict) -> str:
    """
    Salva o JSON final no Cloudflare R2 usando as chaves de ambiente.
    """
    endpoint_url = os.environ.get("R2_ENDPOINT_URL")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    bucket_name = os.environ.get("R2_BUCKET_NAME")

    if not all([endpoint_url, access_key, secret_key, bucket_name]):
        print("[!] Chaves do Cloudflare R2 ausentes. Pulando upload.")
        return ""

    try:
        s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="auto"
        )
        
        file_key = f"transcricoes/{video_id}.json"
        json_data = json.dumps(data_dict, ensure_ascii=False, indent=2)
        
        print(f"[IA] Fazendo upload para R2: {file_key}")
        s3.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=json_data.encode("utf-8"),
            ContentType="application/json"
        )
        print("[IA] Upload concluído com sucesso!")
        
        # Retorna a URL pública customizada do domínio da Unoduno
        return f"https://texto.unoduno.com/{file_key}"
    except Exception as e:
        print(f"[!] Erro ao fazer upload para R2: {e}")
        return ""

def run(video_url: str, item: dict = None) -> dict:
    """
    Ponto de entrada do Cerebrium Serverless.
    (Opcionalmente recebemos item: dict para manter compatibilidade caso envie agrupado)
    """
    # Fallback caso envie {"item": {"video_url": "..."}}
    if item and "video_url" in item:
        video_url = item["video_url"]
        
    if not video_url:
        return {"success": False, "error": "A URL do vídeo é obrigatória."}
        
    start_time = time.time()

    try:
        # Resolve URLs proxy internas se for o caso
        if "api/audio-proxy?videoId=" in video_url:
            vid_id = video_url.split("videoId=")[1].split("&")[0]
            video_url = f"https://www.youtube.com/watch?v={vid_id}"

        # Etapa 1: Baixa o áudio com yt-dlp e proxy (Retorna o caminho do arquivo e os metadados)
        arquivo_path, audio_info = download_audio_com_proxy(video_url)

        # Etapa 2: Passa para o modelo HF Pipeline
        resultado = rodar_whisper(arquivo_path)

        parsed = urllib.parse.urlparse(video_url)
        if "youtu.be" in parsed.netloc:
            video_id = parsed.path.lstrip('/')
        else:
            video_id = urllib.parse.parse_qs(parsed.query).get('v', [''])[0] or "unknown"

        response_payload = {
            "success": True,
            "videoId": video_id,
            "audioUrl": video_url,
            "text": resultado["transcript"],
            "transcript": resultado["transcript"],
            "segments": resultado["segments"],
            "duration_seconds": 0,
            "metadata": {
                "title": "Extraído via Proxy (Cerebrium)",
                "language": "auto",
                "audio_bitrate_kbps": audio_info.get("bitrate", 0),
                "audio_codec": audio_info.get("codec", "unknown"),
                "audio_size_kb": audio_info.get("size_kb", 0)
            },
            "transcriptionStats": {
                "wordCount": len(resultado["transcript"].split()),
                "totalSegments": len(resultado["segments"]),
                "processingTimeSeconds": time.time() - start_time,
                "backend": "cerebrium"
            }
        }

        # Etapa 3: Upload Instantâneo pro Cloudflare R2
        r2_url = salvar_no_r2(video_id, response_payload)
        if r2_url:
            response_payload["r2_url"] = r2_url

        return response_payload

    except Exception as e:
        return {"success": False, "error": str(e)}
