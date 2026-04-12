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

    // Notify admin of new signup — plain text style to avoid Gmail Promotions tab
    try {
      await transporter.sendMail({
        from: '"ShowBizy AI" <admin@showbizy.ai>',
        to: 'yogibot05@gmail.com, admin@showbizy.ai',
        replyTo: email,
        subject: `New signup: ${name} — ${city || 'Unknown'}`,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
        },
        text: `New creative signup on ShowBizy\n\nName: ${name}\nEmail: ${email}\nCity: ${city || 'Not provided'}\nAvailability: ${availability || 'Not provided'}\nStreams: ${(streams || []).join(', ') || 'None'}\nSkills: ${(skills || []).join(', ') || 'None'}${portfolio ? `\nPortfolio: ${portfolio}` : ''}\n\nSigned up at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p><strong>New creative signup on ShowBizy</strong></p>
<p>
Name: ${name}<br>
Email: <a href="mailto:${email}">${email}</a><br>
City: ${city || 'Not provided'}<br>
Availability: ${availability || 'Not provided'}<br>
Streams: ${(streams || []).join(', ') || 'None'}<br>
Skills: ${(skills || []).join(', ') || 'None'}${portfolio ? `<br>Portfolio: <a href="${portfolio}">${portfolio}</a>` : ''}
</p>
<p style="color:#666; font-size: 12px;">Signed up at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (London time)</p>
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
