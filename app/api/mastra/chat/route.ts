// Esta rota foi descontinuada. Use /api/chat
export async function POST() {
  return Response.json(
    { error: "Use /api/chat.", code: "DEPRECATED" },
    { status: 410 }
  )
}
