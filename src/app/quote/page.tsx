import PavingChatbot from '@/components/PavingChatbot'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get a Free Quote | Instant Estimate',
  description: 'Get an instant estimate for sealcoating, asphalt paving, or line striping. Our quick booking assistant will help you measure your area and schedule a free on-site estimate.',
  alternates: {
    canonical: 'https://pinpointparking.net/quote',
  },
  openGraph: {
    title: 'Get a Free Quote | Pinpoint Parking',
    description: 'Get an instant estimate for your paving project in Southern Illinois.',
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
