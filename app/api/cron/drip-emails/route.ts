import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  sendDripDay1,
  sendDripDay3,
  sendDripDay7,
  sendDripDay14,
} from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// GET: Vercel cron trigger (runs daily at 8am UTC)
export async function GET() {
  return runDripSequence()
}

// POST: Manual trigger
export async function POST() {
  return runDripSequence()
}

async function runDripSequence() {
  try {
    const now = new Date()
    const results = { day1: 0, day3: 0, day7: 0, day14: 0, errors: 0 }

    // Fetch all FREE users (not pro, not studio) with their signup date
    const { data: freeUsers, error } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, email, city, streams, skills, is_pro, plan, created_at')
      .or('is_pro.is.null,is_pro.eq.false')
      .or('plan.is.null,plan.eq.free')
      .not('email', 'is', null)
      .limit(200)

    if (error || !freeUsers?.length) {
      return NextResponse.json({ message: 'No free users to drip', results })
    }

    for (const user of freeUsers) {
      const signupDate = new Date(user.created_at)
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24))

      try {
        // Day 1 (0-1 days since signup)
        if (daysSinceSignup === 1) {
          await sendDripDay1({
            name: user.name,
            email: user.email,
            city: user.city,
          })
          results.day1++
        }

        // Day 3: Find matching projects for this user
        if (daysSinceSignup === 3) {
          const matchedProjects = await findProjectsForUser(user)
          if (matchedProjects.length > 0) {
            await sendDripDay3(
              { name: user.name, email: user.email, city: user.city },
              matchedProjects
            )
            results.day3++
          }
        }

        // Day 7: Show total matches + FOMO
        if (daysSinceSignup === 7) {
          const { count: matchCount } = await supabaseAdmin
            .from('showbizy_matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          const topProjects = await findProjectsForUser(user)
          const totalMatches = matchCount || topProjects.length || 1

          await sendDripDay7(
            { name: user.name, email: user.email, city: user.city },
            totalMatches,
            topProjects
          )
          results.day7++
        }

        // Day 14: Urgency — closing soon
        if (daysSinceSignup === 14) {
          const { count: matchCount } = await supabaseAdmin
            .from('showbizy_matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          const closingProjects = await findProjectsForUser(user)
          const totalMatches = matchCount || closingProjects.length || 1

          await sendDripDay14(
            { name: user.name, email: user.email, city: user.city },
            totalMatches,
            closingProjects
          )
          results.day14++
        }
      } catch (err) {
        console.error(`Drip email error for ${user.email}:`, err)
        results.errors++
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`[drip] Results: Day1=${results.day1} Day3=${results.day3} Day7=${results.day7} Day14=${results.day14} Errors=${results.errors}`)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Drip sequence error:', error)
    return NextResponse.json({ error: 'Drip sequence failed' }, { status: 500 })
  }
}

// Find recruiting projects matching a user's city or streams
async function findProjectsForUser(user: { city?: string; streams?: string[] }) {
  const userCity = (user.city || '').split(',')[0].trim()

  const { data: projects } = await supabaseAdmin
    .from('showbizy_projects')
    .select('id, title, stream, location')
    .eq('status', 'recruiting')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!projects?.length) return []

  // Filter by city or stream match
  const matched = projects.filter((p: { location?: string; stream?: string }) => {
    const cityMatch = userCity && (p.location || '').toLowerCase().includes(userCity.toLowerCase())
    const streamMatch = user.streams?.length && user.streams.includes(p.stream || '')
    return cityMatch || streamMatch
  })

  // Return matched or fallback to recent
  return (matched.length > 0 ? matched : projects).slice(0, 5).map((p: { id: string; title: string; stream: string; location: string }) => ({
    id: p.id,
    title: p.title,
    stream: p.stream || 'Creative',
    location: p.location || 'Various',
  }))
}
