'use client'

import { useState, useEffect } from 'react'
import { config } from '@/config/config'
import AdminNav from '@/components/AdminNav'

interface Job {
  id: number
  customer_name: string
  customer_phone: string
  service_address: string
  job_type: string
  project_type: string
  square_feet: number
  quote_cents: number
  scheduled_date: string
  status: string
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

export default function CalendarPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/jobs?order=scheduled_date.asc`,
        {
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
          },
        }
      )
      if (response.ok) {
        setJobs(await response.json())
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  // Update job scheduled date
  const updateJobDate = async (jobId: number, newDate: string) => {
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
          body: JSON.stringify({ scheduled_date: newDate }),
        }
      )
      fetchJobs()
    } catch (error) {
      console.error('Error updating date:', error)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format((cents || 0) / 100)
  }

  // Get status style
  const getStatusStyle = (status: string) => {
    const statusConfig = config.jobStatuses.find(s => s.id === status)
    return statusConfig || { color: '#f3f4f6', textColor: '#374151' }
  }

  // Get service info
  const getServiceName = (type: string) => {
    const service = config.services.find(s => s.id === type)
    return service ? `${service.emoji} ${service.shortName || service.name}` : type
  }

  // Calendar helpers
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      })
    }

    // Next month days to complete the grid
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      })
    }

    return days
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return jobs.filter(job => job.scheduled_date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, job: Job) => {
    e.dataTransfer.setData('jobId', job.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const jobId = parseInt(e.dataTransfer.getData('jobId'))
    const newDate = date.toISOString().split('T')[0]
    updateJobDate(jobId, newDate)
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
              Calendar
            </h1>
            <p style={{ color: '#9C9690' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setView('month')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: view === 'month' ? '#16a34a' : '#252220',
                  color: view === 'month' ? 'white' : '#9C9690',
                }}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: view === 'week' ? '#16a34a' : '#252220',
                  color: view === 'week' ? 'white' : '#9C9690',
                }}
              >
                Week
              </button>
            </div>

            {/* Navigation */}
            <button
              onClick={goToToday}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F5C518',
                color: '#1a1714',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            <button
              onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#252220',
                color: 'white',
                border: '1px solid #302d2a',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              &lt;
            </button>
            <button
              onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#252220',
                color: 'white',
                border: '1px solid #302d2a',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              &gt;
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9C9690' }}>
            Loading...
          </div>
        ) : view === 'month' ? (
          /* Month View */
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            border: '1px solid #302d2a',
            overflow: 'hidden',
          }}>
            {/* Day Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: '#302d2a',
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: '#9C9690',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}>
              {getMonthDays().map((day, i) => {
                const dayJobs = getJobsForDate(day.date)
                return (
                  <div
                    key={i}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day.date)}
                    style={{
                      minHeight: '120px',
                      padding: '8px',
                      borderRight: (i + 1) % 7 !== 0 ? '1px solid #302d2a' : 'none',
                      borderBottom: '1px solid #302d2a',
                      backgroundColor: isToday(day.date) ? '#16a34a10' : 'transparent',
                      opacity: day.isCurrentMonth ? 1 : 0.4,
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: isToday(day.date) ? 'bold' : 'normal',
                      color: isToday(day.date) ? '#16a34a' : 'white',
                      marginBottom: '8px',
                    }}>
                      {day.date.getDate()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dayJobs.slice(0, 3).map(job => {
                        const style = getStatusStyle(job.status)
                        return (
                          <div
                            key={job.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, job)}
                            onClick={() => setSelectedJob(job)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'grab',
                              backgroundColor: style.color,
                              color: style.textColor,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getServiceName(job.job_type)} - {capitalizeName(job.customer_name).split(' ')[0]}
                          </div>
                        )
                      })}
                      {dayJobs.length > 3 && (
                        <div style={{
                          fontSize: '11px',
                          color: '#9C9690',
                          textAlign: 'center',
                        }}>
                          +{dayJobs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Week View */
          <div style={{
            backgroundColor: '#252220',
            borderRadius: '12px',
            border: '1px solid #302d2a',
            overflow: 'hidden',
          }}>
            {/* Day Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: '#302d2a',
            }}>
              {getWeekDays().map((day, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    backgroundColor: isToday(day) ? '#16a34a20' : 'transparent',
                  }}
                >
                  <div style={{ color: '#9C9690', fontWeight: '600', fontSize: '12px' }}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div style={{
                    color: isToday(day) ? '#16a34a' : 'white',
                    fontWeight: isToday(day) ? 'bold' : 'normal',
                    fontSize: '20px',
                  }}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Week Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              minHeight: '400px',
            }}>
              {getWeekDays().map((day, i) => {
                const dayJobs = getJobsForDate(day)
                return (
                  <div
                    key={i}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                    style={{
                      padding: '12px',
                      borderRight: i < 6 ? '1px solid #302d2a' : 'none',
                      backgroundColor: isToday(day) ? '#16a34a10' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dayJobs.map(job => {
                        const style = getStatusStyle(job.status)
                        return (
                          <div
                            key={job.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, job)}
                            onClick={() => setSelectedJob(job)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              cursor: 'grab',
                              backgroundColor: style.color,
                              color: style.textColor,
                              border: `1px solid ${style.textColor}20`,
                            }}
                          >
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>
                              {getServiceName(job.job_type)}
                            </div>
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>
                              {capitalizeName(job.customer_name)}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
                              {formatCurrency(job.quote_cents)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}>
          {config.jobStatuses.map(status => (
            <div
              key={status.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '4px',
                  backgroundColor: status.color,
                }}
              />
              <span style={{ color: '#9C9690', fontSize: '13px' }}>{status.label}</span>
            </div>
          ))}
        </div>

        {/* Drag Instructions */}
        <p style={{
          color: '#666',
          fontSize: '13px',
          marginTop: '16px',
          textAlign: 'center',
        }}>
          Drag and drop jobs to reschedule them
        </p>
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
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                  {getServiceName(selectedJob.job_type)}
                </h2>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusStyle(selectedJob.status).color,
                    color: getStatusStyle(selectedJob.status).textColor,
                  }}
                >
                  {config.jobStatuses.find(s => s.id === selectedJob.status)?.label}
                </span>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9C9690',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                x
              </button>
            </div>

            <div style={{ color: 'white', marginBottom: '12px' }}>
              <p style={{ fontWeight: '600', fontSize: '16px' }}>
                {capitalizeName(selectedJob.customer_name)}
              </p>
              <p style={{ color: '#16a34a', fontSize: '14px' }}>
                {selectedJob.customer_phone}
              </p>
            </div>

            <div style={{ color: '#9C9690', fontSize: '14px', marginBottom: '12px' }}>
              <p>{selectedJob.service_address}</p>
              {selectedJob.square_feet && (
                <p>{selectedJob.square_feet.toLocaleString()} sq ft</p>
              )}
            </div>

            <div style={{
              borderTop: '1px solid #302d2a',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: '#9C9690' }}>Scheduled</span>
              <span style={{ color: 'white', fontWeight: '600' }}>
                {selectedJob.scheduled_date
                  ? new Date(selectedJob.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not scheduled'}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid #302d2a',
              paddingTop: '12px',
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: '#9C9690' }}>Quote</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '18px' }}>
                {formatCurrency(selectedJob.quote_cents)}
              </span>
            </div>

            <button
              onClick={() => {
                window.location.href = `/admin?job=${selectedJob.id}`
              }}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#F5C518',
                color: '#1a1714',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
