'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const COMPANY_TYPES = [
  'Production Company',
  'Creative Agency',
  'Brand / Marketing Team',
  'Record Label',
  'Theatre Company',
  'Publisher',
  'Casting Agency',
  'Festival / Event Organizer',
  'Other',
]

const COMPANY_SIZES = ['1-5', '6-20', '21-50', '51-200', '200+']

const STREAMS = [
  'Film & Video',
  'Music',
  'Fashion & Modelling',
  'Influencer & Content',
  'Performing Arts',
  'Visual Arts',
  'Events & Live',
  'Brands & Businesses',
]

const STEPS = ['Account', 'Company', 'Profile']

export default function StudioSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ autoVerified: boolean; trustScore: number } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [data, setData] = useState({
    // Step 1: Account
    name: '',
    email: '',
    password: '',
    contact_role: '',
    // Step 2: Company
    company_name: '',
    company_type: '',
    company_website: '',
    company_address: '',
    company_postcode: '',
    company_country: 'United Kingdom',
    company_size: '',
    years_in_business: '',
    streams: [] as string[],
    // Step 3: Profile
    company_bio: '',
    contact_phone: '',
  })

  const toggleStream = (stream: string) => {
    setData(d => ({
      ...d,
      streams: d.streams.includes(stream) ? d.streams.filter(s => s !== stream) : [...d.streams, stream]
    }))
  }

  const canContinue = () => {
    if (step === 1) return data.name && data.email && data.password.length >= 6 && data.contact_role
    if (step === 2) return data.company_name && data.company_type && data.company_website && data.company_address && data.company_size && data.streams.length > 0
    return true
  }

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/signup/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          years_in_business: data.years_in_business ? parseInt(data.years_in_business) : null,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setSuccess({ autoVerified: result.autoVerified, trustScore: result.trustScore })
        // Save user to localStorage so they're logged in
        if (result.user) {
          localStorage.setItem('showbizy_user', JSON.stringify(result.user))
        }
      } else {
        setError(result.error || 'Failed to create Studio account')
      }
    } catch {
      setError('Something went wrong')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
          </Link>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-6">{success.autoVerified ? '🎉' : '⏳'}</div>
          <h1 className="text-4xl font-bold mb-4">
            {success.autoVerified ? 'Studio Approved!' : 'Application Received'}
          </h1>
          <p className="text-white/60 mb-3 text-lg">
            {success.autoVerified
              ? `Welcome to ShowBizy, ${data.company_name}. Your Studio is verified and ready to go.`
              : `Thanks ${data.company_name}, our team will review your application within 24-48 hours.`
            }
          </p>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-6 py-3 inline-block mb-8">
            <p className="text-xs text-white/40">Trust Score</p>
            <p className="text-2xl font-bold text-amber-400">{success.trustScore}/100</p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            {success.autoVerified ? (
              <>
                <Link href="/pricing" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 rounded-xl font-bold">
                  Upgrade to Studio (£29/mo) →
                </Link>
                <Link href="/dashboard" className="bg-white/[0.05] border border-white/[0.1] px-8 py-4 rounded-xl font-medium">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 rounded-xl font-bold">
                  Go to Dashboard →
                </Link>
                <Link href="/" className="bg-white/[0.05] border border-white/[0.1] px-8 py-4 rounded-xl font-medium">
                  Back to Home
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <Link href="/signup" className="text-sm text-white/40 hover:text-white transition">I'm a creative →</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Studio Signup</span>
            <h1 className="text-4xl font-bold mt-2 mb-3">Register Your Studio</h1>
            <p className="text-white/50">For agencies, brands, and production companies. We verify all Studios to maintain quality.</p>
          </div>

          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                  <div className={`flex items-center gap-3 flex-1`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition ${
                      step > i + 1 ? 'bg-amber-500 text-black' : step === i + 1 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black' : 'bg-white/5 border border-white/10 text-white/40'
                    }`}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm hidden sm:block ${step >= i + 1 ? 'text-white font-medium' : 'text-white/30'}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-3 ${step > i + 1 ? 'bg-amber-500' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold mb-4">Your Account</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Your Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={e => setData({ ...data, name: e.target.value })}
                      placeholder="Sarah Mitchell"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Your Role <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={data.contact_role}
                      onChange={e => setData({ ...data, contact_role: e.target.value })}
                      placeholder="Head of Production"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Work Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    placeholder="sarah@vertigoproductions.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <p className="text-xs text-white/30 mt-1">Custom domain emails get faster verification</p>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={e => setData({ ...data, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold mb-4">Company Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Company Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={data.company_name}
                      onChange={e => setData({ ...data, company_name: e.target.value })}
                      placeholder="Vertigo Productions"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Company Type <span className="text-red-400">*</span></label>
                    <select
                      value={data.company_type}
                      onChange={e => setData({ ...data, company_type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition"
                    >
                      <option value="" className="bg-[#0d0d1a]">Select type</option>
                      {COMPANY_TYPES.map(t => <option key={t} value={t} className="bg-[#0d0d1a]">{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Website <span className="text-red-400">*</span></label>
                  <input
                    type="url"
                    value={data.company_website}
                    onChange={e => setData({ ...data, company_website: e.target.value })}
                    placeholder="https://vertigoproductions.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Address <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={data.company_address}
                    onChange={e => setData({ ...data, company_address: e.target.value })}
                    placeholder="123 Old Street, Shoreditch, London"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Postcode</label>
                    <input
                      type="text"
                      value={data.company_postcode}
                      onChange={e => setData({ ...data, company_postcode: e.target.value })}
                      placeholder="EC1V 9HX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Company Size <span className="text-red-400">*</span></label>
                    <select
                      value={data.company_size}
                      onChange={e => setData({ ...data, company_size: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition"
                    >
                      <option value="" className="bg-[#0d0d1a]">Select size</option>
                      {COMPANY_SIZES.map(s => <option key={s} value={s} className="bg-[#0d0d1a]">{s} employees</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Years in Business</label>
                    <input
                      type="number"
                      value={data.years_in_business}
                      onChange={e => setData({ ...data, years_in_business: e.target.value })}
                      placeholder="5"
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Industries you produce in <span className="text-red-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {STREAMS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleStream(s)}
                        className={`px-4 py-2 rounded-lg text-sm border transition ${
                          data.streams.includes(s)
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold mb-4">Tell Us More</h2>
                <div>
                  <label className="block text-sm text-white/60 mb-2">About Your Company</label>
                  <textarea
                    value={data.company_bio}
                    onChange={e => setData({ ...data, company_bio: e.target.value.slice(0, 300) })}
                    placeholder="Brief description of what your company does, recent projects, awards..."
                    rows={4}
                    maxLength={300}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none transition"
                  />
                  <p className="text-xs text-white/30 mt-1">{data.company_bio.length}/300 characters</p>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Contact Phone (optional)</label>
                  <input
                    type="tel"
                    value={data.contact_phone}
                    onChange={e => setData({ ...data, contact_phone: e.target.value })}
                    placeholder="+44 20 1234 5678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-white/70">
                  <p className="font-semibold text-amber-400 mb-1">📋 What happens next?</p>
                  <ol className="space-y-1 list-decimal list-inside ml-1">
                    <li>We&apos;ll review your application (auto-approved if trust score is high)</li>
                    <li>You&apos;ll receive an email with your verification status</li>
                    <li>Once verified, you can upgrade to Studio (£29/mo) and post projects</li>
                    <li>Our AI will match you with the best talent in your city</li>
                  </ol>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="text-white/50 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              >
                ← Back
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canContinue()}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed transition hover:opacity-90"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-xl font-bold disabled:opacity-40 transition hover:opacity-90"
                >
                  {submitting ? 'Submitting...' : '🎬 Create Studio Account'}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-white/30 mt-6">
            Already have an account? <Link href="/signin" className="text-amber-400 hover:text-amber-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
