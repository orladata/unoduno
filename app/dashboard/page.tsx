import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch processed videos
  const { data: videos, error } = await supabase
    .from('processed_videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching videos:", error)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(0,0,0,0.8)" }}>
        <Link href="/" className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Voltar
        </Link>
        <span className="text-sm font-semibold tracking-tight text-white">Unoduno Dashboard</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Sair</button>
          </form>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Meus Roteiros Analisados</h1>
          <p className="text-sm text-white/50 mt-1">Acesse e faça download instantâneo de todas as suas análises anteriores.</p>
        </div>

        {(!videos || videos.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 border border-white/5 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent shadow-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent opacity-50" />
            
            <div className="w-20 h-20 mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg relative z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Nenhum roteiro gerado ainda</h2>
            <p className="text-[15px] text-white/50 max-w-md mx-auto mb-8 relative z-10">
              Transforme seu primeiro vídeo em um roteiro viral e otimizado para o mercado brasileiro em segundos.
            </p>
            
            <Link 
              href="/#inicio" 
              className="relative z-10 group flex items-center gap-2 px-6 py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Analisar Primeiro Vídeo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {videos.map((video) => (
              <div key={video.id} className="group relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-colors duration-300">
                {/* Thumbnail Optimizada (Zero CLS) */}
                <div className="aspect-video w-full bg-white/5 relative overflow-hidden">
                  <Image 
                    src={`https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`} 
                    alt={video.title || "Thumbnail do Vídeo"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    unoptimized={true}
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1.5 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 shadow-xl">
                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Analisado
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-sm font-semibold text-white line-clamp-2 mb-3">
                    {video.title || "Análise de Vídeo"}
                  </h2>
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] text-white/40 font-mono">ID: {video.video_id}</p>
                    <p className="text-[10px] text-white/40 font-medium">
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(video.created_at || Date.now()))}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 mt-2">
                    <Link
                      href={`/analisar?url=https://youtube.com/watch?v=${video.video_id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      Ver Análise Completa
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-12 border-t border-white/10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Arsenal Neural
            </h2>
            <p className="text-sm text-white/50 mt-1">Ferramentas de IA especializadas para multiplicar seus resultados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/hooks" className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gerador de Ganchos</h3>
              <p className="text-sm text-white/50 mb-4">Crie os primeiros 3 segundos perfeitos para prender a atenção.</p>
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">Acessar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>

            <Link href="/dashboard/scorer" className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Avaliador Neural</h3>
              <p className="text-sm text-white/50 mb-4">Descubra a nota do seu roteiro e deixe a IA reescrever as falhas.</p>
              <span className="text-xs font-bold text-green-400 flex items-center gap-1">Acessar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>

            <Link href="/dashboard/repurpose" className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <div className="w-12 h-12 mb-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Máquina de Cortes</h3>
              <p className="text-sm text-white/50 mb-4">Cole um texto gigante e a IA fatia nos 3 melhores cortes virais.</p>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">Acessar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
