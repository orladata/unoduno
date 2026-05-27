/**
 * Intelligent Video Chunking Calculator
 * 
 * Strategy:
 * - Videos < 10 min: Single chunk (no splitting)
 * - Videos 10-20 min: 2 chunks
 * - Videos 20-40 min: 2-3 chunks
 * - Videos > 40 min: 3+ chunks with max 20 min each
 */

export interface ChunkInfo {
  chunkIndex: number;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  durationMinutes: string;
  label: string;
}

export interface ChunkingStrategy {
  totalDurationSeconds: number;
  totalDurationMinutes: number;
  chunkCount: number;
  strategy: string;
  chunks: ChunkInfo[];
  maxChunkDuration: number;
}

const CHUNK_STRATEGIES = {
  SINGLE: 600, // 10 minutes
  DOUBLE: 1200, // 20 minutes
  TRIPLE: 1800, // 30 minutes
  MULTI: 2400, // 40 minutes
};

export function calculateChunking(totalDurationSeconds: number): ChunkingStrategy {
  console.log(`[v0] Chunking Calculator - Duration: ${totalDurationSeconds}s (${Math.round(totalDurationSeconds / 60)}m)`);

  // Strategy 1: < 10 min - No chunking needed
  if (totalDurationSeconds < CHUNK_STRATEGIES.SINGLE) {
    console.log(`[v0] Strategy: SINGLE CHUNK (< 10 min)`);
    return {
      totalDurationSeconds,
      totalDurationMinutes: Math.round(totalDurationSeconds / 60),
      chunkCount: 1,
      strategy: "SINGLE",
      maxChunkDuration: totalDurationSeconds,
      chunks: [
        {
          chunkIndex: 0,
          startSeconds: 0,
          endSeconds: totalDurationSeconds,
          durationSeconds: totalDurationSeconds,
          durationMinutes: `${Math.round(totalDurationSeconds / 60)}m`,
          label: "Complete Video",
        },
      ],
    };
  }

  // Strategy 2: 10-20 min - 2 chunks
  if (totalDurationSeconds < CHUNK_STRATEGIES.DOUBLE) {
    console.log(`[v0] Strategy: DOUBLE CHUNKS (10-20 min)`);
    const chunkDuration = Math.ceil(totalDurationSeconds / 2);
    const chunks: ChunkInfo[] = [];

    chunks.push({
      chunkIndex: 0,
      startSeconds: 0,
      endSeconds: chunkDuration,
      durationSeconds: chunkDuration,
      durationMinutes: `${Math.round(chunkDuration / 60)}m`,
      label: "Part 1",
    });

    chunks.push({
      chunkIndex: 1,
      startSeconds: chunkDuration,
      endSeconds: totalDurationSeconds,
      durationSeconds: totalDurationSeconds - chunkDuration,
      durationMinutes: `${Math.round((totalDurationSeconds - chunkDuration) / 60)}m`,
      label: "Part 2",
    });

    return {
      totalDurationSeconds,
      totalDurationMinutes: Math.round(totalDurationSeconds / 60),
      chunkCount: 2,
      strategy: "DOUBLE",
      maxChunkDuration: chunkDuration,
      chunks,
    };
  }

  // Strategy 3: 20-40 min - Evaluate for 2 or 3 chunks
  if (totalDurationSeconds < CHUNK_STRATEGIES.MULTI) {
    // If exactly 20-30 min, use 2 chunks
    if (totalDurationSeconds < CHUNK_STRATEGIES.TRIPLE) {
      console.log(`[v0] Strategy: DOUBLE CHUNKS (20-30 min)`);
      const chunkDuration = Math.ceil(totalDurationSeconds / 2);
      const chunks: ChunkInfo[] = [];

      chunks.push({
        chunkIndex: 0,
        startSeconds: 0,
        endSeconds: chunkDuration,
        durationSeconds: chunkDuration,
        durationMinutes: `${Math.round(chunkDuration / 60)}m`,
        label: "Part 1",
      });

      chunks.push({
        chunkIndex: 1,
        startSeconds: chunkDuration,
        endSeconds: totalDurationSeconds,
        durationSeconds: totalDurationSeconds - chunkDuration,
        durationMinutes: `${Math.round((totalDurationSeconds - chunkDuration) / 60)}m`,
        label: "Part 2",
      });

      return {
        totalDurationSeconds,
        totalDurationMinutes: Math.round(totalDurationSeconds / 60),
        chunkCount: 2,
        strategy: "DOUBLE",
        maxChunkDuration: chunkDuration,
        chunks,
      };
    }

    // 30-40 min: use 3 chunks
    console.log(`[v0] Strategy: TRIPLE CHUNKS (30-40 min)`);
    const chunkDuration = Math.ceil(totalDurationSeconds / 3);
    const chunks: ChunkInfo[] = [];

    for (let i = 0; i < 3; i++) {
      const start = i * chunkDuration;
      const end = i === 2 ? totalDurationSeconds : (i + 1) * chunkDuration;
      const duration = end - start;

      chunks.push({
        chunkIndex: i,
        startSeconds: start,
        endSeconds: end,
        durationSeconds: duration,
        durationMinutes: `${Math.round(duration / 60)}m`,
        label: `Part ${i + 1}`,
      });
    }

    return {
      totalDurationSeconds,
      totalDurationMinutes: Math.round(totalDurationSeconds / 60),
      chunkCount: 3,
      strategy: "TRIPLE",
      maxChunkDuration: chunkDuration,
      chunks,
    };
  }

  // Strategy 4: > 40 min - Multiple chunks of ~20 min each
  console.log(`[v0] Strategy: MULTI CHUNKS (> 40 min)`);
  const MAX_CHUNK_DURATION = 1200; // 20 minutes max
  const chunkCount = Math.ceil(totalDurationSeconds / MAX_CHUNK_DURATION);
  const chunkDuration = Math.ceil(totalDurationSeconds / chunkCount);
  const chunks: ChunkInfo[] = [];

  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkDuration;
    const end = i === chunkCount - 1 ? totalDurationSeconds : (i + 1) * chunkDuration;
    const duration = end - start;

    chunks.push({
      chunkIndex: i,
      startSeconds: start,
      endSeconds: end,
      durationSeconds: duration,
      durationMinutes: `${Math.round(duration / 60)}m`,
      label: `Part ${i + 1}/${chunkCount}`,
    });
  }

  return {
    totalDurationSeconds,
    totalDurationMinutes: Math.round(totalDurationSeconds / 60),
    chunkCount,
    strategy: "MULTI",
    maxChunkDuration: MAX_CHUNK_DURATION,
    chunks,
  };
}

/**
 * Get FFmpeg command for extracting a chunk
 * ffmpeg -ss START -to END -i INPUT -c copy OUTPUT
 */
export function getFfmpegChunkCommand(
  inputFile: string,
  outputFile: string,
  startSeconds: number,
  endSeconds: number
): string {
  return `ffmpeg -ss ${startSeconds} -to ${endSeconds} -i "${inputFile}" -c copy "${outputFile}"`;
}

/**
 * Get FFmpeg command to get video duration
 * ffmpeg -i input.mp4 2>&1 | grep "Duration"
 */
export function getFfmpegDurationCommand(inputFile: string): string {
  return `ffmpeg -i "${inputFile}" 2>&1 | grep "Duration"`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
