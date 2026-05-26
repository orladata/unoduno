"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface AccountCreditsProps {
  email?: string
  creditsRemaining: number
  subscriptionTier?: string
  position?: "top-right" | "sidebar"
  compact?: boolean
}

export function AccountCredits({
  email = "usuário@exemplo.com",
  creditsRemaining = 0,
  subscriptionTier = "Gratuito",
  position = "top-right",
  compact = false,
}: AccountCreditsProps) {
  const creditsPercent = Math.min(100, Math.max(0, (creditsRemaining / 10) * 100))
  const userName = email?.split("@")[0] || "Usuário"

  if (position === "top-right") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-6 z-40"
      >
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl space-y-3 w-72">
          {/* User Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-white/50 capitalize">Plano {subscriptionTier}</p>
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 font-medium">CRÉDITOS RESTANTES</span>
              <span className="font-bold text-white">{creditsRemaining}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/40"
                initial={{ width: 0 }}
                animate={{ width: `${creditsPercent}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/#precos"
            className="w-full py-2.5 px-4 bg-white text-black font-semibold text-sm rounded-lg hover:bg-white/90 transition-all active:scale-[0.97] inline-flex items-center justify-center"
          >
            Atualizar Plano
          </Link>
        </div>
      </motion.div>
    )
  }

  // Sidebar variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4"
    >
      <div>
        <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-3">Conta e Créditos</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-xs font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-white/50 capitalize">{subscriptionTier}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">Créditos</span>
          <span className="font-bold text-white">{creditsRemaining}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/40"
            initial={{ width: 0 }}
            animate={{ width: `${creditsPercent}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </div>
      </div>

      <Link
        href="/#precos"
        className="w-full py-2.5 px-4 bg-white text-black font-semibold text-xs rounded-lg hover:bg-white/90 transition-all active:scale-[0.97] inline-flex items-center justify-center"
      >
        Atualizar
      </Link>
    </motion.div>
  )
}
