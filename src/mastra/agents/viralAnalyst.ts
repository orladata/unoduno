/**
 * Viral Analyst Agent - Especialista em padrões de viralidade
 * Analisa estrutura de conteúdo para prever e otimizar desempenho
 */

import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const viralAnalystAgent = new Agent({
  id: 'viral-analyst',
  name: 'Viral Analyst',
  instructions: SYSTEM_PROMPTS.viralAnalyst,
  model: 'google/gemini-2.5-pro',
});

export default viralAnalystAgent;
