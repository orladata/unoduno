"use client"

import { useReveal } from "@/hooks/use-reveal"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"

const features = [
  {
    id: 1,
    label: "Neural Translation",
    desc: "Adapta linguagem americana para o sotaque, gírias e referências culturais do Brasil — de forma completamente natural.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    desc: "YouTube, Instagram Reels, TikTok e podcasts — com formatação ideal para cada plataforma.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
        <polyline points="8 7 3 12 8 17" />
      </svg>
    ),
    colSpan: "col-span-1 sm:col-span-2 md:col-span-2",
    large: true,
  },
]

function FeatureCard({ feature, variants }: { feature: any, variants: any }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.article
      variants={variants}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`${feature.colSpan} relative rounded-[2rem] p-8 flex flex-col gap-6 cursor-default group overflow-hidden bg-white/[0.02] border border-white/10 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.02)]`}
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      aria-label={feature.label}
    >
      {/* Spotlight Glow Effect (Linear Style) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10 text-slate-300 group-hover:text-white group-hover:bg-violet-600/20 group-hover:border-violet-500/50 group-hover:scale-110 transition-all duration-300 relative z-10 shadow-[0_0_0_rgba(139,92,246,0)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        aria-hidden="true"
      >
        {feature.icon}
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className={`font-bold tracking-tight text-white mb-2 ${feature.large ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}>
          {feature.label}
        </h3>
        <p className="text-[14px] md:text-[15px] leading-relaxed text-slate-400 font-medium group-hover:text-slate-300 transition-colors duration-300">
          {feature.desc}
        </p>
      </div>
    </motion.article>
  )
}

export function BentoSection() {
  const { ref, visible } = useReveal(0.1)

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <section
      id="funcionalidades"
      ref={ref}
      className="py-32 px-6 max-w-6xl mx-auto"
      aria-label="Funcionalidades"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={visible ? "visible" : "hidden"}
        className="w-full"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center mb-20">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-4 font-bold text-violet-400">
            A Vantagem Injusta
          </p>
          <h2 className="font-black text-4xl md:text-5xl lg:text-7xl tracking-tighter text-balance mb-4 text-white leading-[1.05]">
            Tudo que você precisa
            <br />
            <span className="text-slate-500">para dominar o feed.</span>
          </h2>
        </motion.div>

        {/* Grid: 1 col mobile -> 2 col tablet -> 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} variants={itemVariants} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
