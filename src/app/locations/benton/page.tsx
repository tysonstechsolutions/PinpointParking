import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Benton IL ★ Franklin County\'s Best | FREE Quote',
  description: '⭐ 5-Star Rated in Benton! Only 20 miles from HQ. Driveways from $3/sqft. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Benton IL', 'driveway paving Benton', 'sealcoating Benton IL', 'parking lot paving Franklin County'],
};

export default function BentonPage() {
  return (
    <LocationPageLayout
      cityName="Benton"
      county="Franklin County"
      distance="20 miles"
      description="Professional asphalt paving and sealcoating services for Benton homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Benton, Illinois</h2>
      <p>Pinpoint Parking proudly serves Benton and Franklin County with comprehensive asphalt paving and maintenance services. As the county seat of Franklin County, Benton businesses and homeowners deserve quality pavement that enhances property value and curb appeal.</p>

      <p>From residential driveways in Benton neighborhoods to commercial parking lots near the Franklin County Courthouse, we deliver professional results that last.</p>

      <h2>Why Benton Chooses Pinpoint Parking</h2>
      <p>Our team understands Franklin County&apos;s needs. We provide honest assessments, competitive pricing, and quality materials designed to withstand Southern Illinois weather conditions year after year.</p>
    </LocationPageLayout>
  );
}
