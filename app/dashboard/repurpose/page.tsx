"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedCounter } from "@/components/animated-counter"

const platforms = [
  { id: "tiktok", label: "TikTok", icon: "📱" },
  { id: "reels", label: "Reels", icon: "🎬" },
  { id: "shorts", label: "Shorts", icon: "▶️" },
  { id: "twitter", label: "Twitter Thread", icon: "🧵" },
]

export default function RepurposePage() {
  const [transcription, setTranscription] = useState("")
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok")

  const wordCount = transcription.trim() === "" ? 0 : transcription.trim().split(/\s+/).length

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (transcription.length < 200) {
      setError("A transcrição está muito curta. Cole um texto mais longo (ex: podcast, aula).")
      return
    }

    setIsLoading(true)
    setError(null)
    setMarkdown(null)

    try {
      // Pass platform to API if supported, or just use it contextually
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription, platform: selectedPlatform }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Erro ao fatiar conteúdo.")
      }

      const data = await res.json()
      if (data.markdown) {
        setMarkdown(data.markdown)
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
    if (!markdown) return
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse markdown roughly into cards if it has ## or ### headings
  const parseMarkdownToCards = (md: string) => {
    const parts = md.split(/(?=#{2,3}\s+)/)
    if (parts.length <= 1) return [{ title: "Corte", content: md }]
    return parts.filter(p => p.trim()).map(p => {
      const lines = p.trim().split("\n")
      const title = lines[0].replace(/^#{2,3}\s+/, "")
      const content = lines.slice(1).join("\n").trim()
      return { title, content }
    })
  }

  const outputCards = markdown ? parseMarkdownToCards(markdown) : []

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest w-fit mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          IA Ativa
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Máquina de Cortes</h1>
        <p className="text-sm text-white/50 max-w-xl leading-relaxed">
          Cole transcrições gigantes (podcasts, aulas) e a IA vai garimpar os melhores momentos e transformá-los em roteiros virais curtos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Input Section */}
        <form onSubmit={handleGenerate} className="flex flex-col gap-5 glass-card p-6 sm:p-8">
          {/* Platform Selector */}
          <div className="flex flex-col gap-3 mb-2">
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
              Plataforma Alvo
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    selectedPlatform === p.id 
                      ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105" 
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Cole a transcrição bruta aqui..."
              className="w-full h-[280px] sm:h-[350px] resize-none bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm sm:text-base leading-relaxed outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all placeholder:text-white/20 custom-scrollbar"
              disabled={isLoading}
            />
            {/* Animated Character/Word Counter */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-[10px] font-mono text-white/40 group-focus-within:border-purple-500/30 group-focus-within:text-purple-400 transition-colors">
              <span className="flex items-center gap-1">
                <AnimatedCounter value={wordCount} duration={500} animate={true} />
                <span className="text-white/20">palavras</span>
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1">
                <AnimatedCounter value={transcription.length} duration={500} animate={true} />
                <span className="text-white/20">caracteres</span>
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || transcription.length < 200}
            className="group relative w-full h-14 bg-white text-black font-bold text-sm sm:text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Minerando ouro no texto...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Extrair Cortes Virais
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
        {markdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💎</span>
                Cortes Extraídos
              </h2>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
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
                    Copiar Todos
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outputCards.map((card, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-5 group flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                      Corte {idx + 1}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${card.title}\n\n${card.content}`)
                      }}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      title="Copiar este corte"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-3 line-clamp-2 leading-snug">{card.title}</h3>
                  <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5">
                    <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-line font-mono">
                      {card.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
