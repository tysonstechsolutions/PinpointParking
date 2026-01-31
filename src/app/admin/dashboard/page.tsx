'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Job {
  id: number
  customer_name: string
  job_type: string
  quote_cents: number
  final_price_cents: number
  status: string
  scheduled_date: string
  created_at: string
}

interface Invoice {
  id: number
  total_cents: number
  amount_paid_cents: number
  status: string
  created_at: string
}

interface Expense {
  id: number
  category: string
  amount_cents: number
  expense_date: string
}

interface Customer {
  id: number
  name: string
  total_spent_cents: number
  total_jobs: number
  created_at: string
}

// Format helpers - moved outside component
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

// Simple bar chart component - memoized to prevent unnecessary re-renders
const BarChart = memo(function BarChart({ data, maxValue }: { data: Array<{ label: string; value: number; color?: string }>; maxValue: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#9C9690', fontSize: '13px' }}>{item.label}</span>
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
              {formatCurrency(item.value)}
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#302d2a', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                backgroundColor: item.color || '#16a34a',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
})

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d')

  const fetchData = useCallback(async () => {
    try {
      const headers = {
        'apikey': config.supabase.anonKey,
        'Authorization': `Bearer ${config.supabase.anonKey}`,
      }

      const [jobsRes, invoicesRes, expensesRes, customersRes] = await Promise.all([
        fetch(`${config.supabase.url}/rest/v1/jobs?order=created_at.desc`, { headers }),
        fetch(`${config.supabase.url}/rest/v1/invoices?order=created_at.desc`, { headers }),
        fetch(`${config.supabase.url}/rest/v1/expenses?order=expense_date.desc`, { headers }),
        fetch(`${config.supabase.url}/rest/v1/customers?order=total_spent_cents.desc`, { headers }),
      ])

      if (jobsRes.ok) setJobs(await jobsRes.json())
      if (invoicesRes.ok) setInvoices(await invoicesRes.json())
      if (expensesRes.ok) setExpenses(await expensesRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoize date range calculation
  const startDate = useMemo(() => {
    const now = new Date()
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'year': 365,
    }
    const daysAgo = new Date(now)
    daysAgo.setDate(daysAgo.getDate() - ranges[timeRange])
    return daysAgo
  }, [timeRange])

  // Memoize filtered data to avoid recalculating on every render
  const filteredJobs = useMemo(() =>
    jobs.filter(item => new Date(item.created_at) >= startDate),
    [jobs, startDate]
  )

  const filteredInvoices = useMemo(() =>
    invoices.filter(item => new Date(item.created_at) >= startDate),
    [invoices, startDate]
  )

  const filteredExpenses = useMemo(() =>
    expenses.filter(item => new Date(item.expense_date) >= startDate),
    [expenses, startDate]
  )

  const filteredCustomers = useMemo(() =>
    customers.filter(item => new Date(item.created_at) >= startDate),
    [customers, startDate]
  )

  // Memoize expensive metrics calculations
  const metrics = useMemo(() => {
    const totalRevenue = filteredInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount_paid_cents || 0), 0)

    const outstandingBalance = filteredInvoices
      .filter(i => ['sent', 'viewed', 'partial'].includes(i.status))
      .reduce((sum, i) => sum + (i.total_cents - (i.amount_paid_cents || 0)), 0)

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount_cents, 0)

    const completedJobs = filteredJobs.filter(j => j.status === 'completed').length
    const totalJobs = filteredJobs.length
    const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0

    const avgJobValue = filteredJobs.length > 0
      ? filteredJobs.reduce((sum, j) => sum + (j.quote_cents || 0), 0) / filteredJobs.length
      : 0

    const paidInvoicesCount = filteredInvoices.filter(i => i.status === 'paid').length
    const pendingInvoicesCount = filteredInvoices.filter(i => ['sent', 'viewed', 'partial'].includes(i.status)).length

    return {
      totalRevenue,
      outstandingBalance,
      totalExpenses,
      completedJobs,
      totalJobs,
      completionRate,
      avgJobValue,
      paidInvoicesCount,
      pendingInvoicesCount,
      netProfit: totalRevenue - totalExpenses,
      profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0,
    }
  }, [filteredJobs, filteredInvoices, filteredExpenses])

  // Memoize expense breakdown by category
  const expensesByCategory = useMemo(() =>
    config.expenseCategories.map(cat => ({
      ...cat,
      amount: filteredExpenses
        .filter(e => e.category === cat.id)
        .reduce((sum, e) => sum + e.amount_cents, 0)
    })).sort((a, b) => b.amount - a.amount),
    [filteredExpenses]
  )

  // Memoize jobs by service type
  const jobsByService = useMemo(() =>
    config.services.map(service => ({
      ...service,
      count: filteredJobs.filter(j => j.job_type === service.id).length,
      revenue: filteredJobs
        .filter(j => j.job_type === service.id)
        .reduce((sum, j) => sum + (j.quote_cents || 0), 0)
    })),
    [filteredJobs]
  )

  // Memoize top customers
  const topCustomers = useMemo(() =>
    customers
      .filter(c => c.total_spent_cents > 0)
      .slice(0, 5),
    [customers]
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
        <AdminNav />
        <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      <AdminNav />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Dashboard</h1>
            <p style={{ color: '#9C9690' }}>Business analytics and insights</p>
          </div>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['7d', '30d', '90d', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: timeRange === range ? '#16a34a' : '#252220',
                  color: timeRange === range ? 'white' : '#9C9690',
                }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {/* Revenue */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px' }}>
              {metrics.paidInvoicesCount} paid invoices
            </p>
          </div>

          {/* Outstanding */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Outstanding</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#F5C518' }}>
              {formatCurrency(metrics.outstandingBalance)}
            </p>
            <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px' }}>
              {metrics.pendingInvoicesCount} pending invoices
            </p>
          </div>

          {/* Expenses */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Expenses</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
              {formatCurrency(metrics.totalExpenses)}
            </p>
            <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px' }}>
              {filteredExpenses.length} transactions
            </p>
          </div>

          {/* Net Profit */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Net Profit</p>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: metrics.netProfit >= 0 ? '#16a34a' : '#dc2626'
            }}>
              {formatCurrency(metrics.netProfit)}
            </p>
            <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px' }}>
              {metrics.profitMargin}% margin
            </p>
          </div>

          {/* Jobs Completed */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Jobs Completed</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
              {metrics.completedJobs}/{metrics.totalJobs}
            </p>
            <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px' }}>
              {metrics.completionRate}% completion rate
            </p>
          </div>

          {/* Average Job Value */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #302d2a',
          }}>
            <p style={{ color: '#9C9690', fontSize: '14px', marginBottom: '8px' }}>Avg Job Value</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
              {formatCurrency(metrics.avgJobValue)}
            </p>
            <p style={{ color: '#9C9690', fontSize: '12px', marginTop: '8px' }}>
              {filteredCustomers.length} new customers
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Revenue by Service */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #302d2a',
          }}>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Revenue by Service
            </h3>
            <BarChart
              data={jobsByService.map(s => ({
                label: `${s.emoji} ${s.name}`,
                value: s.revenue,
                color: s.id === 'paving' ? '#16a34a' : s.id === 'sealcoating' ? '#3b82f6' : '#F5C518'
              }))}
              maxValue={Math.max(...jobsByService.map(s => s.revenue))}
            />
          </div>

          {/* Expenses by Category */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #302d2a',
          }}>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Expenses by Category
            </h3>
            <BarChart
              data={expensesByCategory.filter(c => c.amount > 0).map(c => ({
                label: `${c.icon} ${c.label}`,
                value: c.amount,
                color: '#dc2626'
              }))}
              maxValue={Math.max(...expensesByCategory.map(c => c.amount))}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
        }}>
          {/* Jobs by Status */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #302d2a',
          }}>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Jobs by Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {config.jobStatuses.map(status => {
                const count = filteredJobs.filter(j => j.status === status.id).length
                return (
                  <div
                    key={status.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: status.color + '20',
                      border: `1px solid ${status.color}40`,
                    }}
                  >
                    <p style={{ color: status.textColor, fontSize: '24px', fontWeight: 'bold' }}>{count}</p>
                    <p style={{ color: status.textColor, fontSize: '12px' }}>{status.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Customers */}
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #302d2a',
          }}>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Top Customers
            </h3>
            {topCustomers.length === 0 ? (
              <p style={{ color: '#9C9690', textAlign: 'center', padding: '24px' }}>No customer data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topCustomers.map((customer, i) => (
                  <div
                    key={customer.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#302d2a',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: i === 0 ? '#F5C518' : i === 1 ? '#9CA3AF' : i === 2 ? '#B45309' : '#4B5563',
                        color: i < 3 ? '#1a1714' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <p style={{ color: 'white', fontWeight: '500' }}>{customer.name}</p>
                        <p style={{ color: '#9C9690', fontSize: '12px' }}>{customer.total_jobs} jobs</p>
                      </div>
                    </div>
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      {formatCurrency(customer.total_spent_cents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
