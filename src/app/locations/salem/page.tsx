import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Salem IL ★ Marion County\'s Top Rated | FREE Quote',
  description: '⭐ 5-Star Rated in Salem! Driveways from $3/sqft. Fast 25-mile service from Mt Vernon HQ. ✓ Licensed ✓ Insured. Call (618) 214-7656!',
  keywords: ['asphalt paving Salem IL', 'driveway paving Salem', 'sealcoating Salem IL', 'parking lot paving Marion County'],
  alternates: {
    canonical: 'https://pinpointparking.net/locations/salem',
  },
};

export default function SalemPage() {
  return (
    <LocationPageLayout
      cityName="Salem"
      county="Marion County"
      distance="25 miles"
      description="Professional asphalt paving and sealcoating services for Salem homes and businesses. Quality workmanship with free estimates."
    >
      <h2>Salem&apos;s Trusted Paving Contractor</h2>
      <p>Salem, the Marion County seat and birthplace of William Jennings Bryan, is a community with deep roots and pride in property appearance. Pinpoint Parking serves Salem businesses and homeowners with professional asphalt paving that enhances curb appeal and property value.</p>

      <h2>Commercial Paving in Salem</h2>
      <p>Salem&apos;s commercial district along Broadway and Main Street depends on well-maintained parking areas. We work with:</p>
      <ul>
        <li>Downtown Salem retail and restaurant properties</li>
        <li>Salem Memorial District Hospital and medical offices</li>
        <li>Churches throughout Salem, including First Baptist and St. Mary&apos;s</li>
        <li>Salem Community High School and Bryan Elementary</li>
        <li>Auto dealerships and service centers along Route 37</li>
        <li>Industrial properties in the Salem business park</li>
      </ul>

      <h2>Residential Services in Salem</h2>
      <p>Salem homeowners trust Pinpoint Parking for driveway paving, sealcoating, and repairs. We work in all Salem neighborhoods—from the historic homes near downtown to newer developments—keeping driveways looking great.</p>

      <h2>Marion County Coverage</h2>
      <p>From Salem, we also serve surrounding Marion County communities:</p>
      <ul>
        <li>Centralia (shared with Clinton County)</li>
        <li>Kinmundy</li>
        <li>Odin</li>
        <li>Sandoval</li>
        <li>Patoka</li>
      </ul>

      <h2>Why Salem Chooses Pinpoint Parking</h2>
      <p>Salem property owners trust us because we understand local conditions. From the freeze-thaw cycles that crack pavement to the hot summers that can soften asphalt, we use commercial-grade materials and proven techniques suited for Marion County&apos;s climate. Plus, we&apos;re just 25 miles away—close enough for quick response times.</p>
    </LocationPageLayout>
  );
}
