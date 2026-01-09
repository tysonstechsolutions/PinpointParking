'use client'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1714',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
        }}>
          📡
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#F5C518',
        }}>
          You're Offline
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#9C9690',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}>
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>

        <div style={{
          backgroundColor: '#252220',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'white',
          }}>
            Available Offline:
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#9C9690',
            fontSize: '14px',
          }}>
            <li style={{ padding: '8px 0' }}>View cached job information</li>
            <li style={{ padding: '8px 0' }}>Browse previously loaded pages</li>
            <li style={{ padding: '8px 0' }}>Access saved documents</li>
          </ul>
        </div>

        <button
          onClick={handleRetry}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Try Again
        </button>

        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#666',
        }}>
          Changes made while offline will sync when you reconnect.
        </p>
      </div>
    </div>
  )
}
