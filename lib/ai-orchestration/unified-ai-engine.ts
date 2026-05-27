import { createVideoAnalysisWorkflow } from "@/lib/langgraph/workflow";
import {
  generateAnalysis,
  streamAnalysis,
  extractStructuredAnalysis,
  ContentAnalysis,
} from "@/lib/ai-sdk/vercel-bridge";
import { unodunoAgent } from "@/lib/mastra/agent";

/**
 * Unified AI Engine
 * Orquestra Mastra + Vercel AI SDK + LangGraph em um sistema coeso
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    User Request                         │
 * └────────────────────┬────────────────────────────────────┘
 *                      │
 *                      ▼
 *         ┌────────────────────────────┐
 *         │   Unified AI Engine        │
 *         │  (This file)               │
 *         └────────────────────────────┘
 *          │            │            │
 *    ┌─────┴──┐    ┌────┴─────┐   ┌─┴────────┐
 *    ▼        ▼    ▼          ▼   ▼          ▼
 *  Mastra  LangGraph  Vercel AI SDK
 *  Agent   (Flow)     (Streaming)
 */

export interface UnifiedAnalysisRequest {
  videoUrl: string;
  analysisType: "quick" | "detailed" | "interactive";
  returnStructured?: boolean;
}

export interface UnifiedAnalysisResponse {
  success: boolean;
  data?: {
    basic: {
      title?: string;
      author?: string;
    };
    analysis?: string;
    structured?: ContentAnalysis;
  };
  error?: string;
  metadata: {
    engine: "mastra" | "langgraph" | "vercel-ai-sdk" | "hybrid";
    duration: number;
    tokensUsed?: number;
  };
}

/**
 * Quick Analysis (Vercel AI SDK)
 * Análise rápida usando streamText da Vercel
 */
export async function quickAnalysis(
  videoUrl: string
): Promise<UnifiedAnalysisResponse> {
  const startTime = Date.now();

  try {
    console.log("[v0] Quick Analysis - Starting for:", videoUrl);

    const prompt = `Analise rapidamente este vídeo: ${videoUrl}
    
Identifique em 3-5 pontos:
1. Gancho principal
2. Padrão de retenção
3. Público-alvo
4. Potencial viral
5. Recomendação de duração`;

    const result = await generateAnalysis(prompt, "gemini-2.5-pro");

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        basic: {},
        analysis: result.text,
      },
      metadata: {
        engine: "vercel-ai-sdk",
        duration,
        tokensUsed: result.usage.totalTokens,
      },
    };
  } catch (error) {
    console.error("[v0] Quick Analysis failed:", error);
    return {
      success: false,
      error: String(error),
      metadata: {
        engine: "vercel-ai-sdk",
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Detailed Analysis (Mastra Agent)
 * Análise detalhada usando Mastra Agent com tools
 */
export async function detailedAnalysis(
  videoUrl: string
): Promise<UnifiedAnalysisResponse> {
  const startTime = Date.now();

  try {
    console.log("[v0] Detailed Analysis - Starting for:", videoUrl);

    const prompt = `Realize uma análise COMPLETA deste vídeo do YouTube: ${videoUrl}

Você DEVE usar as ferramentas disponíveis para:
1. Extrair metadados do vídeo
2. Buscar a transcrição completa
3. Pesquisar tendências relacionadas no mercado brasileiro

Depois analise e forneça:
- Estrutura narrativa completa
- Padrões de retenção identificados
- 5 ganchos alternativos em português
- Estratégias de viralização
- Públicos-alvo potenciais
- Tempo de duração recomendado`;

    const result = await unodunoAgent.generate({
      prompt,
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        basic: {},
        analysis: String(result),
      },
      metadata: {
        engine: "mastra",
        duration,
      },
    };
  } catch (error) {
    console.error("[v0] Detailed Analysis failed:", error);
    return {
      success: false,
      error: String(error),
      metadata: {
        engine: "mastra",
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Interactive Analysis (LangGraph Workflow)
 * Análise completa com múltiplos passos e estado gerenciado
 */
export async function interactiveAnalysis(
  videoUrl: string,
  returnStructured: boolean = true
): Promise<UnifiedAnalysisResponse> {
  const startTime = Date.now();

  try {
    console.log("[v0] Interactive Analysis - Starting LangGraph workflow");

    // Compile workflow
    const workflow = await createVideoAnalysisWorkflow();

    // Run workflow
    const initialState = {
      videoUrl,
      step: 1,
      totalSteps: 5,
      errors: [],
    };

    console.log("[v0] Workflow - Compiled, running initial state");

    // Executar fluxo com type assertion
    const result = await workflow.invoke(initialState as any);

    console.log("[v0] Workflow - Complete, result:", {
      step: (result as any).step,
      hasAnalysis: !!(result as any).analysis,
      hooksCount: (result as any).hooks?.length,
      strategiesCount: (result as any).strategies?.length,
    });

    let structured: ContentAnalysis | undefined;

    // Se pediu estruturado, fazer parsing
    if (returnStructured && result.analysis) {
      try {
        structured = await extractStructuredAnalysis(
          `Baseado nesta análise: ${result.analysis}\n\nExtraia dados estruturados.`
        );
      } catch (parseError) {
        console.warn("[v0] Could not extract structured data:", parseError);
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: (result as any).errors?.length === 0,
      data: {
        basic: (result as any).metadata,
        analysis: (result as any).analysis,
        structured,
      },
      error: (result as any).errors?.join("; "),
      metadata: {
        engine: "langgraph",
        duration: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error("[v0] Interactive Analysis failed:", error);
    return {
      success: false,
      error: String(error),
      metadata: {
        engine: "langgraph",
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Unified Analysis Router
 * Escolhe automaticamente o engine melhor baseado no tipo de análise
 */
export async function analyzeVideo(
  request: UnifiedAnalysisRequest
): Promise<UnifiedAnalysisResponse> {
  console.log("[v0] Unified Analysis - Type:", request.analysisType);

  switch (request.analysisType) {
    case "quick":
      return quickAnalysis(request.videoUrl);

    case "detailed":
      return detailedAnalysis(request.videoUrl);

    case "interactive":
      return interactiveAnalysis(request.videoUrl, request.returnStructured);

    default:
      return {
        success: false,
        error: `Unknown analysis type: ${request.analysisType}`,
        metadata: {
          engine: "hybrid",
          duration: 0,
        },
      };
  }
}

/**
 * Batch Analysis
 * Analisa múltiplos vídeos em paralelo com LangGraph
 */
export async function batchAnalysis(
  videoUrls: string[],
  analysisType: "quick" | "detailed" | "interactive" = "quick"
): Promise<UnifiedAnalysisResponse[]> {
  console.log(
    "[v0] Batch Analysis - Processing",
    videoUrls.length,
    "videos"
  );

  const promises = videoUrls.map((url) =>
    analyzeVideo({
      videoUrl: url,
      analysisType,
      returnStructured: true,
    })
  );

  return Promise.all(promises);
}

export default {
  analyzeVideo,
  quickAnalysis,
  detailedAnalysis,
  interactiveAnalysis,
  batchAnalysis,
};
