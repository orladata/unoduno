"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getViralVideos, type ViralVideo } from "@/app/actions/youtube-trends"

interface ViralVideosModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export function ViralVideosModal({ isOpen, onClose, onSelect }: ViralVideosModalProps) {
  const [videos, setVideos] = useState<ViralVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getViralVideos()
        .then((data) => {
          setVideos(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [isOpen])

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-red-500">🔥</span> Em Alta no Brasil
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Escolha um vídeo viral recente para fazer engenharia reversa.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  aria-label="Fechar modal"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content / Grid */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p>Buscando os virais do dia...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, idx) => (
                      <motion.button
                        key={video.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          onSelect(`https://youtube.com/watch?v=${video.id}`)
                          onClose()
                        }}
                        className="group text-left flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <div className="relative w-full aspect-video overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white backdrop-blur-md">
                            {video.publishedAt}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                            {video.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="truncate max-w-[120px]">{video.channelTitle}</span>
                            <span className="font-medium text-emerald-400/90">{video.viewCount}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
                <span>Atualizado em tempo real.</span>
                <span className="flex items-center gap-1">
                  Powered by <span className="font-bold text-slate-300">Unoduno Data</span>
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
