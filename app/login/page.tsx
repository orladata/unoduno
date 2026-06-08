"use client"

import { useTransition, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { login, signup, signInWithGoogle, resetPassword } from "./actions"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const emailSchema = z.object({
  email: z.string().email("Insira um endereço de e-mail válido"),
})

const authSchema = z.object({
  email: z.string().email("Insira um endereço de e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type LoginFormValues = {
  email: string
  password?: string
}

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [customError, setCustomError] = useState<string | null>(null)
  const [customSuccess, setCustomSuccess] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [greeting, setGreeting] = useState("bem vindo de volta")
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const messageParam = searchParams.get("message")

    if (errorParam) {
      if (errorParam === "Invalid login credentials") {
        setCustomError("Credenciais inválidas. Verifique seu e-mail e senha.")
      } else if (errorParam === "Could not create user") {
        setCustomError("Não foi possível criar a conta. Verifique os dados.")
      } else {
        setCustomError(errorParam)
      }
    }

    if (messageParam) {
      setCustomSuccess(messageParam)
    }
  }, [searchParams])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("bom dia")
    else if (hour >= 12 && hour < 18) setGreeting("boa tarde")
    else setGreeting("boa noite")
  }, [])

  const currentSchema = isForgotPassword ? emailSchema : authSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(currentSchema),
    mode: "onBlur",
  })

  useEffect(() => {
    clearErrors()
  }, [isSignUp, isForgotPassword, clearErrors])

  const handleAuthAction = (data: LoginFormValues) => {
    setCustomError(null)
    setCustomSuccess(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      
      if (isForgotPassword) {
        await resetPassword(formData)
        return
      }

      if (data.password) {
        formData.append("password", data.password)
      }

      if (isSignUp) {
        await signup(formData)
      } else {
        await login(formData)
      }
    })
  }

  const handleGoogleLogin = () => {
    setCustomError(null)
    setCustomSuccess(null)
    startTransition(async () => {
      await signInWithGoogle()
    })
  }

  const errorVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
      {/* Decorative background glow */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-violet-600/15 rounded-full blur-[100px] md:blur-[130px] pointer-events-none" 
      />

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl min-h-[550px] bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-[0_0_80px_rgba(139,92,246,0.1)] relative z-10"
      >
        {/* Left Column: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          
          <motion.div layout="position" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-wider lowercase">unoduno</span>
          </motion.div>

          <motion.div layout="position" className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight lowercase">
              {isForgotPassword ? "recuperar senha" : isSignUp ? "criar minha conta" : greeting}
            </h1>
            <p className="text-xs text-white/50 mt-1">
              {isForgotPassword
                ? "Digite seu e-mail cadastrado e enviaremos um link."
                : isSignUp 
                  ? "Preencha os dados abaixo para começar a analisar." 
                  : "Faça login para gerenciar suas análises."}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(handleAuthAction)} className="flex flex-col gap-4">
            <motion.div layout="position" className="relative">
              <input
                {...register("email")}
                className={`peer w-full px-4 pt-5 pb-2 bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 hover:border-white/20 focus:border-violet-500/50'} rounded-xl text-sm text-white placeholder-transparent focus:outline-none transition-all`}
                id="email"
                type="email"
                placeholder="E-mail"
                disabled={isPending}
              />
              <label 
                htmlFor="email"
                className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-widest transition-all peer-placeholder-shown:text-[13px] peer-placeholder-shown:text-white/30 peer-placeholder-shown:top-3.5 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:text-violet-400 peer-focus:top-1 peer-focus:uppercase peer-focus:tracking-widest cursor-text"
              >
                E-mail
              </label>
              <AnimatePresence>
                {errors.email && (
                  <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[11px] text-red-400 ml-1 mt-1 font-medium block">{errors.email.message}</motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="popLayout">
              {!isForgotPassword && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <input
                    {...register("password")}
                    className={`peer w-full px-4 pt-5 pb-2 bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 hover:border-white/20 focus:border-violet-500/50'} rounded-xl text-sm text-white placeholder-transparent focus:outline-none transition-all pr-12`}
                    id="password"
                    type="password"
                    placeholder="Senha"
                    disabled={isPending}
                  />
                  <label 
                    htmlFor="password"
                    className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-widest transition-all peer-placeholder-shown:text-[13px] peer-placeholder-shown:text-white/30 peer-placeholder-shown:top-3.5 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:text-violet-400 peer-focus:top-1 peer-focus:uppercase peer-focus:tracking-widest cursor-text"
                  >
                    Senha
                  </label>
                  
                  {/* Forgot Password Link inside the input box on desktop/mobile */}
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true)
                        setCustomError(null)
                        setCustomSuccess(null)
                      }}
                      className="absolute right-3 top-3.5 text-[10px] text-white/30 hover:text-white transition-colors font-medium cursor-pointer uppercase tracking-wider"
                    >
                      Esqueceu?
                    </button>
                  )}
                  
                  <AnimatePresence>
                    {errors.password && (
                      <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[11px] text-red-400 ml-1 mt-1 font-medium block">{errors.password.message}</motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {customError && (
                <motion.div variants={errorVariants} initial="hidden" animate="visible" exit="exit" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{customError}</span>
                </motion.div>
              )}
              {customSuccess && (
                <motion.div variants={errorVariants} initial="hidden" animate="visible" exit="exit" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  <span>{customSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              layout="position"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black font-semibold py-3 mt-2 rounded-xl hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2 h-[44px] shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
            >
              {isPending ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (isForgotPassword ? "Enviar link" : isSignUp ? "Criar minha conta" : "Conectar")}
            </motion.button>

            <AnimatePresence mode="popLayout">
              {!isForgotPassword ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col w-full"
                >
                  <div className="flex items-center gap-3 my-2 opacity-30">
                    <div className="flex-1 h-px bg-white" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">Ou</span>
                    <div className="flex-1 h-px bg-white" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isPending}
                    className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-3 h-[44px]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </motion.button>

                  <p className="text-center text-xs text-white/50 mt-4">
                    {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
                    <button type="button" onClick={() => { setIsSignUp(!isSignUp); setCustomError(null); setCustomSuccess(null) }} className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4">
                      {isSignUp ? "Conecte-se" : "Cadastre-se"}
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  key="back-login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setCustomError(null); setCustomSuccess(null) }}
                  className="text-center text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 mt-2"
                >
                  Voltar para o login
                </motion.button>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right Column: Premium Visual Feature */}
        <div className="hidden md:flex md:w-1/2 bg-black/40 border-l border-white/5 relative p-12 flex-col justify-center items-center overflow-hidden">
          
          <div className="absolute inset-0 opacity-15 flex items-center justify-center">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.1" strokeDasharray="1 3">
              <circle cx="50" cy="50" r="10" /><circle cx="50" cy="50" r="25" /><circle cx="50" cy="50" r="40" />
              <line x1="50" y1="0" x2="50" y2="100" /><line x1="0" y1="50" x2="100" y2="50" />
              <line x1="15" y1="15" x2="85" y2="85" /><line x1="15" y1="85" x2="85" y2="15" />
            </svg>
          </div>

          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[85%] bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-2xl relative z-10 backdrop-blur-md group"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="red" className="text-red-500"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z"/></svg>
                </div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Vídeo em Foco</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                98.7% Viral
              </div>
            </div>

            <div className="h-16 flex items-end gap-1 mb-4 border-b border-white/5 pb-3">
              {[30, 45, 35, 60, 50, 75, 95, 80, 85, 98, 70, 55, 65, 80, 75, 90, 100, 85, 95, 40].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: "10%" }}
                  animate={{ height: [`${h * 0.7}%`, `${h}%`, `${h * 0.8}%`] }}
                  transition={{ duration: 1.5 + Math.random(), repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className={`flex-1 rounded-t-sm ${i > 10 ? 'bg-violet-500' : 'bg-white/20'}`}
                />
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Melhor Gancho Gerado</div>
              <div className="p-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white/90 italic leading-relaxed">
                "Este segredo do YouTube vai mudar tudo o que você sabe..."
              </div>
            </div>

            <div className="absolute -inset-px rounded-2xl border border-transparent group-hover:border-violet-500/30 pointer-events-none transition-colors duration-500" />
          </motion.div>

          <div className="mt-8 text-center max-w-[280px]">
            <h3 className="text-sm font-semibold text-white">Análise em Tempo Real</h3>
            <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
              Descubra os melhores ganchos e estratégias de viralização de qualquer vídeo em menos de um segundo usando a nossa IA.
            </p>
          </div>
        </div>
      </motion.div>

      <p className="absolute bottom-4 text-center text-[10px] text-white/30 px-4 max-w-sm pointer-events-none">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="/termos" className="underline hover:text-white/50 pointer-events-auto">Termos</a> e{" "}
        <a href="/privacidade" className="underline hover:text-white/50 pointer-events-auto">Privacidade</a>.
      </p>
    </div>
  )
}
