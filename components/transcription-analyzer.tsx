"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface TranscriptionAnalyzerProps {
  transcript: string
  videoTitle?: string
  channelName?: string
  duration?: string
  themes?: string[]
  chapters?: Array<{ time: string; title: string }>
  insights?: Array<{ icon: string; title: string; description: string }>
  onCopy?: () => void
  onDownload?: () => void
}

export function TranscriptionAnalyzer({
  transcript,
  videoTitle = "Vídeo",
  channelName = "Canal",
  duration = "00:00:00",
  themes = [],
  chapters = [],
  insights = [],
  onCopy,
  onDownload,
}: TranscriptionAnalyzerProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"transcript" | "insights">("transcript")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    } catch {
      // Silent fail
    }
  }

  const paragraphs = transcript.split("\n\n").filter(Boolean)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Main Transcription Pane */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-2 space-y-6"
      >
        {/* Transcription Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-white break-words">
              {videoTitle}
            </h1>
            <p className="text-sm text-white/60">
              {channelName} • {duration}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 active:scale-[0.97] transition-all text-sm font-medium text-white/80 hover:text-white"
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copiar Tudo
                </>
              )}
            </button>

            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 active:scale-[0.97] transition-all text-sm font-medium text-white/80 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* Themes Tags */}
        {themes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Temas Principais</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white/80 hover:bg-white/15 transition-colors"
                >
                  {theme}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transcription Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-4 max-h-[600px] overflow-y-auto"
        >
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Transcrição Completa</p>
          
          <div className="space-y-4">
            {paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.02 }}
                className="text-sm leading-relaxed text-white/80"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Sidebar - Insights */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Chapters */}
        {chapters.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
              Capítulos
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {chapters.map((chapter, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-white/40 group-hover:text-white/60 mt-0.5 shrink-0">
                      {chapter.time}
                    </span>
                    <span className="text-xs text-white/70 group-hover:text-white leading-relaxed">
                      {chapter.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Insights
            </h2>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-lg mb-2">{insight.icon}</div>
                  <p className="text-xs font-semibold text-white mb-1">{insight.title}</p>
                  <p className="text-xs text-white/60">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Estatísticas</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Palavras</span>
              <span className="font-mono font-semibold text-white/80">
                {transcript.split(/\s+/).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Caracteres</span>
              <span className="font-mono font-semibold text-white/80">
                {transcript.length}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-white/60">Duração Estimada</span>
              <span className="font-mono font-semibold text-white/80">{duration}</span>
            </div>
          </div>
        </div>

        {/* Download All */}
        <button
          onClick={onDownload}
          className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar Transcrição
        </button>
      </motion.div>
    </div>
  )
}
