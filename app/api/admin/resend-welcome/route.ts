import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail, transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST: Resend welcome emails to users from last 48 hours + notify admin
export async function POST() {
  try {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - 48)

    const { data: recentUsers, error } = await supabaseAdmin
      .from('showbizy_users')
      .select('id, name, email, streams, skills, city, availability, portfolio')
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    if (!recentUsers?.length) {
      return NextResponse.json({ message: 'No users in last 48 hours', sent: 0 })
    }

    let welcomeSent = 0
    let adminSent = 0
    const errors: string[] = []

    for (const user of recentUsers) {
      // Send welcome email to user
      try {
        await sendWelcomeEmail({
          name: user.name,
          email: user.email,
          streams: user.streams || [],
          skills: user.skills || [],
          city: user.city,
          availability: user.availability || 'full-time',
          portfolio: user.portfolio,
        })
        welcomeSent++
      } catch (err) {
        errors.push(`Welcome to ${user.email}: ${err}`)
      }

      // Send admin notification
      try {
        await transporter.sendMail({
          from: '"ShowBizy" <hello@bilabs.ai>',
          to: 'yogibot05@gmail.com, hello@bilabs.ai',
          replyTo: user.email,
          subject: `New signup: ${user.name} — ${user.city || 'Unknown'}`,
          headers: { 'X-Priority': '1', 'Importance': 'High' },
          text: `New creative signup on ShowBizy\n\nName: ${user.name}\nEmail: ${user.email}\nCity: ${user.city || 'Not provided'}\nStreams: ${(user.streams || []).join(', ') || 'None'}\nSkills: ${(user.skills || []).join(', ') || 'None'}${user.portfolio ? `\nPortfolio: ${user.portfolio}` : ''}\n\n(Resent — original may have failed)`,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p><strong>New creative signup on ShowBizy</strong> (resent)</p>
<p>
Name: ${user.name}<br>
Email: <a href="mailto:${user.email}">${user.email}</a><br>
City: ${user.city || 'Not provided'}<br>
Streams: ${(user.streams || []).join(', ') || 'None'}<br>
Skills: ${(user.skills || []).join(', ') || 'None'}${user.portfolio ? `<br>Portfolio: <a href="${user.portfolio}">${user.portfolio}</a>` : ''}
</p>
</div>`,
        })
        adminSent++
      } catch (err) {
        errors.push(`Admin for ${user.email}: ${err}`)
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
      success: true,
      totalUsers: recentUsers.length,
      welcomeSent,
      adminSent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to resend emails' }, { status: 500 })
  }
}
