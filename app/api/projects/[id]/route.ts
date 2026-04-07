import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET: Fetch single project with all roles and team members
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const { data: project, error } = await supabaseAdmin
      .from('showbizy_projects')
      .select(`
        *,
        showbizy_project_roles (
          id,
          role,
          description,
          skills_required,
          filled,
          filled_by,
          filled_at,
          showbizy_users (
            id,
            name,
            avatar
          )
        )
      `)
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Format project to match frontend expectations
    const formattedProject = {
      id: project.id,
      title: project.title,
      stream: project.stream,
      streamIcon: getStreamIcon(project.stream),
      genre: project.genre,
      location: project.location,
      timeline: formatTimeline(project.timeline),
      description: project.description,
      brief: project.brief || project.description,
      roles: project.showbizy_project_roles?.map((role: any) => ({
        id: role.id,
        role: role.role,
        description: role.description,
        skills_required: role.skills_required,
        filled: role.filled,
        member: role.filled && role.showbizy_users ? {
          id: role.showbizy_users.id,
          name: role.showbizy_users.name,
          avatar: role.showbizy_users.avatar || '👤'
        } : undefined
      })) || [],
      teamSize: project.team_size,
      filledRoles: project.filled_roles,
      status: project.status,
      createdAt: project.created_at,
      milestones: generateMilestones(project.timeline, project.created_at)
    }

    return NextResponse.json({ project: formattedProject })

  } catch (error) {
    console.error('Project GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Join a project (user_id + role_id) — only for Pro users
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const { user_id, role_id } = await req.json()

    if (!user_id || !role_id) {
      return NextResponse.json({ 
        error: 'user_id and role_id are required' 
      }, { status: 400 })
    }

    // Check if user is Pro
    const { data: user, error: userError } = await supabaseAdmin
      .from('showbizy_users')
      .select('is_pro')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.is_pro) {
      return NextResponse.json({ 
        error: 'Pro membership required to join projects' 
      }, { status: 403 })
    }

    // Check if role is still available
    const { data: role, error: roleError } = await supabaseAdmin
      .from('showbizy_project_roles')
      .select('*')
      .eq('id', role_id)
      .eq('project_id', projectId)
      .eq('filled', false)
      .single()

    if (roleError || !role) {
      return NextResponse.json({ 
        error: 'Role not available or already filled' 
      }, { status: 400 })
    }

    // Fill the role
    const { error: updateError } = await supabaseAdmin
      .from('showbizy_project_roles')
      .update({
        filled: true,
        filled_by: user_id,
        filled_at: new Date().toISOString()
      })
      .eq('id', role_id)

    if (updateError) {
      console.error('Error filling role:', updateError)
      return NextResponse.json({ error: 'Failed to join project' }, { status: 500 })
    }

    // Update project filled_roles count
    const { data: projectRoles } = await supabaseAdmin
      .from('showbizy_project_roles')
      .select('filled')
      .eq('project_id', projectId)

    const filledCount = projectRoles?.filter(r => r.filled).length || 0

    await supabaseAdmin
      .from('showbizy_projects')
      .update({ filled_roles: filledCount })
      .eq('id', projectId)

    return NextResponse.json({ success: true, message: 'Successfully joined project' })

  } catch (error) {
    console.error('Project POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to format timeline JSON into readable string
function formatTimeline(timeline: string): string {
  try {
    if (typeof timeline === 'string' && timeline.startsWith('{')) {
      const data = JSON.parse(timeline)
      if (data.total_weeks) {
        return `${data.total_weeks} weeks`
      }
      if (data.phases && Array.isArray(data.phases)) {
        const totalWeeks = data.phases.reduce((sum: number, p: { duration?: string }) => {
          const match = p.duration?.match(/(\d+)/)
          return sum + (match ? parseInt(match[1]) : 0)
        }, 0)
        return totalWeeks > 0 ? `${totalWeeks} weeks` : timeline
      }
    }
    return timeline || 'TBD'
  } catch {
    return timeline || 'TBD'
  }
}

// Helper function to get stream icon
function getStreamIcon(stream: string): string {
  const icons: { [key: string]: string } = {
    'Film & Video': '🎬',
    'Music': '🎵',
    'Fashion & Modelling': '👗',
    'Influencer & Content': '📱',
    'Performing Arts': '🎭',
    'Visual Arts': '🎨',
    'Events & Live': '🎤',
    'Brands & Businesses': '💼'
  }
  return icons[stream] || '🎨'
}

// Helper function to generate milestones based on timeline
function generateMilestones(timeline: string, createdAt: string) {
  try {
    // Parse timeline if it's JSON
    let timelineData
    if (typeof timeline === 'string' && timeline.startsWith('{')) {
      timelineData = JSON.parse(timeline)
    }

    if (timelineData?.phases) {
      return timelineData.phases.map((phase: any, index: number) => ({
        name: phase.name,
        status: index === 0 ? 'active' : 'upcoming',
        date: phase.duration
      }))
    }

    // Fallback: generate basic milestones
    return [
      { name: 'Pre-production', status: 'active', date: 'Week 1-2' },
      { name: 'Production', status: 'upcoming', date: 'Week 3-4' },
      { name: 'Post-production', status: 'upcoming', date: 'Week 5-6' },
      { name: 'Published', status: 'upcoming', date: 'Week 7' },
    ]
  } catch {
    return [
      { name: 'Pre-production', status: 'active', date: 'TBD' },
      { name: 'Production', status: 'upcoming', date: 'TBD' },
      { name: 'Post-production', status: 'upcoming', date: 'TBD' },
      { name: 'Published', status: 'upcoming', date: 'TBD' },
    ]
  }
}