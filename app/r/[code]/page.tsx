'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// /r/[code] — stash the referral code into localStorage and redirect to /signup.
// Picked up later by the dashboard, which calls /api/referral/redeem once the
// new user has signed in. This avoids touching /signup or /api/signup routes.
export default function ReferralRedirect() {
  const params = useParams<{ code: string }>()
  const router = useRouter()

  useEffect(() => {
    const code = (params?.code || '').toString().toUpperCase().slice(0, 16)
    if (code) {
      try { localStorage.setItem('showbizy_ref', code) } catch {}
    }
    router.replace('/signup')
  }, [params, router])

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
      <p className="text-white/40 text-sm">Redirecting to sign up…</p>
    </div>
  )
}
