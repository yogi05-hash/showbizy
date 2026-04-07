import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

// GET: Fetch matches for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const { data: matches, error } = await supabaseAdmin
      .from('showbizy_matches')
      .select(`
        *,
        showbizy_projects (
          id,
          title,
          stream,
          genre,
          location,
          description,
          status,
          team_size,
          filled_roles,
          created_at
        ),
        showbizy_project_roles (
          id,
          role,
          description,
          skills_required
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('score', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching matches:', error)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Match GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Run matching for a specific user
export async function POST(req: Request) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service not configured' 
      }, { status: 503 })
    }

    const { user_id } = await req.json()

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Fetch user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('showbizy_users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch all recruiting projects in user's city (or nearby)
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('showbizy_projects')
      .select(`
        *,
        showbizy_project_roles (*)
      `)
      .eq('status', 'recruiting')
      .ilike('location', `%${user.city || 'London'}%`)

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Use DeepSeek to score matches
    const matchingPrompt = `You are an AI matching engine for creative projects.

User Profile:
- Skills: ${JSON.stringify(user.skills || [])}
- Streams: ${JSON.stringify(user.streams || [])}
- City: ${user.city || 'London'}
- Availability: ${user.availability || 'Unknown'}

Available Projects: ${JSON.stringify(projects)}

For each project, score the match (0-100) based on:
1. Skills alignment with required roles
2. Stream/industry match
3. Location compatibility
4. Availability fit

Return JSON array:
[
  {
    "project_id": "uuid",
    "role_id": "uuid", 
    "score": number,
    "reasoning": "brief explanation"
  }
]

Only include matches with score >= 60.`

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
            content: 'You are an expert talent matcher for creative projects. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: matchingPrompt
          }
        ],
        temperature: 0.3,
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const completion = await response.json()
    const matches = JSON.parse(completion.choices[0].message.content || '[]')

    // Save matches to database
    const matchRecords = matches.map((match: any) => ({
      user_id,
      project_id: match.project_id,
      role_id: match.role_id,
      score: match.score,
      status: 'pending'
    }))

    if (matchRecords.length > 0) {
      const { error: saveError } = await supabaseAdmin
        .from('showbizy_matches')
        .upsert(matchRecords, { 
          onConflict: 'user_id,project_id,role_id',
          ignoreDuplicates: false 
        })

      if (saveError) {
        console.error('Error saving matches:', saveError)
      }
    }

    return NextResponse.json({ 
      matches: matchRecords.length,
      generated: matches 
    })

  } catch (error) {
    console.error('Match POST error:', error)
    return NextResponse.json({ error: 'Failed to generate matches' }, { status: 500 })
  }
}