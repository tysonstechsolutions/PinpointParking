// ============================================
// MIDDLEWARE - ROUTE PROTECTION
// ============================================
// Protects /admin/* routes with authentication
// ============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

const COOKIE_NAME = 'pinpoint_admin_session'
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'pinpointparking'

// Simple token verification (must match auth.ts)
function verifyToken(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [header, body, signature] = parts

    // Decode and check expiration
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'))
    if (payload.exp && payload.exp < Date.now()) return false

    // Verify signature
    const expectedSignature = Buffer.from(
      createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64')
    ).toString('base64url')

    return signature === expectedSignature
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (but not the login API)
  if (pathname.startsWith('/admin')) {
    // Allow the admin page itself (it handles showing login form)
    // But check auth for all other admin pages
    if (pathname !== '/admin') {
      const token = request.cookies.get(COOKIE_NAME)?.value

      if (!token || !verifyToken(token)) {
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

    if (!token || !verifyToken(token)) {
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
    '/api/admin/:path*',
    '/api/invoices/:path*',
    '/api/documents/:path*',
  ],
}
