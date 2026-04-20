import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerGeo } from '@/lib/server-geo'

export const dynamic = 'force-dynamic'

// GET: Fetch professionals for display (matching by city/stream).
// If the caller doesn't pass ?city=, we fall back to the visitor's real IP
// geo (Vercel x-vercel-ip-* headers). This prevents the common issue where
// a USA/India visitor whose browser timezone is set to London gets fed
// London professionals.
export async function GET(req: NextRequest) {
  try {
    const cityParam = req.nextUrl.searchParams.get('city')
    const stream = req.nextUrl.searchParams.get('stream')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

    const serverGeo = getServerGeo(req)
    // Explicit ?city= wins (useful for /dashboard showing a user's saved city).
    // Otherwise use the IP-derived city so the default always matches the
    // visitor's real location.
    const effectiveCity = (cityParam && cityParam.trim()) || serverGeo.city

    let query = supabaseAdmin
      .from('showbizy_professionals')
      .select('id, name, title, company, city, country, photo_url, skills, streams, headline')
      .eq('is_displayed', true)
      .limit(Math.min(limit, 50))

    query = query.ilike('city', `%${effectiveCity.split(',')[0].trim()}%`)

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
      cityUsed: effectiveCity,
      geoSource: serverGeo.source,
    })
  } catch (error) {
    console.error('Professionals error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
