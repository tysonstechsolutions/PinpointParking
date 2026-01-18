// ============================================
// STRIPE PAYMENT INTEGRATION
// ============================================

import Stripe from 'stripe'

// Lazy initialization - create Stripe client on first use
let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY is not set')
    return null
  }

  _stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-15.basil',
  })
  return _stripe
}

// For backwards compatibility
export const stripe = null as Stripe | null // Will use getStripe() instead

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

// Create a payment intent for an invoice
export async function createPaymentIntent(
  amountCents: number,
  invoiceId: number,
  customerEmail?: string
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe()
  if (!stripe) {
    console.error('Stripe is not configured')
    return null
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        invoiceId: invoiceId.toString(),
      },
      receipt_email: customerEmail || undefined,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Failed to create payment intent:', error)
    return null
  }
}

// Retrieve payment intent status
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripe()
  if (!stripe) return null

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error)
    return null
  }
}

// Create a Stripe Checkout session for an invoice
export async function createCheckoutSession(
  invoiceId: number,
  amountCents: number,
  description: string,
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<string | null> {
  const stripe = getStripe()
  if (!stripe) {
    console.error('Stripe is not configured')
    return null
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || `Invoice #${invoiceId}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${baseUrl}/pay/${invoiceId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/pay/${invoiceId}`,
      customer_email: customerEmail || undefined,
      metadata: {
        invoiceId: invoiceId.toString(),
      },
    })

    return session.url
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return null
  }
}

// Verify Stripe webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  const stripe = getStripe()
  if (!stripe) return null

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}
