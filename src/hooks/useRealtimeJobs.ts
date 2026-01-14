'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { config } from '@/config/config'

interface Job {
  id: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  service_address: string
  job_type?: string
  project_type?: string
  square_feet?: number
  quote_cents?: number
  final_price_cents?: number
  status: string
  scheduled_date?: string
  notes?: string
  internal_notes?: string
  created_at: string
}

interface UseRealtimeJobsOptions {
  enabled?: boolean
  pollInterval?: number // ms
}

export function useRealtimeJobs(options: UseRealtimeJobsOptions = {}) {
  const { enabled = true, pollInterval = 30000 } = options

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [newJobCount, setNewJobCount] = useState(0)

  const previousIdsRef = useRef<Set<number>>(new Set())
  const audioContextRef = useRef<AudioContext | null>(null)

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context on first use
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Simple beep
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio not supported
    }
  }, [])

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
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

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data: Job[] = await response.json()

      // Check for new jobs
      const currentIds = new Set(data.map(j => j.id))
      let newCount = 0

      if (previousIdsRef.current.size > 0) {
        currentIds.forEach(id => {
          if (!previousIdsRef.current.has(id)) {
            newCount++
          }
        })

        if (newCount > 0) {
          playNotificationSound()
          setNewJobCount(prev => prev + newCount)
        }
      }

      previousIdsRef.current = currentIds
      setJobs(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [playNotificationSound])

  // Refresh function
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchJobs()
  }, [fetchJobs])

  // Clear new job alert
  const clearNewJobAlert = useCallback(() => {
    setNewJobCount(0)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchJobs()
    }
  }, [enabled, fetchJobs])

  // Polling
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(fetchJobs, pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchJobs])

  // Visibility change - refresh when tab becomes visible
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchJobs()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, fetchJobs])

  return {
    jobs,
    loading,
    error,
    lastUpdated,
    newJobCount,
    refresh,
    clearNewJobAlert,
  }
}

export default useRealtimeJobs
