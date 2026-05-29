/**
 * Research Orchestrator Agent - Coordenador de múltiplas pesquisas
 * Orquestra ferramentas para capturar contexto completo
 */

import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { searchWebForTrendsTool } from '../../lib/mastra/tools/research';
import { analyzeDemographicsTool } from '../../lib/mastra/tools/demographics';
import { analyzeCompetitorTool } from '../../lib/mastra/tools/competitor';
import { analyzePerformanceTool } from '../../lib/mastra/tools/performance';
import { analyzeTrendsTool } from '../../lib/mastra/tools/trends-advanced';

export const researchOrchestratorAgent = new Agent({
  id: 'research-orchestrator',
  name: 'Research Orchestrator',
  instructions: SYSTEM_PROMPTS.researchOrchestrator,
  model: 'google/gemini-2.5-pro',
  tools: [
    searchWebForTrendsTool,
    analyzeDemographicsTool,
    analyzeCompetitorTool,
    analyzePerformanceTool,
    analyzeTrendsTool,
  ],
  maxSteps: 20,
  settings: {
    enableMemory: true,
    enableStructuredOutput: true,
    enableErrorRecovery: true,
  },
});

export default researchOrchestratorAgent;
