import { Mastra } from '@mastra/core';
import { defaultAgent } from './agents/agent';
import { transcriptionAgent } from './agents/transcriptionAgent';
import { cookieMonitorAgent } from './agents/cookieMonitorAgent';
import { dubbingAgent } from './agents/dubbingAgent';

export const mastra = new Mastra({
  agents: { defaultAgent, transcriptionAgent, cookieMonitorAgent, dubbingAgent },
});
