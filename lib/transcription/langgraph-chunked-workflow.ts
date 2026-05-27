/**
 * LangGraph Workflow: Parallel Chunked Transcription and Analysis
 * 
 * Flow:
 * 1. Fetch video metadata
 * 2. Calculate chunking strategy
 * 3. Process chunks in parallel
 * 4. Merge transcripts with overlap handling
 * 5. Generate insights per chunk using Vercel AI SDK
 * 6. Compile final analysis
 */

import { StateGraph, END } from "@langchain/langgraph";
import { calculateChunking, ChunkingStrategy } from "./chunk-calculator";
import { chunkedTranscriptionTool, ChunkedTranscriptResult } from "@/lib/mastra/tools/chunked-transcription";
import { generateAnalysis } from "@/lib/ai-sdk/vercel-bridge";

export interface ChunkedWorkflowState {
  videoUrl: string;
  chunkingStrategy?: ChunkingStrategy;
  transcriptChunks: Array<{
    index: number;
    label: string;
    transcript: string;
    analysis?: string;
    status: "pending" | "processing" | "completed" | "failed";
  }>;
  fullTranscript: string;
  insights: Array<{
    chunkIndex: number;
    hooks: string[];
    keyPoints: string[];
    sentiment: string;
  }>;
  finalAnalysis?: string;
  errors: string[];
  startTime: number;
}

/**
 * Node 1: Fetch and validate video
 */
async function nodeValidateAndChunk(state: ChunkedWorkflowState) {
  console.log("[v0-lg] Node: Validate and Chunk");

  try {
    // Step 1: Get chunked transcription
    const result = (await chunkedTranscriptionTool.execute({
      videoUrl: state.videoUrl,
      preferredChunkSize: "auto",
    })) as ChunkedTranscriptResult;

    if (!result.success) {
      return {
        ...state,
        errors: [...state.errors, result.error || "Failed to get chunked transcription"],
      };
    }

    // Step 2: Prepare chunks for processing
    const transcriptChunks = result.chunks.map((chunk) => ({
      index: chunk.chunkIndex,
      label: chunk.label,
      transcript: chunk.transcript,
      status: "pending" as const,
    }));

    console.log(
      `[v0-lg] Chunking complete: ${transcriptChunks.length} chunks, Total duration: ${result.metadata.videoDurationFormatted}`
    );

    return {
      ...state,
      chunkingStrategy: {
        totalDurationSeconds: result.metadata.videoDurationSeconds,
        totalDurationMinutes: Math.round(result.metadata.videoDurationSeconds / 60),
        chunkCount: result.totalChunks,
        strategy: result.strategy,
        chunks: [], // Simplified
        maxChunkDuration: 1200,
      },
      transcriptChunks,
      fullTranscript: result.fullTranscript,
    };
  } catch (error: any) {
    console.error("[v0-lg] Validation error:", error);
    return {
      ...state,
      errors: [...state.errors, `Validation failed: ${error.message}`],
    };
  }
}

/**
 * Node 2: Analyze each chunk in parallel
 * (In practice, this would be parallelized by LangGraph)
 */
async function nodeAnalyzeChunks(state: ChunkedWorkflowState) {
  console.log("[v0-lg] Node: Analyze Chunks");

  const updatedChunks = [...state.transcriptChunks];
  const insights: typeof state.insights = [];

  for (const chunk of updatedChunks) {
    try {
      console.log(`[v0-lg] Analyzing chunk ${chunk.index + 1}: ${chunk.label}`);

      // Mark as processing
      chunk.status = "processing";

      // Use Vercel AI SDK for quick analysis
      const analysis = await generateAnalysis(
        `Analyze this video transcript section (${chunk.label}):

${chunk.transcript}

Provide insights on:
1. Main hooks or attention-grabbing moments
2. Key points or takeaways
3. Overall sentiment (positive, neutral, negative)
4. Recommended sections for clips

Keep it concise and actionable.`,
        "gemini-2.5-pro"
      );

      chunk.analysis = analysis.text;
      chunk.status = "completed";

      // Extract structured insights
      insights.push({
        chunkIndex: chunk.index,
        hooks: extractHooks(analysis.text),
        keyPoints: extractKeyPoints(analysis.text),
        sentiment: extractSentiment(analysis.text),
      });

      console.log(`[v0-lg] Chunk ${chunk.index + 1} analysis complete`);
    } catch (error: any) {
      console.error(`[v0-lg] Error analyzing chunk ${chunk.index}:`, error);
      chunk.status = "failed";
      state.errors.push(`Chunk ${chunk.index} analysis failed: ${error.message}`);
    }
  }

  return {
    ...state,
    transcriptChunks: updatedChunks,
    insights,
  };
}

