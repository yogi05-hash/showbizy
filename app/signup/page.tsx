export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🎬</span>
          <h1 className="text-3xl font-bold mb-2">Join the waitlist</h1>
          <p className="text-white/50">
            Be the first to access AI-generated creative projects
          </p>
        </div>

        <form className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              What type of creative are you?
            </label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500">
              <option value="">Select your primary role...</option>
              <option value="director">Director</option>
              <option value="actor">Actor</option>
              <option value="cinematographer">Cinematographer / DP</option>
              <option value="writer">Writer / Screenwriter</option>
              <option value="editor">Editor</option>
              <option value="sound">Sound Designer</option>
              <option value="producer">Producer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Your city
            </label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500">
              <option value="">Select your city...</option>
              <option value="london">London, UK</option>
              <option value="nyc">New York, USA</option>
              <option value="la">Los Angeles, USA</option>
              <option value="manchester">Manchester, UK</option>
              <option value="bristol">Bristol, UK</option>
              <option value="other">Other (we'll expand soon!)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Portfolio / IMDb / Website (optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="newsletter"
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="newsletter" className="text-sm text-white/50">
              Send me updates about new projects, features, and launch dates
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition"
          >
            Join waitlist →
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}