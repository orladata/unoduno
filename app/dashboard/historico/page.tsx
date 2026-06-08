import { createClient as createServerClient } from "@/utils/supabase/server"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { HistoricoClient } from "./historico-client"

async function fetchYouTubeViews(videoId: string): Promise<string | null> {
  const fetchPromise = (async () => {
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        next: { revalidate: 3600 }
      })
      const html = await res.text()
      const match = html.match(/<meta itemprop="interactionCount" content="(\d+)"/)
      return match ? new Intl.NumberFormat('pt-BR').format(Number(match[1])) : null
    } catch {
      return null
    }
  })()

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
  return Promise.race([fetchPromise, timeoutPromise])
}

export default async function HistoricoPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createServerClient()

  const { data: historyData, error } = await supabase
    .from("processed_videos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao carregar histórico:", error)
  }

  const videosWithViews = await Promise.all(
    (historyData || []).map(async (item) => {
      const views = await fetchYouTubeViews(item.video_id)
      return { ...item, views }
    })
  )

  return (
    <HistoricoClient initialData={videosWithViews} />
  )
}
