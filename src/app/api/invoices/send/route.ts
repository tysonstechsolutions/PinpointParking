// ============================================
// SEND INVOICE VIA SMS
// ============================================

import { NextResponse } from 'next/server'
import { config } from '@/config/config'

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

export async function POST(request: Request) {
  try {
    const { invoice_id, reminder = false } = await request.json()

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'invoice_id is required' },
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

    if (!invoice.customer_phone) {
      return NextResponse.json(
        { error: 'No phone number on invoice' },
        { status: 400 }
      )
    }

    // Format amount
    const amount = ((invoice.balance_due_cents || invoice.total_cents) / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })

    // Build message
    const dueDate = invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'upon receipt'

    const messageType = reminder ? 'Reminder' : 'Invoice'
    const paymentUrl = `${config.websiteUrl}/invoice/${invoice.invoice_number}`

    const message = `${messageType} from ${config.businessName}

Invoice: ${invoice.invoice_number}
Amount Due: ${amount}
Due: ${dueDate}

View & Pay Online:
${paymentUrl}

Questions? Call ${config.phone}`

    // Send SMS via Twilio
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER

    if (twilioSid && twilioAuth && twilioPhone) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`

      const formData = new URLSearchParams()
      formData.append('To', invoice.customer_phone)
      formData.append('From', twilioPhone)
      formData.append('Body', message)

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (!twilioResponse.ok) {
        const error = await twilioResponse.text()
        console.error('Twilio error:', error)
        return NextResponse.json(
          { error: 'Failed to send SMS' },
          { status: 500 }
        )
      }
    } else {
      console.log('Twilio not configured, would send:', message)
    }

    // Update invoice
    const updates: any = {
      reminder_count: (invoice.reminder_count || 0) + 1,
      last_reminder_sent_at: new Date().toISOString(),
      next_reminder_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    }

    if (invoice.status === 'draft') {
      updates.status = 'sent'
      updates.sent_at = new Date().toISOString()
    }

    await fetch(
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

    console.log(`Invoice ${invoice.invoice_number} sent to ${invoice.customer_phone}`)

    return NextResponse.json({
      success: true,
      message: 'Invoice sent',
    })

  } catch (error: any) {
    console.error('Send invoice error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
