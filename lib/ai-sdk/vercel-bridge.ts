import { generateText, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Vercel AI SDK Bridge
 * Integra Vercel AI SDK com Mastra e LangGraph para streaming e geração de texto
 */

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Gerar texto com Vercel AI SDK (Promise-based)
 * Ideal para análises rápidas e não-streaming
 */
export async function generateAnalysis(
  prompt: string,
  model: string = "gemini-2.5-pro"
) {
  try {
    const result = await generateText({
      model: google(model),
      prompt,
      temperature: 0.7,
      system: `Você é um especialista em análise de conteúdo de vídeos.
Sua expertise é em identificar padrões virais e estratégias de retenção.
Responda sempre em português brasileiro, de forma clara e estruturada.`,
    });

    console.log("[v0] Generate Analysis - Tokens:", {
      input: result.usage.inputTokens,
      output: result.usage.outputTokens,
      total: (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0),
    });

    return result;
  } catch (error) {
    console.error("[v0] Generate Analysis failed:", error);
    throw error;
  }
}

/**
 * Stream de análise com Vercel AI SDK
 * Ideal para UX em tempo real com grandes análises
 */
export async function streamAnalysis(
  prompt: string,
  model: string = "gemini-2.5-pro"
) {
  try {
    const stream = streamText({
      model: google(model),
      prompt,
      temperature: 0.7,
      system: `Você é um especialista em análise de conteúdo de vídeos.
Sua expertise é em identificar padrões virais e estratégias de retenção.
Responda sempre em português brasileiro, de forma clara e estruturada.`,
    });

    console.log("[v0] Stream Analysis - Started");

    return stream;
  } catch (error) {
    console.error("[v0] Stream Analysis failed:", error);
    throw error;
  }
}

/**
 * Conversa multi-turno com histórico
 * Ideal para análise interativa e refinement
 */
export async function conversationWithHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  model: string = "gemini-2.5-pro"
) {
  try {
    const aiMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const result = await generateText({
      model: google(model),
      messages: aiMessages,
      temperature: 0.7,
      system: `Você é um especialista em análise de conteúdo de vídeos.
Continue a conversa mantendo contexto anterior.
Seja sucinto mas completo nas respostas.`,
    });

    return result;
  } catch (error) {
    console.error("[v0] Conversation failed:", error);
    throw error;
  }
}

/**
 * Extrair dados estruturados (JSON mode)
 */
export interface ContentAnalysis {
  hooks: string[];
  strategies: string[];
  themes: string[];
  engagement_tactics: string[];
  viral_potential: number;
  recommended_duration: string;
}

export async function extractStructuredAnalysis(
  prompt: string,
  model: string = "gemini-2.5-pro"
): Promise<ContentAnalysis> {
  try {
    const result = await generateText({
      model: google(model),
      prompt: `${prompt}

Retorne um JSON válido com a seguinte estrutura:
{
  "hooks": ["hook1", "hook2", "hook3"],
  "strategies": ["strategy1", "strategy2"],
  "themes": ["theme1", "theme2"],
  "engagement_tactics": ["tactic1", "tactic2"],
  "viral_potential": 0-100,
  "recommended_duration": "30s" ou "1m" ou "3m"
}`,
      temperature: 0.3,
      system: `Você retorna sempre um JSON válido e bem formatado.
Não adicione markdown formatting.
Apenas o JSON puro.`,
    });

    try {
      const cleanedText = result.text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedText);
      return parsed as ContentAnalysis;
    } catch (parseError) {
      console.error("[v0] JSON parse failed:", parseError);
      throw new Error(`Failed to parse structured response`);
    }
  } catch (error) {
    console.error("[v0] Extract Structured Analysis failed:", error);
    throw error;
  }
}

/**
 * Utility: Usar modelo certo baseado em tokens esperados
 */
export function selectOptimalModel(expectedTokens: number): string {
  if (expectedTokens < 10000) {
    return "gemini-2.5-pro";
  }
  if (expectedTokens < 100000) {
    return "gemini-2.0-pro";
  }
  return "gemini-1.5-pro";
}

export default {
  generateAnalysis,
  streamAnalysis,
  conversationWithHistory,
  extractStructuredAnalysis,
  selectOptimalModel,
};
