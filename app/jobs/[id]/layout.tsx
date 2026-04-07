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
  // Check mock jobs
  const mock = MOCK_JOBS.find(j => j.id === id)
  if (mock) return mock

  // Check Adzuna
  if (id.startsWith('az-')) {
    const adzunaId = id.replace('az-', '')
    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY
    if (!appId || !appKey) return null

    try {
      const url = `https://api.adzuna.com/v1/api/jobs/gb/${adzunaId}?app_id=${appId}&app_key=${appKey}`
      const res = await fetch(url, { next: { revalidate: 3600 } })
      if (res.ok) {
        const r = await res.json()
        if (r.id) {
          return {
            title: (r.title || '').replace(/<[^>]*>/g, ''),
            company: r.company?.display_name || 'Company',
            location: r.location?.display_name || 'UK',
            salary: formatSalary(r.salary_min, r.salary_max),
            description: (r.description || '').replace(/<[^>]*>/g, '').slice(0, 200),
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
