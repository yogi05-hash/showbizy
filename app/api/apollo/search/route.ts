import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const APOLLO_API_KEY = process.env.APOLLO_API_KEY
const APOLLO_ENDPOINT = 'https://api.apollo.io/api/v1/mixed_people/search'

// Map job titles to ShowBizy streams
function titleToStreams(title: string): string[] {
  const t = title.toLowerCase()
  const streams: string[] = []
  if (t.includes('director') || t.includes('producer') || t.includes('cinemat') || t.includes('editor') || t.includes('camera') || t.includes('film') || t.includes('video')) streams.push('Film & Video')
  if (t.includes('music') || t.includes('audio') || t.includes('sound') || t.includes('composer') || t.includes('dj') || t.includes('songwriter')) streams.push('Music')
  if (t.includes('fashion') || t.includes('model') || t.includes('stylist')) streams.push('Fashion & Modelling')
  if (t.includes('content') || t.includes('influencer') || t.includes('social media') || t.includes('creator')) streams.push('Influencer & Content')
  if (t.includes('actor') || t.includes('actress') || t.includes('theatre') || t.includes('theater') || t.includes('dancer') || t.includes('performer')) streams.push('Performing Arts')
  if (t.includes('designer') || t.includes('illustrat') || t.includes('artist') || t.includes('photogr') || t.includes('animator')) streams.push('Visual Arts')
  if (t.includes('event') || t.includes('festival') || t.includes('live') || t.includes('concert')) streams.push('Events & Live')
  if (streams.length === 0) streams.push('Film & Video')
  return streams
}

// Map title to skills
function titleToSkills(title: string): string[] {
  const t = title.toLowerCase()
  const skills: string[] = []
  if (t.includes('director')) skills.push('directing', 'leadership', 'storytelling')
  if (t.includes('producer')) skills.push('production', 'project management', 'budgeting')
  if (t.includes('cinemat') || t.includes('camera')) skills.push('cinematography', 'camera operation', 'lighting')
  if (t.includes('editor')) skills.push('video editing', 'post-production', 'color grading')
  if (t.includes('music') || t.includes('composer')) skills.push('music production', 'composition', 'arrangement')
  if (t.includes('sound') || t.includes('audio')) skills.push('sound design', 'audio engineering', 'mixing')
  if (t.includes('photogr')) skills.push('photography', 'lighting', 'retouching')
  if (t.includes('designer')) skills.push('design', 'visual communication', 'branding')
  if (t.includes('animator') || t.includes('animat')) skills.push('animation', 'motion graphics', 'vfx')
  if (t.includes('actor') || t.includes('actress')) skills.push('acting', 'voice acting', 'improvisation')
  if (t.includes('model')) skills.push('modelling', 'posing', 'commercial modelling')
  if (t.includes('content') || t.includes('creator')) skills.push('content creation', 'social media', 'storytelling')
  if (skills.length === 0) skills.push('creative', 'production')
  return skills
}

export async function POST(req: NextRequest) {
  try {
    if (!APOLLO_API_KEY) {
      return NextResponse.json({ error: 'Apollo API not configured' }, { status: 503 })
    }

    const body = await req.json()
    const {
      titles = ['Director', 'Producer', 'Cinematographer', 'Editor', 'Music Producer', 'Photographer', 'Content Creator', 'Actor', 'Animator'],
      locations = ['London', 'Manchester', 'Los Angeles', 'New York', 'Mumbai'],
      perPage = 25,
      page = 1,
    } = body

    const response = await fetch(APOLLO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        person_titles: titles,
        person_locations: locations,
        per_page: Math.min(perPage, 100),
        page,
        person_seniorities: ['entry', 'senior', 'manager', 'director', 'vp', 'owner', 'founder'],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Apollo API error:', response.status, err)
      return NextResponse.json({ error: `Apollo API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const people = data.people || []

    // Save to database
    let saved = 0
    let skipped = 0

    for (const person of people) {
      const name = [person.first_name, person.last_name].filter(Boolean).join(' ')
      if (!name) { skipped++; continue }

      const title = person.title || person.headline || ''
      const city = person.city || person.state || ''
      const country = person.country || ''
      const streams = titleToStreams(title)
      const skills = titleToSkills(title)

      try {
        const { error } = await supabaseAdmin
          .from('showbizy_professionals')
          .upsert({
            apollo_id: person.id,
            name,
            email: person.email || null,
            title,
            company: person.organization?.name || '',
            city,
            country,
            linkedin_url: person.linkedin_url || null,
            photo_url: person.photo_url || null,
            skills,
            streams,
            headline: person.headline || title,
            source: 'apollo',
          }, { onConflict: 'apollo_id' })

        if (!error) saved++
        else skipped++
      } catch {
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      total: people.length,
      saved,
      skipped,
      pagination: data.pagination,
    })
  } catch (error) {
    console.error('Apollo search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
