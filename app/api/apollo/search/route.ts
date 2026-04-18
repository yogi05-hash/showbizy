import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const APOLLO_API_KEY = process.env.APOLLO_API_KEY

function titleToStreams(title: string): string[] {
  const t = title.toLowerCase()
  const streams: string[] = []
  if (t.includes('director') || t.includes('producer') || t.includes('cinemat') || t.includes('editor') || t.includes('camera') || t.includes('film') || t.includes('video')) streams.push('Film & Video')
  if (t.includes('music') || t.includes('audio') || t.includes('sound') || t.includes('composer') || t.includes('dj')) streams.push('Music')
  if (t.includes('fashion') || t.includes('model') || t.includes('stylist')) streams.push('Fashion & Modelling')
  if (t.includes('content') || t.includes('influencer') || t.includes('social media') || t.includes('creator')) streams.push('Influencer & Content')
  if (t.includes('actor') || t.includes('actress') || t.includes('theatre') || t.includes('dancer')) streams.push('Performing Arts')
  if (t.includes('designer') || t.includes('illustrat') || t.includes('artist') || t.includes('photogr') || t.includes('animator')) streams.push('Visual Arts')
  if (t.includes('event') || t.includes('festival') || t.includes('live')) streams.push('Events & Live')
  if (streams.length === 0) streams.push('Film & Video')
  return streams
}

function titleToSkills(title: string): string[] {
  const t = title.toLowerCase()
  const skills: string[] = []
  if (t.includes('director')) skills.push('directing', 'leadership')
  if (t.includes('producer')) skills.push('production', 'project management')
  if (t.includes('cinemat') || t.includes('camera')) skills.push('cinematography', 'lighting')
  if (t.includes('editor')) skills.push('video editing', 'post-production')
  if (t.includes('music') || t.includes('composer')) skills.push('music production', 'composition')
  if (t.includes('sound') || t.includes('audio')) skills.push('sound design', 'audio engineering')
  if (t.includes('photogr')) skills.push('photography', 'retouching')
  if (t.includes('designer')) skills.push('design', 'branding')
  if (t.includes('anim')) skills.push('animation', 'motion graphics')
  if (t.includes('actor') || t.includes('actress')) skills.push('acting', 'voice acting')
  if (t.includes('content') || t.includes('creator')) skills.push('content creation', 'social media')
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
      titles = ['Director', 'Producer', 'Cinematographer', 'Editor', 'Music Producer', 'Photographer', 'Content Creator'],
      locations = ['London, United Kingdom'],
      perPage = 10,
      page = 1,
    } = body

    // Step 1: Search for people (returns obfuscated names)
    const searchRes = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_API_KEY },
      body: JSON.stringify({
        person_titles: titles,
        person_locations: locations,
        per_page: Math.min(perPage, 25),
        page,
      }),
    })

    if (!searchRes.ok) {
      return NextResponse.json({ error: `Apollo search error: ${searchRes.status}` }, { status: searchRes.status })
    }

    const searchData = await searchRes.json()
    const people = searchData.people || []

    // Step 2: Enrich each person to get full name + photo (costs 1 credit each)
    let saved = 0
    let skipped = 0

    for (const person of people.slice(0, Math.min(perPage, 25))) {
      try {
        // Enrich to get full data
        const matchRes = await fetch('https://api.apollo.io/api/v1/people/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_API_KEY },
          body: JSON.stringify({ id: person.id, reveal_personal_emails: false }),
        })

        if (!matchRes.ok) { skipped++; continue }

        const matchData = await matchRes.json()
        const p = matchData.person
        if (!p || !p.name) { skipped++; continue }

        const title = p.title || ''
        const company = p.organization?.name || p.employment_history?.[0]?.organization_name || ''
        const city = p.city || locations[0]?.split(',')[0] || ''

        const { error } = await supabaseAdmin
          .from('showbizy_professionals')
          .upsert({
            apollo_id: p.id,
            name: p.name,
            email: p.email || null,
            title,
            company,
            city,
            country: p.country || '',
            linkedin_url: p.linkedin_url || null,
            photo_url: p.photo_url || null,
            skills: titleToSkills(title),
            streams: titleToStreams(title),
            headline: p.headline || `${title} at ${company}`,
            source: 'apollo',
            is_displayed: true,
          }, { onConflict: 'apollo_id' })

        if (!error) saved++
        else skipped++
      } catch {
        skipped++
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 300))
    }

    return NextResponse.json({
      success: true,
      total: people.length,
      saved,
      skipped,
      totalInApollo: searchData.total_entries,
    })
  } catch (error) {
    console.error('Apollo search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
