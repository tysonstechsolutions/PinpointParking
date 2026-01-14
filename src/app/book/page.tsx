'use client'

import Link from 'next/link'
import { config } from '@/config/config'
import PavingChatbot from '@/components/PavingChatbot'

export default function BookingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1714', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#252220',
        borderBottom: '1px solid #302d2a',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#F5C518', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>
            {config.businessName}
          </Link>
          <a href={`tel:${config.phoneRaw}`} style={{ color: '#9C9690', fontSize: '14px', textDecoration: 'none' }}>
            {config.phone}
          </a>
        </div>
      </div>

      {/* Embedded Chatbot */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '600px', height: 'calc(100vh - 140px)', minHeight: '500px' }}>
          <PavingChatbot embedded={true} />
        </div>
      </div>
    </div>
  )
}
