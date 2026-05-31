/**
 * Content Strategist Agent - Especialista em análise de conteúdo e estratégia
 * Usa system prompt avançado baseado em best practices de AI tools líderes
 */

import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const contentStrategistAgent = new Agent({
  id: 'content-strategist',
  name: 'Content Strategist',
  instructions: SYSTEM_PROMPTS.contentStrategist,
  model: 'google/gemini-2.5-pro',
});

export default contentStrategistAgent;
