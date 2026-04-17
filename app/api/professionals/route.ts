import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Fetch professionals for display (matching by city/stream)
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get('city')
    const stream = req.nextUrl.searchParams.get('stream')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

    let query = supabaseAdmin
      .from('showbizy_professionals')
      .select('id, name, title, company, city, country, photo_url, skills, streams, headline')
      .eq('is_displayed', true)
      .limit(Math.min(limit, 50))

    if (city) {
      query = query.ilike('city', `%${city.split(',')[0].trim()}%`)
    }

    if (stream) {
      query = query.contains('streams', [stream])
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Professionals fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({
      professionals: data || [],
      total: data?.length || 0,
    })
  } catch (error) {
    console.error('Professionals error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
