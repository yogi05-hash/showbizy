import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateReferralCode } from '@/lib/referral'

export const dynamic = 'force-dynamic'

// GET /api/referral/me?user_id=...
// Returns the user's referral code (lazy-generated on first call) plus the
// count of successful referrals they've made.
//
// Auth model follows the rest of the codebase: client reads the user id from
// its localStorage record and passes it on the query string. The service-role
// client on the server verifies the user exists before doing anything.
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const { data: user, error } = await supabaseAdmin
    .from('showbizy_users')
    .select('id, referral_code')
    .eq('id', userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let code = user.referral_code as string | null

  // Lazy-generate the code on first call. Retry on the extremely rare
  // collision with another user's code (text unique constraint enforces it).
  if (!code) {
    for (let i = 0; i < 5 && !code; i++) {
      const candidate = generateReferralCode()
      const { error: updateErr } = await supabaseAdmin
        .from('showbizy_users')
        .update({ referral_code: candidate })
        .eq('id', userId)
      if (!updateErr) code = candidate
    }
  }

  const { count } = await supabaseAdmin
    .from('showbizy_users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', code || '__never__')

  return NextResponse.json({
    code: code || null,
    referrals: count ?? 0,
  })
}
