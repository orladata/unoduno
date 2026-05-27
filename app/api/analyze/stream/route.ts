import { NextRequest } from "next/server";
import { z } from "zod";
import { streamAnalysis } from "@/lib/ai-sdk/vercel-bridge";
import { deductCredits } from "@/utils/credits";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const StreamAnalysisSchema = z.object({
  videoUrl: z.string().url("URL inválida"),
  prompt: z.string().optional(),
  model: z.enum(["gemini-2.5-pro", "gemini-2.0-pro", "gemini-1.5-pro"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = StreamAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { videoUrl, prompt, model = "gemini-2.5-pro" } = parsed.data;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Deduct credits for streaming analysis
    const deductResult = await deductCredits(user.id, 150);
    if (!deductResult) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[v0-api] Stream analysis starting:", videoUrl);

    const analysisPrompt = prompt || 
      `Analise este vídeo do YouTube em tempo real: ${videoUrl}

Forneça uma análise estruturada com:
- Gancho principal identificado
- Público-alvo
- 3 variações de gancho para português
- Potencial viral (1-100)
- Sugestões de otimização`;

    const stream = streamAnalysis(analysisPrompt, model);

    // Create SSE response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of (stream as any)) {
            if (event.type === "text-delta") {
              const data = `data: ${JSON.stringify({ text: event.delta })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[v0-api] Stream analysis error:", error);
    return new Response(
      JSON.stringify({
        error: "Stream failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
