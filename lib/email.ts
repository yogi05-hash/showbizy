import nodemailer from 'nodemailer'

// ─── Shared Transporter ────────────────────────────────────────────────────
export const transporter = nodemailer.createTransport({
  host: (process.env.ZOHO_SMTP_HOST || 'smtppro.zoho.eu').trim(),
  port: 465,
  secure: true,
  auth: {
    user: (process.env.ZOHO_EMAIL || 'admin@showbizy.ai').trim(),
    pass: (process.env.ZOHO_APP_PASSWORD || '').trim(),
  },
})

const BASE_URL = 'https://showbizy.ai'
const FROM = '"ShowBizy AI" <admin@showbizy.ai>'
const FOOTER_TEXT = '\n— ShowBizy\nhttps://showbizy.ai'
const FOOTER_HTML = '<p style="color:#999;font-size:12px;margin-top:24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#999;">showbizy.ai</a></p>'

// All emails use this plain wrapper to avoid spam filters
function plainHtml(body: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:560px;">${body}${FOOTER_HTML}</div>`
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface EmailUser {
  name: string
  email: string
  streams?: string[]
  skills?: string[]
  city?: string
  availability?: string
  portfolio?: string
}

interface EmailProject {
  id: string
  title: string
  stream?: string
  genre?: string
  location?: string
  timeline?: string
  description?: string
  roles?: { role: string; filled?: boolean }[]
}

interface EmailMember {
  name: string
  email?: string
  skills?: string[]
  portfolio?: string
  avatar?: string
}

interface WeeklyStats {
  matchCount: number
  activeProjects: number
  newMembers: number
  trendingProjects: { title: string; id: string }[]
}

// ─── Message throttle tracking (in-memory) ─────────────────────────────────
const messageThrottle: Record<string, number> = {}
const THROTTLE_MS = 5 * 60 * 1000

// ─── 1. Welcome Email ─────────────────────────────────────────────────────
export async function sendWelcomeEmail(user: EmailUser): Promise<void> {
  const streamsList = (user.streams || []).join(', ') || 'Not set'
  const skillsList = (user.skills || []).join(', ') || 'Not set'

  const text = `Hey ${user.name},

Welcome to ShowBizy! Your profile is live and our AI is scanning ${user.city || 'your area'} for projects.

Here's your profile:
- Location: ${user.city || 'Not set'}
- Streams: ${streamsList}
- Skills: ${skillsList}

Our AI will match you to projects within 48 hours. In the meantime, you can browse what's live: ${BASE_URL}/projects

Quick question — what kind of projects are you most interested in? Just reply to this email and I'll make sure our AI prioritises the right matches for you.

${BASE_URL}/dashboard${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Welcome to ShowBizy! Your profile is live and our AI is scanning <strong>${user.city || 'your area'}</strong> for projects.</p>
<p>Here's your profile:</p>
<p>Location: ${user.city || 'Not set'}<br>Streams: ${streamsList}<br>Skills: ${skillsList}${user.portfolio ? `<br>Portfolio: <a href="${user.portfolio}">${user.portfolio}</a>` : ''}</p>
<p>Our AI will match you to projects within 48 hours. In the meantime, you can <a href="${BASE_URL}/projects">browse what's live</a>.</p>
<p><strong>Quick question</strong> — what kind of projects are you most interested in? Just reply to this email and I'll make sure our AI prioritises the right matches for you.</p>
<p><a href="${BASE_URL}/dashboard">Go to your dashboard</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `Welcome to ShowBizy, ${user.name}`, text, html })
}

// ─── 2. Project Matched ───────────────────────────────────────────────────
export async function sendProjectMatchedEmail(user: EmailUser, project: EmailProject): Promise<void> {
  const rolesNeeded = (project.roles || []).filter(r => !r.filled).map(r => r.role).join(', ') || 'Various'

  const text = `Hey ${user.name},

Our AI found a project that matches your skills:

${project.title}
Genre: ${project.genre || 'N/A'}
Location: ${project.location || 'N/A'}
Timeline: ${project.timeline || 'N/A'}
Roles needed: ${rolesNeeded}

${project.description ? project.description.slice(0, 200) : ''}

View project: ${BASE_URL}/projects/${project.id}${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Our AI found a project that matches your skills:</p>
<p><strong>${project.title}</strong><br>Genre: ${project.genre || 'N/A'}<br>Location: ${project.location || 'N/A'}<br>Timeline: ${project.timeline || 'N/A'}<br>Roles needed: ${rolesNeeded}</p>
${project.description ? `<p>${project.description.slice(0, 200)}</p>` : ''}
<p><a href="${BASE_URL}/projects/${project.id}">View project</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `New project match: ${project.title}`, text, html })
}

