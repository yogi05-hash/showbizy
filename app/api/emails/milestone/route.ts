import { NextResponse } from 'next/server'
import { sendProjectMilestoneEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { teamMembers, project, milestone } = await request.json()
    if (!project?.id || !milestone) {
      return NextResponse.json({ error: 'Missing project.id or milestone' }, { status: 400 })
    }
    await sendProjectMilestoneEmail(teamMembers || [], project, milestone)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('milestone email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
