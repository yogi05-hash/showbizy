import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('showbizy_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      console.error('[api/user] Supabase error:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: data })
  } catch (err) {
    console.error('[api/user] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
