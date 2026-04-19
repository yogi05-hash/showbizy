import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Find professionals matching a specific user's skills/streams/city
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    // Get user profile
    const { data: user } = await supabaseAdmin
      .from('showbizy_users')
      .select('skills, streams, city')
      .eq('id', userId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const userCity = (user.city || '').split(',')[0].trim()
    const userStreams: string[] = user.streams || []
    const userSkills: string[] = user.skills || []

    // Fetch professionals in same city
    let query = supabaseAdmin
      .from('showbizy_professionals')
      .select('id, name, title, company, city, photo_url, skills, streams, headline')
      .eq('is_displayed', true)
      .limit(50)

    if (userCity) {
      query = query.ilike('city', `%${userCity}%`)
    }

    const { data: pros } = await query

    if (!pros?.length) return NextResponse.json({ professionals: [], total: 0 })

    // Score each professional by skill/stream overlap with user
    const scored = pros.map(pro => {
      let score = 0
      const proSkills: string[] = pro.skills || []
      const proStreams: string[] = pro.streams || []

      // Stream overlap
      for (const s of proStreams) {
        if (userStreams.includes(s)) score += 20
      }

      // Skill overlap (keyword matching)
      for (const userSkill of userSkills) {
        const us = userSkill.toLowerCase()
        for (const proSkill of proSkills) {
          const ps = proSkill.toLowerCase()
          if (us.includes(ps) || ps.includes(us)) { score += 15; break }
        }
      }

      // City match bonus
      if (userCity && (pro.city || '').toLowerCase().includes(userCity.toLowerCase())) score += 10

      return { ...pro, matchScore: Math.min(99, score) }
    })
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8)

    return NextResponse.json({ professionals: scored, total: scored.length })
  } catch (error) {
    console.error('Professionals for-user error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
