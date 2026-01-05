import type { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Asphalt Paving Services in Mount Vernon, IL | Driveways & Parking Lots',
  description: 'Professional asphalt paving for driveways, parking lots, and roads in Mount Vernon, IL and Southern Illinois. Quality hot-mix asphalt, expert installation. Free estimates! Call 618-214-7656.',
  keywords: 'asphalt paving Mount Vernon IL, driveway paving Southern Illinois, parking lot paving, asphalt contractor, new driveway installation',
  alternates: {
    canonical: 'https://pinpointparking.net/services/asphalt-paving',
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Asphalt Paving Services",
  "description": "Professional asphalt paving for driveways, parking lots, and roads in Southern Illinois. Quality hot-mix asphalt and expert installation.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mount Vernon",
      "addressRegion": "IL"
    }
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "38.3173",
      "longitude": "-88.9031"
    },
    "geoRadius": "72000"
  },
  "serviceType": "Asphalt Paving",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "USD"
    }
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does asphalt paving cost in Southern Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Asphalt paving in Southern Illinois typically costs $3-$7 per square foot for residential driveways, depending on size, site conditions, base work required, and thickness. Commercial projects are priced based on specific requirements. Contact Pinpoint Parking for a free detailed estimate."
      }
    },
    {
      "@type": "Question",
      "name": "How long does an asphalt driveway last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A properly installed asphalt driveway lasts 20-30 years with regular maintenance. This includes crack filling as needed and sealcoating every 2-3 years. Without maintenance, lifespan may be reduced to 12-15 years."
      }
    },
    {
      "@type": "Question",
      "name": "What is the best time of year to pave a driveway?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The best time to pave in Southern Illinois is late spring through early fall (May-October) when temperatures are consistently above 50°F. Asphalt requires warm temperatures for proper compaction and curing."
      }
    },
    {
      "@type": "Question",
      "name": "How thick should asphalt be for a residential driveway?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Residential driveways typically need 2-3 inches of asphalt over a properly prepared 6-8 inch aggregate base. Commercial parking lots require 3-4 inches or more depending on expected traffic and vehicle weight."
      }
    }
  ]
};

export default function AsphaltPavingPage() {
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
      title="Asphalt Paving"
      description="Professional asphalt paving for driveways, parking lots, and roads. Quality materials and expert installation that lasts."
      currentService="asphalt-paving"
    >
      <h2>Professional Asphalt Paving Services</h2>
      <p>Whether you need a new residential driveway or a complete commercial parking lot, Pinpoint Parking delivers professional asphalt paving that stands up to Southern Illinois weather and heavy use. We handle projects of all sizes with the same attention to detail and commitment to quality.</p>

      <h2>Our Asphalt Paving Process</h2>
      <p>Proper installation is the key to long-lasting asphalt. Our process ensures your new pavement performs for years:</p>
      <ul>
        <li><strong>Site Assessment:</strong> We evaluate soil conditions, drainage needs, and existing surfaces</li>
        <li><strong>Base Preparation:</strong> Proper grading and compaction of the aggregate base</li>
        <li><strong>Drainage Planning:</strong> Ensuring water flows away from structures and doesn&apos;t pool</li>
        <li><strong>Quality Materials:</strong> Hot-mix asphalt from trusted local suppliers</li>
        <li><strong>Professional Installation:</strong> Proper compaction and finishing for a smooth, durable surface</li>
        <li><strong>Edge Work:</strong> Clean, defined edges that resist crumbling</li>
      </ul>

      <h2>Residential Asphalt Services</h2>
      <p>Your driveway is one of the first things people notice about your home. We install new driveways that enhance your property&apos;s curb appeal and value:</p>
      <ul>
        <li>New driveway installation</li>
        <li>Driveway replacement</li>
        <li>Driveway extensions and widening</li>
        <li>Apron repairs and replacements</li>
        <li>Private road paving</li>
      </ul>

      <h2>Commercial Asphalt Services</h2>
      <p>First impressions matter for your business. We work with property managers, business owners, and municipalities to create functional, attractive parking areas:</p>
      <ul>
        <li>New parking lot construction</li>
        <li>Parking lot replacement</li>
        <li>Access roads and drive lanes</li>
        <li>Loading dock areas</li>
        <li>Multi-tenant property paving</li>
        <li>Church, school, and municipal projects</li>
      </ul>

      <h2>Why Choose Pinpoint Parking for Asphalt Paving?</h2>
      <ul>
        <li><strong>Quality Materials:</strong> We use commercial-grade hot-mix asphalt designed for our climate</li>
        <li><strong>Proper Preparation:</strong> We don&apos;t cut corners on base work—it&apos;s the foundation of lasting pavement</li>
        <li><strong>Experienced Crews:</strong> Our team knows how to handle Southern Illinois soil conditions</li>
        <li><strong>Transparent Pricing:</strong> Detailed quotes with no hidden costs</li>
        <li><strong>On-Time Completion:</strong> We respect your schedule and minimize disruption</li>
      </ul>

      <h2>Asphalt Paving Cost</h2>
      <p>Asphalt paving costs in Southern Illinois typically range from $3-$7 per square foot for residential projects, depending on:</p>
      <ul>
        <li>Size of the project</li>
        <li>Current site conditions</li>
        <li>Amount of base work required</li>
        <li>Accessibility and location</li>
        <li>Thickness requirements</li>
      </ul>
      <p>Commercial projects are priced based on the specific requirements of each job. Contact us for a free, detailed estimate for your project.</p>

      <h2>Service Area</h2>
      <p>We provide asphalt paving services throughout Southern Illinois, including Mount Vernon, Carbondale, Marion, Centralia, Salem, Herrin, and all communities within a 45-mile radius of Mount Vernon.</p>
    </ServicePageLayout>
    </>
  );
}
