'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { type Job } from '@/lib/jobs-data'

export default function SharedJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name: string; email: string; is_pro: boolean } | null>(null)
  const [showApply, setShowApply] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    // Check user
    const stored = localStorage.getItem('showbizy_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }

    // Fetch this specific job by ID
    fetch(`/api/jobs/${jobId}`)
      .then(r => r.json())
      .then(d => {
        setJob(d.job || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [jobId])

  const isPro = user?.is_pro === true

  const handleApply = async () => {
    if (!user || !job) return
    setApplyError('')
    if (!coverNote.trim() || coverNote.trim().length < 50) {
      setApplyError('Cover letter is required (minimum 50 characters).')
      return
    }
    if (!resumeFile) {
      setApplyError('Please upload your resume/CV (PDF or DOC).')
      return
    }
    setApplying(true)
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, job_id: job.id, job_title: job.title,
          company: job.company, location: job.location, cover_note: coverNote,
        }),
      })
      if (res.ok) setApplied(true)
      else {
        const data = await res.json()
        setApplyError(data.error || 'Failed to apply.')
      }
    } catch { setApplyError('Something went wrong.') }
    setApplying(false)
  }

  const categoryColors: Record<string, string> = {
    Film: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    TV: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    Music: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
    Theatre: 'bg-green-400/20 text-green-300 border-green-400/30',
    Events: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Job not found</h1>
          <p className="text-white/50 mb-6">This job may have expired or been removed.</p>
          <Link href="/jobs" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold text-sm">Browse All Jobs</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ShowBizy" style={{ height: 44, width: 'auto' }} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/jobs" className="text-white/50 hover:text-white transition">← All Jobs</Link>
            {!user && (
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg font-semibold text-sm">Sign Up Free</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* Job Header */}
        <span className={`inline-block text-xs border px-2.5 py-1 rounded-full font-medium mb-4 ${categoryColors[job.category] || 'bg-white/10 text-white/50 border-white/10'}`}>
          {job.category}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{job.title}</h1>
        <p className="text-lg text-purple-400 font-medium mb-6">{job.company}</p>

        <div className="flex flex-wrap gap-5 text-sm text-white/50 mb-8">
          <span>📍 {job.location}</span>
          <span>💰 {job.salary}</span>
          <span>💼 {job.type}</span>
          <span>🕐 {job.posted}</span>
        </div>

        {/* Share row */}
        <div className="flex gap-3 mb-8 pb-8 border-b border-white/[0.06]">
          <button
            onClick={() => {
              const url = window.location.href
              if (navigator.share) {
                navigator.share({ title: `${job.title} at ${job.company}`, text: `Check out this role on ShowBizy`, url })
              } else {
                navigator.clipboard.writeText(url)
                alert('Link copied!')
              }
            }}
            className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/[0.08] transition"
          >
            📤 Share
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${job.title} at ${job.company} — apply on ShowBizy`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/[0.08] transition"
          >
            𝕏 Post
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/[0.08] transition"
          >
            in Share
          </a>
        </div>

        {/* Job Description */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">About this role</h2>
          <p className="text-white/50 leading-relaxed">{job.description}</p>
        </div>

        <div className="flex gap-3 text-xs text-white/25 mb-10">
          <span>{job.type}</span><span>•</span>
          <span>Posted {job.posted}</span><span>•</span>
          <span>via {job.source}</span>
        </div>

        {/* Apply Section — depends on user state */}
        {!user ? (
          /* Not logged in */
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Want to apply?</h3>
            <p className="text-white/50 text-sm mb-6">Create a free ShowBizy account and upgrade to Pro to apply to industry jobs.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold text-sm">Sign Up Free</Link>
              <Link href="/signin" className="bg-white/[0.05] border border-white/[0.1] px-6 py-3 rounded-xl font-semibold text-sm">Sign In</Link>
            </div>
          </div>
        ) : !isPro ? (
          /* Logged in but not Pro */
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-8 text-center">
            <span className="text-3xl block mb-3">⚡</span>
            <h3 className="text-xl font-bold mb-2">Upgrade to Pro to Apply</h3>
            <p className="text-white/50 text-sm mb-6">Pro members can apply to industry jobs with their ShowBizy profile, cover letter, and resume.</p>
            <Link href="/pricing" className="bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 rounded-xl font-bold text-black text-sm">
              Upgrade to Pro →
            </Link>
          </div>
        ) : applied ? (
          /* Applied successfully */
          <div className="bg-green-400/10 border border-green-400/20 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-3">🎬</span>
            <h3 className="text-xl font-bold mb-2">Application Sent!</h3>
            <p className="text-white/50 text-sm mb-4">Your profile has been submitted for {job.title} at {job.company}.</p>
            <Link href="/dashboard" className="text-purple-400 text-sm font-medium">Track in Dashboard →</Link>
          </div>
        ) : !showApply ? (
          /* Pro user — show apply button */
          <button
            onClick={() => setShowApply(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Apply with Your ShowBizy Profile
          </button>
        ) : (
          /* Apply form */
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-1">Apply to {job.title}</h3>
            <p className="text-white/40 text-sm mb-5">at {job.company}</p>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-5">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Your Profile</h4>
              <p className="text-sm"><span className="text-white/40">Name:</span> <span className="text-white/80">{user.name}</span></p>
              <p className="text-sm"><span className="text-white/40">Email:</span> <span className="text-white/80">{user.email}</span></p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/60 mb-2">Cover Letter <span className="text-red-400">*</span></label>
              <textarea value={coverNote} onChange={e => setCoverNote(e.target.value)} placeholder="Why are you the right fit? (min 50 characters)" rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 resize-none transition" />
              <span className={`text-[10px] ${coverNote.trim().length >= 50 ? 'text-green-400' : 'text-white/20'}`}>
                {coverNote.trim().length}/50 min
              </span>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-white/60 mb-2">Resume / CV <span className="text-red-400">*</span></label>
              {resumeFile ? (
                <div className="flex items-center justify-between bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                  <span className="text-sm text-green-300 truncate">📄 {resumeFile.name}</span>
                  <button onClick={() => setResumeFile(null)} className="text-white/30 text-xs">Remove</button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/[0.08] rounded-xl px-4 py-4 text-center hover:border-purple-500/30 transition">
                    <span className="text-white/30 text-sm">📎 Upload PDF or DOC (max 5MB)</span>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && f.size <= 5 * 1024 * 1024) { setResumeFile(f); setApplyError('') }
                    else if (f) setApplyError('File too large. Max 5MB.')
                  }} />
                </label>
              )}
            </div>

            {applyError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400">{applyError}</div>}

            <div className="flex gap-3">
              <button onClick={() => { setShowApply(false); setApplyError('') }} className="flex-1 bg-white/[0.05] border border-white/[0.08] py-3 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}

        {/* ShowBizy promo for non-users */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-white/30 text-xs mb-2">Powered by</p>
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="ShowBizy" style={{ height: 36, width: 'auto' }} />
          </Link>
          <p className="text-white/20 text-xs mt-2">AI creates the project. You bring the talent.</p>
        </div>
      </div>
    </div>
  )
}