// ─── 3. Team Member Joined ────────────────────────────────────────────────
export async function sendTeamMemberJoinedEmail(teamMembers: EmailMember[], newMember: EmailMember, project: EmailProject): Promise<void> {
  const memberSkills = (newMember.skills || []).join(', ') || 'Not listed'

  const text = `${newMember.name} just joined ${project.title}!

Skills: ${memberSkills}
${newMember.portfolio ? `Portfolio: ${newMember.portfolio}` : ''}

Your team now has ${teamMembers.length + 1} members.

View project: ${BASE_URL}/projects/${project.id}${FOOTER_TEXT}`

  const html = plainHtml(`
<p><strong>${newMember.name}</strong> just joined <strong>${project.title}</strong>!</p>
<p>Skills: ${memberSkills}${newMember.portfolio ? `<br>Portfolio: <a href="${newMember.portfolio}">${newMember.portfolio}</a>` : ''}</p>
<p>Your team now has <strong>${teamMembers.length + 1}</strong> members.</p>
<p><a href="${BASE_URL}/projects/${project.id}">View project</a></p>`)

  for (const member of teamMembers) {
    if (member.email && member.email !== newMember.email) {
      try {
        await transporter.sendMail({ from: FROM, to: member.email, subject: `${newMember.name} joined ${project.title}`, text, html })
      } catch (err) {
        console.error(`Failed to send team-joined email to ${member.email}:`, err)
      }
    }
  }
}

// ─── 4. Project Invitation ────────────────────────────────────────────────
export async function sendProjectInvitationEmail(user: EmailUser, project: EmailProject, invitedBy: string): Promise<void> {
  const rolesNeeded = (project.roles || []).filter(r => !r.filled).map(r => r.role).join(', ') || 'Various'

  const text = `Hey ${user.name},

${invitedBy} thinks you'd be perfect for this project and has invited you to join.

${project.title}
Genre: ${project.genre || 'N/A'}
Location: ${project.location || 'N/A'}
Roles needed: ${rolesNeeded}

Accept: ${BASE_URL}/projects/${project.id}?action=accept
Decline: ${BASE_URL}/projects/${project.id}?action=decline${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p><strong>${invitedBy}</strong> thinks you'd be perfect for this project and has invited you to join.</p>
<p><strong>${project.title}</strong><br>Genre: ${project.genre || 'N/A'}<br>Location: ${project.location || 'N/A'}<br>Roles needed: ${rolesNeeded}</p>
<p><a href="${BASE_URL}/projects/${project.id}?action=accept">Accept invitation</a> | <a href="${BASE_URL}/projects/${project.id}?action=decline">Decline</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `You've been invited to join ${project.title}`, text, html })
}

// ─── 5. Project Milestone ─────────────────────────────────────────────────
const MILESTONE_NEXT: Record<string, string> = {
  'Pre-production': 'Production — Time to start shooting!',
  'Production': 'Post-production — Editing, VFX, and sound design',
  'Post-production': 'Published — Ready for the world!',
  'Published': 'Your project is live!',
}

