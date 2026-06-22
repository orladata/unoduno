"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useTranscriptionHistory } from "@/lib/hooks/use-transcription-history"
import { TranscriptionListItem } from "./transcription-list-item"
import { EmptyState } from "./empty-state"

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function SpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle className="opacity-25" cx="12" cy="12" r="10" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function TranscriptionsClient() {
  const {
    transcriptions,
    total,
    isLoading,
    search,
    setSearch,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    deleteTranscription,
  } = useTranscriptionHistory()

  const [sortOpen, setSortOpen] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  // Close sort menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }

    if (sortOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sortOpen])

  const totalPages = Math.ceil(total / pageSize)
  const sortLabel = {
    recent: "Recentes",
    oldest: "Antigos",
    longest: "Mais compridas",
  }[sort]

  return (
    <div className="min-h-dvh flex flex-col pt-6" style={{ background: "transparent" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 max-w-5xl mx-auto w-full mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium transition-colors duration-200 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg"
          style={{ color: "var(--text-muted)" }}
        >
          <BackArrow />
          Voltar
        </Link>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.15)", color: "#00ff41" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
          Histórico
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-20 flex-1">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Title & Stats */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff41] to-[#00dd3d]">Histórico</span> de Transcrições
            </h1>
            <p className="text-sm text-white/35 mt-1.5">
              {total} transcrições guardadas • Gerencie seus históricos
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <div className="flex items-center gap-3 bg-white/[0.04] border border-[#00ff41]/10 rounded-2xl px-5 py-3.5 focus-within:border-[#00ff41]/40 focus-within:bg-[#00ff41]/5 transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25 shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                  placeholder="Buscar por título, ID do vídeo ou conteúdo..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("")
                      setPage(0)
                    }}
                    className="text-white/25 hover:text-white/50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M7 12h10" />
                  <path d="M11 18h2" />
                </svg>
                {sortLabel}
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-0 mt-2 bg-black border border-[#00ff41]/20 rounded-xl overflow-hidden z-50 shadow-[0_0_30px_rgba(0,255,65,0.2)] min-w-max"
                  >
                    {[
                      { value: "recent" as const, label: "Recentes primeiro" },
                      { value: "oldest" as const, label: "Antigos primeiro" },
                      { value: "longest" as const, label: "Mais compridas" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSort(option.value)
                          setSortOpen(false)
                          setPage(0)
                        }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors border-b border-[#00ff41]/10 last:border-b-0 ${
                          sort === option.value
                            ? "bg-[#00ff41]/10 text-[#00ff41]"
                            : "text-white/80 hover:text-white hover:bg-[#00ff41]/10"
                        }`}
                      >
                        {option.label}
                        {sort === option.value && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="float-right">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Transcriptions List */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20" style={{ background: "radial-gradient(circle, rgba(0,255,65,0.4), transparent 70%)" }} />
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
                    <SpinnerIcon size={28} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">Carregando histórico...</p>
              </motion.div>
            ) : transcriptions.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  title="Nenhuma transcrição encontrada"
                  description={search ? "Tente outra busca ou comece a transcrever novos vídeos." : "Comece transcrevendo um vídeo do YouTube para construir seu histórico."}
                  action={{
                    label: "Ir para Transcritor",
                    href: "/dashboard/transcrever",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {transcriptions.map((item) => (
                  <TranscriptionListItem
                    key={item.id}
                    item={item}
                    onDelete={deleteTranscription}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!isLoading && total > pageSize && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex items-center justify-center gap-2"
            >
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/[0.06] border border-white/10 text-white/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>

              <div className="text-xs text-white/50 px-4">
                Página {page + 1} de {totalPages}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/[0.06] border border-white/10 text-white/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Próxima
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
