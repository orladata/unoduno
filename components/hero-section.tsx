"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { youtubeUrlSchema, buildAnalysisUrl } from "@/lib/validations"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

const ViralVideosModal = dynamic(() => import("./viral-videos-modal").then(mod => mod.ViralVideosModal), { ssr: false })

// Strict type definitions
interface FormState {
  readonly url: string
  readonly isSubmitting: boolean
  readonly error: string | null
  readonly success: boolean
}

type FormAction =
  | { type: "SET_URL"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_SUCCESS"; payload: boolean }
  | { type: "RESET" }

const initialFormState: FormState = {
  url: "",
  isSubmitting: false,
  error: null,
  success: false,
}

export function HeroSection(): React.ReactElement {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [scrollHidden, setScrollHidden] = useState<boolean>(false)
  const [isViralModalOpen, setIsViralModalOpen] = useState(false)

  // Destructure for cleaner code
  const { url, isSubmitting, error, success } = formState

  // Update form state helper
  const updateForm = useCallback((action: FormAction): void => {
    setFormState((prev) => {
      switch (action.type) {
        case "SET_URL":
          return { ...prev, url: action.payload, error: null }
        case "SET_ERROR":
          return { ...prev, error: action.payload }
        case "SET_SUBMITTING":
          return { ...prev, isSubmitting: action.payload }
        case "SET_SUCCESS":
          return { ...prev, success: action.payload }
        case "RESET":
          return initialFormState
        default:
          return prev
      }
    })
  }, [])

  // Hide scroll hint after user scrolls
  useEffect(() => {
    let ticking = false
    const handleScroll = (): void => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 100) setScrollHidden(true)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Form submission handler with Zod validation
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault()

      // Validate input with Zod schema
      const validation = youtubeUrlSchema.safeParse(url)

      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message ?? "URL inválida"
        updateForm({ type: "SET_ERROR", payload: errorMessage })
        // Trigger haptic feedback for mobile error
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([50, 50, 50])
        }
        return
      }

      updateForm({ type: "SET_SUBMITTING", payload: true })
      updateForm({ type: "SET_SUCCESS", payload: true })
      
      // Trigger haptic success
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100)
      }

      // Redirect to analysis page after brief delay
      const redirectTimeout = setTimeout(() => {
        try {
          const analysisUrl = buildAnalysisUrl(validation.data)
          // @ts-expect-error - dynamic URL with query params
          router.push(analysisUrl)
        } catch (err) {
          updateForm({ type: "SET_ERROR", payload: "Erro ao processar URL" })
          updateForm({ type: "SET_SUBMITTING", payload: false })
          updateForm({ type: "SET_SUCCESS", payload: false })
        }
      }, 1500)

    },
    [url, router, updateForm]
  )

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      updateForm({ type: "SET_URL", payload: e.target.value })
    },
    [updateForm]
  )

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <section
      id="inicio"
      className="relative flex flex-col items-center min-h-dvh px-6 pt-32 pb-20 text-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Aurora & Grid Background */}
      <div className="absolute inset-0 -z-10 bg-black" aria-hidden="true">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Aurora Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl flex flex-col items-center z-10"
      >
        {/* Live Counter Badge (CRO) */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 bg-white/5 border border-emerald-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] tracking-[0.1em] uppercase font-bold text-emerald-100/90">
            12.458 roteiros gerados esta semana
          </span>
        </motion.div>

        {/* H1 Typography Overhaul */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-[6rem] font-black leading-[1.05] tracking-tighter mb-6 text-balance text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
        >
          Onde o viral
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">se torna seu.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-12 text-slate-400"
        >
          Cole qualquer URL do YouTube e deixe nossos agentes neurais criarem o roteiro perfeito para o mercado brasileiro — com ganchos virais e precisão de retenção.
        </motion.p>

        {/* Input + CTA */}
        <motion.div variants={itemVariants} className="w-full max-w-2xl mx-auto mb-20 relative z-20">
          <motion.form
            onSubmit={handleSubmit}
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl transition-all duration-300 backdrop-blur-xl ${
              error
                ? "bg-red-950/20 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                : "bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] focus-within:border-blue-500/50 focus-within:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:border-white/20"
            }`}
            aria-label="Analisar vídeo do YouTube"
            noValidate
          >
            <label htmlFor="youtube-url" className="sr-only">URL do YouTube</label>
            <div className="relative flex-1 flex items-center px-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 mr-2 shrink-0">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <input
                id="youtube-url"
                type="text"
                inputMode="url"
                value={url}
                onChange={handleInputChange}
                placeholder="Cole o link de um vídeo viral gringo..."
                className="w-full bg-transparent py-3 text-[15px] outline-none text-white font-sans disabled:opacity-50 placeholder:text-white/30"
                aria-required="true"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden shrink-0 px-8 py-3.5 sm:py-3 rounded-xl text-[15px] font-bold tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.8)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  <span>Analisar</span>
                </>
              )}
            </button>
          </motion.form>

          {/* Quick Action Pills (Fura-Bloqueio CRO) -> Trocado por Modal Dinâmico */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            <span className="text-[12px] font-medium text-slate-400 w-full sm:w-auto mb-2 sm:mb-0 mr-1">
              Sem ideias? Teste um viral real:
            </span>
            <button
              type="button"
              onClick={() => {
                setIsViralModalOpen(true)
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50)
              }}
              className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] font-medium text-slate-200 transition-colors active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:border-emerald-500/30"
            >
              <span className="text-red-500">🔥</span> Ver vídeos em alta hoje
            </button>
          </motion.div>

          <ViralVideosModal 
            isOpen={isViralModalOpen} 
            onClose={() => setIsViralModalOpen(false)} 
            onSelect={(selectedUrl) => {
              updateForm({ type: "SET_URL", payload: selectedUrl })
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50)
            }} 
          />

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-red-400 mt-3 text-left pl-4">
                {error}
              </motion.p>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center gap-2 mt-4 text-[15px] font-medium text-emerald-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                Iniciando engenharia reversa...
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Glassmorphism Mockup */}
        <motion.div
          variants={itemVariants}
          className="w-full relative z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, type: "spring" }}
        >
          {/* Subtle Glow behind the mockup */}
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full scale-75" />
          
          <div className="relative mx-auto w-full max-w-4xl rounded-t-3xl border-t border-l border-r border-white/10 bg-black/40 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl overflow-hidden" style={{ transform: "perspective(1000px) rotateX(10deg)", transformOrigin: "bottom" }}>
            {/* Fake Mac Window Controls */}
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            {/* Fake Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 h-40 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-4 rounded-md bg-white/10 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-400" /></div>
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-3 rounded bg-white/10" />
                  <div className="w-1/2 h-3 rounded bg-white/10" />
                </div>
              </div>
              <div className="h-40 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-white/5 p-4 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md" />
                <div className="w-full h-2 rounded bg-white/10 mt-auto overflow-hidden">
                  <div className="w-[60%] h-full bg-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
