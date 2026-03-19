'use client'

import Link from 'next/link'
import { MOCK_PROJECTS } from '@/lib/data'

// Simulated user data
const USER = {
  name: 'Alex Chen',
  avatar: '👨‍🎬',
  streams: ['Film & Video', 'Music'],
  skills: ['Director', 'Writer', 'Producer'],
  city: 'London',
  memberSince: 'March 2026',
  projectsCompleted: 3,
  projectsActive: 2,
}

const NOTIFICATIONS = [
  { id: '1', type: 'match', message: 'New project match: "The Last Bookstore" needs a Director in London', time: '2h ago', unread: true },
  { id: '2', type: 'message', message: 'Sana Mirza sent a message in "The Last Bookstore" chat', time: '4h ago', unread: true },
  { id: '3', type: 'update', message: '"Neon Dreams" milestone updated: Pre-production complete', time: '1d ago', unread: false },
  { id: '4', type: 'invite', message: 'You\'ve been invited to join "Concrete Canvas"', time: '2d ago', unread: false },
]

const FEED_ITEMS = [
  { id: '1', user: 'ShowBizy AI', avatar: '🤖', content: '3 new Film & Video projects generated in London this week.', time: '1h ago', type: 'system' },
  { id: '2', user: 'Kai Rivera', avatar: '💃', content: 'Just wrapped production on "Neon Dreams"! Check out the BTS shots 📸', time: '3h ago', type: 'post' },
  { id: '3', user: 'Jamie Park', avatar: '🧑‍💻', content: 'Looking for a Sound Designer for a quick turnaround project in East London. DM me!', time: '5h ago', type: 'post' },
  { id: '4', user: 'ShowBizy AI', avatar: '🤖', content: 'New stream added: Events & Live! Check out immersive event projects near you.', time: '1d ago', type: 'system' },
]

export default function DashboardPage() {
  const matchedProjects = MOCK_PROJECTS.filter(p =>
    USER.streams.includes(p.stream) || p.location.includes(USER.city)
  ).slice(0, 3)

  const activeProjects = MOCK_PROJECTS.slice(0, 2)

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#030712]/80">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/projects" className="text-white/50 hover:text-white transition">Browse Projects</Link>
          <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm cursor-pointer">
              {USER.avatar}
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#030712]" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {USER.name.split(' ')[0]} 👋</h1>
            <p className="text-white/50 mt-1">You have {NOTIFICATIONS.filter(n => n.unread).length} new notifications</p>
          </div>
          <Link href="/projects" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition">
            Browse all projects →
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Matched Projects */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">🎯 Matched for you</h2>
                <Link href="/projects" className="text-sm text-purple-400 hover:text-purple-300 transition">View all →</Link>
              </div>
              <div className="space-y-4">
                {matchedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-purple-500/20 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{project.streamIcon}</span>
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{project.stream}</span>
                          <span className="text-xs text-white/30">•</span>
                          <span className="text-xs text-white/40">{project.location}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{project.title}</h3>
                        <p className="text-sm text-white/50 line-clamp-1 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.roles.filter(r => !r.filled).slice(0, 4).map((r, i) => (
                            <span key={i} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                              {r.role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <div className="text-sm font-bold text-white/60">{project.filledRoles}/{project.teamSize}</div>
                        <div className="text-xs text-white/30">team</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Active Projects */}
            <section>
              <h2 className="text-xl font-bold mb-4">🚀 Your active projects</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="bg-gradient-to-br from-purple-600/5 to-pink-600/5 border border-purple-500/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{project.streamIcon}</span>
                      <span className="text-xs font-bold text-purple-400">{project.stream}</span>
                    </div>
                    <h3 className="font-bold mb-2">{project.title}</h3>
                    {/* Milestone progress */}
                    <div className="space-y-1.5 mb-3">
                      {project.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            m.status === 'completed' ? 'bg-green-400' :
                            m.status === 'active' ? 'bg-purple-400 animate-pulse' :
                            'bg-white/20'
                          }`} />
                          <span className={`text-xs ${m.status === 'active' ? 'text-white/80' : 'text-white/40'}`}>
                            {m.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-white/30">{project.timeline} • {project.location}</div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Stream Feed */}
            <section>
              <h2 className="text-xl font-bold mb-4">📡 Your stream feed</h2>
              <div className="space-y-3">
                {FEED_ITEMS.map((item) => (
                  <div key={item.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex gap-3">
                    <span className="text-2xl shrink-0">{item.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.user}</span>
                        {item.type === 'system' && (
                          <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">AI</span>
                        )}
                        <span className="text-xs text-white/30">{item.time}</span>
                      </div>
                      <p className="text-sm text-white/60">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl">
                  {USER.avatar}
                </span>
                <div>
                  <h3 className="font-bold">{USER.name}</h3>
                  <p className="text-sm text-white/40">{USER.city} • Since {USER.memberSince}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-1">
                  {USER.streams.map(s => (
                    <span key={s} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {USER.skills.map(s => (
                    <span key={s} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-2xl font-bold text-purple-400">{USER.projectsActive}</p>
                  <p className="text-xs text-white/40">Active</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-2xl font-bold text-green-400">{USER.projectsCompleted}</p>
                  <p className="text-xs text-white/40">Completed</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                🔔 Notifications
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  {NOTIFICATIONS.filter(n => n.unread).length} new
                </span>
              </h3>
              <div className="space-y-3">
                {NOTIFICATIONS.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-lg text-sm cursor-pointer transition-colors ${
                    notif.unread ? 'bg-purple-500/5 border border-purple-500/10' : 'hover:bg-white/[0.03]'
                  }`}>
                    <p className={notif.unread ? 'text-white/80' : 'text-white/50'}>{notif.message}</p>
                    <p className="text-xs text-white/30 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-bold mb-4">⚡ Quick actions</h3>
              <div className="space-y-2">
                <Link href="/projects" className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm">
                  🔍 Browse projects
                </Link>
                <button className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm">
                  ✏️ Edit profile
                </button>
                <button className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm">
                  📤 Share portfolio
                </button>
                <button className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm">
                  🎲 Surprise me (random project)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
