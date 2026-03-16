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

    const { type, genre, city, duration, budget } = await req.json()

    const prompt = `Create a complete film project brief for a ${duration} ${genre} ${type} to be shot in ${city} with a budget of £${budget}.

Generate a JSON object with the following structure:
{
  "title": "Compelling project title",
  "logline": "One sentence hook (max 30 words)",
  "synopsis": "3-4 paragraph story summary including beginning, middle, and end",
  "characters": [
    {
      "name": "Character name",
      "age": "Age range",
      "description": "Physical and personality description",
      "archetype": "Character archetype"
    }
  ],
  "locations": [
    {
      "name": "Location name",
      "description": "Detailed description of setting",
      "type": "interior/exterior",
      "scenes": ["Scene descriptions"]
    }
  ],
  "visual_style": {
    "mood": "Overall mood/atmosphere",
    "color_palette": "Color scheme description",
    "cinematography": "Camera work style",
    "references": ["Film references"]
  },
  "production_notes": {
    "shooting_days": number,
    "crew_size": "Small/Medium/Large",
    "equipment_needs": ["Camera", "Lighting", "Sound", etc.],
    "special_requirements": ["Any special needs"]
  },
  "roles_needed": [
    {
      "role": "Job title",
      "description": "What they do",
      "skills_required": ["Required skills"]
    }
  ],
  "distribution_strategy": ["Film festivals", "Online platforms", etc.]
}

Make it creative, specific, and achievable on the given budget. Include 3-5 characters and 2-4 locations. Make the story compelling and original.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert film producer and screenwriter who creates compelling, achievable indie film projects. You understand budget constraints and realistic production requirements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })

    const projectData = JSON.parse(completion.choices[0].message.content || '{}')

    const fullProject = {
      ...projectData,
      type,
      genre,
      city,
      duration,
      budget_estimate: budget,
      timeline_weeks: Math.ceil(projectData.production_notes?.shooting_days / 5) + 4,
      status: 'draft',
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