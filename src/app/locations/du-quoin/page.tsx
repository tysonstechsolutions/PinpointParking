import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Du Quoin IL ★ Perry County\'s #1 | FREE Quote',
  description: '⭐ 5-Star Rated in Du Quoin! State Fairgrounds area. Driveways from $3/sqft. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Du Quoin IL', 'driveway paving Du Quoin', 'sealcoating Du Quoin IL', 'parking lot paving Perry County'],
};

export default function DuQuoinPage() {
  return (
    <LocationPageLayout
      cityName="Du Quoin"
      county="Perry County"
      distance="30 miles"
      description="Professional asphalt paving and sealcoating services for Du Quoin homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Du Quoin, Illinois</h2>
      <p>Pinpoint Parking serves Du Quoin and Perry County with expert asphalt paving and maintenance services. Known for the Du Quoin State Fair, this community deserves quality pavement solutions that make a lasting impression on residents and visitors alike.</p>

      <p>From driveways in Du Quoin&apos;s historic neighborhoods to commercial properties along Route 51, we provide professional paving services tailored to your needs and budget.</p>

      <h2>Why Du Quoin Chooses Pinpoint Parking</h2>
      <p>Perry County property owners appreciate our straightforward approach—quality materials, professional installation, and honest pricing. We treat every project with the same care, whether it&apos;s a small driveway or a large commercial lot.</p>
    </LocationPageLayout>
  );
}
