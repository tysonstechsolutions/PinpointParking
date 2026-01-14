// ============================================
// CSRF PROTECTION UTILITY
// ============================================
// Generates and validates CSRF tokens
// ============================================

import { cookies } from 'next/headers'
import { createHmac, randomBytes } from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || ''

/**
 * Generate a CSRF token
 * Format: timestamp.random.signature
 */
export function generateCsrfToken(): string {
  if (!CSRF_SECRET) {
    console.error('CSRF_SECRET not configured')
    return ''
  }

  const timestamp = Date.now().toString()
  const random = randomBytes(16).toString('hex')
  const data = `${timestamp}.${random}`

  const signature = createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex')

  return `${data}.${signature}`
}

/**
 * Validate a CSRF token
 * @param token - The token to validate
 * @param maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 */
export function validateCsrfToken(token: string, maxAgeMs = 3600000): boolean {
  if (!CSRF_SECRET || !token) return false

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [timestamp, random, signature] = parts
    const data = `${timestamp}.${random}`

    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(data)
      .digest('hex')

    if (signature !== expectedSignature) return false

    // Check expiration
    const tokenTime = parseInt(timestamp, 10)
    if (isNaN(tokenTime)) return false
    if (Date.now() - tokenTime > maxAgeMs) return false

    return true
  } catch {
    return false
  }
}

/**
 * Set CSRF token in cookie
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 hour
  })

  return token
}

/**
 * Validate CSRF token from request
 * Compares header token with cookie token
 */
export async function validateCsrfRequest(headers: Headers): Promise<boolean> {
  const headerToken = headers.get(CSRF_HEADER_NAME)
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!headerToken || !cookieToken) return false
  if (headerToken !== cookieToken) return false

  return validateCsrfToken(headerToken)
}

/**
 * Middleware helper to check CSRF on state-changing requests
 */
export function requiresCsrfCheck(method: string): boolean {
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  return stateChangingMethods.includes(method.toUpperCase())
}
