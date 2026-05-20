"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"
import { createCheckoutSession } from "./pricing-actions"

interface PlanFeature {
  text: string
  included: boolean
}

interface PricingPlan {
  name: string
  badge?: string
  priceMonthly: number
  priceAnnual: number
  priceIdMonthly?: string
  priceIdAnnual?: string
  description: string
  features: PlanFeature[]
  buttonText: string
  popular: boolean
  btnStyle: "primary" | "secondary"
}

// Map plans and bind Price IDs from environment variables for Stripe checkout
const plans: PricingPlan[] = [
  {
    name: "Starter",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Ideal para criadores iniciantes experimentarem o poder da IA.",
    features: [
      { text: "3 análises de vídeos por mês", included: true },
      { text: "Tradução básica US → BR", included: true },
      { text: "Limite de 10 minutos por vídeo", included: true },
      { text: "Hook engineering automático", included: false },
      { text: "Suporte prioritário via WhatsApp", included: false },
    ],
    buttonText: "Começar Grátis",
    popular: false,
    btnStyle: "secondary",
  },
  {
    name: "Pro",
    badge: "Mais Popular",
    priceMonthly: 97,
    priceAnnual: 77,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "",
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "",
    description: "Para criadores sérios que querem viralizar com consistência.",
    features: [
      { text: "Análises ilimitadas de URLs", included: true },
      { text: "Tradução neural US → BR premium", included: true },
      { text: "Hook engineering ilimitado", included: true },
      { text: "Exportação para 4 plataformas", included: true },
      { text: "Suporte prioritário via WhatsApp", included: true },
    ],
    buttonText: "Assinar Plano Pro",
    popular: true,
    btnStyle: "primary",
  },
  {
    name: "Agência",
    priceMonthly: 247,
    priceAnnual: 197,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY || "",
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_ANNUAL || "",
    description: "Escala total de roteiros para produtoras e agências de conteúdo.",
    features: [
      { text: "Tudo no Pro incluído", included: true },
      { text: "Mapeamento de até 5 canais", included: true },
      { text: "Exportação em lote de roteiros", included: true },
      { text: "Gerenciamento de marcas", included: true },
      { text: "Suporte dedicado 24/7", included: true },
    ],
    buttonText: "Assinar Plano Agência",
    popular: false,
    btnStyle: "secondary",
  },
]

export function PricingSection() {
  const { ref, visible } = useReveal(0.1)
  const [isAnnual, setIsAnnual] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCheckout = async (plan: PricingPlan) => {
    setErrorMsg(null)

    if (plan.name === "Starter") {
      window.location.href = "/login?signup=true"
      return
    }

    const priceId = isAnnual ? plan.priceIdAnnual : plan.priceIdMonthly

    if (!priceId) {
      setErrorMsg(`Erro: Stripe Price ID não configurado para o plano ${plan.name} (${isAnnual ? 'Anual' : 'Mensal'}) nas variáveis de ambiente.`)
      return
    }

    setLoadingPlan(plan.name)
    try {
      const res = await createCheckoutSession(priceId)
      
      if (res.error === "AUTH_REQUIRED") {
        window.location.href = res.url || "/login"
        return
      }

      if (res.error) {
        setErrorMsg(res.error)
        return
      }

      if (res.url) {
        window.location.href = res.url
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg("Ocorreu um erro ao iniciar a sessão de pagamento.")
    } finally {
      setLoadingPlan(null)
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
          Preços e Planos
        </p>
        <h2
          className="font-black text-balance mb-4 text-white"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          Escolha o plano ideal para
          <br />
          <span className="text-neutral-500">acelerar sua viralização.</span>
        </h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8">
          Preços simples, sem contratos ou taxas ocultas. Cancele ou altere sua assinatura quando quiser.
        </p>

        {/* Toggle Billing Selector */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
              !isAnnual 
                ? "bg-white text-black shadow-md" 
                : "text-white/60 hover:text-white"
            }`}
            disabled={loadingPlan !== null}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 flex items-center gap-1.5 ${
              isAnnual 
                ? "bg-white text-black shadow-md" 
                : "text-white/60 hover:text-white"
            }`}
            disabled={loadingPlan !== null}
          >
            Anual
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-violet-600 text-white rounded-full">
              -20%
            </span>
          </button>
        </div>
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease",
        }}
      >
        {plans.map((plan, index) => {
          const currentPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly
          const isHovered = hoveredCard === index
          const isPlanLoading = loadingPlan === plan.name

          return (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular 
                  ? "bg-[#0f0f15]/85 border-violet-500/30 border-2" 
                  : "bg-white/[0.02] border-white/10 border"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: isHovered 
                  ? plan.popular
                    ? "0 0 50px rgba(124, 58, 237, 0.12)"
                    : "0 0 40px rgba(255, 255, 255, 0.03)"
                  : "none",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 border border-violet-400/30 rounded-full shadow-lg">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-lg font-medium text-neutral-400 mb-1.5">R$</span>
                  <span className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
                    {currentPrice}
                  </span>
                  {currentPrice > 0 && (
                    <span className="text-xs text-neutral-400 mb-1">/mês</span>
                  )}
                </div>
                {isAnnual && currentPrice > 0 && (
                  <p className="text-[10px] text-violet-400 mt-2 font-medium">
                    Cobrado anualmente (R$ {currentPrice * 12}/ano)
                  </p>
                )}
                {currentPrice === 0 && (
                  <p className="text-[10px] text-neutral-500 mt-2 font-medium">
                    Acesso limitado sem cartão
                  </p>
                )}
              </div>

              {/* Perks / Features */}
              <ul className="flex flex-col gap-3.5 mb-8 text-left border-t border-white/5 pt-6 flex-grow">
                {plan.features.map((feature, i) => (
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
                          ? plan.popular 
                            ? "text-violet-400" 
                            : "text-white"
                          : "text-neutral-600"
                      }`}
                      aria-hidden="true"
                    >
                      {feature.included ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                      )}
                    </svg>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* Call to Action Button */}
              <button
                type="button"
                onClick={() => handleCheckout(plan)}
                disabled={loadingPlan !== null}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold tracking-wide active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  plan.btnStyle === "primary"
                    ? "bg-white text-black hover:bg-neutral-100 shadow-xl disabled:bg-neutral-200"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10 disabled:opacity-50"
                }`}
                style={{
                  minHeight: "44px",
                  boxShadow: isHovered && plan.btnStyle === "primary" && !isPlanLoading
                    ? "0 0 30px rgba(255, 255, 255, 0.2)"
                    : "none",
                }}
              >
                {isPlanLoading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Trust Badge */}
      <p className="text-center text-[10px] text-neutral-500 mt-12 relative z-10">
        Pagamentos 100% seguros processados via Stripe. Cancele sua assinatura a qualquer momento.
      </p>
    </section>
  )
}
