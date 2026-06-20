"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

interface PlanFeature {
  text: string
  included: boolean
}

interface PrepaidPackage {
  name: string
  badge?: string
  amount: number
  description: string
  features: PlanFeature[]
  buttonText: string
  popular: boolean
  btnStyle: "primary" | "secondary"
}

const packages: PrepaidPackage[] = [
  {
    name: "Iniciante (Free)",
    amount: 0,
    description: "Excelente para testar o poder do motor neural Unoduno.",
    features: [
      { text: "3 Análises Completas gratuitas", included: true },
      { text: "Acesso ao Avaliador Neural", included: false },
      { text: "Acesso à Máquina de Cortes", included: false },
      { text: "Sem exportação de PDF", included: false },
    ],
    buttonText: "Começar de Graça",
    popular: false,
    btnStyle: "secondary",
  },
  {
    name: "Criador Pro",
    badge: "Mais Vendido",
    amount: 47,
    description: "A máquina de retenção para criadores de conteúdo sérios.",
    features: [
      { text: "Análises ilimitadas (Motor Rápido)", included: true },
      { text: "Gerador de Ganchos Ilimitado", included: true },
      { text: "Acesso ao Avaliador Neural", included: true },
      { text: "Exportação em PDF Profissional", included: true },
      { text: "Acesso antecipado a novas IAs", included: true },
    ],
    buttonText: "Assinar Criador Pro",
    popular: true,
    btnStyle: "primary",
  },
  {
    name: "Agência Premium",
    amount: 197,
    description: "Poder computacional máximo para equipes e canais dark.",
    features: [
      { text: "Tudo do plano Criador", included: true },
      { text: "Acesso ao Motor Premium 3.1 Pro", included: true },
      { text: "Máquina de Cortes Long-form", included: true },
      { text: "Análise avançada para até 5 marcas", included: true },
      { text: "Gerente de conta dedicado 24/7", included: true },
    ],
    buttonText: "Assinar Agência",
    popular: false,
    btnStyle: "secondary",
  },
]

export function PricingSection() {
  const { ref, visible } = useReveal(0.1)
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)

  const handleCheckout = async (amount: number, pkgName: string) => {
    setErrorMsg(null)

    if (amount === 0) {
      window.location.href = "/dashboard"
      return
    }

    setLoadingPkg(pkgName)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !session.user) {
        window.location.href = `/login?redirect=pricing&plan=${pkgName}`
        return
      }

      const userId = session.user.id

      // Usando a rota já existente de checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userId, plan: pkgName }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Ocorreu um erro ao gerar a sessão de pagamento.")
        setShakeKey(k => k + 1)
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50])
        return
      }

      if (data.url) {
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(100)
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg("Ocorreu um erro ao conectar com o servidor.")
      setShakeKey(k => k + 1)
    } finally {
      setLoadingPkg(null)
    }
  }

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <section
      id="precos"
      ref={ref}
      className="py-32 px-6 max-w-6xl mx-auto relative overflow-hidden"
      aria-label="Preços"
    >
      {/* Background radial glow - Neon Green */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff41]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={visible ? "visible" : "hidden"}
        className="w-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 relative z-10">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-4 font-bold text-[#00ff41]/70">
            Escalabilidade Ilimitada
          </p>
          <h2 className="font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter text-balance mb-4 text-white leading-[1.05]">
            Planos feitos para criadores.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff41] to-[#00dd3d]">Do primeiro viral ao império.</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Experimente de graça. Escolha o plano ideal para a sua necessidade e desbloqueie o arsenal de inteligência artificial completo da Unoduno.
          </p>
        </motion.div>

        {/* Global Error Banner */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              key={shakeKey}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: [-10, 10, -10, 10, 0] }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto mb-10 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-[13px] font-medium flex items-center gap-3 backdrop-blur-md shadow-[0_4px_24px_rgba(239,68,68,0.15)] relative z-10"
              role="alert"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch mb-8">
          {packages.map((pkg, i) => {
            const isPkgLoading = loadingPkg === pkg.name

            return (
              <motion.div
                key={pkg.name}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`rounded-xl p-8 flex flex-col justify-between relative group ${
                  pkg.popular 
                    ? "bg-[#00ff41]/8 border border-[#00ff41]/40 shadow-[0_0_40px_rgba(0,255,65,0.15)]" 
                    : "bg-white/[0.02] border border-[#00ff41]/10"
                }`}
                style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00ff41] rounded-full shadow-lg">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-black">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                {/* Title & Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed min-h-[40px]">
                    {pkg.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-medium text-slate-400 mb-1.5">R$</span>
                    <span className="text-5xl font-black text-white leading-none tracking-tighter">
                      {pkg.amount}
                    </span>
                    <span className="text-xs text-slate-400 mb-1 font-medium">/mês</span>
                  </div>
                  <p className="text-[11px] text-[#00ff41] mt-2 font-semibold">
                    {pkg.amount === 0 ? "Acesso imediato" : "Cancele quando quiser"}
                  </p>
                </div>

                {/* Perks / Features */}
                <ul className="flex flex-col gap-3.5 mb-8 text-left border-t border-white/5 pt-6 flex-grow">
                  {pkg.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-3 text-[13px] leading-relaxed font-medium ${
                        feature.included ? "text-slate-200" : "text-slate-600 line-through decoration-slate-700"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 mt-[2px] ${
                          feature.included 
                            ? pkg.popular ? "text-[#00ff41]" : "text-white"
                            : "text-slate-700"
                        }`}
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Call to Action Button */}
                <button
                  type="button"
                  onClick={() => handleCheckout(pkg.amount, pkg.name)}
                  disabled={loadingPkg !== null}
                  className={`w-full h-12 rounded-lg text-sm font-bold tracking-wide active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    pkg.btnStyle === "primary"
                      ? "bg-[#00ff41] text-black hover:bg-[#00ff41]/90 shadow-[0_0_20px_rgba(0,255,65,0.3)] group-hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] disabled:bg-[#00ff41]/50"
                      : "bg-[#00ff41]/10 text-[#00ff41] hover:bg-[#00ff41]/20 border border-[#00ff41]/30 disabled:opacity-50"
                  }`}
                >
                  {isPkgLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    pkg.buttonText
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Badge */}
        <motion.p variants={itemVariants} className="text-center text-[11px] font-medium text-slate-500 mt-12 relative z-10">
          Pagamentos 100% seguros processados via Stripe. Cancele sua assinatura a qualquer momento.
        </motion.p>
      </motion.div>
    </section>
  )
}
