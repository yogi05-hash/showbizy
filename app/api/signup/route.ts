import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, streams, skills, city, availability, portfolio } = body

    // TODO: Save to database (Supabase) when connected

    // Send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const streamsList = streams.join(', ')
      const skillsList = skills.join(', ')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ShowBizy <welcome@showbizy.ai>',
          to: [email],
          subject: `🎬 Welcome to ShowBizy, ${name}!`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #fff; padding: 40px; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="font-size: 40px;">🎬</span>
                <h1 style="font-size: 28px; margin: 16px 0 8px; background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  Welcome to ShowBizy!
                </h1>
                <p style="color: #9ca3af; font-size: 16px; margin: 0;">
                  Don't find work. Let work find you.
                </p>
              </div>

              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #a855f7; margin: 0 0 16px; font-size: 16px;">Your Profile</h3>
                <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Name:</strong> ${name}</p>
                <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Streams:</strong> ${streamsList}</p>
                <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Skills:</strong> ${skillsList}</p>
                <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Location:</strong> ${city}</p>
                <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Availability:</strong> ${availability}</p>
                ${portfolio ? `<p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Portfolio:</strong> <a href="${portfolio}" style="color: #a855f7;">${portfolio}</a></p>` : ''}
              </div>

              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h3 style="color: #fff; margin: 0 0 16px; font-size: 16px;">What happens next?</h3>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="background: rgba(168,85,247,0.3); color: #a855f7; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</span>
                  <div>
                    <p style="margin: 0; color: #fff; font-weight: 600;">AI scans your area</p>
                    <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Our AI looks at local talent and generates projects you're perfect for</p>
                  </div>
                </div>
                <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 12px;">
                  <span style="background: rgba(168,85,247,0.3); color: #a855f7; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</span>
                  <div>
                    <p style="margin: 0; color: #fff; font-weight: 600;">Get matched to projects</p>
                    <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">You'll receive your first project matches within 48 hours</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="background: rgba(168,85,247,0.3); color: #a855f7; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</span>
                  <div>
                    <p style="margin: 0; color: #fff; font-weight: 600;">Create together</p>
                    <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Join projects, meet your team, and start creating</p>
                  </div>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://showbizy.ai/dashboard" style="background: linear-gradient(to right, #9333ea, #ec4899); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Go to Dashboard →
                </a>
              </div>

              <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px;">
                © 2026 ShowBizy. Where creative projects are born.
              </p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
