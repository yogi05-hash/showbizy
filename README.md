# ShowBizy.ai

AI-powered creative project generator and team matching platform for filmmakers, actors, photographers, and crew.

## Features

- 🤖 **AI Project Generator**: Creates complete film/photo project briefs including scripts, shot lists, and budgets
- 🎯 **Smart Team Matching**: Matches creatives based on style, location, and availability  
- 🎬 **Project Collaboration**: Built-in tools for script notes, scheduling, and file sharing
- 🏆 **Credit System**: Automatic IMDb/LinkedIn credit generation for completed projects

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- Clerk Authentication
- Supabase Database
- OpenAI GPT-4o

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from Clerk dashboard)
   - `CLERK_SECRET_KEY` (from Clerk dashboard)
   - `OPENAI_API_KEY` (from OpenAI dashboard)
   - `NEXT_PUBLIC_SUPABASE_URL` (from Supabase dashboard)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase dashboard)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Deployment

The app is configured for Vercel deployment:

```bash
vercel --prod
```

## License

MIT