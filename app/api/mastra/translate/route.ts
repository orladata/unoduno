// Esta rota foi descontinuada.
export async function POST() {
  return Response.json(
    { error: "Funcionalidade descontinuada.", code: "DEPRECATED" },
    { status: 410 }
  )
}
