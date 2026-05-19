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
          <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-2xl bg-white/5">
            <span className="text-4xl mb-4">📭</span>
            <p className="text-white font-medium">Nenhum roteiro encontrado</p>
            <p className="text-xs text-white/50 mt-1">Volte à página inicial e analise seu primeiro vídeo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <h2 className="text-sm font-semibold text-white line-clamp-2 mb-4">
                    {video.title || "Análise de Vídeo"}
                  </h2>
                  <p className="text-[10px] text-white/40 font-mono mb-4">ID: {video.video_id}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href={video.script_blob_url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      JSON
                    </a>
                    <a 
                      href={video.transcription_blob_url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Texto
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
