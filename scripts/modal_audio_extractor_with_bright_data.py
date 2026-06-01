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
    Processa YouTube video: download via proxy + transcrição Whisper.
    
    Args:
        payload: {
            "video_url": str,
            "cookies_netscape": str (opcional),
            "use_bright_data": bool (padrão: True),
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
    """
    import whisper
    
    video_url = payload.get("video_url")
    cookies_netscape = payload.get("cookies_netscape")
    use_bright_data = payload.get("use_bright_data", True)
    user_headers = payload.get("user_headers", {})
    
    if not video_url:
        return {
            "success": False,
            "error": "Parâmetro video_url é obrigatório"
        }
    
    # Extrair video ID
    video_id = video_url.split('=')[-1].split('&')[0] if '=' in video_url else 'unknown'
    audio_path = f"/data/audio_{video_id}.mp3"
    cookies_file = None
    start_time = datetime.now()
    
    try:
        print(f"\n[Extractor] ===== INICIANDO PROCESSAMENTO =====")
        print(f"[Extractor] Video ID: {video_id}")
        print(f"[Extractor] URL: {video_url}")
        print(f"[Extractor] Bright Data: {'ATIVADO' if use_bright_data else 'DESABILITADO'}")
        
        # ====================================================================
        # 1. SALVAR COOKIES EM ARQUIVO NETSCAPE
        # ====================================================================
        
        if cookies_netscape:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(cookies_netscape)
                cookies_file = f.name
            print(f"[Extractor] Cookies salvos: {cookies_file}")
        else:
            print(f"[Extractor] Nenhum cookie fornecido (tentará sem autenticação)")
        
        # ====================================================================
        # 2. CONFIGURAR PROXY BRIGHT DATA
        # ====================================================================
        
        bright_data_username = os.getenv("BRIGHT_DATA_USERNAME")
        bright_data_password = os.getenv("BRIGHT_DATA_PASSWORD")
        bright_data_host = os.getenv("BRIGHT_DATA_HOST", "brd.superproxy.io")
        bright_data_port = os.getenv("BRIGHT_DATA_PORT", "33335")
        
        proxy_url = None
        if bright_data_username and bright_data_password:
            # Formato: http://username:password@host:port
            proxy_url = f"http://{bright_data_username}:{bright_data_password}@{bright_data_host}:{bright_data_port}"
            print(f"[Extractor] Proxy Bright Data configurado (residencial)")
            print(f"[Extractor] Proxy: {bright_data_host}:{bright_data_port}")
        else:
            print(f"[Extractor] Bright Data não configurado - usando conexão direta")
        
        # ====================================================================
        # 3. CONSTRUIR COMANDO yt-dlp
        # ====================================================================
        
        cmd = [
            "yt-dlp",
            "-x",  # Extrair apenas áudio
            "--audio-format", "mp3",
            "--audio-quality", "48",  # 48kbps
            "-o", audio_path,
        ]
        
        # Adicionar proxy se configurado
        if proxy_url:
            cmd.extend(["--proxy", proxy_url])
            print(f"[Extractor] Usando proxy residencial para bypass de bot detection")
        
        # Adicionar cookies se fornecidos
        if cookies_file:
            cmd.extend(["--cookies", cookies_file])
            print(f"[Extractor] Usando cookies para autenticação YouTube")
        
        # Adicionar headers do usuário se fornecidos
        if user_headers:
            for key, value in user_headers.items():
                if value:
                    cmd.extend(["--add-header", f"{key}:{value}"])
        
        # Adicionar opções para evitar rate limiting
        cmd.extend([
            "--socket-timeout", "30",
            "--retries", "3",
            "--fragment-retries", "3",
        ])
        
        # URL deve ser o último argumento
        cmd.append(video_url)
        
        print(f"[Extractor] Comando yt-dlp: {' '.join(cmd[:8])}... (com proxy/cookies/headers)")
        
        # ====================================================================
        # 4. EXECUTAR yt-dlp COM PROXY
        # ====================================================================
        
        print(f"[Extractor] Iniciando download via yt-dlp + Bright Data proxy...")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or "Erro desconhecido"
            
            # Verificar se é erro de bot detection mesmo com proxy
            if "Sign in to confirm" in error_msg or "not a bot" in error_msg:
                print(f"[Extractor] ⚠️ Bot detection mesmo com proxy - tentando sem proxy")
                # Retry sem proxy como fallback
                cmd_no_proxy = [c for c in cmd if c not in ["--proxy", proxy_url]]
                result = subprocess.run(
                    cmd_no_proxy,
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                
                if result.returncode != 0:
                    raise Exception(f"Falha mesmo sem proxy: {result.stderr[:200]}")
            else:
                raise Exception(f"yt-dlp error: {error_msg[:200]}")
        
        # Validar que arquivo foi criado
        if not os.path.exists(audio_path):
            raise Exception("Arquivo de áudio não foi criado")
        
        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"[Extractor] ✅ Download completo: {file_size_mb:.2f}MB @ 48kbps")
        
        # ====================================================================
        # 5. TRANSCREVER COM WHISPER
        # ====================================================================
        
        print(f"[Extractor] Carregando modelo Whisper...")
        model = whisper.load_model("base", device="cpu")  # Use GPU se disponível
        
        print(f"[Extractor] Transcrevendo áudio...")
        result = model.transcribe(audio_path, language="pt", verbose=False)
        
        transcript = result.get("text", "")
        segments = result.get("segments", [])
        
        if not transcript:
            raise Exception("Nenhuma transcrição foi gerada")
        
        print(f"[Extractor] ✅ Transcrição completa: {len(transcript)} caracteres, {len(segments)} segmentos")
        
        # ====================================================================
        # 6. CONSTRUIR RESPOSTA ESTRUTURADA
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
                "duration": None,
                "language": "pt",
                "processedAt": datetime.now().isoformat(),
            },
            "stats": {
                "wordCount": len(transcript.split()),
                "totalSegments": len(segments),
                "processingTimeSeconds": elapsed_seconds,
                "audioFileSizeMB": file_size_mb,
                "backend": "whisper",
                "proxy": "bright_data" if proxy_url else "none",
            },
        }
        
        print(f"[Extractor] ===== PROCESSAMENTO COMPLETO =====")
        print(f"[Extractor] Tempo total: {elapsed_seconds:.2f}s")
        print(f"[Extractor] Status: SUCCESS ✅")
        
        return response
    
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Timeout: processamento excedeu 300 segundos",
            "videoId": video_id,
        }
    except Exception as e:
        error_msg = str(e)
        print(f"[Extractor] ❌ ERRO: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "videoId": video_id,
        }
    finally:
        # Limpeza
        if cookies_file and os.path.exists(cookies_file):
            try:
                os.remove(cookies_file)
                print(f"[Extractor] Arquivo de cookies deletado")
            except Exception as e:
                print(f"[Extractor] Aviso: Não consegui deletar cookies file: {e}")

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
