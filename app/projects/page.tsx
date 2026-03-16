'use client'

import Link from 'next/link'
import { useState } from 'react'

// Mock projects data - in real app this comes from database
const mockProjects = [
  {
    id: '1',
    title: 'The Last Bookstore',
    type: 'Short Film',
    genre: 'Drama',
    city: 'London',
    logline: 'In a world where all books are digital, an elderly woman runs the last physical bookstore...',
    roles_needed: ['Director', 'Lead Actor (60+)', 'DP', 'Sound'],
    status: 'recruiting',
    created_at: '2026-03-15',
  },
  {
    id: '2',
    title: 'Neon Dreams',
    type: 'Music Video',
    genre: 'Electronic',
    city: 'Manchester',
    logline: 'Surreal journey through a cyberpunk city. Dancer moves through neon-lit streets...',
    roles_needed: ['Director', 'Dancer', 'DP', 'Editor'],
    status: 'recruiting',
    created_at: '2026-03-14',
  },
  {
    id: '3',
    title: 'Blue Hour Workers',
    type: 'Photo Series',
    genre: 'Documentary',
    city: 'London',
    logline: 'Portraits of night shift workers during the magical time between night and dawn...',
    roles_needed: ['Photographer', '3 Subjects'],
    status: 'recruiting',
    created_at: '2026-03-13',
  },
]

export default function ProjectsPage() {
  const [filter, setFilter] = useState({
    type: 'all',
    city: 'all',
    role: 'all',
  })

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
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/50 hover:text-white">Home</Link>
          <Link href="/dashboard" className="text-white/50 hover:text-white">Dashboard</Link>
          <Link href="/projects" className="text-white">Browse Projects</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Browse Projects</h1>
            <p className="text-white/50">Find AI-generated projects looking for team members</p>
          </div>
          <Link 
            href="/dashboard" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Create Project
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select 
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="short_film">Short Film</option>
            <option value="music_video">Music Video</option>
            <option value="photo_series">Photo Series</option>
          </select>
          <select 
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
            value={filter.city}
            onChange={(e) => setFilter({...filter, city: e.target.value})}
          >
            <option value="all">All Cities</option>
            <option value="london">London</option>
            <option value="manchester">Manchester</option>
            <option value="bristol">Bristol</option>
          </select>
          <select 
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
            value={filter.role}
            onChange={(e) => setFilter({...filter, role: e.target.value})}
          >
            <option value="all">All Roles</option>
            <option value="director">Director</option>
            <option value="actor">Actor</option>
            <option value="dp">Cinematographer</option>
            <option value="editor">Editor</option>
          </select>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project) => (
            <div key={project.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{project.type}</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{project.status}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
              <p className="text-sm text-white/50 mb-3">{project.genre} • {project.city}</p>
              
              <p className="text-white/60 text-sm mb-4 line-clamp-2">{project.logline}</p>
              
              <div className="mb-4">
                <p className="text-xs text-white/40 mb-2">ROLES NEEDED:</p>
                <div className="flex flex-wrap gap-2">
                  {project.roles_needed.map((role) => (
                    <span key={role} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-purple-600/30 border border-purple-500/30 py-3 rounded-xl font-semibold hover:bg-purple-600/50 transition">
                View Project →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}