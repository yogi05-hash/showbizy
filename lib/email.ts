import nodemailer from 'nodemailer'

// ─── Shared Transporter ────────────────────────────────────────────────────
export const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: (process.env.ZOHO_EMAIL || 'admin@showbizy.ai').trim(),
    pass: (process.env.ZOHO_APP_PASSWORD || '').trim(),
  },
})

const BASE_URL = 'https://showbizy.ai'
const FROM = '"ShowBizy" <admin@showbizy.ai>'

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
const THROTTLE_MS = 5 * 60 * 1000 // 5 minutes

// ─── Base HTML wrapper ─────────────────────────────────────────────────────
function wrapEmail(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#07060b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07060b;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#0a0a1a;border-radius:16px;overflow:hidden;">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:40px 32px;text-align:center;">
    <span style="font-size:48px;">🎬</span>
    <h1 style="font-size:24px;margin:12px 0 0;color:#fff;font-weight:700;">${title}</h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    ${body}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:0 32px 32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td style="border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;text-align:center;">
        <p style="color:#4b5563;font-size:12px;margin:0 0 4px;">ShowBizy — Where creative projects are born.</p>
        <p style="color:#4b5563;font-size:12px;margin:0;"><a href="https://showbizy.ai" style="color:#6b7280;text-decoration:none;">showbizy.ai</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto;">
<tr><td align="center" style="background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:12px;">
  <a href="${url}" style="display:inline-block;padding:14px 40px;color:#fff;text-decoration:none;font-weight:700;font-size:16px;">${text}</a>
</td></tr>
</table>`
}

function infoRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">${label}</td>
  <td style="padding:6px 0;color:#e5e7eb;font-size:14px;">${value}</td>
</tr>`
}

function card(title: string, content: string): string {
  return `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px;">
  <h3 style="color:#a855f7;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">${title}</h3>
  ${content}
</div>`
}

function stepItem(num: number, title: string, desc: string): string {
  return `<div style="margin-bottom:16px;">
  <table role="presentation" cellspacing="0" cellpadding="0"><tr>
    <td style="vertical-align:top;width:40px;">
      <div style="background:rgba(168,85,247,0.3);color:#a855f7;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:bold;">${num}</div>
    </td>
    <td style="vertical-align:top;">
      <p style="margin:0;color:#fff;font-weight:600;font-size:14px;">${title}</p>
      <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">${desc}</p>
    </td>
  </tr></table>
</div>`
}

