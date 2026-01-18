'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { config } from '@/config/config'

export interface Job {
  id: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  service_type?: string
  job_type?: string
  project_type?: string
  service_address: string
  square_footage?: number
  square_feet?: number
  estimate_low?: number
  estimate_high?: number
  quote_cents?: number
  final_price_cents?: number
  status: string
  scheduled_date?: string
  notes?: string
  internal_notes?: string
  created_at: string
  condition?: string
  customer_id?: number
  invoice_id?: number
  placement_lat?: number
  placement_lng?: number
}

interface JobsContextType {
  jobs: Job[]
  loading: boolean
  fetchJobs: () => Promise<void>
  deleteJob: (jobId: number) => Promise<boolean>
  updateJobStatus: (jobId: number, status: string) => Promise<void>
  updateJobDate: (jobId: number, newDate: string) => Promise<void>
}

const JobsContext = createContext<JobsContextType | undefined>(undefined)

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
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
        setJobs(await response.json())
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteJob = useCallback(async (jobId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // Remove from local state immediately
        setJobs(prev => prev.filter(job => job.id !== jobId))
        return true
      } else {
        console.error('Error deleting job:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      return false
    }
  }, [])

  const updateJobStatus = useCallback(async (jobId: number, status: string) => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/jobs?id=eq.${jobId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ status }),
        }
      )
      if (response.ok) {
        setJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, status } : job
        ))
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }, [])

  const updateJobDate = useCallback(async (jobId: number, newDate: string) => {
    try {
      const response = await fetch(
        `${config.supabase.url}/rest/v1/jobs?id=eq.${jobId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': config.supabase.anonKey,
            'Authorization': `Bearer ${config.supabase.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ scheduled_date: newDate }),
        }
      )
      if (response.ok) {
        setJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, scheduled_date: newDate } : job
        ))
      }
    } catch (error) {
      console.error('Error updating date:', error)
    }
  }, [])

  return (
    <JobsContext.Provider value={{ jobs, loading, fetchJobs, deleteJob, updateJobStatus, updateJobDate }}>
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const context = useContext(JobsContext)
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}
