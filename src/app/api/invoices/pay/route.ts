// ============================================
// RECORD PAYMENT ON INVOICE
// ============================================

import { NextResponse } from 'next/server'
import { config } from '@/config/config'

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

export async function POST(request: Request) {
  try {
    const { invoice_id, amount_cents, payment_method, notes, reference_number } = await request.json()

    if (!invoice_id || !amount_cents) {
      return NextResponse.json(
        { error: 'invoice_id and amount_cents are required' },
        { status: 400 }
      )
    }

    // Fetch the invoice
    const invoiceResponse = await fetch(
      `${supabaseUrl}/rest/v1/invoices?id=eq.${invoice_id}`,
      {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
      }
    )

    if (!invoiceResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch invoice' },
        { status: 500 }
      )
    }

    const invoices = await invoiceResponse.json()
    if (!invoices.length) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoice = invoices[0]
    const newAmountPaid = (invoice.amount_paid_cents || 0) + amount_cents
    const newBalance = invoice.total_cents - newAmountPaid

    // Determine new status
    let newStatus = invoice.status
    if (newBalance <= 0) {
      newStatus = 'paid'
    } else if (newAmountPaid > 0) {
      newStatus = 'partial'
    }

    // Update invoice
    const updates = {
      amount_paid_cents: newAmountPaid,
      status: newStatus,
      paid_at: newStatus === 'paid' ? new Date().toISOString() : invoice.paid_at,
    }

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/invoices?id=eq.${invoice_id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
        body: JSON.stringify(updates),
      }
    )

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    // Record payment in payments table
    const paymentData = {
      invoice_id,
      customer_id: invoice.customer_id,
      amount_cents,
      payment_method: payment_method || 'other',
      reference_number: reference_number || null,
      notes: notes || null,
      payment_date: new Date().toISOString().split('T')[0],
    }

    await fetch(
      `${supabaseUrl}/rest/v1/payments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
        body: JSON.stringify(paymentData),
      }
    )

    // Update customer outstanding balance if customer_id exists
    if (invoice.customer_id) {
      // Get all unpaid invoice balances for this customer
      const balanceResponse = await fetch(
        `${supabaseUrl}/rest/v1/invoices?customer_id=eq.${invoice.customer_id}&status=neq.paid&status=neq.void&select=balance_due_cents`,
        {
          headers: {
            'apikey': getSupabaseKey(),
            'Authorization': `Bearer ${getSupabaseKey()}`,
          },
        }
      )

      if (balanceResponse.ok) {
        const balances = await balanceResponse.json()
        const totalOutstanding = balances.reduce((sum: number, inv: { balance_due_cents: number }) => sum + (inv.balance_due_cents || 0), 0)

        await fetch(
          `${supabaseUrl}/rest/v1/customers?id=eq.${invoice.customer_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': getSupabaseKey(),
              'Authorization': `Bearer ${getSupabaseKey()}`,
            },
            body: JSON.stringify({ outstanding_balance_cents: totalOutstanding }),
          }
        )
      }
    }

    console.log(`Payment of ${amount_cents / 100} recorded for invoice ${invoice.invoice_number}`)

    return NextResponse.json({
      success: true,
      message: 'Payment recorded',
      new_balance_cents: newBalance,
      new_status: newStatus,
    })

  } catch (error) {
    console.error('Record payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
