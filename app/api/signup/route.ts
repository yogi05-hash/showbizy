import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, streams, skills, city, availability, portfolio } = body

    // Save to Supabase
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('showbizy_users')
      .insert({
        name,
        email,
        streams: streams || [],
        skills: skills || [],
        city,
        availability: availability || 'full-time',
        portfolio,
      })
      .select()
      .single()

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

    return NextResponse.json({ success: true, user: userData })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
