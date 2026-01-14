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
  maximumScale: 1,
  userScalable: false,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <JobsProvider>{children}</JobsProvider>
}
