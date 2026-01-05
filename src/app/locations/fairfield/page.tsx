import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving & Sealcoating in Fairfield, IL',
  description: 'Professional asphalt paving, sealcoating, and pavement maintenance in Fairfield, IL. Serving Wayne County with quality workmanship. Free estimates! Call 618-214-7656.',
};

export default function FairfieldPage() {
  return (
    <LocationPageLayout
      cityName="Fairfield"
      county="Wayne County"
      distance="30 miles"
      description="Professional asphalt paving and sealcoating services for Fairfield homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Fairfield, Illinois</h2>
      <p>Pinpoint Parking provides comprehensive asphalt paving and maintenance services to Fairfield and Wayne County. As the county seat, Fairfield&apos;s residential and commercial properties benefit from professional pavement solutions that enhance curb appeal and property value.</p>

      <p>From new driveway installations in Fairfield neighborhoods to parking lot repairs for businesses along Main Street, we bring the same level of quality and attention to every project.</p>

      <h2>Why Fairfield Chooses Pinpoint Parking</h2>
      <p>Wayne County property owners trust us for our honest approach and quality workmanship. We provide detailed estimates, use proven materials, and stand behind our work.</p>
    </LocationPageLayout>
  );
}
