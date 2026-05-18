"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"

const perks = [
  "Análises ilimitadas de URLs",
  "Tradução neural US → BR",
  "Reconhecimento de padrões virais",
  "Hook engineering automático",
  "Export para 4 plataformas",
  "Suporte prioritário via WhatsApp",
]

export function PricingSection() {
  const { ref, visible } = useReveal(0.15)
  const [hovered, setHovered] = useState(false)

  return (
    <section
      id="precos"
      ref={ref}
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
      className="px-6 max-w-xl mx-auto text-center"
      aria-label="Preços"
    >
      {/* Title */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p className="text-xs tracking-widest uppercase mb-4 font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
          Preço
        </p>
        <h2
          className="font-black text-balance mb-8"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          Um plano.
          <br />
          <span style={{ color: "var(--text-subtle)" }}>Sem surpresas.</span>
        </h2>
      </div>

      {/* Card */}
      <div
        className="rounded-3xl p-6 md:p-8"
        style={{
          background: hovered ? "var(--glass-hover)" : "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: hovered ? "0 0 80px rgba(255,255,255,0.04)" : "none",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          pointerEvents: visible ? "auto" : "none",
          transition:
            "opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease, background 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Plan badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-8"
          style={{
            background: "var(--glass-hover)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <span
            className="text-xs tracking-widest uppercase font-semibold leading-4"
            style={{ color: "var(--text-muted)" }}
          >
            Premium
          </span>
        </div>

        {/* Price — clamp prevents overflow on small screens */}
        <div className="mb-8">
          <div className="flex items-end justify-center gap-1" aria-label="R$ 97 por mês">
            <span
              className="text-lg font-medium"
              style={{ color: "var(--text-muted)", marginBottom: "6px" }}
              aria-hidden="true"
            >
              R$
            </span>
            <span
              className="font-black leading-none"
              style={{
                fontSize: "clamp(4rem, 12vw, 5.5rem)",
                letterSpacing: "-0.05em",
                color: "#fff",
              }}
              aria-hidden="true"
            >
              97
            </span>
            <span
              className="text-base font-medium"
              style={{ color: "var(--text-muted)", marginBottom: "12px" }}
              aria-hidden="true"
            >
              /mês
            </span>
          </div>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-subtle)" }}>
            Cancele quando quiser. Sem fidelidade.
          </p>
        </div>

        {/* Perks */}
        <ul className="flex flex-col gap-3.5 mb-10 text-left" aria-label="O que está incluído">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#fff", flexShrink: 0 }}
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ color: "var(--text-light)" }}>{perk}</span>
            </li>
          ))}
        </ul>

        {/* CTA — large touch target (min 48px height), active state */}
        <button
          className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] transition-all duration-200 hover:bg-white/95"
          style={{
            background: "#ffffff",
            color: "#000000",
            minHeight: "48px",
            boxShadow: hovered ? "0 0 48px 8px rgba(255,255,255,0.18)" : "none",
          }}
          aria-label="Começar 7 dias grátis — sem cartão de crédito"
        >
          Começar agora
        </button>

        <p className="text-xs mt-4 leading-4" style={{ color: "var(--text-subtle)" }}>
          7 dias grátis — Sem cartão de crédito
        </p>
      </div>
    </section>
  )
}
