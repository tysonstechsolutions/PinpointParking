import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Benton IL ★ Franklin County\'s Best | FREE Quote',
  description: '⭐ 5-Star Rated in Benton! Only 20 miles from HQ. Driveways from $3/sqft. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Benton IL', 'driveway paving Benton', 'sealcoating Benton IL', 'parking lot paving Franklin County'],
  alternates: {
    canonical: 'https://pinpointparking.net/locations/benton',
  },
};

export default function BentonPage() {
  return (
    <LocationPageLayout
      cityName="Benton"
      county="Franklin County"
      distance="20 miles"
      description="Professional asphalt paving and sealcoating services for Benton homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Benton&apos;s Trusted Paving Partner</h2>
      <p>Benton, the Franklin County seat and gateway to Rend Lake, is a thriving Southern Illinois community. Pinpoint Parking proudly serves Benton businesses and homeowners with professional asphalt paving that stands up to local weather conditions.</p>

      <h2>Commercial Paving in Benton</h2>
      <p>Benton&apos;s commercial areas along Main Street and near the courthouse square depend on quality pavement. We work with:</p>
      <ul>
        <li>Downtown Benton retail shops and restaurants</li>
        <li>Franklin County government and courthouse facilities</li>
        <li>Benton Consolidated High School and local schools</li>
        <li>Churches throughout Benton</li>
        <li>Medical offices and clinics</li>
        <li>Banks and financial institutions</li>
        <li>Rend Lake-area tourism businesses</li>
      </ul>

      <h2>Residential Services in Benton</h2>
      <p>Benton homeowners trust Pinpoint Parking for driveway installations, sealcoating, and repairs. We work throughout Benton&apos;s neighborhoods—whether you&apos;re near the town square or in the outskirts toward Rend Lake—to keep your driveway looking great.</p>

      <h2>Franklin County Coverage</h2>
      <p>From Benton, we also serve surrounding Franklin County communities:</p>
      <ul>
        <li>West Frankfort</li>
        <li>Zeigler</li>
        <li>Christopher</li>
        <li>Sesser</li>
        <li>Ewing</li>
        <li>Rend Lake resort area</li>
      </ul>

      <h2>Why Benton Chooses Pinpoint Parking</h2>
      <p>At just 20 miles from our Mount Vernon headquarters, Benton gets fast response times and competitive pricing. We understand Franklin County&apos;s clay soils and drainage challenges, using proper base preparation and materials designed to last through Southern Illinois weather extremes.</p>
    </LocationPageLayout>
  );
}
