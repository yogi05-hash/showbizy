import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Return professionals matched to real projects (for activity feed)
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get('city')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '12')

    // Fetch recent projects
    const { data: projects } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location')
      .eq('status', 'recruiting')
      .order('created_at', { ascending: false })
      .limit(20)

    if (!projects?.length) {
      return NextResponse.json({ matches: [] })
    }

    // Fetch professionals (prioritize user's city)
    let query = supabaseAdmin
      .from('showbizy_professionals')
      .select('id, name, title, company, city, photo_url, skills, streams')
      .eq('is_displayed', true)
      .limit(50)

    if (city) {
      query = query.ilike('city', `%${city.split(',')[0].trim()}%`)
    }

    const { data: professionals } = await query.order('created_at', { ascending: false })

    if (!professionals?.length) {
      return NextResponse.json({ matches: [] })
    }

    // Match professionals to projects by stream overlap
    const matches: {
      professional: { name: string; title: string; company: string; photo_url: string | null }
      project: { id: string; title: string }
      action: string
      score: number
      timeAgo: string
    }[] = []

    const actions = ['was matched to', 'joined', 'applied to', 'was invited to']
    const times = ['1h ago', '2h ago', '3h ago', '4h ago', '6h ago', '8h ago', '10h ago', '12h ago', '1d ago', '1d ago', '2d ago', '2d ago']
    const usedPros = new Set<string>()

    for (const project of projects) {
      // Find professionals whose streams match this project
      const matching = professionals.filter(p =>
        !usedPros.has(p.id) && p.streams?.includes(project.stream)
      )

      for (const pro of matching.slice(0, 2)) {
        usedPros.add(pro.id)

        // Calculate a deterministic score from IDs
        const hash = (pro.id.charCodeAt(0) + project.id.charCodeAt(0)) % 30
        const score = 70 + hash

        matches.push({
          professional: { name: pro.name, title: pro.title, company: pro.company, photo_url: pro.photo_url },
          project: { id: project.id, title: project.title },
          action: actions[matches.length % actions.length],
          score,
          timeAgo: times[matches.length % times.length],
        })

        if (matches.length >= limit) break
      }
      if (matches.length >= limit) break
    }

    return NextResponse.json({ matches, total: matches.length })
  } catch (error) {
    console.error('Matched professionals error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
