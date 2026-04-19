import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTrialEndingEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/emails/trial-ending { user_id }
// Manual testing endpoint. Normally this email is dispatched by the Stripe
// webhook when customer.subscription.trial_will_end fires (~3 days before
// trial end). This route lets an admin fire it on demand for QA.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { user_id?: string }
    const userId = body.user_id
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const { data: user } = await supabaseAdmin
      .from('showbizy_users')
      .select('name, email, trial_ends_at')
      .eq('id', userId)
      .maybeSingle()

    if (!user?.email) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const endsAt = user.trial_ends_at || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    await sendTrialEndingEmail({ name: user.name, email: user.email }, endsAt)
    return NextResponse.json({ ok: true, sent_to: user.email, trial_ends_at: endsAt })
  } catch (err) {
    console.error('[trial-ending email] error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
