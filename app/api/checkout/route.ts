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

    const { email, userId, plan = 'pro', currency = 'gbp' } = await req.json()

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }

    if (!['pro', 'studio'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Pick the right Stripe price ID based on plan
    const proPrice = (process.env.STRIPE_PRICE_ID || '').trim()
    const studioPrice = (process.env.STRIPE_STUDIO_PRICE_ID || '').trim()
    const priceId = plan === 'studio' ? studioPrice : proPrice

    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for ${plan} plan` },
        { status: 503 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const Stripe = (await import('stripe')).default
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' as import('stripe').Stripe.LatestApiVersion })

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      metadata: {
        userId,
        plan,
        detectedCurrency: currency,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?upgraded=${plan}`,
      cancel_url: `${origin}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
