import { Metadata } from 'next'
import { MOCK_JOBS } from '@/lib/jobs-data'

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Competitive'
  const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}K` : `£${Math.round(n)}`
  if (min && max && min !== max) return `${fmt(min)}-${fmt(max)}/year`
  if (min) return `${fmt(min)}/year`
  return 'Competitive'
}

async function fetchJobForMeta(id: string) {
  // Check mock jobs first (instant)
  const mock = MOCK_JOBS.find(j => j.id === id)
  if (mock) {
    return {
      title: mock.title,
      company: mock.company,
      location: mock.location,
      salary: mock.salary,
      description: mock.description.slice(0, 200),
    }
  }

  // For Adzuna jobs, search by ID since direct endpoint doesn't exist
  if (id.startsWith('az-')) {
    const adzunaId = id.replace('az-', '')
    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY
    if (!appId || !appKey) return null

    try {
      // Adzuna: search using the ID as a query — this returns the job
      const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}&what_and=${adzunaId}&results_per_page=10`
      const res = await fetch(url, { next: { revalidate: 3600 } })
      if (res.ok) {
        const data = await res.json()
        const result = data.results?.find((r: { id?: string | number }) => r.id?.toString() === adzunaId) || data.results?.[0]
        if (result && result.id) {
          return {
            title: (result.title || '').replace(/<[^>]*>/g, ''),
            company: result.company?.display_name || 'Company',
            location: result.location?.display_name || 'UK',
            salary: formatSalary(result.salary_min, result.salary_max),
            description: (result.description || '').replace(/<[^>]*>/g, '').slice(0, 200),
          }
        }
      }
    } catch {}
  }
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const job = await fetchJobForMeta(id)

  if (!job) {
    return {
      title: 'Job Not Found — ShowBizy',
      description: 'This job may have expired. Browse all entertainment jobs on ShowBizy.',
    }
  }

  const title = `${job.title} at ${job.company} — ShowBizy`
  const description = `${job.title} at ${job.company} • ${job.location} • ${job.salary}. Apply on ShowBizy — the platform where AI creates creative projects and matches talent.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://showbizy.ai/jobs/${id}`,
      siteName: 'ShowBizy',
      type: 'website',
      images: [{
        url: 'https://showbizy.ai/og-job.png',
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
