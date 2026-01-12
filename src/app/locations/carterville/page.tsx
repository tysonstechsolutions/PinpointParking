import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Carterville IL ★ 5-Star Rated | FREE Quote',
  description: '⭐ 5-Star Rated in Carterville! John A. Logan area. Driveways from $3/sqft. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Carterville IL', 'driveway paving Carterville', 'sealcoating Carterville IL', 'parking lot paving Williamson County'],
};

export default function CartervillePage() {
  return (
    <LocationPageLayout
      cityName="Carterville"
      county="Williamson County"
      distance="35 miles"
      description="Professional asphalt paving and sealcoating services for Carterville homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Carterville, Illinois</h2>
      <p>Pinpoint Parking serves Carterville and Williamson County with professional asphalt paving and maintenance services. This growing community near Carbondale features quality residential neighborhoods and thriving businesses that deserve professional pavement solutions.</p>

      <p>From new construction driveways in Carterville&apos;s expanding subdivisions to parking lot maintenance for retail centers along Route 13, our team delivers results that last.</p>

      <h2>Why Carterville Chooses Pinpoint Parking</h2>
      <p>Williamson County residents value quality and reliability. We bring professional-grade materials and experienced workmanship to every Carterville project, ensuring your investment is protected for years to come.</p>
    </LocationPageLayout>
  );
}
