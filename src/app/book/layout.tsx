import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Instant Quote | Online Booking',
  description: 'Get an instant asphalt paving quote online. Our AI-powered tool measures your property and provides accurate pricing in minutes. Serving Mount Vernon & Southern Illinois.',
  keywords: 'instant paving quote, online asphalt estimate, book paving service, schedule sealcoating',
  alternates: {
    canonical: 'https://pinpointparking.net/book',
  },
  openGraph: {
    title: 'Get Instant Quote | Pinpoint Parking',
    description: 'Get an instant asphalt paving quote online. AI-powered property measurement and accurate pricing in minutes.',
    url: 'https://pinpointparking.net/book',
    type: 'website',
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
