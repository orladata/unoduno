"use client"

import { useEffect, useState } from "react"

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "A Mágica", href: "#magica" },
  { label: "Preços", href: "#precos" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40)
          ticking = false
        })
        ticking = true
      }
    }
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6"
        style={{
          paddingTop: "16px",
          paddingBottom: "16px",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
          transition: "border-color 0.4s ease, background 0.4s ease",
          background: scrolled ? "rgba(0,0,0,0.85)" : "transparent",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a
            href="#inicio"
            className="font-black tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
            style={{ fontSize: "1.1rem", letterSpacing: "-0.03em" }}
            aria-label="Unoduno — início"
          >
            unoduno
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4" aria-label="Navegação principal">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-xs font-medium tracking-wide transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-md leading-4 py-2 px-3"
                style={{ color: activeSection === item.href ? "#fff" : "var(--text-muted)" }}
              >
                {item.label}
                {activeSection === item.href && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-white/60" />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#precos"
              className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 hover:bg-white/10 active:scale-[0.98]"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "#fff",
              }}
            >
              Entrar
            </a>

            {/* Mobile hamburger — min 44px touch target */}
            <button
              className="md:hidden flex flex-col justify-center items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              style={{ color: "#fff", width: "44px", height: "44px" }}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className="block h-0.5 w-5 rounded-full origin-center"
                style={{
                  background: "#fff",
                  transition: "transform 0.3s ease",
                  transform: menuOpen ? "translateY(5px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full"
                style={{
                  background: "#fff",
                  transition: "opacity 0.2s ease, width 0.3s ease",
                  opacity: menuOpen ? 0 : 1,
                  width: menuOpen ? "0" : "20px",
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full origin-center"
                style={{
                  background: "#fff",
                  transition: "transform 0.3s ease",
                  transform: menuOpen ? "translateY(-5px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        id="mobile-nav"
        className="fixed inset-0 z-40 flex flex-col md:hidden"
        style={{
          background: "rgba(0,0,0,0.97)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? "visible" : "hidden",
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
        }}
        aria-hidden={!menuOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false)
        }}
      >
        <nav
          className="flex flex-col items-center justify-center flex-1 gap-8"
          aria-label="Navegação mobile"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 text-3xl font-black tracking-tight text-white transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm"
              style={{ letterSpacing: "-0.03em" }}
              onClick={() => setMenuOpen(false)}
            >
              {activeSection === item.href && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
              {item.label}
            </a>
          ))}
          <a
            href="#precos"
            className="mt-4 text-sm font-semibold px-10 py-3.5 rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.98] transition-transform"
            style={{ background: "#fff", color: "#000" }}
            onClick={() => setMenuOpen(false)}
          >
            Começar agora
          </a>
        </nav>
      </div>
    </>
  )
}
