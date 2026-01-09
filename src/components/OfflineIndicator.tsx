'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div style={{
      position: 'fixed',
      top: '56px', // Below the nav
      left: 0,
      right: 0,
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 19,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  )
}
