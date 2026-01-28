'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Invoice {
  id: number
  invoice_number: string
  customer_id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  job_id: number
  service_address: string
  subtotal_cents: number
  tax_cents: number
  discount_cents: number
  total_cents: number
  amount_paid_cents: number
  balance_due_cents: number
  issue_date: string
  due_date: string
  status: string
  notes: string
  created_at: string
}

// Capitalize names properly
const capitalizeName = (name: string): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      let query = 'order=created_at.desc'
      if (statusFilter !== 'all') {
        query += `&status=eq.${statusFilter}`
      }

      const response = await fetch(
        `${config.supabase.url}/rest/v1/invoices?${query}`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setInvoices(await response.json())
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const deleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice? This cannot be undone.')) return
    try {
      await fetch(
        `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      setSelectedInvoice(null)
      fetchInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const updateInvoiceStatus = async (invoiceId: number, newStatus: string) => {
    try {
      await fetch(
        `${config.supabase.url}/rest/v1/invoices?id=eq.${invoiceId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )
      fetchInvoices()
      if (selectedInvoice) {
        setSelectedInvoice({ ...selectedInvoice, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
    }
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'paid'

    const styles: Record<string, { bg: string; color: string }> = {
      draft: { bg: '#f3f4f6', color: '#374151' },
      sent: { bg: '#dbeafe', color: '#1d4ed8' },
      viewed: { bg: '#f3e8ff', color: '#7c3aed' },
      partial: { bg: '#fef3c7', color: '#d97706' },
      paid: { bg: '#dcfce7', color: '#16a34a' },
      overdue: { bg: '#fee2e2', color: '#dc2626' },
    }

    const statusToUse = isOverdue ? 'overdue' : status
    const style = styles[statusToUse] || styles.draft

    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: style.bg,
        color: style.color,
      }}>
        {statusToUse.charAt(0).toUpperCase() + statusToUse.slice(1)}
      </span>
    )
  }

  const stats = {
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => ['sent', 'viewed'].includes(i.status)).length,
    overdue: invoices.filter(i => i.status === 'overdue' || (i.due_date && new Date(i.due_date) < new Date() && i.status !== 'paid')).length,
    outstanding: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.balance_due_cents || 0), 0),
  }

  const filteredInvoices = invoices.filter(i => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      i.invoice_number?.toLowerCase().includes(search) ||
      i.customer_name?.toLowerCase().includes(search)
    )
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      <AdminNav />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>📄 Invoices</h1>
            <p style={{ color: '#9C9690' }}>{invoices.length} total</p>
          </div>
          <a
            href="/admin/invoices/create"
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            + Create Invoice
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>📝 Drafts</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{stats.draft}</p>
          </div>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>📤 Sent/Pending</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>{stats.sent}</p>
          </div>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>⚠️ Overdue</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{stats.overdue}</p>
          </div>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>💰 Outstanding</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{formatCurrency(stats.outstanding)}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search invoices..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 16px',
              border: '1px solid #3A3733',
              borderRadius: '8px',
              backgroundColor: '#302d2a',
              color: 'white',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #3A3733',
              borderRadius: '8px',
              backgroundColor: '#302d2a',
              color: 'white',
            }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Invoice List */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>Loading...</div>
          ) : filteredInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>No invoices found</div>
          ) : (
            filteredInvoices.map((invoice, i) => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: i < filteredInvoices.length - 1 ? '1px solid #302d2a' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#302d2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Invoice Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#16a34a' }}>
                      {invoice.invoice_number}
                    </span>
                    {getStatusBadge(invoice.status, invoice.due_date)}
                  </div>
                  <p style={{ fontWeight: '500', color: 'white' }}>{capitalizeName(invoice.customer_name)}</p>
                  <div style={{ color: '#9C9690', fontSize: '14px' }}>
                    {invoice.due_date && <span>Due {formatDate(invoice.due_date)}</span>}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    {formatCurrency(invoice.total_cents)}
                  </p>
                  {invoice.balance_due_cents > 0 && invoice.balance_due_cents !== invoice.total_cents && (
                    <p style={{ color: '#d97706', fontSize: '14px' }}>
                      {formatCurrency(invoice.balance_due_cents)} due
                    </p>
                  )}
                </div>

                <span style={{ color: '#555' }}>›</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
          }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={{
              backgroundColor: '#252220',
              borderRadius: '16px',
              border: '2px solid #F5C518',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #302d2a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  Invoice {selectedInvoice.invoice_number}
                </h2>
                <p style={{ color: '#9C9690', fontSize: '14px', margin: '4px 0 0 0' }}>
                  Created {formatDate(selectedInvoice.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9C9690',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px' }}>
              {/* Status Badge */}
              <div style={{ marginBottom: '20px' }}>
                {getStatusBadge(selectedInvoice.status, selectedInvoice.due_date)}
              </div>

              {/* Customer Info */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  CUSTOMER
                </h3>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {capitalizeName(selectedInvoice.customer_name)}
                </p>
                {selectedInvoice.customer_phone && (
                  <p style={{ color: '#16a34a', marginBottom: '4px' }}>
                    📞 <a href={`tel:${selectedInvoice.customer_phone}`} style={{ color: '#16a34a' }}>{selectedInvoice.customer_phone}</a>
                  </p>
                )}
                {selectedInvoice.customer_email && (
                  <p style={{ color: '#9C9690', marginBottom: '4px' }}>
                    ✉️ {selectedInvoice.customer_email}
                  </p>
                )}
                {selectedInvoice.service_address && (
                  <p style={{ color: '#9C9690' }}>
                    📍 {selectedInvoice.service_address}
                  </p>
                )}
              </div>

              {/* Amounts */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  AMOUNTS
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9C9690' }}>Subtotal</span>
                  <span style={{ color: 'white' }}>{formatCurrency(selectedInvoice.subtotal_cents)}</span>
                </div>
                {selectedInvoice.tax_cents > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#9C9690' }}>Tax</span>
                    <span style={{ color: 'white' }}>{formatCurrency(selectedInvoice.tax_cents)}</span>
                  </div>
                )}
                {selectedInvoice.discount_cents > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#9C9690' }}>Discount</span>
                    <span style={{ color: '#16a34a' }}>-{formatCurrency(selectedInvoice.discount_cents)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #302d2a', paddingTop: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'white', fontWeight: '600' }}>Total</span>
                    <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>{formatCurrency(selectedInvoice.total_cents)}</span>
                  </div>
                  {selectedInvoice.amount_paid_cents > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#9C9690' }}>Amount Paid</span>
                      <span style={{ color: '#16a34a' }}>{formatCurrency(selectedInvoice.amount_paid_cents)}</span>
                    </div>
                  )}
                  {selectedInvoice.balance_due_cents > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#d97706', fontWeight: '600' }}>Balance Due</span>
                      <span style={{ color: '#d97706', fontWeight: '600', fontSize: '18px' }}>{formatCurrency(selectedInvoice.balance_due_cents)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  DATES
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {selectedInvoice.issue_date && (
                    <div>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Issue Date</p>
                      <p style={{ color: 'white', fontWeight: '500' }}>{formatDate(selectedInvoice.issue_date)}</p>
                    </div>
                  )}
                  {selectedInvoice.due_date && (
                    <div>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Due Date</p>
                      <p style={{ color: 'white', fontWeight: '500' }}>{formatDate(selectedInvoice.due_date)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    NOTES
                  </h3>
                  <p style={{ color: 'white' }}>{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedInvoice.status === 'draft' && (
                  <button
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, 'sent')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#1d4ed8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    📤 Mark as Sent
                  </button>
                )}
                {['sent', 'viewed'].includes(selectedInvoice.status) && (
                  <button
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#302d2a',
                    color: 'white',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => deleteInvoice(selectedInvoice.id)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
