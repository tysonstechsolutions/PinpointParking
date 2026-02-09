'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, use, useCallback } from 'react'
import { config } from '@/config/config'

interface LineItem {
  description: string
  quantity?: number
  unit?: string
  unit_price_cents?: number
  amount_cents?: number
  total_cents?: number
}

interface Invoice {
  id: number
  invoice_number: string
  customer_name: string
  customer_phone?: string
  customer_email: string
  customer_address: string
  service_address: string
  service_description: string
  line_items: LineItem[]
  subtotal_cents: number
  tax_cents: number
  discount_cents: number
  total_cents: number
  amount_paid_cents: number
  status: string
  due_date: string
  created_at: string
  job_id?: number
}

export default function PaymentPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Counter-offer state
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterOfferAmount, setCounterOfferAmount] = useState(0)
  const [counterOfferSubmitting, setCounterOfferSubmitting] = useState(false)
  const [counterOfferSuccess, setCounterOfferSuccess] = useState(false)
  const [counterOfferMessage, setCounterOfferMessage] = useState('')

  const fetchInvoice = useCallback(async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          const inv = data[0]
          // Parse line_items if string
          if (typeof inv.line_items === 'string') {
            try {
              inv.line_items = JSON.parse(inv.line_items)
            } catch {
              inv.line_items = []
            }
          }
          setInvoice(inv)
        } else {
          setError('Invoice not found')
        }
      } else {
        setError('Failed to load invoice')
      }
    } catch {
      setError('Failed to load invoice')
    }
    setLoading(false)
  }, [invoiceId])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  const handlePayment = async (paymentType: 'deposit' | 'full' | 'balance' = 'full') => {
    if (!invoice) return

    setProcessing(true)
    setError('')

    try {
      const totalDue = invoice.total_cents - (invoice.amount_paid_cents || 0)

      // Calculate amount based on payment type
      let amountCents = totalDue
      let description = `Invoice #${invoice.invoice_number || invoice.id} - ${config.businessName}`

      if (paymentType === 'deposit') {
        amountCents = Math.round(totalDue * 0.5)
        description = `Deposit (50%) - Invoice #${invoice.invoice_number || invoice.id} - ${config.businessName}`
      } else if (paymentType === 'balance') {
        description = `Balance Due - Invoice #${invoice.invoice_number || invoice.id} - ${config.businessName}`
      }

      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amountCents,
          description,
          customerEmail: invoice.customer_email,
          paymentType,
        }),
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Failed to start payment')
      }
    } catch {
      setError('Payment failed. Please try again.')
    }

    setProcessing(false)
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((cents || 0) / 100)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleCounterOffer = async () => {
    if (!invoice) return

    setCounterOfferSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/counter-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          jobId: invoice.job_id,
          customerName: invoice.customer_name,
          customerPhone: invoice.customer_phone,
          customerEmail: invoice.customer_email,
          originalAmountCents: invoice.total_cents,
          counterOfferCents: counterOfferAmount * 100,
          message: counterOfferMessage,
        }),
      })

      if (response.ok) {
        setCounterOfferSuccess(true)
        setShowCounterOffer(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit counter-offer')
      }
    } catch {
      setError('Failed to submit counter-offer. Please try again.')
    }

    setCounterOfferSubmitting(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1714',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: '#9C9690' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1714',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>Invoice not found</div>
          <p style={{ color: '#9C9690' }}>{error || 'This invoice does not exist or has been removed.'}</p>
        </div>
      </div>
    )
  }

  const amountDue = invoice.total_cents - (invoice.amount_paid_cents || 0)
  const isPaid = invoice.status === 'paid' || amountDue <= 0

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1714',
      padding: '24px 16px',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #302d2a',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}>
            <div>
              <h1 style={{ color: '#F5C518', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {config.businessName}
              </h1>
              <p style={{ color: '#9C9690', marginTop: '4px' }}>{config.phone}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#9C9690', fontSize: '14px' }}>Invoice</p>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                #{invoice.invoice_number || invoice.id}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginTop: '24px',
          }}>
            <div>
              <p style={{ color: '#9C9690', fontSize: '12px', marginBottom: '4px' }}>Bill To</p>
              <p style={{ color: 'white', fontWeight: '500' }}>{invoice.customer_name}</p>
              {invoice.customer_address && (
                <p style={{ color: '#9C9690', fontSize: '14px' }}>{invoice.customer_address}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#9C9690', fontSize: '12px', marginBottom: '4px' }}>Invoice Date</p>
              <p style={{ color: 'white' }}>{formatDate(invoice.created_at)}</p>
              {invoice.due_date && (
                <>
                  <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px', marginBottom: '4px' }}>Due Date</p>
                  <p style={{ color: 'white' }}>{formatDate(invoice.due_date)}</p>
                </>
              )}
            </div>
          </div>

          {invoice.service_address && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#9C9690', fontSize: '12px', marginBottom: '4px' }}>Service Location</p>
              <p style={{ color: 'white' }}>{invoice.service_address}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #302d2a',
        }}>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Services
          </h2>

          <div style={{ borderTop: '1px solid #302d2a' }}>
            {invoice.line_items?.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #302d2a',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white' }}>{item.description}</p>
                  {item.quantity && item.unit_price_cents && (
                    <p style={{ color: '#9C9690', fontSize: '13px' }}>
                      {item.quantity} {item.unit || 'x'} @ {formatCurrency(item.unit_price_cents)}
                    </p>
                  )}
                </div>
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {formatCurrency(item.amount_cents ?? item.total_cents ?? 0)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #302d2a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#9C9690' }}>Subtotal</span>
              <span style={{ color: 'white' }}>{formatCurrency(invoice.subtotal_cents)}</span>
            </div>
            {invoice.tax_cents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9C9690' }}>Tax</span>
                <span style={{ color: 'white' }}>{formatCurrency(invoice.tax_cents)}</span>
              </div>
            )}
            {invoice.discount_cents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9C9690' }}>Discount</span>
                <span style={{ color: '#16a34a' }}>-{formatCurrency(invoice.discount_cents)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #302d2a',
            }}>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>Total</span>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                {formatCurrency(invoice.total_cents)}
              </span>
            </div>
            {invoice.amount_paid_cents > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ color: '#9C9690' }}>Amount Paid</span>
                  <span style={{ color: '#16a34a' }}>-{formatCurrency(invoice.amount_paid_cents)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #302d2a',
                }}>
                  <span style={{ color: 'white', fontWeight: '600' }}>Balance Due</span>
                  <span style={{ color: '#F5C518', fontWeight: 'bold', fontSize: '20px' }}>
                    {formatCurrency(amountDue)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '16px',
          padding: '24px',
          border: isPaid ? '2px solid #16a34a' : '1px solid #302d2a',
          textAlign: 'center',
        }}>
          {isPaid ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>PAID</div>
              <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px' }}>
                Thank you for your payment!
              </p>
              <p style={{ color: '#9C9690', marginTop: '8px' }}>
                This invoice has been paid in full.
              </p>
            </div>
          ) : counterOfferSuccess ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>Offer Sent!</div>
              <p style={{ color: '#F5C518', fontWeight: '600', fontSize: '18px' }}>
                Your counter-offer has been submitted
              </p>
              <p style={{ color: '#9C9690', marginTop: '8px' }}>
                We&apos;ll review your offer of {formatCurrency(counterOfferAmount * 100)} and get back to you soon.
              </p>
              <button
                onClick={() => setCounterOfferSuccess(false)}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  backgroundColor: '#302d2a',
                  color: 'white',
                  border: '1px solid #3A3733',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Back to Invoice
              </button>
            </div>
          ) : showCounterOffer ? (
            <div>
              <p style={{ color: '#F5C518', fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                Make a Counter-Offer
              </p>
              <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '24px' }}>
                Original price: {formatCurrency(invoice.total_cents)}
              </p>

              {/* Slider */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
                  {formatCurrency(counterOfferAmount * 100)}
                </p>
                <input
                  type="range"
                  min={500}
                  max={Math.floor(invoice.total_cents / 100)}
                  value={counterOfferAmount}
                  onChange={(e) => setCounterOfferAmount(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#302d2a',
                    cursor: 'pointer',
                    accentColor: '#F5C518',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ color: '#9C9690', fontSize: '12px' }}>$500</span>
                  <span style={{ color: '#9C9690', fontSize: '12px' }}>{formatCurrency(invoice.total_cents)}</span>
                </div>
              </div>

              {/* Optional message */}
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{ color: '#9C9690', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Message (optional)
                </label>
                <textarea
                  value={counterOfferMessage}
                  onChange={(e) => setCounterOfferMessage(e.target.value)}
                  placeholder="Tell us why you think this price is fair..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#302d2a',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>

              {error && (
                <p style={{
                  color: '#ef4444',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#ef444420',
                  borderRadius: '8px',
                }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCounterOffer(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#302d2a',
                    color: 'white',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCounterOffer}
                  disabled={counterOfferSubmitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: counterOfferSubmitting ? '#b8860b' : '#F5C518',
                    color: '#1a1714',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: counterOfferSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {counterOfferSubmitting ? 'Submitting...' : 'Submit Offer'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Show different UI based on whether deposit has been paid */}
              {invoice.amount_paid_cents > 0 ? (
                // Balance due after deposit
                <>
                  <p style={{ color: '#9C9690', marginBottom: '8px' }}>Balance Due</p>
                  <p style={{ color: '#F5C518', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {formatCurrency(amountDue)}
                  </p>
                  <p style={{ color: '#16a34a', fontSize: '14px', marginBottom: '24px' }}>
                    Deposit paid: {formatCurrency(invoice.amount_paid_cents)}
                  </p>

                  {error && (
                    <p style={{
                      color: '#ef4444',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#ef444420',
                      borderRadius: '8px',
                    }}>
                      {error}
                    </p>
                  )}

                  <button
                    onClick={() => handlePayment('balance')}
                    disabled={processing}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: processing ? '#166534' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: processing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {processing ? 'Redirecting to payment...' : 'Pay Remaining Balance'}
                  </button>
                </>
              ) : (
                // Initial payment - show deposit or full payment options
                <>
                  <p style={{ color: '#9C9690', marginBottom: '8px' }}>Total Due</p>
                  <p style={{ color: '#F5C518', fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
                    {formatCurrency(amountDue)}
                  </p>

                  {error && (
                    <p style={{
                      color: '#ef4444',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#ef444420',
                      borderRadius: '8px',
                    }}>
                      {error}
                    </p>
                  )}

                  {/* Payment Options */}
                  <div style={{ marginBottom: '16px' }}>
                    {/* 50% Deposit Option */}
                    <button
                      onClick={() => handlePayment('deposit')}
                      disabled={processing}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: processing ? '#b8860b' : '#F5C518',
                        color: '#1a1714',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        marginBottom: '12px',
                      }}
                    >
                      {processing ? 'Redirecting...' : `Pay 50% Deposit - ${formatCurrency(Math.round(amountDue * 0.5))}`}
                    </button>

                    <p style={{ color: '#9C9690', fontSize: '13px', marginBottom: '16px' }}>
                      Pay deposit now, balance due upon completion
                    </p>

                    {/* Full Payment Option */}
                    <button
                      onClick={() => handlePayment('full')}
                      disabled={processing}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: processing ? '#166534' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: processing ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {processing ? 'Redirecting...' : `Pay in Full - ${formatCurrency(amountDue)}`}
                    </button>
                  </div>
                </>
              )}

              <p style={{
                color: '#9C9690',
                fontSize: '12px',
                marginTop: '16px',
              }}>
                Secure payment powered by Stripe
              </p>

              {/* Counter-offer option - only show if no payments made yet */}
              {invoice.amount_paid_cents === 0 && (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #302d2a',
                }}>
                  <button
                    onClick={() => {
                      setCounterOfferAmount(Math.floor(invoice.total_cents / 100))
                      setShowCounterOffer(true)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9C9690',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Competitor has a lower price or outside your budget? Make a counter-offer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          color: '#666',
          fontSize: '14px',
        }}>
          <p>{config.businessName}</p>
          <p>{config.phone} | {config.email}</p>
        </div>
      </div>
    </div>
  )
}
