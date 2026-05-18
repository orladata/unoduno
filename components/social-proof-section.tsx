"use client"

import { useReveal } from "@/hooks/use-reveal"

const stats = [
  { value: "12.400+", label: "roteiros gerados", ariaLabel: "Mais de 12.400 roteiros gerados" },
  { value: "3.2x",    label: "aumento médio de views", ariaLabel: "3.2 vezes mais views em média" },
  { value: "47 seg",  label: "tempo médio de geração", ariaLabel: "47 segundos de tempo médio de geração" },
  { value: "98%",     label: "taxa de satisfação", ariaLabel: "98 por cento de taxa de satisfação" },
]

const testimonials = [
  {
    quote: "Passei de 2k para 38k inscritos em 3 meses usando só o Unoduno. Os hooks gerados são absurdamente bons.",
    name: "Carla Mendes",
    role: "Criadora de conteúdo",
    subs: "38k inscritos",
  },
  {
    quote: "Era tradutor manual por horas. Hoje colo a URL, pego o roteiro e gravo. Simples assim.",
    name: "Bruno Alves",
    role: "YouTuber de finanças",
    subs: "91k inscritos",
  },
  {
    quote: "A adaptação cultural é o que diferencia. Não é tradução — é naturalização. Meu público nunca percebe que o conteúdo veio do inglês.",
    name: "Tati Ramos",
    role: "Influenciadora lifestyle",
    subs: "204k inscritos",
  },
]

const STAT_DELAY_BASE = 60
const TESTIMONIAL_DELAY_BASE = 150
const TESTIMONIAL_DELAY_INCREMENT = 80

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
      style={{ background: "rgba(255,255,255,0.1)", color: "#fff", letterSpacing: "-0.02em" }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function SocialProofSection() {
  const { ref, visible } = useReveal(0.1)

  return (
    <section
      id="prova-social"
      ref={ref}
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
      className="px-6 max-w-6xl mx-auto"
      aria-label="Prova social"
    >
      {/* Stats row */}
      <div
        role="list"
        aria-label="Estatisticas"
        className="grid grid-cols-2 md:grid-cols-4 gap-px mb-20"
        style={{
          background: "var(--glass-border)",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            role="listitem"
            aria-label={stat.ariaLabel}
            className="flex flex-col items-center justify-center text-center py-8 px-4"
            style={{
              background: "#000",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.5s ${i * STAT_DELAY_BASE}ms ease, transform 0.5s ${i * STAT_DELAY_BASE}ms ease`,
              willChange: visible ? "auto" : "opacity, transform",
            }}
          >
            <span
              className="font-black leading-none mb-2"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em", color: "#fff" }}
            >
              {stat.value}
            </span>
            <span className="text-xs font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Data disclaimer */}
      <p
        className="text-center text-xs mb-16 leading-4"
        style={{
          color: "var(--text-subtle)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s 0.2s ease",
        }}
      >
        *Dados agregados de Mai/2026
      </p>

      {/* Section heading */}
      <div
        className="text-center mb-12"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease",
        }}
      >
        <p className="text-xs tracking-widest uppercase mb-4 font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
          Depoimentos
        </p>
        <h2
          className="font-black text-balance"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          Quem usa, não volta
          <br />
          <span style={{ color: "var(--text-subtle)" }}>para o processo antigo.</span>
        </h2>
      </div>

      {/* Testimonial cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((t, i) => {
          const delay = TESTIMONIAL_DELAY_BASE + i * TESTIMONIAL_DELAY_INCREMENT
          return (
            <figure
              key={t.name}
              className="rounded-2xl p-6 md:p-8 flex flex-col gap-5 cursor-default hover:bg-[rgba(255,255,255,0.08)]"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                pointerEvents: visible ? "auto" : "none",
                transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease, background 0.25s ease`,
              }}
            >
              {/* Stars — muted color to not be too bright */}
              <div className="flex gap-1" aria-label="5 estrelas" role="img">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-muted)" }} aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <blockquote>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-light)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>

              <figcaption className="flex items-center gap-3 mt-auto">
                <Avatar name={t.name} />
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs leading-4" style={{ color: "var(--text-subtle)" }}>
                    {t.role} — {t.subs}
                  </p>
                </div>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
