'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'

/* ─── DATA ─── */
const FEATURED_PROJECTS = [
  {
    title: 'The Last Bookstore',
    genre: 'Short Film',
    subgenre: 'Drama',
    location: 'London',
    team: 4,
    status: 'Casting Now',
    statusColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600',
    avatars: ['🎬', '📝', '🎭', '📷'],
    timeline: 'Mar — Apr 2026',
  },
  {
    title: 'Neon Nights',
    genre: 'Music Video',
    subgenre: 'Electronic / Visual',
    location: 'Manchester',
    team: 6,
    status: 'In Production',
    statusColor: 'bg-green-400/20 text-green-300 border-green-400/30',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',
    avatars: ['🎵', '🎥', '💡', '🎨', '🎤', '📷'],
    timeline: 'Feb — Mar 2026',
  },
  {
    title: 'Street Canvas',
    genre: 'Documentary',
    subgenre: 'Urban Art',
    location: 'Birmingham',
    team: 3,
    status: 'Post-Production',
    statusColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
    image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600',
    avatars: ['🎬', '✂️', '🎵'],
    timeline: 'Jan — Feb 2026',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Director',
    city: 'London',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    quote: 'Signed up Monday, matched Tuesday, we started shooting by Saturday. This is how creative projects should work.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Music Producer',
    city: 'Manchester',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    quote: "I've been looking for a platform that actually connects creatives. ShowBizy matched me with a filmmaker who needed exactly my sound.",
  },
  {
    name: 'Elena Torres',
    role: 'Cinematographer',
    city: 'Birmingham',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    quote: "The AI-generated briefs are surprisingly good. It's like having a creative producer who never sleeps.",
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is it really free?',
    a: 'Yes! Create your profile, browse AI-generated projects, and get matched — completely free. Pro members get unlimited applications, priority matching, and a featured profile for £19/month.',
  },
  {
    q: 'How does AI generate projects?',
    a: 'Our AI analyzes trending genres, local talent pools, and creative gaps in your city. It generates project briefs with mood boards, role requirements, and production timelines — then matches the right creatives to each role.',
  },
  {
    q: 'What cities are you in?',
    a: "We're live in London now, with Manchester and Birmingham rolling out next. Sign up to get notified when we expand to your city.",
  },
]

