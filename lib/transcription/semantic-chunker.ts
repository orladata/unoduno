import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface SemanticChunk {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  topicLabel: string;
  segmentCount: number;
}

export interface ChapterMarker {
  id: string;
  title: string;
  startTime: number;
  chunkIds: string[];
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function detectTopicLabel(text: string, index: number): string {
  const lower = text.toLowerCase();
  if (lower.includes("introduç") || lower.includes("hoje vou") || lower.includes("nesse vídeo") || lower.includes("bem-vindo")) return "Introdução";
  if (lower.includes("gancho") || lower.includes("por que") || lower.includes("imagin") || lower.includes("você sabia")) return "Gancho";
  if (lower.includes("conclus") || lower.includes("resumindo") || lower.includes("então pessoal") || lower.includes("obrigad")) return "Conclusão";
  if (lower.includes("dica") || lower.includes("passo") || lower.includes("estratégia") || lower.includes("técnica")) return "Dica prática";
  if (lower.includes("exemplo") || lower.includes("caso") || lower.includes("história") || lower.includes("aconteceu")) return "Exemplo";
  if (lower.includes("resultado") || lower.includes("prova") || lower.includes("funciona") || lower.includes("consegui")) return "Prova social";
  return `Tópico ${index + 1}`;
}

export async function buildSemanticChunks(
  segments: TranscriptSegment[],
  chunkSize = 800,
  chunkOverlap = 100
): Promise<SemanticChunk[]> {
  if (!segments || segments.length === 0) return [];

  // Build time-indexed text blocks (group segments into ~30s windows first)
  const timeBlocks: { text: string; startTime: number; endTime: number }[] = [];
  let blockText = "";
  let blockStart = segments[0].start;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    blockText += " " + seg.text;
    const blockEnd = seg.start + seg.duration;

    const isLast = i === segments.length - 1;
    const nextBlockEnd = segments[i + 1]?.start ?? blockEnd;
    const blockDuration = nextBlockEnd - blockStart;

    if (blockDuration >= 30 || isLast) {
      timeBlocks.push({ text: blockText.trim(), startTime: blockStart, endTime: blockEnd });
      blockText = "";
      blockStart = seg.start + seg.duration;
    }
  }

  // Use LangChain splitter on each block
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ["\n\n", "\n", ". ", "! ", "? ", ", ", " "],
  });

  const chunks: SemanticChunk[] = [];
  let chunkIndex = 0;

  for (const block of timeBlocks) {
    const docs = await splitter.createDocuments([block.text]);
    const timePerChar = (block.endTime - block.startTime) / Math.max(block.text.length, 1);

    let charCursor = 0;
    for (const doc of docs) {
      const chunkText = doc.pageContent;
      const startOffset = block.text.indexOf(chunkText, charCursor);
      const safeOffset = startOffset >= 0 ? startOffset : charCursor;
      const startTime = block.startTime + safeOffset * timePerChar;
      const endTime = startTime + chunkText.length * timePerChar;
      charCursor = safeOffset + chunkText.length;

      chunks.push({
        id: `chunk-${chunkIndex}`,
        text: chunkText,
        startTime: Math.max(0, Math.round(startTime)),
        endTime: Math.round(endTime),
        topicLabel: detectTopicLabel(chunkText, chunkIndex),
        segmentCount: docs.length,
      });
      chunkIndex++;
    }
  }

  return chunks;
}

export function buildChapters(chunks: SemanticChunk[]): ChapterMarker[] {
  if (chunks.length === 0) return [];

  // Group consecutive chunks with same topicLabel into chapters
  const chapters: ChapterMarker[] = [];
  let currentTopic = chunks[0].topicLabel;
  let currentChunkIds: string[] = [chunks[0].id];
  let currentStart = chunks[0].startTime;

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.topicLabel !== currentTopic) {
      chapters.push({
        id: `chapter-${chapters.length}`,
        title: currentTopic,
        startTime: currentStart,
        chunkIds: [...currentChunkIds],
      });
      currentTopic = chunk.topicLabel;
      currentChunkIds = [chunk.id];
      currentStart = chunk.startTime;
    } else {
      currentChunkIds.push(chunk.id);
    }
  }

  chapters.push({
    id: `chapter-${chapters.length}`,
    title: currentTopic,
    startTime: currentStart,
    chunkIds: [...currentChunkIds],
  });

  return chapters;
}

export function formatTimestampPublic(seconds: number): string {
  return formatTimestamp(seconds);
}
