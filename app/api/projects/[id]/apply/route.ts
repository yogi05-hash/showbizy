import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST: User applies to a specific role on a project
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
      .select('is_pro, name, skills, streams')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.is_pro) {
      return NextResponse.json({ 
        error: 'Pro membership required to apply for projects' 
      }, { status: 403 })
    }

    // Check if role exists and is available
    const { data: role, error: roleError } = await supabaseAdmin
      .from('showbizy_project_roles')
      .select('*')
      .eq('id', role_id)
      .eq('project_id', projectId)
      .single()

    if (roleError || !role) {
      return NextResponse.json({ 
        error: 'Role not found' 
      }, { status: 404 })
    }

    if (role.filled) {
      return NextResponse.json({ 
        error: 'Role is already filled' 
      }, { status: 400 })
    }

    // Check if user already applied for this role
    const { data: existingApplication } = await supabaseAdmin
      .from('showbizy_matches')
      .select('*')
      .eq('user_id', user_id)
      .eq('role_id', role_id)
      .eq('project_id', projectId)
      .single()

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'Already applied for this role' 
      }, { status: 400 })
    }

    // Create application/match record
    const { error: matchError } = await supabaseAdmin
      .from('showbizy_matches')
      .insert([{
        user_id,
        project_id: projectId,
        role_id,
        score: 75, // Default application score
        status: 'applied'
      }])

    if (matchError) {
      console.error('Error creating application:', matchError)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully' 
    })

  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}