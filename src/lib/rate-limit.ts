// ============================================
// RATE LIMITING UTILITY
// ============================================
// Simple in-memory rate limiting for API routes
// For production, consider using Redis or similar
// ============================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export interface RateLimitConfig {
  // Maximum number of requests allowed in the window
  maxRequests: number
  // Time window in milliseconds
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfterMs?: number
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, newEntry)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Increment count
  entry.count += 1

  // Check if over limit
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfterMs: entry.resetTime - now,
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP in the list (client IP)
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback
  return 'unknown'
}

// Pre-configured rate limits for different use cases
export const RATE_LIMITS = {
  // Public API endpoints (e.g., quote submission)
  public: {
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
  },
  // Sensitive operations (e.g., area estimation with AI)
  sensitive: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
  },
  // Authentication attempts
  auth: {
    maxRequests: 5,
    windowMs: 300000, // 5 attempts per 5 minutes
  },
  // File uploads
  upload: {
    maxRequests: 20,
    windowMs: 300000, // 20 uploads per 5 minutes
  },
  // Payment operations
  payment: {
    maxRequests: 10,
    windowMs: 60000, // 10 per minute
  },
} as const
