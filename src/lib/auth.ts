// ============================================
// AUTHENTICATION UTILITIES
// ============================================
// Server-side authentication with JWT tokens
// ============================================

import { cookies } from 'next/headers'
import { config } from '@/config/config'

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || ''
const COOKIE_NAME = 'pinpoint_admin_session'

interface SessionPayload {
  authenticated: boolean
  exp: number
  iat: number
}

// Simple base64 encoding/decoding for JWT-like tokens
function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64url')
}

function base64Decode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8')
}

// Create a simple signed token
function createToken(payload: object): string {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64Encode(JSON.stringify(payload))
  const signature = base64Encode(
    require('crypto')
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64')
  )
  return `${header}.${body}.${signature}`
}

// Verify and decode a token
function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, body, signature] = parts
    const expectedSignature = base64Encode(
      require('crypto')
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64')
    )

    if (signature !== expectedSignature) return null

    const payload = JSON.parse(base64Decode(body)) as SessionPayload

    // Check expiration
    if (payload.exp && payload.exp < Date.now()) return null

    return payload
  } catch {
    return null
  }
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (!attempts) {
    return { allowed: true }
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > config.admin.lockoutDuration) {
    loginAttempts.delete(ip)
    return { allowed: true }
  }

  // Check if locked out
  if (attempts.count >= config.admin.maxLoginAttempts) {
    const retryAfter = Math.ceil((config.admin.lockoutDuration - (now - attempts.lastAttempt)) / 1000)
    return { allowed: false, retryAfter }
  }

  return { allowed: true }
}

export function recordLoginAttempt(ip: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(ip)
    return
  }

  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }
  attempts.count += 1
  attempts.lastAttempt = Date.now()
  loginAttempts.set(ip, attempts)
}

// Verify password
export function verifyPassword(password: string): boolean {
  if (!config.admin.password) {
    console.error('ADMIN_PASSWORD environment variable is not set!')
    return false
  }
  return password === config.admin.password
}

// Create a session
export async function createSession(): Promise<string> {
  const now = Date.now()
  const payload: SessionPayload = {
    authenticated: true,
    iat: now,
    exp: now + config.admin.sessionTimeout,
  }
  return createToken(payload)
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: config.admin.sessionTimeout / 1000,
  })
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Get and verify current session
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session?.authenticated === true
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Unauthorized')
  }
}
