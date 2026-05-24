"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { DashboardCards } from "@/components/dashboard-cards"

export default function DashboardPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setIsLoading(true)
    // Simulate navigation to analysis page
    router.push(`/analisar?url=${encodeURIComponent(url)}`)
  }

  return (
    <main className="flex min-h-[calc(100vh-6rem)] flex-col items-center">
      <div className="w-full max-w-4xl mx-auto px-6 mt-12 sm:mt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Workspace Ativo</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
            O que vamos criar hoje?
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Cole a URL de qualquer vídeo americano de alta performance e deixe a nossa IA reescrever a genialidade por trás dele.
          </p>
        </motion.div>

        {/* Premium Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          onSubmit={handleAnalyze}
          className="relative max-w-3xl mx-auto group"
        >
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 via-emerald-500/50 to-blue-500/50 rounded-2xl opacity-30 group-hover:opacity-70 blur-md transition-opacity duration-500" />
          
          <div className="relative flex flex-col sm:flex-row items-center bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all duration-300 group-hover:border-white/20 group-focus-within:border-blue-500/50 group-focus-within:bg-[#111]/90 group-focus-within:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <div className="flex-1 w-full flex items-center px-4 py-2 sm:py-0">
              <svg className="w-6 h-6 text-slate-500 mr-3 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole o link do vídeo do YouTube..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg sm:text-xl font-medium py-3 h-[60px]"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full sm:w-auto h-[60px] sm:h-auto px-8 py-4 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-2 sm:mt-0"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Analisar
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>

      <DashboardCards />
    </main>
  )
}
