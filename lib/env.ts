/**
 * Environment Variable Validation
 * 
 * Security-by-Design: Validates all required environment variables at startup
 * and provides type-safe access to them.
 * 
 * IMPORTANT: This file should only be imported in server-side code.
 */

import { z } from "zod"

// ============================================================================
// SCHEMAS
// ============================================================================

/**
 * Server-side environment variables schema
 * These are NEVER exposed to the client
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Security secrets (required in production)
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters")
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || !!val,
      "SESSION_SECRET is required in production"
    ),
  
  CSRF_SECRET: z
    .string()
    .min(32, "CSRF_SECRET must be at least 32 characters")
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || !!val,
      "CSRF_SECRET is required in production"
    ),
  
  // Database (required in production)
  DATABASE_URL: z
    .string()
    .url()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || !!val,
      "DATABASE_URL is required in production"
    ),
  
  // Google Gemini API (required for video analysis)
  GOOGLE_GENERATIVE_AI_API_KEY: z
    .string()
    .min(1, "GOOGLE_GENERATIVE_AI_API_KEY is required")
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || !!val,
      "GOOGLE_GENERATIVE_AI_API_KEY is required in production"
    ),
  
  // External services (optional)
  REDIS_URL: z.string().url().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_API_KEY: z.string().optional(),
})

/**
 * Client-side environment variables schema
 * These are exposed to the browser via NEXT_PUBLIC_ prefix
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
})

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates server environment variables
 * Call this in server-side code only
 */
function validateServerEnv() {
  const result = serverEnvSchema.safeParse(process.env)
  
  if (!result.success) {
    console.error("Invalid server environment variables:")
    console.error(result.error.format())
    
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid server environment configuration")
    }
  }
  
  return result.success ? result.data : null
}

/**
 * Validates client environment variables
 * Safe to call anywhere
 */
function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  }
  
  const result = clientEnvSchema.safeParse(clientEnv)
  
  if (!result.success) {
    console.error("Invalid client environment variables:")
    console.error(result.error.format())
  }
  
  return result.success ? result.data : null
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Type-safe server environment variables
 * Only use in server-side code (API routes, Server Components, etc.)
 */
export const serverEnv = validateServerEnv()

/**
 * Type-safe client environment variables
 * Safe to use anywhere
 */
export const clientEnv = validateClientEnv()

/**
 * Helper to check if we're in production
 */
export const isProduction = process.env.NODE_ENV === "production"

/**
 * Helper to check if we're in development
 */
export const isDevelopment = process.env.NODE_ENV === "development"

/**
 * Safely get a server environment variable with fallback
 * Throws in production if required variable is missing
 */
export function getServerEnv(
  key: keyof z.infer<typeof serverEnvSchema>,
  fallback?: string
): string {
  const value = process.env[key] ?? fallback
  
  if (!value && isProduction) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value ?? ""
}

/**
 * Safely get a client environment variable with fallback
 */
export function getClientEnv(
  key: keyof z.infer<typeof clientEnvSchema>,
  fallback?: string
): string {
  return process.env[key] ?? fallback ?? ""
}
