import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { REFERRAL_REWARD_DAYS } from '@/lib/referral'

export const dynamic = 'force-dynamic'

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
}

// POST /api/referral/redeem { user_id, code }
// The new user redeems a referral code once. Both they and the referrer gain
// REFERRAL_REWARD_DAYS of Pro, tracked via showbizy_users.pro_extra_until.
// The extension stacks on whatever pro_extra_until is already set.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    user_id?: string
    code?: string
  }
  const newUserId = body.user_id
  const rawCode = (body.code || '').trim().toUpperCase()

  if (!newUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  if (!rawCode) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const { data: newUser } = await supabaseAdmin
    .from('showbizy_users')
    .select('id, referred_by, pro_extra_until')
    .eq('id', newUserId)
    .maybeSingle()

  if (!newUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (newUser.referred_by) {
    return NextResponse.json({ error: 'Referral already redeemed' }, { status: 409 })
  }

  const { data: referrer } = await supabaseAdmin
    .from('showbizy_users')
    .select('id, pro_extra_until')
    .eq('referral_code', rawCode)
    .maybeSingle()

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
  }
  if (referrer.id === newUserId) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  const now = new Date()
  const refBase = referrer.pro_extra_until && new Date(referrer.pro_extra_until) > now
    ? new Date(referrer.pro_extra_until)
    : now
  const newBase = newUser.pro_extra_until && new Date(newUser.pro_extra_until) > now
    ? new Date(newUser.pro_extra_until)
    : now

  const refUntil = addDays(refBase, REFERRAL_REWARD_DAYS)
  const newUntil = addDays(newBase, REFERRAL_REWARD_DAYS)

  const { error: refErr } = await supabaseAdmin
    .from('showbizy_users')
    .update({ pro_extra_until: refUntil.toISOString() })
    .eq('id', referrer.id)

  if (refErr) return NextResponse.json({ error: refErr.message }, { status: 500 })

  const { error: newErr } = await supabaseAdmin
    .from('showbizy_users')
    .update({
      pro_extra_until: newUntil.toISOString(),
      referred_by: rawCode,
    })
    .eq('id', newUserId)

  if (newErr) return NextResponse.json({ error: newErr.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    rewardDays: REFERRAL_REWARD_DAYS,
    pro_extra_until: newUntil.toISOString(),
  })
}
