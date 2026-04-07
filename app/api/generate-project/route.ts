import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

export async function POST(req: Request) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service not configured',
        message: 'Please set DEEPSEEK_API_KEY environment variable'
      }, { status: 503 })
    }

    const { talentProfiles, stream, location } = await req.json()

    const prompt = `You are ShowBizy AI — a creative project generator for a platform that matches creative talent with AI-generated projects.

Given the following available talent in ${location || 'London'}:
${talentProfiles ? JSON.stringify(talentProfiles) : 'A mix of directors, actors, cinematographers, editors, photographers, musicians, designers, and content creators.'}

Stream focus: ${stream || 'Any creative stream'}

Generate a compelling, achievable creative project brief. Return a JSON object:

{
  "title": "Compelling project title",
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
  "location_details": "Specific location suggestions within the city",
  "deliverables": ["Final deliverable 1", "Final deliverable 2"]
}

Make it creative, specific, achievable with a small team (3-8 people), and exciting enough that talented creatives would want to join. The project should feel like a real creative brief, not a template.`

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
            content: 'You are an expert creative director who generates inspiring, achievable project briefs across film, music, fashion, content, performing arts, visual arts, events, and brand campaigns. You understand how to assemble diverse creative teams and create projects that build portfolios and careers. Always respond with valid JSON only.'
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
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const completion = await response.json()
    console.log('DeepSeek response:', completion)
    
    let projectData
    try {
      let content = completion.choices?.[0]?.message?.content || '{}'
      console.log('Raw content:', content)
      
      // Clean up markdown code blocks if present
      content = content.replace(/```json\s*/, '').replace(/\s*```$/, '').trim()
      
      console.log('Cleaned content:', content)
      projectData = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content:', completion.choices?.[0]?.message?.content)
      throw new Error('Failed to parse AI response')
    }

    // Save project to database
    const { data: savedProject, error: projectError } = await supabaseAdmin
      .from('showbizy_projects')
      .insert([{
        title: projectData.title,
        stream: projectData.stream,
        genre: projectData.genre,
        location: location || 'London, UK',
        logline: projectData.logline,
        description: projectData.description,
        brief: projectData.description, // Use description as brief for now
        mood_style: projectData.mood_style,
        timeline: typeof projectData.timeline === 'object' ? JSON.stringify(projectData.timeline) : projectData.timeline,
        deliverables: projectData.deliverables || [],
        status: 'recruiting',
        team_size: projectData.roles_needed?.length || 5,
        filled_roles: 0,
        generated_by: 'ai'
      }])
      .select()
      .single()

    if (projectError) {
      console.error('Error saving project:', projectError)
      // Return the generated project even if database save fails
      const fallbackProject = {
        id: `temp_${Date.now()}`,
        ...projectData,
        location: location || 'London, UK',
        status: 'draft',
        created_at: new Date().toISOString(),
        teamSize: projectData.roles_needed?.length || 5,
        filledRoles: 0,
        roles: projectData.roles_needed?.map((role: any) => ({
          role: role.role,
          description: role.description,
          filled: false
        })) || []
      }
      
      return NextResponse.json({ 
        project: fallbackProject,
        warning: 'Project generated but not saved to database (tables do not exist yet)'
      })
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
        console.error('Error saving project roles:', rolesError)
      }
    }

    return NextResponse.json({ project: savedProject })
  } catch (error) {
    console.error('Error generating project:', error)
    return NextResponse.json(
      { error: 'Failed to generate project' },
      { status: 500 }
    )
  }
}
