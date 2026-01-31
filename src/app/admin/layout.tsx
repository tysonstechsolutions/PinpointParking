import type { Metadata, Viewport } from "next"
import { JobsProvider } from "@/context/JobsContext"

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
  // Allow users to zoom for accessibility (WCAG 1.4.4)
  maximumScale: 5,
  userScalable: true,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <JobsProvider>{children}</JobsProvider>
}
