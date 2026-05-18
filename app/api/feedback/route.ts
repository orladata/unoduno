import { feedbackInputSchema, saveFeedback } from "@/lib/db"

export const maxDuration = 10

export async function POST(req: Request) {
  // 1. Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Corpo da requisição inválido" }, { status: 400 })
  }

  // 2. Validate with Zod schema from db.ts
  const parsed = feedbackInputSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.errors[0]?.message ?? "Dados de feedback inválidos" },
      { status: 422 }
    )
  }

  // 3. Persist feedback — verifies analysis ownership inside saveFeedback
  try {
    const id = await saveFeedback(parsed.data)
    return Response.json({ success: true, id }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao salvar feedback"
    // Return 404 if analysis not found — prevents enumeration
    const status = message.includes("não encontrada") ? 404 : 500
    return Response.json({ error: message }, { status })
  }
}
