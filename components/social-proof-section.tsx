"use client"

import { useReveal } from "@/hooks/use-reveal"
import { motion } from "framer-motion"

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

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-white/10 text-white border border-white/5"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function SocialProofSection() {
  const { ref, visible } = useReveal(0.1)

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
      id="prova-social"
      ref={ref}
      className="py-32 px-6 max-w-6xl mx-auto"
      aria-label="Prova social"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={visible ? "visible" : "hidden"}
        className="w-full"
      >
        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          role="list"
          aria-label="Estatisticas"
          className="grid grid-cols-2 md:grid-cols-4 gap-px mb-20 rounded-[2rem] overflow-hidden bg-white/10 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.02)]"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              role="listitem"
              aria-label={stat.ariaLabel}
              variants={itemVariants}
              className="flex flex-col items-center justify-center text-center py-10 px-4 bg-black/60 backdrop-blur-xl hover:bg-black/40 transition-colors"
            >
              <span className="font-black leading-none mb-3 text-3xl md:text-4xl text-white tracking-tighter">
                {stat.value}
              </span>
              <span className="text-[13px] font-semibold text-slate-400">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Data disclaimer */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[11px] font-medium text-slate-500 mb-20"
        >
          *Dados agregados de Mai/2026
        </motion.p>

        {/* Section heading */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-4 font-bold text-slate-500">
            Depoimentos
          </p>
          <h2 className="font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter text-balance mb-4 text-white leading-[1.05]">
            Quem usa, não volta
            <br />
            <span className="text-slate-500">para o processo antigo.</span>
          </h2>
        </motion.div>

        {/* Marquee Testimonials */}
        <motion.div variants={itemVariants} className="relative w-full overflow-hidden rounded-[2rem] py-4">
          {/* Fading Edges */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            className="flex gap-6 w-max"
          >
            {/* Duplicate array to create seamless loop */}
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
              <figure
                key={`${t.name}-${idx}`}
                className="w-[350px] shrink-0 rounded-[2rem] p-8 flex flex-col gap-6 bg-white/[0.02] border border-white/10 hover:border-violet-500/30 transition-colors duration-300 shadow-[0_0_40px_rgba(255,255,255,0.02)] group"
                style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
              >
                {/* Stars */}
                <div className="flex gap-1" aria-label="5 estrelas" role="img">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <svg key={si} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-violet-500 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" style={{ transitionDelay: `${si * 50}ms` }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                <blockquote className="flex-grow">
                  <p className="text-[15px] leading-relaxed text-slate-300 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>

                <figcaption className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                  <Avatar name={t.name} />
                  <div>
                    <p className="text-[14px] font-bold text-white mb-0.5">{t.name}</p>
                    <p className="text-[12px] text-slate-400 font-medium">
                      {t.role} — <span className="text-violet-400">{t.subs}</span>
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
