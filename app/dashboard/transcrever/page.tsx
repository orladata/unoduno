"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "fetching" | "ready" | "refining" | "refined" | "error"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:v=|youtu\.be\/|embed\/|v\/|shorts\/|live\/|e\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function SpinnerIcon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle className="opacity-25" cx="12" cy="12" r="10" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function CopyButton({ text, label = "Copiar" }: { readonly text: string; readonly label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent */ }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
        copied
          ? "bg-green-500/15 text-green-400 border border-green-500/30"
          : "bg-white/[0.06] border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
      }`}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          Copiado!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          {label}
        </>
      )}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TranscreverPage() {
  const [url, setUrl] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)

  // Transcript data
  const [originalTranscript, setOriginalTranscript] = useState("")
  const [refinedTranscript, setRefinedTranscript] = useState("")

  // Refs for auto-scroll
  const refinedRef = useRef<HTMLDivElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Scroll to transcript when loaded
  useEffect(() => {
    if (phase === "ready" && transcriptRef.current) {
      transcriptRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [phase])

  // Scroll to refined when starts
  useEffect(() => {
    if ((phase === "refining" || phase === "refined") && refinedRef.current) {
      refinedRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [phase])

  const handleFetchTranscript = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!url.trim()) return

      const vid = extractVideoId(url.trim())
      if (!vid) {
        setErrorMsg("Link inválido. Cole um link válido do YouTube.")
        setPhase("error")
        return
      }

      setVideoId(vid)
      setPhase("fetching")
      setErrorMsg("")
      setOriginalTranscript("")
      setRefinedTranscript("")

      try {
        const res = await fetch(`/api/transcription?videoId=${vid}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || `Erro HTTP ${res.status}`)
        }

        if (!data.transcript || data.transcript.length < 20) {
          throw new Error("Transcrição retornada está vazia ou muito curta.")
        }

        setOriginalTranscript(data.transcript)
        setPhase("ready")
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido ao buscar transcrição.")
        setPhase("error")
      }
    },
    [url]
  )

  const handleRefine = useCallback(async () => {
    if (!originalTranscript || phase === "refining") return

    setPhase("refining")
    setRefinedTranscript("")

    try {
      const res = await fetch("/api/transcription/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: originalTranscript }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errData.error || `Erro HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("Resposta sem body")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulated += decoder.decode(value, { stream: true })
        setRefinedTranscript(accumulated)
      }

      setPhase("refined")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao corrigir com Gemini.")
      setPhase("error")
    }
  }, [originalTranscript, phase])

  const handleReset = () => {
    setUrl("")
    setPhase("idle")
    setErrorMsg("")
    setVideoId(null)
    setOriginalTranscript("")
    setRefinedTranscript("")
  }

  const currentVideoId = videoId || extractVideoId(url)

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="min-h-dvh flex flex-col pt-6" style={{ background: "transparent" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 max-w-4xl mx-auto w-full mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium transition-colors duration-200 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg"
          style={{ color: "var(--text-muted)" }}
        >
          <BackArrow />
          Voltar
        </Link>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Transcritor
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 max-w-4xl mx-auto w-full pb-20">
        <motion.div variants={container} initial="hidden" animate="visible">
          {/* Title */}
          <motion.div variants={item} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span className="gradient-text-violet">Transcritor</span> Inteligente
            </h1>
            <p className="text-sm text-white/35 mt-1.5">
              Cole o link do vídeo, receba a transcrição exata e corrija com o Gemini.
            </p>
          </motion.div>

          {/* Input Form */}
          <motion.form variants={item} onSubmit={handleFetchTranscript} className="mb-6">
            <div className={`relative rounded-2xl transition-all duration-300 ${url ? "glow-ring" : ""}`}>
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 focus-within:border-cyan-500/40 focus-within:bg-white/[0.06] transition-all duration-300 hover:border-white/15">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 shrink-0">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <input
                  type="url"
                  id="transcriber-url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Cole o link do YouTube aqui..."
                  className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none"
                  disabled={phase === "fetching" || phase === "refining"}
                  minLength={10}
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    className="text-white/25 hover:text-white/50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Preview */}
            <AnimatePresence>
              {currentVideoId && phase === "idle" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]"
                >
                  <div className="relative w-full aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/90 font-medium">Pronto para transcrever</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              variants={item}
              type="submit"
              disabled={phase === "fetching" || phase === "refining" || !url}
              id="transcriber-submit-btn"
              className="w-full mt-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
            >
              {phase === "fetching" ? (
                <>
                  <SpinnerIcon size={16} />
                  Buscando transcrição...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Buscar Transcrição
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Error State */}
          <AnimatePresence>
            {phase === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-300 mb-1">Erro</p>
                    <p className="text-sm text-red-200/80 leading-relaxed">{errorMsg}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-red-300 hover:text-red-200 font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors shrink-0"
                  >
                    Tentar outro
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fetching State */}
          <AnimatePresence>
            {phase === "fetching" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)" }} />
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
                    <SpinnerIcon size={28} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">Buscando transcrição no R2...</p>
                <p className="text-xs text-white/30">Verificando armazenamento do Cloudflare</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript Display */}
          <AnimatePresence>
            {(phase === "ready" || phase === "refining" || phase === "refined") && originalTranscript && (
              <motion.div
                ref={transcriptRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Transcrição Original</p>
                      <p className="text-[11px] text-white/30">
                        {originalTranscript.split(/\s+/).length.toLocaleString("pt-BR")} palavras • ID: {videoId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={originalTranscript} label="Copiar" />
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-[0.97]"
                    >
                      Novo vídeo
                    </button>
                  </div>
                </div>

                {/* Original Transcript Card */}
                <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-cyan-500/[0.06]">
                    <span className="text-sm font-semibold text-cyan-400 tracking-wide">TRANSCRIÇÃO BRUTA</span>
                  </div>
                  <div className="px-5 py-5 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <p className="text-sm text-white/80 leading-[1.8] whitespace-pre-wrap font-mono select-text">
                      {originalTranscript}
                    </p>
                  </div>
                </div>

                {/* Refine Button */}
                {phase === "ready" && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    type="button"
                    onClick={handleRefine}
                    id="transcriber-refine-btn"
                    className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Corrigir com Gemini AI
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Refining / Refined State */}
          <AnimatePresence>
            {(phase === "refining" || phase === "refined") && (
              <motion.div
                ref={refinedRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${phase === "refining" ? "bg-violet-500/15 border border-violet-500/20" : "bg-green-500/15 border border-green-500/20"}`}>
                      {phase === "refining" ? (
                        <SpinnerIcon size={14} />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {phase === "refining" ? "Gemini está corrigindo..." : "Transcrição Corrigida"}
                      </p>
                      <p className="text-[11px] text-white/30">
                        {phase === "refining" ? "Streaming em tempo real" : `${refinedTranscript.split(/\s+/).length.toLocaleString("pt-BR")} palavras • Corrigida pelo Gemini`}
                      </p>
                    </div>
                  </div>
                  {phase === "refined" && (
                    <CopyButton text={refinedTranscript} label="Copiar corrigida" />
                  )}
                </div>

                {/* Refined Transcript Card */}
                <div className="rounded-2xl overflow-hidden border border-violet-500/20 bg-violet-500/[0.04]">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-violet-500/10 bg-violet-500/[0.08]">
                    <span className="text-sm font-semibold text-violet-300 tracking-wide">CORRIGIDA PELO GEMINI</span>
                    {phase === "refining" && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    )}
                  </div>
                  <div className="px-5 py-5 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative">
                    <p className="text-sm text-white/85 leading-[1.9] whitespace-pre-wrap select-text">
                      {refinedTranscript || (
                        <span className="text-white/30 animate-pulse">Aguardando resposta do Gemini...</span>
                      )}
                    </p>
                    {phase === "refining" && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Download Both */}
                {phase === "refined" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-3 pt-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([refinedTranscript], { type: "text/plain;charset=utf-8" })
                        const a = document.createElement("a")
                        a.href = URL.createObjectURL(blob)
                        a.download = `transcricao_corrigida_${videoId}.txt`
                        a.click()
                        URL.revokeObjectURL(a.href)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Baixar Corrigida (.txt)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([originalTranscript], { type: "text/plain;charset=utf-8" })
                        const a = document.createElement("a")
                        a.href = URL.createObjectURL(blob)
                        a.download = `transcricao_original_${videoId}.txt`
                        a.click()
                        URL.revokeObjectURL(a.href)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Baixar Original (.txt)
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
