import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient | null = null
let _supabase: SupabaseClient | null = null

// Server-side client (for API routes) — lazy init to avoid build errors
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (url && key) {
        _supabaseAdmin = createClient(url, key)
      } else {
        // During build, return safe no-ops
        return typeof prop === 'string' && prop === 'from'
          ? () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }), then: (cb: any) => cb({ data: [], error: null }) }), insert: () => Promise.resolve({ data: null, error: null }), update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }), upsert: () => Promise.resolve({ data: null, error: null }), delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) })
          : prop === 'rpc'
          ? () => Promise.resolve({ data: null, error: null })
          : undefined
      }
    }
    return (_supabaseAdmin as any)?.[prop]
  },
})

// Client-side client — lazy init
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) {
        _supabase = createClient(url, key)
      } else {
        return undefined
      }
    }
    return (_supabase as any)?.[prop]
  },
})
