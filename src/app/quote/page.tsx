import PavingChatbot from '@/components/PavingChatbot'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get FREE Quote in 60 Seconds ★ Instant Asphalt Estimate',
  description: '⚡ Get your FREE paving quote in under 60 seconds! AI-powered instant estimates. Driveways, parking lots, sealcoating. No obligation. Start now!',
  keywords: ['free paving quote', 'asphalt estimate', 'driveway quote online', 'instant paving estimate'],
  alternates: {
    canonical: 'https://pinpointparking.net/quote',
  },
  openGraph: {
    title: '⚡ Get FREE Quote in 60 Seconds | Pinpoint Parking',
    description: 'AI-powered instant estimates for paving, sealcoating & more. No obligation, no waiting!',
  },
}

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Your Free Estimate
          </h1>
          <p className="text-gray-600">
            Chat with our assistant for an instant quote
          </p>
        </div>

        <PavingChatbot />

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Serving Southern Illinois - Mount Vernon, IL</p>
          <p className="mt-1">
            Or call us directly:{' '}
            <a href="tel:6182147656" className="text-yellow-600 font-medium hover:underline">
              (618) 214-7656
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
