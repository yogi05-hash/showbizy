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

    const body = await req.json()
    const {
      email,
      userId,
      plan = 'pro',
      interval = 'monthly',
      trial = false,
      currency = 'gbp',
    } = body as {
      email?: string
      userId?: string
      plan?: 'pro' | 'studio'
      interval?: 'monthly' | 'yearly'
      trial?: boolean
      currency?: string
    }

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }

    if (!['pro', 'studio'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Pick the right Stripe price ID. Pro has monthly + yearly. Studio stays monthly.
    const proMonthly = (process.env.STRIPE_PRICE_ID || '').trim()
    const proYearly = (process.env.STRIPE_PRICE_YEARLY || '').trim()
    const studioPrice = (process.env.STRIPE_STUDIO_PRICE_ID || '').trim()

    let priceId: string
    if (plan === 'studio') {
      priceId = studioPrice
    } else if (interval === 'yearly') {
      priceId = proYearly || proMonthly // graceful fallback to monthly if yearly missing
    } else {
      priceId = proMonthly
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for ${plan} ${interval}` },
        { status: 503 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const Stripe = (await import('stripe')).default
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' as import('stripe').Stripe.LatestApiVersion })

    const sessionConfig: import('stripe').Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      metadata: {
        userId,
        plan,
        interval,
        trial: String(trial),
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
    }

    // Trial only applies to Pro (Studio has a verification gate that makes trials pointless).
    if (trial && plan === 'pro') {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: { userId, plan },
      }
    }

    const session = await stripeClient.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
