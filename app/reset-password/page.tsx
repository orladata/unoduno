"use client"

import { useTransition, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updatePassword } from "./actions"
import { useSearchParams } from "next/navigation"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [customError, setCustomError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setCustomError(errorParam)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  })

  const onSubmit = (data: ResetPasswordValues) => {
    setCustomError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("password", data.password)
      await updatePassword(formData)
    })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-violet-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* Card Container */}
      <div className="w-full max-w-md p-8 md:p-10 bg-[#0c0c0c]/85 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl relative z-10">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-base font-bold text-white tracking-wider lowercase">unoduno</span>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight lowercase">
            redefinir senha
          </h1>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            Digite sua nova senha de acesso nos campos abaixo para atualizar sua conta.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* New Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-white/60 ml-1 uppercase tracking-wider" htmlFor="password">
              Nova Senha
            </label>
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

          {/* Confirm New Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-white/60 ml-1 uppercase tracking-wider" htmlFor="confirmPassword">
              Confirmar Senha
            </label>
            <input
              {...register("confirmPassword")}
              className={`px-4 py-3 bg-white/5 border ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/10' : 'border-white/10 focus:ring-white/10'} rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all`}
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isPending}
            />
            {errors.confirmPassword && (
              <span className="text-[11px] text-red-400 ml-1 font-medium">{errors.confirmPassword.message}</span>
            )}
          </div>

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white text-black font-semibold py-3 mt-2 rounded-xl hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 h-[44px]"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              "Atualizar Senha"
            )}
          </button>

          {/* Back to Login Link */}
          <a
            href="/login"
            className="text-center text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 mt-2 block"
          >
            Voltar para o login
          </a>

        </form>
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
