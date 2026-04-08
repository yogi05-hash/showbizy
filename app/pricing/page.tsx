'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { detectLocation, formatPrice, PRICING, type LocationData } from '@/lib/location'

const FREE_FEATURES = [
  '🎬 Create your creative profile',
  '👀 Browse AI-generated projects',
  '🔍 View industry job listings',
  '💬 Community access',
  '🚫 No credit card required',
]

const PRO_FEATURES = [
  '✨ Everything in Free, plus:',
  '🎯 Apply to AI-generated projects',
  '🤖 AI-powered project matching for your skills',
  '💼 Apply to real industry jobs (BBC, Netflix, etc.)',
  '📄 Upload CV + send cover letters',
  '⭐ Featured portfolio placement',
  '✉️ Direct messaging with project leads',
  '📬 Weekly curated project digest',
  '🚀 Priority support',
]

const STUDIO_FEATURES = [
  '✨ Everything in Pro, plus:',
  '🎬 Post your own creative projects',
  '🤖 AI auto-matches you with the best talent in your city',
  '📋 Application management dashboard',
  '✅ Accept / reject candidates with one click',
  '📊 Track applications by project',
  '🏆 Verified Studio badge on your profile',
  '⭐ Featured placement in browse',
  '🎯 Custom AI brief generation',
]

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  is_pro?: boolean
  plan?: string
  company_name?: string
  verified?: boolean
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<UserData | null>(null)
  const [location, setLocation] = useState<LocationData>({
    city: 'London',
    country: 'UK',
    currency: { code: 'GBP' as const, symbol: '£' }
  })

  useEffect(() => {
    // Detect location
    const detectedLocation = detectLocation()
    setLocation(detectedLocation)
    const stored = localStorage.getItem('showbizy_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        // Re-fetch fresh data to get current is_pro status
        fetch(`/api/user?email=${encodeURIComponent(parsed.email)}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.user) {
              const fresh = { ...parsed, ...data.user }
              localStorage.setItem('showbizy_user', JSON.stringify(fresh))
              setUser(fresh)
            }
          })
          .catch(() => { /* use cached data */ })
      } catch { /* no valid user data */ }
    }
  }, [])

  // Smart pricing logic — show only relevant cards based on user state
  const isPro = user?.plan === 'pro' || user?.is_pro
  const isStudio = user?.plan === 'studio'
  const isCompany = !!user?.company_name // Registered as Studio
  const isCreative = !!user && !user.company_name // Plain creative signup
  const showPro = !user || isCreative || isPro
  const showStudio = !user || isCompany || isStudio
  const visibleCount = 1 + (showPro ? 1 : 0) + (showStudio ? 1 : 0)
  const gridCols = visibleCount === 3 ? 'md:grid-cols-3' : visibleCount === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-1 max-w-md'

  const handleUpgrade = async (plan: 'pro' | 'studio' = 'pro') => {
    setLoading(true)
    setError('')

    try {
      const stored = localStorage.getItem('showbizy_user')

      // Studio flow: must register as Studio first (separate signup with company info + verification)
      if (plan === 'studio') {
        if (!stored) {
          window.location.href = '/signup/studio'
          return
        }
        const u = JSON.parse(stored)
        // Check if user has company info (i.e., already registered as Studio)
        if (!u.company_name) {
          window.location.href = '/signup/studio'
          return
        }
        // Check if Studio is verified
        if (!u.verified) {
          setError('Your Studio account is pending verification. We will email you once approved (usually within 24-48 hours).')
          setLoading(false)
          return
        }
      }

      if (!stored) {
        window.location.href = '/signin'
        return
      }

      const user = JSON.parse(stored)

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          plan,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#030712]/80">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/50 hover:text-white transition">Home</Link>
          <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="/pricing" className="text-white font-medium">Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-white/60 hover:text-white transition">Dashboard</Link>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-lg overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-white/60 hover:text-white transition">Sign in</Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-4">
            {isPro ? (
              <>Your <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Pro</span> membership</>
            ) : isStudio ? (
              <>Your <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Studio</span> membership</>
            ) : isCompany ? (
              <>Upgrade to <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Studio</span></>
            ) : isCreative ? (
              <>Upgrade to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Pro</span></>
            ) : (
              <>Plans for every <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">creative</span></>
            )}
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            {!user ? (
              <>ShowBizy works two ways: <span className="text-white/80">Creatives</span> find work (Free / Pro). <span className="text-white/80">Companies</span> hire talent (Studio).</>
            ) : isPro || isStudio ? (
              <>You&apos;re all set. Manage your subscription anytime.</>
            ) : (
              <>Start free and upgrade when you&apos;re ready to unlock unlimited access.</>
            )}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-lg mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className={`grid ${gridCols} gap-8 mx-auto`}>
          {/* Free */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 flex flex-col">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Free</h3>
            <p className="text-5xl font-bold mb-1">{formatPrice(PRICING[location.currency.code].free, location.currency.code)}</p>
            <p className="text-sm text-white/30 mb-2">Forever free</p>
            <p className="text-xs text-white/50 mb-8 italic">Perfect for exploring what ShowBizy offers</p>
            <ul className="space-y-4 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center border border-white/10 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/5 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          {showPro && (
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
            <div className="bg-[#030712] rounded-2xl p-8 h-full flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold px-4 py-1 rounded-full">
                RECOMMENDED
              </span>
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Pro</h3>
              <p className="text-5xl font-bold mb-1">
                {formatPrice(PRICING[location.currency.code].pro, location.currency.code)}<span className="text-lg text-white/40">/mo</span>
              </p>
              <p className="text-sm text-white/30 mb-2">For freelance creatives looking for work</p>
              <p className="text-xs text-white/50 mb-8 italic">Get matched, apply, and land real projects</p>
              <ul className="space-y-4 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {user?.is_pro ? (
                <div className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 py-3.5 rounded-xl font-semibold text-sm text-center text-purple-300">
                  You&apos;re on Pro ✨
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                      Loading...
                    </span>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </button>
              )}
            </div>
          </div>
          )}

          {/* Studio */}
          {showStudio && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 flex flex-col">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-2">Studio</h3>
            <p className="text-5xl font-bold mb-1">
              {formatPrice(PRICING[location.currency.code].studio, location.currency.code)}<span className="text-lg text-white/40">/mo</span>
            </p>
            <p className="text-sm text-white/30 mb-2">For agencies, brands & production companies</p>
            <p className="text-xs text-white/50 mb-8 italic">Post projects + AI finds the right talent for you</p>
            <ul className="space-y-4 mb-8 flex-1">
              {STUDIO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="text-orange-400 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {isStudio ? (
              <div className="w-full bg-gradient-to-r from-orange-500/20 to-amber-600/20 border border-orange-500/30 py-3.5 rounded-xl font-semibold text-sm text-center text-orange-300">
                You&apos;re on Studio ✨
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('studio')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-black py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Loading...
                  </span>
                ) : (
                  'Upgrade to Studio'
                )}
              </button>
            )}
          </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, cancel anytime from your dashboard. Your Pro features remain active until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit and debit cards through Stripe.',
              },
              {
                q: 'Is there a free trial?',
                a: 'The Free plan lets you explore ShowBizy at no cost. Upgrade to Pro when you\'re ready for unlimited access.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-white/50 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ShowBizy</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 ShowBizy.ai — AI creates the project. You bring the talent.</p>
        </div>
      </footer>
    </div>
  )
}
