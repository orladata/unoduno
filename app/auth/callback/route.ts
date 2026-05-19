import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/' // Default to Home if no next param

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful login, redirect to target page
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error, redirect back to login page with an error message
  return NextResponse.redirect(`${origin}/login?error=OAuth%20Failed`)
}
