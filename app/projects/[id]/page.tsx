'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { MOCK_PROJECTS, MOCK_MESSAGES } from '@/lib/data'
import ProjectChat from '@/app/components/ProjectChat'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = MOCK_PROJECTS.find(p => p.id === id)
  const [activeTab, setActiveTab] = useState<'brief' | 'team' | 'chat' | 'files'>('brief')
  const [joined, setJoined] = useState(false)

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <Link href="/projects" className="text-purple-400 hover:text-purple-300 transition">← Back to projects</Link>
        </div>
      </div>
    )
  }

  const openRoles = project.roles.filter(r => !r.filled)
  const filledRoles = project.roles.filter(r => r.filled)

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
          <Link href="/projects" className="text-white/50 hover:text-white transition">← Projects</Link>
          <Link href="/dashboard" className="text-white/50 hover:text-white transition">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{project.streamIcon}</span>
              <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">{project.stream}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                project.status === 'recruiting'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <p className="text-white/50">{project.genre} • {project.location} • {project.timeline}</p>
          </div>
          <button
            onClick={() => setJoined(!joined)}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition shrink-0 ${
              joined
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/25'
            }`}
          >
            {joined ? '✓ Joined' : 'Join this project →'}
          </button>
        </div>

        {/* Milestones */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-sm text-white/50 uppercase tracking-wider mb-4">Project Timeline</h3>
          <div className="flex items-center gap-0">
            {project.milestones.map((m, i) => (
              <div key={i} className="flex-1 relative">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full z-10 shrink-0 ${
                    m.status === 'completed' ? 'bg-green-400' :
                    m.status === 'active' ? 'bg-purple-400 ring-4 ring-purple-400/20' :
                    'bg-white/20'
                  }`} />
                  {i < project.milestones.length - 1 && (
                    <div className={`flex-1 h-0.5 ${
                      m.status === 'completed' ? 'bg-green-400/50' : 'bg-white/10'
                    }`} />
                  )}
                </div>
                <div className="mt-2">
                  <p className={`text-sm font-medium ${m.status === 'active' ? 'text-purple-400' : m.status === 'completed' ? 'text-green-400' : 'text-white/40'}`}>
                    {m.name}
                  </p>
                  <p className="text-xs text-white/30">{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
          {(['brief', 'team', 'chat', 'files'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab === 'brief' && '📋 '}
              {tab === 'team' && '👥 '}
              {tab === 'chat' && '💬 '}
              {tab === 'files' && '📁 '}
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Brief Tab */}
            {activeTab === 'brief' && (
              <div className="space-y-6">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Project Brief</h2>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/70 leading-relaxed whitespace-pre-line text-base">{project.brief}</p>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
                  <h3 className="text-lg font-bold mb-4">About this project</h3>
                  <p className="text-white/60 leading-relaxed">{project.description}</p>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Filled roles */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    Team Members
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">{filledRoles.length} joined</span>
                  </h3>
                  <div className="space-y-3">
                    {filledRoles.map((role, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-lg">
                          {role.member?.avatar}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{role.member?.name}</p>
                          <p className="text-xs text-purple-400">{role.role}</p>
                        </div>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Confirmed</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open roles */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    Roles Needed
                    <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">{openRoles.length} open</span>
                  </h3>
                  <div className="space-y-3">
                    {openRoles.map((role, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg text-white/30">?</span>
                          <div>
                            <p className="font-medium text-sm">{role.role}</p>
                            <p className="text-xs text-white/40">Open position</p>
                          </div>
                        </div>
                        <button className="text-xs bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/20 hover:bg-purple-600/30 transition">
                          Apply →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl h-[600px] overflow-hidden">
                <ProjectChat
                  messages={MOCK_MESSAGES}
                  projectTitle={project.title}
                  brief={project.description}
                />
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">Project Files</h3>
                  <button className="text-xs bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/20 hover:bg-purple-600/30 transition">
                    📤 Upload file
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Project Brief v2.pdf', size: '245 KB', type: '📋', uploaded: 'Alex Chen', date: 'Mar 16' },
                    { name: 'Shot List.xlsx', size: '34 KB', type: '📊', uploaded: 'Alex Chen', date: 'Mar 17' },
                    { name: 'Mood Board.zip', size: '12.4 MB', type: '🎨', uploaded: 'Sana Mirza', date: 'Mar 17' },
                    { name: 'Location Photos/', size: '8 files', type: '📁', uploaded: 'Jamie Park', date: 'Mar 18' },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition cursor-pointer">
                      <span className="text-2xl">{file.type}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-white/40">{file.size} • Uploaded by {file.uploaded} • {file.date}</p>
                      </div>
                      <button className="text-xs text-white/40 hover:text-white transition">⬇</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-bold mb-4">Project Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Stream</span>
                  <span>{project.streamIcon} {project.stream}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Genre</span>
                  <span>{project.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Location</span>
                  <span>{project.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Timeline</span>
                  <span>{project.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Created</span>
                  <span>{project.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Team Overview */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-bold mb-3">Team Status</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(project.filledRoles / project.teamSize) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white/60">{project.filledRoles}/{project.teamSize}</span>
              </div>

              {/* Avatars */}
              <div className="flex -space-x-2 mb-3">
                {filledRoles.map((r, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm border-2 border-[#030712]">
                    {r.member?.avatar}
                  </span>
                ))}
                {openRoles.map((_, i) => (
                  <span key={`open-${i}`} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/30 border-2 border-[#030712]">
                    ?
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/40">{openRoles.length} roles still open</p>
            </div>

            {/* Share */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-bold mb-3">Share Project</h3>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 transition py-2.5 rounded-xl text-sm">📋 Copy link</button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 transition py-2.5 rounded-xl text-sm">🐦 Tweet</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
