import type { Metadata } from 'next';
import LocationPageLayout from '@/components/LocationPageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Centralia IL ★ Only 19 Miles Away | FREE Quote',
  description: '⭐ 5-Star Rated! Fast service to Centralia (19 mi from HQ). Driveways from $3/sqft. ✓ Licensed ✓ Insured. Call (618) 214-7656 for FREE quote!',
  keywords: ['asphalt paving Centralia IL', 'driveway paving Centralia', 'sealcoating Centralia IL', 'parking lot paving Marion County'],
};

export default function CentraliaPage() {
  return (
    <LocationPageLayout
      cityName="Centralia"
      county="Marion County"
      distance="19 mi"
      description="Professional asphalt paving, sealcoating, and pavement maintenance serving Centralia and Marion County."
    >
      <h2>Centralia&apos;s Professional Paving Service</h2>
      <p>Centralia, with its rich railroad heritage and central location, is just 19 miles from our Mount Vernon headquarters. This makes us ideally positioned to serve Centralia homes and businesses with fast, responsive paving service.</p>

      <h2>Serving Centralia Businesses</h2>
      <p>Centralia&apos;s downtown district and commercial areas need well-maintained parking. We work with local businesses to keep their lots professional and safe:</p>
      <ul>
        <li>Downtown business parking areas</li>
        <li>Strip mall and shopping center lots</li>
        <li>Healthcare and medical facility parking</li>
        <li>Restaurant and retail parking</li>
        <li>Industrial facility paving</li>
      </ul>

      <h2>Residential Paving in Centralia</h2>
      <p>Centralia homeowners trust us for quality driveway work. Whether you need a new installation, sealcoating to protect your existing driveway, or repairs, we&apos;re here to help.</p>

      <h2>Quick Response Time</h2>
      <p>At just 19 miles from our base, Centralia customers enjoy some of our fastest response times. Need an estimate? We can often schedule same-week visits.</p>

      <h2>Nearby Communities</h2>
      <p>We also serve these Marion County communities near Centralia:</p>
      <ul>
        <li>Salem</li>
        <li>Sandoval</li>
        <li>Odin</li>
        <li>Kinmundy</li>
      </ul>
    </LocationPageLayout>
  );
}
