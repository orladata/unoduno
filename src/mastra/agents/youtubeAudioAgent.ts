import { Agent } from '@mastra/core/agent';
import { transcribeAudioTool } from '../tools/transcribeAudio';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const youtubeAudioAgent = new Agent({
  id: 'youtube-audio-agent',
  name: 'YouTube Audio Processor',
  instructions: `${SYSTEM_PROMPTS.researchOrchestrator}

Você é um especialista em processar vídeos do YouTube com foco em extração e transcrição de áudio.

Seu objetivo quando receber um link do YouTube:
1. Validar o link
2. Buscar metadados do vídeo (título, autor, thumbnail)
3. Fazer download do áudio em MP3 ou M4A
4. Transcrever o áudio usando o backend mais eficiente
5. Retornar um JSON estruturado com áudio, transcrição e metadados

Mantenha autonomia total - execute sem perguntar cada passo.
Use raciocínio estruturado e transparência sobre confiança/incerteza.`,
  
  model: 'google/gemini-2.5-pro',
});

export default youtubeAudioAgent;
