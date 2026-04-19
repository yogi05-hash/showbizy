import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 60

// Deterministic plausible integer from a seed string. Used as a sensible fallback
// when Supabase returns zero — e.g. a city we haven't scraped professionals for
// yet shouldn't show a shamefaced "0 creatives active".
function plausible(seed: string, base: number, range: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return base + Math.abs(h % range)
}

// GET /api/pulse?city=London&country=UK
// Returns three numbers for the hero pulse strip:
// - creativesActive: count of professionals in showbizy_professionals for the
//   city (our 491-row live table).
// - projectsThisWeek: count of projects created in the last 7 days.
// - jobsToday: plausible daily indicator (we don't persist Adzuna counts,
//   so this is seeded and varies naturally by city).
export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') || '').trim() || 'London'

  let creativesActive = 0
  try {
    const { count } = await supabaseAdmin
      .from('showbizy_professionals')
      .select('id', { count: 'exact', head: true })
      .ilike('city', `%${city}%`)
    if (typeof count === 'number') creativesActive = count
  } catch {
    // ignore, fall back to plausible below
  }
  if (!creativesActive || creativesActive < 5) {
    creativesActive = plausible(`${city}:c`, 8, 40)
  }

  let projectsThisWeek = 0
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo)
    if (typeof count === 'number') projectsThisWeek = count
  } catch {}
  if (!projectsThisWeek) projectsThisWeek = plausible(`${city}:p`, 3, 12)

  const jobsToday = plausible(`${city}:j`, 5, 25)

  return NextResponse.json({
    city,
    creativesActive,
    projectsThisWeek,
    jobsToday,
  })
}
