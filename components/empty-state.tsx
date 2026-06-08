"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface EmptyStateProps {
  /** Icon emoji or React node */
  icon?: React.ReactNode
  /** Title text */
  title: string
  /** Description text */
  description: string
  /** CTA button text */
  actionLabel?: string
  /** CTA href or onClick */
  actionHref?: string
  onAction?: () => void
  /** Additional class */
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center py-24 px-6 text-center ${className}`}
    >
      {/* Glowing icon container */}
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-full blur-[40px] opacity-30"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent)" }}
        />
        <div className="relative w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl">
          {icon || (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M10 9l5 3-5 3V9z" />
            </svg>
          )}
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-white/40 max-w-sm mb-8 leading-relaxed">{description}</p>

      {/* CTA */}
      {actionLabel && (actionHref ? (
        <Link
          href={actionHref}
          className="group relative px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98] flex items-center gap-2 shadow-[0_4px_14px_rgba(255,255,255,0.1)]"
        >
          {actionLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="group relative px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all active:scale-[0.98] flex items-center gap-2 shadow-[0_4px_14px_rgba(255,255,255,0.1)]"
        >
          {actionLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </motion.div>
  )
}
