import { z } from "zod"

/**
 * YouTube URL validation schema following OWASP input validation best practices:
 * - Strict pattern matching for known YouTube URL formats
 * - Maximum length limit to prevent DoS attacks
 * - No special characters that could lead to injection
 */
/**
 * Extracts video ID from any YouTube URL format.
 * Returns null if no valid 11-char video ID is found.
 */
function parseYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "")

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0]
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }

    if (host === "youtube.com") {
      // /watch?v=ID
      const vParam = u.searchParams.get("v")
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam

      // /shorts/ID  |  /embed/ID  |  /v/ID  |  /live/ID
      const segmentMatch = u.pathname.match(
        /^\/(shorts|embed|v|live|e)\/([a-zA-Z0-9_-]{11})/
      )
      if (segmentMatch) return segmentMatch[2]
    }
  } catch {
    // Invalid URL — fall through to null
  }
  return null
}

export const youtubeUrlSchema = z
  .string()
  .trim()
  .min(1, { message: "Cole uma URL do YouTube" })
  .max(500, { message: "URL muito longa" })
  .refine(
    (url) => {
      // Must start with http(s)
      if (!/^https?:\/\//i.test(url)) return false
      return parseYouTubeVideoId(url) !== null
    },
    { message: "URL inválida — use um link válido do YouTube" }
  )



/**
 * Extracts the video ID from a validated YouTube URL
 * Only call this AFTER validation has passed
 */
export function extractVideoId(url: string): string | null {
  return parseYouTubeVideoId(url)
}

/**
 * Sanitizes text content for safe display
 * Removes potentially dangerous characters while preserving readability
 */
export function sanitizeTextContent(text: string): string {
  return text
    .trim()
    .slice(0, 10000) // Max length limit
    .replace(/[<>]/g, "") // Remove HTML brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
}



/**
 * Safe URL construction for internal navigation
 */
export function buildAnalysisUrl(videoUrl: string): string {
  const validation = youtubeUrlSchema.safeParse(videoUrl)
  if (!validation.success) {
    throw new Error(validation.error.errors[0]?.message ?? "URL inválida")
  }
  
  // Use encodeURIComponent for safe URL encoding
  return `/analisar?url=${encodeURIComponent(validation.data)}`
}
