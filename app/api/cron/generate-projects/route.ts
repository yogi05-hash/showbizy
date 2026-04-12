import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter, sendMatchConversionEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes (Vercel Pro), falls back to plan limit

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

// Auth check for Vercel cron
function isAuthorized(req: NextRequest): boolean {
  // Vercel crons send this header automatically
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  // Also allow manual trigger from dashboard (no auth for POST — existing behavior)
  return false
}

// GET: Vercel cron trigger (daily at 6am UTC)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return generateProjects()
}

// POST: Manual trigger from UI (existing behavior)
export async function POST() {
  return generateProjects()
}

async function generateProjects() {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    // Fetch all unique cities from active users
    const { data: cities, error: citiesError } = await supabaseAdmin
      .from('showbizy_users')
      .select('city')
      .not('city', 'is', null)

    if (citiesError) {
      console.error('Error fetching cities:', citiesError)
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
    }

    const uniqueCities = [...new Set((cities ?? []).map((c: { city: string }) => c.city).filter(Boolean))]

    if (uniqueCities.length === 0) {
      return NextResponse.json({ message: 'No cities with active users found' })
    }

    const generatedProjects: { city: string; project: string; id: string }[] = []

    // Generate 1 project per city (up to 3 cities per run, randomized)
    for (const city of uniqueCities.sort(() => Math.random() - 0.5).slice(0, 3)) {
      try {
        // Fetch talent profiles in this city
        const { data: talentInCity } = await supabaseAdmin
          .from('showbizy_users')
          .select('skills, streams, availability')
          .eq('city', city)
          .limit(10)

        const streams = ['Film & Video', 'Music', 'Fashion & Modelling', 'Influencer & Content', 'Visual Arts', 'Performing Arts', 'Events & Live']
        const randomStream = streams[Math.floor(Math.random() * streams.length)]

        const prompt = `You are ShowBizy AI — a creative project generator for a platform that matches creative talent with AI-generated projects.

Generate a compelling, achievable creative project brief for ${city}.

Available talent in ${city}:
${talentInCity ? JSON.stringify(talentInCity.slice(0, 5)) : 'Mixed creative talent including directors, actors, photographers, musicians, and content creators.'}

Preferred stream: ${randomStream}

Generate a project that:
- Is specific to ${city} (use local landmarks, culture, or opportunities)
- Can be completed by a small team (3-6 people)
- Takes 2-4 weeks to complete
- Is exciting and portfolio-worthy
- Leverages current creative trends

Return a JSON object:

{
  "title": "Compelling project title specific to ${city}",
  "stream": "One of: Film & Video, Music, Fashion & Modelling, Influencer & Content, Performing Arts, Visual Arts, Events & Live, Brands & Businesses",
  "genre": "Specific genre/style",
  "logline": "One sentence hook (max 30 words)",
  "description": "2-3 paragraph project description with creative vision, concept, and what makes it unique",
  "mood_style": "Visual/creative style description and references",
  "roles_needed": [
    {
      "role": "Job title (e.g. Director, Model, Illustrator)",
      "description": "What this person will do on the project",
      "skills_required": ["Required skills"]
    }
  ],
  "timeline": {
    "total_weeks": number,
    "phases": [
      { "name": "Pre-production", "duration": "X days/weeks", "tasks": ["task1", "task2"] },
      { "name": "Production", "duration": "X days/weeks", "tasks": ["task1", "task2"] },
      { "name": "Post-production", "duration": "X days/weeks", "tasks": ["task1", "task2"] },
      { "name": "Published", "duration": "Launch date relative" }
    ]
  },
  "location_details": "Specific location suggestions within ${city}",
  "deliverables": ["Final deliverable 1", "Final deliverable 2"]
}`

        const response = await fetch(DEEPSEEK_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are an expert creative director who generates inspiring, location-specific project briefs. Always respond with valid JSON only.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.9,
          })
        })

        if (!response.ok) {
          console.error(`DeepSeek API error for ${city}: ${response.status}`)
          continue
        }

        const completion = await response.json()
        let content = completion.choices[0].message.content || '{}'
        // Strip markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const projectData = JSON.parse(content)

        // Save project to database
        const { data: savedProject, error: projectError } = await supabaseAdmin
          .from('showbizy_projects')
          .insert([{
            title: projectData.title,
            stream: projectData.stream,
            genre: projectData.genre,
            location: city,
            logline: projectData.logline,
            description: projectData.description,
            brief: projectData.description,
            mood_style: projectData.mood_style,
            timeline: JSON.stringify(projectData.timeline),
            deliverables: projectData.deliverables || [],
            status: 'recruiting',
            team_size: projectData.roles_needed?.length || 5,
            filled_roles: 0,
            generated_by: 'ai-cron'
          }])
          .select()
          .single()

        if (projectError) {
          console.error(`Error saving project for ${city}:`, projectError)
          continue
        }

        // Save project roles
        if (projectData.roles_needed && savedProject) {
          const roles = projectData.roles_needed.map((role: { role: string; description?: string; skills_required?: string[] }) => ({
            project_id: savedProject.id,
            role: role.role,
            description: role.description || '',
            skills_required: role.skills_required || [],
            filled: false
          }))

          const { error: rolesError } = await supabaseAdmin
            .from('showbizy_project_roles')
            .insert(roles)

          if (rolesError) {
            console.error(`Error saving roles for ${city}:`, rolesError)
          }
        }

        generatedProjects.push({
          city,
          project: savedProject.title,
          id: savedProject.id
        })

        // Small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error generating project for ${city}:`, error)
        continue
      }
    }

    // ── Post-generation: auto-match users and notify (fire-and-forget) ──
    if (generatedProjects.length > 0) {
      // Don't await — let this run in background so function returns faster
      matchAndNotifyUsers(generatedProjects).catch(err =>
        console.error('Post-generation matching error:', err)
      )
    }

    return NextResponse.json({
      success: true,
      generated: generatedProjects.length,
      projects: generatedProjects
    })

  } catch (error) {
    console.error('Cron generation error:', error)
    return NextResponse.json({ error: 'Failed to generate projects' }, { status: 500 })
  }
}

