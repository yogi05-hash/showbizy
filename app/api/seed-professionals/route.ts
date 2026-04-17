import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

const COMPANIES: Record<string, string[]> = {
  London: ['BBC Studios', 'ITV Studios', 'Channel 4', 'Sky Studios', 'Pinewood Studios', 'Working Title Films', 'Framestore', 'Endemol Shine UK', 'Sony Music UK', 'Universal Music UK', 'Storm Management', 'The National Theatre'],
  Manchester: ['BBC North', 'ITV Granada', 'Dock10 Studios', 'MediaCityUK', 'Factory International', 'Screen Manchester'],
  'Los Angeles': ['Netflix', 'Disney Studios', 'Warner Bros.', 'Universal Pictures', 'A24', 'Interscope Records', 'Capitol Records', 'CAA'],
  'New York': ['NBCUniversal', 'HBO', 'Atlantic Records', 'Columbia Records', 'Condé Nast', 'Vice Media'],
  Mumbai: ['Yash Raj Films', 'Dharma Productions', 'Excel Entertainment', 'T-Series', 'Zee Studios', 'Red Chillies Entertainment'],
  Lagos: ['EbonyLife Studios', 'Inkblot Productions', 'Mavin Records', 'Chocolate City', 'iROKOtv'],
}

// POST: Generate professionals for ONE city in ONE DeepSeek call
// Body: { "city": "London" }
export async function POST(req: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'DeepSeek not configured' }, { status: 503 })
    }

    const body = await req.json().catch(() => ({}))
    const city = body.city || 'London'
    const companies = COMPANIES[city] || COMPANIES['London']

    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Generate realistic entertainment industry professional profiles. Output ONLY a valid JSON array — no markdown, no explanation, no code blocks. Each object: {"name":"full name","title":"job title","company":"company","headline":"one line bio","stream":"one of: Film & Video, Music, Fashion & Modelling, Influencer & Content, Performing Arts, Visual Arts, Events & Live"}'
          },
          {
            role: 'user',
            content: `Generate 12 entertainment professionals based in ${city}. Mix across Film, Music, Fashion, Content Creation, Performing Arts, Visual Arts, Events. Use these real companies: ${companies.join(', ')}. Names should be culturally appropriate for ${city}. Mix genders. Each person should have a unique realistic title and a one-line headline about their work.`
          }
        ],
        temperature: 0.9,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `DeepSeek error: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content?.trim() || '[]'
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let profiles: { name: string; title: string; company: string; headline: string; stream: string }[]
    try {
      profiles = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Failed to parse DeepSeek response', raw: content.substring(0, 200) }, { status: 500 })
    }

    let saved = 0
    for (const p of profiles) {
      if (!p.name) continue

      const titleLower = (p.title || '').toLowerCase()
      const skills: string[] = []
      if (titleLower.includes('direct')) skills.push('directing', 'leadership')
      if (titleLower.includes('produc')) skills.push('production', 'project management')
      if (titleLower.includes('cinemat') || titleLower.includes('camera')) skills.push('cinematography', 'lighting')
      if (titleLower.includes('edit')) skills.push('video editing', 'post-production')
      if (titleLower.includes('music') || titleLower.includes('compos')) skills.push('music production', 'composition')
      if (titleLower.includes('sound') || titleLower.includes('engineer')) skills.push('sound design', 'audio engineering')
      if (titleLower.includes('photo')) skills.push('photography', 'retouching')
      if (titleLower.includes('design')) skills.push('design', 'branding')
      if (titleLower.includes('anim')) skills.push('animation', 'motion graphics')
      if (titleLower.includes('actor') || titleLower.includes('actress')) skills.push('acting', 'voice acting')
      if (titleLower.includes('model')) skills.push('modelling')
      if (titleLower.includes('content') || titleLower.includes('creator')) skills.push('content creation', 'social media')
      if (titleLower.includes('event') || titleLower.includes('festival')) skills.push('event production', 'live events')
      if (skills.length === 0) skills.push('creative', 'production')

      try {
        await supabaseAdmin.from('showbizy_professionals').insert({
          name: p.name,
          title: p.title,
          company: p.company,
          city,
          headline: p.headline,
          skills,
          streams: [p.stream || 'Film & Video'],
          source: 'seed',
          is_displayed: true,
        })
        saved++
      } catch {}
    }

    return NextResponse.json({ success: true, city, generated: profiles.length, saved })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}
