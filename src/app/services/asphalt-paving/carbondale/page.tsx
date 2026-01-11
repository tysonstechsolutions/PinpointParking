import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving in Carbondale, IL | Driveways & Parking Lots',
  description: 'Professional asphalt paving services in Carbondale, IL. Residential driveways, commercial parking lots, and SIU area properties. Free estimates! Call 618-214-7656.',
  keywords: 'asphalt paving Carbondale IL, driveway paving Carbondale, parking lot paving Jackson County, asphalt contractor Carbondale',
  alternates: {
    canonical: 'https://pinpointparking.net/services/asphalt-paving/carbondale',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Asphalt Paving in Carbondale, IL",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656"
  },
  "areaServed": {
    "@type": "City",
    "name": "Carbondale",
    "addressRegion": "IL"
  },
  "serviceType": "Asphalt Paving"
};

export default function AsphaltPavingCarbondalePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services">Services</Link>
            <span>/</span>
            <Link href="/services/asphalt-paving">Asphalt Paving</Link>
            <span>/</span>
            <span className="current">Carbondale</span>
          </nav>
          <h1>Asphalt Paving in Carbondale, IL</h1>
          <p>Expert asphalt paving for Carbondale homes, businesses, and university area properties. Quality work at fair prices.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Professional Asphalt Paving for Carbondale</h2>
              <p>Pinpoint Parking provides expert asphalt paving services throughout Carbondale and Jackson County. From residential driveways to commercial parking lots near SIU, we deliver quality workmanship that stands up to Southern Illinois weather.</p>

              <p>As a college town with high traffic demands, Carbondale properties need durable asphalt solutions. We use commercial-grade materials and proper installation techniques to ensure your pavement performs for years.</p>

              <h2>Carbondale Asphalt Services</h2>
              <ul>
                <li><strong>Residential Driveways:</strong> New paving and replacements for Carbondale homes</li>
                <li><strong>Commercial Parking Lots:</strong> Retail centers, restaurants, and business properties</li>
                <li><strong>Multi-Family Properties:</strong> Apartment complexes and student housing</li>
                <li><strong>University Area:</strong> Properties near SIU campus</li>
                <li><strong>Asphalt Repairs:</strong> Patching and resurfacing for existing pavement</li>
              </ul>

              <h2>Why Carbondale Property Owners Choose Us</h2>
              <ul>
                <li><strong>Experience:</strong> Professional paving for all property types</li>
                <li><strong>Quality Materials:</strong> Hot-mix asphalt built for high-traffic areas</li>
                <li><strong>Proper Drainage:</strong> Grading that prevents water damage</li>
                <li><strong>Competitive Pricing:</strong> Fair rates for Jackson County</li>
                <li><strong>Free Estimates:</strong> No-obligation quotes for your project</li>
              </ul>

              <h2>Carbondale Areas We Serve</h2>
              <p>We provide asphalt paving services throughout Carbondale, including:</p>
              <ul>
                <li>Downtown Carbondale</li>
                <li>SIU campus area</li>
                <li>Route 13 corridor</li>
                <li>Giant City Road area</li>
                <li>Murdale Shopping area</li>
              </ul>

              <h2>Get Your Free Carbondale Estimate</h2>
              <p>Ready to discuss your Carbondale paving project? Contact us today for a free estimate. We&apos;ll evaluate your property and provide honest recommendations.</p>

              <div style={{ marginTop: '32px' }}>
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Request Free Estimate
                </Link>
                <a href="tel:6182147656" className="btn btn-outline-dark btn-lg" style={{ marginLeft: '16px' }}>
                  Call (618) 214-7656
                </a>
              </div>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-cta">
                <h3>Carbondale Paving Quote</h3>
                <p>Professional asphalt paving for Jackson County properties.</p>
                <Link href="/contact" className="btn btn-primary">
                  Request Estimate
                </Link>
                <a href="tel:6182147656" className="btn btn-outline">
                  Call (618) 214-7656
                </a>
              </div>

              <div className="sidebar-services">
                <h4>Our Services</h4>
                <ul>
                  <li><Link href="/services/asphalt-paving">Asphalt Paving</Link></li>
                  <li><Link href="/services/sealcoating">Sealcoating</Link></li>
                  <li><Link href="/services/line-striping">Line Striping</Link></li>
                  <li><Link href="/services/crack-filling">Crack Filling</Link></li>
                  <li><Link href="/services/pothole-repair">Pothole Repair</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Ready for Quality Asphalt Paving in Carbondale?</h2>
          <p>Get a free, no-obligation estimate for your paving project.</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn btn-dark btn-lg">
              Request Free Estimate
            </Link>
            <a href="tel:6182147656" className="btn btn-outline-dark btn-lg">
              Call (618) 214-7656
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
