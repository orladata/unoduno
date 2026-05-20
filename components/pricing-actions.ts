'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

// Stripe SDK Initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.accredited' as any, // Standard API version or default
})

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If user is not authenticated, return a redirect instruction to login
    return { error: 'AUTH_REQUIRED', url: '/login' }
  }

  // Robustly resolve host and protocol on Vercel production and localhost
  const host = (await headers()).get('host') || 'localhost:3000'
  const proto = (await headers()).get('x-forwarded-proto') || 'http'
  const origin = `${proto}://${host}`

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/#precos`,
      customer_email: user.email,
      client_reference_id: user.id, // Critical mapping identifier for Supabase updates!
      metadata: {
        userId: user.id,
      },
    })

    if (!session.url) {
      return { error: 'Erro ao gerar sessão de pagamento no Stripe.' }
    }

    return { url: session.url }
  } catch (err: any) {
    console.error('Stripe Error:', err)
    return { error: err.message || 'Ocorreu um erro ao iniciar o pagamento com o Stripe.' }
  }
}
