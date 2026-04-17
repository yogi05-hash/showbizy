import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST() {
  try {
    // Fetch professionals who haven't been invited yet
    const { data: prospects, error } = await supabaseAdmin
      .from('showbizy_professionals')
      .select('id, name, email, title, city')
      .eq('invite_sent', false)
      .not('email', 'is', null)
      .limit(20) // 20 per batch to avoid spam

    if (error || !prospects?.length) {
      return NextResponse.json({ message: 'No prospects to email', sent: 0 })
    }

    let sent = 0
    let failed = 0

    for (const prospect of prospects) {
      if (!prospect.email) continue

      const city = prospect.city || 'your area'
      const title = prospect.title || 'creative professional'
      const firstName = prospect.name.split(' ')[0]

      try {
        await transporter.sendMail({
          from: '"ShowBizy AI" <admin@showbizy.ai>',
          to: prospect.email,
          subject: `${firstName}, creative projects in ${city} need a ${title}`,
          text: `Hey ${firstName},

I'm building ShowBizy — a platform that matches creatives in ${city} with real projects. Our AI generates daily projects and we're looking for ${title}s to join.

It's free to sign up. We'll match you to projects based on your skills.

Join here: https://showbizy.ai/signup?ref=invite&city=${encodeURIComponent(city)}

What kind of projects are you looking for? Just reply to this email.

— The ShowBizy Team
https://showbizy.ai`,
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:560px;">
<p>Hey ${firstName},</p>
<p>I'm building ShowBizy — a platform that matches creatives in <strong>${city}</strong> with real projects. Our AI generates daily projects and we're looking for <strong>${title}s</strong> to join.</p>
<p>It's free to sign up. We'll match you to projects based on your skills.</p>
<p><a href="https://showbizy.ai/signup?ref=invite&city=${encodeURIComponent(city)}">Join here — it's free</a></p>
<p>What kind of projects are you looking for? Just reply to this email.</p>
<p style="color:#999;font-size:12px;margin-top:24px;">— The ShowBizy Team<br><a href="https://showbizy.ai" style="color:#999;">showbizy.ai</a></p>
</div>`,
        })

        await supabaseAdmin
          .from('showbizy_professionals')
          .update({ invite_sent: true, invite_sent_at: new Date().toISOString() })
          .eq('id', prospect.id)

        sent++
      } catch (err) {
        console.error(`Outreach email failed for ${prospect.email}:`, err)
        failed++
      }

      // Rate limit: 3 second delay between emails
      await new Promise(r => setTimeout(r, 3000))
    }

    return NextResponse.json({ success: true, sent, failed, total: prospects.length })
  } catch (error) {
    console.error('Outreach error:', error)
    return NextResponse.json({ error: 'Outreach failed' }, { status: 500 })
  }
}
