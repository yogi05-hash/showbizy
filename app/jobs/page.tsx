'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { JOB_CATEGORIES, JOB_LOCATIONS, type Job } from '@/lib/jobs-data'

export default function JobsPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; is_pro: boolean; skills?: string[]; streams?: string[]; city?: string; portfolio?: string } | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All UK')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApply, setShowApply] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [applyError, setApplyError] = useState('')

  // Detect country from timezone for local jobs
  const detectCountry = (): string => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz.startsWith('America/')) return 'us'
      if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'in'
      if (tz === 'Europe/London') return 'gb'
      if (tz.startsWith('Europe/')) return 'de' // Adzuna supports de for Europe
      if (tz.startsWith('Australia/')) return 'au'
      if (tz.startsWith('Canada/') || tz === 'America/Toronto') return 'ca'
    } catch {}
    return 'gb'
  }

  // Fetch jobs from API — localized by country
  useEffect(() => {
    setJobsLoading(true)
    const country = detectCountry()
    fetch(`/api/jobs?country=${country}`)
      .then(r => r.json())
      .then(d => { if (d.jobs) setJobs(d.jobs); setJobsLoading(false) })
      .catch(() => setJobsLoading(false))
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem('showbizy_user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser(u)
        fetch(`/api/jobs/apply?user_id=${u.id}`)
          .then(r => r.json())
          .then(d => {
            if (d.applications) setAppliedJobs(d.applications.map((a: { job_id: string }) => a.job_id))
          })
          .catch(() => {})
      } catch {}
    }
  }, [])

  const isPro = user?.is_pro === true

  const filtered = jobs.filter(j => {
    if (category !== 'All' && j.category !== category) return false
    if (location !== 'All UK' && !j.location.toLowerCase().includes(location.toLowerCase())) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const handleJobClick = (job: Job) => {
    if (!user || !isPro) {
      setShowUpgradePrompt(true)
      return
    }
    setSelectedJob(job)
    setShowApply(false)
    setApplied(false)
    setCoverNote('')
    setResumeFile(null)
    setApplyError('')
  }

  const handleApply = async () => {
    if (!user || !selectedJob) return
    setApplyError('')

    // Validation
    if (!coverNote.trim() || coverNote.trim().length < 50) {
      setApplyError('Cover letter is required (minimum 50 characters). Tell them why you\'re the right fit.')
      return
    }
    if (!resumeFile) {
      setApplyError('Please upload your resume/CV (PDF or DOC).')
      return
    }
    if (!user.skills?.length && !user.streams?.length) {
      setApplyError('Please complete your profile with skills before applying. Go to your dashboard to update.')
      return
    }

    setApplying(true)
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          job_id: selectedJob.id,
          job_title: selectedJob.title,
          company: selectedJob.company,
          location: selectedJob.location,
          cover_note: coverNote,
          resume_name: resumeFile.name,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setApplied(true)
        setAppliedJobs(prev => [...prev, selectedJob.id])
      } else {
        setApplyError(data.error || 'Failed to submit application.')
      }
    } catch {
      setApplyError('Something went wrong. Please try again.')
    }
    setApplying(false)
  }

  const categoryColors: Record<string, string> = {
    Film: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    TV: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    Music: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
    Theatre: 'bg-green-400/20 text-green-300 border-green-400/30',
    Events: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <img src="/logo.png" alt="ShowBizy" style={{ height: 44, width: 'auto' }} />
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
            <Link href="/jobs" className="text-purple-400 font-medium">Jobs</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-white/50 hover:text-white transition">Dashboard</Link>
                <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-white/50 hover:text-white transition">Sign in</Link>
                <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg font-semibold text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">🔥 Industry Jobs</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-3">Creative industry jobs</h1>
          <p className="text-white/50 text-lg max-w-xl">
            Live opportunities from top studios and production companies.
            {!isPro && ' Upgrade to Pro to view details and apply.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/40 transition"
            />
          </div>
          <div className="flex gap-2">
            {JOB_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                  category === c
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-white/[0.03] text-white/50 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 appearance-none cursor-pointer focus:outline-none"
          >
            {JOB_LOCATIONS.map(l => <option key={l} value={l} className="bg-[#0d0d1a]">{l}</option>)}
          </select>
        </div>

        {/* Jobs Grid */}
        <div className={`grid gap-5 ${selectedJob && isPro ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Job List */}
          <div className="space-y-3">
            {filtered.map(job => {
              const hasApplied = appliedJobs.includes(job.id)
              const isSelected = selectedJob?.id === job.id

              return (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className={`relative bg-white/[0.03] border rounded-2xl p-5 transition-all duration-300 overflow-hidden cursor-pointer ${
                    isSelected ? 'border-purple-500/40' : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold">{job.title}</h3>
                      <p className="text-sm text-purple-400 font-medium">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasApplied && (
                        <span className="text-xs bg-green-400/20 text-green-300 border border-green-400/30 px-2.5 py-1 rounded-full font-medium">Applied</span>
                      )}
                      {!isPro && (
                        <span className="text-xs bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">🔒 Pro</span>
                      )}
                      <span className={`text-xs border px-2.5 py-1 rounded-full font-medium ${categoryColors[job.category] || 'bg-white/10 text-white/50 border-white/10'}`}>
                        {job.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-white/40">
                    <span>📍 {job.location}</span>
                    <span>💰 {job.salary}</span>
                    <span>💼 {job.type}</span>
                    <span>🕐 {job.posted}</span>
                  </div>
                </div>
              )
            })}

            {jobsLoading && (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-white/5 rounded w-1/3 mb-4" />
                    <div className="flex gap-4">
                      <div className="h-3 bg-white/5 rounded w-20" />
                      <div className="h-3 bg-white/5 rounded w-24" />
                      <div className="h-3 bg-white/5 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!jobsLoading && filtered.length === 0 && (
              <div className="text-center py-16 text-white/30">No jobs found matching your filters.</div>
            )}
          </div>

          {/* Detail Panel — full-screen overlay on mobile, sticky sidebar on desktop */}
          {selectedJob && isPro && (
            <div className="fixed inset-0 z-50 bg-[#020617] overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:overflow-visible">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 lg:sticky lg:top-24 self-start m-4 lg:m-0">
                {/* Mobile close/back button */}
                <button
                  onClick={() => { setSelectedJob(null); setShowApply(false); setApplied(false); setApplyError('') }}
                  className="lg:hidden flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-4 -mt-1"
                >
                  ← Back to jobs
                </button>
              {!showApply ? (
                <>
                  <span className={`text-xs border px-2.5 py-1 rounded-full font-medium ${categoryColors[selectedJob.category] || ''}`}>
                    {selectedJob.category}
                  </span>
                  <h2 className="text-2xl font-bold mt-3 mb-1">{selectedJob.title}</h2>
                  <p className="text-purple-400 font-medium mb-5">{selectedJob.company}</p>

                  <div className="flex gap-5 text-sm text-white/50 mb-6">
                    <span>📍 {selectedJob.location}</span>
                    <span>💰 {selectedJob.salary}</span>
                  </div>

                  <div className="border-t border-white/[0.06] pt-5 mb-6">
                    <h4 className="text-sm font-semibold mb-3">About this role</h4>
                    <p className="text-sm text-white/50 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  <div className="flex gap-3 text-xs text-white/30 mb-6">
                    <span>{selectedJob.type}</span>
                    <span>•</span>
                    <span>Posted {selectedJob.posted}</span>
                    <span>•</span>
                    <span>via {selectedJob.source}</span>
                  </div>

                  {/* Share button */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={async () => {
                        const shareUrl = `${window.location.origin}/jobs/${selectedJob.id}`
                        try {
                          if (navigator.share) {
                            await navigator.share({ title: `${selectedJob.title} at ${selectedJob.company}`, url: shareUrl })
                          } else {
                            await navigator.clipboard.writeText(shareUrl)
                            alert('Link copied: ' + shareUrl)
                          }
                        } catch {
                          // Fallback: prompt user to copy
                          prompt('Copy this link:', shareUrl)
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.1] py-2.5 rounded-xl text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition"
                    >
                      📤 Share this job
                    </button>
                    <button
                      onClick={() => {
                        const jobUrl = `https://showbizy.ai/jobs/${selectedJob.id}`
                        const tweetText = `${selectedJob.title} at ${selectedJob.company} 🎬\n\n💰 ${selectedJob.salary}\n📍 ${selectedJob.location}\n\nApply on @showbizy_ai`
                        const url = `https://x.com/intent/post?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(jobUrl)}`
                        window.open(url, 'twitter-share', 'width=600,height=600')
                      }}
                      className="flex items-center justify-center gap-1.5 bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition"
                      title="Share on X"
                    >
                      𝕏
                    </button>
                    <button
                      onClick={() => {
                        const jobUrl = `https://showbizy.ai/jobs/${selectedJob.id}`
                        // LinkedIn share dialog — they pull title/desc from OG tags
                        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`
                        window.open(url, 'linkedin-share', 'width=600,height=600')
                      }}
                      className="flex items-center justify-center gap-1.5 bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition"
                      title="Share on LinkedIn"
                    >
                      in
                    </button>
                    <button
                      onClick={() => {
                        const jobUrl = `https://showbizy.ai/jobs/${selectedJob.id}`
                        const text = `${selectedJob.title} at ${selectedJob.company}\n💰 ${selectedJob.salary}\n📍 ${selectedJob.location}\n\nApply on ShowBizy: ${jobUrl}`
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                      }}
                      className="flex items-center justify-center gap-1.5 bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition"
                      title="Share on WhatsApp"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => {
                        const jobUrl = `https://showbizy.ai/jobs/${selectedJob.id}`
                        const text = `🎬 ${selectedJob.title}\n🏢 ${selectedJob.company}\n💰 ${selectedJob.salary}\n📍 ${selectedJob.location}\n\nApply on ShowBizy 👉 ${jobUrl}`
                        // Open Instagram FIRST (must happen synchronously in click handler)
                        const win = window.open('https://www.instagram.com/', '_blank')
                        // Then copy to clipboard (popup blocker won't fire on this)
                        navigator.clipboard.writeText(text).then(() => {
                          if (win) win.focus()
                          alert('✅ Copied! Paste in Instagram story or DM 📸')
                        }).catch(() => {
                          prompt('Copy this and paste in Instagram:', text)
                        })
                      }}
                      className="flex items-center justify-center gap-1.5 bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition"
                      title="Share on Instagram"
                    >
                      📸
                    </button>
                  </div>

                  {appliedJobs.includes(selectedJob.id) ? (
                    <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4 text-center text-green-300 text-sm font-medium">
                      ✓ You&apos;ve applied to this role
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApply(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition"
                    >
                      Apply with Your ShowBizy Profile
                    </button>
                  )}
                </>
              ) : applied ? (
                <div className="text-center py-6">
                  <span className="text-4xl block mb-3">🎬</span>
                  <h3 className="text-xl font-bold mb-2">Application Sent!</h3>
                  <p className="text-white/50 text-sm mb-5">
                    Your ShowBizy profile has been submitted for <strong className="text-white">{selectedJob.title}</strong> at {selectedJob.company}.
                  </p>
                  <Link href="/dashboard" className="text-purple-400 text-sm font-medium hover:text-purple-300 transition">
                    Track in Dashboard →
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-1">Apply to {selectedJob.title}</h3>
                  <p className="text-white/40 text-sm mb-5">at {selectedJob.company}</p>

                  {/* Your Profile Summary */}
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-5">
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Your Profile</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/40">Name</span>
                        <span className="text-white/80 font-medium">{user?.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Email</span>
                        <span className="text-white/80">{user?.email || 'Not set'}</span>
                      </div>
                      {user?.city && (
                        <div className="flex justify-between">
                          <span className="text-white/40">Location</span>
                          <span className="text-white/80">{user.city}</span>
                        </div>
                      )}
                      {user?.skills && user.skills.length > 0 && (
                        <div>
                          <span className="text-white/40 text-xs">Skills</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.skills.slice(0, 6).map(s => (
                              <span key={s} className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">{s}</span>
                            ))}
                            {user.skills.length > 6 && <span className="text-[10px] text-white/30">+{user.skills.length - 6} more</span>}
                          </div>
                        </div>
                      )}
                      {user?.portfolio && (
                        <div className="flex justify-between">
                          <span className="text-white/40">Portfolio</span>
                          <span className="text-purple-400 text-xs truncate max-w-[200px]">{user.portfolio}</span>
                        </div>
                      )}
                    </div>
                    {(!user?.skills?.length && !user?.streams?.length) && (
                      <p className="text-amber-400 text-xs mt-3">⚠️ Complete your profile with skills for a stronger application. <Link href="/dashboard" className="underline">Update profile</Link></p>
                    )}
                  </div>

                  {/* Cover Letter (required) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/60 mb-2">Cover Letter <span className="text-red-400">*</span></label>
                    <textarea
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      placeholder="Why are you the right fit for this role? What relevant experience do you bring? (minimum 50 characters)"
                      rows={5}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 resize-none transition"
                    />
                    <div className="flex justify-between mt-1">
                      <span className={`text-[10px] ${coverNote.trim().length >= 50 ? 'text-green-400' : 'text-white/20'}`}>
                        {coverNote.trim().length >= 50 ? '✓ Good length' : `${coverNote.trim().length}/50 min characters`}
                      </span>
                    </div>
                  </div>

                  {/* Resume Upload (required) */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-white/60 mb-2">Resume / CV <span className="text-red-400">*</span></label>
                    {resumeFile ? (
                      <div className="flex items-center justify-between bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">📄</span>
                          <span className="text-sm text-green-300 truncate max-w-[200px]">{resumeFile.name}</span>
                          <span className="text-[10px] text-green-400/60">{(resumeFile.size / 1024).toFixed(0)}KB</span>
                        </div>
                        <button onClick={() => setResumeFile(null)} className="text-white/30 hover:text-white/60 text-xs">Remove</button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-white/[0.08] rounded-xl px-4 py-4 text-center hover:border-purple-500/30 transition">
                          <span className="text-white/30 text-sm">📎 Click to upload PDF or DOC</span>
                          <p className="text-[10px] text-white/15 mt-1">Max 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) {
                              if (f.size > 5 * 1024 * 1024) {
                                setApplyError('File too large. Maximum 5MB.')
                                return
                              }
                              setResumeFile(f)
                              setApplyError('')
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Error */}
                  {applyError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400">
                      {applyError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => { setShowApply(false); setApplyError(''); setResumeFile(null) }} className="flex-1 bg-white/[0.05] border border-white/[0.08] py-3 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition">
                      Cancel
                    </button>
                    <button onClick={handleApply} disabled={applying} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40">
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradePrompt(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-[#0d0d1a] border border-white/[0.1] rounded-2xl p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
              <span className="text-4xl block mb-4">⚡</span>
              <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                {!user
                  ? 'Sign up for a free ShowBizy account, then upgrade to Pro to view full job details, apply with your profile, and get matched to opportunities.'
                  : 'Upgrade to Pro to view full job details, apply with your ShowBizy profile, and get matched to the best opportunities in entertainment.'}
              </p>
              <div className="flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link href="/signup" className="w-full bg-gradient-to-r from-amber-400 to-orange-500 py-3 rounded-xl font-bold text-black text-sm hover:opacity-90 transition text-center block">
                      Sign Up Free →
                    </Link>
                    <Link href="/signin" className="w-full bg-white/[0.05] border border-white/[0.1] py-3 rounded-xl font-medium text-sm text-center block hover:bg-white/[0.08] transition">
                      Already have an account? Sign In
                    </Link>
                  </>
                ) : (
                  <Link href="/pricing" className="w-full bg-gradient-to-r from-amber-400 to-orange-500 py-3 rounded-xl font-bold text-black text-sm hover:opacity-90 transition text-center block">
                    View Pro Plans →
                  </Link>
                )}
                <button onClick={() => setShowUpgradePrompt(false)} className="text-white/30 text-xs hover:text-white/50 transition mt-1">
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
