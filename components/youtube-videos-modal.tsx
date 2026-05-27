"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
}

interface YoutubeVideosModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSelect: (url: string) => void
}

export function YoutubeVideosModal({ isOpen, onClose, onSelect }: YoutubeVideosModalProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchVideos()
    }
  }, [isOpen])

  const fetchVideos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/youtube")
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Erro desconhecido")
      }
      
      setVideos(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.506 2.506 0 0 0-1.762-1.766C18.265 4 12 4 12 4s-6.264 0-7.82.42a2.505 2.505 0 0 0-1.762 1.766C2 7.758 2 12 2 12s0 4.242.418 5.814a2.506 2.506 0 0 0 1.762 1.766C5.735 20 12 20 12 20s6.265 0 7.82-.42a2.506 2.506 0 0 0 1.762-1.766C22 16.242 22 12 22 12s0-4.242-.418-5.814zM9.99 15.474v-6.95l6.33 3.475-6.33 3.475z"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Seus Vídeos do YouTube</h2>
                <p className="text-sm text-white/50">Selecione um vídeo para transcrever</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
                <p className="text-white/50 font-medium">Buscando seus vídeos...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <p className="text-white font-medium max-w-md">{error}</p>
                {error.includes("login") && (
                  <button onClick={() => window.location.href = '/login'} className="mt-4 px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors">
                    Fazer Login com Google
                  </button>
                )}
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <p className="text-white/50 font-medium">Nenhum vídeo encontrado no seu canal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={video.id}
                    onClick={() => {
                      onSelect(`https://youtube.com/watch?v=${video.id}`)
                      onClose()
                    }}
                    className="group cursor-pointer rounded-2xl bg-white/5 border border-white/5 overflow-hidden hover:bg-white/10 hover:border-red-500/50 transition-all duration-300"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                      <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-xs text-white/40 mt-2">
                        {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
