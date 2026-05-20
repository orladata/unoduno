"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"
import { createClient } from "@/utils/supabase/client"

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
    name: "Essencial",
    amount: 10,
    description: "Excelente para criadores esporádicos experimentarem a plataforma.",
    features: [
      { text: "R$ 10,00 em créditos de saldo", included: true },
      { text: "Análise completa de ~10 a 15 vídeos", included: true },
      { text: "Tradução neural US → BR inclusa", included: true },
      { text: "Exportação para 4 plataformas", included: true },
      { text: "Suporte padrão por e-mail", included: true },
    ],
    buttonText: "Recarregar R$ 10",
    popular: false,
    btnStyle: "secondary",
  },
  {
    name: "Criador Pro",
    badge: "Mais Vendido",
    amount: 50,
    description: "O melhor custo-benefício para canais com frequência ativa.",
    features: [
      { text: "R$ 50,00 em créditos de saldo", included: true },
      { text: "Análise completa de ~50 a 75 vídeos", included: true },
      { text: "Prioridade máxima de processamento", included: true },
      { text: "Exportação ilimitada de roteiros", included: true },
      { text: "Suporte premium via WhatsApp", included: true },
    ],
    buttonText: "Recarregar R$ 50",
    popular: true,
    btnStyle: "primary",
  },
  {
    name: "Agência & Produção",
    amount: 200,
    description: "Feito para produtoras de vídeo e gestores de múltiplos canais.",
    features: [
      { text: "R$ 200,00 em créditos de saldo", included: true },
      { text: "Análise completa de ~200 a 300 vídeos", included: true },
      { text: "Prioridade máxima em fila paralela", included: true },
      { text: "Mapeamento de até 5 marcas/canais", included: true },
      { text: "Gerente de conta dedicado 24/7", included: true },
    ],
    buttonText: "Recarregar R$ 200",
    popular: false,
    btnStyle: "secondary",
  },
]

export function PricingSection() {
  const { ref, visible } = useReveal(0.1)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCheckout = async (amount: number, pkgName: string) => {
    setErrorMsg(null)

    if (amount <= 0 || isNaN(amount)) {
      setErrorMsg("Por favor, selecione ou digite um valor de recarga válido.")
      return
    }

    if (amount < 5) {
      setErrorMsg("O valor mínimo para recargas é de R$ 5,00.")
      return
    }

    setLoadingPkg(pkgName)
    try {
      const supabase = createClient()
      
      // 1. Get user session to identify user ID
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !session.user) {
        // Redirect to login if user is not authenticated
        window.location.href = `/login?redirect=pricing&amount=${amount}`
        return
      }

      const userId = session.user.id

      // 2. Call POST API checkout endpoint to create Stripe checkout session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          userId,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Ocorreu um erro ao gerar a sessão de pagamento.")
        return
      }

      if (data.url) {
        // 3. Redirect user securely to Stripe
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg("Ocorreu um erro ao conectar com o servidor.")
    } finally {
      setLoadingPkg(null)
    }
  }

  return (
    <section
      id="precos"
      ref={ref}
      className="py-24 px-6 max-w-6xl mx-auto relative overflow-hidden"
      aria-label="Preços"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div
        className="text-center mb-16 relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p className="text-xs tracking-widest uppercase mb-4 font-semibold text-violet-400">
          Recarga Pré-Paga (Pay-as-you-go)
        </p>
        <h2
          className="font-black text-balance mb-4 text-white"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          Créditos simples e flexíveis.
          <br />
          <span className="text-neutral-500">Pague apenas pelo que usar.</span>
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Sem mensalidades ou assinaturas obrigatórias. Recarregue seu saldo de créditos pré-pagos e consuma conforme realiza análises de vídeo no painel.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 animate-fadeIn relative z-10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pricing Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch mb-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease",
        }}
      >
        {packages.map((pkg, index) => {
          const isHovered = hoveredCard === index
          const isPkgLoading = loadingPkg === pkg.name

          return (
            <div
              key={pkg.name}
              className={`rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                pkg.popular 
                  ? "bg-[#0f0f15]/85 border-violet-500/30 border-2" 
                  : "bg-white/[0.02] border-white/10 border"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: isHovered 
                  ? pkg.popular
                    ? "0 0 50px rgba(124, 58, 237, 0.12)"
                    : "0 0 40px rgba(255, 255, 255, 0.03)"
                  : "none",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 border border-violet-400/30 rounded-full shadow-lg">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-white">
                    {pkg.badge}
                  </span>
                </div>
              )}

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed min-h-[40px]">
                  {pkg.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-lg font-medium text-neutral-400 mb-1.5">R$</span>
                  <span className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
                    {pkg.amount}
                  </span>
                  <span className="text-xs text-neutral-400 mb-1">saldo</span>
                </div>
                <p className="text-[10px] text-violet-400 mt-2 font-medium">
                  Taxa única, recarga instantânea
                </p>
              </div>

              {/* Perks / Features */}
              <ul className="flex flex-col gap-3.5 mb-8 text-left border-t border-white/5 pt-6 flex-grow">
                {pkg.features.map((feature, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-xs leading-relaxed ${
                      feature.included ? "text-neutral-200" : "text-neutral-500 line-through decoration-white/10"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 mt-0.5 ${
                        feature.included 
                          ? pkg.popular 
                            ? "text-violet-400" 
                            : "text-white"
                          : "text-neutral-600"
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
                className={`w-full py-3.5 rounded-2xl text-xs font-bold tracking-wide active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  pkg.btnStyle === "primary"
                    ? "bg-white text-black hover:bg-neutral-100 shadow-xl disabled:bg-neutral-200"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10 disabled:opacity-50"
                }`}
                style={{
                  minHeight: "44px",
                  boxShadow: isHovered && pkg.btnStyle === "primary" && !isPkgLoading
                    ? "0 0 30px rgba(255, 255, 255, 0.2)"
                    : "none",
                }}
              >
                {isPkgLoading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  pkg.buttonText
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Custom Amount Reload Panel (Pacote Personalizado) */}
      <div
        className="max-w-2xl mx-auto rounded-3xl p-6 md:p-8 bg-white/[0.01] border border-white/5 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s 0.2s ease, transform 0.6s 0.2s ease",
        }}
      >
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-white mb-1">Recarga Personalizada</h4>
          <p className="text-xs text-neutral-400">Deseja carregar outro valor? Digite o saldo que deseja recarregar ao lado.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
              R$
            </span>
            <input
              type="number"
              placeholder="0,00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 w-full sm:w-[120px]"
              disabled={loadingPkg !== null}
              min="5"
            />
          </div>
          <button
            type="button"
            onClick={() => handleCheckout(Number(customAmount), "CustomAmount")}
            disabled={loadingPkg !== null || !customAmount}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-colors active:scale-[0.98] shrink-0 disabled:opacity-50 h-[40px] flex items-center justify-center min-w-[100px]"
          >
            {loadingPkg === "CustomAmount" ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Recarregar"
            )}
          </button>
        </div>
      </div>

      {/* Trust Badge */}
      <p className="text-center text-[10px] text-neutral-500 mt-12 relative z-10">
        Pagamentos 100% seguros processados via Stripe. Aceita Cartão de Crédito e Pix.
      </p>
    </section>
  )
}
