'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { STREAMS } from '@/lib/data'

interface Project {
  id: string
  title: string
  stream: string
  streamIcon: string
  genre?: string
  location: string
  timeline: string
  description: string
  brief: string
  roles: Array<{
    role: string
    description?: string
    filled: boolean
    member?: { name: string; avatar: string }
  }>
  teamSize: number
  filledRoles: number
  status: string
  createdAt: string
}

export default function ProjectsPage() {
  const [streamFilter, setStreamFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; name: string; skills?: string[]; streams?: string[]; city?: string; is_pro?: boolean } | null>(null)

  // Check user auth
  useEffect(() => {
    try {
      const stored = localStorage.getItem('showbizy_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  // Simple skill match score (same logic as cron)
  const getMatchScore = (project: Project): { score: number; bestRole: string } => {
    if (!user?.skills?.length) return { score: 0, bestRole: '' }
    let bestScore = 0
    let bestRole = ''
    const userCity = (user.city || '').split(',')[0].trim().toLowerCase()
    const cityMatch = userCity && project.location.toLowerCase().includes(userCity) ? 10 : 0
    const streamMatch = user.streams?.includes(project.stream) ? 15 : 0

    for (const role of project.roles.filter(r => !r.filled)) {
      // Simple keyword matching
      let skillOverlap = 0
      const roleWords = role.role.toLowerCase().split(/[\s,/&-]+/).filter(w => w.length > 2)
      for (const userSkill of user.skills) {
        const us = userSkill.toLowerCase()
        if (roleWords.some(rw => us.includes(rw) || rw.includes(us))) skillOverlap++
        if (role.description && role.description.toLowerCase().includes(us)) skillOverlap += 0.5
      }
      const skillScore = Math.min(75, (skillOverlap / Math.max(1, roleWords.length)) * 75)
      const total = Math.round(skillScore + streamMatch + cityMatch)
      if (total > bestScore) { bestScore = total; bestRole = role.role }
    }
    return { score: Math.min(100, bestScore), bestRole }
  }

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/projects')

        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await response.json()
        setProjects(data.projects || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    if (streamFilter !== 'all' && project.stream !== streamFilter) return false
    if (locationFilter !== 'all' && !project.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
    if (roleFilter !== 'all' && !project.roles.some(r => r.role.toLowerCase().includes(roleFilter.toLowerCase()) && !r.filled)) return false
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && !project.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const uniqueLocations = [...new Set(projects.map(p => p.location))]
  const uniqueRoles = [...new Set(projects.flatMap(p => p.roles.filter(r => !r.filled).map(r => r.role)))]

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#030712]/80">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/50 hover:text-white transition">Home</Link>
          <Link href="/dashboard" className="text-white/50 hover:text-white transition">Dashboard</Link>
          <Link href="/projects" className="text-white font-medium">Projects</Link>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 transition font-medium">Jobs</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Projects</h1>
          <p className="text-white/50">AI-generated projects looking for talented creatives like you</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
          >
            <option value="all">All Streams</option>
            {STREAMS.map(s => (
              <option key={s.id} value={s.name}>{s.icon} {s.name}</option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-white/40 mb-6">
          {loading ? 'Loading...' : `${filteredProjects.length} projects found`}
        </p>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-16 bg-white/10 rounded mb-4"></div>
                <div className="h-2 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-xl font-bold mb-2">Failed to load projects</h3>
            <p className="text-white/50 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎬</p>
            <h3 className="text-xl font-bold mb-2">AI is generating projects for your area...</h3>
            <p className="text-white/50 mb-6">Check back in a few minutes for new creative opportunities!</p>
            <button 
              onClick={async () => {
                try {
                  await fetch('/api/cron/generate-projects', { method: 'POST' })
                  window.location.reload()
                } catch {
                  alert('Failed to generate projects. Please try again.')
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg transition"
            >
              Generate Projects Now
            </button>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const match = user ? getMatchScore(project) : { score: 0, bestRole: '' }
            // Generate deterministic fake activity from project id
            const hash = project.id.charCodeAt(0) + project.id.charCodeAt(1)
            const applied = 2 + (hash % 6)
            const daysLeft = 1 + (hash % 5)
            const openRoles = project.roles.filter(r => !r.filled)

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`group bg-white/[0.03] border rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 ${
                  match.score >= 50 ? 'border-amber-500/20 hover:border-amber-500/40' : 'border-white/[0.06] hover:border-purple-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{project.streamIcon}</span>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{project.stream}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {daysLeft <= 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        {daysLeft}d left
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'recruiting'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1 group-hover:text-purple-300 transition">{project.title}</h3>
                <p className="text-sm text-white/40 mb-3">{project.genre} • {project.location} • {project.timeline}</p>
                <p className="text-white/50 text-sm mb-4 leading-relaxed line-clamp-2">{project.description}</p>

                {/* Match score banner — visible to all users */}
                {user && match.score > 0 && (
                  <div className={`mb-4 px-3 py-2 rounded-lg border text-xs ${
                    match.score >= 75 ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : match.score >= 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span>
                        {match.score >= 75 ? 'Strong match' : match.score >= 50 ? 'Good match' : 'Possible match'}
                        {match.bestRole && <> — you&apos;d fit as <strong>{match.bestRole}</strong></>}
                      </span>
                      <span className="font-bold">{match.score}%</span>
                    </div>
                    {!user.is_pro && (
                      <p className="text-[10px] mt-1 opacity-70">Upgrade to Pro to apply</p>
                    )}
                  </div>
                )}

                {/* Activity indicators */}
                <div className="flex items-center gap-3 text-[11px] text-white/30 mb-3">
                  <span>{applied} applied</span>
                  <span>•</span>
                  <span>{openRoles.length} spot{openRoles.length !== 1 ? 's' : ''} left</span>
                </div>

                {/* Team progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">Team</span>
                    <span className="text-white/50">{project.filledRoles}/{project.teamSize} joined</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${(project.filledRoles / project.teamSize) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Roles needed */}
                <div className="flex flex-wrap gap-1.5">
                  {openRoles.slice(0, 4).map((r, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${
                      match.bestRole === r.role
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    }`}>
                      {r.role} {match.bestRole === r.role && '← you'}
                    </span>
                  ))}
                  {openRoles.length > 4 && (
                    <span className="text-xs text-white/30">+{openRoles.length - 4} more</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-xl font-bold mb-2">No projects found</h3>
            <p className="text-white/50">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  )
}
