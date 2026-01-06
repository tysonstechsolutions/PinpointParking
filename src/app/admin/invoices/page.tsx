'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const fetchInvoices = async () => {
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
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Create Invoice
          </button>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: i < filteredInvoices.length - 1 ? '1px solid #302d2a' : 'none',
                }}
              >
                {/* Invoice Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#16a34a' }}>
                      {invoice.invoice_number}
                    </span>
                    {getStatusBadge(invoice.status, invoice.due_date)}
                  </div>
                  <p style={{ fontWeight: '500', color: 'white' }}>{invoice.customer_name}</p>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
