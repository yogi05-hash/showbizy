'use client'

import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import { MOCK_MESSAGES } from '@/lib/data'
import ProjectChat from '@/app/components/ProjectChat'

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
    id?: string
    role: string
    description?: string
    skills_required?: string[]
    filled: boolean
    member?: { id?: string; name: string; avatar: string }
  }>
  teamSize: number
  filledRoles: number
  status: string
  createdAt: string
  milestones?: Array<{
    name: string
    status: string
    date: string
  }>
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'brief' | 'team' | 'chat' | 'files'>('brief')
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${id}`)
        
        if (!response.ok) {
          throw new Error('Project not found')
        }
        
        const data = await response.json()
        setProject(data.project)
        setError(null)
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Failed to load project')
        setProject(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('showbizy_user')
      if (stored) {
        const user = JSON.parse(stored)
        setIsPro(!!user.is_pro)
      }
    } catch {}
  }, [])

  const isPaid = isPro

  const handleJoin = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true)
      return
    }
    if (joined || !project) {
      setJoined(false)
      return
    }
    
    setJoining(true)
    
    try {
      // Get user data from localStorage
      const stored = localStorage.getItem('showbizy_user')
      if (!stored) {
        alert('Please log in first')
        return
      }
      
      const user = JSON.parse(stored)
      const openRole = project.roles.find(r => !r.filled)
      
      if (!openRole?.id) {
        alert('No open roles available')
        return
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          role_id: openRole.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to join project')
        return
      }

      setJoined(true)
      
      // Refresh project data
      const projectResponse = await fetch(`/api/projects/${id}`)
      if (projectResponse.ok) {
        const data = await projectResponse.json()
        setProject(data.project)
      }
    } catch (err) {
      console.error('Failed to join project:', err)
      alert('Failed to join project')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold">Loading project...</h1>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2">{error || 'Project not found'}</h1>
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
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/projects" className="text-white/50 hover:text-white transition">← Projects</Link>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 transition font-medium">Jobs</Link>
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
            onClick={handleJoin}
            disabled={joining}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition shrink-0 ${
              joined
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/25'
            } ${joining ? 'opacity-50 cursor-wait' : ''}`}
          >
            {joining ? 'Joining...' : joined ? '✓ Joined' : 'Join this project →'}
          </button>
        </div>

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
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
                    {project.milestones && i < project.milestones.length - 1 && (
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
        )}

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
                {!isPaid ? (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
                    <span className="text-4xl mb-4 block">🔒</span>
                    <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
                    <p className="text-white/50 mb-4">Upgrade to Pro to view team member profiles and apply to roles.</p>
                    <Link href="/pricing" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition">
                      Upgrade to Pro →
                    </Link>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && !isPaid ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
                <span className="text-4xl mb-4 block">💬</span>
                <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
                <p className="text-white/50 mb-4">Upgrade to Pro to message team members directly.</p>
                <Link href="/pricing" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition">
                  Upgrade to Pro →
                </Link>
              </div>
            ) : activeTab === 'chat' && (
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
            <span className="text-5xl mb-4 block">⚡</span>
            <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
            <p className="text-white/50 mb-6">Join projects, apply to roles, view team profiles, and message creators directly.</p>
            <Link href="/pricing" className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition mb-3">
              See Pro Plans →
            </Link>
            <button onClick={() => setShowUpgradeModal(false)} className="text-white/40 text-sm hover:text-white transition">
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
