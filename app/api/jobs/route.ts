import { NextRequest, NextResponse } from 'next/server'
import { MOCK_JOBS, type Job } from '@/lib/jobs-data'

// In-memory cache per country — 30 min TTL
const jobsCacheMap: Record<string, { data: Job[]; ts: number }> = {}
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Better search terms — focused on actual creative roles
const SEARCH_QUERIES = [
  'video editor',
  'music producer',
  'sound engineer',
  'production assistant',
  'creative director',
  'graphic designer media',
  'content creator',
  'broadcast engineer',
  'camera operator',
  'animator',
  'motion graphics',
  'copywriter advertising',
]

// Words that indicate this is NOT a creative role — filter these out
const REJECT_KEYWORDS = [
  'accountant', 'accounting', 'audit', 'tax', 'payroll',
  'solicitor', 'lawyer', 'legal counsel',
  'nurse', 'doctor', 'dentist', 'pharmacy',
  'warehouse', 'forklift', 'delivery driver',
  'cleaner', 'janitor', 'security guard',
]

function isCreativeJob(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return !REJECT_KEYWORDS.some(kw => text.includes(kw))
}

function categorizeJob(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  // TV first — more specific matches
  if (text.includes('television') || text.includes('broadcast') || text.includes('bbc') || text.includes('itv') || text.includes('channel 4') || text.includes('netflix') || text.includes('sky ') || text.includes('tv ')) return 'TV'
  // Music
  if (text.includes('music') || text.includes('audio engineer') || text.includes('podcast') || text.includes('sound') || text.includes('spotify') || text.includes('recording') || text.includes('studio engineer')) return 'Music'
  // Theatre
  if (text.includes('theatre') || text.includes('theater') || text.includes('stage') || text.includes('performing art') || text.includes('west end')) return 'Theatre'
  // Events
  if (text.includes('event') || text.includes('festival') || text.includes('live show') || text.includes('concert') || text.includes('exhibition')) return 'Events'
  // Film — anything with video, camera, cinema, VFX, animation
  if (text.includes('film') || text.includes('cinema') || text.includes('vfx') || text.includes('camera') || text.includes('video') || text.includes('animation') || text.includes('motion graphic')) return 'Film'
  // Creative catch-all
  if (text.includes('creative') || text.includes('design') || text.includes('content') || text.includes('copywriter') || text.includes('photographer')) return 'Film'
  return 'Film'
}

function getJobType(contract: string | undefined): string {
  if (!contract) return 'Full-time'
  const c = contract.toLowerCase()
  if (c.includes('contract') || c.includes('temp')) return 'Contract'
  if (c.includes('part')) return 'Part-time'
  if (c.includes('freelance')) return 'Freelance'
  return 'Full-time'
}

// Adzuna country codes + currency symbols
const COUNTRY_CONFIG: Record<string, { adzuna: string; symbol: string; label: string }> = {
  gb: { adzuna: 'gb', symbol: '£', label: 'UK' },
  us: { adzuna: 'us', symbol: '$', label: 'USA' },
  in: { adzuna: 'in', symbol: '₹', label: 'India' },
  de: { adzuna: 'de', symbol: '€', label: 'Germany' },
  fr: { adzuna: 'fr', symbol: '€', label: 'France' },
  au: { adzuna: 'au', symbol: 'A$', label: 'Australia' },
  ca: { adzuna: 'ca', symbol: 'C$', label: 'Canada' },
}

function formatSalary(min?: number, max?: number, symbol = '£'): string {
  if (!min && !max) return 'Competitive'
  const fmt = (n: number) => n >= 1000 ? `${symbol}${Math.round(n / 1000)}K` : `${symbol}${Math.round(n)}`
  if (min && max && min !== max) return `${fmt(min)}-${fmt(max)}/year`
  if (min) return `${fmt(min)}/year`
  if (max) return `${fmt(max)}/year`
  return 'Competitive'
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const created = new Date(dateStr).getTime()
  const diff = now - created
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1w ago' : `${weeks}w ago`
}

// Shuffle array randomly
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function fetchAdzunaJobs(country = 'gb'): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) return shuffle(MOCK_JOBS)

  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG.gb
  const allJobs: Job[] = []
  const seenIds = new Set<string>()

  // Pick 5 random queries each time for variety
  const queries = shuffle(SEARCH_QUERIES).slice(0, 5)

  for (const query of queries) {
    try {
      // Randomize the page number (1-3) so we get different results each refresh
      const page = Math.floor(Math.random() * 3) + 1
      const url = `https://api.adzuna.com/v1/api/jobs/${config.adzuna}/search/${page}?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&results_per_page=6&sort_by=date`
      const res = await fetch(url)

      if (!res.ok) continue

      const data = await res.json()
      const results = data.results || []

      for (const r of results) {
        if (seenIds.has(r.id?.toString())) continue
        seenIds.add(r.id?.toString())

        const title = (r.title || '').replace(/<[^>]*>/g, '')
        const desc = (r.description || '').replace(/<[^>]*>/g, '')

        // Skip non-creative jobs
        if (!isCreativeJob(title, desc)) continue

        allJobs.push({
          id: `az-${r.id}`,
          title,
          company: r.company?.display_name || 'Company',
          location: r.location?.display_name || 'UK',
          salary: formatSalary(r.salary_min, r.salary_max, config.symbol),
          category: categorizeJob(title, desc),
          type: getJobType(r.contract_type),
          description: desc.slice(0, 500),
          posted: timeAgo(r.created || new Date().toISOString()),
          source: 'Adzuna',
        })
      }

      await new Promise(resolve => setTimeout(resolve, 150))
    } catch (err) {
      console.error(`Adzuna fetch error for "${query}":`, err)
    }
  }

  // Mix in some mock jobs for guaranteed quality content
  const mockSample = shuffle(MOCK_JOBS).slice(0, 4)
  const combined = shuffle([...allJobs, ...mockSample])

  return combined.length > 0 ? combined : shuffle(MOCK_JOBS)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Country detection — frontend sends detected country code
    const country = (searchParams.get('country') || 'gb').toLowerCase()
    const validCountry = COUNTRY_CONFIG[country] ? country : 'gb'

    // Check cache for this country
    const cached = jobsCacheMap[validCountry]
    if (!cached || Date.now() - cached.ts > CACHE_TTL) {
      const jobs = await fetchAdzunaJobs(validCountry)
      jobsCacheMap[validCountry] = { data: jobs, ts: Date.now() }
    }

    let jobs = [...jobsCacheMap[validCountry].data]

    // Apply filters
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const locationLabel = COUNTRY_CONFIG[validCountry]?.label || 'UK'

    if (category && category !== 'All') {
      jobs = jobs.filter(j => j.category === category)
    }
    if (location && location !== `All ${locationLabel}`) {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()))
    }
    if (search) {
      const q = search.toLowerCase()
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ jobs, total: jobs.length, cached: jobsCacheMap[validCountry].ts, country: validCountry })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ jobs: shuffle(MOCK_JOBS), total: MOCK_JOBS.length, cached: 0 })
  }
}
