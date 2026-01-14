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

  // Debug: Log what we have
  console.log('Webhook called - stripe configured:', !!stripe)
  console.log('Webhook called - secret exists:', !!webhookSecret)
  console.log('Webhook called - STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      {
        error: 'Webhook not configured',
        debug: {
          stripeConfigured: !!stripe,
          webhookSecretExists: !!webhookSecret,
          secretKeyExists: !!process.env.STRIPE_SECRET_KEY,
        }
      },
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

        if (invoiceId) {
          const amountPaid = session.amount_total || 0

          // Update invoice status
          await fetch(
            `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey}`,
              },
              body: JSON.stringify({
                status: 'paid',
                amount_paid_cents: amountPaid,
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
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey}`,
              },
              body: JSON.stringify({
                invoice_id: parseInt(invoiceId),
                amount_cents: amountPaid,
                payment_method: 'stripe',
                stripe_payment_id: session.payment_intent,
                status: 'completed',
                paid_at: new Date().toISOString(),
              }),
            }
          )

          console.log(`Payment completed for invoice ${invoiceId}`)
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
