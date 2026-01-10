// ============================================
// SUPABASE CLIENT UTILITIES
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lbrfuwkvajkhyceimfqu.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicmZ1d2t2YWpraHljZWltZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTY1ODksImV4cCI6MjA4MzM5MjU4OX0.YHB3pN-mq33LdYeVK6-Sma1OHk_JWv9QCpjGfBvMUEc'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY
}

// Get Supabase URL
export function getSupabaseUrl(): string {
  return SUPABASE_URL
}

// Get the appropriate key (service key for server-side, anon for client)
export function getSupabaseKey(useServiceKey = false): string {
  if (useServiceKey && SUPABASE_SERVICE_KEY) {
    return SUPABASE_SERVICE_KEY
  }
  return SUPABASE_ANON_KEY
}

// Simple Supabase client for server-side operations
export const supabase = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  serviceKey: SUPABASE_SERVICE_KEY,

  // Helper for making authenticated requests
  async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    useServiceKey = true
  ): Promise<{ data: T | null; error: string | null }> {
    if (!SUPABASE_URL) {
      return { data: null, error: 'Supabase URL not configured' }
    }

    const key = useServiceKey && SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY
    if (!key) {
      return { data: null, error: 'Supabase key not configured' }
    }

    try {
      const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Supabase error:', errorText)
        return { data: null, error: errorText }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Supabase fetch error:', error)
      return { data: null, error: String(error) }
    }
  },

  // Query helper
  from(table: string) {
    return {
      select: async <T>(columns = '*', options: { order?: string; limit?: number; eq?: Record<string, unknown> } = {}) => {
        let url = `/rest/v1/${table}?select=${columns}`
        if (options.order) url += `&order=${options.order}`
        if (options.limit) url += `&limit=${options.limit}`
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            url += `&${key}=eq.${value}`
          })
        }
        return supabase.fetch<T[]>(url)
      },

      insert: async <T>(data: Record<string, unknown>) => {
        return supabase.fetch<T[]>(`/rest/v1/${table}`, {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(data),
        })
      },

      update: async <T>(data: Record<string, unknown>, eq: Record<string, unknown>) => {
        const eqParams = Object.entries(eq).map(([k, v]) => `${k}=eq.${v}`).join('&')
        return supabase.fetch<T[]>(`/rest/v1/${table}?${eqParams}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(data),
        })
      },

      delete: async (eq: Record<string, unknown>) => {
        const eqParams = Object.entries(eq).map(([k, v]) => `${k}=eq.${v}`).join('&')
        return supabase.fetch(`/rest/v1/${table}?${eqParams}`, {
          method: 'DELETE',
        })
      },
    }
  },
}

export default supabase
