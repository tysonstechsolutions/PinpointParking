import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Nashville IL ★ Washington County | FREE Quote',
  description: '⭐ 5-Star Rated in Nashville! Driveways from $3/sqft. Fast 30-mile service. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Nashville IL', 'driveway paving Nashville', 'sealcoating Nashville IL', 'parking lot paving Washington County'],
};

export default function NashvillePage() {
  return (
    <LocationPageLayout
      cityName="Nashville"
      county="Washington County"
      distance="30 miles"
      description="Professional asphalt paving and sealcoating services for Nashville homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Nashville, Illinois</h2>
      <p>Pinpoint Parking proudly serves Nashville and Washington County with professional asphalt paving and maintenance services. As the county seat of Washington County, Nashville&apos;s homes and businesses deserve quality pavement that stands the test of time.</p>

      <p>Whether you need driveway paving for your Nashville residence, parking lot maintenance for businesses on the square, or sealcoating for commercial properties, our experienced team delivers dependable results.</p>

      <h2>Why Nashville Chooses Pinpoint Parking</h2>
      <p>Washington County residents value quality and integrity. That&apos;s exactly what we deliver—professional workmanship, honest estimates, and materials built to handle Southern Illinois seasons.</p>
    </LocationPageLayout>
  );
}
