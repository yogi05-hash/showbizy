import { NextResponse } from 'next/server'
import { sendTeamMemberJoinedEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { teamMembers, newMember, project } = await request.json()
    if (!newMember?.name || !project?.id) {
      return NextResponse.json({ error: 'Missing newMember.name or project.id' }, { status: 400 })
    }
    await sendTeamMemberJoinedEmail(teamMembers || [], newMember, project)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('team-joined email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
