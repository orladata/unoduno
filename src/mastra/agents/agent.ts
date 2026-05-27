import { Agent } from '@mastra/core/agent';

export const defaultAgent = new Agent({
  id: 'default-agent',
  name: 'Default Agent',
  instructions: 'You are a helpful assistant integrated with Chimedeck.',
  model: 'openai/gpt-4o',
});
