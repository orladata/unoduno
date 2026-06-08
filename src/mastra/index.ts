import { Mastra } from '@mastra/core';
import { transcriptionAgent } from './agents/transcriptionAgent';
import { youtubeAudioAgent } from './agents/youtubeAudioAgent';
import { dubbingAgent } from './agents/dubbingAgent';

export const mastra = new Mastra({
  agents: {
    transcriptionAgent,
    youtubeAudioAgent,
    dubbingAgent,
  },
});
