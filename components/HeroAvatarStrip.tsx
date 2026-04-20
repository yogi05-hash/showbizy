'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Professional {
  id: string
  name: string
  photo_url: string | null
  title: string
  company: string
  city: string
}

// Stacked avatars of real creatives indexed from showbizy_professionals,
// filtered to the visitor's city. Hides if we can't find at least 4 real
// faces with photos — never shows placeholders or seeded numbers.
export default function HeroAvatarStrip({ city }: { city?: string }) {
  const [pros, setPros] = useState<Professional[] | null>(null)

  useEffect(() => {
    const cityParam = city ? `&city=${encodeURIComponent(city)}` : ''
    fetch(`/api/professionals?limit=10${cityParam}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { professionals?: Professional[] } | null) => {
        if (d?.professionals) {
          // Only keep ones with an actual photo — fallback initials look cheap here.
          const withPhotos = d.professionals.filter(p => !!p.photo_url)
          if (withPhotos.length >= 4) setPros(withPhotos.slice(0, 6))
        }
      })
      .catch(() => {})
  }, [city])

  if (!pros || pros.length < 4) return null

  const visible = pros.slice(0, 4)
  const remaining = Math.max(0, pros.length - 4)
  const firstNames = visible.map(p => (p.name || '').split(' ')[0]).filter(Boolean).slice(0, 2).join(', ')

  return (
    <Link
      href="/creatives"
      className="hero-fade-in inline-flex items-center gap-3 mt-6 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition backdrop-blur-md group"
      style={{ animationDelay: '1.4s' }}
    >
      <div className="flex -space-x-2">
        {visible.map((p) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={p.id}
            src={p.photo_url!}
            alt={p.name}
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover border-2 border-[#030712]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ))}
      </div>
      <span className="text-xs text-white/70">
        <span className="text-white/90 font-medium">{firstNames}</span>
        <span className="text-white/50"> + {remaining}+ creatives</span>
        <span className="text-white/40"> in {city || 'your city'}</span>
        <span className="text-amber-300/80 ml-2 group-hover:text-amber-300 transition">→</span>
      </span>
    </Link>
  )
}
