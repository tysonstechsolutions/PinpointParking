import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Carbondale IL ★ SIU Area\'s #1 Contractor | FREE Quote',
  description: '⭐ 5-Star Rated in Carbondale! Driveways from $3/sqft. Serving SIU, businesses & residents. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Carbondale IL', 'driveway paving Carbondale', 'sealcoating Carbondale IL', 'parking lot paving Jackson County'],
};

export default function CarbondalePage() {
  return (
    <LocationPageLayout
      cityName="Carbondale"
      county="Jackson County"
      distance="44 mi"
      description="Professional asphalt paving, sealcoating, and pavement maintenance serving Carbondale and the SIU community."
    >
      <h2>Carbondale&apos;s Professional Paving Partner</h2>
      <p>Carbondale, home to Southern Illinois University, is a vibrant community with diverse paving needs. From the bustling commercial strips along Illinois Route 13 to residential neighborhoods and university-adjacent properties, Pinpoint Parking serves Carbondale with the same quality work we bring to every job.</p>

      <h2>Serving the SIU Community</h2>
      <p>With thousands of students, faculty, and staff, the SIU area has unique paving demands. We work with:</p>
      <ul>
        <li>Student housing complexes and apartment communities</li>
        <li>Off-campus commercial properties</li>
        <li>Local businesses along the commercial corridors</li>
        <li>Residential properties throughout Carbondale</li>
        <li>Churches, restaurants, and retail centers</li>
      </ul>

      <h2>Commercial Paving in Carbondale</h2>
      <p>Carbondale&apos;s commercial areas see heavy traffic year-round. We help business owners maintain professional, safe parking areas that make a great first impression on customers.</p>

      <h2>Residential Services</h2>
      <p>Carbondale homeowners trust Pinpoint Parking for driveway paving, sealcoating, and repairs. We work in all Carbondale neighborhoods to keep residential properties looking their best.</p>

      <h2>Nearby Areas We Serve</h2>
      <p>In addition to Carbondale, we serve nearby Jackson County communities including:</p>
      <ul>
        <li>Murphysboro</li>
        <li>De Soto</li>
        <li>Makanda</li>
        <li>Carterville (Williamson County)</li>
      </ul>
    </LocationPageLayout>
  );
}
