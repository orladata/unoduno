/**
 * Environment Variable Type Definitions
 * 
 * Security Notes:
 * - Variables prefixed with NEXT_PUBLIC_ are exposed to the browser
 * - Keep sensitive data in server-only variables (no NEXT_PUBLIC_ prefix)
 * - Never commit actual values - use .env.local for development
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // ========================================================================
    // SERVER-ONLY VARIABLES (Never exposed to client)
    // ========================================================================
    
    /** Node environment */
    readonly NODE_ENV: "development" | "production" | "test"
    
    /** Session encryption secret (min 32 characters) */
    readonly SESSION_SECRET?: string
    
    /** CSRF token secret (min 32 characters) */
    readonly CSRF_SECRET?: string
    
    /** Database connection string */
    readonly DATABASE_URL?: string
    
    /** Redis connection for rate limiting (production) */
    readonly REDIS_URL?: string
    
    /** YouTube Data API key */
    readonly YOUTUBE_API_KEY?: string
    
    /** OpenAI API key for content generation */
    readonly OPENAI_API_KEY?: string
    
    /** Stripe secret key */
    readonly STRIPE_SECRET_KEY?: string
    
    /** Stripe webhook secret */
    readonly STRIPE_WEBHOOK_SECRET?: string
    
    /** Email service API key */
    readonly EMAIL_API_KEY?: string
    
    // ========================================================================
    // PUBLIC VARIABLES (Exposed to client - use sparingly)
    // ========================================================================
    
    /** Public site URL */
    readonly NEXT_PUBLIC_SITE_URL?: string
    
    /** Stripe publishable key (safe to expose) */
    readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
    
    /** Analytics ID (safe to expose) */
    readonly NEXT_PUBLIC_ANALYTICS_ID?: string
  }
}

// Ensure this file is treated as a module
export {}
