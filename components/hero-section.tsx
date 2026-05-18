"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { youtubeUrlSchema, buildAnalysisUrl } from "@/lib/validations"

// Strict type definitions
interface FormState {
  readonly url: string
  readonly isSubmitting: boolean
  readonly error: string | null
  readonly success: boolean
}

type FormAction =
  | { type: "SET_URL"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_SUCCESS"; payload: boolean }
  | { type: "RESET" }

const initialFormState: FormState = {
  url: "",
  isSubmitting: false,
  error: null,
  success: false,
}

export function HeroSection(): React.ReactElement {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [visible, setVisible] = useState<boolean>(false)
  const [scrollHidden, setScrollHidden] = useState<boolean>(false)

  // Destructure for cleaner code
  const { url, isSubmitting, error, success } = formState

  // Update form state helper
  const updateForm = useCallback((action: FormAction): void => {
    setFormState((prev) => {
      switch (action.type) {
        case "SET_URL":
          return { ...prev, url: action.payload, error: null }
        case "SET_ERROR":
          return { ...prev, error: action.payload }
        case "SET_SUBMITTING":
          return { ...prev, isSubmitting: action.payload }
        case "SET_SUCCESS":
          return { ...prev, success: action.payload }
        case "RESET":
          return initialFormState
        default:
          return prev
      }
    })
  }, [])

  // Initial fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  // Hide scroll hint after user scrolls
  useEffect(() => {
    let ticking = false
    const handleScroll = (): void => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 100) setScrollHidden(true)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Form submission handler with Zod validation
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault()

      // Validate input with Zod schema
      const validation = youtubeUrlSchema.safeParse(url)

      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message ?? "URL inválida"
        updateForm({ type: "SET_ERROR", payload: errorMessage })
        return
      }

      updateForm({ type: "SET_SUBMITTING", payload: true })
      updateForm({ type: "SET_SUCCESS", payload: true })

      // Redirect to analysis page after brief delay
      const redirectTimeout = setTimeout(() => {
        try {
          const analysisUrl = buildAnalysisUrl(validation.data)
          // @ts-expect-error - dynamic URL with query params
          router.push(analysisUrl)
        } catch (err) {
          updateForm({ type: "SET_ERROR", payload: "Erro ao processar URL" })
          updateForm({ type: "SET_SUBMITTING", payload: false })
          updateForm({ type: "SET_SUCCESS", payload: false })
        }
      }, 1500)

    },
    [url, router, updateForm]
  )

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      updateForm({ type: "SET_URL", payload: e.target.value })
    },
    [updateForm]
  )

  // Animation style helper
  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease`,
    pointerEvents: visible ? "auto" : "none",
  })

  return (
    <section
      id="inicio"
      className="relative flex flex-col items-center justify-center min-h-dvh px-6 text-center overflow-hidden"
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
      aria-label="Hero"
    >
      {/* Ambient radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 20%, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          ...fadeIn(0),
        }}
      >
        {/* Pulsing status dot */}
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          aria-hidden="true"
          style={{ background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.8)" }}
        />
        <span
          className="text-xs tracking-widest uppercase font-medium leading-4"
          style={{ color: "var(--text-muted)" }}
        >
          IA para criadores
        </span>
      </div>

      {/* H1 */}
      <h1
        className="font-black leading-none tracking-tight mb-6 text-balance"
        style={{
          fontSize: "clamp(2.75rem, 8vw, 7rem)",
          letterSpacing: "-0.03em",
          color: "#ffffff",
          ...fadeIn(100),
        }}
      >
        Onde o viral
        <br />
        <span style={{ color: "var(--text-subtle)" }}>se torna seu.</span>
      </h1>

      {/* Subtext */}
      <p
        className="max-w-xl mx-auto text-base leading-relaxed mb-12"
        style={{
          color: "var(--text-muted)",
          ...fadeIn(200),
        }}
      >
        Cole qualquer URL do YouTube e receba um roteiro adaptado para o mercado brasileiro —
        com ganchos virais, linguagem nativa e pronto para publicar.
      </p>

      {/* Input + CTA */}
      <div className="w-full max-w-2xl mx-auto" style={fadeIn(300)}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl transition-all duration-200"
          style={{
            background: "var(--glass-bg)",
            border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid var(--glass-border)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          aria-label="Analisar vídeo do YouTube"
          noValidate
        >
          <label htmlFor="youtube-url" className="sr-only">
            URL do YouTube
          </label>
          <input
            id="youtube-url"
            type="text"
            inputMode="url"
            value={url}
            onChange={handleInputChange}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none text-white font-sans min-w-0 disabled:opacity-50"
            style={{ caretColor: "#fff" }}
            aria-required="true"
            aria-invalid={error !== null}
            aria-describedby={error ? "url-error" : undefined}
            autoComplete="url"
            spellCheck={false}
            disabled={isSubmitting}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 px-7 py-3 rounded-xl text-sm font-semibold tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{
              background: "#ffffff",
              color: "#000000",
              minHeight: "48px",
              transition: "box-shadow 0.3s ease, transform 0.1s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting)
                e.currentTarget.style.boxShadow = "0 0 32px 6px rgba(255,255,255,0.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {isSubmitting ? "Analisando..." : "Analisar"}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <p id="url-error" className="text-xs mt-2 text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <div
            className="flex items-center justify-center gap-2 mt-3 text-sm font-medium"
            role="status"
            style={{ color: "#4ade80" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Roteiro sendo gerado! Redirecionando...
          </div>
        )}

        <p className="text-xs mt-3 leading-4" style={{ color: "var(--text-subtle)" }}>
          Sem cartão de crédito — análise grátis por 7 dias
        </p>
      </div>

      {/* Scroll hint — hidden after first scroll */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
        style={{
          opacity: visible && !scrollHidden ? 0.35 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        }}
      >
        <span
          className="text-xs tracking-widest uppercase font-medium leading-5"
          style={{ color: "var(--text-subtle)", fontSize: "11px" }}
        >
          scroll
        </span>
        <div
          className="h-8 w-px"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))",
          }}
        />
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          focusable="false"
          style={{ marginTop: "-2px" }}
          aria-hidden="true"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
