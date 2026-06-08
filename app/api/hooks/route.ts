import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const topic = body.topic

    if (!topic || typeof topic !== "string") {
      return Response.json({ error: "Tema inválido" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
    if (!apiKey) {
      return Response.json({ error: "Chave de API não configurada" }, { status: 500 })
    }

    const google = createGoogleGenerativeAI({ apiKey })

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      temperature: 0.7,
      system: `Você é um especialista em ganchos virais para vídeos curtos no Brasil. 
Gere 5 ganchos matadores de 3-5 segundos sobre o tema fornecido.
Retorne como um JSON array de strings, sem markdown, apenas o JSON puro.`,
      prompt: topic,
    })

    const rawResponse = result.text

    // Parse the JSON array from the response safely
    let hooks: string[] = []
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
