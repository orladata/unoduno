import os
import modal

# 1. Definindo o App do Modal
app = modal.App("unoduno-transcriber")

# 2. Configurando o ambiente Docker de execução (Debian + ffmpeg + faster-whisper)
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg") # Instala o ffmpeg para conversão de áudio
    .pip_install(
        "faster-whisper==1.0.3",
        "pydantic==2.6.4",
        "fastapi==0.110.0",
        "yt-dlp", # Extrator de mídia do YouTube ultra-rápido
        "requests" # Biblioteca necessária interna do faster-whisper para baixar os modelos do Hugging Face
    )
)

# 3. Criando a função que aloca GPU T4 sob demanda
# O decorador @modal.fastapi_endpoint transforma esta função em uma API HTTP pública!
@app.function(
    image=image,
    gpu="T4",           # Usa a GPU NVIDIA T4 (custo-benefício absurdo)
    timeout=600,        # Limite máximo de 10 minutos por arquivo
    cpu=2,              # 2 CPUs virtuais para pré-processamento de áudio
    memory=2048,        # 2GB de RAM
)
@modal.fastapi_endpoint(method="POST", label="transcribe")
def transcribe(data: dict):
    """
    Endpoint HTTP que recebe a URL do áudio ou link do YouTube e realiza a transcrição rápida.
    Payload esperado:
    {
        "audio_url": "https://link-do-audio.mp3" ou "https://youtube.com/watch?v=...",
        "language": "pt" (opcional)
    }
    """
    import urllib.request
    from faster_whisper import WhisperModel

    audio_url = data.get("audio_url")
    language = data.get("language")

    if not audio_url:
        return {"success": False, "error": "A URL do áudio ('audio_url') é obrigatória."}

    temp_filename = "/tmp/audio_temp.mp3"
    
    try:
        # Se for um link do YouTube, extrai o áudio usando simulação de cliente Mobile do yt-dlp (Bypass definitivo de Bot)
        if "youtube.com" in audio_url or "youtu.be" in audio_url:
            print(f"[Modal] Detectado link do YouTube. Iniciando bypass via cliente Android/iOS: {audio_url}")
            import yt_dlp
            
            # Limpa e extrai a URL pura para evitar parâmetros extras de compartilhamento
            clean_url = audio_url
            if "youtu.be/" in audio_url:
                video_id = audio_url.split("youtu.be/")[1].split("?")[0]
                clean_url = f"https://www.youtube.com/watch?v={video_id}"
            elif "v=" in audio_url:
                video_id = audio_url.split("v=")[1].split("&")[0]
                clean_url = f"https://www.youtube.com/watch?v={video_id}"

            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': '/tmp/audio_temp',
                # ESTA É A MÁGICA: Força o yt-dlp a simular o app de Android/iOS oficial
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'ios'],
                    }
                },
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '128',
                }],
                'quiet': True,
                'no_warnings': True,
            }
            
            print(f"[Modal] Fazendo download simulado via app mobile para URL: {clean_url}...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([clean_url])
        else:
            # Download direto e seguro de arquivos de áudio padrão (MP3/WAV) ou streams do proxy
            print(f"[Modal] Baixando áudio do proxy seguro: {audio_url}")
            import requests
            
            response = requests.get(audio_url, stream=True, timeout=45)
            if response.ok:
                with open(temp_filename, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=16384): # Blocos de 16KB para máxima velocidade
                        if chunk:
                            f.write(chunk)
                print("[Modal] Download do áudio concluído!")
            else:
                raise Exception(f"Falha ao baixar áudio do proxy: Status {response.status_code}")

        # Carrega o modelo Whisper Large-v3 na GPU usando precisão float16
        print("[Modal] Carregando modelo Whisper Large-v3 na GPU...")
        model = WhisperModel("large-v3", device="cuda", compute_type="float16")

        # Transcreve usando Vad Filter para eliminar silêncios e acelerar ainda mais
        print("[Modal] Transcrevendo áudio...")
        segments, info = model.transcribe(
            temp_filename,
            language=language,
            beam_size=5,
            vad_filter=True
        )

        # Junta os segmentos de texto
        text_segments = []
        full_text = []
        for segment in segments:
            full_text.append(segment.text)
            text_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })

        print("[Modal] Transcrição concluída com sucesso!")
        return {
            "success": True,
            "language": info.language,
            "language_probability": round(info.language_probability, 2),
            "duration_seconds": round(info.duration, 2),
            "text": " ".join(full_text).strip(),
            "segments": text_segments
        }

    except Exception as e:
        print(f"[Modal] Erro durante processamento: {str(e)}")
        return {"success": False, "error": f"Erro interno: {str(e)}"}
        
    finally:
        # Garante a limpeza do arquivo temporário
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