// ─── 1. Welcome Email ──────────────────────────────────────────────────────
export async function sendWelcomeEmail(user: EmailUser): Promise<void> {
  const streamsList = (user.streams || []).join(', ') || 'Not set'
  const skillsList = (user.skills || []).join(', ') || 'Not set'

  const profileCard = card('Your Profile', `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${infoRow('Name', user.name)}
      ${infoRow('Streams', streamsList)}
      ${infoRow('Skills', skillsList)}
      ${infoRow('Location', user.city || 'Not set')}
      ${infoRow('Availability', user.availability || 'Not set')}
      ${user.portfolio ? infoRow('Portfolio', `<a href="${user.portfolio}" style="color:#a855f7;">${user.portfolio}</a>`) : ''}
    </table>
  `)

  const stepsCard = card('What happens next', `
    ${stepItem(1, 'AI scans your area', 'We look at who\'s near you and what projects would be perfect')}
    ${stepItem(2, 'Get matched to projects', 'First project matches arrive within 48 hours')}
    ${stepItem(3, 'Create together', 'Join projects, meet your team, start creating')}
  `)

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your ShowBizy profile is live! Our AI is already scanning your area for creative projects that match your skills.
    </p>
    ${profileCard}
    ${stepsCard}
    ${ctaButton('Go to Dashboard →', `${BASE_URL}/dashboard`)}
  `

  try {
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `🎬 Welcome to ShowBizy, ${user.name}!`,
      html: wrapEmail(`Welcome to ShowBizy!`, body),
    })
    console.log(`[email] Welcome email sent to ${user.email}`)
  } catch (err) {
    console.error(`[email] Failed to send welcome email to ${user.email}:`, err)
    throw err
  }
}

// ─── 2. Project Matched ────────────────────────────────────────────────────
export async function sendProjectMatchedEmail(user: EmailUser, project: EmailProject): Promise<void> {
  const rolesNeeded = (project.roles || []).filter(r => !r.filled).map(r => r.role).join(', ') || 'Various'

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Great news! Our AI found a project that matches your skills and interests.
    </p>
    ${card('Project Match', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('Project', project.title)}
        ${infoRow('Genre', project.genre || 'N/A')}
        ${infoRow('Location', project.location || 'N/A')}
        ${infoRow('Timeline', project.timeline || 'N/A')}
        ${infoRow('Roles Needed', rolesNeeded)}
      </table>
    `)}
    ${project.description ? `<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">${project.description}</p>` : ''}
    ${ctaButton('View Project →', `${BASE_URL}/projects/${project.id}`)}
  `

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `🎯 New project match: ${project.title}`,
    html: wrapEmail(`New Project Match`, body),
  })
}

// ─── 3. Team Member Joined ─────────────────────────────────────────────────
export async function sendTeamMemberJoinedEmail(
  teamMembers: EmailMember[],
  newMember: EmailMember,
  project: EmailProject
): Promise<void> {
  const memberSkills = (newMember.skills || []).join(', ') || 'Not listed'

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey there 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      <strong style="color:#e5e7eb;">${newMember.name}</strong> just joined <strong style="color:#e5e7eb;">${project.title}</strong>!
    </p>
    ${card('New Team Member', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('Name', newMember.name)}
        ${infoRow('Skills', memberSkills)}
        ${newMember.portfolio ? infoRow('Portfolio', `<a href="${newMember.portfolio}" style="color:#a855f7;">${newMember.portfolio}</a>`) : ''}
      </table>
    `)}
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">
      Your team now has <strong style="color:#e5e7eb;">${teamMembers.length + 1}</strong> members. Keep the momentum going!
    </p>
    ${ctaButton('View Project →', `${BASE_URL}/projects/${project.id}`)}
  `

  const html = wrapEmail(`${newMember.name} joined ${project.title}`, body)

  // Send to all existing team members (not the new one)
  for (const member of teamMembers) {
    if (member.email && member.email !== newMember.email) {
      try {
        await transporter.sendMail({
          from: FROM,
          to: member.email,
          subject: `👋 ${newMember.name} joined ${project.title}`,
          html,
        })
      } catch (err) {
        console.error(`Failed to send team-joined email to ${member.email}:`, err)
      }
    }
  }
}

// ─── 4. Project Invitation ─────────────────────────────────────────────────
export async function sendProjectInvitationEmail(
  user: EmailUser,
  project: EmailProject,
  invitedBy: string
): Promise<void> {
  const rolesNeeded = (project.roles || []).filter(r => !r.filled).map(r => r.role).join(', ') || 'Various'

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      <strong style="color:#e5e7eb;">${invitedBy}</strong> thinks you'd be perfect for this project and has invited you to join.
    </p>
    ${card('Project Details', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('Project', project.title)}
        ${infoRow('Genre', project.genre || 'N/A')}
        ${infoRow('Location', project.location || 'N/A')}
        ${infoRow('Timeline', project.timeline || 'N/A')}
        ${infoRow('Roles Needed', rolesNeeded)}
      </table>
    `)}
    ${project.description ? `<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">${project.description}</p>` : ''}
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto;">
      <tr>
        <td align="center" style="background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:12px;">
          <a href="${BASE_URL}/projects/${project.id}?action=accept" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:700;font-size:16px;">Accept Invitation ✓</a>
        </td>
        <td width="12"></td>
        <td align="center" style="border:1px solid rgba(255,255,255,0.2);border-radius:12px;">
          <a href="${BASE_URL}/projects/${project.id}?action=decline" style="display:inline-block;padding:14px 32px;color:#9ca3af;text-decoration:none;font-weight:700;font-size:16px;">Decline</a>
        </td>
      </tr>
    </table>
  `

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `🎬 You've been invited to join ${project.title}`,
    html: wrapEmail(`You're Invited!`, body),
  })
}

