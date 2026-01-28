// ============================================
// CREATE PAYMENT SESSION API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe'
import { config } from '@/config/config'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { invoiceId, amountCents, description, customerEmail, paymentType = 'full' } = body

    if (!invoiceId || !amountCents) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceId, amountCents' },
        { status: 400 }
      )
    }

    // Verify the invoice exists
    const invoiceRes = await fetch(
      `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
      {
        headers: {
          'apikey': config.supabase.anonKey,
          'Authorization': `Bearer ${config.supabase.anonKey}`,
        },
      }
    )

    if (!invoiceRes.ok) {
      return NextResponse.json(
        { error: 'Failed to verify invoice' },
        { status: 500 }
      )
    }

    const invoices = await invoiceRes.json()
    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoice = invoices[0]

    // Check if already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout session
    const checkoutUrl = await createCheckoutSession(
      invoiceId,
      amountCents,
      description || `Invoice #${invoice.invoice_number || invoiceId}`,
      customerEmail || invoice.customer_email,
      paymentType
    )

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create payment session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
    })

  } catch (error) {
    console.error('Payment session error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
