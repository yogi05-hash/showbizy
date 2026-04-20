import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const LOOKBACK_DAYS = 30
const MIN_RESULTS = 3 // hide ticker below this count — avoids "1 person joined" awkwardness

interface Row {
  name: string | null
  city: string | null
  streams: string[] | null
  created_at: string
}

// GET /api/signups/recent?country=GB
// Returns up to 6 anonymised recent signups for the hero ticker. Shows
// first name + first initial of last name only (privacy + still honest).
// Strategy:
// 1. Try the visitor's country first. If ≥ MIN_RESULTS rows in the last
//    LOOKBACK_DAYS, use them — most "local" social proof.
// 2. Otherwise fall back to global last-30-days.
// 3. Otherwise return an empty list → the ticker component hides itself.
export async function GET(req: NextRequest) {
  const countryHint = (req.nextUrl.searchParams.get('country') || '').trim()
  const cityHint = req.nextUrl.searchParams.get('city') || ''

  const sinceIso = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // Loose city → country mapping. Keys match both the friendly names returned
  // by lib/location.ts detectLocation() ("UK", "USA", "India", etc.) and the
  // common ISO-2 codes ("GB", "US", "IN") so callers can pass either.
  const COUNTRY_CITIES: Record<string, string[]> = {
    UK: ['London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds'],
    GB: ['London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds'],
    USA: ['Los Angeles', 'New York', 'Chicago', 'Austin', 'Atlanta', 'San Francisco'],
    US: ['Los Angeles', 'New York', 'Chicago', 'Austin', 'Atlanta', 'San Francisco'],
    India: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'],
    IN: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'],
    Germany: ['Berlin', 'Hamburg', 'Munich', 'Frankfurt'],
    DE: ['Berlin', 'Hamburg', 'Munich', 'Frankfurt'],
    France: ['Paris', 'Lyon', 'Marseille'],
    FR: ['Paris', 'Lyon', 'Marseille'],
    Netherlands: ['Amsterdam', 'Rotterdam'],
    NL: ['Amsterdam', 'Rotterdam'],
    Spain: ['Barcelona', 'Madrid'],
    ES: ['Barcelona', 'Madrid'],
    Australia: ['Sydney', 'Melbourne', 'Brisbane'],
    AU: ['Sydney', 'Melbourne', 'Brisbane'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    CA: ['Toronto', 'Vancouver', 'Montreal'],
    UAE: ['Dubai', 'Abu Dhabi'],
    AE: ['Dubai', 'Abu Dhabi'],
    Singapore: ['Singapore'],
    SG: ['Singapore'],
    Nigeria: ['Lagos', 'Abuja'],
    NG: ['Lagos', 'Abuja'],
  }

  async function fetchScoped(cities: string[] | null): Promise<Row[]> {
    let q = supabaseAdmin
      .from('showbizy_users')
      .select('name, city, streams, created_at')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(6)
    if (cities && cities.length > 0) {
      q = q.in('city', cities)
    }
    const { data } = await q
    return (data as Row[] | null) || []
  }

  // 1. Country-scoped attempt
  let rows: Row[] = []
  if (countryHint && COUNTRY_CITIES[countryHint]) {
    rows = await fetchScoped(COUNTRY_CITIES[countryHint])
    // Include the city the visitor is actually in (from headers), even if not in our list.
    if (cityHint && !COUNTRY_CITIES[countryHint].includes(cityHint)) {
      const extra = await fetchScoped([cityHint])
      rows = [...rows, ...extra].filter((r, i, arr) =>
        arr.findIndex(x => x.name === r.name && x.created_at === r.created_at) === i
      )
    }
  }

  // 2. Global fallback if country results are thin
  if (rows.length < MIN_RESULTS) {
    const global = await fetchScoped(null)
    if (global.length >= MIN_RESULTS) rows = global
    else rows = [] // 3. Not enough activity to show the ticker honestly — hide.
  }

  const signups = rows.slice(0, 6).map(r => {
    const parts = (r.name || '').trim().split(/\s+/)
    const first = parts[0] || 'Someone'
    const lastInitial = parts[1] ? parts[1][0] + '.' : ''
    const stream = Array.isArray(r.streams) && r.streams.length > 0 ? r.streams[0] : null
    return {
      displayName: lastInitial ? `${first} ${lastInitial}` : first,
      city: r.city || null,
      stream,
      createdAt: r.created_at,
    }
  })

  return NextResponse.json({
    signups,
    scope: countryHint && rows.length > 0 ? 'country' : signups.length > 0 ? 'global' : 'empty',
  })
}