// ─── 5. Project Milestone ──────────────────────────────────────────────────
const MILESTONE_NEXT: Record<string, string> = {
  'Pre-production': 'Production — Time to start shooting!',
  'Production': 'Post-production — Editing, VFX, and sound design',
  'Post-production': 'Published — Ready for the world!',
  'Published': 'Congratulations — Your project is live! 🎉',
}

export async function sendProjectMilestoneEmail(
  teamMembers: EmailMember[],
  project: EmailProject,
  milestone: string
): Promise<void> {
  const whatsNext = MILESTONE_NEXT[milestone] || 'Keep pushing forward!'

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey team 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      <strong style="color:#e5e7eb;">${project.title}</strong> just moved to a new phase!
    </p>
    ${card('Milestone Update', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('Project', project.title)}
        ${infoRow('Current Phase', `<strong style="color:#a855f7;">${milestone}</strong>`)}
        ${infoRow("What's Next", whatsNext)}
      </table>
    `)}
    <p style="color:#9ca3af;font-size:14px;margin:0 0 8px;">🎉 Great progress team! Keep the momentum going.</p>
    ${ctaButton('View Project →', `${BASE_URL}/projects/${project.id}`)}
  `

  const html = wrapEmail(`${project.title} → ${milestone}`, body)

  for (const member of teamMembers) {
    if (member.email) {
      try {
        await transporter.sendMail({
          from: FROM,
          to: member.email,
          subject: `🏁 ${project.title} moved to ${milestone}`,
          html,
        })
      } catch (err) {
        console.error(`Failed to send milestone email to ${member.email}:`, err)
      }
    }
  }
}

// ─── 6. New Message (with throttle) ────────────────────────────────────────
export async function sendNewMessageEmail(
  user: EmailUser,
  sender: { name: string },
  project: EmailProject,
  messagePreview: string
): Promise<{ sent: boolean; throttled: boolean }> {
  const throttleKey = `${user.email}:${project.id}`
  const lastSent = messageThrottle[throttleKey] || 0
  const now = Date.now()

  if (now - lastSent < THROTTLE_MS) {
    return { sent: false, throttled: true }
  }

  const preview = messagePreview.length > 200 ? messagePreview.slice(0, 200) + '…' : messagePreview

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You have a new message in <strong style="color:#e5e7eb;">${project.title}</strong>.
    </p>
    ${card(`Message from ${sender.name}`, `
      <p style="color:#e5e7eb;font-size:14px;line-height:1.6;margin:0;font-style:italic;">"${preview}"</p>
    `)}
    ${ctaButton('Reply in ShowBizy →', `${BASE_URL}/projects/${project.id}?tab=chat`)}
  `

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `💬 New message from ${sender.name} in ${project.title}`,
    html: wrapEmail(`New Message`, body),
  })

  messageThrottle[throttleKey] = now
  return { sent: true, throttled: false }
}

// ─── 7. Weekly Digest ──────────────────────────────────────────────────────
export async function sendWeeklyDigestEmail(user: EmailUser, stats: WeeklyStats): Promise<void> {
  const trendingList = stats.trendingProjects.map(p =>
    `<tr><td style="padding:4px 0;"><a href="${BASE_URL}/projects/${p.id}" style="color:#a855f7;text-decoration:none;font-size:14px;">→ ${p.title}</a></td></tr>`
  ).join('')

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 👋</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Here's your weekly ShowBizy roundup.
    </p>
    ${card('Your Week at a Glance', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('🎯 New Matches', `<strong style="color:#a855f7;">${stats.matchCount}</strong> projects matched`)}
        ${infoRow('🎬 Active Projects', `<strong style="color:#a855f7;">${stats.activeProjects}</strong> in progress`)}
        ${infoRow('👥 New Members', `<strong style="color:#a855f7;">${stats.newMembers}</strong> joined near you`)}
      </table>
    `)}
    ${stats.trendingProjects.length > 0 ? card('🔥 Trending Projects', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${trendingList}
      </table>
    `) : ''}
    ${ctaButton('Explore Projects →', `${BASE_URL}/projects`)}
  `

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `📊 Your ShowBizy week: ${stats.matchCount} new matches`,
    html: wrapEmail(`Your Weekly Digest`, body),
  })
}

