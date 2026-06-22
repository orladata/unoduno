import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TranscriptionsClient } from "@/components/transcriptions-client"

export const metadata = {
  title: "Histórico de Transcrições - Unoduno",
  description: "Visualize, gerencie e refine suas transcrições anteriores",
}

export default async function TranscricoesPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  return <TranscriptionsClient />
}
