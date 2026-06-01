#!/usr/bin/env python3
"""
=============================================================================
MODAL AUDIO EXTRACTOR WITH BRIGHT DATA PROXY
=============================================================================

Pipeline de extração de áudio otimizado com proxy residencial Bright Data.

Fluxo:
1. Recebe URL YouTube + cookies + proxy config
2. Salva cookies em arquivo Netscape
3. Configura proxy residencial Bright Data
4. yt-dlp baixa áudio via proxy (contorna bot detection)
5. Transcreve com Whisper
6. Retorna JSON estruturado

Deploy:
  modal deploy scripts/modal_audio_extractor_with_bright_data.py

=============================================================================
"""

import os
import subprocess
import json
import tempfile
import modal
from datetime import datetime

# ============================================================================
# CONFIGURAÇÃO DO MODAL
# ============================================================================

image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg", "curl", "wget")
    .pip_install("yt-dlp", "openai-whisper", "requests", "fastapi")
)

app = modal.App("unoduno-audio-extractor-bright-data", image=image)

# Volume persistente para armazenar áudios temporariamente
volume = modal.Volume.from_name("unoduno-media-cache", create_if_missing=True)

# ============================================================================
# FUNÇÃO PRINCIPAL DE PROCESSAMENTO
# ============================================================================

