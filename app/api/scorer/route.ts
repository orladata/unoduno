// =============================================================================
// ROTA TEMPORARIAMENTE DESATIVADA
// =============================================================================
// Esta rota dependia do Mastra AI via lib/unoduno-neural-engine/engine.ts
// que foi removido durante a limpeza do projeto.
//
// Para reimplementar, usar Vercel AI SDK (@ai-sdk/google + ai) diretamente,
// seguindo o padrão já usado em /api/chat/route.ts
// =============================================================================

// import { reviewScript } from "@/lib/unoduno-neural-engine/engine"
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
//     const script = body.script
//
//     if (!script || typeof script !== "string" || script.length < 50) {
//       return Response.json({ error: "O roteiro é muito curto para ser avaliado. Escreva pelo menos algumas frases." }, { status: 400 })
//     }
//
//     const rawResponse = await reviewScript(script)
//     
//     // Parse JSON
//     let result = null
//     try {
//       const cleanText = rawResponse.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim()
//       result = JSON.parse(cleanText)
//     } catch (e) {
//       return Response.json({ error: "A IA não conseguiu estruturar a análise. Tente novamente." }, { status: 500 })
//     }
//
//     return Response.json(result)
//   } catch (error) {
//     console.error("[API] Error scoring script:", error)
//     return Response.json({ error: "Erro ao avaliar roteiro" }, { status: 500 })
//   }
// }

export async function POST() {
  return Response.json(
    { error: "Esta funcionalidade está temporariamente desativada para manutenção.", code: "FEATURE_DISABLED" },
    { status: 503 }
  )
}
