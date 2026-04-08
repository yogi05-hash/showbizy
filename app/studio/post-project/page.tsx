'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STREAMS = [
  'Film & Video', 'Music', 'Fashion & Modelling', 'Influencer & Content',
  'Performing Arts', 'Visual Arts', 'Events & Live', 'Brands & Businesses'
]

const COMMON_ROLES = [
  'Director', 'Cinematographer', 'Editor', 'Sound Designer', 'Music Producer',
  'Screenwriter', 'Producer', 'Production Designer', 'Art Director',
  'Camera Operator', 'Photographer', 'VFX Artist', 'Animator', 'Composer',
]

export default function PostProjectPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; plan?: string; is_pro?: boolean } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ projectId: string; matchesNotified: number } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    stream: '',
    genre: '',
    location: '',
    brief: '',
    mood_style: '',
    timeline: '4 weeks',
    deliverables: [] as string[],
    deliverableInput: '',
  })

  const [roles, setRoles] = useState<{ role: string; description: string; skills_required: string[] }[]>([
    { role: '', description: '', skills_required: [] }
  ])

  useEffect(() => {
    const stored = localStorage.getItem('showbizy_user')
    if (!stored) {
      router.push('/signin')
      return
    }
    try {
      const u = JSON.parse(stored)
      // Verify Studio plan via API
      fetch(`/api/user?email=${u.email}`)
        .then(r => r.json())
        .then(d => {
          if (d.user) {
            setUser(d.user)
            if (d.user.plan !== 'studio') {
              router.push('/pricing')
            }
          }
          setAuthChecked(true)
        })
        .catch(() => setAuthChecked(true))
    } catch {
      router.push('/signin')
    }
  }, [router])

  const addRole = () => {
    setRoles([...roles, { role: '', description: '', skills_required: [] }])
  }

  const removeRole = (idx: number) => {
    setRoles(roles.filter((_, i) => i !== idx))
  }

  const updateRole = (idx: number, field: string, value: string) => {
    const updated = [...roles]
    updated[idx] = { ...updated[idx], [field]: value }
    setRoles(updated)
  }

  const addDeliverable = () => {
    if (formData.deliverableInput.trim()) {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, formData.deliverableInput.trim()],
        deliverableInput: '',
      })
    }
  }

  const removeDeliverable = (idx: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== idx),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.stream || !formData.location || !formData.brief) {
      setError('Please fill in all required fields')
      return
    }

    if (roles.some(r => !r.role.trim())) {
      setError('All roles need a name')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/studio/post-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          ...formData,
          roles,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess({ projectId: data.project.id, matchesNotified: data.matchesNotified || 0 })
      } else {
        setError(data.error || 'Failed to post project')
      }
    } catch {
      setError('Something went wrong')
    }
    setSubmitting(false)
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
          </Link>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-6">🎬</div>
          <h1 className="text-4xl font-bold mb-4">Project Posted!</h1>
          <p className="text-white/60 mb-3 text-lg">
            Your project is now live and visible to creatives.
          </p>
          {success.matchesNotified > 0 && (
            <p className="text-amber-400 mb-8">
              ✨ AI matched {success.matchesNotified} {success.matchesNotified === 1 ? 'creative' : 'creatives'} and notified them via email
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Link href={`/projects/${success.projectId}`} className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-6 py-3 rounded-xl font-bold">
              View Project →
            </Link>
            <Link href="/dashboard" className="bg-white/[0.05] border border-white/[0.1] px-6 py-3 rounded-xl font-medium">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <Link href="/dashboard" className="text-sm text-white/50 hover:text-white">← Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Studio</span>
          <h1 className="text-4xl font-bold mt-3 mb-3">Post a New Project</h1>
          <p className="text-white/50">
            Create a project and our AI will match it with the right creatives in your area.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Project Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Echoes of Brick Lane"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
            />
          </div>

          {/* Stream + Genre */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Stream <span className="text-red-400">*</span></label>
              <select
                value={formData.stream}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/40 transition"
              >
                <option value="" className="bg-[#0d0d1a]">Select stream</option>
                {STREAMS.map(s => <option key={s} value={s} className="bg-[#0d0d1a]">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="e.g. Documentary, Drama, Music Video"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
              />
            </div>
          </div>

          {/* Location + Timeline */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Location <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. London, UK"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Timeline</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="e.g. 4 weeks"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
              />
            </div>
          </div>

          {/* Brief */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Project Brief <span className="text-red-400">*</span></label>
            <textarea
              value={formData.brief}
              onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
              placeholder="Describe what this project is about, the vision, the story..."
              rows={5}
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 resize-none transition"
            />
          </div>

          {/* Mood/Style */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Mood / Visual Style</label>
            <input
              type="text"
              value={formData.mood_style}
              onChange={(e) => setFormData({ ...formData, mood_style: e.target.value })}
              placeholder="e.g. Cinematic, handheld, natural light"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Deliverables</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.deliverableInput}
                onChange={(e) => setFormData({ ...formData, deliverableInput: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable() } }}
                placeholder="e.g. 5-min short film"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
              />
              <button type="button" onClick={addDeliverable} className="bg-amber-500/20 border border-amber-500/30 px-4 py-3 rounded-xl text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition">+ Add</button>
            </div>
            {formData.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.deliverables.map((d, i) => (
                  <span key={i} className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white/80 flex items-center gap-2">
                    {d}
                    <button type="button" onClick={() => removeDeliverable(i)} className="text-white/40 hover:text-white">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Roles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/70">Roles Needed <span className="text-red-400">*</span></label>
              <button type="button" onClick={addRole} className="text-xs text-amber-400 hover:text-amber-300 transition">+ Add Role</button>
            </div>
            <div className="space-y-3">
              {roles.map((r, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-wider">Role {i + 1}</span>
                    {roles.length > 1 && (
                      <button type="button" onClick={() => removeRole(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    )}
                  </div>
                  <input
                    type="text"
                    list={`roles-${i}`}
                    value={r.role}
                    onChange={(e) => updateRole(i, 'role', e.target.value)}
                    placeholder="e.g. Director, Cinematographer"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
                  />
                  <datalist id={`roles-${i}`}>
                    {COMMON_ROLES.map(role => <option key={role} value={role} />)}
                  </datalist>
                  <textarea
                    value={r.description}
                    onChange={(e) => updateRole(i, 'description', e.target.value)}
                    placeholder="What will they do? (optional)"
                    rows={2}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 resize-none transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-4 rounded-xl font-bold text-base hover:opacity-90 transition disabled:opacity-40"
          >
            {submitting ? 'Posting & matching talent...' : '🎬 Post Project & Match Talent'}
          </button>

          <p className="text-xs text-white/30 text-center">
            Once posted, our AI will scan our creative pool and notify the best matches in your area via email.
          </p>
        </form>
      </div>
    </div>
  )
}
