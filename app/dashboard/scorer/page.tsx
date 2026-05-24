"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ScorerResult {
  score: number
  issues: string[]
  improved: string
}

export default function ScorerPage() {
  const [script, setScript] = useState("")
  const [result, setResult] = useState<ScorerResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!script.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/scorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Erro ao analisar roteiro.")
      }

      const data = await res.json()
      if (typeof data.score === 'number' && data.improved) {
        setResult(data)
      } else {
        throw new Error("Formato inválido retornado pela IA.")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result?.improved) return
    navigator.clipboard.writeText(result.improved)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.8)" }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Dashboard
        </Link>
        <span className="text-sm font-semibold tracking-tight text-white">Avaliador Neural</span>
        <div className="w-16" />
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">O Teste de Fogo</h1>
            <p className="text-white/50 text-sm">
              Cole seu roteiro atual. A inteligência artificial vai avaliá-lo de 0 a 100, encontrar falhas na retenção e reescrever a versão perfeita.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Cole seu roteiro aqui..."
              className="w-full h-80 resize-none bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/30"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || script.length < 50}
              className="h-auto py-4 w-full bg-white text-black font-bold rounded-xl hover:bg-neutral-200 active:scale-95 transition-all"
            >
              {isLoading ? "Avaliando..." : "Submeter para Análise"}
            </Button>
          </form>

          {error && (
            <div className="p-4 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="relative">
          {!result && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border border-white/5 border-dashed rounded-3xl bg-white/[0.02]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 mb-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              <p className="text-white/40 text-sm">A análise detalhada aparecerá aqui.</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded-3xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/50 text-sm animate-pulse">Lendo estrutura psicológica...</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-black border-4" style={{ borderColor: result.score > 80 ? '#4ade80' : result.score > 60 ? '#facc15' : '#ef4444' }}>
                    <span className="text-3xl font-black text-white">{result.score}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Score Viral</h2>
                    <p className="text-sm text-white/50">
                      {result.score > 80 ? "Excelente potencial de retenção." : result.score > 60 ? "Precisa de ajustes para não flopar." : "Alto risco de swipe. Use a versão reescrita."}
                    </p>
                  </div>
                </div>

                {result.issues && result.issues.length > 0 && (
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
                    <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Falhas Encontradas
                    </h3>
                    <ul className="space-y-3">
                      {result.issues.map((issue, i) => (
                        <li key={i} className="flex gap-3 text-sm text-white/80">
                          <span className="text-red-500 mt-0.5">•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-400 font-bold flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Roteiro Reescrito (Otimizado)
                    </h3>
                    <Button 
                      onClick={handleCopy}
                      size="sm"
                      className={`h-8 gap-2 text-xs transition-colors ${copied ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-sm text-white/90 whitespace-pre-line leading-relaxed italic">
                      {result.improved}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
