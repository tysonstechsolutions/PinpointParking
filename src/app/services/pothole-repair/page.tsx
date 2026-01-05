import type { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Pothole Repair Services | Pinpoint Parking',
  description: 'Fast, permanent pothole repairs in Mount Vernon, IL and Southern Illinois. Same-week service available for hazardous potholes.',
};

export default function PotholeRepairPage() {
  return (
    <ServicePageLayout
      title="Pothole Repair"
      description="Fast, permanent pothole repairs that eliminate hazards and restore smooth surfaces. Same-week service available."
      currentService="pothole-repair"
    >
      <h2>Professional Pothole Repair Services</h2>
      <p>Potholes aren&apos;t just ugly—they&apos;re hazardous. They damage vehicles, create liability risks, and quickly grow larger if left unrepaired. Pinpoint Parking provides fast, permanent pothole repairs that restore safety and smooth surfaces to your property.</p>

      <h2>The Problem with Potholes</h2>
      <p>Potholes create serious issues for property owners:</p>
      <ul>
        <li><strong>Vehicle Damage:</strong> Tire, wheel, and suspension damage from hitting potholes</li>
        <li><strong>Liability Risk:</strong> Property owners can be held responsible for vehicle and pedestrian injuries</li>
        <li><strong>Rapid Growth:</strong> Potholes grow quickly as edges break down and water erodes the base</li>
        <li><strong>Poor Appearance:</strong> Potholes make properties look neglected and unprofessional</li>
        <li><strong>Expensive Repairs:</strong> The longer you wait, the more extensive (and costly) repairs become</li>
      </ul>

      <h2>Our Pothole Repair Methods</h2>
      <p>We use proven methods for lasting repairs:</p>

      <h3>Throw-and-Roll (Cold Patch)</h3>
      <ul>
        <li>Quick, temporary solution for emergency situations</li>
        <li>Ideal for winter repairs when hot mix isn&apos;t available</li>
        <li>Good for small potholes requiring immediate attention</li>
      </ul>

      <h3>Semi-Permanent Repair</h3>
      <ul>
        <li>Clean and square the pothole edges</li>
        <li>Remove water and debris</li>
        <li>Apply tack coat for adhesion</li>
        <li>Fill with hot-mix asphalt</li>
        <li>Compact for a smooth, level surface</li>
      </ul>

      <h3>Full-Depth Repair</h3>
      <ul>
        <li>For severely damaged areas with base failure</li>
        <li>Remove failed asphalt and base material</li>
        <li>Rebuild base with proper aggregates</li>
        <li>Install new hot-mix asphalt</li>
        <li>Compact and seal edges</li>
      </ul>

      <h2>Why Potholes Form</h2>
      <p>Understanding causes helps prevent future problems:</p>
      <ul>
        <li><strong>Water Infiltration:</strong> Water enters through cracks and weakens the base</li>
        <li><strong>Freeze-Thaw Cycles:</strong> Water expands when frozen, breaking apart asphalt</li>
        <li><strong>Heavy Traffic:</strong> Repeated stress causes pavement fatigue</li>
        <li><strong>Poor Drainage:</strong> Standing water accelerates deterioration</li>
        <li><strong>Deferred Maintenance:</strong> Ignored cracks eventually become potholes</li>
      </ul>

      <h2>Same-Week Service Available</h2>
      <p>We understand that potholes are urgent problems. For hazardous potholes creating immediate safety concerns, we offer same-week service when possible. Contact us to discuss your situation.</p>

      <h2>Preventing Future Potholes</h2>
      <p>After repairing your potholes, consider these preventive measures:</p>
      <ul>
        <li>Regular crack filling to prevent water infiltration</li>
        <li>Sealcoating every 2-3 years for surface protection</li>
        <li>Proper drainage to direct water away from pavement</li>
        <li>Regular inspections to catch problems early</li>
      </ul>

      <h2>Residential &amp; Commercial Service</h2>
      <p>We repair potholes for all property types:</p>
      <ul>
        <li>Residential driveways</li>
        <li>Commercial parking lots</li>
        <li>HOA and apartment complex properties</li>
        <li>Church and school parking areas</li>
        <li>Private roads</li>
        <li>Industrial facilities</li>
      </ul>

      <h2>Service Area</h2>
      <p>We provide pothole repair services throughout Southern Illinois, including Mount Vernon, Carbondale, Marion, Centralia, Salem, Herrin, and all communities within a 45-mile radius.</p>
    </ServicePageLayout>
  );
}
