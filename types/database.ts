// types/database.ts

export interface User {
  id: string
  clerk_id: string
  email: string
  name: string
  role: 'director' | 'actor' | 'cinematographer' | 'writer' | 'editor' | 'sound' | 'producer' | 'other'
  city: string
  bio: string
  portfolio_url?: string
  imdb_url?: string
  skills: string[]
  experience_level: 'student' | 'beginner' | 'intermediate' | 'professional'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  type: 'short_film' | 'music_video' | 'photo_series' | 'commercial' | 'documentary'
  genre: string
  duration: string
  logline: string
  synopsis: string
  script_url?: string
  treatment_url?: string
  shot_list?: any[]
  mood_board?: string[]
  locations: string[]
  budget_estimate: number
  timeline_weeks: number
  city: string
  status: 'draft' | 'recruiting' | 'in_production' | 'post_production' | 'completed'
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectRole {
  id: string
  project_id: string
  role: string
  description: string
  requirements: string[]
  filled_by?: string
  status: 'open' | 'filled' | 'cancelled'
  created_at: string
}

export interface Application {
  id: string
  project_id: string
  role_id: string
  user_id: string
  message: string
  portfolio_links: string[]
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface TeamMember {
  id: string
  project_id: string
  user_id: string
  role: string
  joined_at: string
}

export interface Credit {
  id: string
  user_id: string
  project_id: string
  role: string
  project_title: string
  project_type: string
  year: number
  imdb_added: boolean
  created_at: string
}