import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET: List all projects with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const stream = searchParams.get('stream')
    const location = searchParams.get('location')
    const status = searchParams.get('status') || 'recruiting'
    
    let query = supabaseAdmin
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
          filled_at
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    // Apply filters
    if (stream) {
      query = query.eq('stream', stream)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Format projects to match frontend expectations
    const formattedProjects = projects?.map((project: any) => ({
      id: project.id,
      title: project.title,
      stream: project.stream,
      streamIcon: getStreamIcon(project.stream),
      genre: project.genre,
      location: project.location,
      timeline: formatTimeline(project.timeline),
      description: cleanText(project.description),
      brief: cleanText(project.brief || project.description),
      roles: project.showbizy_project_roles?.map((role: any) => ({
        role: role.role,
        description: role.description,
        filled: role.filled,
        member: role.filled ? { name: 'Team Member', avatar: '👤' } : undefined
      })) || [],
      teamSize: project.team_size,
      filledRoles: project.filled_roles,
      status: project.status,
      createdAt: project.created_at,
      milestones: generateMilestones(project.timeline, project.created_at)
    })) || []

    return NextResponse.json({ projects: formattedProjects })

  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a project manually (admin only)
export async function POST(req: Request) {
  try {
    const projectData = await req.json()

    const { data: savedProject, error: projectError } = await supabaseAdmin
      .from('showbizy_projects')
      .insert([{
        title: projectData.title,
        stream: projectData.stream,
        genre: projectData.genre,
        location: projectData.location,
        logline: projectData.logline,
        description: projectData.description,
        brief: projectData.brief,
        mood_style: projectData.mood_style,
        timeline: projectData.timeline,
        deliverables: projectData.deliverables || [],
        status: projectData.status || 'recruiting',
        team_size: projectData.team_size || 5,
        filled_roles: 0,
        generated_by: 'manual'
      }])
      .select()
      .single()

    if (projectError) {
      console.error('Error saving project:', projectError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Save project roles if provided
    if (projectData.roles && savedProject) {
      const roles = projectData.roles.map((role: any) => ({
        project_id: savedProject.id,
        role: role.role,
        description: role.description,
        skills_required: role.skills_required || [],
        filled: false
      }))

      const { error: rolesError } = await supabaseAdmin
        .from('showbizy_project_roles')
        .insert(roles)

      if (rolesError) {
        console.error('Error saving project roles:', rolesError)
      }
    }

    return NextResponse.json({ project: savedProject })

  } catch (error) {
    console.error('Projects POST error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

// Helper function to get stream icon
// Strip embedded JSON objects from text fields (AI sometimes dumps JSON into description)
function cleanText(text: string | null | undefined): string {
  if (!text) return ''
  // Remove JSON objects like {"total_weeks":14,"phases":[...]}
  let cleaned = text.replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '').trim()
  // Remove leftover artifacts
  cleaned = cleaned.replace(/\s*•\s*$/, '').replace(/^\s*•\s*/, '').trim()
  // Collapse multiple spaces/newlines
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
  return cleaned
}

function formatTimeline(timeline: string): string {
  try {
    if (typeof timeline === 'string' && timeline.startsWith('{')) {
      const data = JSON.parse(timeline)
      if (data.total_weeks) return `${data.total_weeks} weeks`
      if (data.phases && Array.isArray(data.phases)) {
        const totalWeeks = data.phases.reduce((sum: number, p: { duration?: string }) => {
          const match = p.duration?.match(/(\d+)/)
          return sum + (match ? parseInt(match[1]) : 0)
        }, 0)
        return totalWeeks > 0 ? `${totalWeeks} weeks` : 'TBD'
      }
    }
    return timeline || 'TBD'
  } catch {
    return timeline || 'TBD'
  }
}

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