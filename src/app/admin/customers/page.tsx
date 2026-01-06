'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  company_name: string
  is_business: boolean
  address: string
  city: string
  state: string
  zip: string
  notes: string
  total_jobs: number
  total_spent_cents: number
  outstanding_balance_cents: number
  is_vip: boolean
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/customers?order=name.asc`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setCustomers(await response.json())
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
      minimumFractionDigits: 0,
    }).format((cents || 0) / 100)
  }

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(search) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search)
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>👥 Customers</h1>
            <p style={{ color: '#9C9690' }}>{customers.length} total</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Add Customer
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Customers</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{customers.length}</p>
          </div>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>With Balance Due</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {customers.filter(c => c.outstanding_balance_cents > 0).length}
            </p>
          </div>
          <div style={{ backgroundColor: '#252220', borderRadius: '12px', padding: '16px', border: '1px solid #302d2a' }}>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Outstanding</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
              {formatCurrency(customers.reduce((sum, c) => sum + (c.outstanding_balance_cents || 0), 0))}
            </p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search customers..."
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#302d2a',
            border: '1px solid #3A3733',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            boxSizing: 'border-box',
            color: 'white',
          }}
        />

        {/* Customer List */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>Loading...</div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>No customers found</div>
          ) : (
            filteredCustomers.map((customer, i) => (
              <div
                key={customer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: i < filteredCustomers.length - 1 ? '1px solid #302d2a' : 'none',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: customer.is_vip ? '#fef3c7' : '#dcfce7',
                  color: customer.is_vip ? '#d97706' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {customer.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'white' }}>{customer.name}</span>
                    {customer.is_vip && <span>⭐</span>}
                    {customer.is_business && <span>🏢</span>}
                  </div>
                  <div style={{ color: '#9C9690', fontSize: '14px' }}>
                    {customer.phone && <span>📞 {customer.phone}</span>}
                    {customer.email && <span style={{ marginLeft: '16px' }}>✉️ {customer.email}</span>}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#9C9690', fontSize: '14px' }}>{customer.total_jobs || 0} jobs</p>
                  <p style={{ fontWeight: '600', color: 'white' }}>{formatCurrency(customer.total_spent_cents)}</p>
                  {customer.outstanding_balance_cents > 0 && (
                    <p style={{ color: '#dc2626', fontSize: '14px' }}>
                      {formatCurrency(customer.outstanding_balance_cents)} due
                    </p>
                  )}
                </div>

                <span style={{ color: '#555' }}>›</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchCustomers(); }}
        />
      )}
    </div>
  )
}

// Add Customer Modal
function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company_name: '',
    is_business: false,
    address: '',
    city: '',
    state: 'IL',
    zip: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
          body: JSON.stringify(form),
        }
      )

      if (response.ok) {
        onSuccess()
      } else {
        alert('Failed to create customer')
      }
    } catch (err) {
      alert('Error creating customer')
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#252220',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #302d2a',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #302d2a',
        }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>Add Customer</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9C9690' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #3A3733',
                borderRadius: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#302d2a',
                color: 'white',
              }}
            />
          </div>

          {/* Phone & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
              />
            </div>
          </div>

          {/* Business checkbox */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
              <input
                type="checkbox"
                checked={form.is_business}
                onChange={(e) => setForm({ ...form, is_business: e.target.checked })}
              />
              <span>This is a business/contractor</span>
            </label>
          </div>

          {form.is_business && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Company Name</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
              />
            </div>
          )}

          {/* Address */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
              style={{ padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', backgroundColor: '#302d2a', color: 'white' }}
            />
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="State"
              style={{ padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', backgroundColor: '#302d2a', color: 'white' }}
            />
            <input
              type="text"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              placeholder="ZIP"
              style={{ padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', backgroundColor: '#302d2a', color: 'white' }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #3A3733',
                borderRadius: '8px',
                resize: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#302d2a',
                color: 'white',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Adding...' : '+ Add Customer'}
          </button>
        </form>
      </div>
    </div>
  )
}
