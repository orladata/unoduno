"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function RepurposePage() {
  const [transcription, setTranscription] = useState("")
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
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

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.8)" }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Dashboard
        </Link>
        <span className="text-sm font-semibold tracking-tight text-white">Máquina de Cortes</span>
        <div className="w-16" />
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Multiplicador de Conteúdo</h1>
            <p className="text-white/50 text-sm">
              Tem um podcast, live ou aula gravada? Cole a transcrição bruta e a IA vai separar os 3 melhores cortes virais prontos para o TikTok/Reels.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Cole a transcrição gigante aqui..."
              className="w-full h-[400px] resize-none bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/30"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || transcription.length < 200}
              className="h-auto py-4 w-full bg-white text-black font-bold rounded-xl hover:bg-neutral-200 active:scale-95 transition-all"
            >
              {isLoading ? "Minerando ouro no texto..." : "Extrair Cortes Virais"}
            </Button>
          </form>

          {error && (
            <div className="p-4 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="relative">
          {!markdown && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border border-white/5 border-dashed rounded-3xl bg-white/[0.02]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 mb-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <p className="text-white/40 text-sm">Os roteiros curtos aparecerão aqui.</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded-3xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/50 text-sm animate-pulse">Lendo milhares de palavras com IA 3.1 Pro...</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {markdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full"
              >
                <div className="h-full flex flex-col p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-purple-400 font-bold flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                      Cortes Encontrados
                    </h3>
                    <Button 
                      onClick={handleCopy}
                      size="sm"
                      className={`h-8 gap-2 text-xs transition-colors ${copied ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                      {copied ? "Copiado!" : "Copiar Todos"}
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-white/90 whitespace-pre-line leading-relaxed">
                        {markdown}
                      </p>
                    </div>
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
