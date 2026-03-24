import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// TODO: Add STRIPE_WEBHOOK_SECRET to your .env.local
// Get it from Stripe Dashboard → Developers → Webhooks → Add endpoint
// Endpoint URL: https://yourdomain.com/api/webhooks/stripe
// Events to listen for: checkout.session.completed, customer.subscription.deleted

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
    }

    let event: Stripe.Event

    try {
      const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
      event = stripeClient.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId) {
          // Try to update is_pro column - handle gracefully if column doesn't exist
          try {
            const { error } = await supabaseAdmin
              .from('users')
              .update({
                is_pro: true,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
              })
              .eq('id', userId)

            if (error) {
              console.error('Supabase update error (checkout.session.completed):', error)
              // If column doesn't exist, try with just is_pro
              if (error.message?.includes('column')) {
                console.warn('Some columns may not exist yet. Trying minimal update...')
                await supabaseAdmin
                  .from('users')
                  .update({ is_pro: true })
                  .eq('id', userId)
              }
            }
          } catch (dbError) {
            console.error('Database error during pro upgrade:', dbError)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        try {
          // Find user by stripe_customer_id and downgrade
          const { data: users, error: findError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .limit(1)

          if (findError) {
            console.error('Error finding user by customer ID:', findError)
            // Fallback: try to find by metadata if available
            break
          }

          if (users && users.length > 0) {
            const { error } = await supabaseAdmin
              .from('users')
              .update({ is_pro: false })
              .eq('id', users[0].id)

            if (error) {
              console.error('Supabase update error (subscription.deleted):', error)
            }
          }
        } catch (dbError) {
          console.error('Database error during pro downgrade:', dbError)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
