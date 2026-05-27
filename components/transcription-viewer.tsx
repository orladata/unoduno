"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SegmentEvent {
  text: string;
  start: number;
  duration: number;
  timestamp: string;
}

interface ChunkEvent {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  topicLabel: string;
  timestampLabel: string;
}

interface ChapterEvent {
  id: string;
  title: string;
  startTime: number;
  timestampLabel: string;
  chunkIds: string[];
}

interface CompleteEvent {
  videoId: string;
  segmentCount: number;
  chunkCount: number;
  chapterCount: number;
  totalDuration: number;
  fullText: string;
}

type StreamEvent =
  | { type: "segment"; data: SegmentEvent }
  | { type: "chunk"; data: ChunkEvent }
  | { type: "chapter"; data: ChapterEvent }
  | { type: "complete"; data: CompleteEvent }
  | { type: "error"; data: { message: string } };

type Phase = "idle" | "streaming" | "complete" | "error";
type Tab = "chapters" | "chunks" | "raw";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimestampBadge({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-colors duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      style={{
        background: "rgba(96,165,250,0.12)",
        border: "1px solid rgba(96,165,250,0.25)",
        color: "#60a5fa",
      }}
      aria-label={`Ir para ${label}`}
    >
      ▶ {label}
    </button>
  );
}

function ChapterList({
  chapters,
  activeChapterId,
  onChapterClick,
}: {
  chapters: ChapterEvent[];
  activeChapterId: string | null;
  onChapterClick: (chapter: ChapterEvent) => void;
}) {
  if (chapters.length === 0)
    return (
      <p className="text-xs text-white/30 py-8 text-center">
        Carregando capítulos...
      </p>
    );

  return (
    <div className="flex flex-col gap-2">
      {chapters.map((ch, i) => (
        <motion.button
          key={ch.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          type="button"
          onClick={() => onChapterClick(ch)}
          className="flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          style={{
            background:
              activeChapterId === ch.id
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.03)",
            border: `1px solid ${activeChapterId === ch.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          <span
            className="text-[11px] font-mono font-bold mt-0.5 shrink-0"
            style={{ color: "#60a5fa" }}
          >
            {ch.timestampLabel}
          </span>
          <span className="text-sm font-medium text-white/80">{ch.title}</span>
        </motion.button>
      ))}
    </div>
  );
}

function ChunkList({ chunks }: { chunks: ChunkEvent[] }) {
  if (chunks.length === 0)
    return (
      <p className="text-xs text-white/30 py-8 text-center">
        Processando chunks semânticos...
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {chunks.map((chunk, i) => (
        <motion.div
          key={chunk.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.02 }}
          className="px-4 py-3 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TimestampBadge label={chunk.timestampLabel} />
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.2)",
                color: "#a78bfa",
              }}
            >
              {chunk.topicLabel}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/70">{chunk.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

function RawTranscript({ segments }: { segments: SegmentEvent[] }) {
  if (segments.length === 0)
    return (
      <p className="text-xs text-white/30 py-8 text-center">
        Carregando transcrição...
      </p>
    );

  return (
    <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-start gap-3 group">
          <span
            className="text-[11px] font-mono shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors"
            style={{ color: "rgba(255,255,255,0.25)", minWidth: "36px" }}
          >
            {seg.timestamp}
          </span>
          <p className="text-sm text-white/60 leading-relaxed">{seg.text}</p>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className="w-full h-1 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)" }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TranscriptionViewer({ videoUrl }: { videoUrl: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [segments, setSegments] = useState<SegmentEvent[]>([]);
  const [chunks, setChunks] = useState<ChunkEvent[]>([]);
  const [chapters, setChapters] = useState<ChapterEvent[]>([]);
  const [complete, setComplete] = useState<CompleteEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chapters");
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startTranscription = useCallback(async () => {
    if (phase === "streaming") return;
    setPhase("streaming");
    setSegments([]);
    setChunks([]);
    setChapters([]);
    setComplete(null);
    setError(null);
    setProgress(5);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/transcribe/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error ?? "Falha na requisição");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.replace(/^data: /, "").trim();
          if (!trimmed || trimmed === "[DONE]") continue;

          try {
            const event = JSON.parse(trimmed) as StreamEvent;
            handleEvent(event);
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setPhase("error");
    }
  }, [videoUrl, phase]);

  function handleEvent(event: StreamEvent) {
    switch (event.type) {
      case "segment":
        setSegments((prev) => [...prev, event.data]);
        setProgress((p) => Math.min(p + 0.5, 60));
        break;
      case "chunk":
        setChunks((prev) => [...prev, event.data]);
        setProgress((p) => Math.min(p + 1, 80));
        break;
      case "chapter":
        setChapters((prev) => [...prev, event.data]);
        setProgress((p) => Math.min(p + 2, 95));
        break;
      case "complete":
        setComplete(event.data);
        setProgress(100);
        setPhase("complete");
        break;
      case "error":
        setError(event.data.message);
        setPhase("error");
        break;
    }
  }

  useEffect(() => {
    startTranscription();
    return () => abortRef.current?.abort();
  }, []);

  const handleCopy = useCallback(async () => {
    const text = complete?.fullText ?? segments.map((s) => s.text).join(" ");
    if (!text) return;
    await navigator.clipboard.writeText(text).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [complete, segments]);

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "chapters", label: "Capítulos", count: chapters.length },
    { id: "chunks", label: "Tópicos", count: chunks.length },
    { id: "raw", label: "Transcrição", count: segments.length },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Transcrição Semântica
          </h2>
          {complete && (
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {complete.segmentCount} segmentos · {complete.chunkCount} tópicos ·{" "}
              {formatDuration(complete.totalDuration)}
            </p>
          )}
        </div>
        {(phase === "complete" || segments.length > 0) && (
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            style={{
              background: isCopied ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isCopied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: isCopied ? "#4ade80" : "rgba(255,255,255,0.5)",
            }}
          >
            {isCopied ? "✓ Copiado" : "Copiar texto"}
          </button>
        )}
      </div>

      {/* Progress bar while streaming */}
      {phase === "streaming" && <ProgressBar progress={progress} />}

      {/* Error state */}
      <AnimatePresence>
        {phase === "error" && error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={startTranscription}
              className="mt-2 text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors"
            >
              Tentar novamente →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      {(segments.length > 0 || chunks.length > 0 || chapters.length > 0) && (
        <>
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                style={{
                  background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === tab.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                }}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "chapters" && (
                <ChapterList
                  chapters={chapters}
                  activeChapterId={activeChapterId}
                  onChapterClick={(ch) => setActiveChapterId(ch.id)}
                />
              )}
              {activeTab === "chunks" && <ChunkList chunks={chunks} />}
              {activeTab === "raw" && <RawTranscript segments={segments} />}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Idle/streaming empty state */}
      {phase === "streaming" && segments.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg border animate-pulse"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
          />
          <p className="text-xs text-white/30">Buscando transcrição do YouTube...</p>
        </div>
      )}
    </div>
  );
}

export default TranscriptionViewer;
