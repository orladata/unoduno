import { Agent } from '@mastra/core/agent';

export const defaultAgent = new Agent({
  name: 'Default Agent',
  instructions: 'You are a helpful assistant integrated with Chimedeck.',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
    toolChoice: 'auto',
  },
});
