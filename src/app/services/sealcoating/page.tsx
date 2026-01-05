import type { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Sealcoating Services in Mount Vernon, IL | Driveway & Parking Lot Sealing',
  description: 'Professional asphalt sealcoating in Mount Vernon, IL and Southern Illinois. Protect your driveway or parking lot from UV damage, water, and chemicals. Free estimates! Call 618-214-7656.',
  keywords: 'sealcoating Mount Vernon IL, driveway sealing Southern Illinois, parking lot sealcoating, asphalt sealer, driveway protection',
  alternates: {
    canonical: 'https://pinpointparking.net/services/sealcoating',
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sealcoating Services",
  "description": "Professional asphalt sealcoating for driveways and parking lots in Southern Illinois. Protects against UV damage, water, and chemicals.",
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
  "serviceType": "Asphalt Sealcoating"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How often should I sealcoat my driveway?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You should sealcoat your asphalt driveway every 2-3 years for optimal protection. High-traffic commercial parking lots may need sealcoating more frequently. Regular sealcoating can double the lifespan of your asphalt."
      }
    },
    {
      "@type": "Question",
      "name": "How long does sealcoating last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A quality sealcoating application typically lasts 2-3 years depending on traffic levels, weather exposure, and the condition of the underlying asphalt. Commercial lots with heavy traffic may need recoating sooner."
      }
    },
    {
      "@type": "Question",
      "name": "When is the best time to sealcoat in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The best time to sealcoat in Southern Illinois is May through September when temperatures are consistently above 50°F and there's no rain expected for 24-48 hours. Warm, dry conditions ensure proper curing."
      }
    },
    {
      "@type": "Question",
      "name": "How long after paving can you sealcoat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You should wait at least 90 days after new asphalt installation before applying sealcoat. This allows the asphalt to fully cure and the oils to oxidize, ensuring proper adhesion of the sealcoat."
      }
    }
  ]
};

export default function SealcoatingPage() {
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
    </>
  );
}
