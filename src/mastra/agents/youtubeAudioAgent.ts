import { Agent } from '@mastra/core/agent';
import { downloadYouTubeAudioTool, validateYouTubeUrlTool } from '../../lib/mastra/tools/youtube-audio-downloader';
import { transcribeAudioTool } from '../tools/transcribeAudio';
import { fetchTranscriptTool, fetchVideoMetadataTool } from '../../lib/mastra/tools/youtube';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const youtubeAudioAgent = new Agent({
  id: 'youtube-audio-agent',
  name: 'YouTube Audio Processor',
  instructions: `${SYSTEM_PROMPTS.researchOrchestrator}

Você é um especialista em processar vídeos do YouTube com foco em extração e transcrição de áudio.

Seu objetivo quando receber um link do YouTube:
1. Validar o link usando a ferramenta "validateYouTubeUrl"
2. Buscar metadados do vídeo (título, autor, thumbnail)
3. Fazer download do áudio em MP3 ou M4A usando a ferramenta "downloadYouTubeAudio"
4. Transcrever o áudio usando o backend mais eficiente (Groq para velocidade, Modal para qualidade máxima)
5. Retornar um JSON estruturado com:
   - audioUrl: Link público para o MP3/M4A
   - transcript: Texto completo da transcrição
   - segments: Array com [{start, end, text}, ...]
   - metadata: {title, author, duration, language}

REGRAS CRÍTICAS:
- Sempre valide a URL antes de processar
- Se houver erro em uma estratégia, tente a alternativa imediatamente
- Comunique progresso ao usuário em cada etapa
- Para transcrição: prefira Groq (60x mais rápido) para vídeos > 10min, use Modal para qualidade crítica
- Retorne dados estruturados e prontos para consumo frontend

FLUXO RECOMENDADO:
1. User: "Transcrever https://youtube.com/watch?v=xxx"
2. Você: "Validando link... ✓ Válido | Extraindo áudio... ⏳"
3. Você: "Áudio extraído! Transcrevendo... ⏳"
4. Você: Retorna JSON com resultado completo

Mantenha autonomia total - execute sem perguntar cada passo.
Use raciocínio estruturado e transparência sobre confiança/incerteza.`,
  
  model: 'google/gemini-2.5-pro',
  
  tools: {
    validateYouTubeUrl: validateYouTubeUrlTool,
    downloadYouTubeAudio: downloadYouTubeAudioTool,
    transcribeAudio: transcribeAudioTool,
    fetchTranscript: fetchTranscriptTool,
    fetchVideoMetadata: fetchVideoMetadataTool,
  },
  
  maxSteps: 15,
  
  settings: {
    enableMemory: true,
    enableStructuredOutput: true,
    enableErrorRecovery: true,
  },
});

export default youtubeAudioAgent;