// ─── 8. Weekly Digest for Cron (plain text style) ─────────────────────────
interface DigestProject {
  id: string
  title: string
  stream: string
  location: string
}

interface DigestJob {
  id: string
  title: string
  company: string
  location: string
  salary: string
}

export async function sendCronWeeklyDigest(
  user: { name: string; email: string; is_pro?: boolean },
  projects: DigestProject[],
  jobs: DigestJob[],
  stats: { totalNewProjects: number; totalNewJobs: number }
): Promise<void> {
  const projectsList = projects.map(p =>
    `- ${p.title} (${p.stream}, ${p.location})\n  https://showbizy.ai/projects/${p.id}`
  ).join('\n')

  const jobsList = jobs.map(j =>
    `- ${j.title} at ${j.company} — ${j.salary}\n  https://showbizy.ai/jobs/${j.id}`
  ).join('\n')

  const proCta = user.is_pro
    ? ''
    : '\n---\nUpgrade to Pro to apply to all projects and jobs: https://showbizy.ai/pricing\n'

  const textBody = `Hey ${user.name},

Here's what's new on ShowBizy this week:

${stats.totalNewProjects} new AI projects | ${stats.totalNewJobs} real jobs

${projects.length > 0 ? `NEW PROJECTS:\n${projectsList}` : ''}

${jobs.length > 0 ? `REAL JOBS:\n${jobsList}` : ''}
${proCta}
Browse all: https://showbizy.ai/projects

— ShowBizy`

  const projectsHtml = projects.map(p =>
    `<li style="margin-bottom:8px;"><a href="https://showbizy.ai/projects/${p.id}" style="color:#1a1a1a;text-decoration:none;"><strong>${p.title}</strong></a> — ${p.stream}, ${p.location}</li>`
  ).join('')

  const jobsHtml = jobs.map(j =>
    `<li style="margin-bottom:8px;"><a href="https://showbizy.ai/jobs/${j.id}" style="color:#1a1a1a;text-decoration:none;"><strong>${j.title}</strong> at ${j.company}</a> — ${j.salary}</li>`
  ).join('')

  const proCtaHtml = user.is_pro
    ? ''
    : `<p style="margin-top:24px;padding:16px;background:#f8f8f8;border-radius:8px;"><strong>Upgrade to Pro</strong> to apply to all projects and jobs.<br><a href="https://showbizy.ai/pricing" style="color:#7c3aed;">View Pro plans</a></p>`

  const htmlBody = `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>Here's what's new on ShowBizy this week:</p>
<p><strong>${stats.totalNewProjects} new AI projects</strong> | <strong>${stats.totalNewJobs} real jobs</strong></p>
${projects.length > 0 ? `<p><strong>New Projects</strong></p><ul style="padding-left:20px;">${projectsHtml}</ul>` : ''}
${jobs.length > 0 ? `<p><strong>Real Jobs</strong></p><ul style="padding-left:20px;">${jobsHtml}</ul>` : ''}
${proCtaHtml}
<p><a href="https://showbizy.ai/projects">Browse all projects</a> | <a href="https://showbizy.ai/jobs">Browse all jobs</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Your ShowBizy week: ${stats.totalNewProjects} new projects in your area`,
    headers: { 'X-Priority': '1', 'Importance': 'High' },
    text: textBody,
    html: htmlBody,
  })
}

