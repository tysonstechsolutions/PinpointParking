// ============================================
// JOBS API - SINGLE JOB OPERATIONS
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single job
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Failed to fetch job:', error)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Job GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - update job (status, scheduled_date, notes, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
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

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update job:', error)
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Job PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - delete job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (error) {
      console.error('Failed to delete job:', error)
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Job DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
