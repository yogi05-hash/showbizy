'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Professional {
  id: string
  name: string
  title: string
  company: string
  city: string
  photo_url: string | null
  streams: string[]
  headline: string
}

const STREAMS = ['All', 'Film & Video', 'Music', 'Fashion & Modelling', 'Influencer & Content', 'Performing Arts', 'Visual Arts', 'Events & Live']
const CITIES = ['All', 'London', 'Manchester', 'Los Angeles', 'New York', 'Mumbai', 'Lagos']

export default function CreativesPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState('All')
  const [city, setCity] = useState('All')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<{ id: string; email: string; is_pro?: boolean } | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('showbizy_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}

    const params = new URLSearchParams()
    params.set('limit', '50')
    fetch(`/api/professionals?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.professionals) setProfessionals(d.professionals) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = professionals.filter(p => {
    if (stream !== 'All' && !p.streams?.includes(stream)) return false
    if (city !== 'All' && !p.city?.toLowerCase().includes(city.toLowerCase())) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 44, width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="/creatives" className="text-amber-400 font-medium">Creatives</Link>
          <Link href="/jobs" className="text-white/50 hover:text-white transition">Jobs</Link>
          {user ? (
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-xs font-bold">
              {user.email?.charAt(0)?.toUpperCase() || '?'}
            </Link>
          ) : (
            <Link href="/signup" className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-lg font-semibold text-sm text-black">
              Get started
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Creative Community</span>
          <h1 className="text-4xl font-bold mt-2 mb-3">Industry Professionals</h1>
          <p className="text-white/40 text-lg max-w-xl">{professionals.length}+ creatives from top studios and production companies, matched to projects by AI.</p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, title, or company..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STREAMS.map(s => (
              <button key={s} onClick={() => setStream(s)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                stream === s ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/[0.03] text-white/40 border-white/[0.06]'
              }`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                city === c ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/[0.03] text-white/40 border-white/[0.06]'
              }`}>{c}</button>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-sm mb-6">{filtered.length} professionals</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(pro => (
              <div key={pro.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-amber-500/20 transition group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-xl font-bold mb-3 overflow-hidden">
                    {pro.photo_url ? (
                      <img src={pro.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      pro.name.charAt(0)
                    )}
                  </div>
                  <p className="font-semibold text-sm">{pro.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{pro.title}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{pro.company}</p>
                  <p className="text-white/15 text-[10px] mt-1">{pro.city}</p>
                  {pro.streams?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {pro.streams.slice(0, 2).map(s => (
                        <span key={s} className="text-[9px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                  {(!user || !user.is_pro) && (
                    <p className="text-amber-400/50 text-[10px] mt-3">Pro to connect</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-white/20">No professionals match your filters.</div>
        )}

        {/* CTA */}
        {(!user || !user.is_pro) && (
          <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Connect with {professionals.length}+ industry professionals</h3>
            <p className="text-white/40 text-sm mb-5">Upgrade to Pro to message, collaborate, and join projects with professionals from BBC, Netflix, Universal, and more.</p>
            {user ? (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, userId: user.id, plan: 'pro' }) })
                    const data = await res.json()
                    if (data.url) window.location.href = data.url
                  } catch { window.location.href = '/upgrade' }
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
              >
                Upgrade to Pro →
              </button>
            ) : (
              <Link href="/signup" className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">
                Sign up free →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