// ─── 9. Pro Upgrade Confirmation ───────────────────────────────────────────
export async function sendProUpgradeEmail(
  user: { name: string; email: string },
  amountPaid?: string
): Promise<void> {
  const amount = amountPaid || '£19/month'

  const benefitsHtml = [
    'Unlimited project applications',
    'Priority AI matching',
    'Featured profile badge ✨',
    'Direct messaging with creators',
    'Weekly curated project digest',
    'Early access to new features',
  ].map(b =>
    `<tr><td style="padding:6px 0;color:#e5e7eb;font-size:14px;">
      <span style="color:#a855f7;margin-right:8px;">✓</span>${b}
    </td></tr>`
  ).join('')

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 🎉</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Welcome to <strong style="color:#a855f7;">ShowBizy Pro</strong>! Your upgrade is confirmed and all Pro features are now unlocked.
    </p>
    ${card('Your Pro Benefits', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${benefitsHtml}
      </table>
    `)}
    ${card('Payment Receipt', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('Plan', 'ShowBizy Pro')}
        ${infoRow('Amount', `<strong style="color:#e5e7eb;">${amount}</strong>`)}
        ${infoRow('Status', '<span style="color:#22c55e;">✓ Confirmed</span>')}
      </table>
    `)}
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">
      You can manage your subscription anytime from your dashboard settings. Cancel anytime — no questions asked.
    </p>
    ${ctaButton('Go to Dashboard →', `${BASE_URL}/dashboard`)}
  `

  try {
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `⚡ You're now a ShowBizy Pro member!`,
      html: wrapEmail(`You're ShowBizy Pro! 🎉`, body),
    })
    console.log(`[email] Pro upgrade email sent to ${user.email}`)
  } catch (err) {
    console.error(`[email] Failed to send Pro upgrade email to ${user.email}:`, err)
    throw err
  }
}

// ─── Studio Upgrade Email ─────────────────────────────────────────────────
export async function sendStudioUpgradeEmail(
  user: { name: string; email: string },
  amountPaid?: string
): Promise<void> {
  const amount = amountPaid || '£29/month'

  const benefitsHtml = [
    '🎬 Post your own creative projects',
    '🤖 AI auto-matches you with the right talent',
    '📋 Manage applications in your Studio dashboard',
    '✨ Verified Studio badge on your profile',
    '⭐ Featured placement in browse',
    '📊 Project analytics & insights',
    '🚀 Early access to all new features',
  ].map(b =>
    `<tr><td style="padding:6px 0;color:#e5e7eb;font-size:14px;">
      <span style="color:#F5B731;margin-right:8px;">✓</span>${b}
    </td></tr>`
  ).join('')

  const body = `
    <p style="font-size:18px;color:#e5e7eb;margin:0 0 24px;">Hey ${user.name} 🎬</p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Welcome to <strong style="color:#F5B731;">ShowBizy Studio</strong>! You can now post your own creative projects and have our AI find the perfect talent to bring them to life.
    </p>
    ${card('Your Studio Benefits', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${benefitsHtml}
      </table>
    `)}
    ${card('Payment Receipt', `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${infoRow('Plan', 'ShowBizy Studio')}
        ${infoRow('Amount', `<strong style="color:#e5e7eb;">${amount}</strong>`)}
        ${infoRow('Status', '<span style="color:#22c55e;">✓ Confirmed</span>')}
      </table>
    `)}
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Ready to post your first project? Head to your Studio dashboard to get started. Our AI will scan our creative pool and notify the best matches automatically.
    </p>
    ${ctaButton('Post Your First Project →', `${BASE_URL}/studio/post-project`)}
  `

  try {
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: `🎬 Welcome to ShowBizy Studio!`,
      html: wrapEmail(`You're ShowBizy Studio! 🎬`, body),
    })
    console.log(`[email] Studio upgrade email sent to ${user.email}`)
  } catch (err) {
    console.error(`[email] Failed to send Studio upgrade email to ${user.email}:`, err)
    throw err
  }
}

