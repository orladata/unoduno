"use server"

export type ViralVideo = {
  id: string
  title: string
  thumbnailUrl: string
  channelTitle: string
  viewCount: string
  publishedAt: string
}

// Formatar visualizações (ex: 1200000 -> "1.2M")
function formatViews(viewCountStr: string): string {
  const views = parseInt(viewCountStr, 10)
  if (isNaN(views)) return "0 visualizações"

  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M visualizações"
  }
  if (views >= 1_000) {
    return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "K visualizações"
  }
  return `${views} visualizações`
}

// Formatar data (ex: há 2 dias)
function formatTimeAgo(dateStr: string): string {
  const publishedAt = new Date(dateStr)
  const now = new Date()
  const diffInMs = now.getTime() - publishedAt.getTime()
  
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) {
    return `há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`
  }
  if (diffInHours > 0) {
    return `há ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`
  }
  return "há pouco tempo"
}

export async function getViralVideos(): Promise<ViralVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY não está configurada. Retornando array vazio.")
    return []
  }

  try {
    // Buscamos os vídeos mais populares no BRASIL (chart=mostPopular, regionCode=BR)
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatistics&chart=mostPopular&regionCode=BR&maxResults=6&key=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache de 1 hora para economizar cota da API
      }
    )

    if (!response.ok) {
      throw new Error(`YouTube API respondeu com erro: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || !Array.isArray(data.items)) {
      return []
    }

    return data.items.map((item: any) => {
      // Tentar pegar a thumbnail de melhor qualidade possível
      const thumbnails = item.snippet?.thumbnails || {}
      const bestThumbnail = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || ""

      return {
        id: item.id,
        title: item.snippet?.title || "Vídeo",
        thumbnailUrl: bestThumbnail,
        channelTitle: item.snippet?.channelTitle || "Canal desconhecido",
        viewCount: formatViews(item.statistics?.viewCount || "0"),
        publishedAt: formatTimeAgo(item.snippet?.publishedAt || new Date().toISOString())
      }
    })
  } catch (error) {
    console.error("Falha ao buscar virais reais do YouTube:", error)
    return []
  }
}
