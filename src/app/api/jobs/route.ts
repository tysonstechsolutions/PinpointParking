// ============================================
// JOBS API - LIST JOBS
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUrl, getSupabaseKey } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseKey(true)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customer_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Build query parameters
    let queryParams = 'order=scheduled_date.asc'

    // Filter by status (can be comma-separated)
    if (status) {
      const statuses = status.split(',')
      queryParams += `&status=in.(${statuses.join(',')})`
    }

    // Filter by customer
    if (customerId) {
      queryParams += `&customer_id=eq.${customerId}`
    }

    // Filter by date range
    if (from) {
      queryParams += `&scheduled_date=gte.${from}`
    }
    if (to) {
      queryParams += `&scheduled_date=lte.${to}`
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/jobs?${queryParams}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to fetch jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
