import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Harrisburg IL ★ Saline County\'s Best | FREE Quote',
  description: '⭐ 5-Star Rated in Harrisburg! Driveways from $3/sqft. Serving Saline County businesses & homes. ✓ Licensed ✓ Insured. Call (618) 214-7656!',
  keywords: ['asphalt paving Harrisburg IL', 'driveway paving Harrisburg', 'sealcoating Harrisburg IL', 'parking lot paving Saline County'],
};

export default function HarrisburgPage() {
  return (
    <LocationPageLayout
      cityName="Harrisburg"
      county="Saline County"
      distance="40 miles"
      description="Professional asphalt paving and sealcoating services for Harrisburg homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Asphalt Services in Harrisburg, Illinois</h2>
      <p>Pinpoint Parking serves Harrisburg and Saline County with comprehensive asphalt paving and maintenance services. As the county seat and largest city in Saline County, Harrisburg&apos;s homes and businesses deserve professional pavement solutions.</p>

      <p>From residential driveways throughout Harrisburg to commercial parking lots and municipal properties, we bring quality workmanship and reliable service to every project.</p>

      <h2>Why Harrisburg Chooses Pinpoint Parking</h2>
      <p>Saline County residents appreciate contractors who deliver on their promises. We provide honest estimates, quality materials, and professional installation—ensuring your pavement investment is protected for years to come.</p>
    </LocationPageLayout>
  );
}
