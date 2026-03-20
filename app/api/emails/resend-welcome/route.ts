import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Look up user in showbizy_users
    const { data: user, error: dbError } = await supabaseAdmin
      .from('showbizy_users')
      .select('*')
      .eq('email', email)
      .single()

    if (dbError || !user) {
      console.error('User lookup error:', dbError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Resend welcome email
    await sendWelcomeEmail({
      name: user.name,
      email: user.email,
      streams: user.streams || [],
      skills: user.skills || [],
      city: user.city,
      availability: user.availability,
      portfolio: user.portfolio,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
