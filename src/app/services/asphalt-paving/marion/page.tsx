import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving in Marion, IL | Driveways & Parking Lots',
  description: 'Professional asphalt paving services in Marion, IL. Residential driveways, commercial parking lots, and industrial properties. Free estimates! Call 618-214-7656.',
  keywords: 'asphalt paving Marion IL, driveway paving Marion, parking lot paving Williamson County, asphalt contractor Marion Illinois',
  alternates: {
    canonical: 'https://pinpointparking.net/services/asphalt-paving/marion',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Asphalt Paving in Marion, IL",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656"
  },
  "areaServed": {
    "@type": "City",
    "name": "Marion",
    "addressRegion": "IL"
  },
  "serviceType": "Asphalt Paving"
};

export default function AsphaltPavingMarionPage() {
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
            <span className="current">Marion</span>
          </nav>
          <h1>Asphalt Paving in Marion, IL</h1>
          <p>Quality asphalt paving for Marion homes and businesses. Professional installation with materials built for Williamson County conditions.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Marion&apos;s Asphalt Paving Professionals</h2>
              <p>Pinpoint Parking delivers professional asphalt paving services throughout Marion and Williamson County. As one of Southern Illinois&apos; largest cities, Marion has diverse paving needs—from residential driveways to high-traffic commercial lots near Illinois Centre Mall.</p>

              <p>We understand what Marion properties require: durable materials, proper drainage, and quality installation that holds up to heavy use and harsh weather.</p>

              <h2>Asphalt Paving Services in Marion</h2>
              <ul>
                <li><strong>Residential Driveways:</strong> New installations and replacements for Marion homes</li>
                <li><strong>Commercial Parking Lots:</strong> Retail, restaurant, and office properties</li>
                <li><strong>Industrial Paving:</strong> Warehouse and distribution facilities</li>
                <li><strong>Healthcare Facilities:</strong> Medical office and clinic parking</li>
                <li><strong>Asphalt Overlays:</strong> Resurfacing for aging pavement</li>
              </ul>

              <h2>Why Marion Trusts Pinpoint Parking</h2>
              <ul>
                <li><strong>Commercial Experience:</strong> We handle Marion&apos;s busiest parking lots</li>
                <li><strong>Quality Materials:</strong> Hot-mix asphalt rated for high traffic</li>
                <li><strong>Proper Base Work:</strong> Foundation that prevents premature failure</li>
                <li><strong>Efficient Scheduling:</strong> Minimal disruption to your business</li>
                <li><strong>Free Estimates:</strong> Transparent pricing with no surprises</li>
              </ul>

              <h2>Marion Areas We Serve</h2>
              <p>We provide asphalt paving throughout Marion and Williamson County:</p>
              <ul>
                <li>Downtown Marion</li>
                <li>Illinois Centre Mall area</li>
                <li>Route 13 commercial corridor</li>
                <li>I-57 business district</li>
                <li>Residential neighborhoods throughout Marion</li>
              </ul>

              <h2>Get Your Free Marion Estimate</h2>
              <p>Ready to discuss your Marion paving project? Contact Pinpoint Parking for a free, detailed estimate. We&apos;ll assess your property and recommend the best solution for your needs and budget.</p>

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
                <h3>Marion Paving Quote</h3>
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
          <h2>Ready for Quality Asphalt Paving in Marion?</h2>
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
