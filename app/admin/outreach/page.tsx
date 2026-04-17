'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  total: number
  saved: number
  skipped: number
}

interface OutreachResult {
  sent: number
  failed: number
}

export default function OutreachPage() {
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [outreachResult, setOutreachResult] = useState<OutreachResult | null>(null)
  const [titles, setTitles] = useState('Director, Producer, Cinematographer, Editor, Music Producer, Photographer, Content Creator, Actor, Animator')
  const [locations, setLocations] = useState('London, Manchester, Los Angeles, New York, Mumbai')
  const [perPage, setPerPage] = useState(25)

  const handleSearch = async () => {
    setSearching(true)
    setSearchResult(null)
    try {
      const res = await fetch('/api/apollo/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titles: titles.split(',').map(t => t.trim()),
          locations: locations.split(',').map(l => l.trim()),
          perPage,
        }),
      })
      const data = await res.json()
      setSearchResult(data)
    } catch {}
    setSearching(false)
  }

  const handleOutreach = async () => {
    setSending(true)
    setOutreachResult(null)
    try {
      const res = await fetch('/api/apollo/outreach', { method: 'POST' })
      const data = await res.json()
      setOutreachResult(data)
    } catch {}
    setSending(false)
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Apollo.io Outreach</h1>
        <p className="text-white/40 mb-8">Find entertainment professionals and invite them to ShowBizy.</p>

        {/* Search Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">1. Search Professionals</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs text-white/40 mb-1">Job Titles (comma separated)</label>
              <input
                value={titles}
                onChange={e => setTitles(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Locations (comma separated)</label>
              <input
                value={locations}
                onChange={e => setLocations(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Results per page</label>
              <input
                type="number"
                value={perPage}
                onChange={e => setPerPage(parseInt(e.target.value) || 25)}
                min={1}
                max={100}
                className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {searching ? 'Searching Apollo...' : 'Search & Import'}
          </button>

          {searchResult && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm">
              <p className="text-green-400">Found {searchResult.total} professionals — {searchResult.saved} saved, {searchResult.skipped} skipped (duplicates)</p>
            </div>
          )}
        </div>

        {/* Outreach Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">2. Send Invite Emails</h2>
          <p className="text-white/40 text-sm mb-4">Sends personalised invite emails to the next 20 professionals who haven't been contacted yet. Rate limited to avoid spam.</p>

          <button
            onClick={handleOutreach}
            disabled={sending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {sending ? 'Sending invites...' : 'Send Next 20 Invites'}
          </button>

          {outreachResult && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm">
              <p className="text-green-400">{outreachResult.sent} invites sent, {outreachResult.failed} failed</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-3">How it works</h2>
          <ol className="space-y-2 text-sm text-white/50">
            <li>1. Search imports professionals into the database and displays them on the site</li>
            <li>2. Send invites emails them personalised invitations to sign up</li>
            <li>3. When they sign up, they become real members with full profiles</li>
            <li>4. AI matches them with projects automatically</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
