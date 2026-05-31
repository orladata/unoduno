import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const hookEngineerAgent = new Agent({
  id: 'hook-engineer-agent',
  name: 'Hook Engineer',
  instructions: SYSTEM_PROMPTS.hookEngineer,
  model: 'google/gemini-2.5-pro',
});
