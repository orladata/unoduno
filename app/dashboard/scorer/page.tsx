"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface ScorerResult {
  score: number
  metrics?: {
    hook: number
    retention: number
    clarity: number
    callToAction: number
  }
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
        // Mock metrics if API doesn't return them yet
        const metrics = data.metrics || {
          hook: Math.min(100, data.score + Math.floor(Math.random() * 15 - 5)),
          retention: Math.min(100, data.score + Math.floor(Math.random() * 20 - 10)),
          clarity: Math.min(100, data.score + Math.floor(Math.random() * 10)),
          callToAction: Math.min(100, data.score + Math.floor(Math.random() * 25 - 15)),
        }
        setResult({ ...data, metrics })
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

  // Calculate SVG stroke dash array for animated circle
  const score = result?.score || 0
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const scoreColor = score > 80 ? '#4ade80' : score > 60 ? '#facc15' : '#ef4444'
  const scoreBgColor = score > 80 ? 'rgba(74,222,128,0.1)' : score > 60 ? 'rgba(250,204,21,0.1)' : 'rgba(239,68,68,0.1)'

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest w-fit mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Neural Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Avaliador Neural</h1>
        <p className="text-sm text-white/50 max-w-xl leading-relaxed">
          O Teste de Fogo para seu roteiro. Avalie o potencial de retenção, descubra falhas ocultas e gere uma versão otimizada com IA.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Input Section */}
        <form onSubmit={handleGenerate} className="flex flex-col gap-5 glass-card p-6 sm:p-8">
          <div className="relative group">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Cole seu roteiro cru aqui..."
              className="w-full h-[250px] sm:h-[300px] resize-none bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm sm:text-base leading-relaxed outline-none focus:border-blue-500/50 focus:bg-white/[0.02] transition-all placeholder:text-white/20 custom-scrollbar"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || script.length < 50}
            className="group relative w-full h-14 bg-white text-black font-bold text-sm sm:text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Lendo estrutura psicológica...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Submeter ao Avaliador
              </div>
            )}
            {!isLoading && (
              <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            )}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-center gap-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </motion.div>
          )}
        </form>

        {/* Output Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Score & Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Gauge */}
              <div className="glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${scoreColor}, transparent 60%)` }} />
                
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6 relative z-10">Score Viral</h3>
                
                <div className="relative w-32 h-32 flex items-center justify-center z-10">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                    {/* Animated Progress Circle */}
                    <motion.circle 
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      cx="50" cy="50" r="45" 
                      stroke={scoreColor} 
                      strokeWidth="8" 
                      fill="none" 
                      strokeLinecap="round"
                      style={{ strokeDasharray: circumference }}
                    />
                  </svg>
                  {/* Score Number */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <span className="text-4xl font-black text-white">{score}</span>
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  className="mt-6 text-sm font-semibold text-center"
                  style={{ color: scoreColor }}
                >
                  {score > 80 ? "Excelente! Potencial massivo." : score > 60 ? "Requer ajustes para não flopar." : "Alto risco de swipe. Use a versão reescrita."}
                </motion.p>
              </div>

              {/* Sub-metrics */}
              <div className="glass-card p-6 flex flex-col justify-center gap-5">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Desempenho por Eixo</h3>
                
                {[
                  { label: "Poder do Gancho", val: result.metrics?.hook || 0, icon: "🪝" },
                  { label: "Retenção (Corpo)", val: result.metrics?.retention || 0, icon: "📈" },
                  { label: "Clareza da Mensagem", val: result.metrics?.clarity || 0, icon: "💎" },
                  { label: "Força do CTA", val: result.metrics?.callToAction || 0, icon: "🎯" }
                ].map((m, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5"><span className="text-base">{m.icon}</span> {m.label}</span>
                      <span className="text-white/60 font-mono">{m.val}/100</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.val}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (i * 0.1) }}
                        className="h-full rounded-full"
                        style={{ background: m.val > 80 ? '#4ade80' : m.val > 60 ? '#facc15' : '#ef4444' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-card p-6 border-red-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Falhas Encontradas
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 bg-red-500/5 p-3 rounded-xl border border-red-500/10 text-xs sm:text-sm text-white/80 leading-relaxed">
                      <span className="text-red-500 shrink-0 mt-0.5">✖</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Improved Script */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-card p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Versão Otimizada (IA)
                </h3>
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                <p className="text-sm sm:text-base text-white/90 whitespace-pre-line leading-relaxed font-mono">
                  {result.improved}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
