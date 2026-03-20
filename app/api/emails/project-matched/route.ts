import { NextResponse } from 'next/server'
import { sendProjectMatchedEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { user, project } = await request.json()
    if (!user?.email || !project?.id) {
      return NextResponse.json({ error: 'Missing user.email or project.id' }, { status: 400 })
    }
    await sendProjectMatchedEmail(user, project)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('project-matched email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
