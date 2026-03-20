import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL || 'hello@bilabs.ai',
    pass: process.env.ZOHO_APP_PASSWORD || '',
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, streams, skills, city, availability, portfolio } = body

    // TODO: Save to database (Supabase) when connected

    // Send welcome email via Zoho SMTP
    const streamsList = (streams || []).join(', ')
    const skillsList = (skills || []).join(', ')

    try {
      await transporter.sendMail({
        from: '"ShowBizy" <hello@bilabs.ai>',
        to: email,
        subject: `🎬 Welcome to ShowBizy, ${name}!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; color: #fff; border-radius: 16px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed, #db2777); padding: 40px 32px; text-align: center;">
              <span style="font-size: 48px;">🎬</span>
              <h1 style="font-size: 28px; margin: 16px 0 4px; color: #fff;">
                Welcome to ShowBizy!
              </h1>
              <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0;">
                Don't find work. Let work find you.
              </p>
            </div>

            <div style="padding: 32px;">
              <!-- Greeting -->
              <p style="font-size: 18px; color: #e5e7eb; margin: 0 0 24px;">
                Hey ${name} 👋
              </p>
              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Your ShowBizy profile is live! Our AI is already scanning your area for creative projects that match your skills.
              </p>

              <!-- Profile Card -->
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #a855f7; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Profile</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 100px;">Name</td>
                    <td style="padding: 6px 0; color: #e5e7eb; font-size: 14px;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Streams</td>
                    <td style="padding: 6px 0; color: #e5e7eb; font-size: 14px;">${streamsList || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Skills</td>
                    <td style="padding: 6px 0; color: #e5e7eb; font-size: 14px;">${skillsList || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Location</td>
                    <td style="padding: 6px 0; color: #e5e7eb; font-size: 14px;">${city || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Availability</td>
                    <td style="padding: 6px 0; color: #e5e7eb; font-size: 14px;">${availability || 'Not set'}</td>
                  </tr>
                  ${portfolio ? `<tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Portfolio</td>
                    <td style="padding: 6px 0;"><a href="${portfolio}" style="color: #a855f7; font-size: 14px;">${portfolio}</a></td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- What Happens Next -->
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                <h3 style="color: #fff; margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What happens next</h3>
                
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background: rgba(168,85,247,0.3); color: #a855f7; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</div>
                    <div>
                      <p style="margin: 0; color: #fff; font-weight: 600; font-size: 14px;">AI scans your area</p>
                      <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">We look at who's near you and what projects would be perfect</p>
                    </div>
                  </div>
                </div>

                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background: rgba(168,85,247,0.3); color: #a855f7; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</div>
                    <div>
                      <p style="margin: 0; color: #fff; font-weight: 600; font-size: 14px;">Get matched to projects</p>
                      <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">First project matches arrive within 48 hours</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div style="display: flex; align-items: flex-start;">
                    <div style="background: rgba(168,85,247,0.3); color: #a855f7; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</div>
                    <div>
                      <p style="margin: 0; color: #fff; font-weight: 600; font-size: 14px;">Create together</p>
                      <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">Join projects, meet your team, start creating</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://showbizy.vercel.app/dashboard" style="background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Go to Dashboard →
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: center;">
                <p style="color: #4b5563; font-size: 12px; margin: 0 0 4px;">
                  ShowBizy — Where creative projects are born.
                </p>
                <p style="color: #4b5563; font-size: 12px; margin: 0;">
                  A <a href="https://bilabs.ai" style="color: #6b7280;">bilabs.ai</a> product
                </p>
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the signup if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