export async function sendProjectMilestoneEmail(teamMembers: EmailMember[], project: EmailProject, milestone: string): Promise<void> {
  const whatsNext = MILESTONE_NEXT[milestone] || 'Keep pushing forward!'

  const text = `${project.title} just moved to a new phase!

Current phase: ${milestone}
What's next: ${whatsNext}

View project: ${BASE_URL}/projects/${project.id}${FOOTER_TEXT}`

  const html = plainHtml(`
<p><strong>${project.title}</strong> just moved to a new phase!</p>
<p>Current phase: <strong>${milestone}</strong><br>What's next: ${whatsNext}</p>
<p><a href="${BASE_URL}/projects/${project.id}">View project</a></p>`)

  for (const member of teamMembers) {
    if (member.email) {
      try {
        await transporter.sendMail({ from: FROM, to: member.email, subject: `${project.title} moved to ${milestone}`, text, html })
      } catch (err) {
        console.error(`Failed to send milestone email to ${member.email}:`, err)
      }
    }
  }
}

// ─── 6. New Message (with throttle) ───────────────────────────────────────
export async function sendNewMessageEmail(user: EmailUser, sender: { name: string }, project: EmailProject, messagePreview: string): Promise<{ sent: boolean; throttled: boolean }> {
  const throttleKey = `${user.email}:${project.id}`
  const lastSent = messageThrottle[throttleKey] || 0
  if (Date.now() - lastSent < THROTTLE_MS) return { sent: false, throttled: true }

  const preview = messagePreview.length > 200 ? messagePreview.slice(0, 200) + '...' : messagePreview

  const text = `Hey ${user.name},

New message from ${sender.name} in ${project.title}:

"${preview}"

Reply: ${BASE_URL}/projects/${project.id}?tab=chat${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>New message from <strong>${sender.name}</strong> in <strong>${project.title}</strong>:</p>
<blockquote style="border-left:3px solid #ddd;padding-left:12px;margin:12px 0;color:#555;">${preview}</blockquote>
<p><a href="${BASE_URL}/projects/${project.id}?tab=chat">Reply in ShowBizy</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `New message from ${sender.name} in ${project.title}`, text, html })
  messageThrottle[throttleKey] = Date.now()
  return { sent: true, throttled: false }
}

// ─── 7. Weekly Digest ─────────────────────────────────────────────────────
export async function sendWeeklyDigestEmail(user: EmailUser, stats: WeeklyStats): Promise<void> {
  const trendingList = stats.trendingProjects.map(p => `- ${p.title}: ${BASE_URL}/projects/${p.id}`).join('\n')
  const trendingHtml = stats.trendingProjects.map(p => `<li><a href="${BASE_URL}/projects/${p.id}">${p.title}</a></li>`).join('')

  const text = `Hey ${user.name},

Your weekly ShowBizy roundup:

- ${stats.matchCount} new project matches
- ${stats.activeProjects} active projects
- ${stats.newMembers} new members near you

${stats.trendingProjects.length > 0 ? `Trending:\n${trendingList}` : ''}

Browse projects: ${BASE_URL}/projects${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Your weekly ShowBizy roundup:</p>
<ul><li><strong>${stats.matchCount}</strong> new project matches</li><li><strong>${stats.activeProjects}</strong> active projects</li><li><strong>${stats.newMembers}</strong> new members near you</li></ul>
${stats.trendingProjects.length > 0 ? `<p><strong>Trending:</strong></p><ul>${trendingHtml}</ul>` : ''}
<p><a href="${BASE_URL}/projects">Browse projects</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `Your ShowBizy week: ${stats.matchCount} new matches`, text, html })
}

// ─── 8. Weekly Digest for Cron ────────────────────────────────────────────
interface DigestProject { id: string; title: string; stream: string; location: string }
interface DigestJob { id: string; title: string; company: string; location: string; salary: string }

