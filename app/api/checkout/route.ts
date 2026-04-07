import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured yet. Add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 503 }
      )
    }

    if (!(process.env.STRIPE_PRICE_ID || '').trim()) {
      return NextResponse.json(
        { error: 'Stripe price not configured yet. Add STRIPE_PRICE_ID to your environment variables.' },
        { status: 503 }
      )
    }

    const { email, userId } = await req.json()

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // TODO: Add STRIPE_PRICE_ID to your .env.local
    // Create it in Stripe Dashboard → Products → Add Product
    // Product: "ShowBizy Pro", Price: £9/month recurring (multi-currency via Stripe)
    const Stripe = (await import('stripe')).default
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' as import('stripe').Stripe.LatestApiVersion })

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      metadata: {
        userId,
      },
      line_items: [
        {
          price: (process.env.STRIPE_PRICE_ID || '').trim(),
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
