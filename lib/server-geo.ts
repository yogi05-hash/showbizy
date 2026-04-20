import type { NextRequest } from 'next/server'

// Canonical city + country derived from the visitor's actual IP via Vercel's
// x-vercel-ip-* headers. Works server-side only. Falls back to London/UK if
// headers are missing (local dev or self-hosted).
//
// Use this inside route handlers so the backend decides based on the real
// visitor — not whatever the browser timezone happens to say. Browser
// timezone can be dead wrong (travelling, VPN, old cached setting).

export interface ServerGeo {
  city: string
  country: string
  countryCode: string
  source: 'vercel' | 'fallback'
}

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  GB: 'UK',
  US: 'USA',
  IN: 'India',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  AU: 'Australia',
  CA: 'Canada',
  AE: 'UAE',
  SG: 'Singapore',
  NG: 'Nigeria',
  ZA: 'South Africa',
  KE: 'Kenya',
  JP: 'Japan',
  HK: 'Hong Kong',
  BR: 'Brazil',
  MX: 'Mexico',
  NZ: 'New Zealand',
  IE: 'Ireland',
}

// Best-known city per country for when Vercel gives us the country code but
// not the city (happens for some mobile/VPN IPs).
const DEFAULT_CITY_BY_COUNTRY: Record<string, string> = {
  GB: 'London',
  US: 'Los Angeles',
  IN: 'Mumbai',
  DE: 'Berlin',
  FR: 'Paris',
  ES: 'Barcelona',
  IT: 'Rome',
  NL: 'Amsterdam',
  AU: 'Sydney',
  CA: 'Toronto',
  AE: 'Dubai',
  SG: 'Singapore',
  NG: 'Lagos',
  ZA: 'Cape Town',
  KE: 'Nairobi',
  JP: 'Tokyo',
  HK: 'Hong Kong',
  BR: 'São Paulo',
  MX: 'Mexico City',
  NZ: 'Auckland',
  IE: 'Dublin',
}

export function getServerGeo(req: Request | NextRequest): ServerGeo {
  const h = req.headers

  // URL override for testing — ?country=US or ?country=IN lets anyone
  // simulate a different visitor without a VPN. Matches the override
  // behavior in lib/location.ts so client and server stay aligned.
  let overrideCountry = ''
  let overrideCity = ''
  try {
    const url = new URL((req as Request).url || '')
    overrideCountry = (url.searchParams.get('country') || '').toUpperCase()
    overrideCity = url.searchParams.get('city') || ''
  } catch {
    // Not a URL-bearing request (unlikely inside a route handler) — fine.
  }

  // Country override (?country=US) should also reset the city — otherwise we
  // end up combining an overridden country with the real IP's city (e.g.
  // "USA + Woolwich") which looks broken in testing.
  const rawCity = overrideCity
    ? overrideCity
    : overrideCountry
      ? '' // discard real IP city when country is overridden; let default map pick
      : h.get('x-vercel-ip-city') || ''
  const rawCountry = overrideCountry || (h.get('x-vercel-ip-country') || '').toUpperCase()

  const city = decodeURIComponent(rawCity).trim()
  const countryCode = rawCountry || 'GB'

  const chosenCity = city || DEFAULT_CITY_BY_COUNTRY[countryCode] || 'London'
  const chosenCountry = COUNTRY_CODE_TO_NAME[countryCode] || 'UK'

  return {
    city: chosenCity,
    country: chosenCountry,
    countryCode,
    source: overrideCountry ? 'vercel' : rawCountry ? 'vercel' : 'fallback',
  }
}
