// Esta rota foi descontinuada — usava dados simulados/mockados sem análise real.
export async function POST() {
  return Response.json(
    { error: "Funcionalidade descontinuada.", code: "DEPRECATED" },
    { status: 410 }
  )
}
