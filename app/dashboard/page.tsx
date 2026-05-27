"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useProfile } from "./profile-context"
import { AnalysisDemo } from "@/components/analysis-demo"

type Tab = "transcribe" | "dub"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("transcribe")
  
  // Transcribe State
  const [url, setUrl] = useState("")
  const [isTranscribeLoading, setIsTranscribeLoading] = useState(false)
  
  // Dub State
  const [dubUrl, setDubUrl] = useState("")
  const [dubLang, setDubLang] = useState("pt")
  const [isDubLoading, setIsDubLoading] = useState(false)
  const [dubProgressMsg, setDubProgressMsg] = useState("")
  
  const profile = useProfile()
  
  // Cost constraints
  const TRANSCRIBE_COST = 100
  const DUB_COST = 500 // 5 creditos na UI real

  // Admin Override
  const isAdmin = profile?.email === "sonarycorporation@gmail.com"
  const creditsRemaining = isAdmin ? "Ilimitado" : (profile?.credit_balance ? Math.floor(profile.credit_balance / 100) : 0)
  const isOutOfQuotaTranscribe = isAdmin ? false : (profile ? profile.credit_balance < TRANSCRIBE_COST : false)
  const isOutOfQuotaDub = isAdmin ? false : (profile ? profile.credit_balance < DUB_COST : false)

  // Simulated Dubbing Messages
  useEffect(() => {
    if (!isDubLoading) return
    const messages = [
      "Iniciando servidores na Modal...",
      "Extraindo áudio original do YouTube...",
      "Transcrevendo via Faster-Whisper...",
      "Traduzindo legendas com Gemini 1.5...",
      "Clonando voz do locutor original (XTTS)...",
      "Gerando vozes sintéticas...",
      "Remixando vozes no vídeo original...",
      "Finalizando arquivo MP4..."
    ]
    let i = 0
    setDubProgressMsg(messages[0])
    const interval = setInterval(() => {
      i++
      if (i < messages.length) {
        setDubProgressMsg(messages[i])
      }
    }, 15000) // Change message every 15 seconds
    
    return () => clearInterval(interval)
  }, [isDubLoading])

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    if (isOutOfQuotaTranscribe) {
      router.push("/#precos")
      return
    }
    setIsTranscribeLoading(true)
    router.push(`/analisar?url=${encodeURIComponent(url)}`)
  }

  const handleDub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dubUrl) return
    if (isOutOfQuotaDub) {
      router.push("/#precos")
      return
    }
    setIsDubLoading(true)
    
    try {
      const response = await fetch("/api/dub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: dubUrl, language: dubLang }),
      })
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erro ao gerar dublagem")
      }
      
      // Recebendo o Video Blob
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      // Forçar o download no navegador
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = "video_dublado.mp4"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
    } catch (error: any) {
      alert("Falha na dublagem: " + error.message)
    } finally {
      setIsDubLoading(false)
      setDubProgressMsg("")
    }
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
          {/* Tabs Navigation */}
          <div className="flex p-1 bg-white/5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("transcribe")}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                activeTab === "transcribe" ? "text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {activeTab === "transcribe" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Analisar
              </span>
            </button>
            <button
              onClick={() => setActiveTab("dub")}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                activeTab === "dub" ? "text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {activeTab === "dub" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                Dublar
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "transcribe" ? (
              <motion.div
                key="transcribe-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    Transcrever & Analisar
                  </h1>
                  <p className="text-sm lg:text-base text-white/60 leading-relaxed">
                    Cole um link de vídeo do YouTube para extrair a transcrição completa e obter insights detalhados.
                  </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all text-base leading-tight"
                      minLength={10}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTranscribeLoading || !url}
                    className="w-full bg-white text-black font-semibold py-4 px-6 rounded-2xl hover:bg-white/90 disabled:bg-white/30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 h-[52px] text-base"
                  >
                    {isTranscribeLoading ? (
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

                  {isOutOfQuotaTranscribe && (
                    <div className="p-4 bg-red-950/30 border border-red-900/40 rounded-xl">
                      <p className="text-xs lg:text-sm font-medium text-red-300">
                        Sua cota gratuita acabou. Atualize seu plano para continuar.
                      </p>
                    </div>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="dub-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      Clonagem & Dublagem
                    </h1>
                    <span className="px-2 py-1 bg-white/10 text-white/80 text-xs font-bold rounded-lg border border-white/20">BETA</span>
                  </div>
                  <p className="text-sm lg:text-base text-white/60 leading-relaxed">
                    Cole um vídeo em inglês. Nossa IA traduz, clona a voz original e gera uma nova dublagem com lip-sync automático.
                  </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleDub} className="space-y-4">
                  <div className="relative">
                    <input
                      type="url"
                      value={dubUrl}
                      onChange={(e) => setDubUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      disabled={isDubLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all text-base leading-tight disabled:opacity-50"
                      minLength={10}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-white/50 uppercase pl-1">Idioma de Destino</label>
                    <select
                      value={dubLang}
                      onChange={(e) => setDubLang(e.target.value)}
                      disabled={isDubLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="pt">Português (BR)</option>
                      <option value="es">Espanhol (ES)</option>
                      <option value="en">Inglês (US)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isDubLoading || !dubUrl}
                    className="w-full bg-white text-black font-semibold py-4 px-6 rounded-2xl hover:bg-white/90 disabled:bg-white/30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center gap-1 min-h-[52px]"
                  >
                    {isDubLoading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-base font-bold">Processando Magia...</span>
                        </div>
                        <span className="text-xs font-medium opacity-70 animate-pulse">{dubProgressMsg}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-base">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Gerar Dublagem (5 Créditos)
                      </div>
                    )}
                  </button>

                  {isOutOfQuotaDub && (
                    <div className="p-4 bg-red-950/30 border border-red-900/40 rounded-xl">
                      <p className="text-xs lg:text-sm font-medium text-red-300">
                        Você não tem créditos suficientes para Dublagem (Necessário 5 créditos).
                      </p>
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Credits Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 pt-6 border-t border-white/5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm font-medium text-white/60 uppercase tracking-wide">
                Créditos Restantes
              </span>
              <span className="text-sm lg:text-base font-bold text-white">
                {creditsRemaining}
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

        </motion.div>
      </div>

      {/* Right Section - Preview */}
      <div className="hidden lg:flex flex-1 bg-white/[0.015] border-l border-white/5 flex-col items-center justify-center px-12 py-12">
        <AnalysisDemo />
      </div>
    </main>
  )
}
