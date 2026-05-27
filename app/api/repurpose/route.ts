// =============================================================================
// ROTA TEMPORARIAMENTE DESATIVADA
// =============================================================================
// Esta rota dependia do Mastra AI via lib/unoduno-neural-engine/engine.ts
// que foi removido durante a limpeza do projeto.
//
// Para reimplementar, usar Vercel AI SDK (@ai-sdk/google + ai) diretamente,
// seguindo o padrão já usado em /api/chat/route.ts
// =============================================================================

// import { repurposeContent } from "@/lib/unoduno-neural-engine/engine"
// import { createClient } from '@/utils/supabase/server'
//
// export async function POST(req: Request) {
//   try {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()
//
//     if (!user) {
//       return Response.json({ error: "Não autorizado" }, { status: 401 })
//     }
//
//     const body = await req.json()
//     const transcription = body.transcription
//
//     if (!transcription || typeof transcription !== "string" || transcription.length < 200) {
//       return Response.json({ error: "O texto fornecido é muito curto. Cole a transcrição de um vídeo ou podcast longo." }, { status: 400 })
//     }
//
//     const rawResponse = await repurposeContent(transcription)
//
//     return Response.json({ markdown: rawResponse })
//   } catch (error) {
//     console.error("[API] Error repurposing content:", error)
//     return Response.json({ error: "Erro ao gerar cortes virais" }, { status: 500 })
//   }
// }

export async function POST() {
  return Response.json(
    { error: "Esta funcionalidade está temporariamente desativada para manutenção.", code: "FEATURE_DISABLED" },
    { status: 503 }
  )
}
