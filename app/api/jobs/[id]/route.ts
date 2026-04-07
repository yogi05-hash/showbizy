import { NextRequest, NextResponse } from 'next/server'
import { MOCK_JOBS } from '@/lib/jobs-data'

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
  return weeks === 1 ? '1w ago' : `${weeks}w ago`
}

function categorizeJob(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('television') || text.includes('broadcast') || text.includes('bbc') || text.includes('itv') || text.includes('channel 4') || text.includes('netflix') || text.includes('sky ') || text.includes('tv ')) return 'TV'
  if (text.includes('music') || text.includes('audio engineer') || text.includes('podcast') || text.includes('sound') || text.includes('spotify') || text.includes('recording')) return 'Music'
  if (text.includes('theatre') || text.includes('theater') || text.includes('stage') || text.includes('performing art')) return 'Theatre'
  if (text.includes('event') || text.includes('festival') || text.includes('live show') || text.includes('concert')) return 'Events'
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check mock jobs first
    const mockJob = MOCK_JOBS.find(j => j.id === id)
    if (mockJob) {
      return NextResponse.json({ job: mockJob })
    }

    // If it's an Adzuna job (starts with "az-"), fetch from Adzuna API directly
    if (id.startsWith('az-')) {
      const adzunaId = id.replace('az-', '')
      const appId = process.env.ADZUNA_APP_ID
      const appKey = process.env.ADZUNA_APP_KEY

      if (!appId || !appKey) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      // Adzuna doesn't have a single-job endpoint, so search by ID
      // Use the job ID in a search to find it
      const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}&what_and=${adzunaId}&results_per_page=5`
      const res = await fetch(url)

      if (!res.ok) {
        // Fallback: try fetching recent results and searching
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      const data = await res.json()
      const result = data.results?.find((r: any) => r.id?.toString() === adzunaId)

      if (!result) {
        // Try a broader search
        const url2 = `https://api.adzuna.com/v1/api/jobs/gb/${adzunaId}?app_id=${appId}&app_key=${appKey}`
        try {
          const res2 = await fetch(url2)
          if (res2.ok) {
            const r = await res2.json()
            if (r.id) {
              const title = (r.title || '').replace(/<[^>]*>/g, '')
              const desc = (r.description || '').replace(/<[^>]*>/g, '')
              return NextResponse.json({
                job: {
                  id: `az-${r.id}`,
                  title,
                  company: r.company?.display_name || 'Company',
                  location: r.location?.display_name || 'UK',
                  salary: formatSalary(r.salary_min, r.salary_max),
                  category: categorizeJob(title, desc),
                  type: getJobType(r.contract_type),
                  description: desc.slice(0, 500),
                  posted: timeAgo(r.created || new Date().toISOString()),
                  source: 'Adzuna',
                }
              })
            }
          }
        } catch {}

        return NextResponse.json({ error: 'Job not found or may have expired' }, { status: 404 })
      }

      const title = (result.title || '').replace(/<[^>]*>/g, '')
      const desc = (result.description || '').replace(/<[^>]*>/g, '')

      return NextResponse.json({
        job: {
          id: `az-${result.id}`,
          title,
          company: result.company?.display_name || 'Company',
          location: result.location?.display_name || 'UK',
          salary: formatSalary(result.salary_min, result.salary_max),
          category: categorizeJob(title, desc),
          type: getJobType(result.contract_type),
          description: desc.slice(0, 500),
          posted: timeAgo(result.created || new Date().toISOString()),
          source: 'Adzuna',
        }
      })
    }

    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}
