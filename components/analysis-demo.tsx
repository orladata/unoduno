"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function AnalysisDemo() {
  const [activeTab, setActiveTab] = useState("transcript")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="hidden lg:grid grid-cols-3 gap-8 mt-12"
    >
      {/* Left - Transcription Preview */}
      <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Como Criar um App Milionário
          </h2>
          <p className="text-sm text-white/60">
            Tech Talk Daily • 12:34
          </p>

          <div className="flex flex-wrap gap-2 pt-4">
            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white/80">
              Empreendedorismo
            </span>
            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white/80">
              Tecnologia
            </span>
            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white/80">
              Startup
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-white/5" />

        <div className="space-y-4 max-h-[400px] overflow-hidden">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
            Transcrição Completa
          </p>
          <div className="space-y-4 text-sm leading-relaxed text-white/80">
            <p>
              Então hoje vamos falar sobre como criar um aplicativo que realmente gera renda. Muitos empreendedores cometem o erro de focar só em features, mas na verdade o que importa é resolver um problema real.
            </p>
            <p>
              O primeiro passo é validar sua ideia. Você precisa conversar com seus potenciais usuários e entender exatamente qual dor você está resolvendo.
            </p>
            <p>
              A segunda coisa é construir um MVP mínimo. Não tente fazer tudo perfeito na primeira versão. Você vai aprender muito mais lançando algo simples e iterando.
            </p>
          </div>
          <div className="text-center pt-4 text-xs text-white/40">
            [Mais conteúdo] ↓
          </div>
        </div>
      </div>

      {/* Right - Insights Sidebar */}
      <div className="space-y-6">
        {/* Chapters */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
            Capítulos
          </h3>
          <div className="space-y-2">
            {[
              { time: "0:00", title: "Introdução" },
              { time: "1:23", title: "Validação de Ideia" },
              { time: "4:45", title: "MVP e Iteração" },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono text-white/40 group-hover:text-white/60 mt-0.5">
                    {item.time}
                  </span>
                  <span className="text-xs text-white/70 group-hover:text-white">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Insights
          </h3>
          <div className="space-y-3">
            {[
              { icon: "💡", title: "Hook", desc: "Abertura forte com pergunta" },
              { icon: "📊", title: "Dados", desc: "3 argumentos principais" },
              { icon: "🎯", title: "CTA", desc: "Call to action claro" },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-lg mb-2">{item.icon}</div>
                <p className="text-xs font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/60 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <button className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar
        </button>
      </div>
    </motion.div>
  )
}
