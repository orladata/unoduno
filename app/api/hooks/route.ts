import { generateHooks } from "@/lib/unoduno-neural-engine/engine"
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const topic = body.topic

    if (!topic || typeof topic !== "string") {
      return Response.json({ error: "Tema inválido" }, { status: 400 })
    }

    const rawResponse = await generateHooks(topic)
    
    // Parse the JSON array from the response safely
    let hooks = []
    try {
      const cleanText = rawResponse.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim()
      hooks = JSON.parse(cleanText)
    } catch (e) {
      // Fallback if the AI returns text instead of an array
      hooks = rawResponse.split("\n").filter(line => line.trim().length > 5).map(line => line.replace(/^[\d\-\*]*\s*/, ''))
    }

    return Response.json({ hooks })
  } catch (error) {
    console.error("[API] Error generating hooks:", error)
    return Response.json({ error: "Erro ao gerar ganchos" }, { status: 500 })
  }
}
