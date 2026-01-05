import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving & Sealcoating in Herrin, IL | Pinpoint Parking',
  description: 'Professional asphalt paving, sealcoating, and pavement services in Herrin, IL. Serving Williamson County. Free estimates!',
};

export default function HerrinPage() {
  return (
    <LocationPageLayout
      cityName="Herrin"
      county="Williamson County"
      distance="36 mi"
      description="Professional asphalt paving, sealcoating, and pavement maintenance serving Herrin and Williamson County."
    >
      <h2>Herrin&apos;s Trusted Paving Contractor</h2>
      <p>Herrin, known as the &quot;City of Herrin&quot; in Williamson County, is a community with strong local pride. Pinpoint Parking is proud to serve Herrin homes and businesses with professional paving services that stand up to Southern Illinois conditions.</p>

      <h2>Commercial Services in Herrin</h2>
      <p>Herrin&apos;s business community depends on well-maintained parking areas. We work with:</p>
      <ul>
        <li>Local retail businesses</li>
        <li>Restaurant and entertainment venues</li>
        <li>Professional offices</li>
        <li>Healthcare facilities</li>
        <li>Churches and community organizations</li>
        <li>Industrial properties</li>
      </ul>

      <h2>Residential Driveway Services</h2>
      <p>Herrin homeowners know that a well-maintained driveway adds value and curb appeal. We provide:</p>
      <ul>
        <li>New driveway installation</li>
        <li>Driveway replacement</li>
        <li>Sealcoating and protection</li>
        <li>Crack filling and repairs</li>
      </ul>

      <h2>Williamson County Service</h2>
      <p>From Herrin, we also serve neighboring communities:</p>
      <ul>
        <li>Marion</li>
        <li>Carterville</li>
        <li>Johnston City</li>
        <li>Energy</li>
        <li>Spillertown</li>
      </ul>
    </LocationPageLayout>
  );
}
