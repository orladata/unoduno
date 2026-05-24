"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { LoginModal } from "./login-modal"

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
  const [loginModalOpen, setLoginModalOpen] = useState(false)

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
        className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-400 ease-out ${
          scrolled
            ? "py-4 bg-black/85 backdrop-blur-xl border-b border-white/10"
            : "py-6 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
              <button className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 text-white font-bold border border-white/20 hover:scale-105 transition-transform">
                W
              </button>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="hidden sm:flex items-center justify-center min-h-[44px] min-w-[100px] text-sm font-semibold px-5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white/10 border border-white/10 text-white hover:bg-white hover:text-black active:scale-95"
              >
                Entrar
              </button>
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
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setLoginModalOpen(true)
                  }}
                  className="flex items-center justify-center w-full min-h-[56px] text-lg font-semibold rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white text-black active:scale-[0.98] transition-transform"
                >
                  Entrar na conta
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
