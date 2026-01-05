import type { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Line Striping Services | Pinpoint Parking',
  description: 'Professional parking lot striping and pavement marking services in Mount Vernon, IL and Southern Illinois. ADA compliant layouts.',
};

export default function LineStripingPage() {
  return (
    <ServicePageLayout
      title="Line Striping"
      description="ADA-compliant parking lot striping, traffic markings, and custom layouts. Crisp, visible lines that last."
      currentService="line-striping"
    >
      <h2>Professional Line Striping Services</h2>
      <p>Clear, visible pavement markings are essential for safe, organized parking lots. Pinpoint Parking provides professional line striping services that meet ADA requirements and local codes while maximizing your parking capacity.</p>

      <h2>Our Line Striping Services</h2>
      <ul>
        <li><strong>Parking Space Lines:</strong> Standard and compact car spaces with proper dimensions</li>
        <li><strong>ADA Accessible Spaces:</strong> Compliant handicap parking with proper signage requirements</li>
        <li><strong>Fire Lanes:</strong> Clearly marked no-parking zones for emergency access</li>
        <li><strong>Directional Arrows:</strong> Traffic flow guidance for safer parking lots</li>
        <li><strong>Stop Bars and Crosswalks:</strong> Pedestrian safety markings</li>
        <li><strong>Loading Zones:</strong> Designated areas for deliveries and pickups</li>
        <li><strong>Custom Stenciling:</strong> Reserved spaces, logos, and special markings</li>
        <li><strong>Curb Painting:</strong> Yellow curbs, red zones, and other curb markings</li>
      </ul>

      <h2>ADA Compliance</h2>
      <p>ADA (Americans with Disabilities Act) compliance isn&apos;t optional—it&apos;s the law. We ensure your parking lot meets current accessibility requirements:</p>
      <ul>
        <li>Proper number of accessible spaces based on lot size</li>
        <li>Correct dimensions for van-accessible spaces</li>
        <li>Access aisles with proper striping</li>
        <li>Required signage specifications</li>
        <li>Accessible route markings</li>
      </ul>

      <h2>When to Re-Stripe</h2>
      <p>Parking lot markings fade over time due to traffic, weather, and UV exposure. Consider re-striping when:</p>
      <ul>
        <li>Lines are difficult to see, especially at night or in rain</li>
        <li>After sealcoating (striping is always needed after sealcoating)</li>
        <li>When updating your lot layout</li>
        <li>To correct ADA compliance issues</li>
        <li>Every 18-24 months for high-traffic commercial lots</li>
      </ul>

      <h2>Our Striping Process</h2>
      <ul>
        <li><strong>Layout Planning:</strong> We work with you to optimize parking capacity and traffic flow</li>
        <li><strong>Surface Preparation:</strong> Clean surfaces for proper paint adhesion</li>
        <li><strong>Quality Paint:</strong> Traffic-grade paint designed for durability</li>
        <li><strong>Precision Application:</strong> Straight lines and consistent widths</li>
        <li><strong>Quick Drying:</strong> Fast-dry formulas minimize lot closure time</li>
      </ul>

      <h2>Commercial Striping Services</h2>
      <p>We work with businesses and property managers throughout Southern Illinois:</p>
      <ul>
        <li>Retail parking lots</li>
        <li>Office building parking</li>
        <li>Restaurant parking areas</li>
        <li>Church and school parking lots</li>
        <li>Apartment and condo complexes</li>
        <li>Industrial and warehouse facilities</li>
        <li>HOA common areas</li>
      </ul>

      <h2>Scheduling</h2>
      <p>We understand that striping means temporarily closing parking areas. We offer flexible scheduling including evenings and weekends to minimize disruption to your business.</p>

      <h2>Service Area</h2>
      <p>We provide line striping services throughout Southern Illinois, including Mount Vernon, Carbondale, Marion, Centralia, Salem, Herrin, and all communities within a 45-mile radius.</p>
    </ServicePageLayout>
  );
}
