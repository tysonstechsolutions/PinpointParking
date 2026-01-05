import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving & Sealcoating in Effingham, IL',
  description: 'Professional asphalt paving, sealcoating, and pavement maintenance in Effingham, IL. Serving Effingham County with quality workmanship. Free estimates! Call 618-214-7656.',
};

export default function EffinghamPage() {
  return (
    <LocationPageLayout
      cityName="Effingham"
      county="Effingham County"
      distance="45 miles"
      description="Professional asphalt paving and sealcoating services for Effingham homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Effingham, Illinois</h2>
      <p>Pinpoint Parking extends our professional asphalt paving and maintenance services to Effingham and Effingham County. Located at the crossroads of I-57 and I-70, Effingham&apos;s busy commercial areas and growing residential neighborhoods need quality pavement solutions.</p>

      <p>Whether you operate a business near the interstate, manage a retail property, or own a home in Effingham, we provide the same professional service and quality materials that have earned trust throughout Southern Illinois.</p>

      <h2>Why Effingham Chooses Pinpoint Parking</h2>
      <p>Effingham County property owners appreciate contractors who show up on time, deliver quality work, and charge fair prices. That&apos;s our commitment on every project, from simple driveway sealcoating to complete parking lot installations.</p>
    </LocationPageLayout>
  );
}
