import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Marion IL ★ Williamson County\'s Best | FREE Quote',
  description: '⭐ 5-Star Rated in Marion! Driveways from $3/sqft. Serving Williamson County businesses & homeowners. Same-week scheduling. Call (618) 214-7656!',
  keywords: ['asphalt paving Marion IL', 'driveway paving Marion', 'sealcoating Marion IL', 'parking lot paving Williamson County'],
};

export default function MarionPage() {
  return (
    <LocationPageLayout
      cityName="Marion"
      county="Williamson County"
      distance="41 mi"
      description="Professional asphalt paving, sealcoating, and pavement maintenance serving Marion and Williamson County."
    >
      <h2>Marion&apos;s Trusted Paving Professionals</h2>
      <p>Marion, the Williamson County seat and a regional hub for shopping and healthcare, has significant paving needs. From the commercial developments along Interstate 57 to residential neighborhoods throughout the city, Pinpoint Parking delivers quality work for Marion properties.</p>

      <h2>Commercial Paving in Marion</h2>
      <p>Marion&apos;s commercial growth means more parking lots need professional maintenance. We serve:</p>
      <ul>
        <li>Illinois Centre retail properties</li>
        <li>Healthcare facility parking areas</li>
        <li>Restaurant and fast-food parking lots</li>
        <li>Hotel and hospitality properties</li>
        <li>Auto dealerships and service centers</li>
        <li>Office building parking areas</li>
      </ul>

      <h2>Residential Services in Marion</h2>
      <p>Marion homeowners count on us for driveway installations, sealcoating, and repairs. We work throughout Marion&apos;s established and newer neighborhoods to keep driveways looking great and functioning properly.</p>

      <h2>Williamson County Coverage</h2>
      <p>From Marion, we also serve surrounding Williamson County communities:</p>
      <ul>
        <li>Herrin</li>
        <li>Carterville</li>
        <li>Johnston City</li>
        <li>Energy</li>
        <li>Crab Orchard</li>
      </ul>
    </LocationPageLayout>
  );
}
