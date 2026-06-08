import os
import modal

# 1. Definição da imagem com todas as dependências necessárias
# Usamos uma imagem base com CUDA para garantir performance na GPU
image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install(
        "yt-dlp",
        "faster-whisper",
        "curl_cffi",
        "fastapi[standard]"
    )
    .apt_install("ffmpeg") # Essencial para o yt-dlp extrair o áudio em segundos
)

app = modal.App("youtube-whisper-bypass", image=image)

# ----------------------------------------------------------------------
# PASSO 1: DOWNLOAD DO ÁUDIO (EXECUÇÃO EM CPU COM PROXY RESIDENCIAL)
# ----------------------------------------------------------------------
# Certifique-se de criar um Secret no painel do Modal chamado "meu-proxy-secret"
# contendo a variável de ambiente PROXY_URL (ex: http://user:pass@gate.proxy.com:7000)
@app.function(
    image=image,
    secrets=[modal.Secret.from_name("brightdata-proxy", required_keys=["RESIDENTIAL_PROXY"])],
    timeout=300
)
def download_audio_com_proxy(video_url: str) -> bytes:
    import yt_dlp

    # URL do proxy (substituído pelo novo proxy fornecido)
    proxy_url = "http://brd-customer-hl_50cfa19c-zone-unodunoproxy:voo5cpt5qjsn@brd.superproxy.io:33335"

    # Caminho temporário no contêiner para o download
    output_template = "/tmp/%(id)s.%(ext)s"

    ydl_opts = {
        'format': 'bestaudio/best',
        'proxy': proxy_url, # O YouTube enxerga o IP doméstico do proxy, não da AWS
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True, # Necessário para o BrightData (proxy autoassinado)
        # Fingindo comportamento de navegador real na camada HTTP
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Sec-Fetch-Mode': 'navigate',
        },
        'outtmpl': output_template,
        # Força a extração direta do áudio em MP3/M4A leve para economizar banda do proxy
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
            'preferredquality': '128',
        }],
    }

    print(f"[BOT] Iniciando download seguro de: {video_url}")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)
        # O yt-dlp pode mudar a extensão após o postprocessor, capturamos o nome real:
        filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + ".m4a"

        # Lê o arquivo convertido direto para a memória como bytes
        with open(filename, "rb") as f:
            audio_bytes = f.read()

        # Limpa o arquivo temporário do contêiner para liberar memória
        if os.path.exists(filename):
            os.remove(filename)

    print(f"[BOT] Download concluído com sucesso. Tamanho: {len(audio_bytes) / (1024*1024):.2f} MB")
    return audio_bytes


# ----------------------------------------------------------------------
# PASSO 2: TRANSCRIÇÃO (ISOLADA NA GPU - SEM CONTATO COM O YOUTUBE)
# ----------------------------------------------------------------------
# Usamos a GPU A10G que oferece o melhor custo-benefício para processamento de áudio
@app.function(
    image=image,
    gpu="A10G",
    timeout=600
)
def rodar_whisper(audio_bytes: bytes) -> str:
    from faster_whisper import WhisperModel
    import io

    print("[IA] Carregando modelo Faster-Whisper na GPU...")
    # Usamos o modelo 'small' ou 'medium' para excelente precisão em português com velocidade
    model = WhisperModel("small", device="cuda", compute_type="float16")

    # Transforma os bytes da memória em um objeto de arquivo legível pelo Whisper
    audio_file = io.BytesIO(audio_bytes)

    print("[IA] Iniciando transcrição do áudio...")
    segments, info = model.transcribe(audio_file, beam_size=5, language="pt")

    # Coleta os segmentos conforme vão sendo processados pela GPU
    texto_transcrito = []
    segmentos_estruturados = []
    
    for segment in segments:
        texto_transcrito.append(segment.text)
        segmentos_estruturados.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip(),
            "confidence": 0.99
        })

    full_text = " ".join(texto_transcrito).strip()
    print("[IA] Transcrição concluída com sucesso!")
    
    return {
        "transcript": full_text,
        "segments": segmentos_estruturados,
        "language": info.language,
        "language_probability": info.language_probability
    }


# ----------------------------------------------------------------------
# PIPELINE PRINCIPAL (ORQUESTRAÇÃO E WEB ENDPOINT)
# ----------------------------------------------------------------------
from fastapi import FastAPI, Request
web_app = FastAPI()

@app.function(timeout=1200)
@modal.asgi_app()
def fastapi_app():
    return web_app

@web_app.post("/transcribe")
async def transcrever(request: Request):
    """
    Endpoint HTTP que recebe um JSON contendo a URL do vídeo.
    Exemplo de payload do Next.js: {"audio_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
    """
    payload = await request.json()
    video_url = payload.get("audio_url") or payload.get("video_url") or payload.get("url")
    if not video_url:
        return {"error": "A URL do vídeo é obrigatória."}, 400

    import time
    start_time = time.time()

    try:
        # Extrai URL real do YouTube caso a requisição venha do proxy unoduno
        if "api/audio-proxy?videoId=" in video_url:
            vid_id = video_url.split("videoId=")[1].split("&")[0]
            video_url = f"https://www.youtube.com/watch?v={vid_id}"

        # Etapa 1: Baixa o áudio mascarando o IP com o Proxy Residencial
        audio_data = await download_audio_com_proxy.remote.aio(video_url)

        # Etapa 2: Passa os bytes salvos para a GPU transcrever longe dos olhos do Google
        resultado = await rodar_whisper.remote.aio(audio_data)

        # Extrai ID do vídeo simples para fallback
        import urllib.parse
        parsed = urllib.parse.urlparse(video_url)
        video_id = urllib.parse.parse_qs(parsed.query).get('v', [''])[0] or "unknown"

        # Compatibilidade estrita com YouTubeTranscriptionSchema do Next.js e transcribeAudioTool
        return {
            "success": True,
            "videoId": video_id,
            "audioUrl": video_url, # Fallback, a API ignora se falhar
            "text": resultado["transcript"],          # Usado pelo transcribeAudioTool
            "transcript": resultado["transcript"],    # Usado pelo route.ts
            "segments": resultado["segments"],
            "duration_seconds": 0,                    # Usado pelo transcribeAudioTool
            "metadata": {
                "title": "Extraído via Proxy",
                "author": "Desconhecido",
                "duration": 0,
                "language": resultado["language"] or "pt",
                "languageProbability": resultado["language_probability"] or 1.0
            },
            "transcriptionStats": {
                "wordCount": len(resultado["transcript"].split()),
                "averageWordsPerSegment": len(resultado["transcript"].split()) / max(1, len(resultado["segments"])),
                "totalSegments": len(resultado["segments"]),
                "processingTimeSeconds": time.time() - start_time,
                "backend": "modal"
            }
        }

    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
