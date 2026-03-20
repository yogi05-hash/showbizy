import { NextResponse } from 'next/server'
import { sendNewMessageEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { user, sender, project, messagePreview } = await request.json()
    if (!user?.email || !sender?.name || !project?.id || !messagePreview) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const result = await sendNewMessageEmail(user, sender, project, messagePreview)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('new-message email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
