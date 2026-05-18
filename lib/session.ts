/**
 * Session Management & IDOR Protection
 * 
 * Implements OWASP session management best practices:
 * - Cryptographically secure session tokens
 * - Session validation on each request
 * - Resource ownership verification
 * - Principle of Least Privilege enforcement
 */

import { cookies } from "next/headers"

// Session configuration constants
const SESSION_COOKIE_NAME = "unoduno_session" as const
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days
const SESSION_TOKEN_LENGTH = 32

// Types
export interface Session {
  readonly id: string
  readonly userId: string
  readonly createdAt: number
  readonly expiresAt: number
  readonly permissions: readonly Permission[]
}

export interface SessionValidationResult {
  readonly valid: boolean
  readonly session: Session | null
  readonly error?: string
}

export type Permission = 
  | "analysis:create"
  | "analysis:read"
  | "analysis:read_own"
  | "analysis:delete_own"
  | "user:read_own"
  | "user:update_own"

// In-memory session store - use Redis in production
const sessionStore = new Map<string, Session>()

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(token)
    }
  }
}, 10 * 60 * 1000)

/**
 * Generate cryptographically secure session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(SESSION_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Create a new session for a user
 * Follows Principle of Least Privilege - only grant necessary permissions
 */
export async function createSession(
  userId: string,
  permissions: readonly Permission[] = ["analysis:create", "analysis:read_own", "user:read_own"]
): Promise<string> {
  const token = generateSessionToken()
  const now = Date.now()
  
  const session: Session = {
    id: generateSessionToken().slice(0, 16),
    userId,
    createdAt: now,
    expiresAt: now + (SESSION_MAX_AGE_SECONDS * 1000),
    permissions,
  }
  
  sessionStore.set(token, session)
  
  // Set HTTP-only, secure cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  })
  
  return token
}

/**
 * Validate session from request
 * Must be called on EVERY authenticated request
 */
export async function validateSession(): Promise<SessionValidationResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return {
      valid: false,
      session: null,
      error: "Sessão não encontrada",
    }
  }
  
  // Validate token format (hex string of expected length)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return {
      valid: false,
      session: null,
      error: "Token de sessão inválido",
    }
  }
  
  const session = sessionStore.get(token)
  
  if (!session) {
    return {
      valid: false,
      session: null,
      error: "Sessão expirada ou inválida",
    }
  }
  
  // Check expiration
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token)
    return {
      valid: false,
      session: null,
      error: "Sessão expirada",
    }
  }
  
  return {
    valid: true,
    session,
  }
}

/**
 * Check if session has required permission
 * Implements Principle of Least Privilege
 */
export function hasPermission(session: Session, requiredPermission: Permission): boolean {
  return session.permissions.includes(requiredPermission)
}

/**
 * Verify resource ownership to prevent IDOR attacks
 * 
 * @param session - Current user session
 * @param resourceOwnerId - ID of the resource owner
 * @returns boolean indicating if user owns the resource
 */
export function verifyResourceOwnership(
  session: Session,
  resourceOwnerId: string
): boolean {
  // Strict equality check - no type coercion
  return session.userId === resourceOwnerId
}

/**
 * Combined authorization check
 * Validates session, permission, and resource ownership
 */
export interface AuthorizationResult {
  readonly authorized: boolean
  readonly session: Session | null
  readonly error?: string
  readonly errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
}

export async function authorizeRequest(
  requiredPermission: Permission,
  resourceOwnerId?: string
): Promise<AuthorizationResult> {
  // Step 1: Validate session
  const sessionResult = await validateSession()
  
  if (!sessionResult.valid || !sessionResult.session) {
    return {
      authorized: false,
      session: null,
      error: sessionResult.error ?? "Não autorizado",
      errorCode: "UNAUTHORIZED",
    }
  }
  
  const session = sessionResult.session
  
  // Step 2: Check permission
  if (!hasPermission(session, requiredPermission)) {
    return {
      authorized: false,
      session,
      error: "Permissão negada",
      errorCode: "FORBIDDEN",
    }
  }
  
  // Step 3: Verify resource ownership (if resource ID provided)
  if (resourceOwnerId !== undefined) {
    if (!verifyResourceOwnership(session, resourceOwnerId)) {
      // Return NOT_FOUND instead of FORBIDDEN to prevent enumeration
      return {
        authorized: false,
        session,
        error: "Recurso não encontrado",
        errorCode: "NOT_FOUND",
      }
    }
  }
  
  return {
    authorized: true,
    session,
  }
}

/**
 * Destroy session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (token) {
    sessionStore.delete(token)
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

/**
 * Get current session without validation (for optional auth routes)
 */
export async function getCurrentSession(): Promise<Session | null> {
  const result = await validateSession()
  return result.session
}
