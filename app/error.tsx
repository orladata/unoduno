"use client"

import { useEffect } from "react"
import Link from "next/link"

interface ErrorProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      console.error("Global error:", error.message, error.digest)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div
        className="w-full max-w-md text-center p-8 rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Error Icon */}
        <div
          className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Algo deu errado
        </h1>

        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Ocorreu um erro inesperado. Nossa equipe foi notificada e está
          trabalhando para resolver o problema.
        </p>

        {error.digest && (
          <p
            className="text-xs mb-6 font-mono px-3 py-2 rounded-lg"
            style={{
              color: "var(--text-subtle)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Código: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{
              background: "var(--accent-primary)",
              color: "#000",
              minHeight: "44px",
            }}
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "var(--text-primary)",
              minHeight: "44px",
            }}
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
