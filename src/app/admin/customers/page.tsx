'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
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
  billing_address: string
  billing_city: string
  billing_state: string
  billing_zip: string
  notes: string
  total_jobs: number
  total_spent_cents: number
  outstanding_balance_cents: number
  is_vip: boolean
}

// Capitalize names properly
const capitalizeName = (name: string): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const fetchCustomers = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const deleteCustomer = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer? This cannot be undone.')) return
    try {
      await fetch(
        `${config.supabase.url}/rest/v1/customers?id=eq.${customerId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
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
      c.email?.toLowerCase().includes(search) ||
      c.company_name?.toLowerCase().includes(search)
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
                onClick={() => setSelectedCustomer(customer)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: i < filteredCustomers.length - 1 ? '1px solid #302d2a' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#302d2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                    <span style={{ fontWeight: '600', color: 'white' }}>{capitalizeName(customer.name)}</span>
                    {customer.is_vip && <span>⭐</span>}
                    {customer.company_name && <span style={{ color: '#9C9690', fontSize: '14px' }}>• {customer.company_name}</span>}
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
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
          onClick={() => setSelectedCustomer(null)}
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
                  {capitalizeName(selectedCustomer.name)}
                </h2>
                {selectedCustomer.company_name && (
                  <p style={{ color: '#F5C518', fontSize: '14px', margin: '4px 0 0 0' }}>
                    🏢 {selectedCustomer.company_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
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
              {/* Contact Info */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  CONTACT
                </h3>
                {selectedCustomer.phone && (
                  <p style={{ color: '#16a34a', marginBottom: '8px' }}>
                    📞 <a href={`tel:${selectedCustomer.phone}`} style={{ color: '#16a34a' }}>{selectedCustomer.phone}</a>
                  </p>
                )}
                {selectedCustomer.email && (
                  <p style={{ color: '#9C9690', marginBottom: '8px' }}>
                    ✉️ <a href={`mailto:${selectedCustomer.email}`} style={{ color: '#9C9690' }}>{selectedCustomer.email}</a>
                  </p>
                )}
              </div>

              {/* Billing Address */}
              {(selectedCustomer.billing_address || selectedCustomer.billing_city) && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    BILLING ADDRESS
                  </h3>
                  <p style={{ color: 'white' }}>
                    {selectedCustomer.billing_address && <span>{selectedCustomer.billing_address}<br /></span>}
                    {selectedCustomer.billing_city && `${selectedCustomer.billing_city}, `}
                    {selectedCustomer.billing_state} {selectedCustomer.billing_zip}
                  </p>
                </div>
              )}

              {/* Physical Address */}
              {(selectedCustomer.address || selectedCustomer.city) && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    PHYSICAL ADDRESS
                  </h3>
                  <p style={{ color: 'white' }}>
                    {selectedCustomer.address && <span>{selectedCustomer.address}<br /></span>}
                    {selectedCustomer.city && `${selectedCustomer.city}, `}
                    {selectedCustomer.state} {selectedCustomer.zip}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  STATS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>Total Jobs</p>
                    <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{selectedCustomer.total_jobs || 0}</p>
                  </div>
                  <div>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>Total Spent</p>
                    <p style={{ color: '#16a34a', fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(selectedCustomer.total_spent_cents)}</p>
                  </div>
                  <div>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>Outstanding</p>
                    <p style={{ color: selectedCustomer.outstanding_balance_cents > 0 ? '#dc2626' : 'white', fontSize: '24px', fontWeight: 'bold' }}>
                      {formatCurrency(selectedCustomer.outstanding_balance_cents)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    NOTES
                  </h3>
                  <p style={{ color: 'white' }}>{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
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
                  onClick={() => deleteCustomer(selectedCustomer.id)}
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

// Add Customer Modal with separate first/last name and billing address
function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    company_name: '',
    billing_address: '',
    billing_city: '',
    billing_state: 'IL',
    billing_zip: '',
    address: '',
    city: '',
    state: 'IL',
    zip: '',
    notes: '',
  })

  const copyBillingToPhysical = () => {
    setForm({
      ...form,
      address: form.billing_address,
      city: form.billing_city,
      state: form.billing_state,
      zip: form.billing_zip,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const fullName = `${form.first_name} ${form.last_name}`.trim()
    const is_business = !!form.company_name

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
          body: JSON.stringify({
            name: fullName,
            phone: form.phone,
            email: form.email,
            company_name: form.company_name,
            is_business,
            billing_address: form.billing_address,
            billing_city: form.billing_city,
            billing_state: form.billing_state,
            billing_zip: form.billing_zip,
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
            notes: form.notes,
          }),
        }
      )

      if (response.ok) {
        onSuccess()
      } else {
        alert('Failed to create customer')
      }
    } catch {
      alert('Error creating customer')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #3A3733',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    backgroundColor: '#302d2a',
    color: 'white',
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
          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>First Name *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Last Name *</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Company Name (optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Company Name (optional)</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="Leave blank for residential"
              style={inputStyle}
            />
          </div>

          {/* Billing Address */}
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#1a1714', borderRadius: '8px' }}>
            <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>BILLING ADDRESS</h3>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={form.billing_address}
                onChange={(e) => setForm({ ...form, billing_address: e.target.value })}
                placeholder="Street address"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                value={form.billing_city}
                onChange={(e) => setForm({ ...form, billing_city: e.target.value })}
                placeholder="City"
                style={{ ...inputStyle, width: 'auto' }}
              />
              <input
                type="text"
                value={form.billing_state}
                onChange={(e) => setForm({ ...form, billing_state: e.target.value })}
                placeholder="State"
                style={{ ...inputStyle, width: 'auto' }}
              />
              <input
                type="text"
                value={form.billing_zip}
                onChange={(e) => setForm({ ...form, billing_zip: e.target.value })}
                placeholder="ZIP"
                style={{ ...inputStyle, width: 'auto' }}
              />
            </div>
          </div>

          {/* Physical/Service Address */}
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#1a1714', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', margin: 0 }}>PHYSICAL/SERVICE ADDRESS</h3>
              <button
                type="button"
                onClick={copyBillingToPhysical}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#302d2a',
                  color: '#F5C518',
                  border: '1px solid #F5C518',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Same as billing
              </button>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                style={{ ...inputStyle, width: 'auto' }}
              />
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
                style={{ ...inputStyle, width: 'auto' }}
              />
              <input
                type="text"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                placeholder="ZIP"
                style={{ ...inputStyle, width: 'auto' }}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              style={{
                ...inputStyle,
                resize: 'none',
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
