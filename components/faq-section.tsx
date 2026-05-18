"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"

const faqs = [
  {
    q: "Como funciona a tradução neural?",
    a: "Nossa IA não faz tradução literal — ela adapta o conteúdo para o contexto brasileiro, substituindo referências culturais, gírias e expressões para que o roteiro soe 100% nativo.",
  },
  {
    q: "Posso usar com vídeos de qualquer canal?",
    a: "Sim. Basta colar a URL de qualquer vídeo público do YouTube. A IA analisa o áudio, identifica os padrões de retenção e gera um roteiro adaptado.",
  },
  {
    q: "O conteúdo gerado é único?",
    a: "Completamente. Não copiamos legendas — reescrevemos o roteiro do zero usando as melhores práticas de storytelling e hooks virais para o mercado brasileiro.",
  },
  {
    q: "Quais plataformas são suportadas para export?",
    a: "YouTube (vídeos longos e Shorts), Instagram Reels, TikTok e podcasts. Cada formato tem tamanho de texto e tom de voz otimizados.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem fidelidade, sem multa. Cancele pelo painel em 2 cliques e você não será cobrado no próximo ciclo.",
  },
  {
    q: "Tem suporte em português?",
    a: "100%. Suporte prioritário via WhatsApp com tempo de resposta médio de 2 horas em horário comercial.",
  },
]

function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
  sectionVisible,
}: {
  faq: { q: string; a: string }
  isOpen: boolean
  onToggle: () => void
  index: number
  sectionVisible: boolean
}) {
  const delay = 100 + index * 50
  const questionId = `faq-q-${index}`
  const answerId = `faq-a-${index}`

  return (
    <div
      className="border-b"
      style={{
        borderColor: "var(--glass-border)",
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ${delay}ms ease, transform 0.5s ${delay}ms ease`,
        willChange: sectionVisible ? "auto" : "opacity, transform",
      }}
    >
      <button
        type="button"
        id={questionId}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm min-h-[56px]"
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <span className="text-sm font-medium text-white pr-4 leading-relaxed">{faq.q}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        className="grid transition-all duration-300"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed pb-5" style={{ color: "var(--text-muted)" }}>
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const { ref, visible } = useReveal(0.1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      ref={ref}
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
      className="px-6 max-w-2xl mx-auto"
      aria-label="Perguntas frequentes"
    >
      {/* Title */}
      <div
        className="text-center mb-12"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p className="text-xs tracking-widest uppercase mb-4 font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
          FAQ
        </p>
        <h2
          className="font-black text-balance"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          Perguntas frequentes
        </h2>
      </div>

      {/* FAQ list */}
      <div className="border-t" style={{ borderColor: "var(--glass-border)" }}>
        {faqs.map((faq, i) => (
          <FAQItem
            key={faq.q}
            faq={faq}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            index={i}
            sectionVisible={visible}
          />
        ))}
      </div>
    </section>
  )
}
