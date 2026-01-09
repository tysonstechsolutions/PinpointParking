// ============================================
// SESSION CHECK API ENDPOINT
// ============================================

import { NextResponse } from 'next/server'
import { isAuthenticated, getSession } from '@/lib/auth'

export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    const session = await getSession()

    return NextResponse.json({
      authenticated,
      expiresAt: session?.exp || null,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      authenticated: false,
      expiresAt: null,
    })
  }
}
