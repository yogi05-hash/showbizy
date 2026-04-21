import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// POST /api/admin/blast-trial-invite
// Sends a one-off campaign email to every non-Pro user inviting them to
// try Pro free for 7 days. Auth: must pass Authorization: Bearer <CRON_SECRET>
// so the endpoint isn't publicly firable. Supports { dryRun: true } in the
// body to return the target list + sample email WITHOUT sending.
export async function POST(req: NextRequest) {
  // Gate on CRON_SECRET — same shared admin token the real crons use.
  const authHeader = req.headers.get('authorization') || ''
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean; limit?: number }
  const dryRun = !!body.dryRun
  const explicitLimit = typeof body.limit === 'number' ? body.limit : null

  // Fetch every non-Pro user with an email.
  const { data: users, error } = await supabaseAdmin
    .from('showbizy_users')
    .select('id, name, email, city, streams, created_at, is_pro, plan, trial_started_at')
    .not('email', 'is', null)

  if (error) {
    return NextResponse.json({ error: 'DB fetch failed', details: error }, { status: 500 })
  }

  // Only free users. Exclude anyone already on Pro, Studio, or already used the trial.
  const freeUsers = (users || []).filter(u =>
    !u.is_pro &&
    (!u.plan || u.plan === 'free') &&
    !u.trial_started_at
  )

  const targets = explicitLimit ? freeUsers.slice(0, explicitLimit) : freeUsers

  // Grab a few fresh projects to drop into each email as social proof.
  const { data: projects } = await supabaseAdmin
    .from('showbizy_projects')
    .select('id, title, stream, location, created_at')
    .eq('status', 'recruiting')
    .order('created_at', { ascending: false })
    .limit(10)

  const sample = targets[0]
    ? renderEmail(targets[0], projects || [])
    : { subject: '(no users)', text: '', html: '' }

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      targetCount: targets.length,
      targets: targets.slice(0, 5).map(u => ({ name: u.name, email: u.email, city: u.city })),
      sampleSubject: sample.subject,
      sampleText: sample.text,
    })
  }

  let sent = 0
  let failed = 0
  const log: { email: string; status: string; error?: string }[] = []

  for (const user of targets) {
    const { subject, text, html } = renderEmail(user, projects || [])
    try {
      await transporter.sendMail({
        from: '"ShowBizy AI" <admin@showbizy.ai>',
        to: user.email,
        replyTo: 'hello@bilabs.ai',
        subject,
        text,
        html,
      })
      sent++
      log.push({ email: user.email, status: 'sent' })
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      log.push({ email: user.email, status: 'failed', error: msg })
      console.error(`[trial-blast] ${user.email}: ${msg}`)
    }
    // Zoho throttle — 1 email / sec keeps us well under their limits.
    await new Promise(r => setTimeout(r, 1000))
  }

  return NextResponse.json({
    success: true,
    targetCount: targets.length,
    sent,
    failed,
    log: log.slice(0, 50),
  })
}

interface TargetUser {
  name: string
  email: string
  city?: string | null
  streams?: string[] | null
}

interface ProjectLite {
  id: string
  title: string
  stream: string
  location: string
}

function renderEmail(user: TargetUser, projects: ProjectLite[]): { subject: string; text: string; html: string } {
  const firstName = (user.name || '').split(' ')[0] || 'there'
  const city = (user.city || 'your city').split(',')[0].trim() || 'your city'
  const userStreams: string[] = user.streams || []

  // Match projects to the user's city or stream; fall back to global recent.
  const matched = projects.filter(p => {
    const cityMatch = (p.location || '').toLowerCase().includes(city.toLowerCase())
    const streamMatch = userStreams.length > 0 && userStreams.includes(p.stream || '')
    return cityMatch || streamMatch
  })
  const top = (matched.length > 0 ? matched : projects).slice(0, 3)

  const subject = `${firstName}, try ShowBizy Pro free for 7 days · £0 today`

  const listText = top.map(p => `  · ${p.title} (${p.stream}, ${p.location})`).join('\n')
  const listHtml = top.map(p => `<li style="margin-bottom:6px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}</li>`).join('')

  const text = `Hey ${firstName},

Quick update: we just launched a 7-day free Pro trial, and I want you to try it — no charge today, cancel anytime before day 8 and you'll never be billed.

Our AI has been generating projects in ${city}. A few live right now:
${listText}

With Pro you can actually apply to these (free members can only browse). Here's what Pro unlocks during the trial:

  · Apply to every AI-generated project + real industry jobs (BBC, Netflix, etc.)
  · AI skill matching based on what YOU actually do
  · Priority matching when new briefs drop
  · Direct messaging with project leads
  · Featured portfolio placement

Start your 7-day free trial: https://showbizy.ai/pricing

You'll be asked to add a card so we can charge automatically on day 8 if you keep it. Cancel any time before then from your dashboard and pay nothing.

What kind of projects are you most interested in? Reply to this email — I read every one and I'll make sure the matching prioritises them.

— ShowBizy
https://showbizy.ai
`

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.65;max-width:560px;">
<p>Hey ${firstName},</p>
<p>Quick update: we just launched a <strong>7-day free Pro trial</strong>, and I want you to try it — £0 today, cancel anytime before day 8 and you'll never be billed.</p>
<p>Our AI has been generating projects in <strong>${city}</strong>. A few live right now:</p>
<ul style="padding-left:20px;">${listHtml}</ul>
<p>With Pro you can actually apply to these (free members can only browse). Here's what Pro unlocks during the trial:</p>
<ul style="padding-left:20px;">
<li>Apply to every AI-generated project + real industry jobs (BBC, Netflix, etc.)</li>
<li>AI skill matching based on what <em>you</em> actually do</li>
<li>Priority matching when new briefs drop</li>
<li>Direct messaging with project leads</li>
<li>Featured portfolio placement</li>
</ul>
<p style="margin-top:24px;"><a href="https://showbizy.ai/pricing" style="display:inline-block;background:linear-gradient(90deg,#f59e0b,#ea580c);color:#000;font-weight:bold;padding:12px 22px;border-radius:10px;text-decoration:none;">Start 7-day free trial →</a></p>
<p style="color:#666;font-size:13px;">You'll be asked to add a card so we can charge automatically on day 8 if you keep it. Cancel any time before then from your dashboard and pay nothing.</p>
<p>What kind of projects are you most interested in? Reply to this email — I read every one and I'll make sure the matching prioritises them.</p>
<p style="color:#999;font-size:12px;margin-top:24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#999;">showbizy.ai</a></p>
</div>`

  return { subject, text, html }
}
