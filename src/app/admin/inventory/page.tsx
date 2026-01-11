'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  cost_per_unit_cents: number
  reorder_level: number
  vendor: string
  notes: string
  created_at: string
  updated_at: string
}

const categories = [
  { id: 'asphalt', label: 'Asphalt Materials', icon: '🛤️' },
  { id: 'sealant', label: 'Sealant & Coatings', icon: '🛢️' },
  { id: 'paint', label: 'Paint & Striping', icon: '🎨' },
  { id: 'equipment', label: 'Equipment', icon: '🔧' },
  { id: 'safety', label: 'Safety Gear', icon: '🦺' },
  { id: 'other', label: 'Other', icon: '📦' },
]

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'asphalt',
    quantity: 0,
    unit: 'gallons',
    cost_per_unit_cents: 0,
    reorder_level: 0,
    vendor: '',
    notes: '',
  })

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/inventory?order=name.asc`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setItems(await response.json())
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingItem
      ? `${config.supabase.url}/rest/v1/inventory?id=eq.${editingItem.id}`
      : `${config.supabase.url}/rest/v1/inventory`

    try {
      const response = await fetch(url, {
        method: editingItem ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabase.anonKey,
          'Authorization': `Bearer ${config.supabase.anonKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setShowAddModal(false)
        setEditingItem(null)
        resetForm()
        fetchItems()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await fetch(
        `${config.supabase.url}/rest/v1/inventory?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      fetchItems()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      cost_per_unit_cents: item.cost_per_unit_cents,
      reorder_level: item.reorder_level,
      vendor: item.vendor || '',
      notes: item.notes || '',
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'asphalt',
      quantity: 0,
      unit: 'gallons',
      cost_per_unit_cents: 0,
      reorder_level: 0,
      vendor: '',
      notes: '',
    })
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((cents || 0) / 100)
  }

  const getCategoryInfo = (catId: string) => {
    return categories.find(c => c.id === catId) || { icon: '📦', label: catId }
  }

  // Filter items
  const filteredItems = items.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(query) ||
        item.vendor?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Calculate totals
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit_cents), 0)
  const lowStockItems = items.filter(item => item.quantity <= item.reorder_level && item.reorder_level > 0)

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
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Inventory</h1>
            <p style={{ color: '#9C9690' }}>{items.length} items - Total value: {formatCurrency(totalValue)}</p>
          </div>
          <button
            onClick={() => { resetForm(); setEditingItem(null); setShowAddModal(true); }}
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
            + Add Item
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div style={{
            backgroundColor: '#F5C51820',
            border: '1px solid #F5C518',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <h3 style={{ color: '#F5C518', fontWeight: '600', marginBottom: '8px' }}>
              Low Stock Alert
            </h3>
            <p style={{ color: '#9C9690', fontSize: '14px' }}>
              {lowStockItems.map(item => item.name).join(', ')} - needs reordering
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat.id)
            const catValue = catItems.reduce((sum, i) => sum + (i.quantity * i.cost_per_unit_cents), 0)
            return (
              <div
                key={cat.id}
                onClick={() => setFilterCategory(filterCategory === cat.id ? 'all' : cat.id)}
                style={{
                  backgroundColor: filterCategory === cat.id ? '#16a34a20' : '#252220',
                  borderRadius: '12px',
                  padding: '16px',
                  border: filterCategory === cat.id ? '2px solid #16a34a' : '1px solid #302d2a',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{cat.icon}</div>
                <p style={{ color: '#9C9690', fontSize: '12px' }}>{cat.label}</p>
                <p style={{ color: 'white', fontWeight: 'bold' }}>{catItems.length} items</p>
                <p style={{ color: '#16a34a', fontSize: '14px' }}>{formatCurrency(catValue)}</p>
              </div>
            )
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#302d2a',
            border: '1px solid #3A3733',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'white',
            marginBottom: '24px',
            boxSizing: 'border-box',
          }}
        />

        {/* Items List */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9C9690' }}>Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9C9690' }}>
              No items found. Add your first inventory item!
            </div>
          ) : (
            filteredItems.map((item, i) => {
              const cat = getCategoryInfo(item.category)
              const isLowStock = item.quantity <= item.reorder_level && item.reorder_level > 0
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderBottom: i < filteredItems.length - 1 ? '1px solid #302d2a' : 'none',
                    gap: '16px',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: 'white' }}>{item.name}</span>
                      {isLowStock && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#F5C51820',
                          color: '#F5C518',
                          borderRadius: '9999px',
                          fontSize: '11px',
                        }}>
                          Low Stock
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#9C9690', fontSize: '14px' }}>
                      {item.vendor && `${item.vendor} - `}{cat.label}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '100px' }}>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: isLowStock ? '#F5C518' : 'white',
                    }}>
                      {item.quantity}
                    </p>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>{item.unit}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <p style={{ color: '#16a34a', fontWeight: '600' }}>
                      {formatCurrency(item.cost_per_unit_cents)}/{item.unit?.slice(0, 3)}
                    </p>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>
                      Total: {formatCurrency(item.quantity * item.cost_per_unit_cents)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#302d2a',
                        color: 'white',
                        border: '1px solid #3A3733',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc262620',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: '#252220',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid #302d2a',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #302d2a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: 'white', fontWeight: 'bold' }}>
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#9C9690', fontSize: '20px', cursor: 'pointer' }}
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#302d2a',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    color: 'white',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#302d2a',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#302d2a',
                      border: '1px solid #3A3733',
                      borderRadius: '8px',
                      color: 'white',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#302d2a',
                      border: '1px solid #3A3733',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  >
                    <option value="gallons">Gallons</option>
                    <option value="tons">Tons</option>
                    <option value="bags">Bags</option>
                    <option value="buckets">Buckets</option>
                    <option value="drums">Drums</option>
                    <option value="units">Units</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                    Cost per Unit ($)
                  </label>
                  <input
                    type="number"
                    value={(formData.cost_per_unit_cents / 100).toFixed(2)}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#302d2a',
                      border: '1px solid #3A3733',
                      borderRadius: '8px',
                      color: 'white',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#302d2a',
                      border: '1px solid #3A3733',
                      borderRadius: '8px',
                      color: 'white',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                  Vendor
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#302d2a',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    color: 'white',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#9C9690', fontSize: '14px', marginBottom: '6px' }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#302d2a',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    color: 'white',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#302d2a',
                    color: 'white',
                    border: '1px solid #3A3733',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
