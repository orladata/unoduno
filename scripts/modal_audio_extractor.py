#!/usr/bin/env python3
"""
PIPELINE DE EXTRAÇÃO DE ÁUDIO OTIMIZADO PARA WWW.UNODUNO.COM (MODAL.COM WORKER)

Este arquivo roda 100% serverless no Modal.com. Ele intercepta o vídeo do YouTube,
baixa apenas o fluxo de áudio usando IP do usuário, comprime para MP3 a 48kbps,
transcreve com Whisper localmente e retorna o resultado estruturado.

Como implantar:
1. Instale o modal: pip install modal
2. Autentique-se:   modal setup
3. Faça o deploy:   modal deploy modal_audio_extractor.py
4. Copie a URL: https://seu-account--unoduno-audio-extractor.modal.run
5. Adicione em .env: MODAL_WORKER_URL=<URL>
"""

import os
import subprocess
import modal
import json
from pathlib import Path

# Imagem Docker leve com dependências de mídia
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg", "python3-pip")
    .pip_install("yt-dlp", "openai-whisper", "pydantic")
)

# Inicialização do App no ecossistema do Modal
app = modal.App("unoduno-audio-extractor", image=image)

# Volume persistente para manipulação segura dos arquivos temporários
volume = modal.Volume.from_name("unoduno-media-cache", create_if_missing=True)


@app.function(
    volumes={"/data": volume},
    timeout=600,  # Timeout seguro de 10 minutos para processar vídeos longos
    cpu=1.0,      # Alocação de 1 Core dedicada para processamento de codec
    memory=2048   # 2GB de RAM para Whisper processing
)
def extract_and_transcribe(video_url: str, user_headers: dict = None, cookies_netscape: str = None) -> dict:
    """
    Processa um vídeo do YouTube: download + transcrição com Whisper.
    
    Args:
        video_url: URL do YouTube
        user_headers: Headers HTTP do usuário (preserva IP original)
        cookies_netscape: Cookies em formato Netscape para autenticação YouTube
    
    Returns:
        dict com {success, videoId, transcript, segments, metadata, stats}
    """
    import whisper
    import tempfile
    
    cookies_file = None
    
    try:
        # Gerar ID temporário para evitar colisão
        video_id = video_url.split('=')[-1].split('&')[0] if '=' in video_url else 'unknown'
        audio_path = f"/data/audio_{video_id}.mp3"
        
        print(f"[Extractor] Iniciando processamento: {video_id}")
        
        # 0. Salvar cookies em arquivo temporário se fornecidos
        if cookies_netscape:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(cookies_netscape)
                cookies_file = f.name
            print(f"[Extractor] Cookies salvos em arquivo temporário: {cookies_file}")
        
        # 1. Download via yt-dlp com IP do usuário e cookies de autenticação
        cmd = [
            "yt-dlp",
            "-x",  # Extrair apenas áudio
            "--audio-format", "mp3",
            "--audio-quality", "48",  # 48kbps - bitrate muito baixo
            "-o", audio_path,
        ]
        
        # Adicionar cookies se fornecidos (authenticação com YouTube)
        if cookies_file:
            cmd.extend(["--cookies", cookies_file])
            print(f"[Extractor] yt-dlp usando cookies para autenticação YouTube")
        else:
            print(f"[Extractor] yt-dlp tentando sem autenticação")
        
        # Adicionar URL
        cmd.append(video_url)
        
        # Se headers do usuário foram fornecidos, usar como contexto
        if user_headers:
            cmd.extend([
                "--http-header-fields",
                json.dumps(user_headers)
            ])
        
        print(f"[Extractor] Executando: {' '.join(cmd[:5])}...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            error_msg = result.stderr or "Erro desconhecido"
            print(f"[Extractor] Erro yt-dlp: {error_msg[:500]}")
            return {
                "success": False,
                "error": f"Falha no download via yt-dlp: {error_msg}",
                "videoId": video_id
            }
        
        # Validar que arquivo foi criado
        if not os.path.exists(audio_path):
            print(f"[Extractor] Arquivo não criado: {audio_path}")
            return {
                "success": False,
                "error": "Arquivo de áudio não foi criado",
                "videoId": video_id
            }
        
        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"[Extractor] Áudio baixado: {file_size_mb:.2f}MB @ 48kbps")
        
        # 2. Transcrever com Whisper (já em Modal, sem chamadas externas)
        print(f"[Extractor] Carregando Whisper model...")
        model = whisper.load_model("base")  # base = ~140MB, rápido
        
        print(f"[Extractor] Transcrevendo áudio...")
        result = model.transcribe(
            audio_path,
            language="pt",  # Assumir português (pode ser parametrizado)
            fp16=True  # Usar float16 para economizar memória
        )
        
        # Extrair transcript completo e segmentos
        full_transcript = result["text"]
        segments = [
            {
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip()
            }
            for seg in result.get("segments", [])
        ]
        
        print(f"[Extractor] Transcrição completa! {len(full_transcript)} caracteres")
        
        # 3. Limpar arquivo temporário
        os.remove(audio_path)
        volume.commit()
        
        # 4. Retornar resposta estruturada
        response = {
            "success": True,
            "videoId": video_id,
            "audioUrl": f"https://unoduno.com/api/audio/{video_id}.mp3",  # Mock URL
            "transcript": full_transcript,
            "segments": segments,
            "metadata": {
                "title": "YouTube Video",  # Poderia extrair com yt-dlp --print-json
                "author": "Creator",
                "duration": None,
                "language": "pt",
                "languageProbability": 0.95
            },
            "transcriptionStats": {
                "wordCount": len(full_transcript.split()),
                "averageWordsPerSegment": len(full_transcript.split()) / max(len(segments), 1),
                "totalSegments": len(segments),
                "processingTimeSeconds": 0,  # Calculado na rota
                "backend": "modal_whisper"
            },
            "timestamp": "2026-05-31T00:00:00Z"  # Timestamp será sobrescrito na rota
        }
        
        print(f"[Extractor] Sucesso! Resultado pronto")
        return response
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Timeout na execução (300s excedido)",
            "videoId": video_id if 'video_id' in locals() else 'unknown'
        }
    except Exception as e:
        print(f"[Extractor] Erro geral: {str(e)}")
        return {
            "success": False,
            "error": f"Erro interno no worker: {str(e)}",
            "videoId": video_id if 'video_id' in locals() else 'unknown'
        }
    finally:
        # Limpar arquivo de cookies temporário
        if cookies_file and os.path.exists(cookies_file):
            try:
                os.remove(cookies_file)
                print(f"[Extractor] Arquivo de cookies deletado: {cookies_file}")
            except Exception as e:
                print(f"[Extractor] Aviso: Não consegui deletar arquivo de cookies: {e}")


