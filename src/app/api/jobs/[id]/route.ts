// ============================================
// JOBS API - SINGLE JOB OPERATIONS
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUrl, getSupabaseKey } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single job
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseKey(true)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch job:', await response.text())
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const data = await response.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Job GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - update job (status, scheduled_date, notes, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseKey(true)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields = [
      'status',
      'scheduled_date',
      'notes',
      'estimate_low_cents',
      'estimate_high_cents',
      'final_price_cents',
      'address',
      'service_address',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Add updated timestamp
    updates.updated_at = new Date().toISOString()

    const response = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      console.error('Failed to update job:', await response.text())
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data[0] || { success: true })
  } catch (error) {
    console.error('Job PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - delete job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseKey(true)

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to delete job:', await response.text())
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Job DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
