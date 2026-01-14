// ============================================
// SUPABASE CLIENT UTILITIES
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Safely encode a value for use in PostgREST queries
function encodeQueryValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null'
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  // String values need URL encoding
  return encodeURIComponent(String(value))
}

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

  // Query helper with safe parameter encoding
  from(table: string) {
    // Validate table name to prevent injection
    const safeTable = encodeURIComponent(table)

    return {
      select: async <T>(columns = '*', options: { order?: string; limit?: number; eq?: Record<string, unknown> } = {}) => {
        // Validate columns parameter
        const safeColumns = columns.replace(/[^a-zA-Z0-9_,*]/g, '')
        let url = `/rest/v1/${safeTable}?select=${safeColumns}`

        if (options.order) {
          // Validate order parameter (column.direction format)
          const safeOrder = options.order.replace(/[^a-zA-Z0-9_.,]/g, '')
          url += `&order=${safeOrder}`
        }
        if (options.limit) {
          url += `&limit=${Math.max(1, Math.min(1000, options.limit))}`
        }
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            // Validate key and encode value
            const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '')
            url += `&${safeKey}=eq.${encodeQueryValue(value)}`
          })
        }
        return supabase.fetch<T[]>(url)
      },

      insert: async <T>(data: Record<string, unknown>) => {
        return supabase.fetch<T[]>(`/rest/v1/${safeTable}`, {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(data),
        })
      },

      update: async <T>(data: Record<string, unknown>, eq: Record<string, unknown>) => {
        const eqParams = Object.entries(eq)
          .map(([k, v]) => {
            const safeKey = k.replace(/[^a-zA-Z0-9_]/g, '')
            return `${safeKey}=eq.${encodeQueryValue(v)}`
          })
          .join('&')
        return supabase.fetch<T[]>(`/rest/v1/${safeTable}?${eqParams}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(data),
        })
      },

      delete: async (eq: Record<string, unknown>) => {
        const eqParams = Object.entries(eq)
          .map(([k, v]) => {
            const safeKey = k.replace(/[^a-zA-Z0-9_]/g, '')
            return `${safeKey}=eq.${encodeQueryValue(v)}`
          })
          .join('&')
        return supabase.fetch(`/rest/v1/${safeTable}?${eqParams}`, {
          method: 'DELETE',
        })
      },
    }
  },
}

export default supabase
