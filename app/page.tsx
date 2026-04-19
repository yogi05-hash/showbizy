'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { detectLocation, detectLocationByIP, getCitiesForLocation, formatPrice, PRICING, type LocationData } from '@/lib/location'
import { FadeIn, StaggerContainer, StaggerItem, TiltCard, AnimatedCounter } from '@/components/MotionWrap'
import HeroPulse from '@/components/HeroPulse'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const InfiniteGallery = dynamic(() => import('@/components/ui/3d-gallery-photography'), { ssr: false })

const HERO_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600', alt: 'Film clapperboard' },
  { src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600', alt: 'Music studio' },
  { src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600', alt: 'Street art' },
  { src: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600', alt: 'Theatre stage' },
  { src: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600', alt: 'Concert crowd' },
  { src: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600', alt: 'Dancer' },
  { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600', alt: 'Cinema screen' },
  { src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600', alt: 'Guitar music' },
  { src: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600', alt: 'Camera filming' },
  { src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600', alt: 'Live performance' },
]

function HeroGallery() {
  return (
    <Suspense fallback={null}>
      <InfiniteGallery
        images={HERO_IMAGES}
        speed={0.6}
        visibleCount={10}
        className="h-full w-full"
        fadeSettings={{
          fadeIn: { start: 0.05, end: 0.2 },
          fadeOut: { start: 0.45, end: 0.5 },
        }}
        blurSettings={{
          blurIn: { start: 0.0, end: 0.15 },
          blurOut: { start: 0.4, end: 0.5 },
          maxBlur: 6.0,
        }}
      />
    </Suspense>
  )
}

/* ─── DATA ─── */
const getFeaturedProjects = (cities: string[]) => [
  {
    title: 'The Last Bookstore',
    genre: 'Short Film',
    subgenre: 'Drama',
    location: cities[0] || 'London',
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
    location: cities[1] || 'Manchester',
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
    location: cities[2] || 'Birmingham',
    team: 3,
    status: 'Post-Production',
    statusColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600',
    avatars: ['🎬', '✂️', '🎵'],
    timeline: 'Jan — Feb 2026',
  },
]

const getTestimonials = (cities: string[]) => [
  {
    name: 'Priya Sharma',
    role: 'Director',
    city: cities[0] || 'London',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    quote: 'Signed up Monday, got matched to "Echoes of Brick Lane" on Tuesday, and we started shooting by Saturday. Built my entire showreel from 3 ShowBizy projects in 4 months. This replaced months of cold-emailing producers.',
    project: 'Echoes of Brick Lane',
    credits: 3,
  },
  {
    name: 'Marcus Johnson',
    role: 'Music Producer',
    city: cities[1] || 'Manchester',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    quote: 'I scored the soundtrack for "Neon Nights" — a music video that started as an AI brief. The director found me through ShowBizy\'s matching. We\'ve now done 3 projects together. That\'s the power of being matched by skills, not just who you know.',
    project: 'Neon Nights',
    credits: 5,
  },
  {
    name: 'Elena Torres',
    role: 'Cinematographer',
    city: cities[2] || 'Birmingham',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    quote: 'As a newcomer to the UK film scene, ShowBizy was a lifeline. The AI brief for "Street Canvas" matched perfectly with my documentary style. The 4-person crew felt like we\'d worked together for years. I now have a festival-selected short on my IMDB.',
    project: 'Street Canvas',
    credits: 2,
  },
  {
    name: 'James Okafor',
    role: 'Sound Designer',
    city: cities[0] || 'London',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    quote: 'I was spending 15 hours a week on Mandy and Backstage applying to jobs with zero responses. First week on ShowBizy Pro, I got matched to a short film that needed my exact skill set — foley and ambient sound. We wrapped in 3 days.',
    project: 'The Quiet Between',
    credits: 4,
  },
  {
    name: 'Sofia Lindqvist',
    role: 'Editor',
    city: cities[1] || 'Manchester',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    quote: 'The quality of briefs is what sold me. These aren\'t random gigs — each AI-generated project has a real creative vision, mood board, and clear roles. I\'ve cut 2 short films and a music video through ShowBizy. All went to festivals.',
    project: 'Half Light',
    credits: 3,
  },
  {
    name: 'Ravi Kapoor',
    role: 'Screenwriter',
    city: cities[2] || 'Birmingham',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    quote: 'I wrote the script for "Monsoon Wedding Crashers" after ShowBizy generated the brief. A director in Mumbai picked it up through the platform. We\'re now in post-production on what started as an AI idea. Wild.',
    project: 'Monsoon Wedding Crashers',
    credits: 1,
  },
]

const getFaqItems = (detectedCity: string, currencyCode: 'INR' | 'USD' | 'GBP' | 'EUR' = 'GBP') => [
  {
    q: 'Is it really free?',
    a: `Yes! Create your profile and browse AI-generated projects for free. To apply to projects, get AI-powered matching, and a featured profile — upgrade to Pro from ${formatPrice(PRICING[currencyCode].pro, currencyCode)}/month.`,
  },
  {
    q: 'How does AI generate projects?',
    a: 'Our AI analyzes trending genres, local talent pools, and creative gaps in your city. It generates project briefs with mood boards, role requirements, and production timelines — then matches the right creatives to each role.',
  },
  {
    q: 'What cities are you in?',
    a: `We're live in ${detectedCity} and expanding globally. Our AI creates location-specific projects tailored to your local creative scene.`,
  },
]

const getTickerItems = (location: LocationData, cities: string[]) => {
  // Names by region for variety
  const namesByRegion = {
    India: ['Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya'],
    USA: ['Marcus', 'Sarah', 'Jordan', 'Chris', 'Ashley'],
    UK: ['James', 'Emma', 'Ollie', 'Sophie', 'Charlotte'],
    Europe: ['Elena', 'Luca', 'Marie', 'Klaus', 'Sofia'],
  }

  // Get names for current region, with some variety from other regions
  const localNames = namesByRegion[location.country as keyof typeof namesByRegion] || namesByRegion.UK
  const allNames = [...localNames, ...namesByRegion.UK.slice(0, 2)] // Mix in some UK names
  
  const primaryCity = location.city
  const secondaryCity = cities[1] || 'Manchester'
  const tertiaryCity = cities[2] || 'Birmingham'

  return [
    `🎬 ${allNames[0]} just joined from ${primaryCity}`,
    `🎯 ${allNames[1]} matched to 'Neon Nights'`,
    `🎵 New project generated: 'Vinyl Dreams' in ${secondaryCity}`,
    `📸 ${allNames[2]}'s profile featured this week`,
    `🎭 'The Last Bookstore' team is now full`,
    '🔥 47 new creatives joined today',
    `🎬 'Street Canvas' entered post-production`,
    `🎯 New match: Cinematographer needed in ${tertiaryCity}`,
    `🌟 ${allNames[3]} completed their first project in ${primaryCity}`,
    `🎪 3 new projects launching in ${primaryCity} this week`,
  ]
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [location, setLocation] = useState<LocationData>({
    city: 'London',
    country: 'UK',
    currency: { code: 'GBP' as const, symbol: '£' }
  })
  const [cities, setCities] = useState(['London', 'Manchester', 'Birmingham'])
  const [featuredJobs, setFeaturedJobs] = useState<{id:string;title:string;company:string;location:string;salary:string;category:string;type:string;posted:string}[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [liveProjects, setLiveProjects] = useState<{id:string;title:string;stream:string;streamIcon:string;genre:string;location:string;timeline:string;description:string;teamSize:number;filledRoles:number;status:string;roles:{role:string;filled:boolean}[]}[]>([])
  const [matchedActivity, setMatchedActivity] = useState<{professional:{name:string;title:string;company:string;photo_url:string|null};project:{id:string;title:string};action:string;score:number;timeAgo:string}[]>([])
  const [proCompanies, setProCompanies] = useState<string[]>([])

  useEffect(() => {
    const user = localStorage.getItem('showbizy_user')
    if (user) setIsLoggedIn(true)

    // Detect location — timezone first (instant), then IP (accurate, async)
    const detectedLocation = detectLocation()
    setLocation(detectedLocation)
    const detectedCities = getCitiesForLocation(detectedLocation)
    setCities(detectedCities)

    // IP geolocation override (more reliable than timezone for remote desktops)
    detectLocationByIP().then(ipLoc => {
      if (ipLoc) {
        setLocation(ipLoc)
        // Update cities based on IP-detected location
        const ipCities = getCitiesForLocation(ipLoc)
        if (ipCities.length > 0) setCities(ipCities)
      }
    })

    // Fetch live projects from database — prioritize user's detected location
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => {
        if (d.projects?.length) {
          const detectedCity = detectedLocation.city.toLowerCase()
          const detectedCountry = detectedLocation.country.toLowerCase()
          // Sort: local projects first, then others
          const sorted = [...d.projects].sort((a: { location?: string }, b: { location?: string }) => {
            const aLoc = (a.location || '').toLowerCase()
            const bLoc = (b.location || '').toLowerCase()
            const aLocal = aLoc.includes(detectedCity) || aLoc.includes(detectedCountry) ? 1 : 0
            const bLocal = bLoc.includes(detectedCity) || bLoc.includes(detectedCountry) ? 1 : 0
            return bLocal - aLocal
          })
          setLiveProjects(sorted.slice(0, 3))
        }
      })
      .catch(() => {})

    // Fetch real matched activity for social proof
    fetch('/api/professionals/matched?limit=8')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.matches) {
          setMatchedActivity(d.matches)
          // Extract unique company names for logo bar
          const companies = [...new Set(d.matches.map((m: {professional:{company:string}}) => m.professional.company).filter(Boolean))] as string[]
          setProCompanies(companies)
        }
      })
      .catch(() => {})

    // Fetch featured jobs from API — localized by country
    const countryMap: Record<string, string> = { UK: 'gb', USA: 'us', India: 'in', Germany: 'de', France: 'fr', Spain: 'de', Netherlands: 'de' }
    const jobCountry = countryMap[detectedLocation.country] || 'gb'
    fetch(`/api/jobs?country=${jobCountry}`)
      .then(r => r.json())
      .then(d => { if (d.jobs) setFeaturedJobs(d.jobs.slice(0, 6)) })
      .catch(() => {})
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

        /* Spotlight beam animations — slow sweeping */
        @keyframes spotlight-sweep-1 {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes spotlight-sweep-2 {
          0%, 100% { transform: rotate(12deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes spotlight-sweep-3 {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .hero-spotlight-1 { animation: spotlight-sweep-1 12s ease-in-out infinite; }
        .hero-spotlight-2 { animation: spotlight-sweep-2 15s ease-in-out infinite; }
        .hero-spotlight-3 { animation: spotlight-sweep-3 18s ease-in-out infinite; }

        /* Floating project cards — gentle drift */
        @keyframes hero-float-a {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes hero-float-b {
          0%, 100% { transform: translateY(0) rotate(2deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes hero-float-c {
          0%, 100% { transform: translateY(0) rotate(1deg); }
          50% { transform: translateY(-25px) rotate(-2deg); }
        }
        @keyframes hero-float-d {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        .hero-float-1 { animation: hero-float-a 8s ease-in-out infinite; }
        .hero-float-2 { animation: hero-float-b 10s ease-in-out infinite 1s; }
        .hero-float-3 { animation: hero-float-c 9s ease-in-out infinite 0.5s; }
        .hero-float-4 { animation: hero-float-d 11s ease-in-out infinite 2s; }

        /* Title entrance */
        @keyframes hero-title-enter {
          from { opacity: 0; transform: translateY(30px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .hero-title-1 { animation: hero-title-enter 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        .hero-title-2 { animation: hero-title-enter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; opacity: 0; }

        /* General fade in */
        @keyframes hero-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-in { animation: hero-fade 0.8s ease forwards; opacity: 0; animation-delay: 0.4s; }
      `}</style>
      {/* ─── NAV ─── */}
      <nav className="relative flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#030712]/80">
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2">
          <Image src="/logo.png" alt="ShowBizy" width={200} height={56} style={{ height: 48, width: 'auto' }} unoptimized />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#projects" className="text-white/50 hover:text-white transition">Projects</Link>
          <Link href="#how-it-works" className="text-white/50 hover:text-white transition">How it works</Link>
          <Link href="#creatives" className="text-white/50 hover:text-white transition">Creatives</Link>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 transition font-medium">Jobs</Link>
          <Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition hidden sm:block">Dashboard</Link>
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                {(() => { try { const u = JSON.parse(localStorage.getItem('showbizy_user') || '{}'); return u.name?.charAt(0)?.toUpperCase() || '?' } catch { return '?' } })()}
              </Link>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-sm text-white/60 hover:text-white transition hidden sm:block">Sign in</Link>
              <Link href="/signup" className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 rounded-lg font-semibold text-sm text-black hover:opacity-90 transition">
                Get started
              </Link>
            </>
          )}
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white/70 hover:text-white transition p-1"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full inset-x-0 bg-[#030712]/98 backdrop-blur-xl border-b border-white/10 z-50">
            <div className="flex flex-col px-6 py-4 gap-1">
              <Link href="#projects" onClick={() => setMobileMenuOpen(false)} className="text-white/70 hover:text-white transition py-3 border-b border-white/5">Projects</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-white/70 hover:text-white transition py-3 border-b border-white/5">How it works</Link>
              <Link href="#creatives" onClick={() => setMobileMenuOpen(false)} className="text-white/70 hover:text-white transition py-3 border-b border-white/5">Creatives</Link>
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-amber-400 hover:text-amber-300 transition py-3 border-b border-white/5 font-medium">Jobs 🔥</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-white/70 hover:text-white transition py-3 border-b border-white/5">Pricing</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-white transition py-3 font-medium">Dashboard →</Link>
              ) : (
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-white transition py-3 font-medium">Sign in →</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Gallery Background */}
        <div className="absolute inset-0 opacity-60 pointer-events-auto">
          <HeroGallery />
        </div>
        {/* Dark overlay to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/30 via-[#030712]/50 to-[#030712]/90 pointer-events-none z-[1]" />

        {/* Animated rotating spotlight beams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
          <div className="hero-spotlight-1 absolute top-[-30%] left-[20%] w-[200px] h-[140vh] bg-gradient-to-b from-amber-400/[0.07] via-amber-400/[0.02] to-transparent origin-top" />
          <div className="hero-spotlight-2 absolute top-[-30%] right-[25%] w-[180px] h-[130vh] bg-gradient-to-b from-purple-400/[0.05] via-purple-400/[0.015] to-transparent origin-top" />
          <div className="hero-spotlight-3 absolute top-[-30%] left-[50%] w-[250px] h-[150vh] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent origin-top" />
        </div>

        {/* Radial glow behind text */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.08] rounded-full blur-[150px] pointer-events-none z-[2]" />

        {/* Floating project poster cards in background */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {/* Left side floating cards */}
          <div className="hero-float-1 absolute top-[18%] left-[3%] w-[160px] h-[220px] rounded-2xl overflow-hidden border border-white/[0.06] opacity-[0.15] hover:opacity-30 transition-opacity">
            <Image src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300" alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[10px] font-bold text-white/80">The Last Bookstore</p>
              <p className="text-[8px] text-white/40">Short Film • London</p>
            </div>
          </div>
          <div className="hero-float-2 absolute bottom-[22%] left-[5%] w-[140px] h-[190px] rounded-2xl overflow-hidden border border-white/[0.06] opacity-[0.12]">
            <Image src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300" alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[10px] font-bold text-white/80">Neon Nights</p>
              <p className="text-[8px] text-white/40">Music Video • Manchester</p>
            </div>
          </div>

          {/* Right side floating cards */}
          <div className="hero-float-3 absolute top-[22%] right-[4%] w-[150px] h-[200px] rounded-2xl overflow-hidden border border-white/[0.06] opacity-[0.13]">
            <Image src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300" alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[10px] font-bold text-white/80">Street Canvas</p>
              <p className="text-[8px] text-white/40">Documentary • Birmingham</p>
            </div>
          </div>
          <div className="hero-float-4 absolute bottom-[18%] right-[6%] w-[145px] h-[195px] rounded-2xl overflow-hidden border border-white/[0.06] opacity-[0.11]">
            <Image src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300" alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[10px] font-bold text-white/80">Echoes of Brick Lane</p>
              <p className="text-[8px] text-white/40">Documentary • London</p>
            </div>
          </div>
        </div>

        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />

        <div className="relative z-[5] max-w-5xl mx-auto px-6 pt-28 pb-32 text-center">
          {/* Live badge */}
          <div className="hero-fade-in inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 mb-10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Live in {location.city}</span>
          </div>

          {/* Pulse strip — live counters per visitor's city */}
          <HeroPulse city={location.city} country={location.country} />

          {/* Main headline with stagger animation */}
          <h1 className="hero-title-1 text-5xl sm:text-6xl md:text-7xl lg:text-[5.8rem] font-extrabold leading-[0.95] mb-3 tracking-[-0.04em]">
            <span className="text-white">AI creates the project.</span>
          </h1>
          <h1 className="hero-title-2 text-5xl sm:text-6xl md:text-7xl lg:text-[5.8rem] font-extrabold leading-[0.95] mb-8 tracking-[-0.04em]">
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              You bring the talent.
            </span>
          </h1>

          <p className="hero-fade-in text-lg sm:text-xl text-white/40 max-w-xl mx-auto mb-12 leading-relaxed font-light" style={{ animationDelay: '0.6s' }}>
            AI generates creative briefs and matches local teams of film, music &amp; entertainment pros to bring them to life.
          </p>

          {/* CTAs */}
          <div className="hero-fade-in flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.8s' }}>
            <Link
              href="/signup"
              className="group relative bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-4 rounded-xl font-bold hover:shadow-[0_0_40px_rgba(245,183,49,0.3)] transition-all duration-300 text-black text-center overflow-hidden"
            >
              <span className="relative z-10">Get Started Free →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/pricing"
              className="bg-white/[0.04] border border-white/[0.1] px-10 py-4 rounded-xl font-bold hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-center backdrop-blur-sm"
            >
              See Pricing
            </Link>
          </div>

          {/* Trust row */}
          <div className="hero-fade-in flex flex-wrap items-center justify-center gap-8 mt-16" style={{ animationDelay: '1s' }}>
            {[
              { num: '500+', label: 'Creatives' },
              { num: '120+', label: 'Projects' },
              { num: '4.9★', label: 'Rating' },
              { num: '3', label: 'Cities' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold text-white/70">{s.num}</div>
                <div className="text-[10px] text-white/25 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
      </section>

      {/* ─── COMPANY BAR — social proof ─── */}
      {proCompanies.length > 0 && (
        <div className="border-t border-white/5 py-8 px-6">
          <p className="text-center text-white/20 text-xs uppercase tracking-widest mb-5">Creatives from</p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 max-w-4xl mx-auto">
            {proCompanies.slice(0, 10).map(company => (
              <span key={company} className="text-white/25 text-sm font-medium">{company}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── LIVE ACTIVITY — real matching happening ─── */}
      {matchedActivity.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-white/40">Live matching</span>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {matchedActivity.slice(0, 6).map((match, i) => (
              <Link key={i} href={`/projects/${match.project.id}`} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 hover:border-white/10 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                  {match.professional.photo_url ? (
                    <img src={match.professional.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    match.professional.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-medium text-white/70">{match.professional.name}</span>
                  <span className="text-white/25"> {match.action} </span>
                  <span className="text-amber-400/80">{match.project.title}</span>
                  {match.score >= 75 && <span className="text-green-400 ml-1">— {match.score}%</span>}
                </div>
                <span className="text-white/10 text-[10px] flex-shrink-0">{match.timeAgo}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── ACTIVITY TICKER ─── */}
      <div className="relative border-t border-b border-white/5 bg-white/[0.02] overflow-hidden py-3" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
        <div className="ticker-track flex whitespace-nowrap">
          {[...getTickerItems(location, cities), ...getTickerItems(location, cities)].map((item, i) => (
            <span key={i} className="inline-block px-8 text-sm text-white/40">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED PROJECTS ─── */}
      <section id="projects" className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Live Projects</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Happening right now</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Real creative projects with real teams. Every one started as an AI-generated brief.</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.15}>
          {(liveProjects.length > 0 ? liveProjects.map((project) => {
            const statusStyles: Record<string, string> = {
              recruiting: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
              in_production: 'bg-green-400/20 text-green-300 border-green-400/30',
              post_production: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
              completed: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
            }
            const statusLabels: Record<string, string> = {
              recruiting: 'Casting Now',
              in_production: 'In Production',
              post_production: 'Post-Production',
              completed: 'Completed',
            }
            const streamImages: Record<string, string> = {
              'Film & Video': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600',
              'Music': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',
              'Fashion & Modelling': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600',
              'Visual Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600',
              'Performing Arts': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600',
              'Events & Live': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
              'Influencer & Content': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
              'Brands & Businesses': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
            }
            const roleEmojis: Record<string, string> = {
              Director: '🎬', Cinematographer: '📷', Editor: '✂️', Sound: '🎵',
              Producer: '📋', Writer: '📝', Actor: '🎭', Art: '🎨',
            }

            return (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={streamImages[project.stream] || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600'}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                    <div className={`absolute top-3 right-3 ${statusStyles[project.status] || statusStyles.recruiting} border text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm`}>
                      {statusLabels[project.status] || project.status}
                    </div>
                    <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium px-3 py-1 rounded-full">
                      {project.stream}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                    <p className="text-sm text-white/40 mb-4">{project.genre} • {project.location} • {project.timeline}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.roles?.slice(0, 5).map((r, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#030712] flex items-center justify-center text-sm">
                            {roleEmojis[r.role] || '👤'}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-white/30">{project.filledRoles}/{project.teamSize} joined</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          }) : getFeaturedProjects(cities).map((project) => (
            <div
              key={project.title}
              className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                <div className={`absolute top-3 right-3 ${project.statusColor} border text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm`}>
                  {project.status}
                </div>
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium px-3 py-1 rounded-full">
                  {project.genre}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                <p className="text-sm text-white/40 mb-4">{project.subgenre} • {project.location} • {project.timeline}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.avatars.map((av, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#030712] flex items-center justify-center text-sm">{av}</div>
                    ))}
                  </div>
                  <span className="text-xs text-white/30">{project.team} team members</span>
                </div>
              </div>
            </div>
          )))}
        </StaggerContainer>
      </section>

      {/* ─── HOW IT ACTUALLY WORKS ─── */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">How it actually works</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">From AI brief to real production</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">Four steps. No gatekeepers. No endless applications.</p>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Steps */}
            <div className="grid md:grid-cols-2 gap-6 flex-1">
              {/* Step 1 — AI Brief */}
              <div className="relative group">
                <div className="text-xs font-mono font-bold text-amber-400 mb-3">STEP 01</div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-3">AI Generates a Brief</h3>
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] text-xs space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      <span className="text-amber-300 font-semibold">New Brief</span>
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
                <div className="text-xs font-mono font-bold text-amber-400 mb-3">STEP 02</div>
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
                    <p className="text-white/60 leading-relaxed">&quot;Neon Nights&quot; needs a <span className="text-amber-300 font-medium">cinematographer</span> in Manchester</p>
                    <button className="mt-3 w-full bg-purple-500/20 text-purple-300 py-2 rounded-lg text-xs font-semibold border border-purple-500/20">
                      View Project →
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 — Team */}
              <div className="relative group">
                <div className="text-xs font-mono font-bold text-amber-400 mb-3">STEP 03</div>
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
                <div className="text-xs font-mono font-bold text-amber-400 mb-3">STEP 04</div>
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
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">AI in Action</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Watch the AI create</h2>
          </div>
        </FadeIn>

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
                  <span className="text-white/80 font-medium">{location.city}, {location.country}</span>
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
        <FadeIn>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">From the Community</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Creatives who shipped</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Real people. Real projects. Real credits.</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.1}>
          {getTestimonials(cities).map((t) => (
            <StaggerItem key={t.name}>
            <TiltCard
              className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-transparent transition-all duration-500 testimonial-card"
              maxTilt={3}
            >
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
                </div>

                {/* Quote */}
                <p className="text-white/60 leading-relaxed text-sm mb-5">&ldquo;{t.quote}&rdquo;</p>

                {/* Project credit badge */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                  <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded-full font-medium">🎬 {t.project}</span>
                  <span className="text-[10px] text-white/25">{t.credits} {t.credits === 1 ? 'credit' : 'credits'} on ShowBizy</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role} • {t.city}</p>
                  </div>
                </div>
              </div>
            </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ─── INDUSTRY JOBS ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">🔥 Industry Jobs</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-3">Real entertainment jobs</h2>
              <p className="text-white/50 text-lg max-w-lg">Live opportunities from BBC, Netflix, Channel 4, Framestore, and more. Pro members get full access.</p>
            </div>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 font-medium transition text-sm flex items-center gap-1">
            View all jobs →
          </Link>
        </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
          {featuredJobs.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/3 mb-4" />
                <div className="flex gap-3"><div className="h-3 bg-white/5 rounded w-16" /><div className="h-3 bg-white/5 rounded w-20" /></div>
              </div>
            ))
          ) : featuredJobs.map((job) => {
            const catColor: Record<string, string> = {
              Film: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
              TV: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
              Music: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
            }
            return (
              <Link href="/jobs" key={job.id}>
                <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300 h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm font-bold">{job.title}</h3>
                      <p className="text-xs text-amber-400 font-medium mt-0.5">{job.company}</p>
                    </div>
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${catColor[job.category] || 'bg-white/10 text-white/50 border-white/10'}`}>
                      {job.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-white/40">
                    <span>📍 {job.location}</span>
                    <span>💰 {job.salary}</span>
                    <span>💼 {job.type}</span>
                    <span>🕐 {job.posted}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-white/25">
                    <span>🔒</span>
                    <span>Pro members can view details &amp; apply</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </StaggerContainer>

        <FadeIn delay={0.3}>
          <div className="text-center mt-8">
            <Link href="/jobs" className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 rounded-xl font-bold text-sm text-black hover:opacity-90 transition shadow-lg shadow-amber-500/25">
              View All Jobs →
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ─── PRICING TEASER ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Plans starting from <span className="text-white font-bold">{formatPrice(PRICING[location.currency.code].free, location.currency.code)}/month</span></p>
          <Link href="/pricing" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition text-lg">
            View pricing plans →
          </Link>
        </div>
      </section>

      {/* ─── JOIN NOW CTA ─── */}
      <FadeIn>
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-3xl p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to create something amazing?</h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of creatives already on ShowBizy. Get matched to real projects in your city.
            </p>
            <Link href="/signup" className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-4 rounded-xl font-bold text-lg text-black hover:opacity-90 transition shadow-lg shadow-amber-500/25">
              Create Your Free Profile →
            </Link>
            <p className="text-white/40 text-sm mt-4">
              Pro features from <Link href="/pricing" className="text-amber-400 hover:text-amber-300 font-semibold transition">{formatPrice(PRICING[location.currency.code].pro, location.currency.code)}/month</Link>
            </p>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* ─── FAQ ─── */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Got questions?</h2>
        </div>
        <div className="space-y-4">
          {getFaqItems(location.city, location.currency.code).map((item, i) => (
            <div
              key={i}
              className={`bg-white/[0.03] border rounded-2xl transition-all duration-300 overflow-hidden ${
                openFaq === i ? 'border-amber-500/40' : 'border-white/[0.06]'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className={`font-semibold text-lg transition-colors ${openFaq === i ? 'text-amber-400' : 'text-white/80'}`}>
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
            <Image src="/logo.png" alt="ShowBizy" width={160} height={46} style={{ height: 40, width: 'auto' }} unoptimized />
          </div>
          <p className="text-white/30 text-sm">
            © 2026 ShowBizy.ai — AI creates the project. You bring the talent.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center">
            <Link href="/pricing" className="text-white/40 hover:text-white transition">Pricing</Link>
            <Link href="/jobs" className="text-white/40 hover:text-white transition">Jobs</Link>
            <Link href="/support" className="text-white/40 hover:text-white transition">Support</Link>
            <Link href="/privacy" className="text-white/40 hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="text-white/40 hover:text-white transition">Terms</Link>
            <Link href="mailto:admin@showbizy.ai" className="text-white/40 hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
