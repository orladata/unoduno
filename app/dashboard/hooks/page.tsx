"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function HookGeneratorPage() {
  const [topic, setTopic] = useState("")
  const [hooks, setHooks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) {
        throw new Error("Erro ao gerar ganchos. Tente novamente.")
      }

      const data = await res.json()
      if (data.hooks && Array.isArray(data.hooks)) {
        setHooks(data.hooks)
      } else {
        throw new Error("Formato inválido retornado pela IA.")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.8)" }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Dashboard
        </Link>
        <span className="text-sm font-semibold tracking-tight text-white">Gerador de Ganchos</span>
        <div className="w-16" /> {/* Spacer */}
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Criador de Ganchos Virais</h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            A inteligência artificial vai gerar os 3 primeiros segundos do seu vídeo. O gancho perfeito é a diferença entre 1.000 e 1 Milhão de visualizações.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Como emagrecer treinando 3x na semana"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/30"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !topic.trim()}
            className="h-auto py-4 px-8 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 active:scale-95 transition-all"
          >
            {isLoading ? "Gerando..." : "Gerar Ganchos"}
          </Button>
        </form>

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence>
          {hooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              {hooks.map((hook, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx} 
                  className="group relative flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <p className="text-white text-sm font-medium pr-12">
                    <span className="text-blue-400 font-black mr-3">{idx + 1}.</span>
                    {hook}
                  </p>
                  <button 
                    onClick={() => handleCopy(hook)}
                    className="absolute right-4 p-2 text-white/40 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                    title="Copiar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
