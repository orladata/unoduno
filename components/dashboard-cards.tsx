"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const MOCK_HISTORY = [
  {
    id: 1,
    title: "O Fim dos Tempos: Documentário",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    status: "Analisado",
    date: "Hoje, 10:42",
    score: 98,
  },
  {
    id: 2,
    title: "Como Criar um App Milionário",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
    status: "Roteiro Gerado",
    date: "Ontem, 15:20",
    score: 85,
  },
  {
    id: 3,
    title: "Setup de Mesa 2026 (Minimalista)",
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop",
    status: "Analisado",
    date: "12 Mai, 09:15",
    score: 92,
  },
]

export function DashboardCards() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-16 px-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Últimas Análises</h2>
          <p className="text-sm text-slate-400">Continue de onde parou.</p>
        </div>
        <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
          Ver tudo &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_HISTORY.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.5 }}
            className="group relative rounded-3xl p-[1px] overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-blue-500/30 hover:to-transparent transition-all duration-500 cursor-pointer"
          >
            {/* Glass Background */}
            <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl" />
            
            {/* Glow Effect on Hover */}
            <div className="absolute -inset-24 bg-blue-500/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative h-full bg-[#111]/40 backdrop-blur-md rounded-[23px] p-5 flex flex-col z-10 border border-white/5 group-hover:border-blue-500/20 transition-colors">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-white/10">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
                  SCORE {item.score}
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-xs font-medium text-slate-400">{item.date}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/5 border border-white/5 ${item.status.includes("Roteiro") ? "text-emerald-400" : "text-blue-400"}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
