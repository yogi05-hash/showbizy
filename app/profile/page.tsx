'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ALL_STREAMS = ['Film & Video', 'Music', 'Fashion & Modelling', 'Influencer & Content', 'Performing Arts', 'Visual Arts', 'Events & Live', 'Brands & Businesses']

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    city: '',
    availability: 'full-time',
    portfolio: '',
    skills: '' ,
    streams: [] as string[],
  })

  useEffect(() => {
    const stored = localStorage.getItem('showbizy_user')
    if (!stored) { router.push('/signin'); return }
    try {
      const u = JSON.parse(stored)
      setForm({
        name: u.name || '',
        email: u.email || '',
        city: u.city || '',
        availability: u.availability || 'full-time',
        portfolio: u.portfolio || '',
        skills: (u.skills || []).join(', '),
        streams: u.streams || [],
      })
    } catch { router.push('/signin') }
    setLoading(false)
  }, [router])

  const toggleStream = (stream: string) => {
    setForm(prev => ({
      ...prev,
      streams: prev.streams.includes(stream)
        ? prev.streams.filter(s => s !== stream)
        : [...prev.streams, stream],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const stored = localStorage.getItem('showbizy_user')
      if (!stored) return
      const u = JSON.parse(stored)

      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: u.id,
          name: form.name,
          city: form.city,
          availability: form.availability,
          portfolio: form.portfolio,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          streams: form.streams,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const updated = { ...u, ...data.user }
        localStorage.setItem('showbizy_user', JSON.stringify(updated))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Save error:', err)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 44, width: 'auto' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </Link>
        <Link href="/dashboard" className="text-white/50 text-sm hover:text-white transition">← Dashboard</Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
        <p className="text-white/40 text-sm mb-8">Update your details to get better project matches.</p>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-green-400">
            Profile saved successfully
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
            />
            <p className="text-xs text-white/20 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">City / Location</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. London, Mumbai, New York"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Availability</label>
            <select
              value={form.availability}
              onChange={e => setForm({ ...form, availability: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
              <option value="weekends">Weekends only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Portfolio URL</label>
            <input
              type="url"
              value={form.portfolio}
              onChange={e => setForm({ ...form, portfolio: e.target.value })}
              placeholder="https://your-portfolio.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Skills (comma separated)</label>
            <input
              type="text"
              value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })}
              placeholder="e.g. cinematography, editing, lighting, sound design"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
            />
            <p className="text-xs text-white/20 mt-1">Adding more skills improves your AI match score</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Creative Streams</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STREAMS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStream(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    form.streams.includes(s)
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-white/[0.03] text-white/40 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
