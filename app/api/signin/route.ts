import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Look up user by email
    const { data: user, error } = await supabaseAdmin
      .from('showbizy_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 401 })
    }

    // For now, simple password check (we'll add proper hashing later)
    // If no password set, allow login with just email (early access)
    if (user.password_hash && user.password_hash !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Return user data (without password)
    const { password_hash: _, ...safeUser } = user

    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
