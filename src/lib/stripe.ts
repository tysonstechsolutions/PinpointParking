// ============================================
// STRIPE PAYMENT INTEGRATION
// ============================================

import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    })
  : null

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!stripeSecretKey
}

// Create a payment intent for an invoice
export async function createPaymentIntent(
  amountCents: number,
  invoiceId: number,
  customerEmail?: string
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
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
  if (!stripe) return null

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}
