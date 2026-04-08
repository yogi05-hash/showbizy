'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'yogibot05@gmail.com'

interface Studio {
  id: string
  name: string
  email: string
  contact_role?: string
  contact_phone?: string
  company_name: string
  company_type: string
  company_website?: string
  company_address?: string
  company_postcode?: string
  company_country?: string
  company_size?: string
  company_bio?: string
  years_in_business?: number
  streams?: string[]
  verified: boolean
  verification_status: string
  verification_notes?: string
  verification_submitted_at?: string
  plan?: string
  is_pro?: boolean
}

export default function AdminVerificationsPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [actionNotes, setActionNotes] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('showbizy_user')
    if (!stored) {
      router.push('/signin')
      return
    }
    try {
      const u = JSON.parse(stored)
      if (u.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }
      setAuthorized(true)
      fetchStudios()
    } catch {
      router.push('/signin')
    }
  }, [router])

  const fetchStudios = async () => {
    try {
      const res = await fetch(`/api/admin/verifications?admin_email=${ADMIN_EMAIL}`)
      const data = await res.json()
      if (data.studios) setStudios(data.studios)
    } catch {}
    setLoading(false)
  }

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: ADMIN_EMAIL,
          user_id: userId,
          action,
          notes: actionNotes || null,
        }),
      })
      if (res.ok) {
        await fetchStudios()
        setSelectedStudio(null)
        setActionNotes('')
      }
    } catch {}
  }

  const filtered = studios.filter(s => {
    if (filter === 'all') return true
    if (filter === 'pending') return !s.verified && s.verification_status === 'pending_review'
    if (filter === 'approved') return s.verified
    if (filter === 'rejected') return s.verification_status === 'rejected'
    return true
  })

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-1 rounded font-medium">ADMIN</span>
          <Link href="/dashboard" className="text-sm text-white/50 hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Admin</span>
          <h1 className="text-4xl font-bold mt-2 mb-2">Studio Verifications</h1>
          <p className="text-white/50">Review and approve/reject Studio applications</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => {
            const count = studios.filter(s => {
              if (f === 'all') return true
              if (f === 'pending') return !s.verified && s.verification_status === 'pending_review'
              if (f === 'approved') return s.verified
              if (f === 'rejected') return s.verification_status === 'rejected'
              return false
            }).length
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition capitalize ${
                  filter === f ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/[0.03] text-white/50 border-white/[0.08]'
                }`}
              >
                {f} ({count})
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center text-white/40">
            No studios match this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(studio => (
              <div key={studio.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold">{studio.company_name}</h3>
                      {studio.verified && (
                        <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded font-medium">✓ Verified</span>
                      )}
                      {!studio.verified && studio.verification_status === 'pending_review' && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-medium">⏳ Pending</span>
                      )}
                      {studio.verification_status === 'rejected' && (
                        <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-medium">✗ Rejected</span>
                      )}
                      {studio.verification_status === 'auto_approved' && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-medium">Auto-approved</span>
                      )}
                      {studio.plan === 'studio' && (
                        <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold">PAID</span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">{studio.company_type}{studio.company_size ? ` • ${studio.company_size} employees` : ''}{studio.years_in_business ? ` • ${studio.years_in_business} years` : ''}</p>

                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                      <div>
                        <span className="text-white/30">Contact: </span>
                        <span className="text-white/80">{studio.name}{studio.contact_role ? ` (${studio.contact_role})` : ''}</span>
                      </div>
                      <div>
                        <span className="text-white/30">Email: </span>
                        <a href={`mailto:${studio.email}`} className="text-amber-400 hover:text-amber-300">{studio.email}</a>
                      </div>
                      {studio.company_website && (
                        <div>
                          <span className="text-white/30">Website: </span>
                          <a href={studio.company_website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">{studio.company_website}</a>
                        </div>
                      )}
                      {studio.contact_phone && (
                        <div>
                          <span className="text-white/30">Phone: </span>
                          <span className="text-white/80">{studio.contact_phone}</span>
                        </div>
                      )}
                      {studio.company_address && (
                        <div className="md:col-span-2">
                          <span className="text-white/30">Address: </span>
                          <span className="text-white/80">{studio.company_address}, {studio.company_postcode || ''} {studio.company_country || ''}</span>
                        </div>
                      )}
                      {studio.streams && studio.streams.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="text-white/30">Industries: </span>
                          {studio.streams.map(s => (
                            <span key={s} className="inline-block text-[10px] bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded mr-1 mb-1">{s}</span>
                          ))}
                        </div>
                      )}
                      {studio.company_bio && (
                        <div className="md:col-span-2 mt-1">
                          <span className="text-white/30">About: </span>
                          <p className="text-white/70 italic mt-1">&ldquo;{studio.company_bio}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    {studio.verification_notes && (
                      <div className="mt-3 text-xs bg-white/[0.04] border-l-2 border-amber-500 pl-3 py-2">
                        <span className="text-white/40">Admin note: </span>
                        <span className="text-white/70">{studio.verification_notes}</span>
                      </div>
                    )}
                  </div>

                  {!studio.verified && studio.verification_status !== 'rejected' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedStudio(studio)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition"
                      >
                        Review →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedStudio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudio(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative bg-[#0d0d1a] border border-white/[0.1] rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Review {selectedStudio.company_name}</h3>
              <p className="text-sm text-white/50 mb-5">Add an optional note that will be sent to the studio in the email.</p>

              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none mb-5"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selectedStudio.id, 'reject')}
                  className="flex-1 bg-red-500/15 border border-red-500/30 text-red-300 py-3 rounded-xl text-sm font-bold hover:bg-red-500/25 transition"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => handleAction(selectedStudio.id, 'approve')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-black py-3 rounded-xl text-sm font-bold hover:opacity-90 transition"
                >
                  ✓ Approve
                </button>
              </div>
              <button onClick={() => setSelectedStudio(null)} className="w-full text-white/30 text-xs mt-3 hover:text-white/50 transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
