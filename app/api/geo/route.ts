import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerGeo } from '@/lib/server-geo'

export const dynamic = 'force-dynamic'

// GET /api/geo — returns the visitor's real city/country from IP headers.
// Used by the client as the single source of truth for which city's content
// to fetch AND display, replacing browser-timezone detection which is
// unreliable when visitors use VPNs or have drifted timezone settings.
export async function GET(req: NextRequest) {
  const geo = getServerGeo(req)
  return NextResponse.json(geo)
}
