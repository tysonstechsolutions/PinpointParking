import type { Metadata, Viewport } from "next"
import AdminNav from "@/components/AdminNav"
import OfflineIndicator from "@/components/OfflineIndicator"

export const metadata: Metadata = {
  title: "Admin | Pinpoint Parking",
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1714",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style jsx global>{`
        /* Hide the public header and footer in admin area */
        body > header,
        body > footer,
        body > .chat-widget {
          display: none !important;
        }
      `}</style>
      <AdminNav />
      <OfflineIndicator />
      {children}
    </>
  )
}
