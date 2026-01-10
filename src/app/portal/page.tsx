'use client'

import { useState } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'

interface Job {
  id: number
  job_type: string
  project_type: string
  square_feet: number
  quote_cents: number
  scheduled_date: string
  status: string
  service_address: string
  created_at: string
}

interface Invoice {
  id: number
  invoice_number: string
  total_cents: number
  amount_paid_cents: number
  status: string
  due_date: string
  created_at: string
}

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  total_jobs: number
  total_spent_cents: number
  outstanding_balance_cents: number
}

export default function CustomerPortal() {
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<'lookup' | 'dashboard'>('lookup')

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }

    try {
      // Look up customer by phone
      const customerRes = await fetch(
        `${config.supabase.url}/rest/v1/customers?phone=ilike.%25${cleanPhone.slice(-10)}%25`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )

      if (customerRes.ok) {
        const customers = await customerRes.json()
        if (customers.length > 0) {
          setCustomer(customers[0])

          // Fetch customer's jobs
          const jobsRes = await fetch(
            `${config.supabase.url}/rest/v1/jobs?customer_id=eq.${customers[0].id}&order=created_at.desc`,
            {
              headers: {
                'apikey': config.supabase.anonKey,
                'Authorization': `Bearer ${config.supabase.anonKey}`,
              },
            }
          )
          if (jobsRes.ok) {
            setJobs(await jobsRes.json())
          }

          // Fetch customer's invoices
          const invoicesRes = await fetch(
            `${config.supabase.url}/rest/v1/invoices?customer_id=eq.${customers[0].id}&order=created_at.desc`,
            {
              headers: {
                'apikey': config.supabase.anonKey,
                'Authorization': `Bearer ${config.supabase.anonKey}`,
              },
            }
          )
          if (invoicesRes.ok) {
            setInvoices(await invoicesRes.json())
          }

          setView('dashboard')
        } else {
          setError('No account found with this phone number. Please contact us to get started!')
        }
      } else {
        setError('Failed to look up account. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleLogout = () => {
    setCustomer(null)
    setJobs([])
    setInvoices([])
    setPhone('')
    setView('lookup')
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format((cents || 0) / 100)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusStyle = (status: string) => {
    const statusConfig = config.jobStatuses.find(s => s.id === status)
    return statusConfig || { color: '#f3f4f6', textColor: '#374151', label: status }
  }

  const getServiceName = (type: string) => {
    const service = config.services.find(s => s.id === type)
    return service ? `${service.emoji} ${service.name}` : type
  }

  const getInvoiceStatus = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
      sent: { bg: '#dbeafe', color: '#1d4ed8', label: 'Pending' },
      viewed: { bg: '#f3e8ff', color: '#7c3aed', label: 'Viewed' },
      partial: { bg: '#fef3c7', color: '#d97706', label: 'Partial' },
      paid: { bg: '#dcfce7', color: '#16a34a', label: 'Paid' },
    }
    return styles[status] || styles.draft
  }

  // Lookup View
  if (view === 'lookup') {
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
          maxWidth: '450px',
          width: '100%',
          border: '1px solid #302d2a',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ color: '#F5C518', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              {config.businessName}
            </h1>
            <p style={{ color: '#9C9690' }}>Customer Portal</p>
          </div>

          <form onSubmit={handleLookup}>
            <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>
              Enter your phone number to access your account
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(618) 555-1234"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#302d2a',
                border: '1px solid #3A3733',
                borderRadius: '8px',
                color: '#FAF8F5',
                fontSize: '18px',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />

            {error && (
              <p style={{
                color: '#ef4444',
                fontSize: '14px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#ef444420',
                borderRadius: '8px',
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#166534' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Looking up...' : 'Access My Account'}
            </button>
          </form>

          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #302d2a',
            textAlign: 'center',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '16px' }}>
              New customer?
            </p>
            <Link
              href="/quote"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#F5C518',
                color: '#1a1714',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard View
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      {/* Header */}
      <nav style={{
        backgroundColor: '#252220',
        borderBottom: '1px solid #302d2a',
        padding: '16px',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ color: '#F5C518', fontSize: '18px', fontWeight: 'bold' }}>
              {config.businessName}
            </h1>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>Customer Portal</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'white' }}>Welcome, {customer?.name}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#9C9690',
                border: '1px solid #302d2a',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Account Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Jobs</p>
            <p style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
              {jobs.length}
            </p>
          </div>
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Spent</p>
            <p style={{ color: '#16a34a', fontSize: '28px', fontWeight: 'bold' }}>
              {formatCurrency(customer?.total_spent_cents || 0)}
            </p>
          </div>
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: customer?.outstanding_balance_cents ? '2px solid #F5C518' : '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>Outstanding Balance</p>
            <p style={{
              color: customer?.outstanding_balance_cents ? '#F5C518' : 'white',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              {formatCurrency(customer?.outstanding_balance_cents || 0)}
            </p>
          </div>
        </div>

        {/* Unpaid Invoices Alert */}
        {invoices.filter(i => ['sent', 'viewed', 'partial'].includes(i.status)).length > 0 && (
          <div style={{
            backgroundColor: '#F5C51820',
            border: '1px solid #F5C518',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
          }}>
            <h3 style={{ color: '#F5C518', fontWeight: '600', marginBottom: '12px' }}>
              You have unpaid invoices
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoices.filter(i => ['sent', 'viewed', 'partial'].includes(i.status)).map(invoice => (
                <div
                  key={invoice.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#252220',
                    padding: '12px 16px',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <span style={{ color: 'white' }}>Invoice #{invoice.invoice_number || invoice.id}</span>
                    <span style={{ color: '#9C9690', marginLeft: '8px', fontSize: '14px' }}>
                      Due {formatDate(invoice.due_date)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#F5C518', fontWeight: 'bold' }}>
                      {formatCurrency(invoice.total_cents - (invoice.amount_paid_cents || 0))}
                    </span>
                    <Link
                      href={`/pay/${invoice.id}`}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                    >
                      Pay Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          marginBottom: '32px',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #302d2a' }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>My Jobs</h2>
          </div>
          {jobs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9C9690' }}>
              No jobs yet
            </div>
          ) : (
            jobs.map((job, i) => {
              const status = getStatusStyle(job.status)
              return (
                <div
                  key={job.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < jobs.length - 1 ? '1px solid #302d2a' : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'white', fontWeight: '500' }}>
                          {getServiceName(job.job_type)}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: status.color,
                          color: status.textColor,
                        }}>
                          {config.jobStatuses.find(s => s.id === job.status)?.label || job.status}
                        </span>
                      </div>
                      <p style={{ color: '#9C9690', fontSize: '14px' }}>{job.service_address}</p>
                      {job.scheduled_date && (
                        <p style={{ color: '#9C9690', fontSize: '13px', marginTop: '4px' }}>
                          Scheduled: {formatDate(job.scheduled_date)}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '18px' }}>
                        {formatCurrency(job.quote_cents)}
                      </p>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>
                        {job.square_feet?.toLocaleString()} sq ft
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Invoices */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          marginBottom: '32px',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #302d2a' }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Invoices</h2>
          </div>
          {invoices.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9C9690' }}>
              No invoices yet
            </div>
          ) : (
            invoices.map((invoice, i) => {
              const status = getInvoiceStatus(invoice.status)
              const amountDue = invoice.total_cents - (invoice.amount_paid_cents || 0)
              return (
                <div
                  key={invoice.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < invoices.length - 1 ? '1px solid #302d2a' : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'white', fontWeight: '500' }}>
                          Invoice #{invoice.invoice_number || invoice.id}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: status.bg,
                          color: status.color,
                        }}>
                          {status.label}
                        </span>
                      </div>
                      <p style={{ color: '#9C9690', fontSize: '13px' }}>
                        {formatDate(invoice.created_at)}
                        {invoice.due_date && ` - Due ${formatDate(invoice.due_date)}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'white', fontWeight: 'bold' }}>
                          {formatCurrency(invoice.total_cents)}
                        </p>
                        {amountDue > 0 && amountDue < invoice.total_cents && (
                          <p style={{ color: '#F5C518', fontSize: '12px' }}>
                            Due: {formatCurrency(amountDue)}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/pay/${invoice.id}`}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: invoice.status === 'paid' ? '#302d2a' : '#16a34a',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontWeight: '500',
                          fontSize: '14px',
                        }}
                      >
                        {invoice.status === 'paid' ? 'View' : 'Pay'}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Request New Quote */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/quote"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#F5C518',
              color: '#1a1714',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Request New Quote
          </Link>
        </div>

        {/* Contact */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
        }}>
          <p>Need help? Contact us:</p>
          <p style={{ marginTop: '8px' }}>
            <a href={`tel:${config.phoneRaw}`} style={{ color: '#F5C518' }}>{config.phone}</a>
            {' | '}
            <a href={`mailto:${config.email}`} style={{ color: '#F5C518' }}>{config.email}</a>
          </p>
        </div>
      </div>
    </div>
  )
}
