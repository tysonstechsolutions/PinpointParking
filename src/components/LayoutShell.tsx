'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientSideComponents from '@/components/ClientSideComponents'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEstimatePage = pathname.startsWith('/estimate/')

  if (isEstimatePage) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ position: 'relative', overflow: 'hidden' }}>
        {children}
      </main>
      <Footer />
      <ClientSideComponents />
    </>
  )
}
