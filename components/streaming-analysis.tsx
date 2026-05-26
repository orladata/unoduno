'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnalysisEvent {
  type: 'chunk' | 'complete' | 'error' | 'suspended'
  content?: string
  result?: any
  tokensUsed?: number
  costEstimated?: number
  message?: string
  toolName?: string
  resumeSchema?: any
}

interface StreamingAnalysisProps {
  videoUrl: string
  userId: string
  onComplete?: (result: any) => void
}

export function StreamingAnalysis({ videoUrl, userId, onComplete }: StreamingAnalysisProps) {
  const [chunks, setChunks] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ tokensUsed: 0, cost: 0 })
  const [canResume, setCanResume] = useState(false)

  useEffect(() => {
    const analyze = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setChunks([])

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl, userId })
        })

        if (!response.ok) {
          throw new Error(`Analysis failed with status ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue

            try {
              const event: AnalysisEvent = JSON.parse(line)

              switch (event.type) {
                case 'chunk':
                  if (event.content) {
                    setChunks(prev => [...prev, event.content!])
                  }
                  break

                case 'complete':
                  setStats({
                    tokensUsed: event.tokensUsed || 0,
                    cost: event.costEstimated || 0
                  })
                  setIsComplete(true)
                  onComplete?.(event.result)
                  break

                case 'error':
                  setError(event.message || 'Unknown error occurred')
                  break

                case 'suspended':
                  setCanResume(true)
                  console.log('[StreamingAnalysis] Analysis suspended, can resume:', event)
                  break
              }
            } catch (e) {
              console.error('[StreamingAnalysis] Failed to parse event:', line, e)
            }
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to analyze video'
        setError(errorMsg)
        console.error('[StreamingAnalysis] Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (videoUrl && userId) {
      analyze()
    }
  }, [videoUrl, userId, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Main Analysis Pane */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 space-y-4 min-h-80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Análise de Vídeo</h2>
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-2 text-white/60 text-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processando...
            </motion.div>
          )}
        </div>

        {/* Content Stream */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
          {chunks.length === 0 && isLoading && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/40 text-sm py-8 text-center"
            >
              Aguardando análise da transcrição...
            </motion.div>
          )}

          {chunks.length === 0 && !isLoading && !error && (
            <div className="text-white/40 text-sm py-8 text-center">
              Nenhum resultado retornado
            </div>
          )}

          {chunks.map((chunk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap"
            >
              {chunk}
            </motion.div>
          ))}

          {isComplete && chunks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 mt-4 border-t border-white/10"
            >
              <p className="text-xs text-green-400 font-medium flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Análise concluída com sucesso
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer Stats */}
        {(isComplete || stats.tokensUsed > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Tokens Usados</span>
              <span className="text-lg font-bold text-white/80">{stats.tokensUsed.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Custo Estimado</span>
              <span className="text-lg font-bold text-white/80">${stats.cost.toFixed(4)}</span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-950/30 border border-red-900/40 rounded-xl"
          >
            <p className="text-sm font-medium text-red-300 flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">!</text>
              </svg>
              <span>{error}</span>
            </p>
            {canResume && (
              <p className="text-xs text-red-200/60 mt-2">
                💡 Esta análise pode ser retomada se a conexão cair
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Info Callout */}
      {isLoading && chunks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/[0.03] border border-white/5 rounded-lg"
        >
          <p className="text-xs text-white/50 leading-relaxed">
            ⚡ A análise está sendo processada em tempo real. Você verá os resultados assim que forem disponibilizados.
            Esta conexão suporta resumo automático em caso de interrupção.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
