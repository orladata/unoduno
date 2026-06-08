FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# Evita interações indesejadas no prompt durante a instalação do apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Atualizar repositórios e instalar o ffmpeg (necessário para extração de áudio)
RUN apt-get update && \
    apt-get install -y ffmpeg curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instalar dependências da nossa aplicação
RUN pip install --no-cache-dir \
    runpod \
    yt-dlp \
    faster-whisper \
    curl_cffi

# Definir o diretório de trabalho padrão do contêiner
WORKDIR /app

# Baixa o modelo do Faster Whisper globalmente (small model) para fazer "bake in" na imagem.
# Isso reduz brutalmente o tempo de Cold Start do RunPod, pois ele não precisará baixar da internet na hora de rodar!
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cuda', compute_type='float16')" || true

# Copia o código da aplicação
COPY runpod_handler.py /app/runpod_handler.py

# Comando de inicialização exigido pelo RunPod (o worker fica ativo aguardando chamadas)
CMD ["python", "-u", "/app/runpod_handler.py"]