@app.function(
    volumes={"/data": volume},
    timeout=600,
    cpu=2.0,  # Aumentado para melhor performance com proxy
    memory=2048,
    env={
        "BRIGHT_DATA_USERNAME": os.getenv("BRIGHT_DATA_USERNAME", ""),
        "BRIGHT_DATA_PASSWORD": os.getenv("BRIGHT_DATA_PASSWORD", ""),
        "BRIGHT_DATA_HOST": os.getenv("BRIGHT_DATA_HOST", "brd.superproxy.io"),
        "BRIGHT_DATA_PORT": os.getenv("BRIGHT_DATA_PORT", "33335"),
    }
)
def extract_and_transcribe_with_proxy(payload: dict) -> dict:
    """
    Processa YouTube video: download via BRIGHT DATA PROXY APENAS + transcrição Whisper.
    
    Args:
        payload: {
            "video_url": str,
            "user_headers": dict (opcional)
        }
    
    Returns:
        {
            "success": bool,
            "videoId": str,
            "transcript": str,
            "segments": list,
            "metadata": dict,
            "stats": dict,
            "error": str (se falhar)
        }
    
    Nota: Usa APENAS Bright Data proxy residencial para contornar bot detection.
    IP residencial do proxy é suficiente - não precisa de cookies que expiram.
    """
    import whisper
    
    video_url = payload.get("video_url")
    
    if not video_url:
        return {
            "success": False,
            "error": "Parâmetro video_url é obrigatório"
        }
    
    # Extrair video ID
    video_id = video_url.split('=')[-1].split('&')[0] if '=' in video_url else 'unknown'
    audio_path = f"/data/audio_{video_id}.mp3"
    start_time = datetime.now()
    
    try:
        print(f"\n[Extractor] ===== PROCESSAMENTO: {video_id} =====")
        print(f"[Extractor] URL: {video_url}")
        print(f"[Extractor] Modo: BRIGHT DATA PROXY APENAS (sem cookies)")
        
        # ====================================================================
        # CONFIGURAR BRIGHT DATA PROXY RESIDENCIAL
        # ====================================================================
        
        bright_data_username = os.getenv("BRIGHT_DATA_USERNAME")
        bright_data_password = os.getenv("BRIGHT_DATA_PASSWORD")
        bright_data_host = os.getenv("BRIGHT_DATA_HOST", "brd.superproxy.io")
        bright_data_port = os.getenv("BRIGHT_DATA_PORT", "33335")
        
        if not (bright_data_username and bright_data_password):
            return {
                "success": False,
                "error": "Bright Data não configurado (BRIGHT_DATA_USERNAME e PASSWORD obrigatórios)",
                "videoId": video_id,
            }
        
        proxy_url = f"http://{bright_data_username}:{bright_data_password}@{bright_data_host}:{bright_data_port}"
        print(f"[Extractor] ✅ Proxy: {bright_data_host}:{bright_data_port} (IP residencial)")
        
        # ====================================================================
        # EXECUTAR yt-dlp COM BRIGHT DATA PROXY (SEM COOKIES)
        # ====================================================================
        
        cmd = [
            "yt-dlp",
            "-x",  # Extrair apenas áudio
            "--audio-format", "mp3",
            "--audio-quality", "48",  # 48kbps para arquivo pequeno
            "--proxy", proxy_url,  # BRIGHT DATA PROXY RESIDENCIAL
            "--socket-timeout", "30",
            "--retries", "3",
            "--fragment-retries", "3",
            "-o", audio_path,
            video_url
        ]
        
        print(f"[Extractor] Iniciando download com yt-dlp + Bright Data proxy...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            error_msg = result.stderr or "Erro desconhecido"
            print(f"[Extractor] ❌ Download falhou: {error_msg[:300]}")
            return {
                "success": False,
                "error": f"yt-dlp error: {error_msg}",
                "videoId": video_id,
            }
        
        # Validar que arquivo foi criado
        if not os.path.exists(audio_path):
            return {
                "success": False,
                "error": "Arquivo de áudio não foi criado",
                "videoId": video_id,
            }
        
        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"[Extractor] ✅ Download OK: {file_size_mb:.2f}MB @ 48kbps")
        
        # ====================================================================
        # TRANSCREVER COM WHISPER
        # ====================================================================
        
        print(f"[Extractor] Carregando Whisper modelo...")
        model = whisper.load_model("base", device="cpu")
        
        print(f"[Extractor] Transcrevendo...")
        result = model.transcribe(audio_path, language="pt", verbose=False)
        
        transcript = result.get("text", "")
        segments = result.get("segments", [])
        
        if not transcript:
            return {
                "success": False,
                "error": "Whisper não conseguiu transcrever",
                "videoId": video_id,
            }
        
        print(f"[Extractor] ✅ Transcrição OK: {len(transcript)} caracteres")
        
        # ====================================================================
        # CONSTRUIR RESPOSTA
        # ====================================================================
        
        elapsed_seconds = (datetime.now() - start_time).total_seconds()
        
        response = {
            "success": True,
            "videoId": video_id,
            "transcript": transcript,
            "segments": [
                {
                    "start": seg.get("start", 0),
                    "end": seg.get("end", 0),
                    "text": seg.get("text", ""),
                }
                for seg in segments
            ],
            "metadata": {
                "title": "YouTube Video",
                "language": "pt",
                "processedAt": datetime.now().isoformat(),
            },
            "stats": {
                "wordCount": len(transcript.split()),
                "segmentCount": len(segments),
                "processingTimeSeconds": round(elapsed_seconds, 2),
                "audioFileSizeMB": round(file_size_mb, 2),
                "processor": "whisper",
                "proxy": "bright_data_residential",
            },
        }
        
        print(f"[Extractor] ===== SUCESSO ✅ =====")
        print(f"[Extractor] Tempo: {elapsed_seconds:.1f}s | Palavras: {len(transcript.split())}")
        
        return response
    
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Timeout: download excedeu 300 segundos",
            "videoId": video_id,
        }
    except Exception as e:
        print(f"[Extractor] ❌ ERRO: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "videoId": video_id,
        }

# ============================================================================
# WEB ENDPOINT
# ============================================================================

@app.cls()
class AudioExtractor:
    @modal.fastapi_endpoint(method="POST")
    def process(self, request_json: dict) -> dict:
        """
        Web endpoint POST para processar YouTube videos.
        
        Payload esperado:
        {
            "video_url": "https://www.youtube.com/watch?v=...",
            "cookies_netscape": "# Netscape format...",
            "use_bright_data": true,
            "user_headers": {"user-agent": "...", "accept-language": "..."}
        }
        """
        video_url = request_json.get("video_url")
        
        if not video_url:
            return {
                "success": False,
                "error": "Parâmetro video_url é obrigatório"
            }
        
        # Validar URL
        if not any(domain in video_url for domain in ["youtube.com", "youtu.be"]):
            return {
                "success": False,
                "error": "URL não é um link válido do YouTube"
            }
        
        print(f"[Endpoint] Nova requisição: {video_url}")
        
        # Chamar função de processamento
        result = extract_and_transcribe_with_proxy.remote(request_json)
        
        return result
