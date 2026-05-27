import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard' // Default to Dashboard if no next param

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful login, redirect to target page
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('[Auth Callback] Exchange Error:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // If there's no code, redirect back to login page
  return NextResponse.redirect(`${origin}/login?error=Código%20de%20autenticação%20ausente`)
}
