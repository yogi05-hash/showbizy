import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const STREAMS_VALID = ['Film & Video', 'Music', 'Fashion & Modelling', 'Influencer & Content', 'Performing Arts', 'Visual Arts', 'Events & Live', 'Brands & Businesses']

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      user_id,
      title,
      stream,
      genre,
      location,
      brief,
      mood_style,
      timeline,
      deliverables,
      roles, // array of { role, description, skills_required }
    } = body

    if (!user_id || !title || !stream || !location || !brief || !roles?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!STREAMS_VALID.includes(stream)) {
      return NextResponse.json({ error: 'Invalid stream' }, { status: 400 })
    }

    // Verify user is Studio AND verified
    const { data: user, error: userErr } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, plan, is_pro, verified, company_name')
      .eq('id', user_id)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.plan !== 'studio') {
      return NextResponse.json({ error: 'Studio plan required to post projects' }, { status: 403 })
    }

    if (!user.verified) {
      return NextResponse.json({ error: 'Studio verification pending. Please wait for admin approval (24-48 hours).' }, { status: 403 })
    }

    // Insert project
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('showbizy_projects')
      .insert({
        title,
        stream,
        genre: genre || null,
        location,
        brief,
        description: brief.slice(0, 200),
        mood_style: mood_style || null,
        timeline: timeline || '4 weeks',
        deliverables: deliverables || [],
        team_size: roles.length,
        filled_roles: 0,
        status: 'recruiting',
        generated_by: 'studio',
        posted_by_studio_id: user_id,
      })
      .select()
      .single()

    if (projectErr || !project) {
      console.error('Project creation error:', projectErr)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Insert roles
    const rolesData = roles.map((r: { role: string; description?: string; skills_required?: string[] }) => ({
      project_id: project.id,
      role: r.role,
      description: r.description || '',
      skills_required: r.skills_required || [],
      filled: false,
    }))

    const { error: rolesErr } = await supabaseAdmin
      .from('showbizy_project_roles')
      .insert(rolesData)

    if (rolesErr) {
      console.error('Roles creation error:', rolesErr)
    }

    // Trigger AI matching: find Pro creatives in same city and stream
    try {
      const { data: matches } = await supabaseAdmin
        .from('showbizy_users')
        .select('id, name, email, city, streams, skills')
        .eq('is_pro', true)
        .ilike('city', `%${location.split(',')[0]}%`)
        .limit(20)

      // Filter for matching streams
      const matchedUsers = (matches || []).filter((u: { streams?: string[] }) =>
        u.streams && u.streams.includes(stream)
      )

      // Save matches to DB
      if (matchedUsers.length > 0) {
        const matchRecords = matchedUsers.map(m => ({
          user_id: m.id,
          project_id: project.id,
          score: 0.85,
          status: 'pending',
        }))
        await supabaseAdmin.from('showbizy_matches').insert(matchRecords)

        // Send email notifications (top 5)
        try {
          const { transporter } = await import('@/lib/email')
          for (const match of matchedUsers.slice(0, 5)) {
            await transporter.sendMail({
              from: '"ShowBizy" <hello@bilabs.ai>',
              to: match.email,
              subject: `🎬 New project match: ${title}`,
              html: `
<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #F5B731, #E87B35); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: black; font-size: 24px; margin: 0;">🎬 You've Been Matched!</h1>
  </div>
  <div style="background: #1a1a2e; padding: 32px; color: #e2e8f0; border-radius: 0 0 16px 16px;">
    <p>Hey ${match.name},</p>
    <p>${user.name} just posted a new project that matches your skills:</p>
    <div style="background: rgba(245,183,49,0.1); border: 1px solid rgba(245,183,49,0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #F5B731; margin: 0 0 8px;">${title}</h2>
      <p style="color: #94a3b8; margin: 0; font-size: 14px;">📍 ${location} • 🎬 ${stream}</p>
      <p style="color: #e2e8f0; margin: 12px 0 0; font-size: 14px;">${brief.slice(0, 200)}${brief.length > 200 ? '...' : ''}</p>
    </div>
    <a href="https://showbizy.ai/projects/${project.id}" style="display: inline-block; background: linear-gradient(135deg, #F5B731, #E87B35); color: black; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">View Project →</a>
    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">— The ShowBizy Team</p>
  </div>
</div>`,
            })
          }
        } catch (emailErr) {
          console.error('Match notification email error:', emailErr)
        }
      }

      return NextResponse.json({
        success: true,
        project: { ...project, roles: rolesData },
        matchesNotified: matchedUsers.length,
      })
    } catch (matchErr) {
      console.error('Matching error:', matchErr)
      return NextResponse.json({ success: true, project, matchesNotified: 0 })
    }
  } catch (error) {
    console.error('Post project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
