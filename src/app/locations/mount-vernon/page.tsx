import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Mount Vernon IL ★★★★★ #1 Local Contractor | FREE Quote',
  description: '⭐ Mount Vernon\'s TOP-RATED paving company! Driveways from $3/sqft. ✓ Local HQ ✓ Same-week service ✓ 100% satisfaction guarantee. Call (618) 214-7656!',
  keywords: ['asphalt paving Mount Vernon IL', 'driveway paving Mount Vernon', 'sealcoating Mount Vernon IL', 'parking lot paving Jefferson County'],
  alternates: {
    canonical: 'https://pinpointparking.net/locations/mount-vernon',
  },
};

export default function MountVernonPage() {
  return (
    <LocationPageLayout
      cityName="Mount Vernon"
      county="Jefferson County"
      distance="HQ"
      description="Pinpoint Parking's home base, serving Mount Vernon with professional asphalt paving, sealcoating, and pavement maintenance."
    >
      <h2>Mount Vernon&apos;s Trusted Paving Company</h2>
      <p>Mount Vernon is home to Pinpoint Parking. Located at the crossroads of Interstate 57 and Interstate 64, Mount Vernon is our base of operations and the heart of our service area. We know Jefferson County&apos;s roads, businesses, and residential neighborhoods, and we&apos;re proud to serve our hometown with quality paving work.</p>

      <h2>Serving Mount Vernon Homes &amp; Businesses</h2>
      <p>From historic downtown to the growing commercial areas along Broadway and Veterans Memorial Drive, we work with Mount Vernon property owners of all types:</p>
      <ul>
        <li>Residential driveways throughout Mount Vernon neighborhoods</li>
        <li>Commercial parking lots for local businesses</li>
        <li>Retail center parking areas</li>
        <li>Church and school parking lots</li>
        <li>HOA and apartment complex properties</li>
        <li>Industrial and warehouse facilities</li>
      </ul>

      <h2>Local Knowledge Matters</h2>
      <p>As a Mount Vernon-based company, we understand the local challenges:</p>
      <ul>
        <li>Southern Illinois clay soils and drainage requirements</li>
        <li>Freeze-thaw cycles that stress pavement</li>
        <li>Local building codes and requirements</li>
        <li>The importance of timely service for local businesses</li>
      </ul>

      <h2>Areas We Serve Near Mount Vernon</h2>
      <p>From our Mount Vernon headquarters, we also serve nearby communities including:</p>
      <ul>
        <li>Ina</li>
        <li>Woodlawn</li>
        <li>Waltonville</li>
        <li>Opdyke</li>
        <li>Belle Rive</li>
        <li>Bluford</li>
        <li>Wayne City</li>
      </ul>
    </LocationPageLayout>
  );
}
