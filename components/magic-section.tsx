"use client"

import { useEffect, useRef, useState } from "react"
import { useReveal } from "@/hooks/use-reveal"

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

  return (
    <section
      id="magica"
      ref={ref}
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
      className="px-6 max-w-4xl mx-auto"
      aria-label="Como funciona"
    >
      {/* Title */}
      <div
        className="text-center mb-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p className="text-xs tracking-widest uppercase mb-4 font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
          A Mágica
        </p>
        <h2
          id={headingId}
          className="font-black text-balance"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          De URL a roteiro
          <br />
          <span style={{ color: "var(--text-subtle)" }}>em segundos.</span>
        </h2>
      </div>

      {/* Terminal card */}
      <div
        className="rounded-3xl overflow-hidden"
        role="region"
        aria-labelledby={headingId}
        style={{
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.6s 0.2s ease, transform 0.6s 0.2s ease",
        }}
      >
        {/* Title bar */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid var(--glass-border)" }}
          aria-hidden="true"
        >
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--glass-border)" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--glass-border)" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--glass-border)" }} />
          </div>
          <span className="text-xs font-mono ml-2 leading-4" style={{ color: "var(--text-subtle)" }}>unoduno — roteiro.md</span>
        </div>

        {/* INPUT row */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <p
            className="text-xs font-mono font-semibold tracking-widest uppercase mb-3 leading-4"
            style={{ color: "var(--text-subtle)" }}
          >
            INPUT
          </p>
          <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
            youtube.com/watch?v=
            <span style={{ color: "#fff" }}>dQw4w9WgXcQ</span>
          </p>
          <p className="text-xs mt-1 font-mono leading-4" style={{ color: "var(--text-subtle)" }}>
            The 5 mistakes KILLING your YouTube channel
          </p>
        </div>

        {/* Processing pill */}
        <div
          className="flex items-center justify-center py-4"
          style={{
            opacity: phase === "idle" || phase === "done" ? 0.4 : 1,
            transition: "opacity 0.4s ease",
          }}
          aria-hidden="true"
        >
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide leading-4"
            style={{
              background: phase === "typing" || phase === "loading" 
                ? "var(--glass-hover)" 
                : "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: phase === "typing" || phase === "loading" ? "var(--text-muted)" : "var(--text-subtle)",
              transition: "background 0.3s ease, color 0.3s ease",
            }}
          >
            {phase === "loading" || phase === "typing" ? (
              <svg
                className="animate-spin"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
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
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span className="w-3 h-3" />
            )}
            {phase === "loading" && "Unoduno AI analisando..."}
            {phase === "typing" && "Gerando roteiro..."}
            {phase === "done" && "Concluído"}
            {phase === "idle" && "Aguardando..."}
          </div>
        </div>

        {/* OUTPUT row */}
        <div
          className="px-4 sm:px-6 py-5"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs font-mono font-semibold tracking-widest uppercase leading-4"
              style={{ color: "var(--text-subtle)" }}
            >
              OUTPUT
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium leading-4"
              style={{ background: "var(--glass-hover)", color: "var(--text-muted)" }}
            >
              pt-BR
            </span>
          </div>

          {/* Responsive height container */}
          <div
            ref={outputRef}
            className="min-h-[180px] md:h-[220px] overflow-y-auto"
            tabIndex={0}
            aria-label="Roteiro gerado — use as teclas de seta para rolar"
          >
            <pre
              className="font-mono text-sm leading-relaxed"
              style={{ color: "var(--text-light)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {outputLines.slice(0, linesShown).map((line, i) => (
                <div key={i}>
                  {line.type === "comment" ? (
                    <span style={{ color: "var(--text-subtle)" }}>{line.text}</span>
                  ) : line.type === "label" ? (
                    <span style={{ color: "var(--text-muted)" }}>{line.text}</span>
                  ) : line.type === "blank" ? (
                    <span>&nbsp;</span>
                  ) : (
                    <span style={{ color: "var(--text-light)" }}>{line.text}</span>
                  )}
                </div>
              ))}
              {phase === "typing" && linesShown < outputLines.length && (
                <span className="blink-cursor" aria-hidden="true" />
              )}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
