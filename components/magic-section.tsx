"use client"

import { useEffect, useRef, useState } from "react"
import { useReveal } from "@/hooks/use-reveal"
import { motion } from "framer-motion"

const outputLines = [
  { type: "comment", text: "// ROTEIRO GERADO — Unoduno AI" },
  { type: "label",   text: 'titulo: "Os 5 erros que estão te impedindo de crescer"' },
  { type: "blank",   text: "" },
  { type: "label",   text: "GANCHO_ABERTURA:" },
  { type: "text",    text: '  "Você sabe por que 97% dos criadores nunca chegam a 10k?"' },
  { type: "blank",   text: "" },
  { type: "label",   text: "ARGUMENTO_PRINCIPAL:" },
  { type: "text",    text: "  → Erro #1: Conteúdo sem identidade clara" },
  { type: "text",    text: "  → Erro #2: Frequência inconsistente de postagem" },
  { type: "text",    text: "  → Erro #3: Thumbnails que não geram curiosidade" },
  { type: "blank",   text: "" },
  { type: "label",   text: "CTA_FINAL:" },
  { type: "text",    text: '  "Salva esse vídeo — você vai precisar amanhã."' },
  { type: "blank",   text: "" },
  { type: "comment", text: "// plataformas: YouTube · Reels · TikTok" },
]

type Phase = "idle" | "loading" | "typing" | "done"

export function MagicSection() {
  const { ref, visible } = useReveal(0.2)
  const [phase, setPhase] = useState<Phase>("idle")
  const [linesShown, setLinesShown] = useState(0)
  const hasStarted = useRef(false)
  const outputRef = useRef<HTMLDivElement>(null)
  const headingId = "magic-terminal-heading"

  useEffect(() => {
    if (!visible || hasStarted.current) return
    hasStarted.current = true

    setPhase("loading")
    let intervalId: ReturnType<typeof setInterval> | null = null

    const loadingTimeout = setTimeout(() => {
      setPhase("typing")
      let i = 0
      intervalId = setInterval(() => {
        i++
        setLinesShown(i)
        
        // Auto scroll terminal to bottom
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight
        }

        if (i >= outputLines.length) {
          if (intervalId) clearInterval(intervalId)
          setPhase("done")
        }
      }, 95)
    }, 1200)

    return () => {
      clearTimeout(loadingTimeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [visible])

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <section
      id="magica"
      ref={ref}
      className="py-32 px-6 max-w-4xl mx-auto"
      aria-label="Como funciona"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={visible ? "visible" : "hidden"}
        className="w-full"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-4 font-bold text-slate-500">
            A Mágica
          </p>
          <h2
            id={headingId}
            className="font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter text-balance mb-4 text-white leading-[1.05]"
          >
            De URL a roteiro
            <br />
            <span className="text-slate-500">em segundos.</span>
          </h2>
        </motion.div>

        {/* Terminal card */}
        <motion.div
          variants={itemVariants}
          className={`rounded-[2rem] overflow-hidden bg-black/40 border transition-all duration-1000 ${
            phase === "typing"
              ? "border-violet-500/50 shadow-[0_0_80px_rgba(139,92,246,0.3)]"
              : phase === "done"
              ? "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
              : "border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.03)]"
          }`}
          role="region"
          aria-labelledby={headingId}
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          {/* Title bar */}
          <div className="px-6 py-4 flex items-center gap-3 border-b border-white/10 bg-white/5" aria-hidden="true">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono ml-2 text-slate-400 font-medium tracking-wide">unoduno — gerar_roteiro.ts</span>
          </div>

          {/* INPUT row */}
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <p className="text-[11px] font-mono font-bold tracking-widest uppercase mb-3 text-violet-400">
              INPUT
            </p>
            <p className="font-mono text-sm text-slate-400 flex items-center gap-2">
              <span className="text-slate-500">$</span> unoduno analyze
              <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded">youtube.com/watch?v=dQw4w9WgXcQ</span>
            </p>
            <p className="text-xs mt-3 font-mono text-slate-500 pl-5 border-l-2 border-white/10">
              Capturing transcript: "The 5 mistakes KILLING your YouTube channel"
            </p>
          </div>

          {/* Processing pill */}
          <div
            className="flex items-center justify-center py-6 bg-black/20"
            style={{
              opacity: phase === "idle" || phase === "done" ? 0.4 : 1,
              transition: "opacity 0.4s ease",
            }}
            aria-hidden="true"
          >
            <div
              className={`flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                phase === "typing" || phase === "loading"
                  ? "bg-violet-500/10 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "bg-white/5 text-slate-500 border border-white/5"
              }`}
            >
              {phase === "loading" || phase === "typing" ? (
                <svg
                  className="animate-spin text-violet-400"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 2v4" opacity="1" />
                  <path d="M12 18v4" opacity="0.3" />
                  <path d="M4.93 4.93l2.83 2.83" opacity="0.9" />
                  <path d="M16.24 16.24l2.83 2.83" opacity="0.25" />
                  <path d="M2 12h4" opacity="0.7" />
                  <path d="M18 12h4" opacity="0.2" />
                  <path d="M4.93 19.07l2.83-2.83" opacity="0.5" />
                  <path d="M16.24 7.76l2.83-2.83" opacity="0.15" />
                </svg>
              ) : phase === "done" ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className="w-3.5 h-3.5" />
              )}
              {phase === "loading" && "Unoduno AI analisando retenção..."}
              {phase === "typing" && "Reescrevendo ganchos para pt-BR..."}
              {phase === "done" && "Concluído em 4.2s"}
              {phase === "idle" && "Aguardando..."}
            </div>
          </div>

          {/* OUTPUT row */}
          <div className="px-5 sm:px-8 py-6 border-t border-white/5 bg-black/40">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400">
                OUTPUT
              </span>
              <span className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 uppercase">
                pt-BR
              </span>
            </div>

            {/* Responsive height container */}
            <div
              ref={outputRef}
              className="min-h-[220px] md:h-[260px] overflow-y-auto scroll-smooth pr-2"
              tabIndex={0}
              aria-label="Roteiro gerado — use as teclas de seta para rolar"
            >
              <pre
                className="font-mono text-[13px] md:text-sm leading-[1.8]"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              >
                {outputLines.slice(0, linesShown).map((line, i) => (
                  <div key={i} className="mb-0.5">
                    {line.type === "comment" ? (
                      <span className="text-slate-500 italic">{line.text}</span>
                    ) : line.type === "label" ? (
                      <span className="text-blue-400 font-semibold">{line.text}</span>
                    ) : line.type === "blank" ? (
                      <span className="block h-2">&nbsp;</span>
                    ) : (
                      <span className="text-slate-300">{line.text}</span>
                    )}
                  </div>
                ))}
                {phase === "typing" && linesShown < outputLines.length && (
                  <span className="blink-cursor inline-block w-2 h-4 bg-violet-400 ml-1 translate-y-1 shadow-[0_0_8px_rgba(139,92,246,0.8)]" aria-hidden="true" />
                )}
              </pre>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
