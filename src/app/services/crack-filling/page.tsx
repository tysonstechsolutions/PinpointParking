import type { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Crack Filling & Sealing in Mount Vernon, IL | Asphalt Repair',
  description: 'Professional asphalt crack filling and sealing in Mount Vernon, IL and Southern Illinois. Prevent potholes and costly repairs. Free estimates! Call 618-214-7656.',
  keywords: 'crack filling Mount Vernon IL, asphalt crack sealing Southern Illinois, crack repair, driveway crack filling, parking lot crack repair',
  alternates: {
    canonical: 'https://pinpointparking.net/services/crack-filling',
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Crack Filling Services",
  "description": "Professional asphalt crack filling and sealing. Prevents water infiltration and costly repairs.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": { "@type": "GeoCoordinates", "latitude": "38.3173", "longitude": "-88.9031" },
    "geoRadius": "72000"
  },
  "serviceType": "Asphalt Crack Filling"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does crack filling cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Professional hot-pour crack filling typically costs $0.50-$1.50 per linear foot. DIY cold-pour products cost $10-$30 but only last 1-2 years compared to 3-5+ years for professional repairs."
      }
    },
    {
      "@type": "Question",
      "name": "Can I fill driveway cracks myself?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Small cracks under 1/4 inch can be filled with DIY products, but results are temporary. Professional hot-pour crack sealing provides longer-lasting repairs and is necessary for larger cracks or alligator cracking."
      }
    },
    {
      "@type": "Question",
      "name": "When should asphalt cracks be filled?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cracks should be filled as soon as you notice them—before water can infiltrate and cause base damage. The best time is spring or fall before winter freeze-thaw cycles cause further deterioration."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between crack filling and crack sealing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Crack filling is used for non-working cracks with minimal movement. Crack sealing involves routing the crack wider and using rubberized materials for working cracks that expand and contract with temperature changes."
      }
    }
  ]
};

export default function CrackFillingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ServicePageLayout
      title="Crack Filling"
      description="Stop cracks before they spread. Professional crack sealing prevents water infiltration and costly repairs."
      currentService="crack-filling"
    >
      <h2>Professional Crack Filling Services</h2>
      <p>Cracks in your asphalt might seem minor, but they&apos;re the beginning of serious damage. Water enters through cracks, erodes the base, and leads to potholes and pavement failure. Timely crack filling is one of the most important maintenance steps you can take to protect your asphalt investment.</p>

      <h2>Why Crack Filling Matters</h2>
      <p>Left untreated, even small cracks become major problems:</p>
      <ul>
        <li><strong>Water Infiltration:</strong> Water seeps through cracks into the base material</li>
        <li><strong>Base Erosion:</strong> Water undermines the foundation of your pavement</li>
        <li><strong>Freeze-Thaw Damage:</strong> Water expands when frozen, widening cracks and creating new ones</li>
        <li><strong>Vegetation Growth:</strong> Weeds and grass grow through cracks, expanding the damage</li>
        <li><strong>Pothole Formation:</strong> Undermined asphalt eventually collapses into potholes</li>
        <li><strong>Accelerated Deterioration:</strong> Small cracks quickly become large cracks without treatment</li>
      </ul>

      <h2>Types of Cracks We Repair</h2>
      <ul>
        <li><strong>Linear Cracks:</strong> Straight cracks that follow traffic patterns or joints</li>
        <li><strong>Alligator Cracks:</strong> Interconnected cracks resembling reptile skin (may indicate base failure)</li>
        <li><strong>Edge Cracks:</strong> Cracks along the edges of pavement</li>
        <li><strong>Block Cracks:</strong> Large rectangular crack patterns</li>
        <li><strong>Reflective Cracks:</strong> Cracks that mirror underlying pavement joints</li>
      </ul>

      <h2>Our Crack Filling Process</h2>
      <ul>
        <li><strong>Assessment:</strong> We evaluate crack severity and underlying causes</li>
        <li><strong>Cleaning:</strong> Remove dirt, debris, and vegetation from cracks</li>
        <li><strong>Routing (if needed):</strong> Widen cracks for better sealant adhesion on larger repairs</li>
        <li><strong>Hot-Pour Application:</strong> Apply heated rubberized crack sealant for flexible, lasting repairs</li>
        <li><strong>Smoothing:</strong> Level sealant for a clean finish</li>
        <li><strong>Curing:</strong> Allow proper cure time before traffic</li>
      </ul>

      <h2>Crack Filling vs. Crack Sealing</h2>
      <p>While often used interchangeably, there&apos;s a difference:</p>
      <ul>
        <li><strong>Crack Filling:</strong> Used for non-working cracks (minimal movement). Standard repair method.</li>
        <li><strong>Crack Sealing:</strong> Used for working cracks that expand and contract. Includes routing for better adhesion.</li>
      </ul>
      <p>We&apos;ll recommend the right approach based on your specific situation.</p>

      <h2>When to Fill Cracks</h2>
      <ul>
        <li>As soon as you notice them—don&apos;t wait for them to grow</li>
        <li>Before sealcoating (cracks should be filled first)</li>
        <li>In spring or fall when temperatures are moderate</li>
        <li>Before winter to prevent freeze-thaw damage</li>
      </ul>

      <h2>Residential &amp; Commercial Service</h2>
      <p>We provide crack filling for all property types:</p>
      <ul>
        <li>Residential driveways</li>
        <li>Commercial parking lots</li>
        <li>HOA and apartment complex driveways</li>
        <li>Church and school parking areas</li>
        <li>Private roads</li>
      </ul>

      <h2>Service Area</h2>
      <p>We provide crack filling services throughout Southern Illinois, including Mount Vernon, Carbondale, Marion, Centralia, Salem, Herrin, and all communities within a 45-mile radius.</p>
    </ServicePageLayout>
    </>
  );
}
