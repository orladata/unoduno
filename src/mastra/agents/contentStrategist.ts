/**
 * Content Strategist Agent - Especialista em análise de conteúdo e estratégia
 * Usa system prompt avançado baseado em best practices de AI tools líderes
 */

import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { searchWebForTrendsTool } from '../../lib/mastra/tools/research';
import { analyzeDemographicsTool } from '../../lib/mastra/tools/demographics';
import { analyzeCompetitorTool } from '../../lib/mastra/tools/competitor';
import { analyzePerformanceTool } from '../../lib/mastra/tools/performance';
import { analyzeTrendsTool } from '../../lib/mastra/tools/trends-advanced';

export const contentStrategistAgent = new Agent({
  id: 'content-strategist',
  name: 'Content Strategist',
  instructions: SYSTEM_PROMPTS.contentStrategist,
  model: 'google/gemini-2.5-pro',
  tools: [
    searchWebForTrendsTool,
    analyzeDemographicsTool,
    analyzeCompetitorTool,
    analyzePerformanceTool,
    analyzeTrendsTool,
  ],
  maxSteps: 15,
  // Enhanced settings inspired by leading AI tools
  settings: {
    enableMemory: true,
    enableStructuredOutput: true,
    enableErrorRecovery: true,
  },
});

export default contentStrategistAgent;
