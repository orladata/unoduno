#!/usr/bin/env python3
"""
=============================================================================
MODAL TRANSCRIPTION WORKER (AUDIO ONLY)
=============================================================================

Pipeline de transcrição de áudio apenas.
O áudio já vem pronto do servidor Next.js (em base64).

Fluxo:
1. Recebe áudio em base64 + video_id
2. Decodifica base64 para arquivo MP3 temporário
3. Transcreve com Whisper
4. Retorna JSON estruturado

Deploy:
  modal deploy scripts/modal_transcription_worker.py

=============================================================================
"""

import os
import base64
import tempfile
import modal
from datetime import datetime
import json

# ============================================================================
# CONFIGURAÇÃO DO MODAL
# ============================================================================

image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("openai-whisper", "fastapi")
)

app = modal.App("unoduno-transcription-worker", image=image)

# ============================================================================
# FUNÇÃO DE TRANSCRIÇÃO
# ============================================================================

@app.function(
    timeout=600,  # 10 minutos
    cpu=2.0,
    memory=2048,
)
def transcribe_audio(payload: dict) -> dict:
    """
    Transcreve áudio recebido em base64.
    
    Args:
        payload: {
            "video_id": str,
            "audio_base64": str,
            "audio_format": str (ex: "audio/mpeg"),
            "audio_size_bytes": int
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
    
    video_id = payload.get("video_id")
    audio_base64 = payload.get("audio_base64")
    audio_format = payload.get("audio_format", "audio/mpeg")
    audio_size_bytes = payload.get("audio_size_bytes", 0)
    
    if not video_id or not audio_base64:
        return {
            "success": False,
            "error": "video_id e audio_base64 são obrigatórios",
            "videoId": video_id,
        }
    
    start_time = datetime.now()
    temp_audio_file = None
    
    try:
        print(f"\n[Transcription] ===== PROCESSAMENTO: {video_id} =====")
        print(f"[Transcription] Tamanho do áudio: {audio_size_bytes / (1024*1024):.2f}MB")
        print(f"[Transcription] Formato: {audio_format}")
        
        # ====================================================================
        # 1. DECODIFICAR BASE64 PARA ARQUIVO TEMPORÁRIO
        # ====================================================================
        
        print(f"[Transcription] Decodificando áudio de base64...")
        
        # Criar arquivo temporário
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            temp_audio_file = f.name
            
            # Decodificar base64 e escrever no arquivo
            audio_data = base64.b64decode(audio_base64)
            f.write(audio_data)
        
        print(f"[Transcription] ✅ Áudio decodificado: {temp_audio_file}")
        
        # ====================================================================
        # 2. CARREGAR MODELO WHISPER
        # ====================================================================
        
        print(f"[Transcription] Carregando modelo Whisper (base)...")
        model = whisper.load_model("base", device="cpu")
        print(f"[Transcription] ✅ Modelo carregado")
        
        # ====================================================================
        # 3. TRANSCREVER
        # ====================================================================
        
        print(f"[Transcription] Iniciando transcrição...")
        result = model.transcribe(
            temp_audio_file,
            language="pt",  # Português
            verbose=False,
            fp16=False,  # Usar float32 para CPU
        )
        
        transcript = result.get("text", "")
        segments = result.get("segments", [])
        
        if not transcript:
            return {
                "success": False,
                "error": "Whisper não conseguiu extrair transcrição",
                "videoId": video_id,
            }
        
        print(f"[Transcription] ✅ Transcrição concluída: {len(transcript)} caracteres")
        
        # ====================================================================
        # 4. ESTRUTURAR RESPOSTA
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
                "language": "pt",
                "processedAt": datetime.now().isoformat(),
            },
            "stats": {
                "wordCount": len(transcript.split()),
                "segmentCount": len(segments),
                "processingTimeSeconds": round(elapsed_seconds, 2),
                "audioFileSizeMB": round(audio_size_bytes / (1024*1024), 2),
                "processor": "whisper_base",
            },
        }
        
        print(f"[Transcription] ===== SUCESSO ✅ =====")
        print(f"[Transcription] Tempo: {elapsed_seconds:.1f}s | Palavras: {len(transcript.split())}")
        
        return response
    
    except Exception as e:
        print(f"[Transcription] ❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "error": str(e),
            "videoId": video_id,
        }
    
    finally:
        # Limpeza
        if temp_audio_file:
            try:
                import os as os_module
                if os_module.path.exists(temp_audio_file):
                    os_module.remove(temp_audio_file)
                    print(f"[Transcription] Arquivo temporário deletado")
            except Exception as e:
                print(f"[Transcription] Aviso: Não consegui deletar arquivo temporário: {e}")


# ============================================================================
# WEB ENDPOINT (FastAPI)
# ============================================================================

@app.cls()
class TranscriptionAPI:
    @modal.fastapi_endpoint(method="POST")
    def process(self, request_dict: dict) -> dict:
        """
        Web endpoint POST para transcrever áudio.
        
        Payload esperado:
        {
            "video_id": "string",
            "audio_base64": "string",
            "audio_format": "string (ex: audio/mpeg)",
            "audio_size_bytes": number
        }
        """
        
        if not request_dict:
            return {
                "success": False,
                "error": "Payload vazio"
            }
        
        video_id = request_dict.get("video_id")
        
        if not video_id:
            return {
                "success": False,
                "error": "Parâmetro video_id é obrigatório"
            }
        
        print(f"[Endpoint] Nova requisição para transcrição: {video_id}")
        
        # Chamar função de transcrição
        result = transcribe_audio.remote(request_dict)
        
        return result


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.function()
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app_fastapi = FastAPI()
    
    @app_fastapi.get("/health")
    def health():
        return JSONResponse({
            "status": "healthy",
            "service": "unoduno-transcription-worker",
            "mode": "audio_only",
        })
    
    @app_fastapi.post("/transcribe")
    def transcribe_endpoint(payload: dict):
        return transcribe_audio.remote(payload)
    
    return app_fastapi
