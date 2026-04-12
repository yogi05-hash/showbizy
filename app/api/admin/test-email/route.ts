import { NextRequest, NextResponse } from 'next/server'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json()
    if (!to) return NextResponse.json({ error: 'Missing "to" email' }, { status: 400 })

    const result = await transporter.sendMail({
      from: '"ShowBizy AI" <admin@showbizy.ai>',
      to,
      subject: 'Projects in your area need your skills',
      text: `Hey,

Our AI just generated 3 new creative projects in your area that match your skills.

You've been matched — but you need Pro to see your match score and apply.

What Pro gives you:
- Apply to all AI-generated projects
- Apply to real industry jobs (BBC, Netflix, etc.)
- AI skill matching based on your actual skills
- Priority matching when new projects drop

Upgrade to Pro: https://showbizy.ai/upgrade

— ShowBizy`,
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:560px;">
<p>Hey,</p>
<p>Our AI just generated <strong>3 new creative projects</strong> in your area that match your skills.</p>
<p>You've been matched — but you need Pro to see your match score and apply.</p>
<p><strong>What Pro gives you:</strong></p>
<ul>
<li>Apply to all AI-generated projects</li>
<li>Apply to real industry jobs (BBC, Netflix, etc.)</li>
<li>AI skill matching based on your actual skills</li>
<li>Priority matching when new projects drop</li>
</ul>
<p><a href="https://showbizy.ai/upgrade">Upgrade to Pro</a></p>
<p style="color:#999;font-size:12px;margin-top:24px;">— ShowBizy<br><a href="https://showbizy.ai" style="color:#999;">showbizy.ai</a></p>
</div>`,
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
