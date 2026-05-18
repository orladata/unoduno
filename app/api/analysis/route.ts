/**
 * Analysis API Route
 * 
 * Security measures implemented:
 * 1. Rate Limiting - Prevents brute force and DoS attacks
 * 2. Session Validation - Validates user session on each request
 * 3. IDOR Protection - Verifies resource ownership before access
 * 4. Input Validation - Zod schema validation for all inputs
 * 5. Principle of Least Privilege - Permission-based access control
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
} from "@/lib/rate-limit"
import {
  authorizeRequest,
  getCurrentSession,
  type Session,
} from "@/lib/session"
import {
  youtubeUrlSchema,
  extractVideoId,
  sanitizeTextContent,
} from "@/lib/validations"

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

const createAnalysisSchema = z.object({
  url: youtubeUrlSchema,
})

const getAnalysisSchema = z.object({
  id: z.string().uuid({ message: "ID de análise inválido" }),
})

// ============================================================================
// TYPES
// ============================================================================

interface Analysis {
  readonly id: string
  readonly userId: string
  readonly videoId: string
  readonly videoUrl: string
  readonly status: "pending" | "processing" | "completed" | "failed"
  readonly result?: AnalysisResult
  readonly createdAt: number
  readonly updatedAt: number
}

interface AnalysisResult {
  readonly hook: string
  readonly introduction: string
  readonly development: string
  readonly cta: string
  readonly viralScore: number
  readonly adaptationLevel: "baixa" | "média" | "alta"
}

// In-memory store - use database in production
const analysisStore = new Map<string, Analysis>()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateUUID(): string {
  return crypto.randomUUID()
}

function createErrorResponse(
  message: string,
  status: number,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(
    { error: message, success: false },
    { status, headers }
  )
}

function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(
    { data, success: true },
    { status, headers }
  )
}

// ============================================================================
// POST /api/analysis - Create new analysis
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Step 1: Rate Limiting
  const clientId = getClientIdentifier(request.headers)
  const rateLimitResult = checkRateLimit(clientId, "analysis")
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
  
  if (!rateLimitResult.success) {
    return createErrorResponse(
      `Limite de requisições excedido. Tente novamente em ${rateLimitResult.retryAfter} segundos.`,
      429,
      rateLimitHeaders
    )
  }
  
  // Step 2: Session Validation (optional for this endpoint - allows anonymous use)
  const session = await getCurrentSession()
  const userId = session?.userId ?? `anon_${clientId}`
  
  // Step 3: Input Validation
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return createErrorResponse("Corpo da requisição inválido", 400, rateLimitHeaders)
  }
  
  const validation = createAnalysisSchema.safeParse(body)
  
  if (!validation.success) {
    const errorMessage = validation.error.errors[0]?.message ?? "Dados inválidos"
    return createErrorResponse(errorMessage, 400, rateLimitHeaders)
  }
  
  const { url } = validation.data
  
  // Step 4: Extract and validate video ID
  const videoId = extractVideoId(url)
  
  if (!videoId) {
    return createErrorResponse("Não foi possível extrair o ID do vídeo", 400, rateLimitHeaders)
  }
  
  // Step 5: Create analysis record
  const analysisId = generateUUID()
  const now = Date.now()
  
  const analysis: Analysis = {
    id: analysisId,
    userId,
    videoId,
    videoUrl: sanitizeTextContent(url),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }
  
  analysisStore.set(analysisId, analysis)
  
  // Step 6: Return response (in production, trigger async processing)
  return createSuccessResponse(
    {
      id: analysisId,
      status: analysis.status,
      message: "Análise criada com sucesso",
    },
    201,
    rateLimitHeaders
  )
}

// ============================================================================
// GET /api/analysis - Get analysis by ID
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Rate Limiting
  const clientId = getClientIdentifier(request.headers)
  const rateLimitResult = checkRateLimit(clientId, "api")
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
  
  if (!rateLimitResult.success) {
    return createErrorResponse(
      `Limite de requisições excedido. Tente novamente em ${rateLimitResult.retryAfter} segundos.`,
      429,
      rateLimitHeaders
    )
  }
  
  // Step 2: Parse query parameters
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return createErrorResponse("ID da análise é obrigatório", 400, rateLimitHeaders)
  }
  
  // Step 3: Validate ID format
  const validation = getAnalysisSchema.safeParse({ id })
  
  if (!validation.success) {
    return createErrorResponse("ID de análise inválido", 400, rateLimitHeaders)
  }
  
  // Step 4: Retrieve analysis
  const analysis = analysisStore.get(id)
  
  if (!analysis) {
    // Return generic "not found" to prevent enumeration attacks
    return createErrorResponse("Análise não encontrada", 404, rateLimitHeaders)
  }
  
  // Step 5: IDOR Protection - Verify ownership
  const session = await getCurrentSession()
  const currentUserId = session?.userId ?? `anon_${clientId}`
  
  // Check if the analysis belongs to the requesting user
  if (analysis.userId !== currentUserId) {
    // Return "not found" instead of "forbidden" to prevent enumeration
    return createErrorResponse("Análise não encontrada", 404, rateLimitHeaders)
  }
  
  // Step 6: Return analysis data
  return createSuccessResponse(
    {
      id: analysis.id,
      videoId: analysis.videoId,
      status: analysis.status,
      result: analysis.result,
      createdAt: analysis.createdAt,
    },
    200,
    rateLimitHeaders
  )
}

// ============================================================================
// DELETE /api/analysis - Delete analysis (requires authentication)
// ============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  // Step 1: Rate Limiting
  const clientId = getClientIdentifier(request.headers)
  const rateLimitResult = checkRateLimit(clientId, "api")
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
  
  if (!rateLimitResult.success) {
    return createErrorResponse(
      `Limite de requisições excedido. Tente novamente em ${rateLimitResult.retryAfter} segundos.`,
      429,
      rateLimitHeaders
    )
  }
  
  // Step 2: Parse query parameters
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return createErrorResponse("ID da análise é obrigatório", 400, rateLimitHeaders)
  }
  
  // Step 3: Validate ID format
  const validation = getAnalysisSchema.safeParse({ id })
  
  if (!validation.success) {
    return createErrorResponse("ID de análise inválido", 400, rateLimitHeaders)
  }
  
  // Step 4: Get analysis to check ownership
  const analysis = analysisStore.get(id)
  
  if (!analysis) {
    return createErrorResponse("Análise não encontrada", 404, rateLimitHeaders)
  }
  
  // Step 5: Full authorization check (requires auth + permission + ownership)
  const authResult = await authorizeRequest("analysis:delete_own", analysis.userId)
  
  if (!authResult.authorized) {
    const statusCode = authResult.errorCode === "UNAUTHORIZED" ? 401 :
                       authResult.errorCode === "FORBIDDEN" ? 403 : 404
    return createErrorResponse(
      authResult.error ?? "Não autorizado",
      statusCode,
      rateLimitHeaders
    )
  }
  
  // Step 6: Delete analysis
  analysisStore.delete(id)
  
  return createSuccessResponse(
    { message: "Análise excluída com sucesso" },
    200,
    rateLimitHeaders
  )
}
