'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Application {
  id: string
  project_id: string
  project_title: string
  project_stream: string
  user_id: string
  user?: { id: string; name: string; email: string; city?: string; streams?: string[]; skills?: string[]; avatar?: string }
  score: number
  status: string
  created_at: string
}

export default function StudioApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; plan?: string } | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    const stored = localStorage.getItem('showbizy_user')
    if (!stored) {
      router.push('/signin')
      return
    }
    try {
      const u = JSON.parse(stored)
      fetch(`/api/user?email=${u.email}`)
        .then(r => r.json())
        .then(d => {
          if (d.user) {
            if (d.user.plan !== 'studio') {
              router.push('/pricing')
              return
            }
            setUser(d.user)
            // Fetch applications
            fetch(`/api/studio/applications?user_id=${d.user.id}`)
              .then(r => r.json())
              .then(data => {
                setApplications(data.applications || [])
                setLoading(false)
              })
              .catch(() => setLoading(false))
          }
        })
    } catch {
      router.push('/signin')
    }
  }, [router])

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/studio/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, status: newStatus }),
      })
      if (res.ok) {
        setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a))
      }
    } catch {}
  }

  const filtered = applications.filter(a => filter === 'all' || a.status === filter)

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accepted: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <Link href="/dashboard" className="text-sm text-white/50 hover:text-white">← Dashboard</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Studio</span>
            <h1 className="text-4xl font-bold mt-2">Applications</h1>
            <p className="text-white/50 mt-1">Talent matched to your posted projects</p>
          </div>
          <Link href="/studio/post-project" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-5 py-3 rounded-xl font-bold hover:opacity-90 transition">
            + Post Project
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition capitalize ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-white/[0.03] text-white/50 border-white/[0.08] hover:border-white/20'
              }`}
            >
              {f === 'all' ? `All (${applications.length})` : `${f} (${applications.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
            <span className="text-4xl block mb-4">📋</span>
            <h3 className="text-xl font-bold mb-2">No applications yet</h3>
            <p className="text-white/40 mb-6">Post a project and our AI will match talented creatives to you.</p>
            <Link href="/studio/post-project" className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black px-6 py-3 rounded-xl font-bold">
              Post Your First Project →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 transition">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-black flex-shrink-0">
                    {app.user?.avatar ? (
                      <img src={app.user.avatar} alt={app.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      app.user?.name?.[0] || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <h3 className="font-bold">{app.user?.name || 'Unknown'}</h3>
                        <p className="text-sm text-white/40">📍 {app.user?.city || 'Unknown'} • Match score: {Math.round(app.score * 100)}%</p>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColors[app.status] || statusColors.pending}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 mb-2">For: {app.project_title}</p>
                    {app.user?.skills && app.user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.user.skills.slice(0, 6).map(s => (
                          <span key={s} className="text-[10px] bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded text-white/60">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(app.id, 'accepted')}
                        disabled={app.status === 'accepted'}
                        className="text-xs bg-green-500/15 border border-green-500/30 text-green-300 px-3 py-1.5 rounded-lg hover:bg-green-500/25 transition disabled:opacity-30"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'rejected')}
                        disabled={app.status === 'rejected'}
                        className="text-xs bg-red-500/15 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/25 transition disabled:opacity-30"
                      >
                        ✗ Reject
                      </button>
                      <a href={`mailto:${app.user?.email}`} className="text-xs bg-white/[0.05] border border-white/[0.08] text-white/60 px-3 py-1.5 rounded-lg hover:bg-white/[0.08] transition">
                        ✉ Contact
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
