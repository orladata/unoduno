"use client"

import { Suspense, useEffect, useCallback, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { youtubeUrlSchema, extractVideoId, sanitizeTextContent } from "@/lib/validations"
import { useChatAPI } from "@/hooks/use-chat-api"
import { ViralEngineerAnalysis } from "@/components/viral-engineer-analysis"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type StreamingPhase = "idle" | "streaming" | "complete" | "error"

interface ScriptSection {
  readonly id: string
  readonly label: string
  readonly accentColor: string
  readonly badgeColor: string
  readonly markerPrefix: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCRIPT_SECTIONS: readonly ScriptSection[] = [
  {
    id: "gancho",
    label: "Gancho",
    accentColor: "#f59e0b",
    badgeColor: "rgba(245,158,11,0.12)",
    markerPrefix: null,
  },
  {
    id: "introducao",
    label: "Introdução",
    accentColor: "#60a5fa",
    badgeColor: "rgba(96,165,250,0.12)",
    markerPrefix: null,
  },
  {
    id: "desenvolvimento",
    label: "Desenvolvimento",
    accentColor: "#a78bfa",
    badgeColor: "rgba(167,139,250,0.12)",
    markerPrefix: null,
  },
  {
    id: "cta",
    label: "CTA",
    accentColor: "#4ade80",
    badgeColor: "rgba(74,222,128,0.12)",
    markerPrefix: null,
  },
] as const

// ─── Sub-components ──────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function SpinnerIcon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M12 2v4" opacity="1" />
      <path d="M12 18v4" opacity="0.3" />
      <path d="M4.93 4.93l2.83 2.83" opacity="0.9" />
      <path d="M16.24 16.24l2.83 2.83" opacity="0.25" />
      <path d="M2 12h4" opacity="0.7" />
      <path d="M18 12h4" opacity="0.2" />
      <path d="M4.93 19.07l2.83-2.83" opacity="0.5" />
      <path d="M16.24 7.76l2.83-2.83" opacity="0.15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

// ─── Loading State ────────────────────────────────────────────────────────────

function StreamingIndicator({ status, logText }: { readonly status: string, readonly logText?: string }) {
  const isStreaming = status === "streaming" || status === "submitted"
  const [seconds, setSeconds] = useState(0)

  let currentLog = "Iniciando infraestrutura..."
  let currentStage = 0

  if (status === "idle") {
    currentStage = 0
    currentLog = "Aguardando URL..."
  } else if (isStreaming) {
    currentStage = 1
    currentLog = "Extraindo áudio do vídeo..."
    
    if (logText) {
      if (logText.includes("TRANSCRICAO_START")) {
        currentStage = 2
        currentLog = "Transcrevendo fala (Whisper)..."
      }
      
      const jsonMatch = logText.indexOf("{")
      if (jsonMatch !== -1 && jsonMatch > logText.length / 2) {
         currentStage = 4
         currentLog = "Formatando dossiê final..."
      } else if (logText.length > 500 && !logText.includes("{")) {
         currentStage = 3
         currentLog = "Analisando padrões virais (Gemini)..."
      } else if (jsonMatch !== -1) {
         currentStage = 4
         currentLog = "Gerando dossiê (JSON)..."
      }

      const matches = [...logText.matchAll(/\\*⏳ (.*?)\\*/g)]
      if (matches.length > 0) {
        currentLog = matches[matches.length - 1][1]
      }
    }
  } else if (status === "complete") {
    currentStage = 4
    currentLog = "Análise concluída!"
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const stages = [
    { id: 0, label: "Preparo", icon: "1" },
    { id: 1, label: "Áudio", icon: "2" },
    { id: 2, label: "Texto", icon: "3" },
    { id: 3, label: "Análise", icon: "4" },
    { id: 4, label: "Dossiê", icon: "5" },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-12"
      role="status"
    >
      <div className="glass-card p-6 sm:p-10 relative overflow-hidden">
        {/* Background glow based on stage */}
        <div 
          className="absolute inset-0 opacity-20 transition-colors duration-1000 pointer-events-none"
          style={{
            background: currentStage === 0 ? "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2), transparent 70%)" :
                        currentStage === 1 ? "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.4), transparent 70%)" :
                        currentStage === 2 ? "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.4), transparent 70%)" :
                        currentStage === 3 ? "radial-gradient(circle at 50% 0%, rgba(236,72,153,0.4), transparent 70%)" :
                        "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.4), transparent 70%)"
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Main Status Text */}
          <h2 className="text-xl sm:text-2xl font-black text-white mb-3 text-center tracking-tight animate-fade-up">
            {currentLog}
          </h2>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-white/50 font-mono">{seconds}s decorridos</span>
          </div>

          {/* Pipeline Visual */}
          <div className="w-full relative flex justify-between items-start max-w-3xl mx-auto mb-8">
            {/* Connecting Line Background */}
            <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-white/[0.05] rounded-full z-0" />
            
            {/* Connecting Line Progress */}
            <motion.div 
              className="absolute top-5 left-[10%] h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full z-0 origin-left"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, (currentStage / (stages.length - 1)) * 80)}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Stages */}
            {stages.map((stage) => {
              const isPast = currentStage > stage.id
              const isCurrent = currentStage === stage.id
              
              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3 w-[20%]">
                  <motion.div 
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                      backgroundColor: isPast || isCurrent ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.05)",
                      borderColor: isPast || isCurrent ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.1)",
                      color: isPast || isCurrent ? "#000" : "rgba(255,255,255,0.3)"
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-lg sm:text-xl shadow-lg transition-colors duration-300 ${
                      isCurrent ? "shadow-[0_0_20px_rgba(139,92,246,0.4)] border-transparent" : ""
                    }`}
                  >
                    {isPast ? <CheckIcon /> : stage.icon}
                  </motion.div>
                  <span className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-center transition-colors duration-300 ${
                    isCurrent ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : isPast ? "text-white/70" : "text-white/30"
                  }`}>
                    {stage.label}
                  </span>
                  
                  {isCurrent && (
                    <motion.div 
                      layoutId="active-stage-indicator"
                      className="absolute -bottom-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Long Video Warning */}
          <AnimatePresence>
            {seconds > 20 && currentStage < 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-sm text-center"
              >
                <p className="text-xs font-medium text-amber-200/90 leading-relaxed">
                  <span className="text-amber-400 mr-2 font-bold">AVISO:</span>
                  Vídeo extenso detectado. A IA está processando uma grande quantidade de dados, aguarde mais um pouco.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Script Display ───────────────────────────────────────────────────────────

function ScriptDisplay({ content, videoId, onCopy, onReset, isCopied }: {
  readonly content: string
  readonly videoId: string | null
  readonly onCopy: () => void
  readonly onReset: () => void
  readonly isCopied?: boolean
}) {
  // Split content into labelled sections by scanning for keywords
  const sections = parseSections(content)

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-hidden="true"
          >
            <CheckIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Roteiro gerado com sucesso</p>
            {videoId && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                ID: {sanitizeTextContent(videoId)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${isCopied ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'hover:bg-white/10 text-[var(--text-muted)]'}`}
            style={!isCopied ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" } : {}}
            aria-label="Copiar roteiro completo"
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
            {isCopied ? "Copiado!" : "Copiar tudo"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
            aria-label="Analisar outro vídeo"
          >
            Novo vídeo
          </button>
        </div>
      </div>

      {/* Sections */}
      {sections.length > 0
        ? sections.map((section, i) => (
          <ScriptSectionCard key={i} section={section} index={i} />
        ))
        : (
          <RawScriptCard content={content} />
        )
      }
    </div>
  )
}

interface ParsedSection {
  readonly title: string
  readonly content: string
  readonly accentColor: string
  readonly badgeColor: string
}

function parseSections(text: string): ParsedSection[] {
  // Match heading patterns like "## GANCHO", "**GANCHO**", "GANCHO:", etc.
  const headingPattern = /(?:#{1,3}\s*|(?:\*\*))?(GANCHO|INTRODUÇÃO|DESENVOLVIMENTO|CTA|CALL.TO.ACTION|HOOK)(?:\*\*)?(?:\s*[-:])?\s*/gi

  const colorMap: Record<string, { accentColor: string; badgeColor: string }> = {
    GANCHO:       { accentColor: "#f59e0b", badgeColor: "rgba(245,158,11,0.12)" },
    HOOK:         { accentColor: "#f59e0b", badgeColor: "rgba(245,158,11,0.12)" },
    INTRODUÇÃO:   { accentColor: "#60a5fa", badgeColor: "rgba(96,165,250,0.12)" },
    DESENVOLVIMENTO: { accentColor: "#a78bfa", badgeColor: "rgba(167,139,250,0.12)" },
    CTA:          { accentColor: "#4ade80", badgeColor: "rgba(74,222,128,0.12)" },
    "CALL-TO-ACTION": { accentColor: "#4ade80", badgeColor: "rgba(74,222,128,0.12)" },
  }

  const parts: ParsedSection[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex
  headingPattern.lastIndex = 0

  const matches: Array<{ index: number; title: string; end: number }> = []
  while ((match = headingPattern.exec(text)) !== null) {
    const rawTitle = match[1].trim().toUpperCase().replace(/[-\s]/g, "-")
    matches.push({ index: match.index, title: rawTitle, end: match.index + match[0].length })
  }

  if (matches.length === 0) return []

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]
    const next = matches[i + 1]
    const sectionText = text.slice(current.end, next?.index ?? text.length).trim()
    const normalizedTitle = Object.keys(colorMap).find((k) =>
      current.title.includes(k.replace(/-/g, "")) || current.title === k
    ) ?? current.title

    parts.push({
      title: normalizedTitle === "HOOK" ? "GANCHO" : normalizedTitle,
      content: sanitizeTextContent(sectionText),
      ...(colorMap[normalizedTitle] ?? { accentColor: "#888", badgeColor: "rgba(136,136,136,0.1)" }),
    })
    lastIndex = next?.index ?? text.length
  }

  return parts
}

function ScriptSectionCard({ section, index }: { readonly section: ParsedSection; readonly index: number }) {
  // Render [CENA], [ÁUDIO], [TEXTO] markers with styling
  const lines = section.content.split("\n").filter(Boolean)

  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      aria-label={`Seção: ${section.title}`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: section.badgeColor }}
      >
        <span
          className="text-xs font-bold tracking-wider px-2 py-0.5 rounded-md"
          style={{ background: section.accentColor, color: "#000" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-sm font-semibold tracking-wide" style={{ color: section.accentColor }}>
          {section.title}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 py-5 flex flex-col gap-3">
        {lines.map((line, li) => (
          <ScriptLine key={li} line={line} accentColor={section.accentColor} />
        ))}
      </div>
    </article>
  )
}

function ScriptLine({ line, accentColor }: { readonly line: string; readonly accentColor: string }) {
  // Detect marker type: [CENA], [ÁUDIO], [TEXTO]
  const markerMatch = line.match(/^\[(CENA|ÁUDIO|AUDIO|TEXTO|LEGENDA)\]/i)

  if (markerMatch) {
    const markerType = markerMatch[1].toUpperCase().replace("AUDIO", "ÁUDIO")
    const rest = sanitizeTextContent(line.slice(markerMatch[0].length).trim())
    return (
      <div className="flex items-start gap-2">
        <span
          className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md mt-0.5"
          style={{ background: "rgba(255,255,255,0.08)", color: accentColor, fontSize: "10px" }}
        >
          {markerType}
        </span>
        <span className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {rest}
        </span>
      </div>
    )
  }

  // Detect timestamps like (0:00-0:03)
  const timeMatch = line.match(/^\([\d:]+[-–][\d:]+\)/)
  if (timeMatch) {
    const rest = sanitizeTextContent(line.slice(timeMatch[0].length).trim())
    return (
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded-md mt-0.5" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-subtle)", fontSize: "10px" }}>
          {timeMatch[0]}
        </span>
        <span className="text-sm leading-relaxed text-white">{rest}</span>
      </div>
    )
  }

  // Regular line
  return (
    <p className="text-sm leading-relaxed text-white">
      {sanitizeTextContent(line)}
    </p>
  )
}

function RawScriptCard({ content }: { readonly content: string }) {
  // Fallback: render raw text safely line by line — never dangerouslySetInnerHTML
  const lines = sanitizeTextContent(content).split("\n").filter(Boolean)

  return (
    <div
      className="rounded-2xl px-5 py-5 flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {lines.map((line, i) => (
        <p key={i} className="text-sm leading-relaxed text-white">
          {line}
        </p>
      ))}
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { readonly message: string; readonly onRetry: () => void }) {
  const isAuthError = message.toLowerCase().includes("autorizado") || message.toLowerCase().includes("login")

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center" role="alert">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <p className="text-sm font-semibold text-white">Erro ao processar vídeo</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {sanitizeTextContent(message)}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isAuthError && (
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            Fazer login
          </Link>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-black bg-white hover:bg-white/95 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

// Helper to extract and parse JSON safely from text that might contain markdown blocks or wrapper text
function safeJSONParse(text: string) {
  if (!text) return null
  let cleanText = text.trim()

  // Remove markdown JSON code blocks if present
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim()
  }

  // Find first { and last } to isolate the JSON object
  const firstBrace = cleanText.indexOf("{")
  const lastBrace = cleanText.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.slice(firstBrace, lastBrace + 1)
  }

  return JSON.parse(cleanText)
}

// ─── Main Inner Component ────────────────────────────────────────────────────

function AnalisarInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 1. Validate URL from query params using the shared Zod schema
  const rawUrl = searchParams.get("url") ?? ""
  const directAudioUrl = searchParams.get("directAudioUrl") ?? ""
  const urlValidation = youtubeUrlSchema.safeParse(rawUrl)
  const validatedUrl = urlValidation.success ? urlValidation.data : null
  const videoId = validatedUrl ? extractVideoId(validatedUrl) : null

  // 2. useChat — Custom hook for API communication
  const { messages, sendMessage, status, error } = useChatAPI()

  // 3. Trigger analysis once on mount if URL is valid
  const hasStarted = useRef(false)
  const startAnalysis = useCallback(() => {
    if (!validatedUrl || hasStarted.current) return
    hasStarted.current = true
    sendMessage({ 
      text: `Analise este vídeo do YouTube: ${validatedUrl}`,
      directAudioUrl: directAudioUrl || undefined
    })
  }, [validatedUrl, directAudioUrl, sendMessage])

  useEffect(() => {
    startAnalysis()
  }, [startAnalysis])

  // 4. Derive phase from status and messages
  const lastMessage = messages.filter((m) => m.role === "assistant").pop()
  const assistantText = lastMessage?.content ?? ""
  
  // Extract real-time transcript
  let fullTranscriptText = ""
  const transcriptMatch = assistantText.match(/\*TRANSCRICAO_START\*\n([\s\S]*?)\n\*TRANSCRICAO_END\*/)
  if (transcriptMatch) {
    fullTranscriptText = transcriptMatch[1]
  }
  
  // Parse JSON analysis from assistant text
  let analysisData = null
  try {
    if (assistantText && assistantText.trim().length > 0) {
      analysisData = safeJSONParse(assistantText)
    }
  } catch (parseError) {
    // JSON parsing will fail while streaming - that's expected
    console.log("[v0:analysis] Still streaming or invalid JSON")
  }
  
  const isLoading = status === "streaming" || status === "submitted"
  const phase: StreamingPhase =
    error ? "error" :
    !isLoading && analysisData ? "complete" :
    isLoading ? "streaming" :
    "idle"

  const [isCopied, setIsCopied] = useState(false)

  // 6. Handlers
  const handleCopy = useCallback(async () => {
    if (!assistantText) return
    try {
      await navigator.clipboard.writeText(assistantText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Clipboard not available — silent fail
    }
  }, [assistantText])

  const handleReset = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const handleRetry = useCallback(() => {
    hasStarted.current = false
    // Re-trigger analysis by refreshing the page with same URL
    window.location.reload()
  }, [])

  // 7. Invalid URL guard
  if (!validatedUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center" role="alert">
        <p className="text-sm font-semibold text-white">URL inválida</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {urlValidation.success ? "" : urlValidation.error.errors[0]?.message}
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-black bg-white hover:bg-white/95 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
        >
          Voltar e tentar novamente
        </Link>
      </div>
    )
  }

  return (
    <>
      {phase === "error" && (
        <ErrorState
          message={error?.message ?? "Erro desconhecido ao processar o vídeo."}
          onRetry={handleRetry}
        />
      )}

      {(phase === "idle" || phase === "streaming") && (
        <StreamingIndicator status={isLoading ? "streaming" : "idle"} logText={assistantText} />
      )}

      {phase === "complete" && analysisData && (
        <ViralEngineerAnalysis
          analysis={analysisData}
          isLoading={false}
        />
      )}

      {/* Real-time Transcript Preview */}
      {phase === "streaming" && fullTranscriptText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 mb-4 max-w-4xl mx-auto w-full"
        >
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Áudio Transcrito em Tempo Real
            </h3>
          </div>
          <div className="glass-card-subtle px-5 py-4 overflow-y-auto relative group" style={{ maxHeight: "250px" }}>
            <p className="text-[13px] leading-relaxed text-white/70 whitespace-pre-wrap font-mono">
              {fullTranscriptText}
            </p>
            {/* Fade out bottom to indicate more text is coming */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
          </div>
        </motion.div>
      )}

      {/* Live streaming preview while generating JSON */}
      {phase === "streaming" && assistantText && !assistantText.includes("*TRANSCRICAO_START*") && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 max-w-4xl mx-auto w-full"
        >
          <div className="glass-card-subtle px-6 py-5 relative overflow-hidden" aria-live="polite">
            {/* Scan line effect */}
            <div className="scan-line" />
            
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <SpinnerIcon size={12} />
              Processando Dossiê Viral...
            </p>
            <div className="flex flex-col gap-2">
              {sanitizeTextContent(assistantText).split("\n").filter(Boolean).slice(-5).map((line, i) => (
                <p key={i} className="text-xs sm:text-sm leading-relaxed text-white/60 font-mono">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

export default function AnalisarPage() {
  return (
    <div className="min-h-dvh flex flex-col pt-6" style={{ background: "transparent" }}>
      {/* Header local instead of fixed top-0, allowing Navbar to breathe */}
      <div className="flex items-center justify-between px-4 sm:px-6 max-w-3xl mx-auto w-full mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10"
          style={{ color: "var(--text-muted)" }}
          aria-label="Voltar ao painel inicial"
        >
          <BackArrow />
          Voltar
        </Link>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
          role="status"
          aria-label="Geração com IA ativa"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
          IA ativa
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 sm:px-6 max-w-3xl mx-auto w-full pb-20">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center gap-8 py-24 w-full" role="status" aria-label="Inicializando motor de análise...">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full animate-ping" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", animationDuration: "2s" }} />
              <div className="w-16 h-16 rounded-2xl border flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                <SpinnerIcon size={28} />
              </div>
            </div>
            <div className="w-48 h-4 bg-white/10 rounded-full animate-pulse" />
            <div className="w-32 h-3 bg-white/5 rounded-full animate-pulse mt-2" />
          </div>
        }>
          <AnalisarInner />
        </Suspense>
      </main>
    </div>
  )
}
