import { NextRequest, NextResponse } from 'next/server'
import { MOCK_JOBS, type Job } from '@/lib/jobs-data'

// In-memory cache (1 hour TTL)
let jobsCache: { data: Job[]; ts: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Search terms to cover entertainment industry
const SEARCH_QUERIES = [
  'film TV entertainment',
  'video editor',
  'music producer',
  'sound designer',
  'cinematographer',
  'production coordinator',
  'creative director',
  'broadcast media',
  'theatre production',
  'VFX artist',
]

function categorizeJob(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('film') || text.includes('cinema') || text.includes('vfx') || text.includes('screenwriter')) return 'Film'
  if (text.includes('tv') || text.includes('television') || text.includes('broadcast') || text.includes('bbc') || text.includes('itv') || text.includes('channel 4') || text.includes('netflix')) return 'TV'
  if (text.includes('music') || text.includes('audio') || text.includes('podcast') || text.includes('sound') || text.includes('spotify')) return 'Music'
  if (text.includes('theatre') || text.includes('theater') || text.includes('stage') || text.includes('performing')) return 'Theatre'
  if (text.includes('event') || text.includes('festival') || text.includes('live') || text.includes('concert')) return 'Events'
  if (text.includes('video') || text.includes('edit') || text.includes('post-production') || text.includes('production')) return 'Film'
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

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Competitive'
  const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}K` : `£${Math.round(n)}`
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
  return `${weeks}w ago`
}

async function fetchAdzunaJobs(): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) return MOCK_JOBS

  const allJobs: Job[] = []
  const seenIds = new Set<string>()

  // Fetch from multiple search queries for variety (use first 4 to stay in rate limit)
  const queries = SEARCH_QUERIES.slice(0, 4)

  for (const query of queries) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&results_per_page=8`
      const res = await fetch(url)

      if (!res.ok) continue

      const data = await res.json()
      const results = data.results || []

      for (const r of results) {
        if (seenIds.has(r.id?.toString())) continue
        seenIds.add(r.id?.toString())

        allJobs.push({
          id: `az-${r.id}`,
          title: (r.title || '').replace(/<[^>]*>/g, ''), // Strip HTML tags
          company: r.company?.display_name || 'Company',
          location: r.location?.display_name || 'UK',
          salary: formatSalary(r.salary_min, r.salary_max),
          category: categorizeJob(r.title || '', r.description || ''),
          type: getJobType(r.contract_type),
          description: (r.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
          posted: timeAgo(r.created || new Date().toISOString()),
          source: 'Adzuna',
        })
      }

      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (err) {
      console.error(`Adzuna fetch error for "${query}":`, err)
    }
  }

  // If we got results, return them. Otherwise fall back to mock
  if (allJobs.length > 0) return allJobs
  return MOCK_JOBS
}

export async function GET(req: NextRequest) {
  try {
    // Check cache
    if (!jobsCache || Date.now() - jobsCache.ts > CACHE_TTL) {
      const jobs = await fetchAdzunaJobs()
      jobsCache = { data: jobs, ts: Date.now() }
    }

    let jobs = [...jobsCache.data]

    // Apply filters from query params
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')

    if (category && category !== 'All') {
      jobs = jobs.filter(j => j.category === category)
    }
    if (location && location !== 'All UK') {
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

    return NextResponse.json({ jobs, total: jobs.length, cached: jobsCache.ts })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ jobs: MOCK_JOBS, total: MOCK_JOBS.length, cached: 0 })
  }
}
