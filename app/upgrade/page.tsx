'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { detectLocation, detectLocationByIP, formatPrice, PRICING, type LocationData } from '@/lib/location'

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [user, setUser] = useState<{ id: string; name: string; email: string; city?: string } | null>(null)
  const [location, setLocation] = useState<LocationData>({ city: 'London', country: 'UK', currency: { code: 'GBP' as const, symbol: '£' } })

  useEffect(() => {
    const loc = detectLocation()
    setLocation(loc)
    detectLocationByIP().then(ipLoc => { if (ipLoc) setLocation(ipLoc) })

    const stored = localStorage.getItem('showbizy_user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser(u)
        // Fetch real match count
        fetch(`/api/match?user_id=${u.id}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.matches) setMatchCount(d.matches.length) })
          .catch(() => {})
      } catch {}
    }
  }, [])

  const handleUpgrade = async () => {
    setLoading(true)
    const stored = localStorage.getItem('showbizy_user')
    if (!stored) { window.location.href = '/signin'; return }
    const u = JSON.parse(stored)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, userId: u.id, plan: 'pro', currency: location.currency.code.toLowerCase() }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  const price = formatPrice(PRICING[location.currency.code].pro, location.currency.code)
  const city = user?.city || location.city

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 44, width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </Link>
        <Link href="/dashboard" className="text-white/50 text-sm hover:text-white transition">Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-amber-400 mb-6">
            {matchCount > 0 ? `${matchCount} projects matched to your skills` : 'AI projects waiting for you'}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {matchCount > 0
              ? <>You&apos;ve been matched to<br /><span className="text-amber-400">{matchCount} projects</span> in {city}</>
              : <>Creative projects in<br /><span className="text-amber-400">{city}</span> need your skills</>
            }
          </h1>

          <p className="text-white/40 text-lg max-w-md mx-auto">
            {matchCount > 0
              ? "Our AI found projects that match your skills. Upgrade to Pro to see your match score and apply."
              : "Our AI generates new projects in your area daily. Upgrade to Pro to apply and get priority matching."
            }
          </p>
        </div>

        {/* Locked project preview */}
        <div className="space-y-3 mb-10">
          {[
            { title: 'AI-Generated Film Project', stream: 'Film & Video', location: city },
            { title: 'Music Production Collab', stream: 'Music', location: city },
            { title: 'Content Creator Campaign', stream: 'Influencer & Content', location: city },
          ].map((p, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-white/80">{p.title}</h3>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Matched</span>
                </div>
                <p className="text-white/30 text-xs">{p.stream} — {p.location}</p>
              </div>
              <span className="text-white/20 text-xs bg-white/[0.05] px-3 py-1.5 rounded-lg">Pro required</span>
            </div>
          ))}
          <p className="text-center text-white/20 text-xs">+ more projects generated daily by AI</p>
        </div>

        {/* What you get */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h2 className="font-bold text-lg mb-5">What Pro unlocks</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Apply to AI projects', desc: 'Our AI creates projects in your area daily. Apply directly.' },
              { title: 'Real industry jobs', desc: 'Apply to jobs at BBC, Netflix, and more with CV and cover letter.' },
              { title: 'AI skill matching', desc: 'Get matched based on your actual skills, not just location.' },
              { title: 'Priority matching', desc: 'Pro members get matched first when new projects drop.' },
              { title: 'Featured profile', desc: 'Stand out to studios and project leads browsing talent.' },
              { title: 'Weekly digest', desc: 'Curated projects and jobs delivered to your inbox every week.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">✓</span>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-white/30 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-orange-500 text-black py-4 rounded-xl font-bold text-base hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Upgrade to Pro — ${price}/month`}
          </button>
          <p className="text-white/20 text-xs mt-3">Cancel anytime. No commitment.</p>
        </div>

        {/* Social proof */}
        <div className="mt-16 border-t border-white/[0.06] pt-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">Daily</p>
              <p className="text-white/30 text-xs">New AI projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-white/30 text-xs">Creative streams</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Real</p>
              <p className="text-white/30 text-xs">Industry jobs</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          {[
            { q: 'What happens after I upgrade?', a: 'You instantly get access to all projects, can apply with your profile, and our AI starts priority matching you to new projects.' },
            { q: 'Can I cancel?', a: 'Yes, cancel anytime from your dashboard. No questions asked. Your Pro features stay active until the end of your billing period.' },
            { q: 'What if there are no projects in my area?', a: 'Our AI generates new projects for your city every day. You also get access to real industry jobs from across the UK.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-1">{q}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
