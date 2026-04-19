import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/stripe/portal { user_id }
// Creates a Stripe billing-portal session so the user can update their card,
// view invoices, or cancel. Returns the portal URL for redirect.
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const body = await req.json().catch(() => ({})) as { user_id?: string }
    const userId = body.user_id
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from('showbizy_users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle()

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing profile yet' }, { status: 404 })
    }

    const origin = req.headers.get('origin') || 'https://showbizy.ai'
    const Stripe = (await import('stripe')).default
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' as import('stripe').Stripe.LatestApiVersion })

    const session = await stripeClient.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe portal] error:', err)
    const message = err instanceof Error ? err.message : 'Failed to open portal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
