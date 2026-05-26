import { Memory, ModelByInputTokens } from "@mastra/memory";
import type { Store } from "@mastra/core";

/**
 * Observational Memory com Token-Aware Routing
 * 
 * Automaticamente escolhe o modelo mais eficiente baseado no tamanho do input:
 * - Gemini Flash: <5K tokens (rápido, barato)
 * - Gemini Pro: 5-20K tokens (balanceado)
 * - GPT-4: >20K tokens (poderoso)
 * 
 * Reduz custo em ~60-70% para análises curtas
 */
export function createUnodunoMemory(store?: Store) {
  return new Memory({
    store,
    options: {
      observationalMemory: {
        model: new ModelByInputTokens({
          upTo: {
            5_000: "google/gemini-2.5-flash",     // Muito rápido, barato
            20_000: "google/gemini-2.5-pro",      // Equilibrado
            1_000_000: "openai/gpt-4.5"           // Máxima qualidade (rare)
          }
        })
      }
    }
  });
}

/**
 * Uso em Agent Context:
 * 
 * const harness = new Harness({
 *   agent: unodunoAgent,
 *   memory: unodunoMemory
 * });
 * 
 * // Observa contexto do usuário
 * const userContext = await harness.memory.observe({
 *   userId: user.id,
 *   event: 'analyzed_video',
 *   data: {
 *     videoId: 'abc123',
 *     duration: 720, // segundos
 *     themes: ['marketing', 'copywriting'],
 *     transcriptionLength: 3500 // tokens
 *   }
 * });
 * 
 * // Na próxima análise, pode usar o contexto:
 * const messages = [
 *   {
 *     role: 'user',
 *     content: `Previous themes: ${userContext.themes}. Analyze this video...`
 *   }
 * ];
 */
