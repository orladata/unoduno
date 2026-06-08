"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  category: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Toggle with ⌘K
  useKeyboardShortcut({ key: "k", metaKey: true }, () => {
    setIsOpen((prev) => !prev)
  })

  // Close with Escape
  useKeyboardShortcut({ key: "Escape" }, () => {
    setIsOpen(false)
  }, isOpen)

  const commands: CommandItem[] = useMemo(() => [
    {
      id: "new-analysis",
      label: "Nova Análise de Vídeo",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
      shortcut: "⌘N",
      action: () => router.push("/dashboard"),
      category: "Ações",
    },
    {
      id: "history",
      label: "Ver Histórico",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      shortcut: "⌘H",
      action: () => router.push("/dashboard/historico"),
      category: "Navegação",
    },
    {
      id: "repurpose",
      label: "Máquina de Cortes",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>,
      shortcut: "",
      action: () => router.push("/dashboard/repurpose"),
      category: "Ferramentas",
    },
    {
      id: "scorer",
      label: "Avaliador Neural",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      shortcut: "",
      action: () => router.push("/dashboard/scorer"),
      category: "Ferramentas",
    },
    {
      id: "pricing",
      label: "Ver Planos & Preços",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      shortcut: "",
      action: () => router.push("/#precos"),
      category: "Navegação",
    },
    {
      id: "home",
      label: "Página Inicial",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      shortcut: "",
      action: () => router.push("/"),
      category: "Navegação",
    },
  ], [router])

  // Filter commands by query (fuzzy-ish)
  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const lowerQuery = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    )
  }, [commands, query])

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filtered])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = filtered[selectedIndex]
        if (item) {
          item.action()
          setIsOpen(false)
        }
      }
    },
    [filtered, selectedIndex]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] command-palette-backdrop"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg mx-4"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0c]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)]">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar ações, páginas..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                  aria-label="Buscar comandos"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-white/40">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2" role="listbox">
                {filtered.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-white/30">Nenhum resultado encontrado</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <p className="px-5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25">
                        {category}
                      </p>
                      {items.map((item) => {
                        const flatIndex = filtered.indexOf(item)
                        const isSelected = flatIndex === selectedIndex

                        return (
                          <button
                            key={item.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              item.action()
                              setIsOpen(false)
                            }}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            className={`flex items-center gap-3 w-full px-5 py-2.5 text-left text-sm transition-colors duration-100 ${
                              isSelected
                                ? "bg-white/[0.08] text-white"
                                : "text-white/60 hover:text-white/80"
                            }`}
                          >
                            <span className={`shrink-0 transition-colors ${isSelected ? "text-violet-400" : "text-white/30"}`}>
                              {item.icon}
                            </span>
                            <span className="flex-1 font-medium">{item.label}</span>
                            {item.shortcut && (
                              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-white/30">
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3 text-[10px] text-white/25">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] font-mono">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] font-mono">↵</kbd>
                    selecionar
                  </span>
                </div>
                <span className="text-[10px] text-white/20 font-semibold tracking-wide">unoduno</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
