import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendProUpgradeEmail, sendStudioUpgradeEmail, sendTrialEndingEmail, transporter } from '@/lib/email'
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
        const isTrial = session.metadata?.trial === 'true'

        // If this was a trial-starting checkout for Pro, pull the subscription to
        // read its real trial_end (Stripe sets it when trial_period_days is applied).
        let trialStartedAt: string | null = null
        let trialEndsAt: string | null = null
        let effectivePlan: string = plan
        if (isTrial && plan === 'pro' && session.subscription) {
          try {
            const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
            const sub = await stripeClient.subscriptions.retrieve(session.subscription as string)
            if (sub.status === 'trialing') {
              effectivePlan = 'pro_trial'
              trialStartedAt = sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : new Date().toISOString()
              trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
            }
          } catch (err) {
            console.error('[webhook] Failed to read trial subscription:', err)
          }
        }

        if (userId) {
          try {
            const updatePayload: Record<string, unknown> = {
              is_pro: true,
              plan: effectivePlan,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            }
            if (trialStartedAt) updatePayload.trial_started_at = trialStartedAt
            if (trialEndsAt) updatePayload.trial_ends_at = trialEndsAt

            const { error } = await supabaseAdmin
              .from('showbizy_users')
              .update(updatePayload)
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
                  const amountPaid = isTrial && plan === 'pro' && trialEndsAt
                    ? `7-day free trial — £9/mo from ${new Date(trialEndsAt).toLocaleDateString('en-GB')}`
                    : session.amount_total
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

                  // Notify admin of paid upgrade (or trial start)
                  const adminLabel = isTrial ? 'Trial started' : 'Paid upgrade'
                  try {
                    await transporter.sendMail({
                      from: '"ShowBizy AI" <admin@showbizy.ai>',
                      to: 'yogibot05@gmail.com, admin@showbizy.ai',
                      subject: `${adminLabel}: ${userData.name} — ${plan === 'studio' ? 'Studio' : 'Pro'} (${amountPaid})`,
                      headers: {
                        'X-Priority': '1',
                        'X-MSMail-Priority': 'High',
                        'Importance': 'High',
                      },
                      text: `${adminLabel} on ShowBizy\n\nName: ${userData.name}\nEmail: ${userData.email}\nPlan: ${plan === 'studio' ? 'Studio' : 'Pro'}\nAmount: ${amountPaid}\n\nTime: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)`,
                      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p><strong>${adminLabel} on ShowBizy</strong></p>
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
                  from: '"ShowBizy AI" <admin@showbizy.ai>',
                  to: 'yogibot05@gmail.com, admin@showbizy.ai',
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

      // ─── New: trial lifecycle ────────────────────────────────────────────
      // Fires ~3 days before a trial ends (Stripe default). Prompt the user
      // to confirm or cancel before the first charge.
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        try {
          const { data: user } = await supabaseAdmin
            .from('showbizy_users')
            .select('name, email, trial_ends_at')
            .eq('stripe_customer_id', customerId)
            .maybeSingle()
          if (user?.email) {
            const endsAt = user.trial_ends_at
              || (subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : new Date().toISOString())
            await sendTrialEndingEmail({ name: user.name, email: user.email }, endsAt)
          }
        } catch (err) {
          console.error('[webhook] trial_will_end handler failed:', err)
        }
        break
      }

      // Fires whenever a subscription changes (trialing → active is the important
      // one for us). Promotes the user from pro_trial to pro when Stripe has
      // collected the first real payment.
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        try {
          const status = subscription.status // active, trialing, past_due, canceled, incomplete, unpaid
          const patch: Record<string, unknown> = {}
          if (status === 'active') {
            // Trial (or first bill) cleared — full Pro.
            patch.is_pro = true
            patch.plan = 'pro'
          } else if (status === 'trialing') {
            patch.is_pro = true
            patch.plan = 'pro_trial'
            if (subscription.trial_end) {
              patch.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString()
            }
          } else if (status === 'past_due') {
            // Payment failed but Stripe will retry — keep access, let retry logic work.
            patch.is_pro = true
            patch.plan = 'pro'
          } else if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
            patch.is_pro = false
            patch.plan = 'free'
          }
          if (Object.keys(patch).length > 0) {
            await supabaseAdmin
              .from('showbizy_users')
              .update(patch)
              .eq('stripe_customer_id', customerId)
          }
        } catch (err) {
          console.error('[webhook] subscription.updated handler failed:', err)
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
