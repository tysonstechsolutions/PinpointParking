// ============================================
// STRIPE WEBHOOK HANDLER
// ============================================
//
// Handles Stripe events:
// - checkout.session.completed → Update invoice, create transaction, update customer
//
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, getStripe } from '@/lib/stripe'
import { config } from '@/config/config'

const supabaseUrl = config.supabase.url
const getSupabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabase.anonKey

// ============================================
// HELPER: Create Transaction Record
// ============================================
async function createTransaction(data: {
  invoice_id: number
  customer_id?: number
  customer_name: string
  customer_phone?: string
  customer_email?: string
  amount_cents: number
  description: string
  type: string
  service_address?: string
  job_type?: string
  stripe_session_id: string
  stripe_payment_intent: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || config.websiteUrl

  try {
    const response = await fetch(`${siteUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        payment_method: 'card',
        send_sms: true,
      }),
    })

    if (response.ok) {
      return await response.json()
    }
    console.error('Transaction creation failed:', await response.text())
    return null
  } catch (e) {
    console.error('Transaction error:', e)
    return null
  }
}

// ============================================
// HELPER: Update Customer Outstanding Balance
// ============================================
async function updateCustomerBalance(customerId: number, paymentAmount: number) {
  const supabaseKey = getSupabaseKey()

  // Get current customer data
  const customerResponse = await fetch(
    `${supabaseUrl}/rest/v1/customers?id=eq.${customerId}`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  )

  if (!customerResponse.ok) return

  const [customer] = await customerResponse.json()
  if (!customer) return

  // Reduce outstanding balance by payment amount
  const newOutstanding = Math.max(0, (customer.outstanding_balance_cents || 0) - paymentAmount)
  const newTotalSpent = (customer.total_spent_cents || 0) + paymentAmount

  await fetch(
    `${supabaseUrl}/rest/v1/customers?id=eq.${customerId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        outstanding_balance_cents: newOutstanding,
        total_spent_cents: newTotalSpent,
      }),
    }
  )

  console.log(`Updated customer ${customerId}: spent=${newTotalSpent}, outstanding=${newOutstanding}`)
}

// ============================================
// HELPER: Send SMS
// ============================================
async function sendSMS(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) return false

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
    return response.ok
  } catch (e) {
    console.error('SMS error:', e)
    return false
  }
}

// ============================================
// WEBHOOK HANDLER
// ============================================
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = getStripe()

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

    console.log(`Stripe webhook: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const invoiceId = session.metadata?.invoiceId
        const paymentType = session.metadata?.paymentType || 'full'

        if (invoiceId) {
          const amountPaid = session.amount_total || 0
          const supabaseKey = getSupabaseKey()

          // Fetch the current invoice
          const invoiceResponse = await fetch(
            `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}`,
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
          }

          console.log(`Payment received: $${amountPaid / 100}, Total paid: $${totalPaid / 100}, Balance: $${balanceDue / 100}, Status: ${newStatus}`)

          // Update invoice status and amounts
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
                status: newStatus,
                amount_paid_cents: totalPaid,
                balance_due_cents: balanceDue,
                last_payment_at: new Date().toISOString(),
                paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
              }),
            }
          )

          // Create transaction record with receipt
          const paymentLabel = paymentType === 'deposit' ? 'Deposit (50%)' : paymentType === 'balance' ? 'Balance Payment' : 'Full Payment'
          const txResult = await createTransaction({
            invoice_id: parseInt(invoiceId),
            customer_id: invoice.customer_id,
            customer_name: invoice.customer_name,
            customer_phone: invoice.customer_phone,
            customer_email: invoice.customer_email || (session.customer_details as { email?: string })?.email,
            amount_cents: amountPaid,
            description: `${paymentLabel} - ${invoice.service_description || invoice.job_type || 'Service'}`,
            type: paymentType,
            service_address: invoice.service_address,
            job_type: invoice.job_type,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
          })

          console.log(`Transaction created: ${txResult?.receipt_number}`)

          // Update customer balance
          if (invoice.customer_id) {
            await updateCustomerBalance(invoice.customer_id, amountPaid)
          }

          // Notify owner with receipt link
          const ownerPhone = process.env.OWNER_PHONE
          if (ownerPhone) {
            const paymentTypeLabel = paymentType === 'deposit' ? 'DEPOSIT' : paymentType === 'balance' ? 'BALANCE' : 'FULL PAYMENT'
            await sendSMS(ownerPhone,
              `${paymentTypeLabel} RECEIVED!\n\n` +
              `${invoice.customer_name}\n` +
              `${invoice.service_address || ''}\n\n` +
              `Invoice: ${invoice.invoice_number}\n` +
              `Amount: $${(amountPaid / 100).toFixed(2)}\n` +
              (balanceDue > 0 ? `Balance Due: $${(balanceDue / 100).toFixed(2)}\n` : 'PAID IN FULL!\n') +
              `\nReceipt: ${txResult?.receipt_number || 'Created'}`
            )
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
