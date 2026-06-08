import { createClient as createServerClient } from "@/utils/supabase/server"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ViralEngineerAnalysis } from "@/components/viral-engineer-analysis"

export default async function CachedAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createServerClient()

  const { data: record, error } = await supabase
    .from("processed_videos")
    .select("script_blob_url")
    .eq("video_id", id)
    .eq("user_id", userId)
    .single()

  if (error || !record || !record.script_blob_url) {
    // Se não encontrou no banco ou não é dono
    redirect("/dashboard/historico")
  }

  let analysisData = null
  try {
    const res = await fetch(record.script_blob_url, { cache: "no-store" })
    if (res.ok) {
      analysisData = await res.json()
    } else {
      console.error("Erro ao baixar JSON do R2", res.status)
    }
  } catch (err) {
    console.error("Falha de conexão com o R2", err)
  }

  if (!analysisData) {
    return (
      <main className="w-full max-w-4xl mx-auto py-16 px-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Erro ao carregar análise</h1>
        <p className="text-gray-400">O arquivo de análise não pôde ser lido ou foi corrompido.</p>
      </main>
    )
  }

  return (
    <main className="w-full mx-auto py-12 px-6">
      <div className="max-w-4xl mx-auto mb-8">
        <a href="/dashboard/historico" className="text-sm text-blue-400 hover:underline flex items-center gap-2 w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar para o Histórico
        </a>
      </div>
      <ViralEngineerAnalysis analysis={analysisData} isLoading={false} />
    </main>
  )
}
