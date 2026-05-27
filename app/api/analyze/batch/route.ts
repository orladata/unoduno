import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { batchAnalysis } from "@/lib/ai-orchestration/unified-ai-engine";
import { deductCredits } from "@/utils/credits";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const BatchAnalysisSchema = z.object({
  videoUrls: z.array(z.string().url()).min(1).max(10),
  type: z.enum(["quick", "detailed", "interactive"]).default("quick"),
});

type BatchAnalysisRequest = z.infer<typeof BatchAnalysisSchema>;

const CREDIT_COSTS: Record<string, number> = {
  quick: 100,
  detailed: 300,
  interactive: 500,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = BatchAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { videoUrls, type } = parsed.data;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate total credit cost
    const creditCostPerVideo = CREDIT_COSTS[type];
    const totalCredits = creditCostPerVideo * videoUrls.length;

    // Deduct all credits at once
    const deductResult = await deductCredits(user.id, totalCredits);
    if (!deductResult) {
      return NextResponse.json(
        { error: "Insufficient credits", required: totalCredits },
        { status: 402 }
      );
    }

    console.log(`[v0-api] Batch analysis (${type}) for ${videoUrls.length} videos`);

    // Process videos in parallel with controlled concurrency
    const results = await batchAnalysis(videoUrls, type as "quick" | "detailed" | "interactive");

    const duration = Date.now() - startTime;

    // Calculate success rate
    const successCount = results.filter((r: any) => r.success).length;
    const successRate = (successCount / videoUrls.length) * 100;

    return NextResponse.json({
      success: successCount === videoUrls.length,
      data: {
        results: results.map((r: any, idx: number) => ({
          videoUrl: videoUrls[idx],
          ...r,
        })),
        summary: {
          total: videoUrls.length,
          successful: successCount,
          failed: videoUrls.length - successCount,
          successRate: `${successRate.toFixed(1)}%`,
        },
      },
      metadata: {
        duration,
        totalCreditsUsed: totalCredits,
        analysisType: type,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[v0-api] Batch analysis error:", error);
    return NextResponse.json(
      {
        error: "Batch analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
