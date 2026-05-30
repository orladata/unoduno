import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const culturalTranslatorAgent = new Agent({
  id: 'cultural-translator-agent',
  name: 'Cultural Translator',
  instructions: SYSTEM_PROMPTS.culturalTranslator,
  model: 'google/gemini-2.5-pro',
  maxSteps: 6,
  settings: {
    enableMemory: true,
    enableStructuredOutput: true,
    enableErrorRecovery: true,
  },
});
