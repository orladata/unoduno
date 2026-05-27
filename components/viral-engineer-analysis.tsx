"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

/** Safely convert ANY value (string, object, array, undefined) to a renderable string.
 *  This prevents React crashes when the AI returns an object where a string is expected. */
function safeStr(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map((v) => safeStr(v)).join(" • ")
  if (typeof value === "object") {
    // Common patterns: {trigger, quote}, {text}, {value}, {content}
    const obj = value as Record<string, unknown>
    return Object.values(obj).map((v) => safeStr(v)).join(" — ")
  }
  return String(value)
}

interface LearningLayerAnalysis {
  videoTitle: string
  originalVideoDetails?: {
    originalTitle: string
    youtubeVideoId: string
    approximateViews: string
    fullWordForWordTranscript: string
    topComments: Array<{
      author: string
      likes: string
      content: string
    }>
  }
  transcriptBreakdown: Array<{
    segmentName: string
    timeframe: string
    keyDialogueSummary: string
    emotionalTone: string
  }>
  originalEssence: {
    coreMessage: string
    psychologicalTriggers: string
    pacingAndDelivery: string
    visualStyle: string
  }
  audienceInsights: {
    viewsAndEngagementAnalysis: string
    publicObjections: string
    praiseAndConnectionPoints: string
    audiencePainPoints: string
  }
  recreationBlueprint: {
    stepByStepAdaptation: string
    hookAdaptationExamples: Array<{
      niche: string
      suggestedHook: string
    }>
    recreationRules: string
    suggestedScenes: string
  }
  keyLearning: string
}

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    copied ? null : setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-11 sm:h-8 px-4 sm:px-3 gap-2 border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all rounded-lg select-none"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs font-semibold text-green-400">Copiado!</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="text-xs font-semibold">{label}</span>
        </>
      )}
    </Button>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Skeleton className="h-8 w-3/4 bg-white/5" />
      <Skeleton className="h-4 w-1/2 bg-white/5" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 bg-white/5 rounded-full" />
        <Skeleton className="h-10 w-32 bg-white/5 rounded-full" />
        <Skeleton className="h-10 w-32 bg-white/5 rounded-full" />
      </div>
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 bg-white/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-5/6 bg-white/5" />
          <Skeleton className="h-8 w-24 bg-white/5" />
        </CardContent>
      </Card>
    </div>
  )
}

