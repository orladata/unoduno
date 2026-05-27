import { YoutubeTranscript } from "youtube-transcript";
import { buildSemanticChunks, buildChapters, SemanticChunk, ChapterMarker, TranscriptSegment, formatTimestampPublic } from "./semantic-chunker";

export interface TranscriptionResult {
  videoId: string;
  fullText: string;
  chunks: SemanticChunk[];
  chapters: ChapterMarker[];
  totalDuration: number;
  segmentCount: number;
}

export interface StreamingTranscriptionEvent {
  type: "segment" | "chunk" | "chapter" | "complete" | "error";
  data: unknown;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchTranscript(videoIdOrUrl: string): Promise<TranscriptSegment[]> {
  const videoId = extractVideoId(videoIdOrUrl) ?? videoIdOrUrl;
  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang: "pt" });
    return raw.map((item) => ({
      text: item.text,
      start: item.offset / 1000,
      duration: item.duration / 1000,
    }));
  } catch {
    // fallback to English if PT not available
    const raw = await YoutubeTranscript.fetchTranscript(videoId);
    return raw.map((item) => ({
      text: item.text,
      start: item.offset / 1000,
      duration: item.duration / 1000,
    }));
  }
}

export async function transcribeVideo(videoIdOrUrl: string): Promise<TranscriptionResult> {
  const videoId = extractVideoId(videoIdOrUrl) ?? videoIdOrUrl;
  const segments = await fetchTranscript(videoId);

  if (segments.length === 0) {
    throw new Error("Nenhuma transcrição encontrada para este vídeo.");
  }

  const fullText = segments.map((s) => s.text).join(" ");
  const lastSeg = segments[segments.length - 1];
  const totalDuration = lastSeg.start + lastSeg.duration;

  const chunks = await buildSemanticChunks(segments);
  const chapters = buildChapters(chunks);

  return {
    videoId,
    fullText,
    chunks,
    chapters,
    totalDuration,
    segmentCount: segments.length,
  };
}

export async function* streamTranscription(
  videoIdOrUrl: string
): AsyncGenerator<StreamingTranscriptionEvent> {
  const videoId = extractVideoId(videoIdOrUrl) ?? videoIdOrUrl;

  let segments: TranscriptSegment[];
  try {
    segments = await fetchTranscript(videoId);
  } catch (err) {
    yield { type: "error", data: { message: (err as Error).message } };
    return;
  }

  if (segments.length === 0) {
    yield { type: "error", data: { message: "Transcrição vazia para este vídeo." } };
    return;
  }

  // Stream segments progressively (batches of 10)
  const BATCH = 10;
  for (let i = 0; i < segments.length; i += BATCH) {
    const batch = segments.slice(i, i + BATCH);
    for (const seg of batch) {
      yield {
        type: "segment",
        data: {
          text: seg.text,
          start: seg.start,
          duration: seg.duration,
          timestamp: formatTimestampPublic(seg.start),
        },
      };
    }
    // Small yield pause to allow SSE flushing
    await new Promise((r) => setTimeout(r, 0));
  }

  // Build semantic chunks and chapters
  const chunks = await buildSemanticChunks(segments);
  for (const chunk of chunks) {
    yield {
      type: "chunk",
      data: {
        ...chunk,
        timestampLabel: formatTimestampPublic(chunk.startTime),
      },
    };
  }

  const chapters = buildChapters(chunks);
  for (const chapter of chapters) {
    yield {
      type: "chapter",
      data: {
        ...chapter,
        timestampLabel: formatTimestampPublic(chapter.startTime),
      },
    };
  }

  const lastSeg = segments[segments.length - 1];
  yield {
    type: "complete",
    data: {
      videoId,
      segmentCount: segments.length,
      chunkCount: chunks.length,
      chapterCount: chapters.length,
      totalDuration: lastSeg.start + lastSeg.duration,
      fullText: segments.map((s) => s.text).join(" "),
    },
  };
}
