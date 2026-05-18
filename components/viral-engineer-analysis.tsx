"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface LearningLayerAnalysis {
  videoTitle: string
  algorithm: {
    clickAttraction: string
    retentionEngagement: string
    keyQuote: string
  }
  introduction: {
    strategy: string
    targetAudience: string
    identification: string
  }
  narrativeStructure: Array<{
    moment: string
    description: string
    timeframe: string
  }>
  practicalFramework: {
    hook: string
    context: string
    tension: string
    progression: string
    transformation: string
  }
  productionPower: {
    audioVisualTools: string
    atmosphereDetails: string
  }
  keyLearning: string
}

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-8 gap-2"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiado!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </Button>
  )
}

// Loading skeleton component
function AnalysisSkeleton() {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
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
  if (isLoading) {
    return <AnalysisSkeleton />
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Video Title Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">{analysis.videoTitle}</h1>
        <p className="text-sm text-gray-400">Análise estratégica - Camada de Aprendizado Estruturada</p>
      </div>

      {/* 1. Algorithm Section */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            Lógica do Algoritmo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-400">O Clique (Atração)</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.algorithm.clickAttraction}</p>
            <CopyButton text={analysis.algorithm.clickAttraction} label="Copiar" />
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-400">A Retenção (Engajamento)</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.algorithm.retentionEngagement}</p>
            <CopyButton text={analysis.algorithm.retentionEngagement} label="Copiar" />
          </div>

          <div className="h-px bg-white/10" />

          <div className="bg-white/5 border border-white/10 rounded p-4">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Citação de Destaque</p>
            <p className="text-sm italic text-gray-200 border-l-4 border-amber-400 pl-3 mb-3">
              "{analysis.algorithm.keyQuote}"
            </p>
            <CopyButton text={analysis.algorithm.keyQuote} label="Copiar citação" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Introduction Section */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Introdução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-400">Estratégia de Retenção</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.introduction.strategy}</p>
            <CopyButton text={analysis.introduction.strategy} label="Copiar" />
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-2">
            <p className="text-sm font-semibold text-purple-400">Público-Alvo</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.introduction.targetAudience}</p>
            <CopyButton text={analysis.introduction.targetAudience} label="Copiar" />
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-2">
            <p className="text-sm font-semibold text-pink-400">Identificação Imediata</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.introduction.identification}</p>
            <CopyButton text={analysis.introduction.identification} label="Copiar" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Narrative Structure */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            Estrutura Narrativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.narrativeStructure.map((moment, idx) => (
            <div key={idx} className="space-y-2 pb-3 border-b border-white/10 last:border-0">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30 mt-0.5 shrink-0">
                  {idx + 1}
                </Badge>
                <div className="flex-1">
                  <p className="font-semibold text-white">{moment.moment}</p>
                  <p className="text-xs text-gray-400 mt-0.5">⏱ {moment.timeframe}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed ml-12">{moment.description}</p>
              <div className="ml-12">
                <CopyButton text={`${moment.moment}: ${moment.description}`} label="Copiar" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Practical Framework */}
      <Card className="border-cyan-500/20 bg-cyan-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Framework Prático
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { icon: "🎣", title: "Gancho", key: "hook" as const },
            { icon: "📋", title: "Contexto", key: "context" as const },
            { icon: "⚡", title: "Tensão", key: "tension" as const },
            { icon: "📈", title: "Progressão", key: "progression" as const },
            { icon: "✨", title: "Transformação", key: "transformation" as const },
          ].map((item) => (
            <div key={item.key} className="space-y-2 pb-3 border-b border-white/10 last:border-0">
              <p className="text-sm font-semibold">{item.icon} {item.title}</p>
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.practicalFramework[item.key]}</p>
              <CopyButton text={analysis.practicalFramework[item.key]} label="Copiar" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5. Production Power */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            Poder da Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-purple-400">Ferramentas Audiovisuais</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.productionPower.audioVisualTools}</p>
            <CopyButton text={analysis.productionPower.audioVisualTools} label="Copiar" />
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-2">
            <p className="text-sm font-semibold text-pink-400">Detalhes que Potencializam</p>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.productionPower.atmosphereDetails}</p>
            <CopyButton text={analysis.productionPower.atmosphereDetails} label="Copiar" />
          </div>
        </CardContent>
      </Card>

      {/* 6. Key Learning Summary */}
      <Card className="border-yellow-500/30 bg-yellow-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            Resumo - Aprendizado Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-100 leading-relaxed italic">
              "{analysis.keyLearning}"
            </p>
          </div>
          <CopyButton text={analysis.keyLearning} label="Copiar Aprendizado" />
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="flex gap-2 justify-center pt-4 pb-8">
        <Button 
          onClick={() => {
            const fullText = JSON.stringify(analysis, null, 2)
            navigator.clipboard.writeText(fullText)
          }}
          className="gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          </svg>
          Exportar Análise Completa
        </Button>
      </div>
    </div>
  )
}
