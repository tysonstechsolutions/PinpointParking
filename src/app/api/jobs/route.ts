// ============================================
// JOBS API - LIST JOBS
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customer_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
      .from('jobs')
      .select('*')
      .order('scheduled_date', { ascending: true })

    // Filter by status (can be comma-separated)
    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    // Filter by customer
    if (customerId) {
      query = query.eq('customer_id', parseInt(customerId, 10))
    }

    // Filter by date range
    if (from) {
      query = query.gte('scheduled_date', from)
    }
    if (to) {
      query = query.lte('scheduled_date', to)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
