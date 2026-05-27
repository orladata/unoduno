import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeVideo } from "@/lib/ai-orchestration/unified-ai-engine";
import { deductCredits } from "@/utils/credits";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 180;
export const dynamic = "force-dynamic";

const UnifiedAnalysisSchema = z.object({
  videoUrl: z.string().url("URL inválida"),
  type: z.enum(["quick", "detailed", "interactive"]).default("quick"),
  returnStructured: z.boolean().optional(),
});

type UnifiedAnalysisRequest = z.infer<typeof UnifiedAnalysisSchema>;

// Credit costs for each analysis type
const CREDIT_COSTS: Record<string, number> = {
  quick: 100,
  detailed: 300,
  interactive: 500,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = UnifiedAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { videoUrl, type, returnStructured } = parsed.data;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deduct credits based on analysis type
    const creditCost = CREDIT_COSTS[type];
    const deductResult = await deductCredits(user.id, creditCost);
    if (!deductResult) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    console.log(`[v0-api] Unified analysis (${type}) starting:`, videoUrl);

    // Use unified engine to orchestrate best tool
    const result = await analyzeVideo({
      videoUrl,
      analysisType: type as "quick" | "detailed" | "interactive",
      returnStructured,
    });

    const duration = Date.now() - startTime;

    // Add tracking info
    const response = {
      ...result,
      metadata: {
        ...result.metadata,
        duration,
        creditsCost: creditCost,
        analysisType: type,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0-api] Unified analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
