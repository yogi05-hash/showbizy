import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Admin email — only this user can access
const ADMIN_EMAIL = 'yogibot05@gmail.com'

// GET: List all Studio applications (verified + pending)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminEmail = searchParams.get('admin_email')

    if (adminEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all users who have submitted Studio info
    const { data, error } = await supabaseAdmin
      .from('showbizy_users')
      .select('*')
      .not('company_name', 'is', null)
      .order('verification_submitted_at', { ascending: false, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ studios: data || [] })
  } catch (error) {
    console.error('Admin verifications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Approve or reject a Studio
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { admin_email, user_id, action, notes } = body

    if (admin_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const verified = action === 'approve'
    const verification_status = action === 'approve' ? 'approved' : 'rejected'

    const { data: user, error: updateErr } = await supabaseAdmin
      .from('showbizy_users')
      .update({
        verified,
        verification_status,
        verification_notes: notes || null,
      })
      .eq('id', user_id)
      .select()
      .single()

    if (updateErr || !user) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    // Send approval/rejection email
    try {
      if (action === 'approve') {
        await transporter.sendMail({
          from: '"ShowBizy" <admin@showbizy.ai>',
          to: user.email,
          subject: `🎉 Your Studio "${user.company_name}" is verified!`,
          html: `
<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #F5B731, #E87B35); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: black; font-size: 28px; margin: 0;">🎉 You're Verified!</h1>
  </div>
  <div style="background: #1a1a2e; padding: 32px; color: #e2e8f0; border-radius: 0 0 16px 16px;">
    <p>Hey ${user.name},</p>
    <p>Great news — your Studio <strong style="color: #F5B731;">${user.company_name}</strong> has been verified by our team. ✅</p>
    <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #22c55e; margin: 0 0 8px;">What's next?</h3>
      <p style="color: #94a3b8; margin: 0; font-size: 14px;">Upgrade to Studio (£29/mo) and start posting projects. Our AI will instantly match you with the best talent in your city.</p>
    </div>
    <a href="https://showbizy.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #F5B731, #E87B35); color: black; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Upgrade & Post Project →</a>
    ${notes ? `<p style="color: #94a3b8; font-size: 13px; margin-top: 24px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;"><strong>Note from our team:</strong> ${notes}</p>` : ''}
  </div>
</div>`,
        })
      } else {
        await transporter.sendMail({
          from: '"ShowBizy" <admin@showbizy.ai>',
          to: user.email,
          subject: `Your ShowBizy Studio application`,
          html: `
<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
  <div style="background: #1a1a2e; padding: 32px; color: #e2e8f0; border-radius: 16px;">
    <p>Hey ${user.name},</p>
    <p>Thanks for applying to become a ShowBizy Studio. Unfortunately we&apos;re unable to verify <strong>${user.company_name}</strong> at this time.</p>
    ${notes ? `<div style="background: rgba(255,255,255,0.05); border-left: 3px solid #F5B731; padding: 16px; margin: 20px 0;"><strong style="color: #F5B731;">Reason:</strong><p style="color: #94a3b8; margin: 8px 0 0;">${notes}</p></div>` : ''}
    <p style="color: #94a3b8;">If you believe this is a mistake or have additional info to share, just reply to this email and we&apos;ll take another look.</p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">— The ShowBizy Team</p>
  </div>
</div>`,
        })
      }
    } catch (emailErr) {
      console.error('Verification email error:', emailErr)
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Verification update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