export async function sendCronWeeklyDigest(
  user: { name: string; email: string; is_pro?: boolean },
  projects: DigestProject[], jobs: DigestJob[],
  stats: { totalNewProjects: number; totalNewJobs: number }
): Promise<void> {
  const projectsList = projects.map(p => `- ${p.title} (${p.stream}, ${p.location})\n  ${BASE_URL}/projects/${p.id}`).join('\n')
  const jobsList = jobs.map(j => `- ${j.title} at ${j.company} — ${j.salary}\n  ${BASE_URL}/jobs/${j.id}`).join('\n')
  const proCta = user.is_pro ? '' : `\n\nUpgrade to Pro to apply: ${BASE_URL}/upgrade`

  const text = `Hey ${user.name},

This week on ShowBizy: ${stats.totalNewProjects} new projects, ${stats.totalNewJobs} real jobs.

${projects.length > 0 ? `NEW PROJECTS:\n${projectsList}` : ''}
${jobs.length > 0 ? `\nREAL JOBS:\n${jobsList}` : ''}${proCta}

Browse all: ${BASE_URL}/projects${FOOTER_TEXT}`

  const projectsHtml = projects.map(p => `<li><a href="${BASE_URL}/projects/${p.id}"><strong>${p.title}</strong></a> — ${p.stream}, ${p.location}</li>`).join('')
  const jobsHtml = jobs.map(j => `<li><a href="${BASE_URL}/jobs/${j.id}"><strong>${j.title}</strong> at ${j.company}</a> — ${j.salary}</li>`).join('')
  const proCtaHtml = user.is_pro ? '' : `<p style="margin-top:16px;padding:12px;background:#f8f8f8;border-radius:8px;">Upgrade to Pro to apply to all projects and jobs. <a href="${BASE_URL}/upgrade">View plans</a></p>`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>This week on ShowBizy: <strong>${stats.totalNewProjects} new projects</strong>, <strong>${stats.totalNewJobs} real jobs</strong>.</p>
${projects.length > 0 ? `<p><strong>New Projects</strong></p><ul>${projectsHtml}</ul>` : ''}
${jobs.length > 0 ? `<p><strong>Real Jobs</strong></p><ul>${jobsHtml}</ul>` : ''}
${proCtaHtml}
<p><a href="${BASE_URL}/projects">Browse all projects</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `Your ShowBizy week: ${stats.totalNewProjects} new projects`, text, html })
}

// ─── 9. Pro Upgrade Confirmation ──────────────────────────────────────────
export async function sendProUpgradeEmail(user: { name: string; email: string }, amountPaid?: string): Promise<void> {
  const amount = amountPaid || '£9/month'

  const text = `Hey ${user.name},

Welcome to ShowBizy Pro! Your upgrade is confirmed.

What's unlocked:
- Unlimited project applications
- Priority AI matching
- Apply to real industry jobs
- Upload CV + send cover letters
- Weekly curated project digest

Payment: ${amount} — Confirmed

Manage your subscription from your dashboard.

Go to dashboard: ${BASE_URL}/dashboard${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Welcome to <strong>ShowBizy Pro</strong>! Your upgrade is confirmed.</p>
<p><strong>What's unlocked:</strong></p>
<ul><li>Unlimited project applications</li><li>Priority AI matching</li><li>Apply to real industry jobs</li><li>Upload CV + send cover letters</li><li>Weekly curated project digest</li></ul>
<p>Payment: <strong>${amount}</strong> — Confirmed</p>
<p>You can manage your subscription anytime from your dashboard. Cancel anytime.</p>
<p><a href="${BASE_URL}/dashboard">Go to dashboard</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `You're now a ShowBizy Pro member`, text, html })
}

