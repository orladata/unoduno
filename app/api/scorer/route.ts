export async function POST() {
  return Response.json(
    { error: "Esta funcionalidade está desativada.", code: "FEATURE_DISABLED" },
    { status: 503 }
  )
}
