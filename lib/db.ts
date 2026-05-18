import { neon } from "@neondatabase/serverless"
import { z } from "zod"

// ─── Client ───────────────────────────────────────────────────────────────────

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL environment variable is not set")
  return neon(url)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalysisStatus = "pending" | "processing" | "completed" | "failed"

export interface Analysis {
  readonly id: string
  readonly video_id: string
  readonly video_url: string
  readonly language: string
  readonly status: AnalysisStatus
  readonly script: string | null
  readonly error_msg: string | null
  readonly model: string
  readonly prompt_tokens: number | null
  readonly completion_tokens: number | null
  readonly ip_hash: string | null
  readonly user_agent: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface ScriptSection {
  readonly id: string
  readonly analysis_id: string
  readonly type: "hook" | "intro" | "development" | "cta"
  readonly content: string
  readonly position: number
  readonly created_at: string
}

export interface AnalysisFeedback {
  readonly id: string
  readonly analysis_id: string
  readonly rating: number
  readonly comment: string | null
  readonly created_at: string
}

// ─── Zod schemas for DB results ───────────────────────────────────────────────

const analysisRowSchema = z.object({
  id: z.string().uuid(),
  video_id: z.string(),
  video_url: z.string(),
  language: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  script: z.string().nullable(),
  error_msg: z.string().nullable(),
  model: z.string(),
  prompt_tokens: z.number().nullable(),
  completion_tokens: z.number().nullable(),
  ip_hash: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAnalysis(input: {
  videoId: string
  videoUrl: string
  language: string
  model: string
  ipHash: string | null
  userAgent: string | null
}): Promise<string> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO analyses
      (video_id, video_url, language, status, model, ip_hash, user_agent)
    VALUES
      (${input.videoId}, ${input.videoUrl}, ${input.language},
       'processing', ${input.model}, ${input.ipHash}, ${input.userAgent})
    RETURNING id
  `
  const row = rows[0] as { id: string }
  return row.id
}

// ─── Update on complete ───────────────────────────────────────────────────────

export async function completeAnalysis(input: {
  id: string
  script: string
  promptTokens: number | null
  completionTokens: number | null
}): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE analyses
    SET
      status             = 'completed',
      script             = ${input.script},
      prompt_tokens      = ${input.promptTokens},
      completion_tokens  = ${input.completionTokens}
    WHERE id = ${input.id}
  `
}

// ─── Update on failure ────────────────────────────────────────────────────────

export async function failAnalysis(input: {
  id: string
  errorMsg: string
}): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE analyses
    SET status = 'failed', error_msg = ${input.errorMsg}
    WHERE id = ${input.id}
  `
}

// ─── Insert script sections (normalized) ─────────────────────────────────────

export type SectionType = "hook" | "intro" | "development" | "cta"

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  GANCHO:          "hook",
  HOOK:            "hook",
  INTRODUÇÃO:      "intro",
  INTRODUCAO:      "intro",
  DESENVOLVIMENTO: "development",
  CTA:             "development",        // overridden below
  "CALL-TO-ACTION": "cta",
}

export async function saveScriptSections(
  analysisId: string,
  sections: ReadonlyArray<{ title: string; content: string; position: number }>
): Promise<void> {
  if (sections.length === 0) return
  const sql = getSql()

  for (const section of sections) {
    const normalizedTitle = section.title.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Resolve CTA correctly
    const type: SectionType =
      normalizedTitle === "CTA" || normalizedTitle.includes("CALL")
        ? "cta"
        : (SECTION_TYPE_MAP[normalizedTitle] ?? "development")

    await sql`
      INSERT INTO script_sections (analysis_id, type, content, position)
      VALUES (${analysisId}, ${type}, ${section.content}, ${section.position})
    `
  }
}

// ─── Save feedback ────────────────────────────────────────────────────────────

export const feedbackInputSchema = z.object({
  analysisId: z.string().uuid({ message: "ID de análise inválido" }),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable().optional(),
})

export type FeedbackInput = z.infer<typeof feedbackInputSchema>

export async function saveFeedback(input: FeedbackInput): Promise<string> {
  // Verify the analysis exists before inserting
  const sql = getSql()
  const rows = await sql`
    SELECT id FROM analyses WHERE id = ${input.analysisId} AND status = 'completed'
  `
  if (rows.length === 0) {
    throw new Error("Análise não encontrada ou ainda não concluída")
  }

  const result = await sql`
    INSERT INTO analysis_feedback (analysis_id, rating, comment)
    VALUES (${input.analysisId}, ${input.rating}, ${input.comment ?? null})
    RETURNING id
  `
  const row = result[0] as { id: string }
  return row.id
}

// ─── Fetch analysis by id (for history feature) ───────────────────────────────

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM analyses WHERE id = ${id} LIMIT 1
  `
  if (rows.length === 0) return null
  const parsed = analysisRowSchema.safeParse(rows[0])
  return parsed.success ? parsed.data : null
}

// ─── Stats (useful for admin/dashboard later) ─────────────────────────────────

export async function getAnalysisStats(): Promise<{
  total: number
  completed: number
  failed: number
  avgRating: number | null
}> {
  const sql = getSql()
  const [countRows, ratingRows] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int                                              AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int         AS completed,
        COUNT(*) FILTER (WHERE status = 'failed')::int            AS failed
      FROM analyses
    `,
    sql`SELECT ROUND(AVG(rating)::numeric, 2)::float AS avg_rating FROM analysis_feedback`,
  ])

  const counts = countRows[0] as { total: number; completed: number; failed: number }
  const rating = ratingRows[0] as { avg_rating: number | null }

  return {
    total: counts.total,
    completed: counts.completed,
    failed: counts.failed,
    avgRating: rating.avg_rating,
  }
}

// ─── Hash IP for privacy (SHA-256 without storing raw IP) ────────────────────

export function hashIp(ip: string): string {
  // Simple deterministic hash — avoids storing PII directly
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, "0")
}

// ─── Extract client IP from Next.js request headers ──────────────────────────

export function extractClientIp(req: Request): string | null {
  const forwarded =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip")

  if (!forwarded) return null
  // Take only the first IP if there are multiple (proxy chain)
  return forwarded.split(",")[0]?.trim() ?? null
}