// ─── Skill Matching Engine ─────────────────────────────────────────────────

// Fuzzy keyword match: "camera operation" matches "camera", "camera operator", etc.
function skillMatch(userSkill: string, requiredSkill: string): boolean {
  const u = userSkill.toLowerCase().trim()
  const r = requiredSkill.toLowerCase().trim()
  if (u === r) return true
  if (u.includes(r) || r.includes(u)) return true
  // Check individual words (only words > 3 chars to avoid false positives)
  const uWords = u.split(/[\s,/&-]+/).filter(w => w.length > 3)
  const rWords = r.split(/[\s,/&-]+/).filter(w => w.length > 3)
  return uWords.some(uw => rWords.some(rw => uw.includes(rw) || rw.includes(uw)))
}

// Calculate genuine match score (0-100) for a user against a project role
function calculateMatchScore(
  userSkills: string[],
  roleSkillsRequired: string[],
  userStreams: string[],
  projectStream: string,
  userCity: string,
  projectLocation: string
): { score: number; matchedSkills: string[] } {
  // Skill overlap (0-75 points)
  const matchedSkills: string[] = []
  if (roleSkillsRequired.length > 0 && userSkills.length > 0) {
    for (const req of roleSkillsRequired) {
      if (userSkills.some(us => skillMatch(us, req))) {
        matchedSkills.push(req)
      }
    }
  }
  const skillScore = roleSkillsRequired.length > 0
    ? (matchedSkills.length / roleSkillsRequired.length) * 75
    : 25 // If no skills_required listed, give base score

  // Stream match (+15)
  const streamScore = userStreams.includes(projectStream) ? 15 : 0

  // City match (+10)
  const cityClean = userCity.split(',')[0].trim().toLowerCase()
  const locClean = projectLocation.toLowerCase()
  const cityScore = cityClean && locClean.includes(cityClean) ? 10 : 0

  return {
    score: Math.round(skillScore + streamScore + cityScore),
    matchedSkills,
  }
}

interface ProjectWithRoles {
  id: string
  title: string
  stream: string
  location: string
  description: string
  roles: { role: string; skills_required: string[] }[]
}

// ─── Two-Layer Matching & Notification ─────────────────────────────────────

