import os
import subprocess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import urllib.request
import urllib.error
import json
import modal

# 1. Definir a Imagem do Container na Modal
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg", "nodejs")
    .pip_install(
        "faster-whisper",
        "yt-dlp",  # Voltando para yt-dlp por ter suporte nativo robusto a cookies
        "fastapi[standard]",
        "pydantic",
        "requests"
    )
)

# Adiciona o arquivo de cookies diretamente na imagem se ele existir localmente
if os.path.exists("cookies.txt"):
    print("[+] Arquivo cookies.txt local encontrado! Ele será embutido na Imagem da GPU.")
    image = image.add_local_file("cookies.txt", remote_path="/root/cookies.txt")
else:
    print("[!] AVISO: cookies.txt não encontrado localmente. O yt-dlp rodará anônimo (alta chance de bloqueio do YouTube).")

# 2. Criar o App da Modal
app = modal.App("unoduno-transcriber")
web_app = FastAPI(title="Unoduno Ultra Fast Transcriber API")

class TranscribeRequest(BaseModel):
    audio_url: str
    language: Optional[str] = None
    compute_type: Optional[str] = "float16"

# Variável global para manter o modelo carregado na memória da GPU
model = None

def get_model():
    global model
    if model is None:
        from faster_whisper import WhisperModel
        print("[*] Carregando modelo Whisper Large-v3 na GPU...")
        model = WhisperModel("large-v3", device="cuda", compute_type="float16")
        print("[+] Modelo carregado com sucesso!")
    return model

@web_app.post("/transcribe")
def transcribe(request: TranscribeRequest):
    whisper_model = get_model()
    temp_filename = "temp_audio_to_transcribe"
    temp_file_ext = ".mp3"
    full_temp_path = temp_filename + temp_file_ext
    
    try:
        url_to_download = request.audio_url
        
        # Burlador inteligente: Se receber URL do proxy da Vercel, pega o link direto do YouTube
        if "api/audio-proxy?videoId=" in url_to_download:
            video_id = url_to_download.split("videoId=")[1].split("&")[0]
            url_to_download = f"https://www.youtube.com/watch?v={video_id}"

        print(f"[~] Fazendo download do áudio de: {url_to_download} ...")

        if "youtube.com" in url_to_download or "youtu.be" in url_to_download:
            print("[~] Usando yt-dlp para extração avançada com suporte a cookies...")
            command = [
                "yt-dlp",
                "-x", "--audio-format", "mp3",
                "-o", full_temp_path,
            ]
            
            # Se o arquivo de cookies foi montado no container com sucesso
            if os.path.exists("/root/cookies.txt"):
                print("[~] Arquivo cookies.txt encontrado na GPU! Usando sua sessão para burlar robôs do YT...")
                command.extend(["--cookies", "/root/cookies.txt"])
            else:
                print("[!] cookies.txt NÃO encontrado na GPU. Tentando extração anônima...")
                # Fallback para o cliente Android falso se não tiver cookies
                command.extend(["--extractor-args", "youtube:player_client=android"])
            
            command.append(url_to_download)
            
            process = subprocess.run(command, capture_output=True, text=True)
            if process.returncode != 0:
                raise Exception(f"yt-dlp falhou com erro: {process.stderr}")
            print("[+] Download do YouTube concluído via yt-dlp!")
            
        else:
            # Download de links diretos de MP3 genéricos
            import requests
            req = requests.get(url_to_download, stream=True)
            with open(full_temp_path, "wb") as f:
                for chunk in req.iter_content(chunk_size=1024*1024):
                    if chunk: f.write(chunk)
            print("[+] Download genérico concluído!")

        # Transcrição Otimizada
        print(f"[~] Iniciando transcrição de alta fidelidade...")
        segments, info = whisper_model.transcribe(
            full_temp_path, 
            language=request.language,
            beam_size=5,
            vad_filter=True, # Remove silêncios para acelerar processamento
        )

        result_segments = []
        full_text = []
        for segment in segments:
            full_text.append(segment.text)
            result_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })

        return {
            "success": True,
            "language": info.language,
            "language_probability": info.language_probability,
            "duration_seconds": round(info.duration, 2),
            "text": " ".join(full_text).strip(),
            "segments": result_segments
        }

    except Exception as e:
        print(f"[!] Erro no processamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno ao transcrever o áudio: {str(e)}")
        
    finally:
        # Limpeza
        if os.path.exists(full_temp_path):
            os.remove(full_temp_path)

# 3. Exportar como Web Endpoint na Modal usando uma GPU NVIDIA T4
@app.function(image=image, gpu="T4", timeout=1200) # Passando a montagem de arquivos via container image
@modal.asgi_app()
def fastapi_app():
    return web_app
