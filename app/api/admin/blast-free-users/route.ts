import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST() {
  try {
    // Fetch ALL free users (not pro, not studio)
    const { data: users, error } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, email, city, streams, skills, is_pro, plan')
      .not('email', 'is', null)

    if (error || !users?.length) {
      return NextResponse.json({ error: 'No users found', details: error }, { status: 500 })
    }

    // Filter to free users only
    const freeUsers = users.filter(u => !u.is_pro && (!u.plan || u.plan === 'free'))

    // Fetch recent projects to show in email
    const { data: projects } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location')
      .eq('status', 'recruiting')
      .order('created_at', { ascending: false })
      .limit(10)

    let sent = 0
    let failed = 0
    const results: { email: string; status: string; error?: string }[] = []

    for (const user of freeUsers) {
      const city = user.city || 'your area'
      const userStreams: string[] = user.streams || []

      // Find projects matching user's city or streams
      const matched = (projects || []).filter((p: { location?: string; stream?: string }) => {
        const cityMatch = city && (p.location || '').toLowerCase().includes(city.split(',')[0].trim().toLowerCase())
        const streamMatch = userStreams.length > 0 && userStreams.includes(p.stream || '')
        return cityMatch || streamMatch
      })

      const projectCount = matched.length || (projects || []).length
      const topProjects = (matched.length > 0 ? matched : (projects || [])).slice(0, 3)

      const projectListText = topProjects.map((p: { title: string; stream: string; location: string }) =>
        `- ${p.title} (${p.stream}, ${p.location})`
      ).join('\n')

      const projectListHtml = topProjects.map((p: { title: string; stream: string; location: string; id: string }) =>
        `<li style="margin-bottom:6px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}</li>`
      ).join('')

      try {
        const result = await transporter.sendMail({
          from: '"ShowBizy AI" <admin@showbizy.ai>',
          to: user.email,
          subject: `${user.name}, ${projectCount} projects in ${city} need your skills`,
          text: `Hey ${user.name},

Our AI found ${projectCount} creative projects in ${city} that match your skills:

${projectListText}

You've been matched — but you need Pro to see your match score and apply.

What Pro gives you:
- Apply to all AI-generated projects
- Apply to real industry jobs (BBC, Netflix, etc.)
- AI skill matching based on your actual skills
- Priority matching when new projects drop

Upgrade to Pro: https://showbizy.ai/upgrade

Quick question — what kind of projects are you most interested in? Just reply to this email.

— ShowBizy
https://showbizy.ai`,
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:560px;">
<p>Hey ${user.name},</p>
<p>Our AI found <strong>${projectCount} creative projects</strong> in ${city} that match your skills:</p>
<ul style="padding-left:20px;">${projectListHtml}</ul>
<p>You've been matched — but you need Pro to see your match score and apply.</p>
<p><strong>What Pro gives you:</strong></p>
<ul>
<li>Apply to all AI-generated projects</li>
<li>Apply to real industry jobs (BBC, Netflix, etc.)</li>
<li>AI skill matching based on your actual skills</li>
<li>Priority matching when new projects drop</li>
</ul>
<p><a href="https://showbizy.ai/upgrade">Upgrade to Pro</a></p>
<p>Quick question — what kind of projects are you most interested in? Just reply to this email.</p>
<p style="color:#999;font-size:12px;margin-top:24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#999;">showbizy.ai</a></p>
</div>`,
        })

        sent++
        results.push({ email: user.email, status: 'sent', error: undefined })
        console.log(`[blast] Sent to ${user.email}: ${result.messageId}`)
      } catch (err) {
        failed++
        const msg = err instanceof Error ? err.message : String(err)
        results.push({ email: user.email, status: 'failed', error: msg })
        console.error(`[blast] Failed for ${user.email}:`, msg)
      }

      // Rate limit: 1 second between emails
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return NextResponse.json({
      success: true,
      totalFreeUsers: freeUsers.length,
      sent,
      failed,
      results,
    })
  } catch (error) {
    console.error('Blast error:', error)
    return NextResponse.json({ error: 'Blast failed' }, { status: 500 })
  }
}
