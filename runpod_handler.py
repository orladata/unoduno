import os
import time
import runpod
import yt_dlp
from faster_whisper import WhisperModel
import io
import urllib.parse

# Variável de configuração do proxy da Bright Data
PROXY_URL = os.environ.get("RESIDENTIAL_PROXY", "http://brd-customer-hl_50cfa19c-zone-unodunoproxy:voo5cpt5qjsn@brd.superproxy.io:33335")

print("[IA] Inicializando ambiente Serverless...")
print("[IA] Carregando modelo Faster-Whisper na VRAM da GPU...")
# Carregamos o modelo globalmente para que ele permaneça na memória
# O RunPod mantém o Worker ativo para as próximas requests, garantindo extrema velocidade
model = WhisperModel("small", device="cuda", compute_type="float16")
print("[IA] Modelo carregado e pronto.")

def download_audio_com_proxy(video_url: str) -> bytes:
    output_template = "/tmp/%(id)s.%(ext)s"

    ydl_opts = {
        'format': 'bestaudio/best',
        'proxy': PROXY_URL,
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Sec-Fetch-Mode': 'navigate',
        },
        'outtmpl': output_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
            'preferredquality': '128',
        }],
    }

    print(f"[BOT] Iniciando download seguro via proxy de: {video_url}")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)
        filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + ".m4a"

        with open(filename, "rb") as f:
            audio_bytes = f.read()

        if os.path.exists(filename):
            os.remove(filename)

    print(f"[BOT] Download concluído. Tamanho: {len(audio_bytes) / (1024*1024):.2f} MB")
    return audio_bytes

def rodar_whisper(audio_bytes: bytes) -> dict:
    audio_file = io.BytesIO(audio_bytes)
    
    print("[IA] Iniciando transcrição do áudio...")
    segments, info = model.transcribe(audio_file, beam_size=5, language="pt")

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

def handler(event):
    """
    Ponto de entrada do RunPod Serverless.
    Recebe um JSON do tipo: {"input": {"video_url": "..."}}
    """
    job_input = event.get("input", {})
    video_url = job_input.get("audio_url") or job_input.get("video_url") or job_input.get("url")
    
    if not video_url:
        return {"success": False, "error": "A URL do vídeo é obrigatória no input."}
        
    start_time = time.time()

    try:
        # Resolve URLs proxy internas se for o caso
        if "api/audio-proxy?videoId=" in video_url:
            vid_id = video_url.split("videoId=")[1].split("&")[0]
            video_url = f"https://www.youtube.com/watch?v={vid_id}"

        # Etapa 1: Baixa o áudio com yt-dlp usando o proxy da Bright Data
        audio_data = download_audio_com_proxy(video_url)

        # Etapa 2: Passa os bytes salvos para a GPU transcrever
        resultado = rodar_whisper(audio_data)

        # Extrai ID do vídeo simples
        parsed = urllib.parse.urlparse(video_url)
        video_id = urllib.parse.parse_qs(parsed.query).get('v', [''])[0] or "unknown"

        # Retorna o resultado final (o RunPod encarrega-se de enviar isso como JSON)
        return {
            "success": True,
            "videoId": video_id,
            "audioUrl": video_url,
            "text": resultado["transcript"],
            "transcript": resultado["transcript"],
            "segments": resultado["segments"],
            "duration_seconds": 0,
            "metadata": {
                "title": "Extraído via Proxy (RunPod Serverless)",
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
                "backend": "runpod"
            }
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Inicia o serviço para aguardar jobs da API do RunPod
    runpod.serverless.start({"handler": handler})
