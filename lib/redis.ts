/**
 * Upstash Redis Client & Rate Limiting
 * 
 * Provides persistent rate limiting and caching using Upstash Redis.
 */

import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// ─── Redis Client ─────────────────────────────────────────────────────────────

let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN

    if (!url || !token) {
      throw new Error("Redis não configurado: KV_REST_API_URL e KV_REST_API_TOKEN são necessários")
    }

    redisClient = new Redis({ url, token })
  }
  return redisClient
}

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Analysis rate limiter: 10 requests per hour per IP
let analysisRateLimiter: Ratelimit | null = null

export function getAnalysisRateLimiter(): Ratelimit {
  if (!analysisRateLimiter) {
    analysisRateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "ratelimit:analysis",
      analytics: true,
    })
  }
  return analysisRateLimiter
}

// API rate limiter: 60 requests per minute per IP
let apiRateLimiter: Ratelimit | null = null

export function getApiRateLimiter(): Ratelimit {
  if (!apiRateLimiter) {
    apiRateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "ratelimit:api",
      analytics: true,
    })
  }
  return apiRateLimiter
}

// ─── Rate Limit Check ─────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkAnalysisRateLimit(identifier: string): Promise<RateLimitResult> {
  try {
    const limiter = getAnalysisRateLimiter()
    const result = await limiter.limit(identifier)
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    // If Redis fails, allow the request (fail open)
    console.error("[redis] Rate limit check failed:", error)
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 3600000 }
  }
}

// ─── Analysis Cache ───────────────────────────────────────────────────────────

const CACHE_PREFIX = "cache:analysis:"
const CACHE_TTL_SECONDS = 24 * 60 * 60 // 24 hours

export interface CachedAnalysis {
  script: string
  language: string
  createdAt: string
  model: string
}

/**
 * Get cached analysis for a video ID
 */
export async function getCachedAnalysis(
  videoId: string,
  language: string
): Promise<CachedAnalysis | null> {
  try {
    const redis = getRedis()
    const key = `${CACHE_PREFIX}${videoId}:${language}`
    const cached = await redis.get<CachedAnalysis>(key)
    return cached
  } catch (error) {
    console.error("[redis] Cache get failed:", error)
    return null
  }
}

/**
 * Cache analysis result for a video ID
 */
export async function setCachedAnalysis(
  videoId: string,
  language: string,
  data: Omit<CachedAnalysis, "createdAt">
): Promise<void> {
  try {
    const redis = getRedis()
    const key = `${CACHE_PREFIX}${videoId}:${language}`
    const cached: CachedAnalysis = {
      ...data,
      createdAt: new Date().toISOString(),
    }
    await redis.set(key, cached, { ex: CACHE_TTL_SECONDS })
  } catch (error) {
    console.error("[redis] Cache set failed:", error)
  }
}

/**
 * Invalidate cached analysis for a video ID
 */
export async function invalidateCachedAnalysis(
  videoId: string,
  language?: string
): Promise<void> {
  try {
    const redis = getRedis()
    if (language) {
      await redis.del(`${CACHE_PREFIX}${videoId}:${language}`)
    } else {
      // Invalidate all languages for this video
      const keys = await redis.keys(`${CACHE_PREFIX}${videoId}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    }
  } catch (error) {
    console.error("[redis] Cache invalidation failed:", error)
  }
}

// ─── Rate Limit Headers ───────────────────────────────────────────────────────

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  }
}
