import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving & Sealcoating in West Frankfort, IL',
  description: 'Professional asphalt paving, sealcoating, and pavement maintenance in West Frankfort, IL. Serving Franklin County with quality workmanship. Free estimates! Call 618-214-7656.',
};

export default function WestFrankfortPage() {
  return (
    <LocationPageLayout
      cityName="West Frankfort"
      county="Franklin County"
      distance="25 miles"
      description="Professional asphalt paving and sealcoating services for West Frankfort homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in West Frankfort, Illinois</h2>
      <p>Pinpoint Parking provides professional asphalt paving and maintenance services throughout West Frankfort and Franklin County. Whether you&apos;re a homeowner looking to upgrade your driveway or a business owner maintaining your parking lot, we deliver quality results.</p>

      <p>West Frankfort&apos;s commercial areas along Main Street and residential neighborhoods all benefit from properly maintained asphalt surfaces. We help protect your investment with professional paving and sealcoating services.</p>

      <h2>Why West Frankfort Chooses Pinpoint Parking</h2>
      <p>Local property owners trust our commitment to quality workmanship and fair pricing. We use commercial-grade materials designed to handle Southern Illinois weather while keeping costs reasonable for Franklin County families and businesses.</p>
    </LocationPageLayout>
  );
}
