import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Murphysboro IL ★ Jackson County | FREE Quote',
  description: '⭐ 5-Star Rated in Murphysboro! Driveways from $3/sqft. Near Carbondale. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Murphysboro IL', 'driveway paving Murphysboro', 'sealcoating Murphysboro IL', 'parking lot paving Jackson County'],
};

export default function MurphysboroPage() {
  return (
    <LocationPageLayout
      cityName="Murphysboro"
      county="Jackson County"
      distance="40 miles"
      description="Professional asphalt paving and sealcoating services for Murphysboro homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Murphysboro, Illinois</h2>
      <p>Pinpoint Parking provides professional asphalt paving and maintenance services throughout Murphysboro and Jackson County. As the county seat of Jackson County, Murphysboro&apos;s historic downtown, residential areas, and commercial properties all benefit from quality pavement maintenance.</p>

      <p>Whether you&apos;re a homeowner in one of Murphysboro&apos;s established neighborhoods or a business owner on Walnut Street, we deliver the professional results your property deserves.</p>

      <h2>Why Murphysboro Chooses Pinpoint Parking</h2>
      <p>Jackson County property owners trust our combination of quality workmanship, fair pricing, and reliable service. We understand the local climate and use materials designed to perform in Southern Illinois conditions.</p>
    </LocationPageLayout>
  );
}
