'use client'

import { useEffect, useState } from 'react'

interface Signup {
  displayName: string
  city: string | null
  stream: string | null
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

// Hero social-proof ticker. Fetches /api/signups/recent on mount; the
// endpoint decides (using MIN_RESULTS threshold) whether there's enough
// real activity to show. If the response is empty → this component
// renders nothing, no placeholder, no fallback. Never fake numbers.
export default function RecentSignupsTicker({ city, country }: { city?: string; country?: string }) {
  const [signups, setSignups] = useState<Signup[] | null>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams()
    if (country) params.set('country', country)
    if (city) params.set('city', city)
    fetch(`/api/signups/recent?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { signups?: Signup[] } | null) => {
        if (d?.signups && d.signups.length > 0) setSignups(d.signups)
      })
      .catch(() => {})
  }, [city, country])

  useEffect(() => {
    if (!signups || signups.length <= 1) return
    const id = setInterval(() => {
      setIndex(i => (i + 1) % signups.length)
    }, 4000)
    return () => clearInterval(id)
  }, [signups])

  if (!signups || signups.length === 0) return null

  const current = signups[index]
  const parts: string[] = [current.displayName]
  if (current.stream) parts.push(current.stream)
  if (current.city) parts.push(current.city)
  parts.push(timeAgo(current.createdAt))
  const label = parts.join(' · ')

  return (
    <div className="hero-fade-in flex justify-center mt-8" style={{ animationDelay: '1.2s' }}>
      <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-xs text-white/60">
          <span className="text-white/40">Just joined:</span> <span key={current.createdAt} className="text-white/80 font-medium transition-opacity">{label}</span>
        </span>
      </div>
    </div>
  )
}
