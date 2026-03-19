import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(req: Request) {
  try {
    if (!openai) {
      return NextResponse.json({ 
        error: 'AI service not configured',
        message: 'Please set OPENAI_API_KEY environment variable'
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert creative director who generates inspiring, achievable project briefs across film, music, fashion, content, performing arts, visual arts, events, and brand campaigns. You understand how to assemble diverse creative teams and create projects that build portfolios and careers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
    })

    const projectData = JSON.parse(completion.choices[0].message.content || '{}')

    const fullProject = {
      ...projectData,
      location: location || 'London, UK',
      status: 'draft',
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ project: fullProject })
  } catch (error) {
    console.error('Error generating project:', error)
    return NextResponse.json(
      { error: 'Failed to generate project' },
      { status: 500 }
    )
  }
}
