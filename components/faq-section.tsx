"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"
import { motion, AnimatePresence } from "framer-motion"

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
}: {
  faq: { q: string; a: string }
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  const panelId = `faq-panel-${index}`
  return (
    <motion.div
      initial={false}
      className="border-b border-white/10 overflow-hidden"
    >
      <button
        id={`faq-btn-${index}`}
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg min-h-[60px] group transition-colors"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="text-[15px] md:text-base font-semibold text-slate-200 group-hover:text-white transition-colors pr-6">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 text-slate-400 group-hover:text-white transition-colors"
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            role="region"
            aria-labelledby={`faq-btn-${index}`}
          >
            <p className="text-[14px] md:text-[15px] leading-relaxed text-slate-400 pb-6 pr-12">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const { ref, visible } = useReveal(0.1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <section
      id="faq"
      ref={ref}
      className="py-32 px-6 max-w-3xl mx-auto"
      aria-label="Perguntas frequentes"
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
            FAQ
          </p>
          <h2 className="font-black text-3xl md:text-5xl tracking-tighter text-balance text-white">
            Perguntas frequentes
          </h2>
        </motion.div>

        {/* FAQ list */}
        <motion.div variants={itemVariants} className="border-t border-white/10">
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.q}
              index={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
