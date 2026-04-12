import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Fetch messages for a project
export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('project_id')
    if (!projectId) {
      return NextResponse.json({ error: 'project_id required' }, { status: 400 })
    }

    const { data: messages, error } = await supabaseAdmin
      .from('showbizy_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Messages fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Send a message
export async function POST(req: NextRequest) {
  try {
    const { project_id, user_id, user_name, user_avatar, message } = await req.json()

    if (!project_id || !user_id || !message?.trim()) {
      return NextResponse.json({ error: 'project_id, user_id, and message required' }, { status: 400 })
    }

    // Verify user is part of this project (has a filled role)
    const { data: role } = await supabaseAdmin
      .from('showbizy_project_roles')
      .select('id')
      .eq('project_id', project_id)
      .eq('filled_by', user_id)
      .eq('filled', true)
      .limit(1)
      .single()

    if (!role) {
      return NextResponse.json({ error: 'You must join this project to send messages' }, { status: 403 })
    }

    const { data: msg, error } = await supabaseAdmin
      .from('showbizy_messages')
      .insert({
        project_id,
        user_id,
        user_name: user_name || 'Anonymous',
        user_avatar: user_avatar || null,
        message: message.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Message insert error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message: msg })
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
