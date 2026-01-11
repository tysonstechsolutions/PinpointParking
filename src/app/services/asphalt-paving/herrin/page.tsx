import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving in Herrin, IL | Driveways & Parking Lots',
  description: 'Professional asphalt paving services in Herrin, IL. Residential driveways, commercial parking lots, and repairs. Williamson County contractor. Free estimates! Call 618-214-7656.',
  keywords: 'asphalt paving Herrin IL, driveway paving Herrin, parking lot paving Williamson County, asphalt contractor Herrin Illinois',
  alternates: {
    canonical: 'https://pinpointparking.net/services/asphalt-paving/herrin',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Asphalt Paving in Herrin, IL",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656"
  },
  "areaServed": {
    "@type": "City",
    "name": "Herrin",
    "addressRegion": "IL"
  },
  "serviceType": "Asphalt Paving"
};

export default function AsphaltPavingHerrinPage() {
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
            <span className="current">Herrin</span>
          </nav>
          <h1>Asphalt Paving in Herrin, IL</h1>
          <p>Quality asphalt paving for Herrin homes and businesses. Professional service from a trusted Southern Illinois contractor.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Professional Asphalt Paving for Herrin</h2>
              <p>Pinpoint Parking delivers expert asphalt paving services to Herrin and throughout Williamson County. Whether you need a new residential driveway or commercial parking lot paving, we bring professional quality to every Herrin project.</p>

              <p>Herrin&apos;s mix of historic properties and growing businesses requires paving solutions that balance durability, appearance, and value. That&apos;s exactly what we deliver.</p>

              <h2>Herrin Asphalt Services</h2>
              <ul>
                <li><strong>Residential Driveways:</strong> New installations and full replacements</li>
                <li><strong>Commercial Parking Lots:</strong> Business and retail property paving</li>
                <li><strong>Church Properties:</strong> Parking lot installations and repairs</li>
                <li><strong>Multi-Family Housing:</strong> Apartment and townhome communities</li>
                <li><strong>Asphalt Repairs:</strong> Patching, overlays, and resurfacing</li>
              </ul>

              <h2>Why Herrin Trusts Pinpoint Parking</h2>
              <ul>
                <li><strong>Quality First:</strong> We don&apos;t cut corners on materials or prep work</li>
                <li><strong>Fair Pricing:</strong> Competitive rates for Williamson County</li>
                <li><strong>Experienced Team:</strong> Professional paving done right</li>
                <li><strong>Local Service:</strong> We know Southern Illinois conditions</li>
                <li><strong>Free Estimates:</strong> Transparent quotes with no obligation</li>
              </ul>

              <h2>Herrin Areas We Serve</h2>
              <p>We provide asphalt paving throughout Herrin and surrounding areas:</p>
              <ul>
                <li>Downtown Herrin</li>
                <li>North Herrin</li>
                <li>South Park area</li>
                <li>Route 148 corridor</li>
                <li>Herrin Civic Center area</li>
              </ul>

              <h2>Get Your Free Herrin Estimate</h2>
              <p>Ready to discuss your Herrin paving project? Contact Pinpoint Parking for a free estimate. We&apos;ll assess your needs and provide honest recommendations for your property.</p>

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
                <h3>Herrin Paving Quote</h3>
                <p>Quality asphalt paving for Williamson County.</p>
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
          <h2>Ready for Quality Asphalt Paving in Herrin?</h2>
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
