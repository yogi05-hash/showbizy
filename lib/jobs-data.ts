// Entertainment industry jobs — mock data (will be replaced with Adzuna API)

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  category: string
  type: string
  description: string
  posted: string
  source: string
}

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1', title: 'Cinematographer — Feature Film', company: 'Vertigo Productions', location: 'London, UK',
    salary: '£350-500/day', category: 'Film', type: 'Freelance',
    description: 'Seeking an experienced cinematographer for an indie feature film shooting in East London over 4 weeks. Must have experience with natural lighting and handheld work. Arri Alexa Mini provided. The film explores themes of identity and belonging in modern London. Director has previous Sundance selection.',
    posted: '2 hours ago', source: 'Adzuna',
  },
  {
    id: 'j2', title: 'Music Video Director', company: 'Neon Records', location: 'Manchester, UK',
    salary: '£2,000-4,000/project', category: 'Music', type: 'Freelance',
    description: 'Looking for a creative director for a series of 3 music videos for an emerging R&B artist. Budget includes post-production. Must have a strong visual portfolio and experience with performance-driven content. Shooting across Manchester over 2 weekends.',
    posted: '5 hours ago', source: 'Adzuna',
  },
  {
    id: 'j3', title: 'Senior Video Editor — Post Production', company: 'BBC Studios', location: 'London, UK',
    salary: '£45,000-55,000/year', category: 'TV', type: 'Full-time',
    description: 'Join the BBC Studios post-production team working on flagship entertainment shows. Experience with Avid Media Composer essential. DaVinci Resolve and After Effects a plus. Must be comfortable working to tight broadcast deadlines. Hybrid working — 3 days in office.',
    posted: '1 day ago', source: 'Reed',
  },
  {
    id: 'j4', title: 'Sound Designer — Theatre Production', company: 'National Theatre', location: 'London, UK',
    salary: '£600-800/week', category: 'Theatre', type: 'Contract',
    description: 'Sound designer needed for a new play opening in the Dorfman Theatre. 6-week contract covering tech rehearsals and opening run. Experience with QLab and Dante networking required. Must be available for evening and weekend tech runs.',
    posted: '3 hours ago', source: 'Adzuna',
  },
  {
    id: 'j5', title: 'Junior Producer — Documentary', company: 'Channel 4', location: 'Leeds, UK',
    salary: '£30,000-35,000/year', category: 'TV', type: 'Full-time',
    description: 'Channel 4 is seeking a Junior Producer to join our award-winning documentary team in Leeds. You\'ll work across development and production of factual content. Ideal for someone with 2-3 years experience in TV production who wants to step up to producing.',
    posted: '6 hours ago', source: 'Reed',
  },
  {
    id: 'j6', title: 'VFX Artist — Sci-Fi Series', company: 'Framestore', location: 'London, UK',
    salary: '£55,000-70,000/year', category: 'Film', type: 'Full-time',
    description: 'Framestore is hiring a VFX Artist for an upcoming sci-fi series. Proficiency in Houdini and Nuke required. Experience with creature and environment work preferred. Join a world-class team working on one of the most ambitious series of the year.',
    posted: '1 day ago', source: 'Adzuna',
  },
  {
    id: 'j7', title: 'Podcast Producer', company: 'Spotify Studios', location: 'London, UK',
    salary: '£40,000-50,000/year', category: 'Music', type: 'Full-time',
    description: 'Spotify Studios is looking for a Podcast Producer to develop and produce original podcast content. Must have experience in audio storytelling, booking guests, and managing production schedules. Knowledge of music and pop culture is a strong plus.',
    posted: '4 hours ago', source: 'Adzuna',
  },
  {
    id: 'j8', title: 'Art Director — Music Festival', company: 'Live Nation', location: 'Birmingham, UK',
    salary: '£3,000-5,000/project', category: 'Events', type: 'Freelance',
    description: 'Art Director needed for a major summer music festival. Responsible for stage design concepts, signage, and overall visual identity. Must have experience with large-scale event design. 8-week project starting immediately.',
    posted: '8 hours ago', source: 'Reed',
  },
  {
    id: 'j9', title: 'Screenwriter — Short Film Series', company: 'Film4', location: 'Remote, UK',
    salary: '£5,000/script', category: 'Film', type: 'Freelance',
    description: 'Film4 is commissioning a series of 5 short films exploring British identity. Seeking screenwriters with a distinctive voice. Each film is 10-15 minutes. Open to emerging writers with at least one produced credit. BAFTA-qualifying project.',
    posted: '12 hours ago', source: 'Adzuna',
  },
  {
    id: 'j10', title: 'Production Coordinator — Netflix Series', company: 'Netflix UK', location: 'London, UK',
    salary: '£35,000-42,000/year', category: 'TV', type: 'Contract',
    description: 'Netflix UK is looking for an experienced Production Coordinator for a 10-episode drama series. You\'ll manage schedules, call sheets, and liaise between departments. Must have prior experience on scripted drama. 6-month fixed-term contract.',
    posted: '2 days ago', source: 'Reed',
  },
  {
    id: 'j11', title: 'Motion Graphics Designer', company: 'Sky Creative Agency', location: 'London, UK',
    salary: '£38,000-48,000/year', category: 'TV', type: 'Full-time',
    description: 'Create broadcast graphics and title sequences for Sky\'s entertainment channels. Proficiency in After Effects, Cinema 4D, and Figma required. A showreel demonstrating broadcast-quality motion design is essential.',
    posted: '1 day ago', source: 'Adzuna',
  },
  {
    id: 'j12', title: 'Location Scout — Period Drama', company: 'ITV Studios', location: 'Yorkshire, UK',
    salary: '£300-400/day', category: 'TV', type: 'Freelance',
    description: 'ITV Studios is seeking a Location Scout for a new period drama set in 1920s Yorkshire. Must have excellent knowledge of historic properties in the region. 3-week initial contract. Own transport essential.',
    posted: '5 hours ago', source: 'Reed',
  },
]

export const JOB_CATEGORIES = ['All', 'Film', 'TV', 'Music', 'Theatre', 'Events']
export const JOB_LOCATIONS = ['All UK', 'London', 'Manchester', 'Birmingham', 'Leeds', 'Remote']