// ─── 10. Studio Upgrade Email ─────────────────────────────────────────────
export async function sendStudioUpgradeEmail(user: { name: string; email: string }, amountPaid?: string): Promise<void> {
  const amount = amountPaid || '£29/month'

  const text = `Hey ${user.name},

Welcome to ShowBizy Studio! You can now post your own creative projects.

What's unlocked:
- Post your own creative projects
- AI auto-matches you with the right talent
- Manage applications in your Studio dashboard
- Verified Studio badge on your profile
- Featured placement in browse

Payment: ${amount} — Confirmed

Post your first project: ${BASE_URL}/studio/post-project${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Welcome to <strong>ShowBizy Studio</strong>! You can now post your own creative projects.</p>
<p><strong>What's unlocked:</strong></p>
<ul><li>Post your own creative projects</li><li>AI auto-matches you with the right talent</li><li>Manage applications in your Studio dashboard</li><li>Verified Studio badge on your profile</li><li>Featured placement in browse</li></ul>
<p>Payment: <strong>${amount}</strong> — Confirmed</p>
<p><a href="${BASE_URL}/studio/post-project">Post your first project</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `Welcome to ShowBizy Studio`, text, html })
}

// ─── 11. Drip Sequence Emails ─────────────────────────────────────────────

interface DripProject { id: string; title: string; stream: string; location: string }

export async function sendDripDay1(user: { name: string; email: string; city?: string }): Promise<void> {
  const city = user.city || 'your area'
  const text = `Hey ${user.name},

Welcome to ShowBizy! Our AI is now scanning ${city} for creative projects that match your skills.

What happens next:
- We generate new AI projects in your area every day
- When a project matches your skills, you'll be the first to know
- Pro members can apply directly and get priority matching

Browse projects: ${BASE_URL}/projects${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Welcome to ShowBizy! Our AI is now scanning <strong>${city}</strong> for creative projects that match your skills.</p>
<p>What happens next:</p>
<ul><li>We generate new AI projects in your area every day</li><li>When a project matches your skills, you'll be the first to know</li><li>Pro members can apply directly and get priority matching</li></ul>
<p><a href="${BASE_URL}/projects">Browse projects</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `${user.name}, our AI is scanning ${city} for you`, text, html })
}

export async function sendDripDay3(user: { name: string; email: string; city?: string }, matchedProjects: DripProject[]): Promise<void> {
  const city = user.city || 'your area'
  const count = matchedProjects.length
  const listText = matchedProjects.slice(0, 3).map(p => `- ${p.title} (${p.stream}, ${p.location})\n  ${BASE_URL}/projects/${p.id}`).join('\n')
  const listHtml = matchedProjects.slice(0, 3).map(p => `<li><strong>${p.title}</strong> — ${p.stream}, ${p.location}<br><a href="${BASE_URL}/projects/${p.id}">View project</a></li>`).join('')

  const text = `Hey ${user.name},

Our AI found ${count} project${count > 1 ? 's' : ''} in ${city} that match your skills:

${listText}

Upgrade to Pro to apply: ${BASE_URL}/upgrade${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Our AI found <strong>${count} project${count > 1 ? 's' : ''}</strong> in ${city} that match your skills:</p>
<ul>${listHtml}</ul>
<p>Upgrade to Pro to apply and get priority matching. <a href="${BASE_URL}/upgrade">View plans</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `${count} project${count > 1 ? 's' : ''} found for you in ${city}`, text, html })
}

export async function sendDripDay7(user: { name: string; email: string; city?: string }, totalMatches: number, topProjects: DripProject[]): Promise<void> {
  const city = user.city || 'your area'
  const listHtml = topProjects.slice(0, 3).map(p => `<li><strong>${p.title}</strong> — ${p.stream}, ${p.location}</li>`).join('')

  const text = `Hey ${user.name},

In the last week, our AI matched you to ${totalMatches} projects in ${city}. But as a free member, you can't apply to any of them.

Pro members get:
- Apply to all AI-generated projects
- Apply to real industry jobs
- Priority AI matching
- Upload CV + send cover letters

Upgrade now: ${BASE_URL}/upgrade${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>In the last week, our AI matched you to <strong>${totalMatches} projects</strong> in ${city}. But as a free member, you can't apply to any of them.</p>
<ul>${listHtml}</ul>
<p>Pro members get:</p>
<ul><li>Apply to all AI-generated projects</li><li>Apply to real industry jobs</li><li>Priority AI matching</li><li>Upload CV + send cover letters</li></ul>
<p><a href="${BASE_URL}/upgrade">Upgrade to Pro</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `${user.name}, you've been matched to ${totalMatches} projects`, text, html })
}

