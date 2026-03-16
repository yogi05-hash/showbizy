'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [generating, setGenerating] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'short_film',
    genre: 'drama',
    city: 'london',
    duration: '5-10 min',
    budget: 1000,
  })

  const generateProject = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error + (data.message ? ': ' + data.message : ''))
      } else if (data.project) {
        setProject(data.project)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to generate project. Please try again.')
    }
    setGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/60 hover:text-white">Home</Link>
          <Link href="/projects" className="text-white/60 hover:text-white">Browse</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Creator Dashboard</h1>

        {/* Project Generator */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🤖</span> AI Project Generator
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Project Type</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="short_film">Short Film</option>
                <option value="music_video">Music Video</option>
                <option value="photo_series">Photo Series</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Genre</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
              >
                <option value="drama">Drama</option>
                <option value="comedy">Comedy</option>
                <option value="horror">Horror</option>
                <option value="thriller">Thriller</option>
                <option value="romance">Romance</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">City</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              >
                <option value="london">London</option>
                <option value="manchester">Manchester</option>
                <option value="bristol">Bristol</option>
                <option value="nyc">New York</option>
                <option value="la">Los Angeles</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Duration</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              >
                <option value="1-3 min">1-3 minutes</option>
                <option value="3-5 min">3-5 minutes</option>
                <option value="5-10 min">5-10 minutes</option>
                <option value="10-15 min">10-15 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Budget (£)</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                min="500"
                max="10000"
                step="100"
              />
            </div>
          </div>

          <button
            onClick={generateProject}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : '✨ Generate AI Project'}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Generated Project */}
        {project && (
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Generated Project</span>
                <h2 className="text-3xl font-bold mt-2">{project.title}</h2>
                <p className="text-white/60 mt-1">{project.genre} • {project.duration} • {project.city}</p>
              </div>
              <button className="bg-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                Publish Project →
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 text-purple-400">Logline</h3>
              <p className="text-xl italic text-white/80">"{project.logline}"</p>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 text-purple-400">Synopsis</h3>
              <p className="text-white/70 leading-relaxed whitespace-pre-line">{project.synopsis}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-lg mb-3 text-purple-400">Characters</h3>
                <div className="space-y-3">
                  {project.characters?.map((char: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <p className="font-semibold">{char.name} <span className="text-white/50">({char.age})</span></p>
                      <p className="text-sm text-white/60">{char.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3 text-purple-400">Locations</h3>
                <div className="space-y-3">
                  {project.locations?.map((loc: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <p className="font-semibold">{loc.name}</p>
                      <p className="text-sm text-white/60">{loc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-purple-400">Team Needed</h3>
              <div className="flex flex-wrap gap-2">
                {project.roles_needed?.map((role: any, i: number) => (
                  <span key={i} className="bg-purple-600/30 border border-purple-500/30 px-3 py-2 rounded-full text-sm">
                    {role.role}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 mb-1">Budget Estimate</p>
                <p className="text-xl font-bold text-green-400">£{project.budget_estimate}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 mb-1">Timeline</p>
                <p className="text-xl font-bold">{project.timeline_weeks} weeks</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 mb-1">Shooting Days</p>
                <p className="text-xl font-bold">{project.production_notes?.shooting_days} days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}