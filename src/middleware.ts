// ============================================
// MIDDLEWARE - ROUTE PROTECTION
// ============================================
// Protects /admin/* routes with authentication
// Uses Web Crypto API for Edge runtime compatibility
// ============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'pinpoint_admin_session'

// Get JWT secret - MUST be set via environment variable
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET or ADMIN_PASSWORD environment variable is not set!')
    return ''
  }
  return secret
}

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// Base64url decode (safe)
function base64urlDecode(str: string): string {
  try {
    // Add padding if needed
    const padded = str + '==='.slice(0, (4 - (str.length % 4)) % 4)
    // Replace URL-safe characters
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    return atob(base64)
  } catch {
    throw new Error('Invalid base64url string')
  }
}

// Base64url encode
function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Constant-time comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// Token verification using Web Crypto API (Edge compatible)
async function verifyToken(token: string): Promise<boolean> {
  try {
    const jwtSecret = getJwtSecret()
    if (!jwtSecret) return false

    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [header, body, signature] = parts

    // Validate header has expected algorithm
    const headerPayload = JSON.parse(base64urlDecode(header))
    if (headerPayload.alg !== 'HS256') return false

    // Decode and check expiration
    const payload = JSON.parse(base64urlDecode(body))
    if (payload.exp && payload.exp < Date.now()) return false

    // Verify signature using Web Crypto API
    const keyData = stringToUint8Array(jwtSecret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData.buffer as ArrayBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const dataToSign = stringToUint8Array(`${header}.${body}`)
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      dataToSign.buffer as ArrayBuffer
    )

    const expectedSignature = base64urlEncode(signatureBuffer)

    // Use constant-time comparison to prevent timing attacks
    return constantTimeCompare(signature, expectedSignature)
  } catch {
    return false
  }
}

// Simple in-memory rate limiting for Edge runtime
// For production at scale, consider using Vercel KV or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  public: { maxRequests: 30, windowMs: 60000 },
  sensitive: { maxRequests: 10, windowMs: 60000 },
  auth: { maxRequests: 5, windowMs: 300000 },
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown'
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true }
  }

  entry.count += 1
  if (entry.count > config.maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) }
  }

  return { allowed: true }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIp = getClientIp(request)

  // Rate limit public API endpoints
  if (pathname.startsWith('/api/')) {
    let rateLimitConfig: RateLimitConfig

    // Determine rate limit based on endpoint
    if (pathname === '/api/admin/login') {
      rateLimitConfig = RATE_LIMITS.auth
    } else if (pathname === '/api/estimate-area') {
      rateLimitConfig = RATE_LIMITS.sensitive
    } else {
      rateLimitConfig = RATE_LIMITS.public
    }

    const rateLimitKey = `${clientIp}:${pathname}`
    const rateLimitResult = checkRateLimit(rateLimitKey, rateLimitConfig)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        }
      )
    }
  }

  // Only protect /admin routes (but not the login API)
  if (pathname.startsWith('/admin')) {
    // Allow the admin page itself (it handles showing login form)
    // But check auth for all other admin pages
    if (pathname !== '/admin') {
      const token = request.cookies.get(COOKIE_NAME)?.value

      if (!token || !(await verifyToken(token))) {
        // Redirect to admin login page
        const loginUrl = new URL('/admin', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/invoices') ||
      pathname.startsWith('/api/documents')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
