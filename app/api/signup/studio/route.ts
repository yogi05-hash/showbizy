import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { transporter } from '@/lib/email'

export const dynamic = 'force-dynamic'

const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'mail.com']

function calculateTrustScore(data: {
  email: string
  company_website?: string
  company_address?: string
  contact_phone?: string
  years_in_business?: number
  company_size?: string
}): number {
  let score = 0
  // Custom domain email = +30
  const domain = data.email.split('@')[1]?.toLowerCase()
  if (domain && !FREE_EMAIL_DOMAINS.includes(domain)) score += 30
  // Has website = +25
  if (data.company_website && data.company_website.startsWith('http')) score += 25
  // Has full address = +15
  if (data.company_address && data.company_address.length > 10) score += 15
  // Has phone = +10
  if (data.contact_phone && data.contact_phone.length >= 7) score += 10
  // Years in business
  if (data.years_in_business && data.years_in_business >= 3) score += 10
  else if (data.years_in_business && data.years_in_business >= 1) score += 5
  // Company size > 5
  if (data.company_size && !['1-5'].includes(data.company_size)) score += 10
  return Math.min(100, score)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      // Account
      name,
      email,
      contact_role,
      // Company
      company_name,
      company_type,
      company_website,
      company_address,
      company_postcode,
      company_country,
      company_size,
      years_in_business,
      // Streams (what they produce)
      streams,
      // Profile
      company_logo,
      company_bio,
      contact_phone,
    } = body

    // Validation
    if (!name || !email || !company_name || !company_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check duplicate
    const { data: existing } = await supabaseAdmin
      .from('showbizy_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email already registered. Sign in instead.' }, { status: 409 })
    }

    // Calculate trust score
    const trustScore = calculateTrustScore({
      email,
      company_website,
      company_address,
      contact_phone,
      years_in_business,
      company_size,
    })

    // Auto-approve if trust score is high (>= 70), otherwise pending review
    const autoVerified = trustScore >= 70
    const verification_status = autoVerified ? 'auto_approved' : 'pending_review'

    // Insert user with Studio profile
    const insertData: Record<string, unknown> = {
      name,
      email,
      streams: streams || [],
      skills: [],
      city: company_address?.split(',').slice(-2, -1)[0]?.trim() || 'London',
      availability: 'business',
      portfolio: company_website || '',
      // Studio fields
      company_name,
      company_type,
      company_website: company_website || null,
      company_address: company_address || null,
      company_postcode: company_postcode || null,
      company_country: company_country || 'United Kingdom',
      company_size: company_size || null,
      company_logo: company_logo || null,
      company_bio: company_bio || null,
      contact_role: contact_role || null,
      contact_phone: contact_phone || null,
      years_in_business: years_in_business || null,
      // Plan starts as 'free' — they pay AFTER verification
      plan: 'free',
      is_pro: false,
      // Verification
      verified: autoVerified,
      verification_status,
      verification_submitted_at: new Date().toISOString(),
    }

    const { data: userData, error: dbError } = await supabaseAdmin
      .from('showbizy_users')
      .insert(insertData)
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Send welcome email to Studio user
    try {
      await transporter.sendMail({
        from: '"ShowBizy" <admin@showbizy.ai>',
        to: email,
        subject: autoVerified
          ? `🎬 Welcome to ShowBizy Studio, ${company_name}!`
          : `🎬 ShowBizy Studio application received`,
        html: `
<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #F5B731, #E87B35); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: black; font-size: 28px; margin: 0;">${autoVerified ? '🎉 Approved!' : '⏳ Under Review'}</h1>
  </div>
  <div style="background: #1a1a2e; padding: 32px; color: #e2e8f0; border-radius: 0 0 16px 16px;">
    <p>Hey ${name},</p>
    <p>Thanks for signing up <strong style="color: #F5B731;">${company_name}</strong> as a ShowBizy Studio.</p>
    ${autoVerified ? `
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #22c55e; margin: 0 0 8px;">✅ Your Studio is verified</h3>
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">You can now upgrade to Studio (£29/month) and start posting projects to find talent.</p>
      </div>
      <a href="https://showbizy.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #F5B731, #E87B35); color: black; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Upgrade to Studio →</a>
    ` : `
      <div style="background: rgba(245,183,49,0.1); border: 1px solid rgba(245,183,49,0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #F5B731; margin: 0 0 8px;">⏳ Verification in progress</h3>
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">We manually verify all Studios to maintain platform quality. Our team will review your application within 24-48 hours.</p>
      </div>
      <p style="color: #94a3b8; font-size: 14px;">You'll receive an email the moment your Studio is approved. No payment is required until then.</p>
    `}
    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Questions? Reply to this email or contact admin@showbizy.ai</p>
  </div>
</div>`,
      })
    } catch (emailError) {
      console.error('Studio welcome email error:', emailError)
    }

    // Notify admin of Studio signup — plain text style to avoid Gmail Promotions tab
    try {
      await transporter.sendMail({
        from: '"ShowBizy" <admin@showbizy.ai>',
        to: 'yogibot05@gmail.com, admin@showbizy.ai, hello@bilabs.ai',
        replyTo: email,
        subject: `New Studio signup: ${company_name} — Trust ${trustScore}/100`,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
        },
        text: `New Studio signup on ShowBizy\n\nTrust Score: ${trustScore}/100 — ${autoVerified ? 'Auto-approved' : 'Needs manual review'}\n\nCompany: ${company_name}\nType: ${company_type}${company_website ? `\nWebsite: ${company_website}` : ''}\nContact: ${name}${contact_role ? ` (${contact_role})` : ''}\nEmail: ${email}${contact_phone ? `\nPhone: ${contact_phone}` : ''}${company_address ? `\nAddress: ${company_address}, ${company_postcode || ''} ${company_country || ''}` : ''}${company_size ? `\nSize: ${company_size} employees` : ''}${years_in_business ? `\nYears: ${years_in_business}` : ''}${streams?.length ? `\nIndustries: ${streams.join(', ')}` : ''}${company_bio ? `\nAbout: ${company_bio}` : ''}\n\nReview: https://showbizy.ai/admin/verifications`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
<p><strong>New Studio signup on ShowBizy</strong></p>
<p><strong>Trust Score: ${trustScore}/100</strong> — ${autoVerified ? 'Auto-approved' : 'Needs manual review'}</p>
<p>
Company: ${company_name}<br>
Type: ${company_type}${company_website ? `<br>Website: <a href="${company_website}">${company_website}</a>` : ''}<br>
Contact: ${name}${contact_role ? ` (${contact_role})` : ''}<br>
Email: <a href="mailto:${email}">${email}</a>${contact_phone ? `<br>Phone: ${contact_phone}` : ''}${company_address ? `<br>Address: ${company_address}, ${company_postcode || ''} ${company_country || ''}` : ''}${company_size ? `<br>Size: ${company_size} employees` : ''}${years_in_business ? `<br>Years: ${years_in_business}` : ''}${streams?.length ? `<br>Industries: ${streams.join(', ')}` : ''}${company_bio ? `<br>About: ${company_bio}` : ''}
</p>
<p><a href="https://showbizy.ai/admin/verifications">Review in Admin Dashboard</a></p>
</div>`,
      })
    } catch (adminEmailError) {
      console.error('Admin Studio notification error:', adminEmailError)
    }

    return NextResponse.json({
      success: true,
      user: userData,
      autoVerified,
      verification_status,
      trustScore,
    })
  } catch (error) {
    console.error('Studio signup error:', error)
    return NextResponse.json({ error: 'Failed to create Studio account' }, { status: 500 })
  }
}