// ─── 10. Drip Sequence Emails (plain text for inbox placement) ────────────

interface DripProject {
  id: string
  title: string
  stream: string
  location: string
}

// Day 1: "AI is scanning your area"
export async function sendDripDay1(user: { name: string; email: string; city?: string }): Promise<void> {
  const city = user.city || 'your area'
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `${user.name}, our AI is scanning ${city} for you`,
    headers: { 'X-Priority': '1', 'Importance': 'High' },
    text: `Hey ${user.name},\n\nWelcome to ShowBizy! Our AI is now actively scanning ${city} for creative projects that match your skills.\n\nHere's what happens next:\n- We generate new AI projects in your area every day\n- When a project matches your skills, you'll be the first to know\n- Pro members can apply directly and get priority matching\n\nBrowse current projects: https://showbizy.ai/projects\n\n— ShowBizy`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>Welcome to ShowBizy! Our AI is now actively scanning <strong>${city}</strong> for creative projects that match your skills.</p>
<p>Here's what happens next:</p>
<ul>
<li>We generate new AI projects in your area every day</li>
<li>When a project matches your skills, you'll be the first to know</li>
<li>Pro members can apply directly and get priority matching</li>
</ul>
<p><a href="https://showbizy.ai/projects" style="color:#7c3aed;font-weight:bold;">Browse current projects</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
  })
}

// Day 3: "AI found projects for you"
export async function sendDripDay3(
  user: { name: string; email: string; city?: string },
  matchedProjects: DripProject[]
): Promise<void> {
  const count = matchedProjects.length
  const city = user.city || 'your area'

  const projectListHtml = matchedProjects.slice(0, 3).map(p =>
    `<li style="margin-bottom:8px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}<br>
    <a href="https://showbizy.ai/projects/${p.id}" style="color:#7c3aed;">View project</a></li>`
  ).join('')

  const projectListText = matchedProjects.slice(0, 3).map(p =>
    `- ${p.title} (${p.stream}, ${p.location})\n  https://showbizy.ai/projects/${p.id}`
  ).join('\n')

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `${count} project${count > 1 ? 's' : ''} found for you in ${city}`,
    headers: { 'X-Priority': '1', 'Importance': 'High' },
    text: `Hey ${user.name},\n\nOur AI found ${count} project${count > 1 ? 's' : ''} in ${city} that match your skills:\n\n${projectListText}\n\nUpgrade to Pro to apply and get priority matching: https://showbizy.ai/pricing\n\n— ShowBizy`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>Our AI found <strong>${count} project${count > 1 ? 's' : ''}</strong> in ${city} that match your skills:</p>
<ul style="padding-left:20px;">${projectListHtml}</ul>
<p style="margin-top:16px;padding:12px;background:#f8f8f8;border-radius:8px;"><strong>Upgrade to Pro</strong> to apply directly and get priority matching.<br><a href="https://showbizy.ai/pricing" style="color:#7c3aed;font-weight:bold;">View Pro plans — £9/mo</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
  })
}

