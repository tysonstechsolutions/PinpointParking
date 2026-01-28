// ============================================
// STRIPE WEBHOOK HANDLER
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, getStripe } from '@/lib/stripe'
import { config } from '@/config/config'

export async function POST(request: NextRequest) {
  // Get env vars at runtime, not build time
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = getStripe()

  // Log configuration status (server-side only, not exposed)
  if (!stripe || !webhookSecret) {
    console.error('Stripe webhook not configured - stripe:', !!stripe, 'secret:', !!webhookSecret)
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const event = constructWebhookEvent(body, signature, webhookSecret)

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const invoiceId = session.metadata?.invoiceId
        const paymentType = session.metadata?.paymentType || 'full' // 'deposit' or 'full' or 'balance'

        if (invoiceId) {
          const amountPaid = session.amount_total || 0
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

          // First, fetch the current invoice to get existing amounts
          const invoiceResponse = await fetch(
            `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }
          )

          if (!invoiceResponse.ok) {
            console.error('Failed to fetch invoice for payment update')
            break
          }

          const invoices = await invoiceResponse.json()
          if (!invoices.length) {
            console.error('Invoice not found:', invoiceId)
            break
          }

          const invoice = invoices[0]
          const previouslyPaid = invoice.amount_paid_cents || 0
          const totalPaid = previouslyPaid + amountPaid
          const totalDue = invoice.total_cents || 0
          const balanceDue = Math.max(0, totalDue - totalPaid)

          // Determine status based on payment
          let newStatus = 'partial'
          if (balanceDue <= 0) {
            newStatus = 'paid'
          } else if (totalPaid > 0) {
            newStatus = 'partial'
          }

          console.log(`Payment received: $${amountPaid / 100}, Total paid: $${totalPaid / 100}, Balance: $${balanceDue / 100}, Status: ${newStatus}`)

          // Update invoice status and amounts
          await fetch(
            `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                status: newStatus,
                amount_paid_cents: totalPaid,
                balance_due_cents: balanceDue,
                last_payment_at: new Date().toISOString(),
              }),
            }
          )

          // Record the payment
          await fetch(
            `${config.supabase.url}/rest/v1/payments`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                invoice_id: parseInt(invoiceId),
                amount_cents: amountPaid,
                payment_type: paymentType,
                payment_method: 'stripe',
                stripe_payment_id: session.payment_intent,
                stripe_session_id: session.id,
                status: 'completed',
                paid_at: new Date().toISOString(),
                notes: paymentType === 'deposit' ? 'Deposit payment (50%)' : paymentType === 'balance' ? 'Balance payment' : 'Full payment',
              }),
            }
          )

          // Send notification to owner about payment
          const ownerPhone = process.env.OWNER_PHONE
          if (ownerPhone) {
            const twilioSid = process.env.TWILIO_ACCOUNT_SID
            const twilioAuth = process.env.TWILIO_AUTH_TOKEN
            const twilioPhone = process.env.TWILIO_PHONE_NUMBER

            if (twilioSid && twilioAuth && twilioPhone) {
              const paymentLabel = paymentType === 'deposit' ? 'DEPOSIT' : paymentType === 'balance' ? 'BALANCE' : 'FULL PAYMENT'
              const message = `${paymentLabel} RECEIVED!\n\n` +
                `Invoice: ${invoice.invoice_number}\n` +
                `Customer: ${invoice.customer_name}\n` +
                `Amount: $${(amountPaid / 100).toFixed(2)}\n` +
                (balanceDue > 0 ? `Balance Due: $${(balanceDue / 100).toFixed(2)}\n` : 'PAID IN FULL!')

              await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  To: ownerPhone,
                  From: twilioPhone,
                  Body: message,
                }),
              })
            }
          }

          console.log(`Payment completed for invoice ${invoiceId} - ${paymentType}: $${amountPaid / 100}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const invoiceId = paymentIntent.metadata?.invoiceId
        console.log(`Payment failed for invoice ${invoiceId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
