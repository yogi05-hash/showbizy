'use client'

import Link from 'next/link'
import { useState } from 'react'

const FREE_FEATURES = [
  'Create your profile',
  'Browse projects',
  'Apply to 3 projects/month',
  'Basic matching',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited project applications',
  'Priority matching',
  'Featured profile badge',
  'Direct messaging',
  'Weekly project digest email',
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')

    try {
      // TODO: Replace with real user data from auth
      const stored = localStorage.getItem('showbizy_user')
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
          <Link href="/signin" className="text-white/60 hover:text-white transition">Sign in</Link>
          <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition">
            Get started
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-4">
            Plans for every{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              creative
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free and upgrade when you&apos;re ready to unlock unlimited access.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-lg mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 flex flex-col">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Free</h3>
            <p className="text-5xl font-bold mb-1">£0</p>
            <p className="text-sm text-white/30 mb-8">Forever free</p>
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
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
            <div className="bg-[#030712] rounded-2xl p-8 h-full flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold px-4 py-1 rounded-full">
                RECOMMENDED
              </span>
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Pro</h3>
              <p className="text-5xl font-bold mb-1">
                £19<span className="text-lg text-white/40">/mo</span>
              </p>
              <p className="text-sm text-white/30 mb-8">For serious creatives</p>
              <ul className="space-y-4 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Loading...
                  </span>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            </div>
          </div>
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
