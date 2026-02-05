'use client'

import { useState, useEffect, use } from 'react'
import { config } from '@/config/config'

interface Transaction {
  id: number
  receipt_number: string
  invoice_id?: number
  customer_id?: number
  customer_name: string
  customer_phone?: string
  customer_email?: string
  amount_cents: number
  description?: string
  type: string
  service_address?: string
  job_type?: string
  stripe_session_id?: string
  stripe_payment_intent?: string
  payment_method: string
  status: string
  paid_at: string
  created_at: string
}

// Pinpoint Logo Component
const PinpointLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#1a1714" stroke="#F5C518" strokeWidth="2"/>
    <circle cx="16" cy="16" r="12" fill="none" stroke="#F5C518" strokeWidth="2.5"/>
    <circle cx="16" cy="16" r="4" fill="#F5C518"/>
    <line x1="16" y1="2" x2="16" y2="8" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="16" y1="24" x2="16" y2="30" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="2" y1="16" x2="8" y2="16" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="24" y1="16" x2="30" y2="16" stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransaction()
  }, [id])

  const fetchTransaction = async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/transactions?receipt_number=eq.${id}`,
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
          setTransaction(data[0])
        } else {
          setError('Receipt not found')
        }
      } else {
        setError('Failed to load receipt')
      }
    } catch (err) {
      setError('Error loading receipt')
      console.error(err)
    }
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Deposit Payment',
      full: 'Full Payment',
      balance: 'Balance Payment',
      partial: 'Partial Payment',
      custom: 'Service Payment'
    }
    return labels[type] || 'Payment'
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
        <div style={{ color: '#F5C518', fontSize: '18px' }}>Loading receipt...</div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1714',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>!</div>
          <h1 style={{ color: '#F5C518', fontSize: '24px', marginBottom: '8px' }}>{error || 'Receipt not found'}</h1>
          <p style={{ color: '#9C9690' }}>Please check the link and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1714',
      padding: '32px 16px',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Print Button */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#F5C518',
              color: '#1a1714',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Print Receipt
          </button>
        </div>

        {/* Receipt Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#1a1714',
            color: 'white',
            padding: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <PinpointLogo />
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#F5C518', margin: 0 }}>
                    {config.businessName}
                  </h1>
                  <p style={{ color: '#9C9690', margin: '4px 0 0 0', fontSize: '14px' }}>{config.phone}</p>
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
              }}>
                ✓
              </div>
            </div>
          </div>

          {/* Receipt Content */}
          <div style={{ padding: '32px' }}>
            {/* Payment Confirmed Banner */}
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}>✓</div>
              <div>
                <p style={{ fontWeight: '600', color: '#166534', margin: 0 }}>Payment Confirmed</p>
                <p style={{ fontSize: '14px', color: '#15803d', margin: '4px 0 0 0' }}>{formatDate(transaction.paid_at)}</p>
              </div>
            </div>

            {/* Receipt Number & Amount */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #eee',
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Receipt Number</p>
                <p style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '600', margin: 0 }}>{transaction.receipt_number}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Amount Paid</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#F5C518', margin: 0 }}>{formatCurrency(transaction.amount_cents)}</p>
              </div>
            </div>

            {/* Service Details */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '12px' }}>
                Service Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>📄</span>
                  <div>
                    <p style={{ fontWeight: '500', margin: 0 }}>{getTypeLabel(transaction.type)}</p>
                    {transaction.description && (
                      <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>{transaction.description}</p>
                    )}
                  </div>
                </div>

                {transaction.job_type && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>🚧</span>
                    <p style={{ fontWeight: '500', margin: 0 }}>{transaction.job_type}</p>
                  </div>
                )}

                {transaction.service_address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>📍</span>
                    <p style={{ margin: 0 }}>{transaction.service_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #eee',
            }}>
              <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '12px' }}>
                Customer
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontWeight: '500', margin: 0 }}>{transaction.customer_name}</p>
                {transaction.customer_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                    <span>📞</span>
                    {transaction.customer_phone}
                  </div>
                )}
                {transaction.customer_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                    <span>✉️</span>
                    {transaction.customer_email}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '12px' }}>
                Payment Information
              </h2>

              <div style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Method</span>
                  <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{transaction.payment_method || 'Card'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Status</span>
                  <span style={{ fontWeight: '500', color: '#16a34a', textTransform: 'capitalize' }}>{transaction.status}</span>
                </div>
                {transaction.stripe_payment_intent && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#999' }}>Reference</span>
                    <span style={{ fontFamily: 'monospace', color: '#999' }}>
                      ...{transaction.stripe_payment_intent.slice(-8)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#666',
              paddingTop: '16px',
              borderTop: '1px solid #eee',
            }}>
              <p style={{ marginBottom: '4px' }}>Thank you for your business!</p>
              <p style={{ margin: 0 }}>{config.businessName} • {config.phone}</p>
              <p style={{ margin: '4px 0 0 0' }}>{config.email}</p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="no-print" style={{ marginTop: '24px', textAlign: 'center', color: '#9C9690' }}>
          <p style={{ margin: 0 }}>Questions about your receipt?</p>
          <a href={`tel:${config.phoneRaw}`} style={{ color: '#F5C518', fontWeight: '500' }}>
            Call {config.phone}
          </a>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
