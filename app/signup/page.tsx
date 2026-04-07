'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { STREAMS } from '@/lib/data'

const STEPS = ['Account', 'Streams', 'Skills', 'Details']

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: '',
    streams: [] as string[],
    skills: [] as string[],
    city: '',
    availability: 'full-time',
    portfolio: '',
  })

  const handleAvatarFile = useCallback((file: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setAvatarPreview(base64)
      setFormData(prev => ({ ...prev, avatar: base64 }))
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleAvatarFile(file)
  }, [handleAvatarFile])

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
      case 1: return formData.name.trim().length > 0 && formData.email.trim().length > 0 && formData.email.includes('@') && formData.password.length >= 6
      case 2: return formData.streams.length > 0
      case 3: return formData.skills.length > 0
      case 4: return formData.city.trim().length > 0
      default: return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const streamNames = selectedStreams.map(s => s.name)
      
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          streams: streamNames,
          avatar: formData.avatar || undefined,
        }),
      })

      const data = await res.json()

      // Store user data for session persistence
      const userData = {
        id: data.user?.id || '',
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar || '',
        streams: streamNames,
        skills: formData.skills,
        city: formData.city,
        availability: formData.availability,
        portfolio: formData.portfolio,
        created_at: new Date().toISOString(),
      }
      localStorage.setItem('showbizy_user', JSON.stringify(userData))

      const params = new URLSearchParams({
        name: formData.name,
        streams: streamNames.join(','),
        skills: formData.skills.join(','),
      })
      router.push(`/welcome?${params.toString()}`)
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 32, width: 'auto' }} />
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
                  {formData.password.length > 0 && formData.password.length < 6 && (
                    <p className="text-xs text-orange-400 mt-1.5">Password must be at least 6 characters ({6 - formData.password.length} more needed)</p>
                  )}
                  {formData.password.length >= 6 && (
                    <p className="text-xs text-green-400 mt-1.5">✓ Password looks good</p>
                  )}
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Profile photo <span className="text-white/30">(optional)</span></label>
                  <div className="flex items-center gap-5">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`relative w-20 h-20 rounded-full cursor-pointer overflow-hidden group transition-all duration-200 ${
                        dragOver
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#030712]'
                          : 'hover:ring-2 hover:ring-purple-500/50 hover:ring-offset-2 hover:ring-offset-[#030712]'
                      } ${avatarPreview ? '' : 'bg-white/5 border-2 border-dashed border-white/20'}`}
                    >
                      {avatarPreview ? (
                        <>
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-white/30 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-purple-400 hover:text-purple-300 transition font-medium"
                      >
                        {avatarPreview ? 'Change photo' : 'Upload photo'}
                      </button>
                      <p className="text-xs text-white/30 mt-1">JPG, PNG or WebP. Max 5MB.</p>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => { setAvatarPreview(null); setFormData(prev => ({ ...prev, avatar: '' })) }}
                          className="text-xs text-red-400/60 hover:text-red-400 transition mt-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }}
                    />
                  </div>
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
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating your profile...
                  </>
                ) : (
                  'Create account ✨'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
