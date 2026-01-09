'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'

export default function PaymentSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ invoiceId: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { invoiceId } = use(params)
  const { session_id } = use(searchParams)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Give webhook time to process
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1714',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        backgroundColor: '#252220',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '500px',
        border: '2px solid #16a34a',
      }}>
        {loading ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>Processing...</div>
            <p style={{ color: '#9C9690' }}>Confirming your payment...</p>
          </>
        ) : (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}>
              Payment Successful!
            </h1>

            <p style={{
              color: '#9C9690',
              marginBottom: '8px',
            }}>
              Thank you for your payment.
            </p>

            <p style={{
              color: '#9C9690',
              marginBottom: '32px',
            }}>
              A receipt has been sent to your email.
            </p>

            <div style={{
              backgroundColor: '#302d2a',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '32px',
            }}>
              <p style={{ color: '#9C9690', fontSize: '14px' }}>Invoice #{invoiceId}</p>
              <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px', marginTop: '4px' }}>
                Paid in Full
              </p>
            </div>

            <Link
              href={`/pay/${invoiceId}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#302d2a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
              }}
            >
              View Invoice
            </Link>
          </>
        )}

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #302d2a',
          color: '#666',
          fontSize: '14px',
        }}>
          <p>{config.businessName}</p>
          <p>{config.phone}</p>
        </div>
      </div>
    </div>
  )
}
