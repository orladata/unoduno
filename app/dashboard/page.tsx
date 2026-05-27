"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useProfile } from "./profile-context"
import { AnalysisDemo } from "@/components/analysis-demo"

export default function DashboardPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const profile = useProfile()
  const isAdmin = profile?.email === "sonarycorporation@gmail.com"
  const outOfQuota = isAdmin ? false : (profile ? profile.credit_balance < 100 : false)
  const creditsRemaining = isAdmin ? "Ilimitado" : (profile?.credit_balance ? Math.floor(profile.credit_balance / 100) : 0)

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    if (outOfQuota) {
      router.push("/#precos")
      return
    }
    setIsLoading(true)
    router.push(`/analisar?url=${encodeURIComponent(url)}`)
  }

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-black flex flex-col lg:flex-row">
      {/* Left Section - Input & Info */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 max-w-xl mx-auto lg:mx-0 w-full"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Análise & Dublagem 🎙️
            </h1>
            <p className="text-sm lg:text-base text-white/60 leading-relaxed">
              Cole o link do YouTube. Nós vamos analisar a engenharia viral e disponibilizar a dublagem automática na próxima tela.
            </p>
          </div>

          {/* Input Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={handleAnalyze}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all text-base leading-tight"
                minLength={10}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label="Clear input"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full bg-white text-black font-semibold py-4 px-6 rounded-2xl hover:bg-white/90 disabled:bg-white/30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 h-[52px] text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Analisar Vídeo
                </>
              )}
            </button>

            {outOfQuota && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-950/30 border border-red-900/40 rounded-xl"
              >
                <p className="text-xs lg:text-sm font-medium text-red-300">
                  Sua cota gratuita acabou. Atualize seu plano para continuar.
                </p>
              </motion.div>
            )}
          </motion.form>

          {/* Credits Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 pt-4 border-t border-white/5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm font-medium text-white/60 uppercase tracking-wide">
                Créditos Restantes
              </span>
              <span className="text-sm lg:text-base font-bold text-white">
                {creditsRemaining} análise{creditsRemaining !== 1 && creditsRemaining !== "Ilimitado" ? "s" : ""}
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/40"
                initial={{ width: 0 }}
                animate={{ width: `${isAdmin ? 100 : Math.min(((creditsRemaining as number) / 10) * 100, 100)}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: "📝", label: "Transcrição Completa" },
              { icon: "🎙️", label: "Dublagem Automática" },
              { icon: "🔍", label: "Dossiê Viral" },
              { icon: "⚡", label: "Processamento Rápido" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs font-semibold text-white">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Section - Preview */}
      <div className="hidden lg:flex flex-1 bg-white/[0.015] border-l border-white/5 flex-col items-center justify-center px-12 py-12">
        <AnalysisDemo />
      </div>
    </main>
  )
}
