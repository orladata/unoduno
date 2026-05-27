import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { unodunoAgent } from "@/lib/mastra/agent";
import { deductCredits } from "@/utils/credits";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const DetailedAnalysisSchema = z.object({
  videoUrl: z.string().url("URL inválida"),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = DetailedAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { videoUrl } = parsed.data;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deduct credits (300 credits = 1 detailed analysis with tools)
    const deductResult = await deductCredits(user.id, 300);
    if (!deductResult) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    console.log("[v0-api] Detailed analysis starting:", videoUrl);

    // Use Mastra Agent with tools
    const result = await unodunoAgent.generate({
      prompt: `Você vai analisar este vídeo do YouTube em detalhes: ${videoUrl}

Use as ferramentas disponíveis para:
1. Extrair metadados do vídeo (título, autor, thumbnail)
2. Buscar a transcrição completa
3. Pesquisar tendências relacionadas

Depois, forneça uma análise completa com:
- 3 ganchos alternativos para reescrever em português
- Estratégias de retenção identificadas
- Público-alvo
- Potencial viral (1-100)
- Sugestões de duração ótima
- Temas principais
- Tática de engajamento recomendada

Formate a resposta em markdown bem estruturado.`,
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        analysis: (result as any).text || result,
        videoUrl,
        engine: "mastra-agent",
      },
      metadata: {
        duration,
        toolsUsed: ["fetchVideoMetadata", "fetchTranscript", "searchTrends"],
      },
    });
  } catch (error) {
    console.error("[v0-api] Detailed analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
