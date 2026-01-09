'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      // Don't show again for 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: '#252220',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '1px solid #302d2a',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#16a34a',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
        }}>
          P
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
          }}>
            Install Pinpoint Parking
          </h3>
          <p style={{
            margin: '4px 0 0',
            fontSize: '13px',
            color: '#9C9690',
          }}>
            Install the app for quick access and offline capabilities
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: 'transparent',
            color: '#9C9690',
            border: '1px solid #302d2a',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Not Now
        </button>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Install
        </button>
      </div>
    </div>
  )
}
