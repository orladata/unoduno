"use client"

import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useRouter } from "next/navigation"

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [objective, setObjective] = useState<string | null>(null)
  const [volume, setVolume] = useState<string | null>(null)
  const router = useRouter()

  const handleNext = () => {
    if (step < 3) setStep((prev) => (prev + 1) as Step)
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Indicator */}
      <div className="absolute top-12 flex gap-2 z-10">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? "bg-violet-500 w-12" : "bg-white/10 w-6"}`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Qual seu objetivo principal?</h1>
              <p className="text-sm text-white/50 mb-8">Isso nos ajuda a personalizar sua dashboard.</p>

              <div className="flex flex-col gap-3">
                {[
                  { id: "estudar", icon: "🧠", title: "Estudar Virais", desc: "Quero fazer engenharia reversa do que funciona." },
                  { id: "criar", icon: "🎬", title: "Criar Conteúdo", desc: "Quero usar a IA para roteirizar meus vídeos." },
                  { id: "dublar", icon: "🎙️", title: "Dublar & Traduzir", desc: "Quero adaptar vídeos gringos para o Brasil." }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setObjective(opt.id)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                      objective === opt.id 
                        ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="text-2xl mt-0.5">{opt.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{opt.title}</h3>
                      <p className="text-xs text-white/50">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!objective}
                className="mt-8 py-4 rounded-xl font-bold bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col">
              <button onClick={() => setStep(1)} className="self-start mb-6 text-xs font-semibold text-white/40 hover:text-white transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                Voltar
              </button>
              
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Qual seu volume de produção?</h1>
              <p className="text-sm text-white/50 mb-8">Para recomendarmos o limite de créditos ideal.</p>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "baixo", title: "Iniciante (1-10/mês)", desc: "Estou começando a testar formatos." },
                  { id: "medio", title: "Consistente (11-30/mês)", desc: "Posto de 3 a 5 vídeos por semana." },
                  { id: "alto", title: "Máquina Viral (30+/mês)", desc: "Tenho múltiplos canais ou posto diariamente." }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setVolume(opt.id)}
                    className={`flex flex-col p-5 rounded-2xl border text-left transition-all ${
                      volume === opt.id 
                        ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <h3 className="text-sm font-bold text-white mb-1">{opt.title}</h3>
                    <p className="text-xs text-white/50">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!volume}
                className="mt-8 py-4 rounded-xl font-bold bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-3">Tudo pronto!</h1>
              <p className="text-sm text-white/50 max-w-sm mb-10 leading-relaxed">
                Seu motor de inteligência viral está configurado e pronto para analisar o primeiro vídeo.
              </p>

              <button
                onClick={handleFinish}
                className="w-full py-4 rounded-xl font-bold bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95"
              >
                Ir para o Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