/**
 * Node 3: Merge analysis and generate final insights
 */
async function nodeFinalAnalysis(state: ChunkedWorkflowState) {
  console.log("[v0-lg] Node: Final Analysis");

  try {
    // Compile insights from all chunks
    const allHooks = state.insights.flatMap((i) => i.hooks);
    const allKeyPoints = state.insights.flatMap((i) => i.keyPoints);
    const sentiments = state.insights.map((i) => i.sentiment);

    // Generate final comprehensive analysis
    const finalPrompt = `Based on the following insights from ${state.transcriptChunks.length} chunks of a video:

Chunks Analysis:
${state.transcriptChunks.map((c) => `${c.label}: ${c.analysis}`).join("\n\n")}

Generate a comprehensive final analysis including:
1. Overall video summary
2. Top 5 hooks or engaging moments
3. Key themes across all chunks
4. Audience engagement level (1-10)
5. Recommended clip segments and timestamps
6. Content improvement suggestions

Format as a structured report.`;

    const finalAnalysis = await generateAnalysis(finalPrompt, "gemini-2.5-pro");

    console.log("[v0-lg] Final analysis complete");

    return {
      ...state,
      finalAnalysis: finalAnalysis.text,
    };
  } catch (error: any) {
    console.error("[v0-lg] Final analysis error:", error);
    return {
      ...state,
      errors: [...state.errors, `Final analysis failed: ${error.message}`],
    };
  }
}

/**
 * Helper: Extract hooks from analysis text
 */
function extractHooks(text: string): string[] {
  const hooks: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (
      line.toLowerCase().includes("hook") ||
      line.toLowerCase().includes("grab") ||
      line.toLowerCase().includes("attention")
    ) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned.length > 10) {
        hooks.push(cleaned);
      }
    }
  }

  return hooks.slice(0, 3); // Top 3
}

/**
 * Helper: Extract key points from analysis text
 */
function extractKeyPoints(text: string): string[] {
  const keyPoints: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (
      line.toLowerCase().includes("key") ||
      line.toLowerCase().includes("point") ||
      line.toLowerCase().includes("takeaway") ||
      line.toLowerCase().includes("important")
    ) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned.length > 10) {
        keyPoints.push(cleaned);
      }
    }
  }

  return keyPoints.slice(0, 3); // Top 3
}

/**
 * Helper: Extract sentiment from analysis text
 */
function extractSentiment(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("positive") || lower.includes("engaging")) return "positive";
  if (lower.includes("negative") || lower.includes("confusing")) return "negative";
  return "neutral";
}

/**
 * Build and return the compiled workflow
 */
export async function createChunkedTranscriptionWorkflow() {
  const workflow: any = new (StateGraph as any)();

  // Add nodes
  workflow.addNode("validate_and_chunk", nodeValidateAndChunk);
  workflow.addNode("analyze_chunks", nodeAnalyzeChunks);
  workflow.addNode("final_analysis", nodeFinalAnalysis);

  // Add edges
  workflow.setEntryPoint("validate_and_chunk");
  workflow.addEdge("validate_and_chunk", "analyze_chunks");
  workflow.addEdge("analyze_chunks", "final_analysis");
  workflow.addEdge("final_analysis", END);

  // Compile
  const compiled = workflow.compile();

  return compiled;
}

/**
 * Execute the workflow
 */
export async function executeChunkedTranscriptionWorkflow(videoUrl: string) {
  console.log("[v0-lg] Executing chunked transcription workflow...");

  const startTime = Date.now();
  const workflow = await createChunkedTranscriptionWorkflow();

  const initialState: ChunkedWorkflowState = {
    videoUrl,
    transcriptChunks: [],
    fullTranscript: "",
    insights: [],
    errors: [],
    startTime,
  };

  try {
    const result = await workflow.invoke(initialState as any);

    const duration = Date.now() - startTime;

    console.log(`[v0-lg] Workflow complete in ${duration}ms`);

    return {
      success: (result as any).errors?.length === 0,
      data: {
        videoUrl,
        fullTranscript: (result as any).fullTranscript,
        chunkCount: (result as any).transcriptChunks?.length,
        chunks: (result as any).transcriptChunks,
        insights: (result as any).insights,
        finalAnalysis: (result as any).finalAnalysis,
        chunkingStrategy: (result as any).chunkingStrategy,
      },
      metadata: {
        engine: "langgraph",
        duration,
        errors: (result as any).errors,
      },
    };
  } catch (error: any) {
    console.error("[v0-lg] Workflow error:", error);

    return {
      success: false,
      error: error.message,
      metadata: {
        engine: "langgraph",
        duration: Date.now() - startTime,
      },
    };
  }
}
