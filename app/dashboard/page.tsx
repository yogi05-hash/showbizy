'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MOCK_PROJECTS } from '@/lib/data'

interface UserData {
  id: string
  name: string
  email: string
  streams: string[]
  skills: string[]
  city: string
  availability: string
  portfolio: string
  created_at: string
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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('showbizy_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        router.push('/signin')
      }
    } else {
      router.push('/signin')
    }
    setLoading(false)
  }, [router])

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

  const userAvatar = streamEmojis[user.streams?.[0]] || '🎬'

  const matchedProjects = MOCK_PROJECTS.filter(p =>
    user.streams?.includes(p.stream) || p.location?.includes(user.city || '')
  ).slice(0, 3)

  const activeProjects = MOCK_PROJECTS.slice(0, 2)

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
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ShowBizy</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <button onClick={handleSignOut} className="text-white/50 hover:text-white transition">Sign out</button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-lg">
            {userAvatar}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
              {matchedProjects.length > 0 ? (
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
                          <span className="text-xs text-white/40">{project.teamSize - project.roles.filter((r: { filled: boolean }) => r.filled).length} spots left</span>
                        </div>
                        <span className="text-xs text-white/30">{project.timeline}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-white/40">No matches yet. Our AI is scanning your area for projects.</p>
                  <p className="text-white/30 text-sm mt-2">First matches usually arrive within 48 hours.</p>
                </div>
              )}
            </section>

            {/* Active Projects */}
            <section>
              <h2 className="text-xl font-bold mb-4">Active Projects</h2>
              <div className="grid gap-4">
                {activeProjects.map((project) => {
                  const milestones = ['Pre-production', 'Production', 'Post-production', 'Published']
                  const currentMilestone = 1
                  return (
                    <Link key={project.id} href={`/projects/${project.id}`} className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">{project.title}</h3>
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">{milestones[currentMilestone]}</span>
                      </div>
                      <div className="flex gap-1">
                        {milestones.map((_, i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentMilestone ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

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
            {/* Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-2xl">
                  {userAvatar}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-white/40 text-sm">{user.city || 'Location not set'}</p>
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
