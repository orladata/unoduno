import os
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import urllib.request
import urllib.error
import json
import modal
import uuid

# 1. Definir a Imagem do Container na Modal
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "nodejs")
    .pip_install(
        "faster-whisper",
        "yt-dlp",  # Voltando para yt-dlp por ter suporte nativo robusto a cookies
        "fastapi[standard]",
        "pydantic",
        "requests",
        "TTS",    # Coqui TTS para geração e clonagem de voz XTTSv2
        "pydub"   # Para manipulação e mesclagem de áudio
    )
)

# 2. Criar o App da Modal
app = modal.App("unoduno-transcriber")
web_app = FastAPI(title="Unoduno Ultra Fast Transcriber API")

class TranscribeRequest(BaseModel):
    audio_url: str
    language: Optional[str] = None
    compute_type: Optional[str] = "float16"

class DubSegment(BaseModel):
    start: float
    end: float
    text: str

class DubRequest(BaseModel):
    video_url: str
    segments: List[DubSegment]
    language: Optional[str] = "pt"

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
                "--extractor-args", "youtube:player_client=ios,tv", # Bypasses most bot checks by acting as an Apple TV/iOS device
                "--js-runtimes", "node",
                "-o", full_temp_path,
                url_to_download
            ]
            
            print("[~] Iniciando extração anônima camuflada como dispositivo Apple TV/iOS...")
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

# Variavel global para o modelo de voz (TTS)
tts_model = None

def get_tts_model():
    global tts_model
    if tts_model is None:
        # Concorda com os termos da Coqui automaticamente para rodar headless
        os.environ["COQUI_TOS_AGREED"] = "1"
        from TTS.api import TTS
        import torch
        print("[*] Carregando modelo XTTS-v2 na GPU para Clonagem de Voz...")
        # XTTS-v2 suporta PT, EN, ES, FR, etc.
        tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=torch.cuda.is_available())
        print("[+] Modelo de Voz carregado com sucesso!")
    return tts_model

@web_app.post("/dub")
def dub_video(request: DubRequest):
    tts = get_tts_model()
    from pydub import AudioSegment
    
    session_id = str(uuid.uuid4())[:8]
    original_video_path = f"original_{session_id}.mp4"
    original_audio_path = f"original_audio_{session_id}.wav"
    final_audio_path = f"final_audio_{session_id}.wav"
    final_video_path = f"video_dublado_{session_id}.mp4"
    
    try:
        url_to_download = request.video_url
        if "api/audio-proxy?videoId=" in url_to_download:
            video_id = url_to_download.split("videoId=")[1].split("&")[0]
            url_to_download = f"https://www.youtube.com/watch?v={video_id}"

        print(f"[~] Baixando vídeo original para Dublagem: {url_to_download}")
        
        if "youtube.com" in url_to_download or "youtu.be" in url_to_download:
            command = [
                "yt-dlp",
                "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                "--extractor-args", "youtube:player_client=ios,tv",
                "--js-runtimes", "node",
                "-o", original_video_path,
                url_to_download
            ]
            subprocess.run(command, capture_output=True, text=True, check=True)
        else:
            print("[~] URL de vídeo genérica detectada. Realizando download via requests...")
            import requests
            req = requests.get(url_to_download, stream=True)
            with open(original_video_path, "wb") as f:
                for chunk in req.iter_content(chunk_size=1024*1024):
                    if chunk: f.write(chunk)
            print("[+] Download genérico concluído!")
        
        print("[~] Extraindo Amostra de Voz de 10 segundos para Clonagem...")
        subprocess.run(["ffmpeg", "-i", original_video_path, "-t", "10", "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", original_audio_path, "-y"], check=True)
        
        print("[~] Reduzindo volume do áudio original (Ducking)...")
        base_audio = AudioSegment.from_file(original_video_path)
        base_audio = base_audio - 15 # Abaixa o volume em 15dB
        
        # Gerando voz para cada frase traduzida
        temp_files = []
        for i, seg in enumerate(request.segments):
            seg_audio_path = f"seg_{session_id}_{i}.wav"
            print(f"[~] Clonando Voz para o trecho: '{seg.text}'")
            
            # Gera a fala com a voz clonada
            tts.tts_to_file(
                text=seg.text, 
                speaker_wav=original_audio_path, 
                language=request.language, 
                file_path=seg_audio_path
            )
            
            generated_audio = AudioSegment.from_file(seg_audio_path)
            
            # Cola a nova voz exatamente no tempo (start) do vídeo original
            start_ms = int(seg.start * 1000)
            base_audio = base_audio.overlay(generated_audio, position=start_ms)
            
            temp_files.append(seg_audio_path)
            
        print("[~] Mesclando nova voz com o vídeo original...")
        base_audio.export(final_audio_path, format="wav")
        
        subprocess.run(["ffmpeg", "-i", original_video_path, "-i", final_audio_path, "-c:v", "copy", "-c:a", "aac", "-map", "0:v:0", "-map", "1:a:0", final_video_path, "-y"], check=True)
        
        print("[+] Vídeo Dublado com sucesso!")
        
        # Limpeza parcial (exceto o vídeo final que será retornado)
        for f in temp_files + [original_video_path, original_audio_path, final_audio_path]:
            if os.path.exists(f): os.remove(f)
            
        # Retorna o arquivo MP4 diretamente!
        return FileResponse(final_video_path, media_type="video/mp4", filename="video_dublado.mp4")

    except Exception as e:
        print(f"[!] Erro na Dublagem: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro na Dublagem Automática: {str(e)}")
@app.function(image=image, gpu="T4", timeout=1200) # Passando a montagem de arquivos via container image
@modal.asgi_app()
def fastapi_app():
    return web_app
