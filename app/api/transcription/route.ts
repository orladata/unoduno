import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const VideoIdSchema = z
  .string()
  .min(11)
  .max(11)
  .regex(/^[a-zA-Z0-9_-]{11}$/, "ID de vídeo inválido")

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL || "https://auto.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
})

export async function GET(req: Request) {
  // Auth check
  const { userId } = await auth()

  if (!userId) {
    return Response.json(
      { error: "Não autorizado. Faça login primeiro.", code: "UNAUTHORIZED" },
      { status: 401 }
    )
  }

  // Parse videoId from query params
  const { searchParams } = new URL(req.url)
  const rawVideoId = searchParams.get("videoId") ?? ""

  const validation = VideoIdSchema.safeParse(rawVideoId)
  if (!validation.success) {
    return Response.json(
      { error: "ID de vídeo inválido. Use um link válido do YouTube.", code: "INVALID_VIDEO_ID" },
      { status: 400 }
    )
  }

  const videoId = validation.data
  const bucketName = process.env.R2_BUCKET_NAME || "whispercore"

  // Strategy 1: Fetch directly from R2 via S3 API
  if (process.env.R2_ENDPOINT_URL && process.env.R2_ACCESS_KEY_ID) {
    try {
      // Try the Cerebrium format first (transcricoes/)
      const keys = [
        `transcricoes/${videoId}.json`,
        `transcriptions/${videoId}.txt`,
        `transcriptions/${videoId}.json`,
      ]

      for (const key of keys) {
        try {
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          })
          const response = await s3Client.send(command)
          const bodyStr = await response.Body?.transformToString("utf-8")

          if (!bodyStr) continue

          // If it's a JSON file, try to extract the transcript field
          if (key.endsWith(".json")) {
            try {
              const data = JSON.parse(bodyStr)
              return Response.json({
                success: true,
                videoId,
                transcript: data.transcript || data.text || bodyStr,
                source: "r2",
                key,
                segments: data.segments || null,
                metadata: data.metadata || null,
              })
            } catch {
              // If JSON parse fails, return raw text
              return Response.json({
                success: true,
                videoId,
                transcript: bodyStr,
                source: "r2",
                key,
              })
            }
          }

          // Plain text file
          return Response.json({
            success: true,
            videoId,
            transcript: bodyStr,
            source: "r2",
            key,
          })
        } catch {
          // Key not found, try next
          continue
        }
      }
    } catch (error) {
      console.error("[API/transcription] R2 S3 error:", error)
    }
  }

  // Strategy 2: Fetch from public URL
  const publicUrls = [
    `https://texto.unoduno.com/transcricoes/${videoId}.json`,
    `https://texto.unoduno.com/transcriptions/${videoId}.txt`,
    `https://texto.unoduno.com/transcriptions/${videoId}.json`,
  ]

  for (const publicUrl of publicUrls) {
    try {
      const res = await fetch(publicUrl, {
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const text = await res.text()
        if (text && text.length > 10) {
          // Try JSON parse
          try {
            const data = JSON.parse(text)
            return Response.json({
              success: true,
              videoId,
              transcript: data.transcript || data.text || text,
              source: "public_url",
              segments: data.segments || null,
              metadata: data.metadata || null,
            })
          } catch {
            return Response.json({
              success: true,
              videoId,
              transcript: text,
              source: "public_url",
            })
          }
        }
      }
    } catch {
      continue
    }
  }

  return Response.json(
    {
      error:
        "Transcrição não encontrada para este vídeo. Certifique-se de que o vídeo já foi processado.",
      code: "NOT_FOUND",
    },
    { status: 404 }
  )
}
