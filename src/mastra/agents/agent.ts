import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const defaultAgent = new Agent({
  id: 'default-agent',
  name: 'Default Agent',
  instructions: `${SYSTEM_PROMPTS.researchOrchestrator}

Você é um assistente AI multifuncional integrado ao Chimedeck. Sua responsabilidade principal é:
1. Entender as necessidades do usuário
2. Coordenar múltiplos agentes especializados quando necessário
3. Fornecer respostas estruturadas e fundamentadas
4. Comunicar incertezas e limitações claramente

Use autonomia inteligente para executar tarefas sem intervenção desnecessária.`,
  model: 'google/gemini-2.5-pro',
});
