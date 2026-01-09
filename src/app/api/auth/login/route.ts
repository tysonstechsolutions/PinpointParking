// ============================================
// LOGIN API ENDPOINT
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  checkRateLimit,
  recordLoginAttempt,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts',
          retryAfter: rateLimit.retryAfter
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Verify password
    const valid = verifyPassword(password)

    if (!valid) {
      recordLoginAttempt(ip, false)
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Record successful login and create session
    recordLoginAttempt(ip, true)
    const token = await createSession()
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
