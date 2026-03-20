import { NextResponse } from 'next/server'
import { sendProjectInvitationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { user, project, invitedBy } = await request.json()
    if (!user?.email || !project?.id || !invitedBy) {
      return NextResponse.json({ error: 'Missing user.email, project.id, or invitedBy' }, { status: 400 })
    }
    await sendProjectInvitationEmail(user, project, invitedBy)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('project-invitation email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
