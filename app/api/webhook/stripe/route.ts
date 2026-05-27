import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/utils/supabase/admin"

// Lazy initialization para evitar erros em build-time
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não está configurada")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event: Stripe.Event

  // 1. Signature Verification for security
  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json(
        { error: "Assinatura ou segredo do webhook ausente." },
        { status: 400 }
      )
    }
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("Webhook Signature Verification Failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // 2. Handle the event
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id || session.metadata?.userId
    const amountTotal = session.amount_total // em centavos

    // IMPORTANT: Se o evento for completed, mas o pagamento ainda não foi feito (ex: Pix/Boleto gerado, mas não pago), ignoramos.
    // O webhook vai disparar depois o `async_payment_succeeded` quando for efetivamente pago.
    if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
      console.log(`Checkout completed but payment is ${session.payment_status}. Waiting for async payment success.`)
      return NextResponse.json({ received: true, status: "pending_async_payment" })
    }

    if (!userId || !amountTotal) {
      console.error("Missing userId or amount_total in Stripe session completed event.")
      return NextResponse.json(
        { error: "Metadados incompletos na sessão do Stripe." },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    try {
      // Prevent duplicate processing (Webhook idempotency)
      // Usamos o status completed para marcar que a transação finalizou
      const { data: existingTx } = await supabaseAdmin
        .from("transactions")
        .select("id, status")
        .eq("stripe_session_id", session.id)
        .eq("status", "completed")
        .maybeSingle()

      if (existingTx) {
        console.log(`Stripe session ${session.id} already processed. Skipping.`)
        return NextResponse.json({ received: true, status: "duplicate" })
      }

      // a) Insert or Update the transaction record
      const { error: txError } = await supabaseAdmin
        .from("transactions")
        .upsert({
          user_id: userId,
          stripe_session_id: session.id,
          amount: amountTotal,
          status: "completed",
        }, { onConflict: "stripe_session_id" })

      if (txError) {
        console.error("Failed to insert transaction record:", txError)
        return NextResponse.json(
          { error: "Erro ao registrar transação no banco de dados." },
          { status: 500 }
        )
      }

      // b) Atomically increment user credit balance in public.profiles table using RPC
      const { error: rpcError } = await supabaseAdmin.rpc("increment_credits", {
        target_user_id: userId,
        amount_cents: amountTotal,
      })

      if (rpcError) {
        console.error("Failed to execute increment_credits RPC:", rpcError)
        return NextResponse.json(
          { error: "Erro ao atualizar saldo de créditos do usuário." },
          { status: 500 }
        )
      }

      console.log(`Successfully credited ${amountTotal} cents to user ${userId}`)
    } catch (err: any) {
      console.error("Database updates failed in webhook:", err)
      return NextResponse.json(
        { error: "Erro de processamento interno no servidor." },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
