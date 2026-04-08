'use client'

import Link from 'next/link'
import { useState } from 'react'

const FAQS = [
  {
    q: 'How does ShowBizy work?',
    a: 'ShowBizy uses AI to generate creative project briefs in your city, then matches you with the right team based on your skills and availability. You can browse projects, apply to ones that interest you, or get auto-matched as a Pro member.',
  },
  {
    q: 'What\'s the difference between Free and Pro?',
    a: 'Free members can create a profile, browse projects, and view industry jobs. Pro members (£9/month) can apply to projects, get AI-powered matching, view full job details, apply to industry jobs with cover letter and CV, and access featured profile placement.',
  },
  {
    q: 'How do I apply to a job?',
    a: 'Pro members can click any job on the Jobs page, view full details, and submit an application with a cover letter (minimum 50 characters) and a resume/CV (PDF or DOC, max 5MB). You\'ll receive a confirmation email and can track your application in your dashboard.',
  },
  {
    q: 'How do I cancel my Pro subscription?',
    a: 'You can cancel anytime from your Stripe customer portal. Email hello@bilabs.ai and we\'ll send you the link, or you can manage your subscription directly through the email receipt Stripe sent you when you signed up.',
  },
  {
    q: 'I forgot my password',
    a: 'Currently password reset is via email — contact hello@bilabs.ai with your registered email address and we\'ll help you reset it manually. We\'re building an automated reset flow soon.',
  },
  {
    q: 'How do I update my profile?',
    a: 'Go to your Dashboard and click "Edit profile" in the sidebar. You can update your name, location, streams, skills, portfolio links, and avatar.',
  },
  {
    q: 'Where do the jobs come from?',
    a: 'Industry jobs are aggregated from Adzuna (UK\'s largest job search engine) and curated by ShowBizy. We focus on entertainment industry roles in film, TV, music, theatre, and live events. New jobs refresh every 30 minutes.',
  },
  {
    q: 'Can I share a job with friends?',
    a: 'Yes! Every job has share buttons for X (Twitter), LinkedIn, WhatsApp, Instagram, and a copy-link option. The shared link will show the full job details to anyone, but applying requires a Pro account.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use Supabase (PostgreSQL) for data storage, Stripe for payments (we never see your card details), and TLS encryption everywhere. See our Privacy Policy for full details.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Email hello@bilabs.ai with the subject "Delete my account" from your registered email address. We\'ll permanently delete your account and all associated data within 7 days, in compliance with GDPR.',
  },
]

export default function SupportPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/50 hover:text-white transition">Home</Link>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 transition font-medium">Jobs</Link>
          <Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Support Center</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">How can we help?</h1>
          <p className="text-white/50 text-lg">
            Find answers to common questions, or get in touch with our team.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for help..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition"
          />
        </div>

        {/* Quick contact cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <a
            href="mailto:hello@bilabs.ai"
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-amber-500/30 transition group"
          >
            <span className="text-3xl block mb-3">📧</span>
            <h3 className="font-bold mb-1">Email Support</h3>
            <p className="text-sm text-white/50 mb-3">Get a response within 24 hours</p>
            <span className="text-amber-400 text-sm font-medium group-hover:text-amber-300">hello@bilabs.ai →</span>
          </a>
          <Link
            href="/pricing"
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-amber-500/30 transition group"
          >
            <span className="text-3xl block mb-3">⚡</span>
            <h3 className="font-bold mb-1">Pro Features</h3>
            <p className="text-sm text-white/50 mb-3">Unlock matching and applications</p>
            <span className="text-amber-400 text-sm font-medium group-hover:text-amber-300">View pricing →</span>
          </Link>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-white/40 text-center py-8">No results found. Try a different search or email us.</p>
            ) : (
              filtered.map((faq, i) => (
                <div
                  key={i}
                  className={`bg-white/[0.03] border rounded-2xl transition-all duration-300 overflow-hidden ${
                    openIdx === i ? 'border-amber-500/40' : 'border-white/[0.06]'
                  }`}
                >
                  <button
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className={`font-semibold transition-colors ${openIdx === i ? 'text-amber-400' : 'text-white/80'}`}>
                      {faq.q}
                    </span>
                    <span className={`text-white/40 text-xl transition-transform duration-300 ${openIdx === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: openIdx === i ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-white/60 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Still need help?</h3>
          <p className="text-white/60 mb-5">
            Our team responds within 24 hours, usually much sooner.
          </p>
          <a
            href="mailto:hello@bilabs.ai"
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 rounded-xl font-bold text-black hover:opacity-90 transition"
          >
            Email Support →
          </a>
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-center gap-6 text-sm text-white/30">
          <Link href="/privacy" className="hover:text-white/60 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/60 transition">Terms of Service</Link>
          <Link href="/" className="hover:text-white/60 transition">Home</Link>
        </div>
      </div>
    </div>
  )
}
