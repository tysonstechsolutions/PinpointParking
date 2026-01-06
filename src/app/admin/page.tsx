'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Job {
  id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  service_address: string
  job_type: string
  square_feet: number
  quote_cents: number
  final_price_cents: number
  scheduled_date: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === config.admin.password) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      fetchJobs()
    } else {
      setPasswordError('Wrong password')
    }
  }

  // Check session on mount
  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true)
      fetchJobs()
    }
  }, [])

  // Fetch jobs from database
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/jobs?order=created_at.desc`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
    setLoading(false)
  }

  // Update job status
  const updateStatus = async (jobId: number, newStatus: string) => {
    try {
      await fetch(
        `${config.supabase.url}/rest/v1/jobs?id=eq.${jobId}`,
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
      fetchJobs()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        job.customer_name?.toLowerCase().includes(query) ||
        job.customer_phone?.includes(query) ||
        job.service_address?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Get status style
  const getStatusStyle = (status: string) => {
    const statusConfig = config.jobStatuses.find(s => s.id === status)
    return statusConfig || { color: '#f3f4f6', textColor: '#374151' }
  }

  // Get service name
  const getServiceName = (type: string) => {
    const service = config.services.find(s => s.id === type)
    return service ? `${service.emoji} ${service.name}` : type
  }

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format((cents || 0) / 100)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not scheduled'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // ========== LOGIN SCREEN ==========
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1714',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '16px',
          border: '1px solid #302d2a',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>Admin Login</h1>
            <p style={{ color: '#888', marginTop: '8px' }}>{config.businessName}</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#302d2a',
                border: '1px solid #3A3733',
                borderRadius: '8px',
                color: '#FAF8F5',
                fontSize: '16px',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            {passwordError && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{passwordError}</p>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ========== ADMIN DASHBOARD ==========
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Jobs</h1>
            <p style={{ color: '#9C9690' }}>{jobs.length} total jobs</p>
          </div>
          <button
            onClick={fetchJobs}
            style={{
              padding: '8px 16px',
              backgroundColor: '#252220',
              border: '1px solid #302d2a',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {config.jobStatuses.map(status => (
            <div
              key={status.id}
              style={{
                backgroundColor: '#252220',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #302d2a',
              }}
            >
              <p style={{ color: '#9C9690', fontSize: '14px' }}>{status.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                {jobs.filter(j => j.status === status.id).length}
              </p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by name, phone, address..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              backgroundColor: '#302d2a',
              border: '1px solid #3A3733',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'white',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', ...config.jobStatuses.map(s => s.id)].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === f ? '#16a34a' : '#252220',
                  color: filter === f ? 'white' : '#9C9690',
                }}
              >
                {f === 'all' ? 'All' : config.jobStatuses.find(s => s.id === f)?.label || f}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          border: '1px solid #302d2a',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>
              Loading...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>
              No jobs found
            </div>
          ) : (
            filteredJobs.map((job, i) => {
              const statusStyle = getStatusStyle(job.status)
              return (
                <div
                  key={job.id}
                  style={{
                    padding: '16px',
                    borderBottom: i < filteredJobs.length - 1 ? '1px solid #302d2a' : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    {/* Left: Customer & Job Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '16px', color: 'white' }}>{job.customer_name}</span>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: statusStyle.color,
                            color: statusStyle.textColor,
                          }}
                        >
                          {config.jobStatuses.find(s => s.id === job.status)?.label || job.status}
                        </span>
                      </div>
                      <p style={{ color: '#16a34a', fontSize: '14px', marginBottom: '4px' }}>
                        📞 {job.customer_phone}
                      </p>
                      <p style={{ color: '#9C9690', fontSize: '14px' }}>
                        📍 {job.service_address}
                      </p>
                    </div>

                    {/* Middle: Service & Size */}
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Service</p>
                      <p style={{ fontWeight: '500', color: 'white' }}>{getServiceName(job.job_type)}</p>
                      {job.square_feet && (
                        <p style={{ color: '#9C9690', fontSize: '14px' }}>
                          {job.square_feet.toLocaleString()} sq ft
                        </p>
                      )}
                    </div>

                    {/* Right: Date & Price */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Scheduled</p>
                      <p style={{ fontWeight: '500', color: 'white' }}>{formatDate(job.scheduled_date)}</p>
                      <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '18px' }}>
                        {formatCurrency(job.quote_cents || job.final_price_cents)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #302d2a',
                  }}>
                    {job.status === 'quote' && (
                      <>
                        <button
                          onClick={() => updateStatus(job.id, 'approved')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Approved
                        </button>
                        <button
                          onClick={() => updateStatus(job.id, 'cancelled')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                    {job.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(job.id, 'scheduled')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3e8ff',
                          color: '#7c3aed',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        📅 Schedule
                      </button>
                    )}
                    {job.status === 'scheduled' && (
                      <button
                        onClick={() => updateStatus(job.id, 'in_progress')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        🚧 Start Work
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatus(job.id, 'completed')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Complete
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
