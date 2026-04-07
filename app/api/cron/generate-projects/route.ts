import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

// POST: Auto-generate projects for active cities
export async function POST() {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service not configured' 
      }, { status: 503 })
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

    const uniqueCities = [...new Set((cities ?? []).map(c => c.city).filter(Boolean))]

    if (uniqueCities.length === 0) {
      return NextResponse.json({ message: 'No cities with active users found' })
    }

    const generatedProjects = []

    // Generate 1-2 projects for each city
    for (const city of uniqueCities.slice(0, 5)) { // Limit to 5 cities for now
      try {
        // Fetch talent profiles in this city
        const { data: talentInCity } = await supabaseAdmin
          .from('showbizy_users')
          .select('skills, streams, availability')
          .eq('city', city)
          .limit(10)

        const streams = ['Film & Video', 'Music', 'Fashion & Modelling', 'Influencer & Content', 'Visual Arts']
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
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.9,
          })
        })

        if (!response.ok) {
          console.error(`DeepSeek API error for ${city}: ${response.status}`)
          continue
        }

        const completion = await response.json()
        const projectData = JSON.parse(completion.choices[0].message.content || '{}')

        // Save project to database
        const { data: savedProject, error: projectError } = await supabaseAdmin
          .from('showbizy_projects')
          .insert([{
            title: projectData.title,
            stream: projectData.stream,
            genre: projectData.genre,
            location: `${city}`,
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
          const roles = projectData.roles_needed.map((role: any) => ({
            project_id: savedProject.id,
            role: role.role,
            description: role.description,
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