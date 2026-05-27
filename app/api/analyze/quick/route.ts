import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAnalysis } from "@/lib/ai-sdk/vercel-bridge";
import { deductCredits } from "@/utils/credits";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const QuickAnalysisSchema = z.object({
  videoUrl: z.string().url("URL inválida"),
  model: z.enum(["gemini-2.5-pro", "gemini-2.0-pro", "gemini-1.5-pro"]).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = QuickAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { videoUrl, model = "gemini-2.5-pro" } = parsed.data;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deduct credits (100 credits = 1 quick analysis)
    const deductResult = await deductCredits(user.id, 100);
    if (!deductResult) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    console.log("[v0-api] Quick analysis for:", videoUrl);
    
    const result = await generateAnalysis(
      `Analise este vídeo do YouTube com foco em:\n${videoUrl}\n\n- Gancho principal\n- Público-alvo\n- Tática de retenção\n- 3 variações de gancho alternativas\n\nSeja conciso e direto.`,
      model
    );

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        analysis: result.text,
        videoUrl,
        model,
        engine: "vercel-ai-sdk",
      },
      metadata: {
        duration,
        tokensUsed: {
          input: result.usage.inputTokens,
          output: result.usage.outputTokens,
        },
      },
    });
  } catch (error) {
    console.error("[v0-api] Quick analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
