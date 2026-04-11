export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR'

export interface LocationData {
  city: string
  country: string
  currency: {
    code: CurrencyCode
    symbol: string
  }
}

export interface PricingTier {
  free: number
  pro: number
  studio: number
}

export interface PricingData {
  INR: PricingTier
  USD: PricingTier
  GBP: PricingTier
  EUR: PricingTier
}

// Pricing in all currencies
export const PRICING: PricingData = {
  INR: { free: 0, pro: 299, studio: 999 },
  USD: { free: 0, pro: 12, studio: 35 },
  GBP: { free: 0, pro: 9, studio: 29 },
  EUR: { free: 0, pro: 10, studio: 33 },
}

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
} as const

// City mappings by timezone patterns
const TIMEZONE_MAPPING = {
  // India (both modern and legacy timezone names)
  'Asia/Kolkata': {
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
    country: 'India',
    currency: 'INR' as CurrencyCode,
  },
  'Asia/Calcutta': {
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
    country: 'India',
    currency: 'INR' as CurrencyCode,
  },
  
  // USA - major timezones
  'America/New_York': {
    cities: ['New York', 'Atlanta', 'Chicago'],
    country: 'USA',
    currency: 'USD' as CurrencyCode,
  },
  'America/Chicago': {
    cities: ['Chicago', 'Austin', 'New York'],
    country: 'USA',
    currency: 'USD' as CurrencyCode,
  },
  'America/Denver': {
    cities: ['Austin', 'Chicago', 'Los Angeles'],
    country: 'USA',
    currency: 'USD' as CurrencyCode,
  },
  'America/Los_Angeles': {
    cities: ['Los Angeles', 'Austin', 'New York'],
    country: 'USA',
    currency: 'USD' as CurrencyCode,
  },
  
  // UK
  'Europe/London': {
    cities: ['London', 'Manchester', 'Birmingham'],
    country: 'UK',
    currency: 'GBP' as CurrencyCode,
  },
  
  // Europe
  'Europe/Berlin': {
    cities: ['Berlin', 'Amsterdam', 'Paris', 'Barcelona'],
    country: 'Germany',
    currency: 'EUR' as CurrencyCode,
  },
  'Europe/Paris': {
    cities: ['Paris', 'Berlin', 'Amsterdam', 'Barcelona'],
    country: 'France',
    currency: 'EUR' as CurrencyCode,
  },
  'Europe/Amsterdam': {
    cities: ['Amsterdam', 'Berlin', 'Paris', 'Barcelona'],
    country: 'Netherlands',
    currency: 'EUR' as CurrencyCode,
  },
  'Europe/Madrid': {
    cities: ['Barcelona', 'Paris', 'Berlin', 'Amsterdam'],
    country: 'Spain',
    currency: 'EUR' as CurrencyCode,
  },
} as const

