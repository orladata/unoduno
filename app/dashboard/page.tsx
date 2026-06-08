"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import { useRouter } from "next/navigation"
import { useProfile } from "./profile-context"
import Link from "next/link"
import dynamic from "next/dynamic"

const ViralVideosModal = dynamic(() => import("@/components/viral-videos-modal").then(mod => mod.ViralVideosModal), { ssr: false })

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

const quickActions = [
  {
    href: "/dashboard/repurpose",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    label: "Máquina de Cortes",
    desc: "Extraia cortes virais de qualquer transcrição longa",
    gradient: "from-purple-500/20 to-fuchsia-500/20",
    border: "border-purple-500/20 hover:border-purple-500/40",
    iconColor: "text-purple-400",
  },
  {
    href: "/dashboard/transcrever",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    label: "Transcritor",
    desc: "Transcrição exata do áudio e correção com Gemini",
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    iconColor: "text-cyan-400",
  },
  {
    href: "/dashboard/scorer",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    label: "Avaliador Neural",
    desc: "Avalie e otimize a retenção do seu roteiro com IA",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-400",
  },
  {
    href: "/dashboard/historico",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Histórico",
    desc: "Acesse todas as suas análises anteriores",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isViralModalOpen, setIsViralModalOpen] = useState(false)

  const profile = useProfile()
  const isAdmin = profile?.email === "sonarycorporation@gmail.com"
  const outOfQuota = isAdmin ? false : (profile ? profile.credit_balance < 100 : false)
  const creditsRemaining = isAdmin ? "∞" : (profile?.credit_balance ? Math.floor(profile.credit_balance / 100) : 0)

  const [greeting, setGreeting] = useState("Olá")
  useEffect(() => { setGreeting(getGreeting()) }, [])

  const userName = profile?.email?.split("@")[0] || "criador"

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/|v\/|shorts\/|live\/|e\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    if (outOfQuota) {
      router.push("/#precos")
      return
    }

    setIsLoading(true)
    let directAudioUrl = ""
    const videoId = extractVideoId(url)

    if (videoId) {
      try {
        const res = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.audioStreams && data.audioStreams.length > 0) {
            const stream = data.audioStreams.find((s: any) => s.mimeType.includes("mp4") || s.mimeType.includes("webm")) || data.audioStreams[0]
            directAudioUrl = stream.url
          }
        }
      } catch {
        // Piped API pode estar instável, continua sem proxy
      }
    }

    let nextUrl = `/dashboard/analisar?url=${encodeURIComponent(url)}`
    if (directAudioUrl) {
      nextUrl += `&directAudioUrl=${encodeURIComponent(directAudioUrl)}`
    }
    router.push(nextUrl as any)
  }

  const videoId = extractVideoId(url)

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      {/* Greeting */}
      <motion.div variants={item} className="mb-10 pt-4 lg:pt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {greeting}, <span className="gradient-text-violet">{userName}</span>
        </h1>
        <p className="text-sm text-white/35 mt-1">O que vamos criar hoje?</p>
      </motion.div>

      {/* Main Search — The Hero Input */}
      <motion.form
        variants={item}
        onSubmit={handleAnalyze}
        className="mb-6"
      >
        <div className={`relative rounded-2xl transition-all duration-300 ${url ? "glow-ring" : ""}`}>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 focus-within:border-violet-500/40 focus-within:bg-white/[0.06] transition-all duration-300 hover:border-white/15">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 shrink-0">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole o link do YouTube para analisar..."
              className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none"
              minLength={10}
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="text-white/25 hover:text-white/50 transition-colors"
                aria-label="Limpar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail Preview */}
        {videoId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]"
          >
            <div className="relative w-full aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z" /></svg>
                </div>
                <span className="text-xs text-white/90 font-medium">Pronto para análise</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          variants={item}
          type="submit"
          disabled={isLoading || !url}
          className="w-full mt-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Preparando análise...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Analisar Vídeo
            </>
          )}
        </motion.button>

        {outOfQuota && (
          <div className="p-3 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <p className="text-xs text-red-400">
              Sua cota acabou.{" "}
              <Link href="/#precos" className="underline hover:text-red-300">Atualize seu plano</Link>
            </p>
          </div>
        )}
      </motion.form>

      {/* Trending pills */}
      <motion.div variants={item} className="flex items-center gap-2 mb-12 flex-wrap">
        <span className="text-[11px] text-white/30 font-medium">Sem ideias?</span>
        <button
          onClick={() => setIsViralModalOpen(true)}
          className="text-[11px] font-medium text-slate-300 hover:text-white px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          Explorar vídeos em alta
        </button>
        <ViralVideosModal
          isOpen={isViralModalOpen}
          onClose={() => setIsViralModalOpen(false)}
          onSelect={(selectedUrl) => setUrl(selectedUrl)}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="mb-10">
        <h2 className="text-xs font-bold text-white/25 uppercase tracking-widest mb-4">Ferramentas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group glass-card-subtle p-5 rounded-xl border ${action.border} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${action.gradient}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-4 ${action.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{action.label}</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">{action.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-10">
        <div className="glass-card-subtle rounded-xl p-4 text-center">
          <p className="text-xl font-black text-white tracking-tight">{creditsRemaining}</p>
          <p className="text-[10px] text-white/30 font-semibold mt-1 uppercase tracking-wider">Créditos</p>
        </div>
        <div className="glass-card-subtle rounded-xl p-4 text-center">
          <p className="text-xl font-black text-white tracking-tight">—</p>
          <p className="text-[10px] text-white/30 font-semibold mt-1 uppercase tracking-wider">Este mês</p>
        </div>
        <div className="glass-card-subtle rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-xl font-black text-white tracking-tight">ON</p>
          </div>
          <p className="text-[10px] text-white/30 font-semibold mt-1 uppercase tracking-wider">Motor IA</p>
        </div>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {[
          "Whisper Transcription",
          "Dossiê de Retenção",
          "Dublagem Inteligente",
          "Processamento Neural",
        ].map((label, i) => (
          <span
            key={i}
            className="text-[10px] text-white/30 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05]"
          >
            {label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  )
}
