import { motion } from "framer-motion"
import Link from "next/link"
import { Transcription } from "@/lib/hooks/use-transcription-history"

interface TranscriptionListItemProps {
  item: Transcription
  onDelete: (id: string) => void
  onRefine?: (id: string) => void
}

export function TranscriptionListItem({ item, onDelete, onRefine }: TranscriptionListItemProps) {
  const wordCount = item.word_count || 0
  const date = new Date(item.created_at)
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm("Tem certeza que deseja deletar esta transcrição?")) {
      onDelete(item.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative rounded-xl border border-[#00ff41]/15 bg-[#00ff41]/5 hover:bg-[#00ff41]/10 p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {item.thumbnail_url && (
              <img
                src={item.thumbnail_url}
                alt="thumbnail"
                className="w-12 h-12 rounded-lg object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {item.title || item.video_id || "Transcrição Local"}
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                {wordCount.toLocaleString("pt-BR")} palavras • {formattedDate}
              </p>
              <p className="text-xs text-white/40 mt-1 line-clamp-2">
                {item.refined_transcript || item.original_transcript}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              if (onRefine) onRefine(item.id)
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00ff41] text-black hover:bg-[#00ff41]/90 transition-all active:scale-[0.97]"
            title="Refinir novamente com Gemini"
          >
            Refinar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-[0.97]"
            title="Deletar transcrição"
          >
            Deletar
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
