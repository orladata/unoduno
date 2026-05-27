import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

/**
 * Stub do Neural Engine para geração de hooks virais.
 * Utiliza o Gemini Flash para gerar ganchos de alta retenção.
 */
export async function generateHooks(topic: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não configurada")
  }

  const google = createGoogleGenerativeAI({ apiKey })

  const result = await generateText({
    model: google("gemini-2.0-flash"),
    temperature: 0.7,
    system: `Você é um especialista em ganchos virais para vídeos curtos no Brasil. 
Gere 5 ganchos matadores de 3-5 segundos sobre o tema fornecido.
Retorne como um JSON array de strings.`,
    prompt: topic,
  })

  return result.text
}
