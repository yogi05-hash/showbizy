'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { JOB_CATEGORIES, JOB_LOCATIONS, type Job } from '@/lib/jobs-data'

export default function JobsPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; is_pro: boolean } | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All UK')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApply, setShowApply] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])

  // Fetch jobs from API
  useEffect(() => {
    setJobsLoading(true)
    fetch('/api/jobs')
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

  const handleJobClick = (job: Job) => {
    if (!user) return
    if (!isPro) return
    setSelectedJob(job)
    setShowApply(false)
    setApplied(false)
    setCoverNote('')
  }

  const handleApply = async () => {
    if (!user || !selectedJob) return
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
        }),
      })
      if (res.ok) {
        setApplied(true)
        setAppliedJobs(prev => [...prev, selectedJob.id])
      }
    } catch {}
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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ShowBizy</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
            <Link href="/jobs" className="text-purple-400 font-medium">Jobs</Link>
            {user ? (
              <Link href="/dashboard" className="text-white/50 hover:text-white transition">Dashboard</Link>
            ) : (
              <Link href="/signin" className="text-white/50 hover:text-white transition">Sign In</Link>
            )}
            {!user && (
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg font-semibold text-sm">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">🔥 Industry Jobs</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-3">Real entertainment jobs</h1>
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
              const isLocked = !isPro
              const hasApplied = appliedJobs.includes(job.id)
              const isSelected = selectedJob?.id === job.id

              return (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className={`relative bg-white/[0.03] border rounded-2xl p-5 transition-all duration-300 overflow-hidden ${
                    isSelected ? 'border-purple-500/40' : 'border-white/[0.08] hover:border-white/20'
                  } ${isLocked ? '' : 'cursor-pointer'}`}
                >
                  {/* Lock overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[3px] z-10 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl block mb-2">🔒</span>
                        <p className="text-sm text-white/50">
                          <Link href="/pricing" className="text-purple-400 hover:text-purple-300 font-medium">Upgrade to Pro</Link> to view &amp; apply
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold">{job.title}</h3>
                      <p className="text-sm text-purple-400 font-medium">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasApplied && (
                        <span className="text-xs bg-green-400/20 text-green-300 border border-green-400/30 px-2.5 py-1 rounded-full font-medium">Applied</span>
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

          {/* Detail Panel */}
          {selectedJob && isPro && (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 lg:sticky lg:top-24 self-start">
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

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-5 text-sm text-white/60">
                    Your ShowBizy profile (name, skills, portfolio) will be sent as your application.
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-white/60 mb-2">Cover Note (optional)</label>
                    <textarea
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      placeholder="Tell them why you're perfect for this role..."
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 resize-none transition"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setShowApply(false)} className="flex-1 bg-white/[0.05] border border-white/[0.08] py-3 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition">
                      Cancel
                    </button>
                    <button onClick={handleApply} disabled={applying} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40">
                      {applying ? 'Sending...' : 'Submit Application'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
