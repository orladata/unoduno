import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Minimal in-memory rate limiting for Edge middleware (IP based)
// For robust distributed rate limiting, KV is used in the API routes.
const rateLimitMap = new Map<string, { count: number, timestamp: number }>()

export async function middleware(request: NextRequest) {
  // 1. Global Rate Limiter for API and Auth routes (Basic DoS Protection)
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const path = request.nextUrl.pathname
  
  if (path.startsWith('/api/') || path.startsWith('/auth/')) {
    const now = Date.now()
    const limitData = rateLimitMap.get(ip)
    
    if (limitData) {
      if (now - limitData.timestamp < 60000) { // 1 minute window
        if (limitData.count > 100) { // 100 requests per minute per IP limit
          return new NextResponse(
            JSON.stringify({ error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED' }), 
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          )
        }
        limitData.count++
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now })
    }
  }

  // 2. Supabase Session management (handles cookie refresh)
  try {
    const response = await updateSession(request)
    return response
  } catch (e) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
