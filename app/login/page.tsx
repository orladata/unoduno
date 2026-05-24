"use client"

import { useTransition, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { login, signup, signInWithGoogle, resetPassword } from "./actions"
import { useSearchParams } from "next/navigation"

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

  // Dynamic schema resolution
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

  // Clear errors when toggling modes
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

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-violet-600/10 rounded-full blur-[100px] md:blur-[130px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-4xl min-h-[550px] bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10">
        
        {/* Left Column: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-wider lowercase">unoduno</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight lowercase">
              {isForgotPassword 
                ? "recuperar senha" 
                : isSignUp 
                  ? "criar minha conta" 
                  : "bem vindo de volta"
              }
            </h1>
            <p className="text-xs text-white/50 mt-1">
              {isForgotPassword
                ? "Digite seu e-mail cadastrado e enviaremos um link de recuperação."
                : isSignUp 
                  ? "Preencha os dados abaixo para começar a analisar vídeos." 
                  : "Faça login para gerenciar suas análises de vídeo."
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleAuthAction)} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white/60 ml-1 uppercase tracking-wider" htmlFor="email">
                E-mail
              </label>
              <input
                {...register("email")}
                className={`px-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500/50 focus:ring-red-500/10' : 'border-white/10 focus:ring-white/10'} rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all`}
                id="email"
                type="email"
                placeholder="exemplo@exemplo.com"
                disabled={isPending}
              />
              {errors.email && (
                <span className="text-[11px] text-red-400 ml-1 font-medium">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field (Hidden in Forgot Password state) */}
            {!isForgotPassword && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider" htmlFor="password">
                    Senha
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true)
                        setCustomError(null)
                        setCustomSuccess(null)
                      }}
                      className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-medium cursor-pointer"
                    >
                      Esqueceu sua senha?
                    </button>
                  )}
                </div>
                <input
                  {...register("password")}
                  className={`px-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500/50 focus:ring-red-500/10' : 'border-white/10 focus:ring-white/10'} rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all`}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                />
                {errors.password && (
                  <span className="text-[11px] text-red-400 ml-1 font-medium">{errors.password.message}</span>
                )}
              </div>
            )}

            {/* Error Message */}
            {customError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{customError}</span>
              </div>
            )}

            {/* Success Message */}
            {customSuccess && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{customSuccess}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black font-semibold py-3 mt-2 rounded-xl hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 h-[44px]"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                isForgotPassword
                  ? "Enviar link de recuperação"
                  : isSignUp 
                    ? "Criar minha conta" 
                    : "Conecte-se"
              )}
            </button>

            {/* Social Authentication and Toggle Links (Hidden in Forgot Password) */}
            {!isForgotPassword ? (
              <>
                {/* Social Divider */}
                <div className="flex items-center gap-3 my-2 opacity-30">
                  <div className="flex-1 h-px bg-white" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">Ou continue com</span>
                  <div className="flex-1 h-px bg-white" />
                </div>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isPending}
                  className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 h-[44px]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

                {/* Toggle Link */}
                <p className="text-center text-xs text-white/50 mt-4">
                  {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setCustomError(null)
                      setCustomSuccess(null)
                    }}
                    className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
                  >
                    {isSignUp ? "Conecte-se" : "Cadastre-se"}
                  </button>
                </p>
              </>
            ) : (
              /* Back to Login Link in Forgot Password state */
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setCustomError(null)
                  setCustomSuccess(null)
                }}
                className="text-center text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 mt-2"
              >
                Voltar para o login
              </button>
            )}

          </form>
        </div>

        {/* Right Column: Premium Visual Feature (Teaser) */}
        <div className="hidden md:flex md:w-1/2 bg-[#101010] border-l border-white/5 relative p-12 flex-col justify-center items-center overflow-hidden">
          
          {/* Subtle starburst grid decoration */}
          <div className="absolute inset-0 opacity-15 flex items-center justify-center">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.1" strokeDasharray="1 3">
              <circle cx="50" cy="50" r="10" />
              <circle cx="50" cy="50" r="25" />
              <circle cx="50" cy="50" r="40" />
              <line x1="50" y1="0" x2="50" y2="100" />
              <line x1="0" y1="50" x2="100" y2="50" />
              <line x1="15" y1="15" x2="85" y2="85" />
              <line x1="15" y1="85" x2="85" y2="15" />
            </svg>
          </div>

          {/* Floating Glassmorphic Mock Analytics Card */}
          <div className="w-[85%] bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-2xl relative z-10 backdrop-blur-md transition-all duration-500 hover:scale-[1.03] hover:border-violet-500/20 group">
            
            {/* Card Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="red" className="text-red-500">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Vídeo em Foco</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                98.7% Viral
              </div>
            </div>

            {/* Waveform/Metric Visualizer */}
            <div className="h-16 flex items-end gap-1 mb-4 border-b border-white/5 pb-3">
              {[30, 45, 35, 60, 50, 75, 95, 80, 85, 98, 70, 55, 65, 80, 75, 90, 100, 85, 95, 40].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500 group-hover:bg-violet-400 ${
                    i > 10 ? 'bg-violet-500' : 'bg-white/10'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Hook Highlight Info */}
            <div className="space-y-2">
              <div className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Melhor Gancho Gerado</div>
              <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white/90 italic leading-relaxed">
                "Este segredo do YouTube vai mudar tudo o que você sabe..."
              </div>
            </div>

            {/* Glowing Accent Ring */}
            <div className="absolute -inset-px rounded-2xl border border-transparent group-hover:border-violet-500/10 pointer-events-none transition-colors duration-500" />
          </div>

          {/* Copy/Marketing Copy */}
          <div className="mt-8 text-center max-w-[280px]">
            <h3 className="text-sm font-semibold text-white">Velocidade da Luz na Análise</h3>
            <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
              Descubra os melhores ganchos, transcrições completas e estratégias de viralização de qualquer vídeo em menos de um segundo.
            </p>
          </div>

        </div>

      </div>

      {/* Outer Bottom Disclaimer */}
      <p className="absolute bottom-4 text-center text-[10px] text-white/30 px-4 max-w-sm pointer-events-none">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="/termos" className="underline hover:text-white/50 pointer-events-auto">Termos de Serviço</a>{" "}
        e{" "}
        <a href="/privacidade" className="underline hover:text-white/50 pointer-events-auto">Política de Privacidade</a>.
      </p>
    </div>
  )
}
