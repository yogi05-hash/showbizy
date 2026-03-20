import { NextResponse } from 'next/server'
import { sendWeeklyDigestEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { user, stats } = await request.json()
    if (!user?.email || !stats) {
      return NextResponse.json({ error: 'Missing user.email or stats' }, { status: 400 })
    }
    await sendWeeklyDigestEmail(user, stats)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('weekly-digest email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