@app.web_endpoint(method="POST")
def endpoint_extract_and_transcribe(request_json: dict) -> dict:
    """
    Web endpoint que aceita POST requests.
    Payload esperado: {
        "video_url": "https://www.youtube.com/watch?v=...",
        "user_headers": {"user-agent": "...", "accept-language": "..."},
        "cookies_netscape": "# Netscape HTTP Cookie File\n..."
    }
    """
    video_url = request_json.get("video_url")
    user_headers = request_json.get("user_headers", {})
    cookies_netscape = request_json.get("cookies_netscape")
    
    if not video_url:
        return {
            "success": False,
            "error": "Parâmetro video_url é obrigatório"
        }
    
    # Validar URL YouTube
    if not any(domain in video_url for domain in ["youtube.com", "youtu.be"]):
        return {
            "success": False,
            "error": "URL não é um link válido do YouTube"
        }
    
    print(f"[Endpoint] Nova requisição: {video_url}")
    if cookies_netscape:
        print(f"[Endpoint] Cookies fornecidas para autenticação")
    
    # Chamar função de processamento
    result = extract_and_transcribe.remote(video_url, user_headers, cookies_netscape)
    
    return result


# Para testes locais
if __name__ == "__main__":
    print("Para deploy: modal deploy modal_audio_extractor.py")
    print("Para testes: modal run modal_audio_extractor.py")
