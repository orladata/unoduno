import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

export const maxDuration = 120
export const dynamic = "force-dynamic"

const RefinePayloadSchema = z.object({
  transcript: z
    .string()
    .min(50, "Transcrição muito curta para corrigir")
    .max(200000, "Transcrição muito longa"),
})

export async function POST(req: Request) {
  // Auth check
  const { userId } = await auth()

  if (!userId) {
    return Response.json(
      { error: "Não autorizado. Faça login primeiro.", code: "UNAUTHORIZED" },
      { status: 401 }
    )
  }

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    return Response.json(
      {
        error: "Chave da API Gemini não configurada no servidor.",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    )
  }

  try {
    const rawBody = await req.json()
    const validation = RefinePayloadSchema.safeParse(rawBody)

    if (!validation.success) {
      return Response.json(
        {
          error: validation.error.issues[0]?.message || "Payload inválido.",
          code: "INVALID_PAYLOAD",
        },
        { status: 400 }
      )
    }

    const { transcript } = validation.data

    const google = createGoogleGenerativeAI({ apiKey })

    const systemPrompt = `Você é um editor de texto profissional especializado em corrigir e melhorar transcrições automáticas de vídeos do YouTube.

Sua missão é pegar uma transcrição bruta (gerada automaticamente por Whisper) e transformá-la em um texto limpo, bem formatado e profissional.

REGRAS:
1. **Pontuação**: Adicione vírgulas, pontos finais, pontos de interrogação e exclamação onde necessário.
2. **Parágrafos**: Separe o texto em parágrafos lógicos. Cada mudança de assunto ou pausa natural deve começar um novo parágrafo.
3. **Capitalização**: Corrija letras maiúsculas no início de frases e nomes próprios.
4. **Palavras erradas**: Corrija erros de transcrição automática (ex: "ta" → "tá", palavras homófonas, etc.) MAS mantenha gírias e expressões coloquiais se parecerem intencionais.
5. **Fidelidade**: NÃO adicione conteúdo novo. NÃO remova conteúdo. NÃO mude o sentido ou as palavras usadas pelo falante. Apenas corrija formatação e ortografia.
6. **Formato**: Retorne APENAS o texto corrigido, sem explicações, sem comentários, sem títulos extras.
7. **Idioma**: Mantenha o idioma original da transcrição (geralmente português ou inglês).

IMPORTANTE: Não seja excessivamente formal. Mantenha o tom natural da fala do vídeo.`

    const result = streamText({
      model: google("gemini-2.0-flash"),
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Corrija e formate esta transcrição automática:\n\n${transcript}`,
        },
      ],
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[API/transcription/refine] Error:", errorMessage)

    return Response.json(
      {
        error: "Erro ao processar correção com Gemini. Tente novamente.",
        code: "PROCESSING_ERROR",
      },
      { status: 500 }
    )
  }
}
