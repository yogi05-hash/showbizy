import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ShowBizy
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="#how-it-works" className="text-white/50 hover:text-white transition">How it works</Link>
          <Link href="#for-creatives" className="text-white/50 hover:text-white transition">For Creatives</Link>
          <Link href="#pricing" className="text-white/50 hover:text-white transition">Pricing</Link>
          <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition">
            Get early access
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-purple-300">AI creates projects • Teams form • Credits roll</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Stop looking for work.
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Let work find you.
          </span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          ShowBizy uses AI to generate complete film, music, and photo projects—then 
          assembles the perfect team of directors, actors, cinematographers & crew 
          to bring them to life.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
            Join the waitlist →
          </Link>
          <Link href="#demo" className="border border-white/10 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition">
            See how it works
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { num: 'AI', label: 'Generates projects' },
            { num: '5-7', label: 'Person crews' },
            { num: '48h', label: 'Team formation' },
            { num: '100%', label: 'Real credits' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-purple-400 mb-1">{stat.num}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How ShowBizy works</h2>
          <p className="text-white/50 text-lg">From AI concept to finished project in 4 steps</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              step: '01',
              title: 'AI Creates The Project',
              desc: 'Complete script, storyboard, shot list, mood board, and budget. Everything needed to start shooting.',
              icon: '🤖',
            },
            {
              step: '02',
              title: 'Creatives Get Matched',
              desc: 'Directors, actors, DPs, sound, editors—AI suggests the perfect team based on style & location.',
              icon: '🎯',
            },
            {
              step: '03',
              title: 'Team Forms & Creates',
              desc: 'Built-in collaboration tools. Script notes, shot planning, file sharing, progress tracking.',
              icon: '🎬',
            },
            {
              step: '04',
              title: 'Credits & Portfolio',
              desc: 'Automatic IMDb/LinkedIn credits. Community voting. Build your reel with real projects.',
              icon: '🏆',
            },
          ].map((item) => (
            <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{item.icon}</span>
                <div>
                  <span className="text-xs font-bold text-purple-400 tracking-wider">STEP {item.step}</span>
                  <h3 className="text-xl font-bold mt-1 mb-2">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECT EXAMPLES */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Example AI-generated projects</h2>
          <p className="text-white/50 text-lg">Real briefs created by our AI—ready for teams to execute</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              type: 'Short Film',
              title: '"The Last Bookstore"',
              genre: 'Drama / 8 min',
              roles: 'Director, 2 Actors, DP, Sound',
              desc: 'In a world where all books are digital, an elderly woman runs the last physical bookstore. A young programmer discovers it and learns what we lose when everything becomes virtual.',
            },
            {
              type: 'Music Video',
              title: '"Neon Dreams"',
              genre: 'Electronic / 3 min',
              roles: 'Director, Dancer, DP, Editor',
              desc: 'Surreal journey through a cyberpunk city. Dancer moves through neon-lit streets, projections, and mirrors. Visual effects in post.',
            },
            {
              type: 'Photo Series',
              title: '"Blue Hour Workers"',
              genre: 'Documentary / 20 photos',
              roles: 'Photographer, 3 Subjects, Editor',
              desc: 'Portraits of night shift workers during the "blue hour"—that magical time between night and dawn. Capturing quiet dignity of unseen labor.',
            },
          ].map((project) => (
            <div key={project.title} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{project.type}</span>
              <h3 className="text-xl font-bold mt-2 mb-1">{project.title}</h3>
              <p className="text-sm text-white/40 mb-4">{project.genre}</p>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.roles.split(', ').map((role) => (
                  <span key={role} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/60">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR CREATIVES */}
      <section id="for-creatives" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for creatives</h2>
          <p className="text-white/50 text-lg">Whether you're starting out or pivoting careers</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: 'Actors',
              problem: 'Waiting for auditions',
              solution: 'Get cast in 3-5 projects/month. Build your reel with actual scenes.',
            },
            {
              role: 'Directors',
              problem: 'No budget for shorts',
              solution: 'AI handles pre-production. You focus on vision and execution.',
            },
            {
              role: 'Cinematographers',
              problem: 'Need portfolio pieces',
              solution: 'Every project needs a DP. Build a diverse reel fast.',
            },
            {
              role: 'Writers',
              problem: 'Scripts sit unread',
              solution: 'See your stories produced. Get writing credits.',
            },
          ].map((creative) => (
            <div key={creative.role} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2 text-purple-400">{creative.role}</h3>
              <p className="text-sm text-white/40 mb-3">❌ {creative.problem}</p>
              <p className="text-sm text-white/70">✓ {creative.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple pricing</h2>
          <p className="text-white/50 text-lg">Less than one day on a traditional film set</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Free</h3>
            <p className="text-4xl font-bold mb-6">£0</p>
            <ul className="space-y-3 mb-8">
              {['View 3 project briefs/month', 'Browse all projects', 'Basic profile', 'Community access'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-white/60">
                  <span className="text-green-400">✓</span> {feature}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/5 transition">
              Start free
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </span>
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-6">£19<span className="text-lg text-white/40">/mo</span></p>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited project briefs',
                'Apply to any project',
                'Priority team matching',
                'Portfolio hosting',
                'Collaboration tools',
                'IMDb credit generation',
                'Community voting',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-white/80">
                  <span className="text-purple-400">✓</span> {feature}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold hover:opacity-90 transition">
              Get Pro
            </Link>
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-8">
          10% commission on commercial projects • Cancel anytime
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Your next project is waiting</h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Join 500+ creatives already on the waitlist. Be the first to access AI-generated projects when we launch.
          </p>
          <Link href="/signup" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
            Get early access →
          </Link>
          <p className="text-white/30 text-sm mt-4">Launching Q2 2026 • London & NYC first</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="font-bold">ShowBizy</span>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 ShowBizy.ai • AI-powered creative collaboration
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="text-white/40 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-white/40 hover:text-white transition">Contact</Link>
            <Link href="https://twitter.com/showbizyai" className="text-white/40 hover:text-white transition">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}