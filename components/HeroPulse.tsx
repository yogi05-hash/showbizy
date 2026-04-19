'use client'

import { useEffect, useState } from 'react'

interface PulseData {
  city: string
  creativesActive: number
  projectsThisWeek: number
  jobsToday: number
}

// Thin "pulse strip" rendered in the hero under the Live-in-city badge.
// Fetches /api/pulse on mount with the visitor's detected city; falls back
// to plausible defaults until the response arrives so there's never a
// visible 0. Intentionally compact — hero headline still owns the space.
export default function HeroPulse({ city, country }: { city: string; country?: string }) {
  const [pulse, setPulse] = useState<PulseData | null>(null)

  useEffect(() => {
    if (!city) return
    const url = `/api/pulse?city=${encodeURIComponent(city)}${country ? `&country=${encodeURIComponent(country)}` : ''}`
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then((d: PulseData | null) => { if (d) setPulse(d) })
      .catch(() => {})
  }, [city, country])

  const p = pulse || {
    city,
    creativesActive: 24,
    projectsThisWeek: 6,
    jobsToday: 12,
  }

  return (
    <div className="hero-fade-in flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50 mb-8" style={{ animationDelay: '0.4s' }}>
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span><strong className="text-white/80">{p.creativesActive}</strong> creatives active in {p.city}</span>
      </span>
      <span className="text-white/20">·</span>
      <span>
        <strong className="text-amber-300">{p.projectsThisWeek}</strong> new projects this week
      </span>
      <span className="text-white/20">·</span>
      <span>
        <strong className="text-amber-300">{p.jobsToday}</strong> jobs posted today
      </span>
    </div>
  )
}
