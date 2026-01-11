// ============================================
// MIDDLEWARE - ROUTE PROTECTION
// ============================================
// Protects /admin/* routes with authentication
// Uses Web Crypto API for Edge runtime compatibility
// ============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'pinpoint_admin_session'
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'pinpointparking'

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
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

// Simple token verification using Web Crypto API (Edge compatible)
async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [header, body, signature] = parts

    // Decode and check expiration
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp < Date.now()) return false

    // Verify signature using Web Crypto API
    const keyData = stringToUint8Array(JWT_SECRET)
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
    return signature === expectedSignature
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    '/api/admin/:path*',
    '/api/invoices/:path*',
    '/api/documents/:path*',
  ],
}
