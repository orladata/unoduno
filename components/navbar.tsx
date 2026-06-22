"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useProfile } from "@/app/dashboard/profile-context"
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs"

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
            ? "max-w-5xl bg-black/40 backdrop-blur-3xl shadow-[0_0_30px_rgba(0,255,65,0.1)] border border-[#00ff41]/[0.15] rounded-2xl py-3 px-8"
            : "max-w-6xl bg-transparent border border-transparent py-6 px-0"
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
            <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] group ${
                    activeSection === item.href ? "text-[#00ff41] bg-[#00ff41]/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-4">
            {/* Clerk Integration */}
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border border-white/20",
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <div className="hidden sm:block">
                <Link href="/sign-in" className="flex items-center justify-center min-h-[44px] min-w-[100px] text-sm font-semibold px-5 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] bg-[#00ff41] border border-[#00ff41] text-black hover:bg-[#00ff41]/90 active:scale-95">
                  Entrar
                </Link>
              </div>
            </SignedOut>

            {/* Mobile hamburger — 48x48px min touch target compliant */}
            <button
              className="md:hidden flex flex-col justify-center items-center gap-1.5 w-12 h-12 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]/20 active:bg-[#00ff41]/20 transition-colors"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={`block h-[2px] w-5 rounded-full bg-[#00ff41] transition-transform duration-300 ${
                  menuOpen ? "translate-y-[8px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] rounded-full bg-[#00ff41] transition-all duration-300 ${
                  menuOpen ? "w-0 opacity-0" : "w-5 opacity-100"
                }`}
              />
              <span
                className={`block h-[2px] w-5 rounded-full bg-[#00ff41] transition-transform duration-300 ${
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
            <nav className="flex flex-col flex-1 justify-center gap-6" aria-label="Navegação mobile">
              {navLinks.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                  className={`text-3xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] rounded-lg p-2 -ml-2 transition-colors ${
                    activeSection === item.href ? "text-[#00ff41]" : "text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={`inline-block mr-3 transition-transform ${activeSection === item.href ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>
                    <span className="block w-2 h-2 rounded-full bg-[#00ff41]" />
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
              <SignedOut>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full min-h-[56px] text-lg font-semibold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] bg-[#00ff41] text-black active:scale-[0.98] transition-transform"
                >
                  Entrar na conta
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full min-h-[56px] text-lg font-semibold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] bg-[#00ff41]/20 hover:bg-[#00ff41]/30 text-[#00ff41] active:scale-[0.98] transition-transform"
                >
                  Ir para Painel
                </Link>
              </SignedIn>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