// Day 7: "You've been matched but can't apply"
export async function sendDripDay7(
  user: { name: string; email: string; city?: string },
  totalMatches: number,
  topProjects: DripProject[]
): Promise<void> {
  const city = user.city || 'your area'

  const projectListHtml = topProjects.slice(0, 3).map(p =>
    `<li style="margin-bottom:8px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}<br>
    <span style="color:#999;">🔒 <em>Pro required to apply</em></span></li>`
  ).join('')

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `${user.name}, you've been matched to ${totalMatches} projects — but can't apply yet`,
    headers: { 'X-Priority': '1', 'Importance': 'High' },
    text: `Hey ${user.name},\n\nIn the last week, our AI matched you to ${totalMatches} projects in ${city}.\n\nBut as a free member, you can't apply to any of them.\n\nHere's what Pro members get:\n- Apply to all AI-generated projects\n- Apply to real industry jobs (BBC, Netflix, etc.)\n- Priority AI matching for your skills\n- Upload CV + send cover letters\n\nUpgrade now: https://showbizy.ai/pricing\n\n— ShowBizy`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>In the last week, our AI matched you to <strong>${totalMatches} projects</strong> in ${city}.</p>
<p>But as a free member, <strong>you can't apply to any of them.</strong></p>
<p>Projects you're missing:</p>
<ul style="padding-left:20px;">${projectListHtml}</ul>
<p>Here's what Pro members get:</p>
<ul>
<li>Apply to all AI-generated projects</li>
<li>Apply to real industry jobs (BBC, Netflix, etc.)</li>
<li>Priority AI matching for your skills</li>
<li>Upload CV + send cover letters</li>
</ul>
<p style="margin-top:16px;padding:14px;background:#f8f8f8;border-radius:8px;text-align:center;"><a href="https://showbizy.ai/pricing" style="color:#7c3aed;font-weight:bold;font-size:16px;">Upgrade to Pro — £9/mo</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
  })
}

// Day 14: "Projects closing soon — last chance"
export async function sendDripDay14(
  user: { name: string; email: string; city?: string },
  totalMatches: number,
  closingProjects: DripProject[]
): Promise<void> {
  const city = user.city || 'your area'

  const projectListHtml = closingProjects.slice(0, 3).map(p =>
    `<li style="margin-bottom:8px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}<br>
    <span style="color:#cc0000;">⏳ Closing soon</span></li>`
  ).join('')

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `${totalMatches} projects closing soon in ${city} — don't miss out`,
    headers: { 'X-Priority': '1', 'Importance': 'High' },
    text: `Hey ${user.name},\n\nYou've been on ShowBizy for 2 weeks now, and our AI has matched you to ${totalMatches} projects in ${city}.\n\nSeveral are closing soon — once they're full, they're gone.\n\nPro members are already applying. Don't let the right opportunity pass.\n\nUpgrade now: https://showbizy.ai/pricing\n\n— ShowBizy`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>You've been on ShowBizy for 2 weeks now, and our AI has matched you to <strong>${totalMatches} projects</strong> in ${city}.</p>
<p><strong>Several are closing soon</strong> — once they're full, they're gone:</p>
<ul style="padding-left:20px;">${projectListHtml}</ul>
<p>Pro members are already applying. Don't let the right opportunity pass.</p>
<p style="margin-top:16px;padding:14px;background:#f8f8f8;border-radius:8px;text-align:center;"><a href="https://showbizy.ai/pricing" style="color:#7c3aed;font-weight:bold;font-size:16px;">Upgrade to Pro — £9/mo</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
  })
}

// Match-triggered: "You just matched a project but can't apply"
export async function sendMatchConversionEmail(
  user: { name: string; email: string },
  project: DripProject
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `You matched "${project.title}" — upgrade to apply`,
    headers: { 'X-Priority': '1', 'Importance': 'High' },
    text: `Hey ${user.name},\n\nGreat news — our AI just matched you to a new project:\n\n${project.title}\nStream: ${project.stream}\nLocation: ${project.location}\n\nThis project needs someone with your exact skills. But you need Pro to apply.\n\nUpgrade now: https://showbizy.ai/pricing\n\n— ShowBizy`,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>Great news — our AI just matched you to a new project:</p>
<div style="padding:16px;background:#f8f8f8;border-radius:8px;border-left:4px solid #7c3aed;margin:16px 0;">
<strong>${project.title}</strong><br>
${project.stream} — ${project.location}
</div>
<p>This project needs someone with <strong>your exact skills</strong>. But you need Pro to apply.</p>
<p style="margin-top:16px;padding:14px;background:#7c3aed;border-radius:8px;text-align:center;"><a href="https://showbizy.ai/pricing" style="color:#fff;font-weight:bold;font-size:16px;text-decoration:none;">Upgrade to Pro — £9/mo</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
  })
}
