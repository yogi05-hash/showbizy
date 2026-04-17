import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

// Real entertainment companies for realism
const COMPANIES: Record<string, string[]> = {
  London: ['BBC Studios', 'ITV Studios', 'Channel 4', 'Sky Studios', 'Pinewood Studios', 'Warner Bros. UK', 'Working Title Films', 'Framestore', 'Double Negative', 'MPC London', 'Endemol Shine UK', 'Fremantle UK', 'Sony Music UK', 'Universal Music UK', 'IMG Models London', 'Storm Management', 'Premier Model Management', 'The National Theatre', 'Royal Shakespeare Company', 'Sadlers Wells'],
  Manchester: ['BBC North', 'ITV Granada', 'Dock10 Studios', 'MediaCityUK', 'Factory International', 'Manchester International Festival', 'Band on the Wall', 'Screen Manchester'],
  'Los Angeles': ['Netflix', 'Disney Studios', 'Warner Bros.', 'Universal Pictures', 'Paramount', 'Sony Pictures', 'Lionsgate', 'A24', 'DreamWorks Animation', 'Interscope Records', 'Capitol Records', 'CAA', 'WME', 'UTA'],
  'New York': ['NBCUniversal', 'ViacomCBS', 'HBO', 'Sesame Workshop', 'Blue Sky Studios', 'Atlantic Records', 'Columbia Records', 'Condé Nast', 'Vice Media', 'Broadway League'],
  Mumbai: ['Yash Raj Films', 'Dharma Productions', 'Excel Entertainment', 'T-Series', 'Zee Studios', 'Balaji Motion Pictures', 'Red Chillies Entertainment', 'Phantom Films', 'Tips Music', 'Sony Music India'],
  Lagos: ['EbonyLife Studios', 'Inkblot Productions', 'Mavin Records', 'Chocolate City', 'Empire Mates Entertainment', 'iROKOtv', 'FilmOne Entertainment'],
}

const TITLES_BY_STREAM: Record<string, string[]> = {
  'Film & Video': ['Director', 'Producer', 'Cinematographer', 'Editor', 'Production Manager', 'VFX Supervisor', 'Colorist', 'Script Supervisor', 'Assistant Director', 'Camera Operator'],
  'Music': ['Music Producer', 'Sound Engineer', 'Composer', 'Session Musician', 'A&R Manager', 'Studio Manager', 'Mix Engineer', 'Mastering Engineer', 'Music Supervisor'],
  'Fashion & Modelling': ['Fashion Photographer', 'Stylist', 'Model', 'Creative Director', 'Fashion Designer', 'Makeup Artist', 'Art Director'],
  'Influencer & Content': ['Content Creator', 'Social Media Manager', 'Brand Strategist', 'Video Producer', 'UGC Creator', 'Digital Marketing Manager'],
  'Performing Arts': ['Actor', 'Dancer', 'Theatre Director', 'Choreographer', 'Stage Manager', 'Voice Actor', 'Casting Director'],
  'Visual Arts': ['Graphic Designer', 'Illustrator', 'Animator', 'Motion Graphics Artist', 'Art Director', 'Photographer', '3D Artist'],
  'Events & Live': ['Event Producer', 'Festival Director', 'Live Sound Engineer', 'Lighting Designer', 'Stage Designer', 'Tour Manager'],
}

export async function POST(req: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'DeepSeek not configured' }, { status: 503 })
    }

    const body = await req.json().catch(() => ({}))
    const targetCity = body.city || null
    const allCities = Object.keys(COMPANIES)
    const cities = targetCity ? allCities.filter(c => c.toLowerCase().includes(targetCity.toLowerCase())) : allCities.slice(0, 1)
    const streams = Object.keys(TITLES_BY_STREAM)
    let totalSaved = 0

    for (const city of cities) {
      const companies = COMPANIES[city]

      for (const stream of streams) {
        const titles = TITLES_BY_STREAM[stream]

        // Generate 3-5 professionals per city per stream
        try {
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
                  content: 'Generate realistic professional profiles. Output ONLY a JSON array. No markdown, no explanation. Each object must have: name (realistic full name matching the city/culture), title (from the list), company (from the list), headline (one line bio). Mix genders and ethnicities appropriate for the city.'
                },
                {
                  role: 'user',
                  content: `Generate 4 professionals in ${city} for the ${stream} industry.
Possible titles: ${titles.join(', ')}
Possible companies: ${companies.join(', ')}
Output JSON array: [{"name":"...","title":"...","company":"...","headline":"..."}]`
                }
              ],
              temperature: 0.9,
              max_tokens: 500,
            }),
          })

          if (!response.ok) continue

          const data = await response.json()
          let content = data.choices?.[0]?.message?.content?.trim() || '[]'
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

          let profiles: { name: string; title: string; company: string; headline: string }[]
          try {
            profiles = JSON.parse(content)
          } catch { continue }

          for (const profile of profiles) {
            if (!profile.name) continue

            const titleLower = profile.title.toLowerCase()
            const skills: string[] = []
            if (titleLower.includes('direct')) skills.push('directing', 'leadership', 'storytelling')
            if (titleLower.includes('produc')) skills.push('production', 'project management')
            if (titleLower.includes('cinemat') || titleLower.includes('camera')) skills.push('cinematography', 'lighting')
            if (titleLower.includes('edit')) skills.push('video editing', 'post-production')
            if (titleLower.includes('music') || titleLower.includes('compos')) skills.push('music production', 'composition')
            if (titleLower.includes('sound') || titleLower.includes('engineer')) skills.push('sound design', 'audio engineering')
            if (titleLower.includes('photo')) skills.push('photography', 'retouching')
            if (titleLower.includes('design')) skills.push('design', 'visual communication')
            if (titleLower.includes('anim')) skills.push('animation', 'motion graphics')
            if (titleLower.includes('actor') || titleLower.includes('actress')) skills.push('acting', 'voice acting')
            if (titleLower.includes('model')) skills.push('modelling', 'posing')
            if (titleLower.includes('content') || titleLower.includes('creator')) skills.push('content creation', 'social media')
            if (skills.length === 0) skills.push('creative', 'production')

            try {
              await supabaseAdmin
                .from('showbizy_professionals')
                .insert({
                  name: profile.name,
                  title: profile.title,
                  company: profile.company,
                  city,
                  headline: profile.headline,
                  skills,
                  streams: [stream],
                  source: 'seed',
                  is_displayed: true,
                })
              totalSaved++
            } catch {}
          }
        } catch (err) {
          console.error(`Seed error for ${city}/${stream}:`, err)
        }

        // Rate limit DeepSeek
        await new Promise(r => setTimeout(r, 500))
      }
    }

    return NextResponse.json({ success: true, saved: totalSaved })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}
