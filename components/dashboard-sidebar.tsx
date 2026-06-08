"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { ProgressRing } from "@/components/progress-ring"

interface SidebarProps {
  creditBalance: number
  email: string
  subscriptionTier: string | null
  onLogout: () => void
}

const navItems = [
  {
    href: "/dashboard",
    label: "Analisar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/dashboard/historico",
    label: "Histórico",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/dashboard/repurpose",
    label: "Máquina de Cortes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/dashboard/scorer",
    label: "Avaliador Neural",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
]

export function DashboardSidebar({ creditBalance, email, subscriptionTier, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const creditCount = Math.floor(creditBalance / 100)
  const creditPercent = Math.min(100, Math.max(0, (creditCount / 10) * 100))

  // ⌘B to toggle sidebar
  useKeyboardShortcut({ key: "b", metaKey: true }, () => {
    setCollapsed((prev) => !prev)
  })

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [mobileOpen])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname?.startsWith(href)
  }

  const userName = email?.split("@")[0] || "Usuário"
  const initials = userName.slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 pt-6 pb-4`}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-500/20">
            U
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-black text-white tracking-tight overflow-hidden whitespace-nowrap"
              >
                unoduno
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse button — desktop only */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            aria-label="Recolher sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegação do dashboard">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center py-2 mb-3 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            aria-label="Expandir sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-500"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <span className={`shrink-0 transition-colors ${active ? "text-violet-400" : "text-white/35 group-hover:text-white/60"}`}>
                {item.icon}
              </span>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-[#1a1a1a] border border-white/10 text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.06]" />

      {/* Credits */}
      <div className={`px-4 py-4 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <ProgressRing progress={creditPercent} size={36} strokeWidth={2.5} color="#8b5cf6">
            <span className="text-[10px] font-bold text-white">{creditCount}</span>
          </ProgressRing>
        ) : (
          <div className="glass-card-subtle p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Créditos</span>
              <span className="text-xs font-bold text-white">{creditCount}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${creditPercent}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
            {creditCount <= 0 && (
              <Link
                href="/#precos"
                className="block mt-2 text-center text-[10px] text-violet-400 font-semibold hover:text-violet-300 transition-colors"
              >
                Adquirir mais →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={`px-3 pb-4 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
            title={userName}
          >
            {initials}
          </button>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/30 capitalize">{subscriptionTier || "Free"}</p>
            </div>
            <button
              onClick={onLogout}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
              aria-label="Sair"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-[9px] text-white/15 font-mono">
            <kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">⌘K</kbd>
            <span>buscar</span>
            <kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] ml-auto">⌘B</kbd>
            <span>sidebar</span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-5 left-4 z-50 w-10 h-10 rounded-xl glass-card flex items-center justify-center text-white/60 hover:text-white transition-colors"
        aria-label="Abrir menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="18" x2="18" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-[61] w-[280px] bg-[#0a0a0a] border-r border-white/[0.06]"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                aria-label="Fechar menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/[0.06] sidebar-transition ${
          collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
