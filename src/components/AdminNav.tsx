'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { config } from '@/config/config'

const navItems = [
  { href: '/admin', label: 'Jobs', icon: '📋' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/invoices', label: 'Invoices', icon: '📄' },
  { href: '/admin/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/admin/documents', label: 'Documents', icon: '📁' },
]

export default function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname?.startsWith('/admin/job/')
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav style={{
      backgroundColor: '#1a1714',
      borderBottom: '1px solid #302d2a',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                backgroundColor: isActive(item.href) ? '#16a34a' : 'transparent',
                color: isActive(item.href) ? 'white' : '#888',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <span style={{ color: '#666', fontSize: '14px' }}>{config.businessName}</span>
      </div>
    </nav>
  )
}
