/**
 * API Utilities
 * 
 * Common utilities for secure API development:
 * - Request validation helpers
 * - Security headers
 * - Error handling
 */

import { NextResponse } from "next/server"

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Security headers following OWASP recommendations
 */
export const securityHeaders: HeadersInit = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Enable XSS protection (legacy browsers)
  "X-XSS-Protection": "1; mode=block",
  // Referrer policy - don't leak URLs
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content Security Policy for API responses
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
}

/**
 * Apply security headers to a response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = "Não autenticado") {
    super(message, 401, "AUTHENTICATION_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = "Não autorizado") {
    super(message, 403, "AUTHORIZATION_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = "Recurso não encontrado") {
    super(message, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter: number) {
    super(`Limite excedido. Tente novamente em ${retryAfter} segundos.`, 429, "RATE_LIMIT_EXCEEDED")
    this.name = "RateLimitError"
  }
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(
    { success: true, data } satisfies APIResponse<T>,
    { status }
  )
  return withSecurityHeaders(response)
}

export function errorResponse(
  error: string | APIError,
  status?: number
): NextResponse {
  if (error instanceof APIError) {
    const response = NextResponse.json(
      { success: false, error: error.message, code: error.code } satisfies APIResponse,
      { status: error.statusCode }
    )
    return withSecurityHeaders(response)
  }
  
  const response = NextResponse.json(
    { success: false, error } satisfies APIResponse,
    { status: status ?? 500 }
  )
  return withSecurityHeaders(response)
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Safely parse JSON body with error handling
 */
export async function parseJsonBody<T>(
  request: Request,
  maxSize: number = 1024 * 10 // 10KB default
): Promise<T> {
  const contentLength = request.headers.get("content-length")
  
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    throw new ValidationError("Corpo da requisição muito grande")
  }
  
  const contentType = request.headers.get("content-type")
  
  if (!contentType?.includes("application/json")) {
    throw new ValidationError("Content-Type deve ser application/json")
  }
  
  try {
    return await request.json() as T
  } catch {
    throw new ValidationError("JSON inválido")
  }
}

/**
 * Validate that all required fields are present
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: readonly (keyof T)[]
): void {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      throw new ValidationError(`Campo '${String(field)}' é obrigatório`)
    }
  }
}

// ============================================================================
// LOGGING (sanitized for security)
// ============================================================================

/**
 * Log API request (sanitized - no sensitive data)
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  clientId?: string
): void {
  // In production, send to logging service (e.g., Vercel Logs)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[API] ${method} ${path} - ${statusCode} - ${durationMs}ms${clientId ? ` - ${clientId.slice(0, 8)}...` : ""}`
    )
  }
}

/**
 * Log security event (for audit trail)
 */
export function logSecurityEvent(
  event: "auth_failure" | "rate_limit" | "idor_attempt" | "validation_error",
  details: Record<string, unknown>
): void {
  // In production, send to SIEM or security logging service
  const sanitizedDetails = { ...details }
  
  // Remove any potentially sensitive fields
  delete sanitizedDetails.password
  delete sanitizedDetails.token
  delete sanitizedDetails.session
  
  if (process.env.NODE_ENV === "development") {
    console.warn(`[SECURITY] ${event}:`, sanitizedDetails)
  }
}