export async function sendDripDay14(user: { name: string; email: string; city?: string }, totalMatches: number, closingProjects: DripProject[]): Promise<void> {
  const city = user.city || 'your area'
  const listHtml = closingProjects.slice(0, 3).map(p => `<li><strong>${p.title}</strong> — ${p.stream}, ${p.location}</li>`).join('')

  const text = `Hey ${user.name},

You've been on ShowBizy for 2 weeks. Our AI has matched you to ${totalMatches} projects in ${city}. Several are closing soon.

Pro members are already applying. Don't let the right opportunity pass.

Upgrade now: ${BASE_URL}/upgrade${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>You've been on ShowBizy for 2 weeks. Our AI has matched you to <strong>${totalMatches} projects</strong> in ${city}.</p>
<p><strong>Several are closing soon:</strong></p>
<ul>${listHtml}</ul>
<p>Pro members are already applying. Don't let the right opportunity pass.</p>
<p><a href="${BASE_URL}/upgrade">Upgrade to Pro</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `${totalMatches} projects closing soon in ${city}`, text, html })
}

// ─── 12. Trial ending reminder ────────────────────────────────────────────
// Fires from the Stripe webhook `customer.subscription.trial_will_end`
// (~3 days before trial end). Last nudge before the first charge.
export async function sendTrialEndingEmail(
  user: { name: string; email: string },
  trialEndsAt: string
): Promise<void> {
  const endDate = new Date(trialEndsAt).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const text = `Hey ${user.name},

Your ShowBizy Pro trial ends on ${endDate} — that's when your first £9 payment goes through.

No action needed if you want to keep Pro. Our AI will continue matching you to projects, you'll keep applying to real industry jobs, and we'll keep the weekly digests coming.

If you want to cancel before the charge, open the billing portal from your dashboard.

Manage subscription: ${BASE_URL}/dashboard${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Your ShowBizy Pro trial ends on <strong>${endDate}</strong> — that's when your first £9 payment goes through.</p>
<p><strong>No action needed</strong> if you want to keep Pro. Our AI will continue matching you to projects, you'll keep applying to real industry jobs, and we'll keep the weekly digests coming.</p>
<p>If you want to cancel before the charge, open the billing portal from your dashboard.</p>
<p><a href="${BASE_URL}/dashboard">Manage subscription</a></p>`)

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Your ShowBizy Pro trial ends ${endDate}`,
    text,
    html,
  })
}

export async function sendMatchConversionEmail(user: { name: string; email: string }, project: DripProject): Promise<void> {
  const text = `Hey ${user.name},

Our AI just matched you to a new project:

${project.title}
Stream: ${project.stream}
Location: ${project.location}

This project needs someone with your skills. Upgrade to Pro to apply.

Upgrade: ${BASE_URL}/upgrade${FOOTER_TEXT}`

  const html = plainHtml(`
<p>Hey ${user.name},</p>
<p>Our AI just matched you to a new project:</p>
<p style="padding:12px;background:#f8f8f8;border-radius:8px;border-left:3px solid #7c3aed;"><strong>${project.title}</strong><br>${project.stream} — ${project.location}</p>
<p>This project needs someone with your skills. <a href="${BASE_URL}/upgrade">Upgrade to Pro to apply</a></p>`)

  await transporter.sendMail({ from: FROM, to: user.email, subject: `You matched "${project.title}" — upgrade to apply`, text, html })
}
