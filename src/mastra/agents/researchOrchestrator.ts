/**
 * Research Orchestrator Agent - Coordenador de múltiplas pesquisas
 * Orquestra ferramentas para capturar contexto completo
 */

import { Agent } from '@mastra/core/agent';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const researchOrchestratorAgent = new Agent({
  id: 'research-orchestrator',
  name: 'Research Orchestrator',
  instructions: SYSTEM_PROMPTS.researchOrchestrator,
  model: 'google/gemini-2.5-pro',
});

export default researchOrchestratorAgent;
