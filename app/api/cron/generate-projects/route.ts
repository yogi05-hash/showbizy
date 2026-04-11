import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

    // Generate 1 project per city (up to 5 cities)
    for (const city of uniqueCities.slice(0, 5)) {
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

    // ── Post-generation: auto-match users and notify ──
    if (generatedProjects.length > 0) {
      try {
        await matchAndNotifyUsers(generatedProjects)
      } catch (matchErr) {
        console.error('Post-generation matching error:', matchErr)
      }
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

// After generating projects, email ALL users with daily update
async function matchAndNotifyUsers(projects: { city: string; project: string; id: string }[]) {
  // Fetch all generated project details
  const projectDetails: { id: string; title: string; stream: string; location: string; description: string }[] = []
  for (const proj of projects) {
    const { data: project } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location, description')
      .eq('id', proj.id)
      .single()
    if (project) projectDetails.push(project)
  }

  if (projectDetails.length === 0) return

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

    const userCity = (user.city || '').split(',')[0].trim().toLowerCase()
    const isPro = user.is_pro || user.plan === 'pro' || user.plan === 'studio'

    // Find projects matching this user's city or streams
    const matched = projectDetails.filter(p => {
      const cityMatch = userCity && p.location.toLowerCase().includes(userCity)
      const streamMatch = user.streams?.length && user.streams.includes(p.stream)
      return cityMatch || streamMatch
    })

    // Save matches to DB for matched users
    if (matched.length > 0) {
      const matchRecords = matched.map(p => ({
        user_id: user.id,
        project_id: p.id,
        score: 0.80,
        status: 'pending',
      }))
      try {
        await supabaseAdmin.from('showbizy_matches').insert(matchRecords)
      } catch {
        // Ignore duplicates
      }
    }

    // Pick projects to show: matched first, then any new ones
    const projectsToShow = matched.length > 0 ? matched.slice(0, 3) : projectDetails.slice(0, 3)

    // Build email content based on user type
    const projectListText = projectsToShow.map(p =>
      `- ${p.title} (${p.stream}, ${p.location})\n  https://showbizy.ai/projects/${p.id}`
    ).join('\n')

    const projectListHtml = projectsToShow.map(p =>
      `<li style="margin-bottom:8px;"><strong>${p.title}</strong> — ${p.stream}, ${p.location}<br>
      <a href="https://showbizy.ai/projects/${p.id}" style="color:#7c3aed;">${isPro ? 'View & apply' : 'View project'}</a></li>`
    ).join('')

    const subject = matched.length > 0
      ? `${matched.length} new project${matched.length > 1 ? 's' : ''} matching your skills`
      : `${projectDetails.length} new creative project${projectDetails.length > 1 ? 's' : ''} just dropped`

    const ctaText = isPro
      ? 'Browse and apply to all projects: https://showbizy.ai/projects'
      : 'Upgrade to Pro to apply and get matched: https://showbizy.ai/pricing'

    const ctaHtml = isPro
      ? `<p><a href="https://showbizy.ai/projects" style="color:#7c3aed;font-weight:bold;">Browse and apply to all projects</a></p>`
      : `<p style="margin-top:16px;padding:12px;background:#f8f8f8;border-radius:8px;"><strong>Upgrade to Pro</strong> to apply to projects and get AI-matched to the best opportunities.<br><a href="https://showbizy.ai/pricing" style="color:#7c3aed;font-weight:bold;">View Pro plans</a></p>`

    try {
      await transporter.sendMail({
        from: '"ShowBizy" <admin@showbizy.ai>',
        to: user.email,
        subject,
        headers: { 'X-Priority': '1', 'Importance': 'High' },
        text: `Hey ${user.name},\n\n${matched.length > 0 ? `We found ${matched.length} new project${matched.length > 1 ? 's' : ''} matching your skills:` : 'New creative projects just dropped on ShowBizy:'}\n\n${projectListText}\n\n${ctaText}\n\n— ShowBizy`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
<p>Hey ${user.name},</p>
<p>${matched.length > 0 ? `We found <strong>${matched.length} new project${matched.length > 1 ? 's' : ''}</strong> matching your skills:` : 'New creative projects just dropped on ShowBizy:'}</p>
<ul style="padding-left:20px;">${projectListHtml}</ul>
${ctaHtml}
<p style="color:#666; font-size: 12px; margin-top: 24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
      })
      sent++
    } catch (emailErr) {
      console.error(`Failed to send daily email to ${user.email}:`, emailErr)
    }

    // Rate limit: 500ms between emails
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`[cron] Daily emails sent: ${sent}/${allUsers.length}`)
}
