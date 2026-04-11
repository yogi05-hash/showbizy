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

// Match newly generated projects with users in same city/stream and send notifications
async function matchAndNotifyUsers(projects: { city: string; project: string; id: string }[]) {
  for (const proj of projects) {
    // Fetch full project details
    const { data: project } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location, description')
      .eq('id', proj.id)
      .single()

    if (!project) continue

    // Find users in same city with matching streams
    const { data: matchedUsers } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, email, city, streams, skills, is_pro')
      .ilike('city', `%${proj.city.split(',')[0]}%`)
      .limit(30)

    if (!matchedUsers?.length) continue

    // Filter for stream match
    const relevantUsers = matchedUsers.filter((u: { streams?: string[] }) =>
      u.streams && u.streams.includes(project.stream)
    )

    if (!relevantUsers.length) continue

    // Save matches to DB
    const matchRecords = relevantUsers.map((u: { id: string }) => ({
      user_id: u.id,
      project_id: project.id,
      score: 0.80,
      status: 'pending',
    }))

    try {
      await supabaseAdmin.from('showbizy_matches').insert(matchRecords)
    } catch {
      // Ignore duplicate match errors
    }

    // Send notification emails (top 10 per project)
    for (const user of relevantUsers.slice(0, 10) as { id: string; name: string; email: string; is_pro?: boolean }[]) {
      try {
        await transporter.sendMail({
          from: '"ShowBizy" <admin@showbizy.ai>',
          to: user.email,
          subject: `New project in your area: ${project.title}`,
          headers: { 'X-Priority': '1', 'Importance': 'High' },
          text: `Hey ${user.name},\n\nA new project just dropped in ${proj.city} that matches your skills:\n\n${project.title}\nStream: ${project.stream}\nLocation: ${project.location}\n\n${project.description?.slice(0, 200) || ''}\n\n${user.is_pro ? `View and apply: https://showbizy.ai/projects/${project.id}` : `Upgrade to Pro to apply: https://showbizy.ai/pricing`}\n\n— ShowBizy`,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p>Hey ${user.name},</p>
<p>A new project just dropped in <strong>${proj.city}</strong> that matches your skills:</p>
<p>
<strong>${project.title}</strong><br>
Stream: ${project.stream}<br>
Location: ${project.location}
</p>
<p>${project.description?.slice(0, 200) || ''}${(project.description?.length || 0) > 200 ? '...' : ''}</p>
<p>${user.is_pro
  ? `<a href="https://showbizy.ai/projects/${project.id}">View and apply</a>`
  : `<a href="https://showbizy.ai/pricing">Upgrade to Pro to apply</a>`
}</p>
<p style="color:#666; font-size: 12px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#666;">showbizy.ai</a></p>
</div>`,
        })
      } catch (emailErr) {
        console.error(`Failed to send match email to ${user.email}:`, emailErr)
      }

      // Rate limit emails
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
}
