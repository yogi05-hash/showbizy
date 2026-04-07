'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { detectLocation, formatPrice, PRICING } from '@/lib/location'

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  streams: string[]
  skills: string[]
  city: string
  availability: string
  portfolio: string
  created_at: string
  is_pro?: boolean
}

const NOTIFICATIONS = [
  { id: '1', type: 'match', message: 'New project match based on your skills and location', time: '2h ago', unread: true },
  { id: '2', type: 'system', message: 'Our AI is scanning London for projects matching your profile', time: '4h ago', unread: true },
  { id: '3', type: 'update', message: 'Welcome to ShowBizy! Complete your portfolio to get better matches', time: 'Just now', unread: true },
]

const FEED_ITEMS = [
  { id: '1', user: 'ShowBizy AI', avatar: '🤖', content: 'New projects generated in your area this week. Check your matches!', time: '1h ago', type: 'system' },
  { id: '2', user: 'ShowBizy AI', avatar: '🤖', content: 'Tip: Add a portfolio link to your profile to get 3x more project matches.', time: '3h ago', type: 'system' },
]

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <DashboardPage />
    </Suspense>
  )
}

function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  const [matchedProjects, setMatchedProjects] = useState<any[]>([])
  const [activeProjects, setActiveProjects] = useState<any[]>([])
  const [matchesLoading, setMatchesLoading] = useState(false)
  const loc = detectLocation()
  const proPrice = formatPrice(PRICING[loc.currency.code].pro, loc.currency.code)

  useEffect(() => {
    const stored = localStorage.getItem('showbizy_user')
    if (!stored) {
      router.push('/signin')
      return
    }

    let parsed: UserData
    try {
      parsed = JSON.parse(stored)
    } catch {
      router.push('/signin')
      return
    }

    // Show upgrade banner if redirected from Stripe
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeBanner(true)
    }

    // Always re-fetch fresh user data from the database
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user?email=${encodeURIComponent(parsed.email)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            // Merge with any local-only fields (like avatar from OAuth)
            const freshUser = { ...parsed, ...data.user }
            localStorage.setItem('showbizy_user', JSON.stringify(freshUser))
            setUser(freshUser)
          } else {
            setUser(parsed)
          }
        } else {
          // API failed, fall back to localStorage
          setUser(parsed)
        }
      } catch {
        // Network error, fall back to localStorage
        setUser(parsed)
      }
      setLoading(false)
    }

    fetchUser()
  }, [router, searchParams])

  // Fetch user's matches
  useEffect(() => {
    if (!user) return

    const fetchMatches = async () => {
      try {
        setMatchesLoading(true)
        const response = await fetch(`/api/match?user_id=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          const projects = data.matches?.map((match: any) => match.showbizy_projects) || []
          setMatchedProjects(projects.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setMatchesLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const streamEmojis: Record<string, string> = {
    'Film & Video': '🎬', 'Music': '🎵', 'Fashion & Modelling': '📸',
    'Influencer & Content': '📱', 'Performing Arts': '🎭', 'Visual Arts': '🎨',
    'Events & Live': '🎪', 'Brands & Businesses': '💼',
  }

  const userInitial = user.name?.charAt(0)?.toUpperCase() || '?'



  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const handleSignOut = () => {
    localStorage.removeItem('showbizy_user')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 32, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
          <button onClick={handleSignOut} className="text-white/50 hover:text-white transition">Sign out</button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-lg overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold">{userInitial}</span>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upgrade Success Banner */}
        {showUpgradeBanner && (
          <div className="mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-bold text-lg">Welcome to ShowBizy Pro!</h3>
                <p className="text-white/60 text-sm">All Pro features are now unlocked. Time to create something amazing.</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeBanner(false)}
              className="text-white/40 hover:text-white transition text-xl px-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-white/40">Here&apos;s what&apos;s happening with your creative projects</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Matched Projects */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Matched Projects</h2>
                <Link href="/projects" className="text-purple-400 text-sm hover:text-purple-300 transition">View all →</Link>
              </div>
              {matchesLoading ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
                      <div className="h-6 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
                      <div className="h-16 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : matchedProjects.length > 0 ? (
                <div className="grid gap-4">
                  {matchedProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] hover:border-purple-500/30 transition group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-purple-400 transition">{project.title}</h3>
                          <p className="text-white/40 text-sm">{project.stream} • {project.location}</p>
                        </div>
                        <span className="text-2xl">{streamEmojis[project.stream] || '🎬'}</span>
                      </div>
                      <p className="text-white/50 text-sm mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-xs text-white/40">{project.team_size - project.filled_roles} spots left</span>
                        </div>
                        <span className="text-xs text-white/30">{project.timeline}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-white/40 mb-3">No matches yet. Let's generate some projects for your area!</p>
                  <button 
                    onClick={async () => {
                      try {
                        setMatchesLoading(true)
                        await fetch('/api/cron/generate-projects', { method: 'POST' })
                        // Wait a moment then refresh matches
                        setTimeout(() => {
                          window.location.reload()
                        }, 2000)
                      } catch {
                        alert('Failed to generate projects. Please try again.')
                        setMatchesLoading(false)
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    Generate New Projects
                  </button>
                </div>
              )}
            </section>

            {/* Active Projects */}
            <section>
              <h2 className="text-xl font-bold mb-4">Active Projects</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-white/40">No active projects yet.</p>
                <p className="text-white/30 text-sm mt-2">Join a project to see your progress here!</p>
              </div>
            </section>

            {/* Job Applications */}
            <JobApplicationsSection userId={user.id} />

            {/* Feed */}
            <section>
              <h2 className="text-xl font-bold mb-4">Your Feed</h2>
              <div className="space-y-3">
                {FEED_ITEMS.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-2xl">{item.avatar}</span>
                    <div className="flex-1">
                      <p className="text-sm"><span className="font-semibold text-purple-400">{item.user}</span>{' '}<span className="text-white/60">{item.content}</span></p>
                      <p className="text-xs text-white/30 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade to Pro CTA */}
            {!user.is_pro && (
              <Link
                href="/pricing"
                className="block bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                </div>
                <p className="text-white/50 text-sm mb-3">
                  Unlock unlimited applications, priority matching, and more.
                </p>
                <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg text-sm font-semibold group-hover:opacity-90 transition">
                  {proPrice}/month →
                </span>
              </Link>
            )}

            {/* Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-2xl overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{userInitial}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    {user.is_pro && (
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{user.city || 'Location not set'}</p>
                  <Link href="/dashboard" className="text-xs text-purple-400 hover:text-purple-300 transition">
                    Edit profile →
                  </Link>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Streams</span>
                  <span className="text-white">{user.streams?.length || 0}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Skills</span>
                  <span className="text-white">{user.skills?.length || 0}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Member since</span>
                  <span className="text-white">{memberSince}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Availability</span>
                  <span className="text-white capitalize">{user.availability || 'Full-time'}</span>
                </div>
              </div>
              {user.streams && user.streams.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-2">Streams</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.streams.map((s) => (
                      <span key={s} className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-white/40 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((s) => (
                      <span key={s} className="bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                Notifications
                <span className="bg-purple-600 text-xs px-2 py-0.5 rounded-full">{NOTIFICATIONS.filter(n => n.unread).length}</span>
              </h3>
              <div className="space-y-3">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className={`text-sm flex items-start gap-2 ${n.unread ? 'text-white/70' : 'text-white/40'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-purple-400' : 'bg-white/20'}`} />
                    <div>
                      <p className="leading-snug">{n.message}</p>
                      <p className="text-xs text-white/30 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Job Applications Section ─── */
function JobApplicationsSection({ userId }: { userId: string }) {
  const [apps, setApps] = useState<{ id: string; job_id: string; job_title: string; company: string; location: string; status: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/jobs/apply?user_id=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.applications) setApps(d.applications); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) return null
  if (apps.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Applications</h2>
          <Link href="/jobs" className="text-sm text-purple-400 hover:text-purple-300 transition">Browse Jobs →</Link>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <span className="text-3xl block mb-2">💼</span>
          <p className="text-white/40 text-sm mb-3">No job applications yet</p>
          <Link href="/jobs" className="text-purple-400 text-sm font-medium hover:text-purple-300 transition">Browse industry jobs →</Link>
        </div>
      </section>
    )
  }

  const statusStyles: Record<string, string> = {
    applied: 'bg-amber-400/20 text-amber-300',
    viewed: 'bg-blue-400/20 text-blue-300',
    shortlisted: 'bg-green-400/20 text-green-300',
    rejected: 'bg-red-400/20 text-red-300',
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Job Applications</h2>
        <Link href="/jobs" className="text-sm text-purple-400 hover:text-purple-300 transition">Browse Jobs →</Link>
      </div>
      <div className="space-y-3">
        {apps.slice(0, 5).map(app => (
          <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">{app.job_title}</h4>
              <p className="text-xs text-purple-400">{app.company}{app.location ? ` • ${app.location}` : ''}</p>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[app.status] || statusStyles.applied}`}>
              {app.status}
            </span>
          </div>
        ))}
        {apps.length > 5 && (
          <p className="text-xs text-white/30 text-center">+{apps.length - 5} more applications</p>
        )}
      </div>
    </section>
  )
}
