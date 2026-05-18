"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"

const features = [
  {
    id: 1,
    label: "Neural Translation",
    desc: "Adapta linguagem americana para o sotaque, gírias e referências culturais do Brasil — de forma completamente natural.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <path d="M12 3a14.5 14.5 0 0 1 0 18" />
        <path d="M12 3a14.5 14.5 0 0 0 0 18" />
      </svg>
    ),
    colSpan: "col-span-1 sm:col-span-2 md:col-span-2",
    large: true,
  },
  {
    id: 2,
    label: "Pattern Recognition",
    desc: "Identifica os gatilhos de retenção que fazem o vídeo original performar e os replica no roteiro.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    colSpan: "col-span-1",
    large: false,
  },
  {
    id: 3,
    label: "Hook Engineering",
    desc: "Introduções virais nos primeiros 3 segundos para maximizar CTR e watch-time.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    colSpan: "col-span-1",
    large: false,
  },
  {
    id: 4,
    label: "Multi-Platform Export",
    desc: "YouTube, Instagram Reels, TikTok e podcasts — com formatação e tamanho de texto ideal para cada plataforma.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
        <polyline points="8 7 3 12 8 17" />
      </svg>
    ),
    colSpan: "col-span-1 sm:col-span-2 md:col-span-2",
    large: true,
  },
]

const DELAY_BASE = 80

function BentoCard({
  feature,
  index,
  sectionVisible,
}: {
  feature: (typeof features)[0]
  index: number
  sectionVisible: boolean
}) {
  const delay = index * DELAY_BASE

  return (
    <article
      className={`${feature.colSpan} relative rounded-2xl p-6 md:p-8 flex flex-col gap-6 focus-within:ring-2 focus-within:ring-white/30 hover:bg-[rgba(255,255,255,0.08)]`}
      aria-label={feature.label}
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? "translateY(0)" : "translateY(24px)",
        pointerEvents: sectionVisible ? "auto" : "none",
        transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease, background 0.25s ease`,
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color: "#fff",
        }}
        aria-hidden="true"
      >
        {feature.icon}
      </div>

      <div>
        <h3
          className="font-semibold tracking-tight text-white mb-2"
          style={{ fontSize: feature.large ? "1.1rem" : "1rem", letterSpacing: "-0.03em" }}
        >
          {feature.label}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {feature.desc}
        </p>
      </div>
    </article>
  )
}

export function BentoSection() {
  const { ref, visible } = useReveal(0.1)

  return (
    <section
      id="funcionalidades"
      ref={ref}
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
      className="px-6 max-w-6xl mx-auto"
      aria-label="Funcionalidades"
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
          Funcionalidades
        </p>
        <h2
          className="font-black text-balance"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          Tudo que você precisa
          <br />
          <span style={{ color: "var(--text-subtle)" }}>para dominar o feed.</span>
        </h2>
      </div>

      {/* Grid: 1 col mobile -> 2 col tablet -> 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <BentoCard key={f.id} feature={f} index={i} sectionVisible={visible} />
        ))}
      </div>
    </section>
  )
}
