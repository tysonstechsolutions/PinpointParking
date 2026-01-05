import type { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Sealcoating Services | Pinpoint Parking',
  description: 'Professional asphalt sealcoating in Mount Vernon, IL and Southern Illinois. Protect your driveway or parking lot from UV damage, water, and chemicals.',
};

export default function SealcoatingPage() {
  return (
    <ServicePageLayout
      title="Sealcoating"
      description="Protect and extend the life of your asphalt with professional sealcoating. Guards against UV rays, water, and chemicals."
      currentService="sealcoating"
    >
      <h2>Professional Sealcoating Services</h2>
      <p>Sealcoating is one of the most cost-effective ways to protect your asphalt investment. A quality sealcoat acts as a barrier against the elements, prevents oxidation, and restores that fresh, dark appearance that makes your property look its best.</p>

      <h2>Why Sealcoat Your Asphalt?</h2>
      <p>Asphalt is constantly under attack from sun, rain, ice, oil, and traffic. Sealcoating provides critical protection:</p>
      <ul>
        <li><strong>UV Protection:</strong> Blocks harmful sun rays that cause asphalt to become brittle and crack</li>
        <li><strong>Water Resistance:</strong> Prevents water infiltration that leads to base damage and potholes</li>
        <li><strong>Chemical Protection:</strong> Guards against oil, gasoline, and other vehicle fluids</li>
        <li><strong>Freeze-Thaw Resistance:</strong> Reduces water penetration that causes damage during Southern Illinois winters</li>
        <li><strong>Enhanced Appearance:</strong> Restores the rich, dark color of new asphalt</li>
        <li><strong>Extended Lifespan:</strong> Regular sealcoating can double the life of your asphalt</li>
      </ul>

      <h2>Our Sealcoating Process</h2>
      <p>Proper application is essential for effective sealcoating. Our process ensures maximum protection:</p>
      <ul>
        <li><strong>Surface Cleaning:</strong> Thorough cleaning to remove dirt, debris, and vegetation</li>
        <li><strong>Crack Repair:</strong> Fill all cracks to prevent water infiltration (recommended before sealcoating)</li>
        <li><strong>Oil Spot Treatment:</strong> Prime oil-stained areas for better adhesion</li>
        <li><strong>Quality Materials:</strong> Commercial-grade coal tar or asphalt emulsion sealers</li>
        <li><strong>Proper Application:</strong> Even coverage using professional spray equipment</li>
        <li><strong>Curing Time:</strong> Adequate drying time before opening to traffic</li>
      </ul>

      <h2>When to Sealcoat</h2>
      <p>Timing matters for sealcoating success:</p>
      <ul>
        <li><strong>New Asphalt:</strong> Wait at least 90 days after installation before first sealcoat</li>
        <li><strong>Maintenance Schedule:</strong> Every 2-3 years for optimal protection</li>
        <li><strong>Season:</strong> Best applied when temperatures are consistently above 50°F (typically May through September in Southern Illinois)</li>
        <li><strong>Weather:</strong> Requires 24-48 hours of dry weather for proper curing</li>
      </ul>

      <h2>Residential Sealcoating</h2>
      <p>Protect your home&apos;s driveway and add curb appeal:</p>
      <ul>
        <li>Driveway sealcoating</li>
        <li>Private road sealcoating</li>
        <li>Crack filling and sealing</li>
        <li>Edge sealing and repair</li>
      </ul>

      <h2>Commercial Sealcoating</h2>
      <p>Maintain your business property&apos;s professional appearance:</p>
      <ul>
        <li>Parking lot sealcoating</li>
        <li>HOA and apartment complex driveways</li>
        <li>Church and school parking areas</li>
        <li>Retail center parking lots</li>
        <li>After-hours and weekend scheduling available</li>
      </ul>

      <h2>Sealcoating Cost</h2>
      <p>Sealcoating is highly affordable compared to the cost of asphalt replacement. Residential driveways in Southern Illinois typically cost $0.15-$0.30 per square foot. Commercial pricing depends on lot size and condition. Contact us for a free estimate.</p>

      <h2>Service Area</h2>
      <p>We provide sealcoating services throughout Southern Illinois, including Mount Vernon, Carbondale, Marion, Centralia, Salem, Herrin, and all communities within a 45-mile radius.</p>
    </ServicePageLayout>
  );
}
