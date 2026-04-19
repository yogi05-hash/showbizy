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
  plan?: string
  trial_ends_at?: string | null
  stripe_customer_id?: string | null
  referral_code?: string | null
  pro_extra_until?: string | null
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
  const [matchCount, setMatchCount] = useState(0)
  const [matchedProjects, setMatchedProjects] = useState<any[]>([])
  const [activeProjects, setActiveProjects] = useState<{ id: string; title: string; stream: string; role: string; location: string; status: string }[]>([])
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [professionals, setProfessionals] = useState<{ id: string; name: string; title: string; company: string; city: string; photo_url?: string }[]>([])
  const [matchedActivity, setMatchedActivity] = useState<{ professional: { name: string; title: string; company: string; photo_url: string | null }; project: { id: string; title: string }; action: string; score: number; timeAgo: string }[]>([])
  const [personalMatches, setPersonalMatches] = useState<{ name: string; title: string; company: string; photo_url: string | null; matchScore: number }[]>([])
  const [referral, setReferral] = useState<{ code: string | null; referrals: number } | null>(null)
  const [referralCopied, setReferralCopied] = useState(false)
  const [redeemMsg, setRedeemMsg] = useState<string>('')
  const [billingLoading, setBillingLoading] = useState(false)
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
          setMatchCount(projects.length)
          setMatchedProjects(projects.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setMatchesLoading(false)
      }
    }

    fetchMatches()

    // Fetch projects user has joined
    const fetchActiveProjects = async () => {
      try {
        const res = await fetch(`/api/user/projects?user_id=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setActiveProjects(data.projects || [])
        }
      } catch {}
    }
    fetchActiveProjects()

    // Fetch matched activity (real professionals matched to real projects)
    const city = user.city || ''
    const cityParam = city ? `&city=${encodeURIComponent(city)}` : ''
    fetch(`/api/professionals/matched?limit=10${cityParam}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.matches) setMatchedActivity(d.matches) })
      .catch(() => {})

    // Fetch professionals matched to THIS user's skills
    fetch(`/api/professionals/for-user?user_id=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.professionals) setPersonalMatches(d.professionals) })
      .catch(() => {})

    // Also fetch professionals for count
    fetch(`/api/professionals?limit=6${city ? `&city=${encodeURIComponent(city)}` : ''}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.professionals) setProfessionals(d.professionals) })
      .catch(() => {})

    // Referral: auto-redeem any code stashed by /r/[code] before the user signed
    // up, then always fetch the user's own code + referral count.
    let pendingRef: string | null = null
    try { pendingRef = localStorage.getItem('showbizy_ref') } catch {}
    const redeem = pendingRef
      ? fetch('/api/referral/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, code: pendingRef }),
        })
          .then(r => r.json())
          .then((d: { ok?: boolean; rewardDays?: number; error?: string }) => {
            try { localStorage.removeItem('showbizy_ref') } catch {}
            if (d?.ok) setRedeemMsg(`🎉 Referral applied — ${d.rewardDays} days of Pro added to your account.`)
          })
          .catch(() => {})
      : Promise.resolve()

    redeem.then(() =>
      fetch(`/api/referral/me?user_id=${user.id}`)
        .then(r => r.ok ? r.json() : null)
        .then((d: { code: string | null; referrals: number } | null) => {
          if (d) setReferral(d)
        })
        .catch(() => {})
    )
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

  const openBillingPortal = async () => {
    if (!user?.stripe_customer_id) return
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const d = await res.json()
      if (d?.url) window.location.href = d.url
    } catch {}
    setBillingLoading(false)
  }

  const copyInvite = async () => {
    if (!referral?.code) return
    const inviteUrl = `${window.location.origin}/r/${referral.code}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 2000)
    } catch {}
  }

  const daysLeftInTrial = user?.trial_ends_at && user?.plan === 'pro_trial'
    ? Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          <Link href="/projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 transition font-medium">Jobs</Link>
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

        {/* Trial countdown banner */}
        {user.plan === 'pro_trial' && daysLeftInTrial !== null && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="font-bold">Pro trial active</h3>
                <p className="text-white/60 text-sm">
                  {daysLeftInTrial === 0
                    ? 'Last day of your trial — first charge tomorrow.'
                    : `${daysLeftInTrial} day${daysLeftInTrial === 1 ? '' : 's'} left · first charge on ${new Date(user.trial_ends_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`}
                </p>
              </div>
            </div>
            {user.stripe_customer_id && (
              <button
                onClick={openBillingPortal}
                disabled={billingLoading}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5 transition disabled:opacity-60"
              >
                {billingLoading ? 'Opening…' : 'Manage billing'}
              </button>
            )}
          </div>
        )}

        {/* Referral redemption notice */}
        {redeemMsg && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm">
            {redeemMsg}
          </div>
        )}

        {/* Refer & earn invite card */}
        {referral?.code && (
          <div className="mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-amber-300 text-xl flex-shrink-0">
              🎁
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">Refer a creative · earn 1 month Pro free</h3>
              <p className="text-white/50 text-xs mt-0.5">
                {referral.referrals === 0
                  ? 'When they sign up and stay, you both get 30 days of Pro added to your account.'
                  : `${referral.referrals} successful referral${referral.referrals === 1 ? '' : 's'} · ${referral.referrals * 30} bonus Pro days earned`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <code className="text-amber-300 text-xs font-mono bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                {referral.code}
              </code>
              <button
                onClick={copyInvite}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5 transition"
              >
                {referralCopied ? 'Copied!' : 'Copy invite link'}
              </button>
            </div>
          </div>
        )}

        {/* Manage billing button — shown for paying users who aren't in trial */}
        {user.stripe_customer_id && user.plan !== 'pro_trial' && (user.is_pro || user.plan === 'pro' || user.plan === 'studio') && (
          <div className="mb-6 text-right">
            <button
              onClick={openBillingPortal}
              disabled={billingLoading}
              className="text-xs text-white/50 hover:text-white/80 transition underline underline-offset-4 disabled:opacity-60"
            >
              {billingLoading ? 'Opening billing portal…' : 'Manage billing / cancel'}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]} 👋</h1>
            {(user as { plan?: string }).plan === 'studio' && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">STUDIO ✓</span>
            )}
            {(user as { plan?: string }).plan === 'pro' && (
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">PRO</span>
            )}
          </div>
          <p className="text-white/40">Here&apos;s what&apos;s happening with your creative projects</p>
        </div>

        {/* Studio CTA Banner */}
        {(user as { plan?: string }).plan === 'studio' && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎬</span>
                <h3 className="font-bold text-lg">Ready to create something?</h3>
              </div>
              <p className="text-white/60 text-sm">Post a project and our AI will match it with the right talent in your area.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/studio/applications" className="bg-white/[0.05] border border-white/[0.1] px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition whitespace-nowrap">
                Applications
              </Link>
              <Link href="/studio/post-project" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition whitespace-nowrap">
                + Post Project
              </Link>
            </div>
          </div>
        )}

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
                  <p className="text-white/40 mb-3">Our AI is scanning your area for projects that match your skills. New projects are generated daily.</p>
                  <Link href="/projects" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                    Browse all projects →
                  </Link>
                </div>
              )}
            </section>

            {/* Active Projects */}
            <section>
              <h2 className="text-xl font-bold mb-4">Active Projects</h2>
              {activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.map(proj => (
                    <Link key={proj.id} href={`/projects/${proj.id}`} className="block bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-purple-500/20 transition">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm">{proj.title}</h3>
                        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">{proj.status}</span>
                      </div>
                      <p className="text-white/40 text-xs mb-2">{proj.stream} — {proj.location}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">{proj.role}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-white/40">No active projects yet.</p>
                  <p className="text-white/30 text-sm mt-2">
                    <Link href="/projects" className="text-purple-400 hover:text-purple-300">Browse projects</Link> and join one to get started!
                  </p>
                </div>
              )}
            </section>

            {/* Professionals matched to YOUR skills */}
            {personalMatches.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-1">Professionals who match your skills</h2>
                <p className="text-white/30 text-sm mb-4">Based on your profile, these industry professionals are a match for you.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {personalMatches.slice(0, 4).map((pro, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-lg font-bold mx-auto mb-3 overflow-hidden">
                        {pro.photo_url ? (
                          <img src={pro.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          pro.name.charAt(0)
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">{pro.name}</p>
                      <p className="text-white/30 text-[11px] truncate">{pro.title}</p>
                      <p className="text-white/20 text-[10px] truncate">{pro.company}</p>
                      <div className={`text-[10px] mt-2 px-2 py-0.5 rounded-full inline-block ${
                        pro.matchScore >= 40 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {pro.matchScore}% match
                      </div>
                    </div>
                  ))}
                </div>
                {!user.is_pro && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, userId: user.id, plan: 'pro' }) })
                        const data = await res.json()
                        if (data.url) window.location.href = data.url
                      } catch { window.location.href = '/upgrade' }
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-xl p-4 text-center hover:border-purple-500/40 transition"
                  >
                    <p className="text-white/50 text-sm mb-1">Upgrade to Pro to connect with {personalMatches.length} professionals</p>
                    <p className="text-amber-400 text-xs font-medium">Unlock messaging, profiles, and collaboration →</p>
                  </button>
                )}
              </section>
            )}

            {/* Live matching activity — real professionals matched to real projects */}
            {matchedActivity.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <h2 className="text-xl font-bold">Live in {user.city || 'your area'}</h2>
                </div>
                <div className="space-y-2">
                  {matchedActivity.map((match, i) => (
                    <Link key={i} href={`/projects/${match.project.id}`} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 hover:border-white/10 transition">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                        {match.professional.photo_url ? (
                          <img src={match.professional.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          match.professional.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="font-medium text-white/80">{match.professional.name}</span>
                        <span className="text-white/30"> ({match.professional.title}{match.professional.company ? `, ${match.professional.company}` : ''}) </span>
                        <span className="text-white/40">{match.action} </span>
                        <span className="text-purple-400 font-medium">{match.project.title}</span>
                        {match.score >= 70 && (
                          <span className={`text-xs ml-1 ${match.score >= 85 ? 'text-green-400' : 'text-amber-400'}`}>— {match.score}% match</span>
                        )}
                      </div>
                      <span className="text-white/15 text-[10px] flex-shrink-0">{match.timeAgo}</span>
                    </Link>
                  ))}
                </div>
                {!user.is_pro && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, userId: user.id, plan: 'pro' }) })
                        const data = await res.json()
                        if (data.url) window.location.href = data.url
                      } catch { window.location.href = '/upgrade' }
                    }}
                    className="w-full mt-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center hover:border-amber-500/30 transition"
                  >
                    <p className="text-white/40 text-sm mb-1">{professionals.length}+ creatives active in {user.city || 'your area'} this week</p>
                    <p className="text-amber-400 text-xs font-medium">Upgrade to Pro to get matched and join projects →</p>
                  </button>
                )}
              </section>
            )}

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
            {/* Upgrade to Pro — FOMO banner with real match count */}
            {!user.is_pro && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: user.email, userId: user.id, plan: 'pro' }),
                    })
                    const data = await res.json()
                    if (data.url) window.location.href = data.url
                  } catch { window.location.href = '/upgrade' }
                }}
                className="block w-full text-left bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition group"
              >
                {matchCount > 0 ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🔒</span>
                      <h3 className="font-bold text-lg">You&apos;ve been matched to {matchCount} project{matchCount !== 1 ? 's' : ''}</h3>
                    </div>
                    <p className="text-white/50 text-sm mb-3">
                      Our AI found {matchCount} project{matchCount !== 1 ? 's' : ''} matching your skills — but you need Pro to apply. Don&apos;t miss out.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">⚡</span>
                      <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                    </div>
                    <p className="text-white/50 text-sm mb-3">
                      Get matched to projects, apply to real jobs, and unlock priority AI matching.
                    </p>
                  </>
                )}
                <span className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2 rounded-lg text-sm font-semibold group-hover:opacity-90 transition">
                  Upgrade to Pro — {proPrice}/month →
                </span>
              </button>
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
                  <Link href="/profile" className="text-xs text-purple-400 hover:text-purple-300 transition">
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
