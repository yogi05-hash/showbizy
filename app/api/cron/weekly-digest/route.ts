import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCronWeeklyDigest } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET: Vercel cron trigger (Monday 9am UTC)
export async function GET() {
  return sendDigests()
}

// POST: Manual trigger
export async function POST() {
  return sendDigests()
}

async function sendDigests() {
  try {
    // Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, email, city, streams, skills, is_pro, plan')
      .not('email', 'is', null)
      .limit(100) // Safety limit

    if (usersError || !users?.length) {
      console.error('Error fetching users for digest:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Fetch new projects from last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: recentProjects } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location, description, created_at')
      .gte('created_at', oneWeekAgo.toISOString())
      .eq('status', 'recruiting')
      .order('created_at', { ascending: false })
      .limit(50)

    // Fetch recent real jobs
    let recentJobs: { id: string; title: string; company: string; location: string; salary: string }[] = []
    try {
      const jobsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://showbizy.ai'}/api/jobs`)
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        recentJobs = (jobsData.jobs || []).slice(0, 20)
      }
    } catch {
      console.error('Failed to fetch jobs for digest')
    }

    const totalNewProjects = recentProjects?.length || 0
    const totalNewJobs = recentJobs.length

    if (totalNewProjects === 0 && totalNewJobs === 0) {
      return NextResponse.json({ message: 'No new content to digest', sent: 0 })
    }

    let sent = 0
    let failed = 0

    for (const user of users) {
      try {
        // Personalize: filter projects matching user's city/streams
        const userCity = (user.city || '').split(',')[0].trim().toLowerCase()
        const userStreams: string[] = user.streams || []

        // Find projects matching user's city or streams
        const matchingProjects = (recentProjects || []).filter((p: { location?: string; stream?: string }) => {
          const projectCity = (p.location || '').toLowerCase()
          const cityMatch = userCity && projectCity.includes(userCity)
          const streamMatch = userStreams.length > 0 && userStreams.includes(p.stream || '')
          return cityMatch || streamMatch
        }).slice(0, 3)

        // If no city/stream matches, show top 3 recent projects
        const projectsToShow = matchingProjects.length > 0
          ? matchingProjects
          : (recentProjects || []).slice(0, 3)

        // Find jobs matching user's city
        const matchingJobs = recentJobs.filter(j => {
          const jobLocation = (j.location || '').toLowerCase()
          return userCity && jobLocation.includes(userCity)
        }).slice(0, 3)

        const jobsToShow = matchingJobs.length > 0
          ? matchingJobs
          : recentJobs.slice(0, 3)

        await sendCronWeeklyDigest(
          {
            name: user.name,
            email: user.email,
            is_pro: user.is_pro || user.plan === 'pro' || user.plan === 'studio',
          },
          projectsToShow.map((p: { id: string; title: string; stream?: string; location?: string }) => ({
            id: p.id,
            title: p.title,
            stream: p.stream || 'Creative',
            location: p.location || 'Various',
          })),
          jobsToShow.map((j: { id: string; title: string; company: string; location: string; salary: string }) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            salary: j.salary,
          })),
          { totalNewProjects, totalNewJobs }
        )

        sent++

        // Rate limit: 500ms between emails to stay within Zoho limits
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (err) {
        console.error(`Failed to send digest to ${user.email}:`, err)
        failed++
      }
    }

    // Notify admin
    try {
      const { transporter } = await import('@/lib/email')
      await transporter.sendMail({
        from: '"ShowBizy AI" <admin@showbizy.ai>',
        to: 'yogibot05@gmail.com, admin@showbizy.ai',
        subject: `Weekly digest sent: ${sent} users, ${failed} failed`,
        headers: { 'X-Priority': '1', 'Importance': 'High' },
        text: `Weekly digest summary:\n\nSent: ${sent}\nFailed: ${failed}\nNew projects this week: ${totalNewProjects}\nReal jobs shown: ${totalNewJobs}\n\nTime: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`,
      })
    } catch {
      console.error('Failed to send digest admin summary')
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      totalNewProjects,
      totalNewJobs,
    })

  } catch (error) {
    console.error('Weekly digest cron error:', error)
    return NextResponse.json({ error: 'Failed to send digests' }, { status: 500 })
  }
}
