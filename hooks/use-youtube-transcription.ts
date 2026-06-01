import { useState, useCallback } from 'react';

interface TranscriptionResult {
  success: boolean;
  videoId: string;
  transcript: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  metadata: {
    language: string;
    processedAt: string;
  };
  stats: {
    wordCount: number;
    segmentCount: number;
    processingTimeSeconds: number;
    audioFileSizeMB: number;
    processor: string;
  };
  processingTimeSeconds: number;
  processedVia: string;
  error?: string;
}

interface UseYoutubeTranscriptionOptions {
  onProgress?: (step: string, progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: TranscriptionResult) => void;
}

/**
 * Hook para transcrição de vídeos YouTube
 * 
 * Fluxo:
 * 1. Download: Site faz download com proxy (48kbps MP3)
 * 2. Transcrição: Modal Worker recebe apenas áudio
 * 
 * Isso evita timeouts e simplifica o Modal Worker
 */
export function useYoutubeTranscription(options: UseYoutubeTranscriptionOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const transcribe = useCallback(
    async (videoUrl: string): Promise<TranscriptionResult | null> => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        // Extrair video ID
        const videoIdMatch = videoUrl.match(/v=([a-zA-Z0-9_-]{11})/);
        if (!videoIdMatch) {
          throw new Error('URL do YouTube inválida');
        }
        const videoId = videoIdMatch[1];

        // ====================================================================
        // ETAPA 1: Download (Site com Bright Data Proxy)
        // ====================================================================

        console.log('[Transcription] ETAPA 1: Fazendo download...');
        options.onProgress?.('download', 10);
        setProgress(10);

        const downloadResponse = await fetch('/api/youtube/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl }),
        });

        if (!downloadResponse.ok) {
          const errorData = await downloadResponse.json();
          throw new Error(
            errorData.details || `Download falhou: ${downloadResponse.status}`
          );
        }

        console.log('[Transcription] ✅ Download concluído');
        options.onProgress?.('download', 50);
        setProgress(50);

        // Converter response para Blob
        const audioBlob = await downloadResponse.blob();
        console.log(`[Transcription] Tamanho do arquivo: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB`);

        // ====================================================================
        // ETAPA 2: Transcrição (Modal Worker recebe apenas áudio)
        // ====================================================================

        console.log('[Transcription] ETAPA 2: Enviando para transcrição...');
        options.onProgress?.('transcription', 60);
        setProgress(60);

        // Criar FormData
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.mp3');
        formData.append('videoId', videoId);

        const transcribeResponse = await fetch('/api/youtube/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transcribeResponse.ok) {
          const errorData = await transcribeResponse.json();
          throw new Error(
            errorData.details || `Transcrição falhou: ${transcribeResponse.status}`
          );
        }

        const result: TranscriptionResult = await transcribeResponse.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido na transcrição');
        }

        console.log('[Transcription] ✅ Transcrição concluída');
        options.onProgress?.('transcription', 100);
        setProgress(100);

        options.onSuccess?.(result);
        return result;

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('[Transcription] Erro:', errorMessage);

        setError(errorMessage);
        options.onError?.(errorMessage);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    transcribe,
    loading,
    error,
    progress,
  };
}
