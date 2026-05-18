/**
 * Rate Limiting Implementation
 * 
 * Follows OWASP recommendations for brute force prevention:
 * - In-memory store with automatic cleanup
 * - Configurable time windows and request limits
 * - IP-based tracking with fallback identifiers
 * - Exponential backoff on repeated violations
 */

interface RateLimitEntry {
  readonly count: number
  readonly resetTime: number
  readonly violations: number
}

interface RateLimitConfig {
  readonly windowMs: number      // Time window in milliseconds
  readonly maxRequests: number   // Max requests per window
  readonly blockDurationMs: number // Block duration after limit exceeded
}

interface RateLimitResult {
  readonly success: boolean
  readonly remaining: number
  readonly resetAt: number
  readonly retryAfter?: number
}

// In-memory store - use Redis in production for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

let cleanupScheduled = false

function scheduleCleanup(): void {
  if (cleanupScheduled) return
  cleanupScheduled = true
  
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime + 60000) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)
}

/**
 * Default rate limit configurations by endpoint type
 */
export const RATE_LIMIT_CONFIGS = {
  // Analysis endpoint - moderate limit
  analysis: {
    windowMs: 60 * 1000,        // 1 minute window
    maxRequests: 10,            // 10 requests per minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
  // Authentication endpoints - strict limit
  auth: {
    windowMs: 15 * 60 * 1000,   // 15 minute window
    maxRequests: 5,             // 5 attempts
    blockDurationMs: 15 * 60 * 1000, // 15 minute block
  },
  // General API - lenient limit
  api: {
    windowMs: 60 * 1000,        // 1 minute window
    maxRequests: 60,            // 60 requests per minute
    blockDurationMs: 30 * 1000, // 30 second block
  },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

/**
 * Check rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (IP, user ID, or composite key)
 * @param configType - Type of rate limit to apply
 * @returns RateLimitResult with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  configType: RateLimitType = "api"
): RateLimitResult {
  scheduleCleanup()
  
  const config = RATE_LIMIT_CONFIGS[configType]
  const now = Date.now()
  const key = `${configType}:${identifier}`
  
  const existing = rateLimitStore.get(key)
  
  // If no existing entry or window expired, create new entry
  if (!existing || now > existing.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      violations: existing?.violations ?? 0,
    }
    rateLimitStore.set(key, newEntry)
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetTime,
    }
  }
  
  // Check if currently blocked due to previous violations
  const blockMultiplier = Math.min(existing.violations + 1, 5) // Max 5x multiplier
  const effectiveBlockDuration = config.blockDurationMs * blockMultiplier
  
  if (existing.count >= config.maxRequests) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000)
    
    // Increment violations for exponential backoff
    const updatedEntry: RateLimitEntry = {
      ...existing,
      violations: existing.violations + 1,
      resetTime: now + effectiveBlockDuration,
    }
    rateLimitStore.set(key, updatedEntry)
    
    return {
      success: false,
      remaining: 0,
      resetAt: updatedEntry.resetTime,
      retryAfter: Math.max(retryAfter, 1),
    }
  }
  
  // Increment request count
  const updatedEntry: RateLimitEntry = {
    ...existing,
    count: existing.count + 1,
  }
  rateLimitStore.set(key, updatedEntry)
  
  return {
    success: true,
    remaining: config.maxRequests - updatedEntry.count,
    resetAt: existing.resetTime,
  }
}

/**
 * Extract client identifier from request headers
 * Follows OWASP recommendations for IP extraction behind proxies
 */
export function getClientIdentifier(headers: Headers): string {
  // Check for forwarded IP (Vercel, Cloudflare, etc.)
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Take the first IP (client IP) from the chain
    const clientIp = forwardedFor.split(",")[0]?.trim()
    if (clientIp && isValidIp(clientIp)) {
      return clientIp
    }
  }
  
  // Vercel-specific header
  const vercelIp = headers.get("x-real-ip")
  if (vercelIp && isValidIp(vercelIp)) {
    return vercelIp
  }
  
  // Cloudflare header
  const cfIp = headers.get("cf-connecting-ip")
  if (cfIp && isValidIp(cfIp)) {
    return cfIp
  }
  
  // Fallback to a hash of user agent + accept-language for uniqueness
  const userAgent = headers.get("user-agent") ?? "unknown"
  const acceptLang = headers.get("accept-language") ?? "unknown"
  return hashString(`${userAgent}:${acceptLang}`)
}

/**
 * Simple IP validation (IPv4 and IPv6)
 */
function isValidIp(ip: string): boolean {
  // IPv4
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 (simplified check)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

/**
 * Simple string hash for fallback identifier
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toString(),
  }
  
  if (!result.success && result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString()
  }
  
  return headers
}