// Fallback mapping for broader timezone patterns
const TIMEZONE_PATTERNS = [
  { pattern: /^America\//, cities: ['Los Angeles', 'New York', 'Chicago', 'Austin', 'Atlanta'], country: 'USA', currency: 'USD' as CurrencyCode },
  { pattern: /^Europe\/(?!London)/, cities: ['Berlin', 'Paris', 'Amsterdam', 'Barcelona'], country: 'Europe', currency: 'EUR' as CurrencyCode },
  { pattern: /^Asia\/.*India/, cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'], country: 'India', currency: 'INR' as CurrencyCode },
] as const

export function detectLocation(): LocationData {
  try {
    // Allow URL override for testing: ?country=in, ?country=us, etc.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const override = params.get('country')?.toUpperCase()
      if (override) {
        const overrideMap: Record<string, { city: string; country: string; currency: CurrencyCode }> = {
          'IN': { city: 'Mumbai', country: 'India', currency: 'INR' },
          'US': { city: 'Los Angeles', country: 'USA', currency: 'USD' },
          'GB': { city: 'London', country: 'UK', currency: 'GBP' },
          'UK': { city: 'London', country: 'UK', currency: 'GBP' },
          'DE': { city: 'Berlin', country: 'Germany', currency: 'EUR' },
          'EU': { city: 'Berlin', country: 'Europe', currency: 'EUR' },
          'FR': { city: 'Paris', country: 'France', currency: 'EUR' },
        }
        const o = overrideMap[override]
        if (o) {
          return { city: o.city, country: o.country, currency: { code: o.currency, symbol: CURRENCY_SYMBOLS[o.currency] } }
        }
      }
    }

    // Get browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Try exact match first
    const exactMatch = TIMEZONE_MAPPING[timezone as keyof typeof TIMEZONE_MAPPING]
    if (exactMatch) {
      return {
        city: exactMatch.cities[0], // Primary city for the timezone
        country: exactMatch.country,
        currency: {
          code: exactMatch.currency,
          symbol: CURRENCY_SYMBOLS[exactMatch.currency],
        },
      }
    }
    
    // Try pattern matching
    for (const { pattern, cities, country, currency } of TIMEZONE_PATTERNS) {
      if (pattern.test(timezone)) {
        return {
          city: cities[0],
          country,
          currency: {
            code: currency,
            symbol: CURRENCY_SYMBOLS[currency],
          },
        }
      }
    }
    
    // Default to London if no match
    return {
      city: 'London',
      country: 'UK',
      currency: {
        code: 'GBP' as CurrencyCode,
        symbol: '£',
      },
    }
  } catch (error) {
    // Fallback to London if timezone detection fails
    console.warn('Location detection failed:', error)
    return {
      city: 'London',
      country: 'UK',
      currency: {
        code: 'GBP' as CurrencyCode,
        symbol: '£',
      },
    }
  }
}

// City lists by country for showing variety on homepage
const COUNTRY_CITIES: Record<string, string[]> = {
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
  'USA': ['Los Angeles', 'New York', 'Chicago', 'Austin', 'Atlanta'],
  'UK': ['London', 'Manchester', 'Birmingham'],
  'Germany': ['Berlin', 'Amsterdam', 'Paris', 'Barcelona'],
  'France': ['Paris', 'Berlin', 'Amsterdam', 'Barcelona'],
  'Netherlands': ['Amsterdam', 'Berlin', 'Paris', 'Barcelona'],
  'Spain': ['Barcelona', 'Paris', 'Berlin', 'Amsterdam'],
  'Europe': ['Berlin', 'Paris', 'Amsterdam', 'Barcelona'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal'],
  'UAE': ['Dubai', 'Abu Dhabi'],
  'Nigeria': ['Lagos', 'Abuja'],
  'Singapore': ['Singapore'],
}

// Helper function to get all cities for a detected location (for showing variety)
export function getCitiesForLocation(location: LocationData): string[] {
  // Use country from detected location (works with both timezone and IP detection)
  const countryCities = COUNTRY_CITIES[location.country]
  if (countryCities) return [...countryCities]

  // Fallback: try timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const exactMatch = TIMEZONE_MAPPING[timezone as keyof typeof TIMEZONE_MAPPING]
    if (exactMatch) return [...exactMatch.cities]
    for (const { pattern, cities } of TIMEZONE_PATTERNS) {
      if (pattern.test(timezone)) return [...cities]
    }
  } catch {}

  return [location.city, 'London', 'New York']
}

// ─── IP-based geolocation (primary, more reliable than timezone) ──────────

const IP_COUNTRY_MAP: Record<string, { city: string; country: string; currency: CurrencyCode }> = {
  IN: { city: 'Mumbai', country: 'India', currency: 'INR' },
  US: { city: 'Los Angeles', country: 'USA', currency: 'USD' },
  GB: { city: 'London', country: 'UK', currency: 'GBP' },
  DE: { city: 'Berlin', country: 'Germany', currency: 'EUR' },
  FR: { city: 'Paris', country: 'France', currency: 'EUR' },
  ES: { city: 'Barcelona', country: 'Spain', currency: 'EUR' },
  NL: { city: 'Amsterdam', country: 'Netherlands', currency: 'EUR' },
  IT: { city: 'Rome', country: 'Italy', currency: 'EUR' },
  AU: { city: 'Sydney', country: 'Australia', currency: 'USD' },
  CA: { city: 'Toronto', country: 'Canada', currency: 'USD' },
  AE: { city: 'Dubai', country: 'UAE', currency: 'USD' },
  SG: { city: 'Singapore', country: 'Singapore', currency: 'USD' },
  NG: { city: 'Lagos', country: 'Nigeria', currency: 'USD' },
  ZA: { city: 'Cape Town', country: 'South Africa', currency: 'USD' },
  KE: { city: 'Nairobi', country: 'Kenya', currency: 'USD' },
}

// Async IP detection — call this on page load, update state when ready
export async function detectLocationByIP(): Promise<LocationData | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const data = await res.json()
    const countryCode = (data.country_code || '').toUpperCase()
    const mapped = IP_COUNTRY_MAP[countryCode]
    if (mapped) {
      return {
        city: data.city || mapped.city,
        country: mapped.country,
        currency: { code: mapped.currency, symbol: CURRENCY_SYMBOLS[mapped.currency] },
      }
    }
    // Unknown country — check if Europe
    if (data.continent_code === 'EU') {
      return {
        city: data.city || 'Berlin',
        country: data.country_name || 'Europe',
        currency: { code: 'EUR', symbol: '€' },
      }
    }
    return null // Fall back to timezone detection
  } catch {
    return null // Network error — fall back to timezone
  }
}

// Helper to format price with currency
export function formatPrice(amount: number, currencyCode: CurrencyCode): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode]
  return `${symbol}${amount}`
}