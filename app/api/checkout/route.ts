import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Lazy initialization para evitar erros em build-time
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não está configurada")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, userId } = body

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valor de recarga inválido." },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "ID de usuário obrigatório." },
        { status: 400 }
      )
    }

    // UUID v4 regex validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "ID de usuário inválido." },
        { status: 400 }
      )
    }

    // Convert BRL amount to cents (e.g. R$ 10.00 -> 1000 cents)
    const unitAmount = Math.round(amount * 100)

    // Define the base URL safely, falling back to localhost for dev
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      payment_method_options: {
        pix: {
          expires_after_seconds: 3600, // 1 hour expiration for Pix codes
        },
      },
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Recarga de Crédito - Unoduno`,
              description: `Adição de R$ ${amount.toFixed(2)} em créditos pré-pagos`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment", // Pay-as-you-go is a one-time purchase
      success_url: `${origin}/dashboard?payment=success&credits=${unitAmount}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      client_reference_id: userId, // Very important mapping anchor
      metadata: {
        userId: userId,
        amountCents: unitAmount.toString(),
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Erro ao gerar checkout com Stripe." },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err)
    return NextResponse.json(
      { error: err.message || "Erro interno de checkout." },
      { status: 500 }
    )
  }
}
