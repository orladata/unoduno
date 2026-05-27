import { StateGraph, END } from "@langchain/langgraph";
import { YoutubeTranscript } from "youtube-transcript";
import { unodunoAgent } from "@/lib/mastra/agent";

/**
 * LangGraph Workflow State
 * Gerencia o fluxo de análise de vídeos YouTube com múltiplas etapas
 */
export interface VideoAnalysisState {
  videoUrl: string;
  videoId?: string;
  metadata?: {
    title: string;
    author: string;
    thumbnail: string;
  };
  transcript?: string;
  analysis?: string;
  hooks?: string[];
  strategies?: string[];
  errors?: string[];
  step?: number;
  totalSteps?: number;
}

/**
 * LangGraph Workflow Builder
 * Cria um pipeline de análise com estados e transições definidas
 */
export async function createVideoAnalysisWorkflow() {
  const workflow: any = new (StateGraph as any)();

  // Node 1: Validar URL e extrair vídeo ID
  workflow.addNode("validateUrl", async (state: VideoAnalysisState) => {
    try {
      const videoId = extractVideoIdFromUrl(state.videoUrl);
      if (!videoId) {
        throw new Error("URL de YouTube inválida");
      }
      return {
        ...state,
        videoId,
        step: 2,
        totalSteps: 5,
      };
    } catch (error) {
      return {
        ...state,
        errors: [...(state.errors || []), String(error)],
      };
    }
  });

  // Node 2: Buscar metadados do vídeo
  workflow.addNode("fetchMetadata", async (state: VideoAnalysisState) => {
    try {
      if (!state.videoId) throw new Error("Video ID não encontrado");

      const metadata = await fetchVideoMetadata(state.videoUrl);
      return {
        ...state,
        metadata,
        step: 3,
      };
    } catch (error) {
      return {
        ...state,
        errors: [...(state.errors || []), `Erro ao buscar metadados: ${error}`],
      };
    }
  });

  // Node 3: Extrair transcrição
  workflow.addNode("extractTranscript", async (state: VideoAnalysisState) => {
    try {
      if (!state.videoUrl) throw new Error("URL do vídeo não fornecida");

      const transcript = await YoutubeTranscript.fetchTranscript(
        state.videoUrl
      );
      const fullTranscript = transcript.map((t) => t.text).join(" ");

      return {
        ...state,
        transcript: fullTranscript,
        step: 4,
      };
    } catch (error) {
      return {
        ...state,
        errors: [...(state.errors || []), `Erro ao extrair transcrição: ${error}`],
      };
    }
  });

  // Node 4: Análise com Mastra AI Agent
  workflow.addNode("analyzeWithMastra", async (state: VideoAnalysisState) => {
    try {
      if (!state.transcript) throw new Error("Transcrição não disponível");

      const prompt = `
Analise este conteúdo de vídeo YouTube para o mercado brasileiro:

Título: ${state.metadata?.title || "N/A"}
Autor: ${state.metadata?.author || "N/A"}

Transcrição:
${state.transcript.substring(0, 2000)}...

Por favor, identifique:
1. O gancho principal (hook) do vídeo
2. Padrões de retenção
3. Estrutura narrativa
      `;

      const result = await unodunoAgent.generate({
        prompt,
      });

      return {
        ...state,
        analysis: result.text || String(result),
        step: 5,
      };
    } catch (error) {
      return {
        ...state,
        errors: [...(state.errors || []), `Erro na análise Mastra: ${error}`],
      };
    }
  });

  // Node 5: Extrar hooks e estratégias
  workflow.addNode("extractInsights", async (state: VideoAnalysisState) => {
    try {
      if (!state.analysis) throw new Error("Análise não disponível");

      // Parse análise para extrair hooks e estratégias
      const hooks = extractHooks(state.analysis);
      const strategies = extractStrategies(state.analysis);

      return {
        ...state,
        hooks,
        strategies,
        step: 5,
      };
    } catch (error) {
      return {
        ...state,
        errors: [...(state.errors || []), `Erro ao extrair insights: ${error}`],
      };
    }
  });

  // Transitions
  workflow.addEdge("validateUrl", "fetchMetadata");
  workflow.addEdge("fetchMetadata", "extractTranscript");
  workflow.addEdge("extractTranscript", "analyzeWithMastra");
  workflow.addEdge("analyzeWithMastra", "extractInsights");
  workflow.addEdge("extractInsights", END);

  // Set entry point
  workflow.setEntryPoint("validateUrl");

  return workflow.compile();
}

/**
 * Utility Functions
 */

function extractVideoIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0];
    }
  } catch {
    // Regex fallback
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }
  return null;
}

async function fetchVideoMetadata(
  url: string
): Promise<{ title: string; author: string; thumbnail: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url
    )}&format=json`;
    const response = await fetch(oembedUrl);
    const data = await response.json();

    return {
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
    };
  } catch {
    return {
      title: "Desconhecido",
      author: "Desconhecido",
      thumbnail: "",
    };
  }
}

function extractHooks(text: string): string[] {
  const hookKeywords = ["gancho", "hook", "inicial", "impacto", "viral"];
  const lines = text.split("\n");
  return lines
    .filter(
      (line) =>
        hookKeywords.some((keyword) => line.toLowerCase().includes(keyword)) &&
        line.length > 20
    )
    .slice(0, 3);
}

function extractStrategies(text: string): string[] {
  const strategyKeywords = [
    "estratégia",
    "padrão",
    "técnica",
    "estrutura",
    "elemento",
  ];
  const lines = text.split("\n");
  return lines
    .filter(
      (line) =>
        strategyKeywords.some((keyword) =>
          line.toLowerCase().includes(keyword)
        ) && line.length > 20
    )
    .slice(0, 3);
}

export default createVideoAnalysisWorkflow;
