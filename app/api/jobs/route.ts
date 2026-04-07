import { NextResponse } from 'next/server'
import { MOCK_JOBS } from '@/lib/jobs-data'

// TODO: Replace with Adzuna API when key is available
// Cache for Adzuna results (1hr TTL)
// let jobsCache: { data: any[]; ts: number } | null = null
// const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET() {
  try {
    // When Adzuna key is available, uncomment and use:
    // if (!jobsCache || Date.now() - jobsCache.ts > CACHE_TTL) {
    //   const res = await fetch(`https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=entertainment+film+TV+music&category=media&results_per_page=20`)
    //   const data = await res.json()
    //   jobsCache = { data: data.results || [], ts: Date.now() }
    // }

    return NextResponse.json({ jobs: MOCK_JOBS })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ jobs: MOCK_JOBS })
  }
}
