"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useProfile } from "@/app/dashboard/profile-context"

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "A Mágica", href: "#magica" },
  { label: "Preços", href: "#precos" },
]

export function Navbar() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  
  const profile = useProfile()
  const creditBalance = profile?.credit_balance ?? 0
  const maxCredits = 100 // Or display dynamic
  const creditCount = Math.floor(creditBalance / 100)
  const progressPercent = Math.min(100, Math.max(0, (creditCount / 3) * 100)) // Visual progress relative to 3 credits as baseline? Wait, what's a good max? Let's assume progress bar is full if >0.

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    
    // Initial check
    handleScroll()
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Track active section for nav highlighting
  useEffect(() => {
    const sectionIds = ["funcionalidades", "magica", "precos"]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`)
          }
        })
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Safely lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [menuOpen])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false)
      }
    }
    
    if (menuOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-center ${
          scrolled
            ? "top-4 px-4"
            : "top-0 px-6"
        }`}
      >
        <div className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between ${
          scrolled
            ? "max-w-4xl bg-[#0a0a0a]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/[0.08] rounded-full py-2.5 px-6"
            : "max-w-5xl bg-transparent border border-transparent py-6 px-0"
        }`}>
          <a
            href="#inicio"
            className="text-lg font-black tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label="Unoduno — início"
          >
            unoduno
          </a>

          {/* Desktop nav */}
          {!isDashboard && (
            <nav className="hidden md:flex items-center gap-2" aria-label="Navegação principal">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group ${
                    activeSection === item.href ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {activeSection === item.href && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-1 left-4 right-4 h-[2px] bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-4">
            {isDashboard ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 text-white font-bold border border-white/20 hover:scale-105 transition-transform"
                >
                  W
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#111] border border-white/10 shadow-2xl p-4 z-50 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 text-white font-bold flex items-center justify-center shrink-0">
                          W
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-none overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                            {profile?.email?.split('@')[0] || "Usuário"}
                          </span>
                          <span className="text-xs text-slate-400 mt-1 capitalize">
                            Plano {profile?.subscription_tier || "Gratuito"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-slate-400">Cota atual</span>
                          <span className="text-white font-bold">{creditCount} {creditCount === 1 ? 'crédito' : 'créditos'}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                        {creditCount <= 0 && (
                          <span className="text-[10px] text-red-400 mt-1">Sua cota acabou!</span>
                        )}
                      </div>

                      <Link href="/#precos" className="flex justify-center items-center w-full py-2.5 mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                        Atualizar Plano
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center justify-center min-h-[44px] min-w-[100px] text-sm font-semibold px-5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white/10 border border-white/10 text-white hover:bg-white hover:text-black active:scale-95"
              >
                Entrar
              </Link>
            )}

            {/* Mobile hamburger — 48x48px min touch target compliant */}
            <button
              className="md:hidden flex flex-col justify-center items-center gap-1.5 w-12 h-12 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white/5 border border-white/10 active:bg-white/10 transition-colors"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={`block h-[2px] w-5 rounded-full bg-white transition-transform duration-300 ${
                  menuOpen ? "translate-y-[8px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] rounded-full bg-white transition-all duration-300 ${
                  menuOpen ? "w-0 opacity-0" : "w-5 opacity-100"
                }`}
              />
              <span
                className={`block h-[2px] w-5 rounded-full bg-white transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[8px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay with framer-motion */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-black/90 md:hidden pt-24 pb-8 px-6"
            aria-hidden={!menuOpen}
            role="dialog"
            aria-label="Menu Mobile"
          >
            <nav className="flex flex-col flex-1 justify-center gap-8" aria-label="Navegação mobile">
              {navLinks.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                  className="text-4xl font-black tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-2 -ml-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={`inline-block mr-4 transition-transform ${activeSection === item.href ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>
                    <span className="block w-2 h-2 rounded-full bg-blue-500" />
                  </span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-auto"
            >
              {!isDashboard && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full min-h-[56px] text-lg font-semibold rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white text-black active:scale-[0.98] transition-transform"
                >
                  Entrar na conta
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
