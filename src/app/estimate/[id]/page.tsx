'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { config } from '@/config/config'

interface LineItem {
  description: string
  quantity?: number
  unit?: string
  unit_price_cents?: number
  amount_cents: number
}

interface Estimate {
  id: number
  invoice_number: string
  customer_name: string
  customer_phone: string
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
  scheduled_date?: string
  job_type?: string
  square_feet?: number
  notes?: string
}

export default function EstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEstimate = useCallback(async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/invoices?id=eq.${id}`,
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
          const est = data[0]
          if (typeof est.line_items === 'string') {
            try {
              est.line_items = JSON.parse(est.line_items)
            } catch {
              est.line_items = []
            }
          }
          setEstimate(est)
        } else {
          setError('Estimate not found')
        }
      } else {
        setError('Failed to load estimate')
      }
    } catch {
      setError('Failed to load estimate')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchEstimate()
  }, [fetchEstimate])

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

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !estimate) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>{error || 'Estimate not found'}</p>
      </div>
    )
  }

  const depositAmount = Math.round(estimate.total_cents * 0.5)
  const balanceAfterDeposit = estimate.total_cents - depositAmount

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .estimate-container { box-shadow: none !important; }
        }
        @page { margin: 0.5in; }
      `}</style>

      {/* Print/Download Button */}
      <div className="no-print" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
      }}>
        <button
          onClick={handlePrint}
          style={{
            padding: '12px 24px',
            backgroundColor: '#F5C518',
            color: '#1a1714',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#302d2a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Close
        </button>
      </div>

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '40px 20px',
      }}>
        <div className="estimate-container" style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#1a1714',
            color: 'white',
            padding: '40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#F5C518' }}>
                  {config.businessName}
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#9C9690' }}>{config.phone}</p>
                <p style={{ margin: '4px 0 0 0', color: '#9C9690' }}>{config.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#F5C518' }}>
                  ESTIMATE
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
                  #{estimate.invoice_number || estimate.id}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#9C9690' }}>
                  Date: {formatDate(estimate.created_at)}
                </p>
                {estimate.due_date && (
                  <p style={{ margin: '4px 0 0 0', color: '#9C9690' }}>
                    Valid Until: {formatDate(estimate.due_date)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Service Info */}
          <div style={{ padding: '30px 40px', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Prepared For
                </h3>
                <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{estimate.customer_name}</p>
                {estimate.customer_phone && (
                  <p style={{ margin: '4px 0 0 0', color: '#666' }}>{estimate.customer_phone}</p>
                )}
                {estimate.customer_email && (
                  <p style={{ margin: '4px 0 0 0', color: '#666' }}>{estimate.customer_email}</p>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Service Location
                </h3>
                <p style={{ margin: 0, fontSize: '16px' }}>{estimate.service_address || 'TBD'}</p>
                {estimate.scheduled_date && (
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Scheduled: {formatDate(estimate.scheduled_date)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Description */}
          {estimate.service_description && (
            <div style={{ padding: '20px 40px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                Service Description
              </h3>
              <p style={{ margin: 0, fontSize: '16px' }}>{estimate.service_description}</p>
              {estimate.square_feet && (
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  Estimated Area: {estimate.square_feet.toLocaleString()} sq ft
                </p>
              )}
            </div>
          )}

          {/* Line Items */}
          <div style={{ padding: '30px 40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1a1714' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Description
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', width: '80px' }}>
                    Qty
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', width: '100px' }}>
                    Unit Price
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', width: '120px' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {estimate.line_items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px 0', fontSize: '15px' }}>{item.description}</td>
                    <td style={{ padding: '16px 0', textAlign: 'center', color: '#666' }}>
                      {item.quantity || 1}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right', color: '#666' }}>
                      {item.unit_price_cents ? formatCurrency(item.unit_price_cents) : '-'}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '500' }}>
                      {formatCurrency(item.amount_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span>{formatCurrency(estimate.subtotal_cents)}</span>
                </div>
                {estimate.tax_cents > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#666' }}>Tax</span>
                    <span>{formatCurrency(estimate.tax_cents)}</span>
                  </div>
                )}
                {estimate.discount_cents > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#666' }}>Discount</span>
                    <span style={{ color: '#16a34a' }}>-{formatCurrency(estimate.discount_cents)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderTop: '2px solid #1a1714',
                  marginTop: '8px',
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(estimate.total_cents)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div style={{
            padding: '30px 40px',
            backgroundColor: '#f9f9f9',
            borderTop: '1px solid #eee',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Payment Terms</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '2px solid #F5C518',
              }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                  Deposit Due (50%)
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#F5C518' }}>
                  {formatCurrency(depositAmount)}
                </p>
                <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 0' }}>
                  Due upon acceptance
                </p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                  Balance Due
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {formatCurrency(balanceAfterDeposit)}
                </p>
                <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 0' }}>
                  Due upon completion
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div style={{ padding: '30px 40px', borderTop: '1px solid #eee' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Notes</h3>
              <p style={{ margin: 0, color: '#666', whiteSpace: 'pre-wrap' }}>{estimate.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: '30px 40px',
            backgroundColor: '#1a1714',
            color: 'white',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Thank you for considering {config.businessName}!
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9C9690' }}>
              This estimate is valid for 30 days from the date of issue.
            </p>
            <p style={{ margin: '16px 0 0 0', fontSize: '13px', color: '#9C9690' }}>
              {config.phone} | {config.email}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
