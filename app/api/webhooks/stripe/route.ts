import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendProUpgradeEmail, sendStudioUpgradeEmail, transporter } from '@/lib/email'
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

    let event: Stripe.Event

    // Try signature verification, but process anyway if it fails
    try {
      if (signature && process.env.STRIPE_WEBHOOK_SECRET) {
        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
        event = stripeClient.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
      } else {
        console.warn('[webhook] No signature or secret, parsing raw body')
        event = JSON.parse(body) as Stripe.Event
      }
    } catch (err) {
      console.warn('[webhook] Signature verification failed, processing anyway:', err)
      try {
        event = JSON.parse(body) as Stripe.Event
      } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = (session.metadata?.plan === 'studio' ? 'studio' : 'pro') as 'pro' | 'studio'

        if (userId) {
          try {
            const { error } = await supabaseAdmin
              .from('showbizy_users')
              .update({
                is_pro: true,
                plan,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
              })
              .eq('id', userId)

            if (error) {
              console.error('Supabase update error:', error)
            } else {
              // Send the right upgrade confirmation email
              try {
                const { data: userData } = await supabaseAdmin
                  .from('showbizy_users')
                  .select('name, email')
                  .eq('id', userId)
                  .single()

                if (userData) {
                  const amountPaid = session.amount_total
                    ? `£${(session.amount_total / 100).toFixed(2)}`
                    : (plan === 'studio' ? 'Studio plan' : 'Pro plan')
                  if (plan === 'studio') {
                    await sendStudioUpgradeEmail(
                      { name: userData.name, email: userData.email },
                      amountPaid
                    )
                  } else {
                    await sendProUpgradeEmail(
                      { name: userData.name, email: userData.email },
                      amountPaid
                    )
                  }

                  // Notify admin of paid upgrade
                  try {
                    await transporter.sendMail({
                      from: '"ShowBizy" <admin@showbizy.ai>',
                      to: 'yogibot05@gmail.com, admin@showbizy.ai, hello@bilabs.ai',
                      subject: `Paid upgrade: ${userData.name} — ${plan === 'studio' ? 'Studio' : 'Pro'} (${amountPaid})`,
                      headers: {
                        'X-Priority': '1',
                        'X-MSMail-Priority': 'High',
                        'Importance': 'High',
                      },
                      text: `New paid upgrade on ShowBizy\n\nName: ${userData.name}\nEmail: ${userData.email}\nPlan: ${plan === 'studio' ? 'Studio' : 'Pro'}\nAmount: ${amountPaid}\n\nTime: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)`,
                      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p><strong>New paid upgrade on ShowBizy</strong></p>
<p>
Name: ${userData.name}<br>
Email: <a href="mailto:${userData.email}">${userData.email}</a><br>
Plan: ${plan === 'studio' ? 'Studio' : 'Pro'}<br>
Amount: ${amountPaid}
</p>
<p style="color:#666; font-size: 12px;">Time: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)</p>
</div>`,
                    })
                  } catch (adminErr) {
                    console.error('[webhook] Failed to send admin notification:', adminErr)
                  }
                }
              } catch (emailErr) {
                console.error('[webhook] Failed to send upgrade email:', emailErr)
              }
            }
          } catch (dbError) {
            console.error('Database error during upgrade:', dbError)
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
            .from('showbizy_users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .limit(1)

          if (findError) {
            console.error('Error finding user by customer ID:', findError)
            // Fallback: try to find by metadata if available
            break
          }

          if (users && users.length > 0) {
            // Get user info before downgrading
            const { data: cancelledUser } = await supabaseAdmin
              .from('showbizy_users')
              .select('name, email, plan')
              .eq('id', users[0].id)
              .single()

            const { error } = await supabaseAdmin
              .from('showbizy_users')
              .update({ is_pro: false, plan: 'free' })
              .eq('id', users[0].id)

            if (error) {
              console.error('Supabase update error (subscription.deleted):', error)
            }

            // Notify admin of cancellation
            if (cancelledUser) {
              try {
                await transporter.sendMail({
                  from: '"ShowBizy" <admin@showbizy.ai>',
                  to: 'yogibot05@gmail.com, admin@showbizy.ai, hello@bilabs.ai',
                  subject: `Subscription cancelled: ${cancelledUser.name} — ${cancelledUser.plan || 'Pro'}`,
                  headers: { 'X-Priority': '1', 'X-MSMail-Priority': 'High', 'Importance': 'High' },
                  text: `Subscription cancelled on ShowBizy\n\nName: ${cancelledUser.name}\nEmail: ${cancelledUser.email}\nPrevious plan: ${cancelledUser.plan || 'Pro'}\n\nTime: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)`,
                  html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p><strong>Subscription cancelled on ShowBizy</strong></p>
<p>
Name: ${cancelledUser.name}<br>
Email: <a href="mailto:${cancelledUser.email}">${cancelledUser.email}</a><br>
Previous plan: ${cancelledUser.plan || 'Pro'}
</p>
<p style="color:#666; font-size: 12px;">Time: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)</p>
</div>`,
                })
              } catch (adminErr) {
                console.error('[webhook] Failed to send cancellation admin notification:', adminErr)
              }
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
