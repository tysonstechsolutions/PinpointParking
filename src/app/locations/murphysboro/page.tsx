import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving & Sealcoating in Murphysboro, IL',
  description: 'Professional asphalt paving, sealcoating, and pavement maintenance in Murphysboro, IL. Serving Jackson County with quality workmanship. Free estimates! Call 618-214-7656.',
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
