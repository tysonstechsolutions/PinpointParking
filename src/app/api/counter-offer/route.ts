import { NextResponse } from 'next/server'
import { config } from '@/config/config'
import { getSupabaseUrl, getSupabaseKey } from '@/lib/supabase'

// ============================================
// COUNTER-OFFER API
// Allows customers to submit counter-offers for invoices
// ============================================

const getSupabaseConfig = () => ({
  url: getSupabaseUrl(),
  key: getSupabaseKey(true), // Use service key for server-side operations
})

// Send SMS notification to owner
async function sendTwilioSMS({ to, message }: { to: string; message: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    console.log('Twilio not configured - SMS not sent')
    return null
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({ To: to, From: from, Body: message }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio error:', error)
      return null
    }

    return response.json()
  } catch (error) {
    console.error('SMS send error:', error)
    return null
  }
}

// Format currency for display
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      invoiceId,
      invoiceNumber,
      jobId,
      customerName,
      customerPhone,
      customerEmail,
      originalAmountCents,
      counterOfferCents,
      message,
    } = body

    // Validate required fields
    if (!invoiceId || !originalAmountCents || !counterOfferCents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate counter offer is reasonable (at least $500, not more than original)
    if (counterOfferCents < 50000) {
      return NextResponse.json(
        { error: 'Counter-offer must be at least $500' },
        { status: 400 }
      )
    }

    if (counterOfferCents > originalAmountCents) {
      return NextResponse.json(
        { error: 'Counter-offer cannot exceed original amount' },
        { status: 400 }
      )
    }

    const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig()

    // Save counter-offer to database (create counter_offers table if needed, or save to invoice notes)
    if (supabaseUrl && supabaseKey) {
      try {
        // Update invoice with counter-offer information in the notes field
        const counterOfferNote = `\n\n--- COUNTER-OFFER RECEIVED ---\nDate: ${new Date().toLocaleString()}\nOriginal: ${formatCurrency(originalAmountCents)}\nOffered: ${formatCurrency(counterOfferCents)}\nDifference: ${formatCurrency(originalAmountCents - counterOfferCents)}\n${message ? `Message: ${message}` : ''}`

        // First get current notes
        const getResponse = await fetch(
          `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}&select=notes`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        )

        let currentNotes = ''
        if (getResponse.ok) {
          const [invoice] = await getResponse.json()
          currentNotes = invoice?.notes || ''
        }

        // Update invoice with counter-offer note
        await fetch(
          `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              notes: currentNotes + counterOfferNote,
              counter_offer_cents: counterOfferCents,
              counter_offer_at: new Date().toISOString(),
            }),
          }
        )

        // Also update the job if we have a job_id
        if (jobId) {
          const jobNotes = `Counter-offer: ${formatCurrency(counterOfferCents)} (Original: ${formatCurrency(originalAmountCents)})`
          await fetch(
            `${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                internal_notes: jobNotes,
              }),
            }
          )
        }
      } catch (e) {
        console.error('Error saving counter-offer:', e)
        // Continue anyway - SMS notification is more important
      }
    }

    // Build SMS message for owner
    const discount = originalAmountCents - counterOfferCents
    const discountPercent = Math.round((discount / originalAmountCents) * 100)

    let smsMessage = `COUNTER-OFFER!\n\n`
    smsMessage += `Invoice: ${invoiceNumber || `#${invoiceId}`}\n`
    smsMessage += `Customer: ${customerName || 'Unknown'}\n`
    if (customerPhone) smsMessage += `Phone: ${customerPhone}\n`
    if (customerEmail) smsMessage += `Email: ${customerEmail}\n`
    smsMessage += `\nOriginal: ${formatCurrency(originalAmountCents)}\n`
    smsMessage += `Offered: ${formatCurrency(counterOfferCents)}\n`
    smsMessage += `Discount: ${formatCurrency(discount)} (${discountPercent}%)\n`
    if (message) {
      smsMessage += `\nMessage: "${message}"\n`
    }

    // Send SMS to owner
    const ownerPhone = process.env.OWNER_PHONE
    if (ownerPhone && config.notifications?.twilio?.enabled) {
      await sendTwilioSMS({ to: ownerPhone, message: smsMessage })
      console.log('Counter-offer SMS notification sent')
    }

    return NextResponse.json({
      success: true,
      message: 'Counter-offer submitted successfully',
    })

  } catch (error) {
    console.error('Counter-offer API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit counter-offer' },
      { status: 500 }
    )
  }
}
