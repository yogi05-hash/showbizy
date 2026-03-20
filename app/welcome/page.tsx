'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function WelcomeContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'Creative'
  const streams = searchParams.get('streams') || ''
  const skills = searchParams.get('skills') || ''

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated checkmark */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Welcome message */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to ShowBizy,{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {name}!
          </span>
        </h1>

        <p className="text-xl text-white/50 mb-8 leading-relaxed">
          Your profile is live. Our AI is already scanning your area for projects that match your skills.
        </p>

        {/* Profile summary card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Your Profile</h3>
          <div className="space-y-3">
            {streams && (
              <div className="flex items-start gap-3">
                <span className="text-white/40 text-sm min-w-[80px]">Streams:</span>
                <div className="flex flex-wrap gap-2">
                  {streams.split(',').map((stream) => (
                    <span key={stream} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                      {stream}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills && (
              <div className="flex items-start gap-3">
                <span className="text-white/40 text-sm min-w-[80px]">Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {skills.split(',').map((skill) => (
                    <span key={skill} className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm border border-pink-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 text-left">
          <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-white/40 text-sm">We&apos;ve sent a confirmation to your inbox</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium">AI scans your area</p>
                <p className="text-white/40 text-sm">Our AI looks at local talent and generates projects you&apos;re perfect for</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium">Get matched</p>
                <p className="text-white/40 text-sm">You&apos;ll receive your first project matches within 48 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25"
          >
            Go to Dashboard →
          </Link>
          <Link
            href="/projects"
            className="border border-white/10 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition"
          >
            Browse Projects
          </Link>
        </div>

        {/* Social share */}
        <p className="mt-10 text-white/30 text-sm">
          Know other creatives? Share ShowBizy and build your local network.
        </p>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  )
}
