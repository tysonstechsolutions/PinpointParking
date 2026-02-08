'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Expense {
  id: number
  category: string
  vendor: string
  description: string
  amount_cents: number
  expense_date: string
  receipt_url: string
  job_id: number
  is_tax_deductible: boolean
  created_at: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/expenses?order=expense_date.desc`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setExpenses(await response.json())
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

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
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return config.expenseCategories.find(c => c.id === categoryId) || { icon: '📁', label: categoryId }
  }

  const filteredExpenses = expenses.filter(e => {
    if (categoryFilter === 'all') return true
    return e.category === categoryFilter
  })

  // Calculate totals by category
  const categoryTotals = config.expenseCategories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + (e.amount_cents || 0), 0),
  }))

  const grandTotal = expenses.reduce((sum, e) => sum + (e.amount_cents || 0), 0)

  const deleteExpense = async (expenseId: number) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return
    try {
      await fetch(
        `${config.supabase.url}/rest/v1/expenses?id=eq.${expenseId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      fetchExpenses()
    } catch (err) {
      console.error('Error deleting expense:', err)
    }
  }

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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>🧾 Expenses</h1>
            <p style={{ color: '#9C9690' }}>Total: {formatCurrency(grandTotal)}</p>
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
            + Add Expense
          </button>
        </div>

        {/* Category Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {categoryTotals.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
              style={{
                backgroundColor: categoryFilter === cat.id ? '#16a34a' : '#252220',
                color: categoryFilter === cat.id ? 'white' : '#9C9690',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #302d2a',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '24px' }}>{cat.icon}</span>
              <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>{cat.label}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: categoryFilter === cat.id ? 'white' : 'white' }}>{formatCurrency(cat.total)}</p>
            </button>
          ))}
        </div>

        {/* Expenses List */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>Loading...</div>
          ) : filteredExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>No expenses found</div>
          ) : (
            filteredExpenses.map((expense, i) => {
              const cat = getCategoryInfo(expense.category)
              return (
                <div
                  key={expense.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderBottom: i < filteredExpenses.length - 1 ? '1px solid #302d2a' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingExpense(expense)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#302d2a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', color: 'white' }}>{expense.description}</p>
                    <p style={{ color: '#9C9690', fontSize: '14px' }}>
                      {expense.vendor && <span>{expense.vendor} • </span>}
                      {formatDate(expense.expense_date)}
                    </p>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>
                    -{formatCurrency(expense.amount_cents)}
                  </p>
                  <span style={{ color: '#555' }}>›</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchExpenses(); }}
        />
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <AddExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => { setEditingExpense(null); fetchExpenses(); }}
          onDelete={() => { deleteExpense(editingExpense.id); setEditingExpense(null); }}
        />
      )}
    </div>
  )
}

// Add/Edit Expense Modal
function AddExpenseModal({ expense, onClose, onSuccess, onDelete }: {
  expense?: Expense
  onClose: () => void
  onSuccess: () => void
  onDelete?: () => void
}) {
  const isEdit = !!expense
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: expense?.category || 'materials',
    vendor: expense?.vendor || '',
    description: expense?.description || '',
    amount: expense ? (expense.amount_cents / 100).toString() : '',
    expense_date: expense?.expense_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    is_tax_deductible: expense?.is_tax_deductible ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit
        ? `${config.supabase.url}/rest/v1/expenses?id=eq.${expense.id}`
        : `${config.supabase.url}/rest/v1/expenses`

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabase.anonKey,
          'Authorization': `Bearer ${config.supabase.anonKey}`,
        },
        body: JSON.stringify({
          ...form,
          amount_cents: Math.round(parseFloat(form.amount) * 100),
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert(isEdit ? 'Failed to update expense' : 'Failed to add expense')
      }
    } catch {
      alert(isEdit ? 'Error updating expense' : 'Error adding expense')
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
        maxWidth: '400px',
        width: '100%',
        border: '1px solid #302d2a',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #302d2a',
        }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9C9690' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
            >
              {config.expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Vendor</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              placeholder="Home Depot, Shell, etc."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Description *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="What was purchased?"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
            />
          </div>

          {/* Amount & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Amount *</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                placeholder="0.00"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#9C9690' }}>Date</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #3A3733', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#302d2a', color: 'white' }}
              />
            </div>
          </div>

          {/* Tax deductible */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
              <input
                type="checkbox"
                checked={form.is_tax_deductible}
                onChange={(e) => setForm({ ...form, is_tax_deductible: e.target.checked })}
              />
              <span>Tax deductible</span>
            </label>
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
            {loading ? 'Saving...' : isEdit ? 'Update Expense' : '+ Add Expense'}
          </button>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                backgroundColor: 'transparent',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Delete Expense
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
