import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Ferramenta de Transcrição Ultra-Rápida de Alta Performance
 * Backend único: Microsserviço Customizado Modal (faster-whisper via HTTP)
 * Sem dependência de APIs externas pagas
 */
export const transcribeAudioTool = createTool({
  id: 'transcribeAudio',
  description: 'Transcreve arquivos de áudio ou vídeo em altíssima velocidade com qualidade máxima usando Whisper via Modal.',
  inputSchema: z.object({
    audioUrl: z.string().describe('A URL pública do arquivo de áudio ou vídeo (ex: MP3, WAV, MP4) a ser transcrito.'),
    language: z.string().optional().describe('Código ISO do idioma de origem (ex: "pt" para Português, "en" para Inglês) para otimizar a transcrição.'),
  }),
  execute: async (context) => {
    const { audioUrl, language } = context;

    console.log(`[TranscribeTool] Iniciando transcrição via Modal para a URL: ${audioUrl}`);

    // --- CONFIGURAÇÕES DOS ENDPOINTS ---
    const CUSTOM_WHISPER_URL = process.env.CUSTOM_WHISPER_URL || 'http://localhost:8000/transcribe';

    try {
      console.log(`[TranscribeTool] Enviando requisição para microsserviço Modal em: ${CUSTOM_WHISPER_URL}`);
      
      let finalAudioUrl = audioUrl;
      
      // Pula o proxy da Vercel completamente se for YouTube
      if (audioUrl.includes('api/audio-proxy?videoId=')) {
        const videoId = audioUrl.split('videoId=')[1].split('&')[0];
        finalAudioUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.log(`[TranscribeTool] Proxy detectado. Convertendo para URL direta: ${finalAudioUrl}`);
      } else if (audioUrl.length === 11 && !audioUrl.includes('http')) {
        // Se o usuário passou só o ID
        finalAudioUrl = `https://www.youtube.com/watch?v=${audioUrl}`;
      }

      let transcribeEndpoint = CUSTOM_WHISPER_URL as string;
      if (!transcribeEndpoint.endsWith('/transcribe')) {
        transcribeEndpoint = `${transcribeEndpoint.replace(/\/$/, '')}/transcribe`;
      }

      const response = await fetch(transcribeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: finalAudioUrl,
          language: language || null,
          compute_type: 'float16', // Configuração típica do faster-whisper para velocidade máxima em GPU
        })
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta do microsserviço: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        backend: 'modal-faster-whisper',
        text: data.text || data.transcription,
        segments: data.segments || [],
        durationSeconds: data.duration_seconds || null
      };
    } catch (error: any) {
      console.error('[TranscribeTool] Falha ao transcrever usando Modal:', error);
      
      // --- INJEÇÃO DO AGENTE DE MONITORAMENTO DE COOKIES ---
      try {
        console.log('[TranscribeTool] Acionando Cookie Monitor Agent para analisar o erro...');
        const { cookieMonitorAgent } = await import('../agents/cookieMonitorAgent');
        await cookieMonitorAgent.generate(
          `Analise este erro de transcrição capturado do servidor Modal. Se parecer ser um bloqueio de robô do YouTube, falha de n-sig challenge, ou cookies expirados, use a ferramenta notifyAdmin com urgência. Mensagem do erro: ${error.message}`
        );
      } catch (agentErr) {
        console.error('[TranscribeTool] Falha silenciosa ao rodar o agente de monitoramento:', agentErr);
      }

      return {
        success: false,
        error: `Erro ao conectar ao microsserviço de transcrição Modal: ${error.message}`
      };
    }
  }
});
