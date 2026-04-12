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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, city, availability, portfolio, skills, streams } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (city !== undefined) updateData.city = city
    if (availability !== undefined) updateData.availability = availability
    if (portfolio !== undefined) updateData.portfolio = portfolio
    if (skills !== undefined) updateData.skills = skills
    if (streams !== undefined) updateData.streams = streams

    const { data, error } = await supabaseAdmin
      .from('showbizy_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[api/user] Update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (err) {
    console.error('[api/user] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
