"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { EmptyState } from "@/components/empty-state"

type HistoryItem = {
  id: string
  video_id: string
  title: string | null
  created_at: string
  views: string | null
}

interface HistoricoClientProps {
  initialData: HistoryItem[]
}

function formatDate(isoString: string) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function HistoricoClient({ initialData }: HistoricoClientProps) {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")

  const filteredData = useMemo(() => {
    let result = initialData
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((item) => 
        (item.title && item.title.toLowerCase().includes(q)) || 
        item.video_id.toLowerCase().includes(q)
      )
    }

    if (sortBy === "recent") {
      result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
      result = result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }

    return result
  }, [initialData, search, sortBy])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Histórico</h1>
          <p className="text-sm text-white/40 mt-1">
            {initialData.length} análise{initialData.length !== 1 ? "s" : ""} salva{initialData.length !== 1 ? "s" : ""}
          </p>
        </div>

        {initialData.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative group">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar vídeos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                aria-label="Visualização em grade"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                aria-label="Visualização em lista"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {initialData.length === 0 ? (
        <EmptyState
          title="Sua biblioteca está vazia"
          description="Você ainda não analisou nenhum vídeo. Cole um link do YouTube para começar a extrair inteligência viral."
          actionLabel="Analisar Primeiro Vídeo"
          actionHref="/dashboard"
          icon="📚"
        />
      ) : filteredData.length === 0 ? (
        <EmptyState
          title="Nenhum resultado encontrado"
          description={`Não encontramos nenhuma análise correspondente a "${search}".`}
          actionLabel="Limpar busca"
          onAction={() => setSearch("")}
          icon="🔍"
        />
      ) : (
        /* Results */
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            : "flex flex-col gap-3"
        }>
          <AnimatePresence mode="popLayout">
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  href={`/dashboard/analisar/${item.video_id}`} 
                  className={`group flex ${viewMode === "grid" ? "flex-col" : "flex-row items-center gap-4"} rounded-2xl overflow-hidden glass-card hover:bg-white/[0.04] transition-all duration-300 h-full`}
                >
                  {/* Thumbnail */}
                  <div className={`relative ${viewMode === "grid" ? "w-full aspect-video" : "w-40 shrink-0 aspect-video"} bg-[#111] overflow-hidden`}>
                    <Image
                      src={`https://img.youtube.com/vi/${item.video_id}/maxresdefault.jpg`}
                      alt={item.title || "Vídeo"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white/90 border border-white/10">
                      ID: {item.video_id.slice(0, 4)}...
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`p-4 flex-1 min-w-0 ${viewMode === "list" ? "py-2 pr-4 pl-1" : ""}`}>
                    <h3 className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed group-hover:text-violet-400 transition-colors mb-2">
                      {item.title || `Análise ${item.video_id}`}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-medium text-white/40">
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          {item.views ? `${item.views}` : "—"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-violet-500/20 flex items-center justify-center text-white/30 group-hover:text-violet-400 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
