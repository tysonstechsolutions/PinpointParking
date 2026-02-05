// ============================================
// TRANSACTION API - CREATE & MANAGE RECEIPTS
// ============================================
//
// POST - Create new transaction (called by Stripe webhook)
// GET - Get transaction by receipt number
//
// ============================================

import { NextResponse } from 'next/server'
import { config } from '@/config/config'

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

// ============================================
// GENERATE RECEIPT NUMBER
// ============================================
async function generateReceiptNumber(): Promise<string> {
  // Call the database function to generate receipt number
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/generate_receipt_number`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
        body: JSON.stringify({}),
      }
    )

    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.error('Error generating receipt number:', e)
  }

  // Fallback: generate manually if function doesn't exist
  const now = new Date()
  const year = now.getFullYear()
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `PP-${year}-${random}`
}

// ============================================
// SEND SMS RECEIPT
// ============================================
async function sendReceiptSMS(
  phone: string,
  receiptNumber: string,
  amount: number,
  description: string
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from || !phone) return false

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || config.websiteUrl
  const receiptUrl = `${siteUrl}/receipt/${receiptNumber}`

  const message = `PAYMENT RECEIVED

Receipt: ${receiptNumber}
Amount: $${(amount / 100).toFixed(2)}

${description}

View Receipt: ${receiptUrl}

Thank you!
- ${config.businessName}`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({ To: phone, From: from, Body: message }),
      }
    )
    return response.ok
  } catch (e) {
    console.error('Receipt SMS error:', e)
    return false
  }
}

// ============================================
// CREATE TRANSACTION
// ============================================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      invoice_id,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      amount_cents,
      description,
      type, // 'deposit', 'full', 'balance', 'partial', 'custom'
      service_address,
      job_type,
      stripe_session_id,
      stripe_payment_intent,
      payment_method = 'card',
      send_sms = true,
    } = body

    if (!amount_cents || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: amount_cents, type' },
        { status: 400 }
      )
    }

    // Generate receipt number
    const receipt_number = await generateReceiptNumber()

    // Create transaction record
    const transactionData = {
      receipt_number,
      invoice_id: invoice_id || null,
      customer_id: customer_id || null,
      customer_name: customer_name || 'Customer',
      customer_phone: customer_phone || null,
      customer_email: customer_email || null,
      amount_cents,
      description: description || null,
      type,
      service_address: service_address || null,
      job_type: job_type || null,
      stripe_session_id: stripe_session_id || null,
      stripe_payment_intent: stripe_payment_intent || null,
      payment_method,
      status: 'completed',
      paid_at: new Date().toISOString(),
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(transactionData),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Transaction creation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    const [transaction] = await response.json()
    console.log(`Transaction created: ${receipt_number}`)

    // Send SMS receipt
    if (send_sms && customer_phone) {
      const smsDescription = description || type
      const smsSent = await sendReceiptSMS(
        customer_phone,
        receipt_number,
        amount_cents,
        smsDescription
      )

      if (smsSent) {
        console.log(`Receipt SMS sent to ${customer_phone}`)
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || config.websiteUrl

    return NextResponse.json({
      success: true,
      transaction,
      receipt_number,
      receipt_url: `${siteUrl}/receipt/${receipt_number}`,
    })

  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================
// GET TRANSACTION
// ============================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const receiptNumber = searchParams.get('receipt_number')
  const invoiceId = searchParams.get('invoice_id')

  if (!receiptNumber && !invoiceId) {
    return NextResponse.json(
      { error: 'Provide receipt_number or invoice_id' },
      { status: 400 }
    )
  }

  try {
    let query = ''
    if (receiptNumber) {
      query = `receipt_number=eq.${receiptNumber}`
    } else {
      query = `invoice_id=eq.${invoiceId}&order=created_at.desc`
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/transactions?${query}`,
      {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (receiptNumber) {
        if (data.length > 0) {
          return NextResponse.json(data[0])
        }
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })

  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
