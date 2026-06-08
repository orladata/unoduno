// Esta rota foi descontinuada. A análise principal é feita em /api/chat
export async function POST() {
  return Response.json(
    { error: "Use /api/chat para análise de vídeos.", code: "DEPRECATED" },
    { status: 410 }
  )
}
