'use client'

import { useState, useEffect } from 'react'
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
  invoice_number: string
  customer_name: string
  total_cents: number
  amount_paid_cents: number
  status: string
  created_at: string
}

interface Expense {
  id: number
  category: string
  vendor: string
  description: string
  amount_cents: number
  expense_date: string
  is_tax_deductible: boolean
}

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  total_jobs: number
  total_spent_cents: number
  created_at: string
}

type ReportType = 'revenue' | 'jobs' | 'expenses' | 'customers' | 'tax'

export default function ReportsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<ReportType>('revenue')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const fetchData = async () => {
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
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter by date range
  const filterByDate = <T extends { created_at?: string; expense_date?: string; scheduled_date?: string }>(
    items: T[]
  ): T[] => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return items.filter(item => {
      const dateStr = item.created_at || item.expense_date || item.scheduled_date
      if (!dateStr) return false
      const date = new Date(dateStr)
      return date >= start && date <= end
    })
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

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = ''
    let filename = ''

    const filteredJobs = filterByDate(jobs)
    const filteredInvoices = filterByDate(invoices)
    const filteredExpenses = filterByDate(expenses)
    const filteredCustomers = filterByDate(customers)

    switch (reportType) {
      case 'revenue':
        csvContent = 'Invoice #,Customer,Date,Total,Paid,Status\n'
        csvContent += filteredInvoices.map(inv =>
          `"${inv.invoice_number || inv.id}","${inv.customer_name}","${formatDate(inv.created_at)}","${formatCurrency(inv.total_cents)}","${formatCurrency(inv.amount_paid_cents)}","${inv.status}"`
        ).join('\n')
        filename = `revenue_report_${startDate}_to_${endDate}.csv`
        break

      case 'jobs':
        csvContent = 'Job ID,Customer,Service,Date,Quote,Status\n'
        csvContent += filteredJobs.map(job =>
          `"${job.id}","${job.customer_name}","${job.job_type}","${formatDate(job.scheduled_date || job.created_at)}","${formatCurrency(job.quote_cents)}","${job.status}"`
        ).join('\n')
        filename = `jobs_report_${startDate}_to_${endDate}.csv`
        break

      case 'expenses':
        csvContent = 'Date,Category,Vendor,Description,Amount,Tax Deductible\n'
        csvContent += filteredExpenses.map(exp =>
          `"${formatDate(exp.expense_date)}","${exp.category}","${exp.vendor || ''}","${exp.description}","${formatCurrency(exp.amount_cents)}","${exp.is_tax_deductible ? 'Yes' : 'No'}"`
        ).join('\n')
        filename = `expenses_report_${startDate}_to_${endDate}.csv`
        break

      case 'customers':
        csvContent = 'Name,Phone,Email,Total Jobs,Total Spent,Created\n'
        csvContent += filteredCustomers.map(cust =>
          `"${cust.name}","${cust.phone}","${cust.email || ''}","${cust.total_jobs}","${formatCurrency(cust.total_spent_cents)}","${formatDate(cust.created_at)}"`
        ).join('\n')
        filename = `customers_report_${startDate}_to_${endDate}.csv`
        break

      case 'tax':
        csvContent = 'Category,Description,Amount\n'
        const taxExpenses = filteredExpenses.filter(e => e.is_tax_deductible)
        csvContent += taxExpenses.map(exp =>
          `"${exp.category}","${exp.description}","${formatCurrency(exp.amount_cents)}"`
        ).join('\n')
        const totalDeductible = taxExpenses.reduce((sum, e) => sum + e.amount_cents, 0)
        csvContent += `\n"TOTAL","Tax Deductible Expenses","${formatCurrency(totalDeductible)}"`
        filename = `tax_report_${startDate}_to_${endDate}.csv`
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Render report content
  const renderReport = () => {
    const filteredJobs = filterByDate(jobs)
    const filteredInvoices = filterByDate(invoices)
    const filteredExpenses = filterByDate(expenses)
    const filteredCustomers = filterByDate(customers)

    switch (reportType) {
      case 'revenue':
        const totalRevenue = filteredInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount_paid_cents, 0)
        const outstanding = filteredInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total_cents - (i.amount_paid_cents || 0)), 0)
        return (
          <div>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Revenue</p>
                <p style={{ color: '#16a34a', fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(totalRevenue)}</p>
              </div>
              <div style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#9C9690', fontSize: '14px' }}>Outstanding</p>
                <p style={{ color: '#F5C518', fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(outstanding)}</p>
              </div>
              <div style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#9C9690', fontSize: '14px' }}>Invoices</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{filteredInvoices.length}</p>
              </div>
            </div>
            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #302d2a' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Invoice</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Total</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #302d2a' }}>
                    <td style={{ padding: '12px', color: 'white' }}>#{inv.invoice_number || inv.id}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{inv.customer_name}</td>
                    <td style={{ padding: '12px', color: '#9C9690' }}>{formatDate(inv.created_at)}</td>
                    <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>{formatCurrency(inv.total_cents)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        backgroundColor: inv.status === 'paid' ? '#16a34a20' : '#F5C51820',
                        color: inv.status === 'paid' ? '#16a34a' : '#F5C518',
                      }}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'expenses':
        const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount_cents, 0)
        const byCategory = config.expenseCategories.map(cat => ({
          ...cat,
          total: filteredExpenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount_cents, 0)
        }))
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {byCategory.filter(c => c.total > 0).map(cat => (
                <div key={cat.id} style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px' }}>{cat.icon}</p>
                  <p style={{ color: '#9C9690', fontSize: '12px' }}>{cat.label}</p>
                  <p style={{ color: '#dc2626', fontWeight: '600' }}>{formatCurrency(cat.total)}</p>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#dc262620', borderRadius: '8px' }}>
              <span style={{ color: '#9C9690' }}>Total Expenses: </span>
              <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px' }}>{formatCurrency(totalExpenses)}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #302d2a' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #302d2a' }}>
                    <td style={{ padding: '12px', color: '#9C9690' }}>{formatDate(exp.expense_date)}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{config.expenseCategories.find(c => c.id === exp.category)?.label || exp.category}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{exp.description}</td>
                    <td style={{ padding: '12px', color: '#dc2626', textAlign: 'right' }}>{formatCurrency(exp.amount_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'tax':
        const taxDeductible = filteredExpenses.filter(e => e.is_tax_deductible)
        const totalDeductible = taxDeductible.reduce((s, e) => s + e.amount_cents, 0)
        return (
          <div>
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#16a34a20', borderRadius: '12px', border: '1px solid #16a34a' }}>
              <p style={{ color: '#9C9690', marginBottom: '8px' }}>Total Tax Deductible Expenses</p>
              <p style={{ color: '#16a34a', fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(totalDeductible)}</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #302d2a' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {taxDeductible.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #302d2a' }}>
                    <td style={{ padding: '12px', color: '#9C9690' }}>{formatDate(exp.expense_date)}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{config.expenseCategories.find(c => c.id === exp.category)?.label || exp.category}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{exp.description}</td>
                    <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>{formatCurrency(exp.amount_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'jobs':
        const completedJobs = filteredJobs.filter(j => j.status === 'completed').length
        const totalQuotes = filteredJobs.reduce((s, j) => s + (j.quote_cents || 0), 0)
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Jobs</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{filteredJobs.length}</p>
              </div>
              <div style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#9C9690', fontSize: '14px' }}>Completed</p>
                <p style={{ color: '#16a34a', fontSize: '24px', fontWeight: 'bold' }}>{completedJobs}</p>
              </div>
              <div style={{ backgroundColor: '#302d2a', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#9C9690', fontSize: '14px' }}>Total Value</p>
                <p style={{ color: '#F5C518', fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(totalQuotes)}</p>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #302d2a' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Service</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Quote</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #302d2a' }}>
                    <td style={{ padding: '12px', color: 'white' }}>{job.customer_name}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{config.services.find(s => s.id === job.job_type)?.name || job.job_type}</td>
                    <td style={{ padding: '12px', color: '#9C9690' }}>{formatDate(job.scheduled_date || job.created_at)}</td>
                    <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>{formatCurrency(job.quote_cents)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        backgroundColor: config.jobStatuses.find(s => s.id === job.status)?.color || '#f3f4f6',
                        color: config.jobStatuses.find(s => s.id === job.status)?.textColor || '#374151',
                      }}>
                        {config.jobStatuses.find(s => s.id === job.status)?.label || job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'customers':
        return (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#9C9690' }}>{filteredCustomers.length} customers in selected period</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #302d2a' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#9C9690' }}>Contact</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Jobs</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#9C9690' }}>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid #302d2a' }}>
                    <td style={{ padding: '12px', color: 'white' }}>{cust.name}</td>
                    <td style={{ padding: '12px', color: '#9C9690' }}>{cust.phone}</td>
                    <td style={{ padding: '12px', color: 'white', textAlign: 'right' }}>{cust.total_jobs}</td>
                    <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>{formatCurrency(cust.total_spent_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
    }
  }

  const reportTypes = [
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'jobs', label: 'Jobs', icon: '📋' },
    { id: 'expenses', label: 'Expenses', icon: '🧾' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'tax', label: 'Tax Report', icon: '📊' },
  ] as const

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714' }}>
      <AdminNav />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Reports</h1>
          <button
            onClick={exportToCSV}
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
            Export CSV
          </button>
        </div>

        {/* Report Type Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {reportTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: reportType === type.id ? '#16a34a' : '#252220',
                color: reportType === type.id ? 'white' : '#9C9690',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: '#9C9690', fontSize: '14px', marginRight: '8px' }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#302d2a',
                border: '1px solid #3A3733',
                borderRadius: '6px',
                color: 'white',
              }}
            />
          </div>
          <div>
            <label style={{ color: '#9C9690', fontSize: '14px', marginRight: '8px' }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#302d2a',
                border: '1px solid #3A3733',
                borderRadius: '6px',
                color: 'white',
              }}
            />
          </div>
        </div>

        {/* Report Content */}
        <div style={{ backgroundColor: '#252220', borderRadius: '12px', border: '1px solid #302d2a', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>Loading...</div>
          ) : (
            renderReport()
          )}
        </div>
      </div>
    </div>
  )
}
