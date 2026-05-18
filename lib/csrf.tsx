/**
 * CSRF Protection Module
 * 
 * Implements Double Submit Cookie pattern with cryptographic tokens
 * for protection against Cross-Site Request Forgery attacks.
 */

import React from "react"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// ============================================================================
// CONSTANTS
// ============================================================================

const CSRF_COOKIE_NAME = "__Host-csrf-token"
const CSRF_HEADER_NAME = "X-CSRF-Token"
const TOKEN_LENGTH = 32 // 256 bits

// Safe methods that don't require CSRF protection
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generates a cryptographically secure random token
 */
function generateToken(): string {
  const buffer = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(buffer)
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ============================================================================
// SERVER-SIDE FUNCTIONS
// ============================================================================

/**
 * Gets the current CSRF token from cookies, or generates a new one
 * Used in Server Components to provide token to client
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  
  if (existingToken && existingToken.length === TOKEN_LENGTH * 2) {
    return existingToken
  }
  
  // Generate new token
  const newToken = generateToken()
  
  // Set cookie with security attributes
  cookieStore.set(CSRF_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return newToken
}

/**
 * Validates CSRF token from request against cookie
 * Used in API routes and middleware
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip validation for safe methods
  if (SAFE_METHODS.has(request.method)) {
    return true
  }
  
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (!cookieToken) {
    return false
  }
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  if (!headerToken) {
    return false
  }
  
  // Compare tokens using constant-time comparison
  return secureCompare(cookieToken, headerToken)
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * CSRF middleware that validates tokens and sets security headers
 */
export async function csrfMiddleware(
  request: NextRequest
): Promise<{ valid: boolean; response?: NextResponse }> {
  // Skip for non-API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return { valid: true }
  }
  
  // Skip for safe methods
  if (SAFE_METHODS.has(request.method)) {
    return { valid: true }
  }
  
  // Validate CSRF token
  const isValid = await validateCsrfToken(request)
  
  if (!isValid) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Token CSRF inválido ou ausente", success: false },
        { status: 403 }
      ),
    }
  }
  
  return { valid: true }
}

// ============================================================================
// CLIENT-SIDE HELPERS
// ============================================================================

/**
 * Gets the CSRF token from the cookie (client-side)
 * Note: Cookie is httpOnly, so this returns null.
 * The token should be provided via a server component or API endpoint.
 */
export function getClientCsrfToken(): string | null {
  if (typeof window === "undefined") return null
  
  // Try to get from meta tag (set by server component)
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  return metaTag?.getAttribute("content") ?? null
}

/**
 * Creates headers object with CSRF token included
 */
export function createSecureHeaders(csrfToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    [CSRF_HEADER_NAME]: csrfToken,
  }
}

// ============================================================================
// REACT COMPONENT HELPERS
// ============================================================================

/**
 * Props for CSRF token provider
 */
export interface CsrfTokenProps {
  token: string
}

/**
 * Server component that provides CSRF token to client
 * Usage: <CsrfTokenMeta token={await getCsrfToken()} />
 */
export function CsrfTokenMeta({ token }: CsrfTokenProps): React.ReactElement {
  return <meta name="csrf-token" content={token} />
}
