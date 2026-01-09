// ============================================
// OFFLINE DATA STORAGE UTILITIES
// ============================================
// Uses IndexedDB for persistent offline storage

const DB_NAME = 'pinpoint-offline'
const DB_VERSION = 1

interface Job {
  id: number
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  service_type?: string
  address?: string
  status?: string
  scheduled_date?: string
  estimate_low_cents?: number
  estimate_high_cents?: number
  notes?: string
}

interface PendingAction {
  id?: number
  url: string
  method: string
  data: Record<string, unknown>
  timestamp: number
}

// Open the IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('jobs')) {
        db.createObjectStore('jobs', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id' })
      }
    }
  })
}

// ============================================
// JOBS CACHING
// ============================================

export async function cacheJobs(jobs: Job[]): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction('jobs', 'readwrite')
    const store = transaction.objectStore('jobs')

    // Clear existing jobs and add new ones
    store.clear()
    for (const job of jobs) {
      store.put(job)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to cache jobs:', error)
  }
}

export async function getCachedJobs(): Promise<Job[]> {
  try {
    const db = await openDB()
    const transaction = db.transaction('jobs', 'readonly')
    const store = transaction.objectStore('jobs')
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to get cached jobs:', error)
    return []
  }
}

export async function getCachedJob(id: number): Promise<Job | null> {
  try {
    const db = await openDB()
    const transaction = db.transaction('jobs', 'readonly')
    const store = transaction.objectStore('jobs')
    const request = store.get(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to get cached job:', error)
    return null
  }
}

// ============================================
// PENDING ACTIONS (for background sync)
// ============================================

export async function addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction('pending-actions', 'readwrite')
    const store = transaction.objectStore('pending-actions')

    store.add({
      ...action,
      timestamp: Date.now(),
    })

    // Try to register background sync if available
    if ('serviceWorker' in navigator && 'sync' in (navigator.serviceWorker as unknown as { sync: unknown })) {
      const registration = await navigator.serviceWorker.ready
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-jobs')
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to add pending action:', error)
  }
}

export async function getPendingActions(): Promise<PendingAction[]> {
  try {
    const db = await openDB()
    const transaction = db.transaction('pending-actions', 'readonly')
    const store = transaction.objectStore('pending-actions')
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to get pending actions:', error)
    return []
  }
}

export async function removePendingAction(id: number): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction('pending-actions', 'readwrite')
    const store = transaction.objectStore('pending-actions')
    store.delete(id)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to remove pending action:', error)
  }
}

// ============================================
// SYNC PENDING ACTIONS
// ============================================

export async function syncPendingActions(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingActions()
  let synced = 0
  let failed = 0

  for (const action of pending) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      })

      if (response.ok && action.id) {
        await removePendingAction(action.id)
        synced++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { synced, failed }
}

// ============================================
// UTILITY: Check if we're online
// ============================================

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

// ============================================
// UTILITY: Clear all offline data
// ============================================

export async function clearOfflineData(): Promise<void> {
  try {
    const db = await openDB()

    const transaction = db.transaction(['jobs', 'pending-actions', 'customers'], 'readwrite')
    transaction.objectStore('jobs').clear()
    transaction.objectStore('pending-actions').clear()
    transaction.objectStore('customers').clear()

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error('[Offline] Failed to clear offline data:', error)
  }
}
