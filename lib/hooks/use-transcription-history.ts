import useSWR from "swr"
import { useState, useCallback } from "react"

export type Transcription = {
  id: string
  user_id: string
  video_id: string | null
  title: string | null
  original_transcript: string
  refined_transcript: string | null
  thumbnail_url: string | null
  word_count: number
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTranscriptionHistory() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"recent" | "oldest" | "longest">("recent")
  const [page, setPage] = useState(0)
  const pageSize = 20

  const queryParams = new URLSearchParams({
    search,
    sort,
    limit: pageSize.toString(),
    offset: (page * pageSize).toString(),
  })

  const { data, error, isLoading, mutate } = useSWR<{
    data: Transcription[]
    count: number
    total: number
  }>(
    `/api/transcription-history?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  const saveTranscription = useCallback(
    async (transcription: Omit<Transcription, "id" | "user_id" | "created_at">) => {
      try {
        const res = await fetch("/api/transcription-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transcription),
        })

        if (!res.ok) throw new Error("Failed to save")

        const newTranscription = await res.json()
        mutate()
        return newTranscription
      } catch (error) {
        console.error("Error saving transcription:", error)
        throw error
      }
    },
    [mutate]
  )

  const deleteTranscription = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/transcription-history?id=${id}`, {
          method: "DELETE",
        })

        if (!res.ok) throw new Error("Failed to delete")

        mutate()
      } catch (error) {
        console.error("Error deleting transcription:", error)
        throw error
      }
    },
    [mutate]
  )

  return {
    transcriptions: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    search,
    setSearch,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    saveTranscription,
    deleteTranscription,
    mutate,
  }
}
