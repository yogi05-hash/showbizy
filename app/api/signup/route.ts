import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail, transporter } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, streams, skills, city, availability, portfolio, avatar } = body

    // TODO: Add avatar column to showbizy_users table in Supabase
    // ALTER TABLE showbizy_users ADD COLUMN avatar TEXT;

    // Try saving with avatar first, fall back to without if column doesn't exist
    let userData = null
    let dbError = null

    const insertData: Record<string, unknown> = {
      name,
      email,
      streams: streams || [],
      skills: skills || [],
      city,
      availability: availability || 'full-time',
      portfolio,
      verified: true, // Creatives don't need verification, only Studios do
      verification_status: 'not_required',
    }

    // Include avatar if provided
    if (avatar) {
      insertData.avatar = avatar
    }

    const result = await supabaseAdmin
      .from('showbizy_users')
      .insert(insertData)
      .select()
      .single()

    userData = result.data
    dbError = result.error

    // If avatar column doesn't exist, retry without it
    if (dbError && dbError.message?.includes('avatar')) {
      console.warn('Avatar column not found, saving without avatar:', dbError.message)
      const { avatar: _removed, ...insertWithoutAvatar } = insertData
      void _removed
      const retryResult = await supabaseAdmin
        .from('showbizy_users')
        .insert(insertWithoutAvatar)
        .select()
        .single()

      userData = retryResult.data
      dbError = retryResult.error
    }

    if (dbError) {
      console.error('DB error:', dbError)
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({
        name,
        email,
        streams: streams || [],
        skills: skills || [],
        city,
        availability: availability || 'full-time',
        portfolio,
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the signup if email fails
    }

    // Notify admin of new signup
    try {
      await transporter.sendMail({
        from: '"ShowBizy Admin" <admin@showbizy.ai>',
        to: 'yogibot05@gmail.com',
        replyTo: email,
        subject: `🎬 New ShowBizy signup: ${name} (${city || 'Unknown'})`,
        html: `
<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #1a1a2e; color: #e2e8f0; padding: 24px; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #F5B731, #E87B35); padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
    <h2 style="color: #000; margin: 0;">🎬 New ShowBizy Signup</h2>
  </div>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; color: #94a3b8;">Name</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${name}</td></tr>
    <tr><td style="padding: 8px 0; color: #94a3b8;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #F5B731;">${email}</a></td></tr>
    <tr><td style="padding: 8px 0; color: #94a3b8;">City</td><td style="padding: 8px 0; color: #fff;">${city || 'Not provided'}</td></tr>
    <tr><td style="padding: 8px 0; color: #94a3b8;">Availability</td><td style="padding: 8px 0; color: #fff;">${availability || 'Not provided'}</td></tr>
    <tr><td style="padding: 8px 0; color: #94a3b8;">Streams</td><td style="padding: 8px 0; color: #fff;">${(streams || []).join(', ') || 'None'}</td></tr>
    <tr><td style="padding: 8px 0; color: #94a3b8;">Skills</td><td style="padding: 8px 0; color: #fff;">${(skills || []).join(', ') || 'None'}</td></tr>
    ${portfolio ? `<tr><td style="padding: 8px 0; color: #94a3b8;">Portfolio</td><td style="padding: 8px 0;"><a href="${portfolio}" style="color: #F5B731;">${portfolio}</a></td></tr>` : ''}
  </table>
  <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); color: #64748b; font-size: 12px;">
    Signed up at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)
  </p>
</div>`,
      })
    } catch (adminEmailError) {
      console.error('Admin notification email error:', adminEmailError)
    }

    // Include avatar in response for localStorage
    if (avatar && userData) {
      userData.avatar = avatar
    }

    return NextResponse.json({ success: true, user: userData })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
