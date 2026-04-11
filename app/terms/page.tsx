import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — ShowBizy',
  description: 'The terms and conditions for using ShowBizy.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ShowBizy" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-white/50 hover:text-white transition">Home</Link>
          <Link href="/jobs" className="text-amber-400 hover:text-amber-300 transition font-medium">Jobs</Link>
          <Link href="/support" className="text-white/50 hover:text-white transition">Support</Link>
          <Link href="/pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: April 8, 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">1. Acceptance of Terms</h2>
            <p className="text-white/70 leading-relaxed">
              By accessing or using ShowBizy.ai (&ldquo;ShowBizy&rdquo;, &ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service. ShowBizy is operated by BiLabs.ai, registered at 71-75 Shelton Street, Camden, London, WC2H 9JQ, United Kingdom.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">2. Eligibility</h2>
            <p className="text-white/70 leading-relaxed">
              You must be at least 16 years old to use ShowBizy. By creating an account, you confirm that you meet this age requirement and have the legal capacity to enter into a contract.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">3. Account Registration</h2>
            <p className="text-white/70 leading-relaxed">
              You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. Notify us immediately at admin@showbizy.ai of any unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">4. Free and Pro Subscriptions</h2>
            <p className="text-white/70 leading-relaxed mb-3">
              ShowBizy offers two tiers:
            </p>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li><strong>Free:</strong> Browse projects, view job listings, create a profile.</li>
              <li><strong>Pro (£9/month):</strong> Apply to projects, AI matching, apply to industry jobs, featured profile.</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-3">
              Pro subscriptions auto-renew monthly until cancelled. You can cancel anytime via Stripe — your access continues until the end of the current billing period. No refunds for partial months unless legally required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">5. Acceptable Use</h2>
            <p className="text-white/70 leading-relaxed mb-3">You agree NOT to:</p>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li>Submit false or misleading information in your profile or applications</li>
              <li>Use the Service for any unlawful, fraudulent, or harmful activities</li>
              <li>Scrape, reverse-engineer, or copy any part of the Service</li>
              <li>Spam other users or send unsolicited messages</li>
              <li>Upload viruses, malware, or any malicious code</li>
              <li>Impersonate another person or entity</li>
              <li>Use the Service to recruit for illegal activities</li>
              <li>Discriminate against users based on protected characteristics</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">6. AI-Generated Content</h2>
            <p className="text-white/70 leading-relaxed">
              ShowBizy uses AI to generate creative project briefs. These briefs are provided as inspiration and starting points. You acknowledge that AI-generated content may contain errors, biases, or inaccuracies. ShowBizy is not liable for the creative quality, commercial viability, or legal compliance of AI-generated suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">7. Jobs and Applications</h2>
            <p className="text-white/70 leading-relaxed">
              Industry jobs displayed on ShowBizy are aggregated from third-party sources (Adzuna and others). ShowBizy is not the employer and does not guarantee the accuracy, availability, or legitimacy of any job listing. We are not party to any employment relationship that may result from connections made via the Service. Always verify employer credentials independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">8. User Content</h2>
            <p className="text-white/70 leading-relaxed">
              You retain ownership of all content you upload (profile info, cover letters, resumes, portfolio). By uploading, you grant ShowBizy a non-exclusive, worldwide, royalty-free license to host, display, and process your content for the purpose of operating the Service. You are responsible for ensuring you have the rights to upload any content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">9. Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed">
              ShowBizy, the ShowBizy logo, the platform design, code, and AI models are the exclusive property of BiLabs.ai. You may not copy, modify, distribute, sell, or lease any part of the Service without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">10. Disclaimers</h2>
            <p className="text-white/70 leading-relaxed">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. ShowBizy does not guarantee:
            </p>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2 mt-3">
              <li>That you will be matched with projects or jobs</li>
              <li>The success of any creative collaboration</li>
              <li>Uninterrupted or error-free operation of the Service</li>
              <li>The accuracy of AI-generated content or third-party job listings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">11. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              To the maximum extent permitted by law, BiLabs.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months prior to the claim, or £100, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">12. Termination</h2>
            <p className="text-white/70 leading-relaxed">
              You may terminate your account at any time by emailing admin@showbizy.ai. We may terminate or suspend accounts for violations of these Terms, fraud, or abuse. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">13. Governing Law</h2>
            <p className="text-white/70 leading-relaxed">
              These Terms are governed by the laws of England and Wales. Any disputes shall be resolved exclusively in the courts of England.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">14. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We may modify these Terms at any time. Material changes will be notified via email or in-app notice. Continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">15. Contact</h2>
            <p className="text-white/70 leading-relaxed">
              Questions about these Terms?
            </p>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 mt-4">
              <p className="text-white/80"><strong>BiLabs.ai</strong></p>
              <p className="text-white/60 text-sm mt-1">71-75 Shelton Street</p>
              <p className="text-white/60 text-sm">Camden, London WC2H 9JQ</p>
              <p className="text-white/60 text-sm">United Kingdom</p>
              <p className="text-white/60 text-sm mt-2">
                Email: <a href="mailto:admin@showbizy.ai" className="text-amber-400 hover:text-amber-300">admin@showbizy.ai</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-center gap-6 text-sm text-white/30">
          <Link href="/privacy" className="hover:text-white/60 transition">Privacy Policy</Link>
          <Link href="/support" className="hover:text-white/60 transition">Support</Link>
          <Link href="/" className="hover:text-white/60 transition">Home</Link>
        </div>
      </div>
    </div>
  )
}
