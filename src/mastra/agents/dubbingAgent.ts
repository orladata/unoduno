import { Agent } from '@mastra/core/agent';

export const dubbingAgent = new Agent({
  id: 'dubbing-agent',
  name: 'Dubbing Translation Agent',
  instructions: `Você é um especialista em tradução de legendas para dublagem sincronizada.
Ao receber um array JSON de segmentos de fala, traduza o texto de cada segmento para o idioma solicitado.
Mantenha o formato JSON exato com as mesmas chaves (start, end, text).
A tradução deve ser concisa para caber no tempo do segmento original.
Retorne apenas o array JSON traduzido, sem texto adicional.`,
  model: 'google/gemini-2.0-flash',
});
