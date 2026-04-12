import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — ShowBizy',
  description: 'How ShowBizy collects, uses, and protects your data.',
}

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: April 8, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">1. Introduction</h2>
            <p className="text-white/70 leading-relaxed">
              ShowBizy.ai (&ldquo;ShowBizy&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is operated by BiLabs.ai, registered at 71-75 Shelton Street, Camden, London, WC2H 9JQ, United Kingdom. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">2. Information We Collect</h2>
            <p className="text-white/70 leading-relaxed mb-3">We collect the following types of personal information:</p>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li><strong>Account data:</strong> Name, email address, password (hashed), city, availability, professional streams and skills.</li>
              <li><strong>Profile data:</strong> Avatar image, portfolio URL, bio.</li>
              <li><strong>Application data:</strong> Cover letters and resumes you submit when applying to jobs.</li>
              <li><strong>Payment data:</strong> Processed by Stripe — we never see or store your card details.</li>
              <li><strong>Usage data:</strong> Pages visited, projects browsed, jobs viewed, applications submitted.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device info, cookies for session management.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">3. How We Use Your Data</h2>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li>To create and manage your ShowBizy account</li>
              <li>To match you with creative projects and industry jobs based on your skills and location</li>
              <li>To process Pro subscription payments through Stripe</li>
              <li>To send you transactional emails (welcome, application confirmations, project matches)</li>
              <li>To send weekly digests of new projects in your area (you can opt out)</li>
              <li>To improve our AI matching algorithm and service quality</li>
              <li>To prevent fraud and abuse of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">4. Third Parties We Use</h2>
            <p className="text-white/70 leading-relaxed mb-3">We use these trusted services to operate ShowBizy:</p>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li><strong>Supabase</strong> (PostgreSQL database, hosted in EU) — stores your account and application data</li>
              <li><strong>Stripe</strong> (payment processing, PCI-DSS Level 1) — handles subscription payments</li>
              <li><strong>Vercel</strong> (hosting) — serves the website</li>
              <li><strong>Zoho Mail</strong> (transactional email) — sends emails from admin@showbizy.ai</li>
              <li><strong>Adzuna</strong> (job aggregation) — provides industry job listings</li>
              <li><strong>DeepSeek</strong> (AI processing) — generates project briefs and matches</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">5. Your Rights (GDPR)</h2>
            <p className="text-white/70 leading-relaxed mb-3">As a user in the UK/EU, you have the right to:</p>
            <ul className="text-white/70 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li><strong>Access</strong> your personal data we hold</li>
              <li><strong>Correct</strong> inaccurate data (via your dashboard)</li>
              <li><strong>Delete</strong> your account and all associated data</li>
              <li><strong>Export</strong> your data in a machine-readable format</li>
              <li><strong>Object</strong> to processing for marketing purposes</li>
              <li><strong>Withdraw consent</strong> at any time</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-3">
              To exercise any of these rights, email <a href="mailto:admin@showbizy.ai" className="text-amber-400 hover:text-amber-300">admin@showbizy.ai</a>. We respond within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">6. Data Retention</h2>
            <p className="text-white/70 leading-relaxed">
              We keep your account data for as long as your account is active. If you delete your account, we permanently remove all personal data within 7 days, except where we&rsquo;re legally required to retain certain records (e.g., payment records for tax compliance — kept for 6 years).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">7. Cookies</h2>
            <p className="text-white/70 leading-relaxed">
              We use essential cookies for session management (keeping you logged in) and Stripe&rsquo;s payment cookies for fraud prevention. We do not use tracking cookies, ad networks, or third-party analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">8. Security</h2>
            <p className="text-white/70 leading-relaxed">
              We use industry-standard security measures: TLS encryption for all data in transit, encrypted database storage, hashed passwords, and Stripe-handled payment processing (we never see card details). We regularly audit our security practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">9. Children</h2>
            <p className="text-white/70 leading-relaxed">
              ShowBizy is not intended for users under 16. We do not knowingly collect data from children. If you believe a child has registered, contact us immediately at admin@showbizy.ai.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">10. Changes to This Policy</h2>
            <p className="text-white/70 leading-relaxed">
              We may update this policy occasionally. Material changes will be notified to active users via email. Continued use of ShowBizy after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-amber-400">11. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              Questions about this policy or your data?
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
          <Link href="/terms" className="hover:text-white/60 transition">Terms of Service</Link>
          <Link href="/support" className="hover:text-white/60 transition">Support</Link>
          <Link href="/" className="hover:text-white/60 transition">Home</Link>
        </div>
      </div>
    </div>
  )
}
