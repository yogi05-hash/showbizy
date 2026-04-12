import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Fetch projects a user has joined
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id')
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    // Find all roles filled by this user, with project details
    const { data: roles, error } = await supabaseAdmin
      .from('showbizy_project_roles')
      .select(`
        role,
        filled_at,
        showbizy_projects (
          id,
          title,
          stream,
          location,
          status
        )
      `)
      .eq('filled_by', userId)
      .eq('filled', true)
      .order('filled_at', { ascending: false })

    if (error) {
      console.error('User projects fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    const projects = (roles || []).map((r: any) => ({
      id: r.showbizy_projects?.id,
      title: r.showbizy_projects?.title,
      stream: r.showbizy_projects?.stream,
      location: r.showbizy_projects?.location,
      status: r.showbizy_projects?.status || 'active',
      role: r.role,
    })).filter((p: any) => p.id)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('User projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
