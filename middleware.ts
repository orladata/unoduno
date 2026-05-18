/**
 * Next.js Edge Middleware
 * 
 * Security measures:
 * 1. Security Headers (OWASP recommendations)
 * 2. Rate Limiting at edge
 * 3. Bot Detection
 * 4. Request Validation
 */

import { NextRequest, NextResponse } from "next/server"

// ============================================================================
// CONSTANTS
// ============================================================================

// Security headers based on OWASP recommendations
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Enable XSS filter (legacy browsers)
  "X-XSS-Protection": "1; mode=block",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
}

// Paths that should bypass security checks
const PUBLIC_PATHS = new Set([
  "/",
  "/termos",
  "/privacidade",
  "/analisar",
])

// API paths that need stricter validation
const API_PATHS_PREFIX = "/api/"

// Maximum request body size (1MB)
const MAX_BODY_SIZE = 1024 * 1024

// Simple in-memory rate limit store for edge
// Note: In production, use Redis or similar distributed store
const edgeRateLimits = new Map<string, { count: number; resetAt: number }>()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets client IP address from request headers
 */
function getClientIp(request: NextRequest): string {
  // Check various headers set by proxies
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) return firstIp
  }
  
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  
  const vercelIp = request.headers.get("x-vercel-forwarded-for")
  if (vercelIp) return vercelIp
  
  // Fallback
  return "unknown"
}

/**
 * Simple edge rate limiting
 */
function checkEdgeRateLimit(
  clientId: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = edgeRateLimits.get(clientId)
  
  // Cleanup old entries periodically
  if (edgeRateLimits.size > 10000) {
    for (const [key, value] of edgeRateLimits.entries()) {
      if (value.resetAt < now) {
        edgeRateLimits.delete(key)
      }
    }
  }
  
  if (!record || record.resetAt < now) {
    // New window
    const resetAt = now + windowMs
    edgeRateLimits.set(clientId, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }
  
  record.count++
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt }
}

/**
 * Basic bot detection
 */
function isLikelyBot(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? ""
  
  // Allow legitimate bots
  const allowedBots = ["googlebot", "bingbot", "vercelbot", "vercel-screenshot"]
  for (const bot of allowedBots) {
    if (userAgent.includes(bot)) return false
  }
  
  // Block suspicious patterns
  const suspiciousPatterns = [
    "curl",
    "wget",
    "python-requests",
    "go-http-client",
    "java/",
    "httpclient",
    "libwww",
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (userAgent.includes(pattern)) return true
  }
  
  // Block requests without user agent
  if (!userAgent || userAgent.length < 10) return true
  
  return false
}

/**
 * Validates request size
 */
function isRequestTooLarge(request: NextRequest): boolean {
  const contentLength = request.headers.get("content-length")
  if (!contentLength) return false
  
  const size = parseInt(contentLength, 10)
  return !isNaN(size) && size > MAX_BODY_SIZE
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }
  
  // Get client identifier
  const clientIp = getClientIp(request)
  
  // Create response with security headers
  const response = NextResponse.next()
  
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value)
  }
  
  // API-specific checks
  if (pathname.startsWith(API_PATHS_PREFIX)) {
    // Check request size
    if (isRequestTooLarge(request)) {
      return NextResponse.json(
        { error: "Requisição muito grande", success: false },
        { 
          status: 413,
          headers: Object.fromEntries(
            Object.entries(SECURITY_HEADERS)
          ),
        }
      )
    }
    
    // Bot detection for API routes
    if (isLikelyBot(request)) {
      return NextResponse.json(
        { error: "Acesso não autorizado", success: false },
        { 
          status: 403,
          headers: Object.fromEntries(
            Object.entries(SECURITY_HEADERS)
          ),
        }
      )
    }
    
    // Edge rate limiting for API routes
    const rateLimit = checkEdgeRateLimit(clientIp, 60, 60000) // 60 requests per minute
    
    response.headers.set("X-RateLimit-Limit", "60")
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString())
    response.headers.set("X-RateLimit-Reset", Math.ceil(rateLimit.resetAt / 1000).toString())
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve.", success: false },
        { 
          status: 429,
          headers: {
            ...Object.fromEntries(Object.entries(SECURITY_HEADERS)),
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetAt / 1000).toString(),
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }
  }
  
  return response
}

// ============================================================================
// MATCHER CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
}