const TICKER_ITEMS = [
  '🎬 Priya just joined from London',
  "🎯 Marcus matched to 'Neon Nights'",
  "🎵 New project generated: 'Vinyl Dreams' in Manchester",
  "📸 Elena's profile featured this week",
  "🎭 'The Last Bookstore' team is now full",
  '🔥 47 new creatives joined today',
  "🎬 'Street Canvas' entered post-production",
  '🎯 New match: Cinematographer needed in Birmingham',
]

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('showbizy_user')
    if (user) setIsLoggedIn(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <style jsx>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        .phone-mockup-wrapper {
          display: flex;
          justify-content: center;
        }
        @media (max-width: 1023px) {
          .phone-mockup-wrapper {
            margin-top: 2rem;
          }
        }
      `}</style>
      {/* ─── NAV ─── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#030712]/80">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="#how-it-works" className="text-white/50 hover:text-white transition">How it works</Link>
          <Link href="#creatives" className="text-white/50 hover:text-white transition">Creatives</Link>
          <Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition hidden sm:block">Dashboard</Link>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                Y
              </div>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-sm text-white/60 hover:text-white transition hidden sm:block">Sign in</Link>
              <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-8">
            <span>🔥</span>
            <span className="text-sm font-semibold text-green-300">Now Live in London</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 tracking-tight">
            <span className="text-white">AI creates the project.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
              You bring the talent.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            ShowBizy generates creative briefs and assembles local teams of film, music, and entertainment professionals to bring them to life.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-purple-500/25 whitespace-nowrap text-center"
            >
              Get Started Free →
            </Link>
            <Link
              href="/pricing"
              className="bg-white/5 border border-white/10 px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition whitespace-nowrap text-center"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ACTIVITY TICKER ─── */}
      <div className="relative border-t border-b border-white/5 bg-white/[0.02] overflow-hidden py-3">
        <div className="ticker-track flex whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-block px-8 text-sm text-white/40">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED PROJECTS ─── */}
      <section id="projects" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Live Projects</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Happening right now</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Real creative projects with real teams. Every one started as an AI-generated brief.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURED_PROJECTS.map((project) => (
            <div
              key={project.title}
              className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                {/* Status badge */}
                <div className={`absolute top-3 right-3 ${project.statusColor} border text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm`}>
                  {project.status}
                </div>
                {/* Genre badge */}
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium px-3 py-1 rounded-full">
                  {project.genre}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                <p className="text-sm text-white/40 mb-4">{project.subgenre} • {project.location} • {project.timeline}</p>

                {/* Team avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.avatars.map((av, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#030712] flex items-center justify-center text-sm"
                      >
                        {av}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-white/30">{project.team} team members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT ACTUALLY WORKS ─── */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">How it actually works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">From AI brief to real production</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Four steps. No gatekeepers. No endless applications.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Steps */}
            <div className="grid md:grid-cols-2 gap-6 flex-1">
              {/* Step 1 — AI Brief */}
              <div className="relative group">
                <div className="text-xs font-mono font-bold text-purple-400 mb-3">STEP 01</div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3">AI Generates a Brief</h3>
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] text-xs space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      <span className="text-purple-300 font-semibold">New Brief</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Mood</span>
                      <span className="text-white/70">Nostalgic, Warm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Genre</span>
                      <span className="text-white/70">Short Film</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Location</span>
                      <span className="text-white/70">East London</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Roles</span>
                      <span className="text-white/70">4 needed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 — Matched */}
              <div className="relative group">
                <div className="text-xs font-mono font-bold text-purple-400 mb-3">STEP 02</div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3">You Get Matched</h3>
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🔔</div>
                      <div>
                        <p className="text-white/80 font-semibold">New match!</p>
                        <p className="text-white/40">Just now</p>
                      </div>
                    </div>
                    <p className="text-white/60 leading-relaxed">&quot;Neon Nights&quot; needs a <span className="text-purple-300 font-medium">cinematographer</span> in Manchester</p>
                    <button className="mt-3 w-full bg-purple-500/20 text-purple-300 py-2 rounded-lg text-xs font-semibold border border-purple-500/20">
                      View Project →
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 — Team */}
              <div className="relative group">
                <div className="text-xs font-mono font-bold text-purple-400 mb-3">STEP 03</div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3">Join Your Team</h3>
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex justify-center -space-x-3 mb-3">
                      {['🎬', '📷', '🎵', '✂️', '🎨'].map((emoji, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#030712] flex items-center justify-center text-lg team-avatar-pop"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-xs text-white/50">Team assembled</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {['Director', 'DOP', 'Sound', 'Editor', 'Art'].map((role) => (
                        <span key={role} className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded-full">{role}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 — Create */}
              <div className="relative group">
                <div className="text-xs font-mono font-bold text-purple-400 mb-3">STEP 04</div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3">Create Something Real</h3>
                  <div className="bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.06]">
                    <div className="h-20 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
                      <span className="text-3xl">🎬</span>
                    </div>
                    <div className="p-3 text-xs">
                      <p className="font-semibold text-white/80">Premiere Night</p>
                      <p className="text-white/40 mt-1">Real project. Real credits. Real portfolio.</p>
                      <div className="flex gap-1 mt-2">
                        <span className="bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full text-[10px] font-medium">✓ Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── PHONE MOCKUP ─── */}
            <div className="flex-shrink-0 phone-mockup-wrapper">
              <div
                className="relative w-[280px] h-[560px] bg-[#1a1a2e] rounded-[2.5rem] border-2 border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden"
                style={{ transform: 'perspective(1200px) rotateY(-5deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#0d0d1a] rounded-b-2xl z-20" />

                {/* Screen */}
                <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-b from-[#0d0d1a] to-[#12122a] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] text-white/50">
                    <span className="font-semibold">9:41</span>
                    <div className="flex items-center gap-1">
                      <span>▂▄▆█</span>
                      <span>WiFi</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* Push notification */}
                  <div className="mx-3 mt-12 bg-white/[0.08] backdrop-blur-xl rounded-2xl p-3.5 border border-white/[0.1] shadow-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">🎬</span>
                      <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">ShowBizy</span>
                      <span className="ml-auto text-[9px] text-white/30">2m ago</span>
                    </div>
                    <p className="text-xs font-bold text-white/90 mb-1">New Match! 🎯</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      You&apos;ve been matched to &apos;Neon Nights&apos; — a music video shooting in Manchester this weekend. Tap to view.
                    </p>
                  </div>

                  {/* Faded home screen effect */}
                  <div className="mt-6 px-4 space-y-3 opacity-20">
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white/10" />
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white/10" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI LIVE SECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">AI in Action</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Watch the AI create</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 md:p-8 hover:border-purple-500/20 transition-all duration-300">
            {/* Live indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-semibold text-red-400">LIVE</span>
              </div>
              <span className="text-xs text-white/30">Generated 2 minutes ago</span>
            </div>

            {/* Generated brief */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Echoes of Brick Lane</h3>
                <p className="text-white/40 text-sm mt-1">AI-Generated Creative Brief #1,247</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-white/40 text-xs block mb-1">Genre</span>
                  <span className="text-white/80 font-medium">Short Documentary</span>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-white/40 text-xs block mb-1">Mood / Tone</span>
                  <span className="text-white/80 font-medium">Intimate, Raw, Poetic</span>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-white/40 text-xs block mb-1">Location</span>
                  <span className="text-white/80 font-medium">East London, UK</span>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-white/40 text-xs block mb-1">Team Size</span>
                  <span className="text-white/80 font-medium">5 creatives</span>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-white/40 text-xs block mb-1">Visual Style</span>
                  <span className="text-white/80 font-medium">Handheld, Natural Light</span>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-white/40 text-xs block mb-1">Key Roles</span>
                  <span className="text-white/80 font-medium">Director, DOP, Editor, Sound, Narrator</span>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Our AI generates fresh creative projects every day, matched to talent in your area.
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="creatives" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">From the Community</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Creatives who shipped</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Real people. Real projects. Real results.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-transparent transition-all duration-500 testimonial-card"
            >
              {/* Gradient border on hover */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-white/40">{t.role} • {t.city}</p>
                  </div>
                </div>
                <p className="text-white/60 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING TEASER ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Plans starting from <span className="text-white font-bold">£0/month</span></p>
          <Link href="/pricing" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition text-lg">
            View pricing plans →
          </Link>
        </div>
      </section>

      {/* ─── JOIN NOW CTA ─── */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-3xl p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to create something amazing?</h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of creatives already on ShowBizy. Get matched to real projects in your city.
            </p>
            <Link href="/signup" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
              Create Your Free Profile →
            </Link>
            <p className="text-white/40 text-sm mt-4">
              Pro features from <Link href="/pricing" className="text-purple-400 hover:text-purple-300 font-semibold transition">£19/month</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Got questions?</h2>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`bg-white/[0.03] border rounded-2xl transition-all duration-300 overflow-hidden ${
                openFaq === i ? 'border-purple-500/40' : 'border-white/[0.06]'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className={`font-semibold text-lg transition-colors ${openFaq === i ? 'text-purple-400' : 'text-white/80'}`}>
                  {item.q}
                </span>
                <span
                  className={`text-white/40 text-xl transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: openFaq === i ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-white/50 leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRESS / FEATURED LOGOS ─── */}
      <section className="py-16 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm text-white/30 uppercase tracking-widest mb-10">As featured in</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              { name: 'Creative Review', icon: '✦' },
              { name: 'The Drum', icon: '◈' },
              { name: 'It\'s Nice That', icon: '◉' },
              { name: 'Dazed Digital', icon: '◆' },
              { name: 'Screen Daily', icon: '▣' },
            ].map((pub) => (
              <div key={pub.name} className="flex items-center gap-2 text-white/20 hover:text-white/40 transition-colors duration-300 group">
                <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{pub.icon}</span>
                <span className="text-lg font-semibold tracking-wide">{pub.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ShowBizy</span>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 ShowBizy.ai — AI creates the project. You bring the talent.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="text-white/40 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-white/40 hover:text-white transition">Contact</Link>
            <Link href="https://twitter.com/showbizyai" className="text-white/40 hover:text-white transition">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
