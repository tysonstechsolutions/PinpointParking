import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Free Asphalt Paving Estimates',
  description: 'Get a free asphalt paving estimate within 24 hours. Contact Pinpoint Parking for driveways, parking lots, sealcoating & repairs in Mount Vernon & Southern Illinois. Call (618) 214-7656.',
  keywords: 'contact asphalt paving, free estimate Mount Vernon IL, paving quote Southern Illinois, asphalt contractor phone number',
  alternates: {
    canonical: 'https://pinpointparking.net/contact',
  },
  openGraph: {
    title: 'Contact Pinpoint Parking | Free Estimates',
    description: 'Get a free asphalt paving estimate within 24 hours. Professional paving, sealcoating & repairs in Southern Illinois.',
    url: 'https://pinpointparking.net/contact',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
