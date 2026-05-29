import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Ferramenta para Download de Áudio do YouTube
 * Suporta múltiplas estratégias para máxima confiabilidade
 */
export const downloadYouTubeAudioTool = createTool({
  id: 'download-youtube-audio',
  description: 'Faz download de áudio em MP3 ou M4A do YouTube usando APIs públicas. Retorna URL pública do arquivo de áudio processado.',
  inputSchema: z.object({
    videoUrl: z.string().url().describe('URL completa do vídeo do YouTube (ex: https://youtube.com/watch?v=dQw4w9WgXcQ)'),
    format: z.enum(['mp3', 'm4a']).optional().default('mp3').describe('Formato do áudio desejado'),
    quality: z.enum(['low', 'medium', 'high']).optional().default('high').describe('Qualidade do áudio (bitrate)'),
  }),
  execute: async ({ videoUrl, format, quality }) => {
    try {
      console.log(`[DownloadYouTubeAudio] Iniciando download de: ${videoUrl} em ${format} (${quality})`);

      // Step 1: Validar URL do YouTube
      const youtubeRegex = /^(https:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
      if (!youtubeRegex.test(videoUrl)) {
        throw new Error('URL não é um link válido do YouTube');
      }

      // Step 2: Extrair video ID
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('youtube.com')) {
        videoId = new URL(videoUrl).searchParams.get('v') || '';
      }

      if (!videoId) {
        throw new Error('Não foi possível extrair o ID do vídeo');
      }

      console.log(`[DownloadYouTubeAudio] Video ID extraído: ${videoId}`);

      // Step 3: Usar Cobalt API (estratégia principal)
      console.log('[DownloadYouTubeAudio] Conectando à API Cobalt...');
      const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl,
          isAudioOnly: true,
          aFormat: format,
          aQuality: quality === 'high' ? '320' : quality === 'medium' ? '192' : '128',
          vCodec: 'h264', // Ignorado pois isAudioOnly=true
          vQuality: 'max',
          filenameStyle: 'basic',
          disableMetadata: false,
        })
      });

      if (!cobaltResponse.ok) {
        console.warn(`[DownloadYouTubeAudio] Cobalt API retornou status ${cobaltResponse.status}`);
        // Fallback strategy: retornar erro mas com instruções
        throw new Error(`Cobalt API error: ${cobaltResponse.status}`);
      }

      const cobaltData = await cobaltResponse.json();
      console.log(`[DownloadYouTubeAudio] Resposta Cobalt:`, cobaltData);

      if (cobaltData.status === 'error') {
        throw new Error(`Cobalt error: ${cobaltData.text || 'Unknown error'}`);
      }

      if (!cobaltData.url) {
        throw new Error('Cobalt não retornou uma URL de áudio válida');
      }

      console.log('[DownloadYouTubeAudio] Link de áudio obtido com sucesso!');

      // Step 4: Retornar informações do áudio
      return {
        success: true,
        videoId: videoId,
        audioUrl: cobaltData.url,
        format: format,
        quality: quality,
        filesize: cobaltData.filesize || null,
        duration: cobaltData.duration || null,
        filename: cobaltData.filename || `${videoId}.${format}`,
        source: 'cobalt-api',
        timestamp: new Date().toISOString(),
      };

    } catch (error: any) {
      console.error('[DownloadYouTubeAudio] Erro:', error.message);

      // Strategy 2: Se Cobalt falhar, usar yt-dlp via Modal
      try {
        console.log('[DownloadYouTubeAudio] Tentando estratégia alternativa via Modal...');
        const customWhisperUrl = process.env.CUSTOM_WHISPER_URL;
        
        if (customWhisperUrl) {
          // Modal pode fazer download de áudio também
          const response = await fetch(`${customWhisperUrl}/download-audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              video_url: videoUrl,
              format: format,
              quality: quality,
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[DownloadYouTubeAudio] Sucesso com fallback Modal!');
            return {
              success: true,
              audioUrl: data.audio_url,
              format: format,
              source: 'modal-yt-dlp',
              ...data,
            };
          }
        }
      } catch (fallbackError) {
        console.error('[DownloadYouTubeAudio] Fallback também falhou:', fallbackError);
      }

      return {
        success: false,
        error: error.message,
        videoUrl: videoUrl,
        suggestion: 'Tente novamente em alguns segundos ou verifique se o link do YouTube é válido e público',
      };
    }
  }
});

/**
 * Ferramenta auxiliar para validar links do YouTube
 */
export const validateYouTubeUrlTool = createTool({
  id: 'validate-youtube-url',
  description: 'Valida se uma URL é um link válido do YouTube e extrai metadados básicos',
  inputSchema: z.object({
    url: z.string().describe('URL a validar'),
  }),
  execute: async ({ url }) => {
    try {
      const youtubeRegex = /^(https:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
      
      if (!youtubeRegex.test(url)) {
        return {
          valid: false,
          error: 'URL não é um link do YouTube válido',
        };
      }

      // Extrair video ID
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com')) {
        videoId = new URL(url).searchParams.get('v') || '';
      }

      if (!videoId || videoId.length !== 11) {
        return {
          valid: false,
          error: 'Não foi possível extrair um Video ID válido',
        };
      }

      // Tentar buscar metadados via oEmbed (não requer autenticação)
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oembedUrl);
        
        if (response.ok) {
          const metadata = await response.json();
          return {
            valid: true,
            videoId: videoId,
            title: metadata.title || null,
            author: metadata.author_name || null,
            thumbnail: metadata.thumbnail_url || null,
            url: url,
          };
        }
      } catch (metadataError) {
        console.warn('[ValidateYouTubeUrl] Não foi possível buscar metadados:', metadataError);
      }

      return {
        valid: true,
        videoId: videoId,
        url: url,
      };

    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
});
