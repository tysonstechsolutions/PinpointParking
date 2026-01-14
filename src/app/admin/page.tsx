'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Job {
  id: number
  customer_id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  service_address: string
  job_type: string
  project_type: string
  square_feet: number
  condition: string
  quote_cents: number
  final_price_cents: number
  scheduled_date: string
  status: string
  notes: string
  internal_notes: string
  created_at: string
  invoice_id: number
  placement_lat?: number
  placement_lng?: number
}

// Capitalize names properly
const capitalizeName = (name: string): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Fetch jobs from database
  const fetchJobs = useCallback(async () => {
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
    } catch (err) {
      console.error('Error fetching jobs:', err)
    }
    setLoading(false)
  }, [])

  // Login handler - uses server-side auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setLoginLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        setPassword('')
        fetchJobs()
      } else if (response.status === 429) {
        setPasswordError(`Too many attempts. Try again in ${data.retryAfter} seconds.`)
      } else {
        setPasswordError(data.error || 'Invalid password')
      }
    } catch {
      setPasswordError('Login failed. Please try again.')
    }

    setLoginLoading(false)
  }

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          fetchJobs()
        }
      } catch {
        // Not authenticated
      }
      setCheckingAuth(false)
    }

    checkSession()
  }, [fetchJobs])

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

  // Delete job
  const deleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) return
    try {
      await fetch(
        `${config.supabase.url}/rest/v1/jobs?id=eq.${jobId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      setSelectedJob(null)
      fetchJobs()
    } catch (error) {
      console.error('Error deleting job:', error)
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

  // Get project type name
  const getProjectTypeName = (type: string) => {
    const project = config.projectTypes.find(p => p.id === type)
    return project ? `${project.emoji} ${project.label}` : type
  }

  // Get condition name
  const getConditionName = (cond: string) => {
    const condition = config.conditions.find(c => c.id === cond)
    return condition ? condition.label : cond
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

  // ========== LOADING SCREEN ==========
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1714',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#9C9690' }}>Loading...</p>
        </div>
      </div>
    )
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
              disabled={loginLoading}
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
                opacity: loginLoading ? 0.6 : 1,
              }}
              autoFocus
            />
            {passwordError && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loginLoading ? '#166534' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
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
                        <span style={{ fontWeight: '600', fontSize: '16px', color: 'white' }}>{capitalizeName(job.customer_name)}</span>
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
                    <button
                      onClick={() => setSelectedJob(job)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#F5C518',
                        color: '#1a1714',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      👁 View Details
                    </button>
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
                    {job.status === 'cancelled' && (
                      <button
                        onClick={() => deleteJob(job.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#7f1d1d',
                          color: '#fca5a5',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑 Delete
                      </button>
                    )}
                    {job.status !== 'cancelled' && job.status !== 'completed' && (
                      <button
                        onClick={() => deleteJob(job.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'transparent',
                          color: '#9C9690',
                          border: '1px solid #3A3733',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑
                      </button>
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

      {/* Job Detail Modal */}
      {selectedJob && (
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
          onClick={() => setSelectedJob(null)}
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
                  Job #{selectedJob.id}
                </h2>
                <p style={{ color: '#9C9690', fontSize: '14px', margin: '4px 0 0 0' }}>
                  Created {new Date(selectedJob.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
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
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: getStatusStyle(selectedJob.status).color,
                    color: getStatusStyle(selectedJob.status).textColor,
                  }}
                >
                  {config.jobStatuses.find(s => s.id === selectedJob.status)?.label || selectedJob.status}
                </span>
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
                  {capitalizeName(selectedJob.customer_name)}
                </p>
                <p style={{ color: '#16a34a', marginBottom: '4px' }}>
                  📞 <a href={`tel:${selectedJob.customer_phone}`} style={{ color: '#16a34a' }}>{selectedJob.customer_phone}</a>
                </p>
                {selectedJob.customer_email && (
                  <p style={{ color: '#9C9690', marginBottom: '4px' }}>
                    ✉️ {selectedJob.customer_email}
                  </p>
                )}
                {selectedJob.service_address && (
                  <p style={{ color: '#9C9690' }}>
                    📍 {selectedJob.service_address}
                  </p>
                )}
              </div>

              {/* Map Location */}
              {selectedJob.placement_lat && selectedJob.placement_lng && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    SERVICE LOCATION
                  </h3>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', position: 'relative', width: '100%', height: '300px' }}>
                    <Image
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedJob.placement_lat},${selectedJob.placement_lng}&zoom=19&size=600x300&maptype=hybrid&markers=color:yellow%7C${selectedJob.placement_lat},${selectedJob.placement_lng}&key=${config.googleMaps.apiKey}`}
                      alt="Service Location"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedJob.placement_lat},${selectedJob.placement_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      color: '#F5C518',
                      fontSize: '14px',
                    }}
                  >
                    Open in Google Maps →
                  </a>
                </div>
              )}

              {/* Job Details */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  JOB DETAILS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>Service</p>
                    <p style={{ color: 'white', fontWeight: '500' }}>{getServiceName(selectedJob.job_type)}</p>
                  </div>
                  {selectedJob.project_type && (
                    <div>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Property Type</p>
                      <p style={{ color: 'white', fontWeight: '500' }}>{getProjectTypeName(selectedJob.project_type)}</p>
                    </div>
                  )}
                  {selectedJob.square_feet && (
                    <div>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Area</p>
                      <p style={{ color: 'white', fontWeight: '500' }}>{selectedJob.square_feet.toLocaleString()} sq ft</p>
                    </div>
                  )}
                  {selectedJob.condition && (
                    <div>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Condition</p>
                      <p style={{ color: 'white', fontWeight: '500' }}>{getConditionName(selectedJob.condition)}</p>
                    </div>
                  )}
                  {selectedJob.scheduled_date && (
                    <div>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Preferred Date</p>
                      <p style={{ color: 'white', fontWeight: '500' }}>{formatDate(selectedJob.scheduled_date)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div style={{
                backgroundColor: '#1a1714',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  PRICING
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#9C9690', fontSize: '12px' }}>Estimated Quote</p>
                    <p style={{ color: '#16a34a', fontSize: '24px', fontWeight: 'bold' }}>
                      {formatCurrency(selectedJob.quote_cents)}
                    </p>
                  </div>
                  {selectedJob.final_price_cents && selectedJob.final_price_cents !== selectedJob.quote_cents && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#9C9690', fontSize: '12px' }}>Final Price</p>
                      <p style={{ color: '#F5C518', fontSize: '24px', fontWeight: 'bold' }}>
                        {formatCurrency(selectedJob.final_price_cents)}
                      </p>
                    </div>
                  )}
                </div>
                {selectedJob.internal_notes && (
                  <p style={{ color: '#9C9690', fontSize: '13px', marginTop: '8px', fontStyle: 'italic' }}>
                    {selectedJob.internal_notes}
                  </p>
                )}
              </div>

              {/* Notes */}
              {selectedJob.notes && (
                <div style={{
                  backgroundColor: '#1a1714',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ color: '#F5C518', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    NOTES
                  </h3>
                  <p style={{ color: 'white' }}>{selectedJob.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedJob.status === 'quote' && (
                  <>
                    <button
                      onClick={() => { updateStatus(selectedJob.id, 'approved'); setSelectedJob(null); }}
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
                      ✓ Approve Quote
                    </button>
                    <button
                      onClick={() => { updateStatus(selectedJob.id, 'cancelled'); setSelectedJob(null); }}
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
                      ✕ Cancel
                    </button>
                  </>
                )}
                {selectedJob.status === 'approved' && (
                  <button
                    onClick={() => { updateStatus(selectedJob.id, 'scheduled'); setSelectedJob(null); }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    📅 Mark as Scheduled
                  </button>
                )}
                {selectedJob.status === 'scheduled' && (
                  <button
                    onClick={() => { updateStatus(selectedJob.id, 'in_progress'); setSelectedJob(null); }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🚧 Start Work
                  </button>
                )}
                {selectedJob.status === 'in_progress' && (
                  <button
                    onClick={() => { updateStatus(selectedJob.id, 'completed'); setSelectedJob(null); }}
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
                    ✓ Mark Complete
                  </button>
                )}
                {selectedJob.status === 'cancelled' && (
                  <button
                    onClick={() => deleteJob(selectedJob.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#7f1d1d',
                      color: '#fca5a5',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🗑 Permanently Delete
                  </button>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
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
                  onClick={() => deleteJob(selectedJob.id)}
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
