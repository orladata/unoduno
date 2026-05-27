import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Ferramenta de Transcrição Ultra-Rápida de Alta Performance
 * Suporta múltiplos backends de processamento para garantir flexibilidade total:
 * 1. Groq Whisper API (LPU - Velocidade sub-segundo absurda)
 * 2. Microsserviço Customizado (faster-whisper / insanely-fast-whisper via HTTP)
 */
export const transcribeAudioTool = createTool({
  id: 'transcribeAudio',
  description: 'Transcreve arquivos de áudio ou vídeo em altíssima velocidade com qualidade máxima usando Whisper.',
  inputSchema: z.object({
    audioUrl: z.string().describe('A URL pública do arquivo de áudio ou vídeo (ex: MP3, WAV, MP4) a ser transcrito.'),
    language: z.string().optional().describe('Código ISO do idioma de origem (ex: "pt" para Português, "en" para Inglês) para otimizar a transcrição.'),
    backend: z.enum(['groq', 'custom_whisper']).optional().default('groq').describe('O motor de transcrição a ser utilizado.'),
  }),
  execute: async (context) => {
    const { audioUrl, language, backend } = context;

    console.log(`[TranscribeTool] Iniciando transcrição com backend: ${backend} para a URL: ${audioUrl}`);

    // --- CONFIGURAÇÕES DOS ENDPOINTS ---
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const CUSTOM_WHISPER_URL = process.env.CUSTOM_WHISPER_URL || 'http://localhost:8000/transcribe';

    // ==========================================
    // BACKEND 1: GROQ WHISPER API (VELOCIDADE ABSURDA SUB-SEGUNDO)
    // ==========================================
    if (backend === 'groq' || !CUSTOM_WHISPER_URL) {
      if (!GROQ_API_KEY) {
        console.warn('[TranscribeTool] GROQ_API_KEY não encontrada no arquivo .env. Usando transcrição simulada de alta fidelidade.');
        
        // Simulação de resposta de altíssima qualidade para desenvolvimento ágil
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simula processamento ultra-rápido de 800ms
        return {
          success: true,
          backend: 'groq-mocked',
          text: 'Esta é uma transcrição simulada de altíssima qualidade do seu vídeo/áudio no Unoduno. Quando você adicionar a sua GROQ_API_KEY no arquivo .env, o áudio real desta URL será enviado para a infraestrutura LPU ultra-rápida da Groq e retornado em menos de 1 segundo.',
          language: language || 'pt',
          durationSeconds: 124.5,
          segments: [
            { start: 0.0, end: 4.2, text: 'Olá a todos e bem-vindos ao Unoduno!' },
            { start: 4.2, end: 8.5, text: 'Hoje vamos falar sobre como tornar suas transcrições absurdamente rápidas.' }
          ]
        };
      }

      try {
        // Para transcrever via URL na API da Groq, precisamos baixar o arquivo temporariamente ou enviar via FormData
        // O Groq espera receber um arquivo binário através do formulário multipart/form-data.
        console.log('[TranscribeTool] Baixando áudio temporário para envio à API do Groq...');
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Falha ao obter o arquivo de áudio da URL: ${audioResponse.statusText}`);
        }
        
        const audioBlob = await audioResponse.blob();
        const formData = new FormData();
        
        // Converte o blob em um arquivo simulado para envio do form
        const file = new File([audioBlob], 'audio.mp3', { type: audioBlob.type || 'audio/mp3' });
        formData.append('file', file);
        formData.append('model', 'whisper-large-v3');
        
        if (language) {
          formData.append('language', language);
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: formData
        });

        if (!groqResponse.ok) {
          const errText = await groqResponse.text();
          throw new Error(`Erro na API do Groq: ${errText}`);
        }

        const data = await groqResponse.json();
        return {
          success: true,
          backend: 'groq-whisper-large-v3',
          text: data.text,
          language: language || 'detectado',
          data: data
        };
      } catch (error: any) {
        console.error('[TranscribeTool] Falha ao transcrever usando o Groq:', error);
        return {
          success: false,
          error: error.message || 'Erro desconhecido na transcrição via Groq.'
        };
      }
    }

    // ==========================================
    // BACKEND 2: CUSTOM FASTER-WHISPER / INSANELY-FAST-WHISPER MICROSERVICE
    // ==========================================
    if (backend === 'custom_whisper') {
      try {
        console.log(`[TranscribeTool] Enviando requisição para microsserviço customizado em: ${CUSTOM_WHISPER_URL}`);
        
        let finalAudioUrl = audioUrl;
        let isYoutube = false;
        
        // Pula o proxy da Vercel completamente se for YouTube
        if (audioUrl.includes('api/audio-proxy?videoId=')) {
          const videoId = audioUrl.split('videoId=')[1].split('&')[0];
          finalAudioUrl = `https://www.youtube.com/watch?v=${videoId}`;
          isYoutube = true;
          console.log(`[TranscribeTool] Proxy detectado. Convertendo para URL direta: ${finalAudioUrl}`);
        } else if (audioUrl.length === 11 && !audioUrl.includes('http')) {
          // Se o usuário passou só o ID
          finalAudioUrl = `https://www.youtube.com/watch?v=${audioUrl}`;
          isYoutube = true;
        } else if (audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be')) {
          isYoutube = true;
        }

        // Se for YouTube, usamos o Mastra para extrair o MP3 remotamente via API Cobalt/RapidAPI
        // Assim, a Modal recebe um MP3 limpo e não é bloqueada pelo bot-check do YouTube.
        if (isYoutube) {
          console.log(`[TranscribeTool] URL do YouTube detectada. Extraindo link direto do MP3 via Cobalt API...`);
          try {
            const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                url: finalAudioUrl,
                isAudioOnly: true,
                aFormat: "mp3"
              })
            });
            
            if (cobaltRes.ok) {
              const cobaltData = await cobaltRes.json();
              if (cobaltData.url) {
                finalAudioUrl = cobaltData.url;
                console.log(`[TranscribeTool] MP3 extraído com sucesso! Link direto gerado.`);
              }
            } else {
              console.warn(`[TranscribeTool] Cobalt API falhou. A Modal tentará baixar usando yt-dlp nativo.`);
            }
          } catch (e) {
            console.warn(`[TranscribeTool] Falha ao contatar a API de extração:`, e);
          }
        }

        const response = await fetch(CUSTOM_WHISPER_URL, {
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
          backend: 'custom-faster-whisper',
          text: data.text || data.transcription,
          segments: data.segments || [],
          durationSeconds: data.duration_seconds || null
        };
      } catch (error: any) {
        console.error('[TranscribeTool] Falha ao transcrever usando microsserviço customizado:', error);
        
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
          error: `Erro ao conectar ao microsserviço de transcrição: ${error.message}`
        };
      }
    }

    return {
      success: false,
      error: 'Nenhum backend válido foi selecionado.'
    };
  }
});
