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
        from: '"ShowBizy" <hello@bilabs.ai>',
        to: 'yogibot05@gmail.com',
        subject: `🎬 New ShowBizy signup: ${name} (${city || 'Unknown'})`,
        html: `<p><strong>${name}</strong> (${email}) just signed up from <strong>${city || 'Unknown'}</strong>.</p>
<p>Streams: ${(streams || []).join(', ') || 'None'}</p>
<p>Skills: ${(skills || []).join(', ') || 'None'}</p>`,
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
