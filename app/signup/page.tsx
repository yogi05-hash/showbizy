'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STREAMS } from '@/lib/data'

const STEPS = ['Account', 'Streams', 'Skills', 'Details']

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    streams: [] as string[],
    skills: [] as string[],
    city: '',
    availability: 'full-time',
    portfolio: '',
  })

  const toggleStream = (id: string) => {
    setFormData(prev => ({
      ...prev,
      streams: prev.streams.includes(id)
        ? prev.streams.filter(s => s !== id)
        : [...prev.streams, id],
      // Clear skills from deselected streams
      skills: prev.streams.includes(id)
        ? prev.skills.filter(skill => {
            const stream = STREAMS.find(s => s.id === id)
            return !(stream?.roles as readonly string[]).includes(skill)
          })
        : prev.skills,
    }))
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const selectedStreams = STREAMS.filter(s => formData.streams.includes(s.id))

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name && formData.email && formData.password.length >= 6
      case 2: return formData.streams.length > 0
      case 3: return formData.skills.length > 0
      case 4: return formData.city.length > 0
      default: return false
    }
  }

  const handleSubmit = () => {
    // In production, this would call an API
    alert('🎉 Welcome to ShowBizy! Your profile has been created.')
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </Link>
        <Link href="/" className="text-sm text-white/40 hover:text-white transition">← Back home</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i + 1 < step ? 'bg-purple-600 text-white' :
                    i + 1 === step ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                    'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:block ${i + 1 === step ? 'text-white font-medium' : 'text-white/30'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-16 h-px mx-2 ${i + 1 < step ? 'bg-purple-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                <p className="text-white/50">Join the creative revolution</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Choose Streams */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Choose your streams</h1>
                <p className="text-white/50">Select the creative areas you work in (choose as many as you like)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {STREAMS.map((stream) => {
                  const selected = formData.streams.includes(stream.id)
                  return (
                    <button
                      key={stream.id}
                      onClick={() => toggleStream(stream.id)}
                      className={`relative text-left p-5 rounded-2xl border transition-all duration-200 ${
                        selected
                          ? 'bg-purple-600/10 border-purple-500/40 ring-1 ring-purple-500/20'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-3 right-3 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs">✓</span>
                      )}
                      <span className="text-3xl mb-2 block">{stream.icon}</span>
                      <h3 className="font-bold mb-1">{stream.name}</h3>
                      <p className="text-xs text-white/40">{stream.roles.length} roles</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Skills within streams */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">What are your skills?</h1>
                <p className="text-white/50">Select your roles within your chosen streams</p>
              </div>

              <div className="space-y-6">
                {selectedStreams.map((stream) => (
                  <div key={stream.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{stream.icon}</span>
                      <h3 className="font-bold text-lg">{stream.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stream.roles.map((role) => {
                        const selected = formData.skills.includes(role)
                        return (
                          <button
                            key={role}
                            onClick={() => toggleSkill(role)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selected
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {selected && '✓ '}{role}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Almost there!</h1>
                <p className="text-white/50">Help us match you with the right projects</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">City / Location</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. London, Manchester, New York"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Availability</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'full-time', label: 'Full-time', desc: '5+ days/week' },
                      { value: 'part-time', label: 'Part-time', desc: '2-4 days/week' },
                      { value: 'weekends', label: 'Weekends', desc: 'Sat & Sun' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, availability: opt.value })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.availability === opt.value
                            ? 'bg-purple-600/10 border-purple-500/40'
                            : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                        }`}
                      >
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-white/40">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Portfolio / Website (optional)</label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://your-portfolio.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-purple-600/5 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="font-bold mb-3 text-purple-400">Your profile summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-white/40">Name:</span> <span className="text-white/80">{formData.name}</span></p>
                  <p><span className="text-white/40">Email:</span> <span className="text-white/80">{formData.email}</span></p>
                  <p><span className="text-white/40">Streams:</span> <span className="text-white/80">{selectedStreams.map(s => s.name).join(', ')}</span></p>
                  <p><span className="text-white/40">Skills:</span> <span className="text-white/80">{formData.skills.join(', ')}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/60 hover:text-white border border-white/10 hover:bg-white/5'
              }`}
            >
              ← Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Create account ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
