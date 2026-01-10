'use client'

import { useState, useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { cacheJobs, getCachedJobs, addPendingAction, syncPendingActions } from '@/lib/offlineStorage'

interface Job {
  id: number
  customer_name: string
  customer_phone?: string
  address: string
  service_type: string
  status: string
  scheduled_date?: string
  notes?: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#eab308' },
  { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
  { value: 'in_progress', label: 'In Progress', color: '#f97316' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
]

export default function FieldModePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [pendingSync, setPendingSync] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const isOnline = useOnlineStatus()

  async function loadJobs() {
    setLoading(true)

    if (isOnline) {
      try {
        const response = await fetch('/api/jobs?status=pending,confirmed,in_progress')
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
          await cacheJobs(data)
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        // Fall back to cached data
        const cached = await getCachedJobs()
        setJobs(cached as Job[])
      }
    } else {
      const cached = await getCachedJobs()
      setJobs(cached as Job[])
    }

    setLoading(false)
  }

  async function updateJobStatus(jobId: number, newStatus: string) {
    // Optimistically update UI
    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, status: newStatus } : j
    ))
    setSelectedJob(null)

    if (isOnline) {
      try {
        await fetch(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      } catch (error) {
        console.error('Failed to update job:', error)
        // Queue for later sync
        await addPendingAction({
          url: `/api/jobs/${jobId}`,
          method: 'PATCH',
          data: { status: newStatus },
        })
        setPendingSync(prev => prev + 1)
      }
    } else {
      // Queue for later sync
      await addPendingAction({
        url: `/api/jobs/${jobId}`,
        method: 'PATCH',
        data: { status: newStatus },
      })
      setPendingSync(prev => prev + 1)
    }
  }

  async function handleSync() {
    setSyncing(true)
    const result = await syncPendingActions()
    setPendingSync(result.failed)
    setSyncing(false)

    if (result.synced > 0) {
      await loadJobs()
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    if (isOnline && pendingSync > 0) {
      handleSync()
    }
  }, [isOnline, pendingSync])

  const todaysJobs = jobs.filter(j => {
    if (!j.scheduled_date) return false
    const jobDate = new Date(j.scheduled_date).toDateString()
    const today = new Date().toDateString()
    return jobDate === today
  })

  const upcomingJobs = jobs.filter(j => {
    if (!j.scheduled_date) return true
    const jobDate = new Date(j.scheduled_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return jobDate > today
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1714',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#252220',
        padding: '16px',
        borderBottom: '1px solid #302d2a',
        position: 'sticky',
        top: '56px',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
          }}>
            Field Mode
          </h1>

          {pendingSync > 0 && (
            <button
              onClick={handleSync}
              disabled={!isOnline || syncing}
              style={{
                padding: '8px 16px',
                backgroundColor: isOnline ? '#f97316' : '#525252',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: isOnline ? 'pointer' : 'not-allowed',
              }}
            >
              {syncing ? 'Syncing...' : `Sync (${pendingSync})`}
            </button>
          )}
        </div>

        {!isOnline && (
          <p style={{
            margin: '8px 0 0',
            fontSize: '13px',
            color: '#f97316',
          }}>
            Offline - Changes will sync when connected
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#9C9690',
          }}>
            Loading jobs...
          </div>
        ) : (
          <>
            {/* Today's Jobs */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#9C9690',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}>
                Today ({todaysJobs.length})
              </h2>

              {todaysJobs.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  No jobs scheduled for today
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todaysJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSelect={() => setSelectedJob(job)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Jobs */}
            <div>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#9C9690',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}>
                Upcoming ({upcomingJobs.length})
              </h2>

              {upcomingJobs.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  No upcoming jobs
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcomingJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSelect={() => setSelectedJob(job)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 100,
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            style={{
              width: '100%',
              backgroundColor: '#252220',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '20px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '4px',
            }}>
              Update Status
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#9C9690',
              marginBottom: '16px',
            }}>
              {selectedJob.customer_name} - {selectedJob.service_type}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}>
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status.value}
                  onClick={() => updateJobStatus(selectedJob.id, status.value)}
                  style={{
                    padding: '16px',
                    backgroundColor: selectedJob.status === status.value ? status.color : '#1a1714',
                    color: 'white',
                    border: `2px solid ${status.color}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedJob(null)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '14px',
                backgroundColor: 'transparent',
                color: '#9C9690',
                border: '1px solid #302d2a',
                borderRadius: '12px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function JobCard({ job, onSelect }: { job: Job; onSelect: () => void }) {
  const statusOption = STATUS_OPTIONS.find(s => s.value === job.status)

  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: '#252220',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        border: '1px solid #302d2a',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          margin: 0,
        }}>
          {job.customer_name}
        </h3>
        <span style={{
          padding: '4px 10px',
          backgroundColor: statusOption?.color || '#666',
          color: 'white',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
        }}>
          {statusOption?.label || job.status}
        </span>
      </div>

      <p style={{
        fontSize: '14px',
        color: '#F5C518',
        margin: '0 0 4px',
      }}>
        {job.service_type}
      </p>

      <p style={{
        fontSize: '13px',
        color: '#9C9690',
        margin: 0,
      }}>
        {job.address}
      </p>

      {job.scheduled_date && (
        <p style={{
          fontSize: '12px',
          color: '#666',
          margin: '8px 0 0',
        }}>
          {new Date(job.scheduled_date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}

      {job.customer_phone && (
        <a
          href={`tel:${job.customer_phone}`}
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: '#16a34a',
            color: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          Call Customer
        </a>
      )}
    </div>
  )
}
