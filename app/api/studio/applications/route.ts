import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    // Get all projects posted by this Studio
    const { data: projects } = await supabaseAdmin
      .from('showbizy_projects')
      .select('id, title, stream, location, created_at')
      .eq('posted_by_studio_id', userId)
      .order('created_at', { ascending: false })

    if (!projects || projects.length === 0) {
      return NextResponse.json({ projects: [], applications: [] })
    }

    const projectIds = projects.map(p => p.id)

    // Get matches for these projects (these are the "applications" — AI-suggested + actual joins)
    const { data: matches } = await supabaseAdmin
      .from('showbizy_matches')
      .select('id, project_id, user_id, score, status, created_at')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })

    // Get user details for each match
    const userIds = [...new Set((matches || []).map(m => m.user_id))]
    const { data: users } = userIds.length > 0
      ? await supabaseAdmin
          .from('showbizy_users')
          .select('id, name, email, city, streams, skills, avatar')
          .in('id', userIds)
      : { data: [] }

    const userMap = new Map((users || []).map((u: { id: string }) => [u.id, u]))

    const enrichedApps = (matches || []).map(m => {
      const project = projects.find(p => p.id === m.project_id)
      const user = userMap.get(m.user_id)
      return {
        id: m.id,
        project_id: m.project_id,
        project_title: project?.title || 'Unknown',
        project_stream: project?.stream || '',
        user_id: m.user_id,
        user,
        score: m.score,
        status: m.status,
        created_at: m.created_at,
      }
    })

    return NextResponse.json({ projects, applications: enrichedApps })
  } catch (error) {
    console.error('Studio applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update application status
export async function PATCH(req: Request) {
  try {
    const { application_id, status } = await req.json()
    if (!application_id || !status) {
      return NextResponse.json({ error: 'application_id and status required' }, { status: 400 })
    }
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('showbizy_matches')
      .update({ status })
      .eq('id', application_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
