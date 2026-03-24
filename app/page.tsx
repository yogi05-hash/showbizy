'use client'

import Link from 'next/link'
import { useState } from 'react'
import { STREAMS, MOCK_PROJECTS } from '@/lib/data'

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#030712]/80">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#streams" className="text-white/50 hover:text-white transition">Streams</Link>
          <Link href="#how-it-works" className="text-white/50 hover:text-white transition">How it works</Link>
          <Link href="#projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-sm text-white/60 hover:text-white transition hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition">
            Get early access
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-purple-300">Where creative projects are born</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 tracking-tight">
            <span className="text-white">Don&apos;t find work.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
              Let work find you.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI creates the project. You bring the talent. ShowBizy generates creative briefs 
            and assembles local teams of creatives to bring them to life.
          </p>

          {/* Waitlist form */}
          <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
            {!submitted ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-purple-500/25 whitespace-nowrap"
                >
                  Join waitlist →
                </button>
              </>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 text-green-400 font-medium">
                🎉 You&apos;re on the list! We&apos;ll be in touch soon.
              </div>
            )}
          </form>
          <p className="text-white/30 text-sm">Launching Q2 2026 • London & NYC first</p>
        </div>

        {/* Social proof stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20">
          {[
            { num: '2,847', label: 'Creatives waitlisted' },
            { num: '156', label: 'AI projects generated' },
            { num: '8', label: 'Creative streams' },
            { num: '48h', label: 'Avg team formation' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">{stat.num}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8 CREATIVE STREAMS */}
      <section id="streams" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">8 Creative Streams</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Every kind of creative, one platform</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">From filmmakers to fashion designers, musicians to muralists — ShowBizy generates projects across every creative discipline.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STREAMS.map((stream) => (
            <div
              key={stream.id}
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-purple-500/20 transition-all duration-300 cursor-pointer"
            >
              <span className="text-4xl mb-4 block">{stream.icon}</span>
              <h3 className="text-lg font-bold mb-2">{stream.name}</h3>
              <div className="flex flex-wrap gap-1">
                {stream.roles.slice(0, 3).map((role) => (
                  <span key={role} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{role}</span>
                ))}
                {stream.roles.length > 3 && (
                  <span className="text-xs text-purple-400">+{stream.roles.length - 3} more</span>
                )}
              </div>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stream.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">How it works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">AI creates. You collaborate.</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Four steps from idea to finished project</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'AI Scans Talent',
                desc: 'Our AI analyses creative profiles, skills, locations, and availability to understand who\'s ready to create.',
                icon: '🔍',
                gradient: 'from-blue-500/20 to-cyan-500/20',
              },
              {
                step: '02',
                title: 'Generates Projects',
                desc: 'AI creates complete project briefs — scripts, mood boards, shot lists, timelines — tailored to available talent.',
                icon: '✨',
                gradient: 'from-purple-500/20 to-pink-500/20',
              },
              {
                step: '03',
                title: 'Matches Teams',
                desc: 'The perfect crew is assembled based on skills, style, and location. Everyone gets a role that fits.',
                icon: '🎯',
                gradient: 'from-pink-500/20 to-rose-500/20',
              },
              {
                step: '04',
                title: 'They Create',
                desc: 'Teams collaborate with built-in tools — chat, file sharing, milestones. Real projects, real credits, real portfolio pieces.',
                icon: '🚀',
                gradient: 'from-orange-500/20 to-amber-500/20',
              },
            ].map((item) => (
              <div key={item.step} className={`relative bg-gradient-to-br ${item.gradient} border border-white/[0.06] rounded-2xl p-6`}>
                <span className="text-xs font-mono font-bold text-white/30 mb-4 block">{item.step}</span>
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLE PROJECTS */}
      <section id="projects" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">AI-Generated Projects</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">See what AI creates</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Real briefs generated by our AI — diverse projects across all 8 creative streams, ready for teams to execute.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {MOCK_PROJECTS.slice(0, 6).map((project) => (
            <div key={project.id} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-purple-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{project.streamIcon}</span>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{project.stream}</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{project.title}</h3>
              <p className="text-sm text-white/40 mb-3">{project.genre} • {project.location}</p>
              <p className="text-white/50 text-sm mb-4 leading-relaxed line-clamp-3">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.roles.filter(r => !r.filled).slice(0, 3).map((r, i) => (
                    <span key={i} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                      {r.role}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-white/30">{project.filledRoles}/{project.teamSize} joined</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/projects" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition">
            Browse all projects →
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Plans for every creative</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">From solo creatives to global brands</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Free</h3>
            <p className="text-4xl font-bold mb-1">£0</p>
            <p className="text-sm text-white/30 mb-6">Forever free</p>
            <ul className="space-y-3 mb-8">
              {['Browse all projects', 'Basic profile', 'Join 1 project/month', 'Community access'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center border border-white/10 py-3 rounded-xl font-semibold text-sm hover:bg-white/5 transition">
              Start free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-2xl p-7 glow-purple">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </span>
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-1">£19<span className="text-lg text-white/40">/mo</span></p>
            <p className="text-sm text-white/30 mb-6">For active creatives</p>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited projects',
                'Priority team matching',
                'Portfolio hosting',
                'Collaboration tools',
                'Credit generation',
                'Community voting',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-purple-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition">
              Get Pro
            </Link>
          </div>

          {/* Brand Brief */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Brand Brief</h3>
            <p className="text-4xl font-bold mb-1">£149<span className="text-lg text-white/40">-999</span></p>
            <p className="text-sm text-white/30 mb-6">Per project</p>
            <ul className="space-y-3 mb-8">
              {[
                'Custom AI brief',
                'Curated team matching',
                'Project management',
                'Dedicated support',
                'Commercial licensing',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center border border-white/10 py-3 rounded-xl font-semibold text-sm hover:bg-white/5 transition">
              Submit brief
            </Link>
          </div>

          {/* Brand Sub */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Brand Sub</h3>
            <p className="text-4xl font-bold mb-1">£499<span className="text-lg text-white/40">/mo</span></p>
            <p className="text-sm text-white/30 mb-6">Unlimited content</p>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited briefs',
                'Priority talent pool',
                'Brand guidelines AI',
                'Analytics dashboard',
                'API access',
                'Account manager',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center border border-white/10 py-3 rounded-xl font-semibold text-sm hover:bg-white/5 transition">
              Contact sales
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-3xl p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your next project is waiting</h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join 2,847 creatives already on the waitlist. Be first to access AI-generated projects when we launch.
            </p>
            <Link href="/signup" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
              Get early access →
            </Link>
            <p className="text-white/30 text-sm mt-4">Launching Q2 2026 • London & NYC first</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
