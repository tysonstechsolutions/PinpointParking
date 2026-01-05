import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving in Mount Vernon, IL | Driveways & Parking Lots',
  description: 'Professional asphalt paving services in Mount Vernon, IL. New driveways, parking lots, and repairs. Local Jefferson County contractor. Free estimates! Call 618-214-7656.',
  keywords: 'asphalt paving Mount Vernon IL, driveway paving Mount Vernon, parking lot paving Jefferson County, asphalt contractor Mount Vernon',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Asphalt Paving in Mount Vernon, IL",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656"
  },
  "areaServed": {
    "@type": "City",
    "name": "Mount Vernon",
    "addressRegion": "IL"
  },
  "serviceType": "Asphalt Paving"
};

export default function AsphaltPavingMountVernonPage() {
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
            <span className="current">Mount Vernon</span>
          </nav>
          <h1>Asphalt Paving in Mount Vernon, IL</h1>
          <p>Professional driveway and parking lot paving for Mount Vernon homes and businesses. Quality materials, expert installation, and free estimates.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Mount Vernon&apos;s Trusted Asphalt Paving Contractor</h2>
              <p>Based right here in Mount Vernon, Pinpoint Parking is your local asphalt paving expert. We understand Jefferson County&apos;s soil conditions, climate challenges, and what it takes to build driveways and parking lots that last in Southern Illinois.</p>

              <p>Whether you&apos;re a homeowner on the south side needing a new driveway, a business owner on Broadway requiring parking lot installation, or a property manager maintaining commercial sites, we deliver professional results at competitive prices.</p>

              <h2>Asphalt Paving Services in Mount Vernon</h2>
              <ul>
                <li><strong>Residential Driveway Paving:</strong> New installations and full replacements for Mount Vernon homes</li>
                <li><strong>Commercial Parking Lots:</strong> Professional paving for businesses throughout Jefferson County</li>
                <li><strong>Asphalt Repairs:</strong> Patching, overlays, and resurfacing</li>
                <li><strong>Private Roads:</strong> Durable paving for subdivisions and rural properties</li>
              </ul>

              <h2>Why Mount Vernon Chooses Pinpoint Parking</h2>
              <ul>
                <li><strong>Local Company:</strong> We&apos;re based in Mount Vernon—not driving in from hours away</li>
                <li><strong>Quality Materials:</strong> Hot-mix asphalt designed for Southern Illinois conditions</li>
                <li><strong>Proper Preparation:</strong> We don&apos;t cut corners on base work</li>
                <li><strong>Fair Pricing:</strong> Competitive rates without sacrificing quality</li>
                <li><strong>Free Estimates:</strong> Detailed quotes with no obligation</li>
              </ul>

              <h2>Mount Vernon Areas We Serve</h2>
              <p>We provide asphalt paving throughout Mount Vernon and Jefferson County, including:</p>
              <ul>
                <li>Downtown Mount Vernon</li>
                <li>South Mount Vernon</li>
                <li>North Broadway corridor</li>
                <li>Industrial areas near I-57/I-64</li>
                <li>Rural Jefferson County properties</li>
              </ul>

              <h2>Get Your Free Estimate</h2>
              <p>Ready to discuss your Mount Vernon paving project? Contact Pinpoint Parking today for a free, no-obligation estimate. We&apos;ll assess your property, discuss your needs, and provide honest recommendations.</p>

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
                <h3>Mount Vernon Paving Quote</h3>
                <p>Local service, quality results. Get your free estimate today.</p>
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
          <h2>Ready for Quality Asphalt Paving in Mount Vernon?</h2>
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
