import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)

  // Initialize Supabase admin client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase variables')
    return new Response('Supabase configuration missing', { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  // Sync users to Supabase profiles table
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const primaryEmail = email_addresses?.[0]?.email_address

    const { error } = await supabaseAdmin.from('profiles').insert({
      id: id,
      email: primaryEmail,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
      credit_balance: 3, // Default starting credits
      subscription_tier: 'free',
    })

    if (error) {
      console.error('Error inserting profile:', error)
      return new Response('Error creating profile', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const primaryEmail = email_addresses?.[0]?.email_address

    const { error } = await supabaseAdmin.from('profiles').update({
      email: primaryEmail,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
    }).eq('id', id)

    if (error) {
      console.error('Error updating profile:', error)
      return new Response('Error updating profile', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id)

    if (error) {
      console.error('Error deleting profile:', error)
      return new Response('Error deleting profile', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
