import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Try to get existing position
    const { data: existing } = await supabaseAdmin
      .from('showbizy_waitlist')
      .select('position')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ position: existing.position })
    }

    // Get current max position
    const { data: maxRow } = await supabaseAdmin
      .from('showbizy_waitlist')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (maxRow?.position || 2847) + 1

    // Insert new entry
    const { data, error } = await supabaseAdmin
      .from('showbizy_waitlist')
      .insert({ email, position: nextPosition })
      .select('position')
      .single()

    if (error) {
      // Race condition — already exists
      if (error.code === '23505') {
        const { data: retry } = await supabaseAdmin
          .from('showbizy_waitlist')
          .select('position')
          .eq('email', email)
          .single()
        return NextResponse.json({ position: retry?.position || nextPosition })
      }
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    return NextResponse.json({ position: data.position })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  const { count } = await supabaseAdmin
    .from('showbizy_waitlist')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ total: (count || 0) + 2847 })
}