export function ViralEngineerAnalysis({ 
  analysis, 
  isLoading 
}: { 
  analysis?: LearningLayerAnalysis; 
  isLoading: boolean 
}) {
  const [activeTab, setActiveTab] = useState<"origin" | "essence" | "audience" | "blueprint" | "dubbing">("origin")
  const [exported, setExported] = useState(false)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)

  // Dubbing State
  const [dubLang, setDubLang] = useState("pt")
  const [isDubLoading, setIsDubLoading] = useState(false)
  const [dubProgressMsg, setDubProgressMsg] = useState("")

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: printRef })

  // Handle Dubbing
  const handleDub = async () => {
    if (!analysis?.originalVideoDetails?.youtubeVideoId) return
    setIsDubLoading(true)
    
    try {
      const response = await fetch("/api/dub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          videoUrl: `https://youtube.com/watch?v=${analysis.originalVideoDetails.youtubeVideoId}`, 
          language: dubLang 
        }),
      })
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erro ao gerar dublagem")
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `video_dublado_${dubLang}.mp4`
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

  // Dubbing simulated progress
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
    }, 15000)
    
    return () => clearInterval(interval)
  }, [isDubLoading])

  if (isLoading) {
    return <AnalysisSkeleton />
  }

  if (!analysis) {
    return null
  }

  const handleExport = () => {
    try {
      const fullText = JSON.stringify(analysis, null, 2)
      navigator.clipboard.writeText(fullText)
      setExported(true)
      setTimeout(() => setExported(false), 2000)
    } catch (err) {
      console.error("Erro ao exportar:", err)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {analysis.videoTitle}
        </h1>
        <p className="text-sm text-gray-400">
          Manual de Engenharia Viral e Adaptação Prática de Conteúdo
        </p>
      </div>

      {/* Tabs Selector (Premium Mobile Scroll) */}
      <div className="flex flex-nowrap overflow-x-auto scrollbar-hide snap-x gap-2 p-1 bg-white/5 rounded-2xl border border-white/10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[
          { id: "origin" as const, label: "📹 Origem (Vídeo Original)", icon: "📺" },
          { id: "essence" as const, label: "🎬 Essência & Transcrição", icon: "🎥" },
          { id: "audience" as const, label: "👥 Reação do Público", icon: "🔥" },
          { id: "blueprint" as const, label: "🚀 Guia de Recriação", icon: "🛠️" },
          { id: "dubbing" as const, label: "🎙️ Dublagem & Tradução", icon: "🎙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`snap-start shrink-0 min-w-[160px] flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white text-black shadow-lg shadow-white/5 scale-100"
                : "text-gray-400 hover:text-white hover:bg-white/10 scale-95 opacity-80 hover:opacity-100"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents (Animated) */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* TAB 0: ORIGIN */}
            {activeTab === "origin" && (
              <div className="space-y-6">
            {analysis.originalVideoDetails && (
              <>
                {/* Thumbnail & Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  <div className="md:col-span-2 relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg group">
                    {isPlayingVideo ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${analysis.originalVideoDetails.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                        title={analysis.originalVideoDetails.originalTitle}
                        className="w-full h-full border-0 absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img 
                          src={`https://img.youtube.com/vi/${analysis.originalVideoDetails.youtubeVideoId}/maxresdefault.jpg`} 
                          alt="Thumbnail do vídeo original" 
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                          onClick={() => setIsPlayingVideo(true)}
                          onError={(e) => {
                            e.currentTarget.src = `https://img.youtube.com/vi/${analysis.originalVideoDetails?.youtubeVideoId || ""}/0.jpg`;
                          }}
                        />
                        {/* Play Button Overlay */}
                        <div 
                          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group-hover:bg-black/40 transition-colors"
                          onClick={() => setIsPlayingVideo(true)}
                        >
                          <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-[0.95] flex items-center justify-center text-white shadow-2xl shadow-red-600/40 transition-all duration-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        </div>
                        {/* Title Overlay */}
                        <div 
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-4 pointer-events-none"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-red-600 px-2 py-0.5 rounded text-white font-black">
                              YouTube Original
                            </span>
                            <h2 className="text-sm sm:text-base font-black text-white line-clamp-1">
                              {analysis.originalVideoDetails.originalTitle}
                            </h2>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Card className="h-full border-white/10 bg-white/5 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-gray-400 uppercase tracking-widest font-black">
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2 flex-grow flex flex-col justify-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-white tracking-tight">
                          {analysis.originalVideoDetails.approximateViews}
                        </p>
                        <p className="text-xs text-gray-400 font-semibold">Visualizações Estimadas</p>
                      </div>
                      <div className="border-t border-white/5 pt-4 space-y-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Link de Origem:</p>
                        <a 
                          href={`https://youtu.be/${analysis.originalVideoDetails.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 font-medium hover:underline flex items-center gap-1.5 break-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          youtu.be/{analysis.originalVideoDetails.youtubeVideoId}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transcrição Íntegra do Roteiro (Whisper AI) */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="pb-3 border-b border-white/10">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <span className="text-2xl">📝</span>
                      Transcrição Completa (Fidelidade Máxima - Whisper AI)
                    </CardTitle>
                    <p className="text-xs text-gray-400">Transcrição na íntegra palavra por palavra do que é falado no vídeo original</p>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-xl border border-white/5 italic select-text">
                        "{analysis.originalVideoDetails.fullWordForWordTranscript}"
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <CopyButton text={analysis.originalVideoDetails.fullWordForWordTranscript} label="Copiar roteiro completo" />
                    </div>
                  </CardContent>
                </Card>

                {/* Top 3 Comments */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    Comentários Mais Relevantes
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {analysis.originalVideoDetails.topComments && analysis.originalVideoDetails.topComments.map((comment, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2 hover:bg-white/[0.08] transition-all font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black text-purple-400">{safeStr(comment.author)}</span>
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-300 text-[10px] font-bold">
                            👍 {safeStr(comment.likes)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed italic">
                          &quot;{safeStr(comment.content)}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 1: ESSENCE & TRANSCRIPT */}
        {activeTab === "essence" && (
          <div className="space-y-6">
            {/* 1. Original Transcript Breakdown */}
            <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-400">
                  <span className="text-2xl">📝</span>
                  Transcrição Estruturada
                </CardTitle>
                <p className="text-xs text-gray-400">Reconstrução fiel dos diálogos e momentos chave do vídeo original</p>
              </CardHeader>
              <CardContent className="divide-y divide-white/5 pt-4 space-y-4">
                {analysis.transcriptBreakdown && analysis.transcriptBreakdown.map((segment, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30 text-blue-300 font-bold shrink-0">
                          {safeStr(segment.timeframe)}
                        </Badge>
                        <h3 className="font-bold text-white text-sm sm:text-base">{safeStr(segment.segmentName)}</h3>
                      </div>
                      <Badge className="bg-white/10 text-gray-300 text-[10px] sm:text-xs">
                        🎭 Tom: {safeStr(segment.emotionalTone)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic bg-white/5 p-3 rounded-lg border border-white/5">
                      &quot;{safeStr(segment.keyDialogueSummary)}&quot;
                    </p>
                    <div className="flex justify-end">
                      <CopyButton text={safeStr(segment.keyDialogueSummary)} label="Copiar fala" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 2. Original Essence */}
            <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-400">
                  <span className="text-2xl">⚡</span>
                  A Essência do Vídeo Original
                </CardTitle>
                <p className="text-xs text-gray-400">Estudo de psicologia, ritmo e estética da obra original</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                  <p className="text-xs text-amber-300 uppercase tracking-wider font-black">Mensagem Central (O Núcleo)</p>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium italic">&quot;{safeStr(analysis.originalEssence.coreMessage)}&quot;</p>
                  <CopyButton text={safeStr(analysis.originalEssence.coreMessage)} label="Copiar mensagem central" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-purple-400 font-bold">🧠 Gatilhos Psicológicos</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.originalEssence.psychologicalTriggers)}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-green-400 font-bold">🗣️ Ritmo & Delivery</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.originalEssence.pacingAndDelivery)}</p>
                  </div>
                  <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-blue-400 font-bold">🎥 Estilo Visual</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.originalEssence.visualStyle)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: AUDIENCE INSIGHTS */}
        {activeTab === "audience" && (
          <div className="space-y-6">
            <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-400">
                  <span className="text-2xl">👥</span>
                  Psicologia & Reação da Audiência
                </CardTitle>
                <p className="text-xs text-gray-400">Análise de views, comentários, elogios e dores ativadas no público</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm font-bold text-purple-300">📊 Por que este vídeo viralizou? (Views & Retenção)</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{safeStr(analysis.audienceInsights.viewsAndEngagementAnalysis)}</p>
                  <CopyButton text={safeStr(analysis.audienceInsights.viewsAndEngagementAnalysis)} label="Copiar análise" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <p className="text-xs text-red-400 font-black uppercase tracking-wider">🛑 Objeções & Críticas</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.audienceInsights.publicObjections)}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <p className="text-xs text-green-400 font-black uppercase tracking-wider">🤝 Elogios & Empatia</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.audienceInsights.praiseAndConnectionPoints)}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <p className="text-xs text-blue-400 font-black uppercase tracking-wider">⚡ Dores do Público</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.audienceInsights.audiencePainPoints)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: RECREATION BLUEPRINT */}
        {activeTab === "blueprint" && (
          <div className="space-y-6">
            {/* Blueprint Guide */}
            <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                  <span className="text-2xl">🚀</span>
                  Manual de Recriação Viral
                </CardTitle>
                <p className="text-xs text-gray-400">O roteiro de ação passo a passo para você gravar e postar</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm font-bold text-green-300">💡 Como Recriar no seu Estilo (Guia Passo a Passo)</p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{safeStr(analysis.recreationBlueprint.stepByStepAdaptation)}</p>
                  <CopyButton text={safeStr(analysis.recreationBlueprint.stepByStepAdaptation)} label="Copiar guia passo a passo" />
                </div>

                {/* Golden Rules and Setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <p className="text-xs text-amber-400 font-black uppercase tracking-wider">⚠️ Regras de Ouro (Inalteráveis)</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.recreationBlueprint.recreationRules)}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <p className="text-xs text-blue-400 font-black uppercase tracking-wider">📸 Setup & Cenas Recomendadas</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{safeStr(analysis.recreationBlueprint.suggestedScenes)}</p>
                  </div>
                </div>

                {/* Niche Hooks Adaptation */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-200">🎣 Ganchos Virais Adaptados para Gravar Agora:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {analysis.recreationBlueprint.hookAdaptationExamples && analysis.recreationBlueprint.hookAdaptationExamples.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                            Nicho: {safeStr(item.niche)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-white italic">
                          &quot;{safeStr(item.suggestedHook)}&quot;
                        </p>
                        <div className="flex justify-end">
                          <CopyButton text={safeStr(item.suggestedHook)} label="Copiar gancho" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: DUBBING */}
        {activeTab === "dubbing" && (
          <div className="space-y-6">
            <Card className="border-cyan-500/20 bg-cyan-500/5 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2 text-cyan-400">
                  <span className="text-2xl">🎙️</span>
                  Dublagem & Tradução Automática
                </CardTitle>
                <p className="text-xs text-gray-400">Nossa IA traduz, clona a voz original e gera uma nova dublagem com lip-sync automático.</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex flex-col gap-4 max-w-md mx-auto">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wide">Idioma de Destino</label>
                    <select
                      value={dubLang}
                      onChange={(e) => setDubLang(e.target.value)}
                      disabled={isDubLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="pt" className="bg-black text-white">Português (BR)</option>
                      <option value="es" className="bg-black text-white">Espanhol (ES)</option>
                      <option value="en" className="bg-black text-white">Inglês (US)</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleDub}
                    disabled={isDubLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-6 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex flex-col items-center justify-center gap-1 h-auto min-h-[52px]"
                  >
                    {isDubLoading ? (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Processando Magia...</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold opacity-70 animate-pulse">{dubProgressMsg}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-base">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Gerar Dublagem (5 Créditos)
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary - Key Learning Card */}
      <Card className="border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-yellow-400">
            <span className="text-2xl">🧠</span>
            O Segredo de Viralidade (Lição Final)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-100 leading-relaxed italic">
              &quot;{safeStr(analysis.keyLearning)}&quot;
            </p>
          </div>
          <div className="flex justify-end">
            <CopyButton text={safeStr(analysis.keyLearning)} label="Copiar segredo de viralidade" />
          </div>
        </CardContent>
      </Card>

      {/* Export All */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 pb-8">
        <Button 
          onClick={handleExport}
          className={`gap-2 h-12 px-6 transition-all duration-200 ${exported ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
        >
          {exported ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              JSON Copiado!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              </svg>
              Copiar Estrutura (JSON)
            </>
          )}
        </Button>

        <Button 
          onClick={() => handlePrint()}
          className="gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Exportar PDF Profissional
        </Button>
      </div>

      {/* Hidden Printable Component */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div ref={printRef} className="p-10 bg-white text-black font-sans w-[800px]">
          <div className="border-b-4 border-black pb-6 mb-8 text-center">
            <h1 className="text-4xl font-black mb-2 uppercase">{analysis.videoTitle}</h1>
            <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Unoduno Neural Engine • Dossie Viral</p>
          </div>

          <div className="space-y-10">
            {/* Sec 1: Essencia */}
            <section>
              <h2 className="text-2xl font-bold bg-black text-white px-4 py-2 inline-block mb-4">1. Essência Original</h2>
              <div className="space-y-4 pl-4 border-l-4 border-gray-200">
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs">Mensagem Central</h3>
                  <p className="text-gray-900 font-serif italic text-lg">&quot;{safeStr(analysis.originalEssence.coreMessage)}&quot;</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs">Gatilhos</h3>
                  <p className="text-gray-700">{safeStr(analysis.originalEssence.psychologicalTriggers)}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs">Ritmo e Estilo</h3>
                  <p className="text-gray-700">{safeStr(analysis.originalEssence.pacingAndDelivery)} • {safeStr(analysis.originalEssence.visualStyle)}</p>
                </div>
              </div>
            </section>

            {/* Sec 2: Audiencia */}
            <section>
              <h2 className="text-2xl font-bold bg-black text-white px-4 py-2 inline-block mb-4">2. Psicologia do Público</h2>
              <div className="grid grid-cols-2 gap-6 pl-4 border-l-4 border-gray-200">
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs">Retenção</h3>
                  <p className="text-gray-700 text-sm">{safeStr(analysis.audienceInsights.viewsAndEngagementAnalysis)}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs">Dores Ativadas</h3>
                  <p className="text-gray-700 text-sm">{safeStr(analysis.audienceInsights.audiencePainPoints)}</p>
                </div>
              </div>
            </section>

            {/* Sec 3: Blueprint */}
            <section>
              <h2 className="text-2xl font-bold bg-black text-white px-4 py-2 inline-block mb-4">3. Guia de Recriação (Gravar Agora)</h2>
              <div className="pl-4 border-l-4 border-gray-200 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs">Passo a Passo</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{safeStr(analysis.recreationBlueprint.stepByStepAdaptation)}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                  <h3 className="font-bold text-black uppercase text-xs mb-2">Regras de Ouro</h3>
                  <p className="text-gray-800 font-bold text-sm">{safeStr(analysis.recreationBlueprint.recreationRules)}</p>
                </div>
              </div>
            </section>

            {/* Sec 4: Aprendizado Final */}
            <section className="bg-black text-white p-6 rounded-xl mt-12">
              <h3 className="font-black uppercase text-yellow-400 tracking-widest text-xs mb-2">O Segredo (Golden Nugget)</h3>
              <p className="text-xl font-serif italic">&quot;{safeStr(analysis.keyLearning)}&quot;</p>
            </section>
          </div>

          <div className="mt-16 text-center text-gray-400 text-xs">
            <p>Gerado por Unoduno AI Engine • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
