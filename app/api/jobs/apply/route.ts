import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { user_id, job_id, job_title, company, location, cover_note } = await req.json()

    if (!user_id || !job_id || !job_title || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is Pro
    const { data: user, error: userError } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, email, is_pro')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.is_pro) {
      return NextResponse.json({ error: 'Pro plan required to apply to jobs' }, { status: 403 })
    }

    // Check if already applied
    const { data: existing } = await supabaseAdmin
      .from('showbizy_job_applications')
      .select('id')
      .eq('user_id', user_id)
      .eq('job_id', job_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 })
    }

    // Insert application
    const { data, error } = await supabaseAdmin
      .from('showbizy_job_applications')
      .insert({
        user_id,
        job_id,
        job_title,
        company,
        location: location || '',
        cover_note: cover_note || '',
      })
      .select()
      .single()

    if (error) {
      console.error('Apply error:', error)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    // Send confirmation email (non-blocking)
    try {
      const { transporter } = await import('@/lib/email')
      await transporter.sendMail({
        from: '"ShowBizy" <admin@showbizy.ai>',
        to: user.email,
        subject: `Application Sent — ${job_title} at ${company}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0;">🎬 Application Sent!</h1>
            </div>
            <div style="background: #1a1a2e; padding: 32px; color: #e2e8f0; border-radius: 0 0 16px 16px;">
              <p>Hey ${user.name},</p>
              <p>Your ShowBizy profile has been submitted for:</p>
              <div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); border-radius: 12px; padding: 16px; margin: 16px 0;">
                <h3 style="color: #a78bfa; margin: 0 0 4px;">${job_title}</h3>
                <p style="color: #94a3b8; margin: 0; font-size: 14px;">${company} • ${location}</p>
              </div>
              ${cover_note ? `<p style="font-style: italic; color: #94a3b8;">"${cover_note}"</p>` : ''}
              <p>You can track your application status in your <a href="https://showbizy.ai/dashboard" style="color: #a78bfa;">dashboard</a>.</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 24px;">— The ShowBizy Team</p>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Email send failed (non-blocking):', emailErr)
    }

    return NextResponse.json({ success: true, application: data })
  } catch (error) {
    console.error('Apply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('showbizy_job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ applications: data || [] })
  } catch (error) {
    console.error('Fetch applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
