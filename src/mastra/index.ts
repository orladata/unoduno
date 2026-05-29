import { Mastra } from '@mastra/core';
import { defaultAgent } from './agents/agent';
import { transcriptionAgent } from './agents/transcriptionAgent';
import { cookieMonitorAgent } from './agents/cookieMonitorAgent';
import { dubbingAgent } from './agents/dubbingAgent';
import { contentStrategistAgent } from './agents/contentStrategist';
import { viralAnalystAgent } from './agents/viralAnalyst';
import { researchOrchestratorAgent } from './agents/researchOrchestrator';
import { culturalTranslatorAgent } from './agents/culturalTranslator';
import { hookEngineerAgent } from './agents/hookEngineer';
import { youtubeAudioAgent } from './agents/youtubeAudioAgent';

export const mastra = new Mastra({
  agents: {
    // Core agents
    defaultAgent,
    transcriptionAgent,
    cookieMonitorAgent,
    dubbingAgent,
    // Enhanced specialized agents (Fase 1)
    contentStrategistAgent,
    viralAnalystAgent,
    researchOrchestratorAgent,
    // Existing agents with enhanced prompts
    culturalTranslatorAgent,
    hookEngineerAgent,
    // YouTube Audio Processing Agent
    youtubeAudioAgent,
  },
});