async function matchAndNotifyUsers(projects: { city: string; project: string; id: string }[]) {
  // Fetch generated projects WITH their roles
  const projectsWithRoles: ProjectWithRoles[] = []
  for (const proj of projects) {
    const { data: project } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location, description')
      .eq('id', proj.id)
      .single()
    if (!project) continue

    const { data: roles } = await supabaseAdmin
      .from('showbizy_project_roles')
      .select('role, skills_required')
      .eq('project_id', project.id)

    projectsWithRoles.push({
      ...project,
      roles: (roles || []).map((r: { role: string; skills_required?: string[] }) => ({
        role: r.role,
        skills_required: r.skills_required || [],
      })),
    })
  }

  if (projectsWithRoles.length === 0) return

  // Fetch ALL users
  const { data: allUsers } = await supabaseAdmin
    .from('showbizy_users')
    .select('id, name, email, city, streams, skills, is_pro, plan')
    .not('email', 'is', null)
    .limit(200)

  if (!allUsers?.length) return

  const emailed = new Set<string>()
  let sent = 0

  for (const user of allUsers as { id: string; name: string; email: string; city?: string; streams?: string[]; skills?: string[]; is_pro?: boolean; plan?: string }[]) {
    if (emailed.has(user.email)) continue
    emailed.add(user.email)

    const isPro = user.is_pro || user.plan === 'pro' || user.plan === 'studio'
    const userSkills = user.skills || []
    const userStreams = user.streams || []
    const userCity = user.city || ''

    if (isPro) {
      // ── PRO USERS: Genuine skill-based matching ──
      // Find best role match across all new projects
      let bestScore = 0
      let bestRole = ''
      let bestProject: ProjectWithRoles | null = null
      const genuineMatches: { project: ProjectWithRoles; role: string; score: number; matchedSkills: string[] }[] = []

      for (const project of projectsWithRoles) {
        for (const role of project.roles) {
          const { score, matchedSkills } = calculateMatchScore(
            userSkills, role.skills_required, userStreams,
            project.stream, userCity, project.location
          )
          if (score >= 40) {
            genuineMatches.push({ project, role: role.role, score, matchedSkills })
            if (score > bestScore) {
              bestScore = score
              bestRole = role.role
              bestProject = project
            }
          }
        }
      }

      // Save genuine matches to DB with real scores
      for (const m of genuineMatches) {
        try {
          await supabaseAdmin.from('showbizy_matches').insert({
            user_id: user.id,
            project_id: m.project.id,
            score: m.score / 100, // Store as 0-1
            status: 'pending',
          })
        } catch { /* ignore duplicates */ }
      }

      // Email Pro user with their best match + role
      if (bestProject && bestScore >= 40) {
        const scoreLabel = bestScore >= 75 ? 'Strong match' : bestScore >= 50 ? 'Good match' : 'Possible match'
        try {
          await transporter.sendMail({
            from: '"ShowBizy" <hello@bilabs.ai>',
            to: user.email,
            subject: `${scoreLabel}: ${bestRole} on "${bestProject.title}" (${bestScore}%)`,
            headers: { 'X-Priority': '1', 'Importance': 'High' },
            text: `Hey ${user.name},\n\nOur AI matched you to a new project:\n\n${bestProject.title}\nRole: ${bestRole}\nMatch score: ${bestScore}%\nLocation: ${bestProject.location}\nStream: ${bestProject.stream}\n\nView and apply: https://showbizy.ai/projects/${bestProject.id}\n\n${genuineMatches.length > 1 ? `Plus ${genuineMatches.length - 1} more match${genuineMatches.length > 2 ? 'es' : ''}: https://showbizy.ai/projects` : ''}\n\n— ShowBizy`,
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>Our AI matched you to a new project:</p>
<div style="padding:16px;background:#f8f8f8;border-radius:8px;border-left:4px solid ${bestScore >= 75 ? '#22c55e' : bestScore >= 50 ? '#f59e0b' : '#94a3b8'};margin:16px 0;">
<strong>${bestProject.title}</strong><br>
Role: <strong>${bestRole}</strong><br>
Match: <strong style="color:${bestScore >= 75 ? '#22c55e' : bestScore >= 50 ? '#f59e0b' : '#94a3b8'};">${bestScore}% — ${scoreLabel}</strong><br>
${bestProject.location} — ${bestProject.stream}
</div>
<p><a href="https://showbizy.ai/projects/${bestProject.id}" style="color:#7c3aed;font-weight:bold;">View & Apply</a></p>
${genuineMatches.length > 1 ? `<p style="color:#666;">Plus ${genuineMatches.length - 1} more match${genuineMatches.length > 2 ? 'es' : ''} — <a href="https://showbizy.ai/projects" style="color:#7c3aed;">browse all</a></p>` : ''}
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
          })
          sent++
        } catch (emailErr) {
          console.error(`Failed to send pro match email to ${user.email}:`, emailErr)
        }
      } else {
        // Pro user but no strong match — show new projects anyway
        try {
          const top = projectsWithRoles.slice(0, 3)
          await transporter.sendMail({
            from: '"ShowBizy" <hello@bilabs.ai>',
            to: user.email,
            subject: `${top.length} new project${top.length > 1 ? 's' : ''} just dropped`,
            headers: { 'X-Priority': '1', 'Importance': 'High' },
            text: `Hey ${user.name},\n\nNew projects on ShowBizy:\n\n${top.map(p => `- ${p.title} (${p.stream}, ${p.location})\n  https://showbizy.ai/projects/${p.id}`).join('\n')}\n\nBrowse and apply: https://showbizy.ai/projects\n\n— ShowBizy`,
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>New projects on ShowBizy:</p>
<ul style="padding-left:20px;">${top.map(p => `<li style="margin-bottom:8px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}<br><a href="https://showbizy.ai/projects/${p.id}" style="color:#7c3aed;">View & apply</a></li>`).join('')}</ul>
<p><a href="https://showbizy.ai/projects" style="color:#7c3aed;font-weight:bold;">Browse all projects</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
          })
          sent++
        } catch (emailErr) {
          console.error(`Failed to send pro general email to ${user.email}:`, emailErr)
        }
      }

    } else {
      // ── FREE USERS: Broad matching (city/stream) + conversion pressure ──
      // Keep it generous — match on city OR stream so everyone gets emails
      const broadMatch = projectsWithRoles.filter(p => {
        const cityClean = userCity.split(',')[0].trim().toLowerCase()
        const cityMatch = cityClean && p.location.toLowerCase().includes(cityClean)
        const streamMatch = userStreams.length > 0 && userStreams.includes(p.stream)
        return cityMatch || streamMatch
      })

      // Save broad matches to DB (vague score for free users)
      for (const p of broadMatch) {
        try {
          await supabaseAdmin.from('showbizy_matches').insert({
            user_id: user.id,
            project_id: p.id,
            score: 0.5, // Vague — they don't see this
            status: 'pending',
          })
        } catch { /* ignore duplicates */ }
      }

      // Pick projects to show: broad matches or all new projects
      const projectsToShow = broadMatch.length > 0 ? broadMatch.slice(0, 3) : projectsWithRoles.slice(0, 3)
      const matchText = broadMatch.length > 0
        ? `Our AI found ${broadMatch.length} project${broadMatch.length > 1 ? 's' : ''} in your area that need someone like you`
        : 'New creative projects just dropped on ShowBizy'

      try {
        await sendMatchConversionEmail(
          { name: user.name, email: user.email },
          { id: projectsToShow[0].id, title: projectsToShow[0].title, stream: projectsToShow[0].stream, location: projectsToShow[0].location }
        )
        sent++
      } catch {
        // Fallback: generic email
        try {
          await transporter.sendMail({
            from: '"ShowBizy" <hello@bilabs.ai>',
            to: user.email,
            subject: broadMatch.length > 0
              ? `${broadMatch.length} project${broadMatch.length > 1 ? 's' : ''} in your area need${broadMatch.length === 1 ? 's' : ''} someone like you`
              : `New creative projects just dropped`,
            headers: { 'X-Priority': '1', 'Importance': 'High' },
            text: `Hey ${user.name},\n\n${matchText}:\n\n${projectsToShow.map(p => `- ${p.title} (${p.stream}, ${p.location})`).join('\n')}\n\nUpgrade to Pro to see your match score and apply: https://showbizy.ai/pricing\n\n— ShowBizy`,
            html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>${matchText}:</p>
<ul style="padding-left:20px;">${projectsToShow.map(p => `<li style="margin-bottom:8px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}</li>`).join('')}</ul>
<p style="margin-top:16px;padding:14px;background:#7c3aed;border-radius:8px;text-align:center;"><a href="https://showbizy.ai/pricing" style="color:#fff;font-weight:bold;font-size:16px;text-decoration:none;">Upgrade to Pro — see your match score & apply</a></p>
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
          })
          sent++
        } catch (emailErr) {
          console.error(`Failed to send free user email to ${user.email}:`, emailErr)
        }
      }
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`[cron] Daily emails sent: ${sent}/${allUsers.length}`)
}
