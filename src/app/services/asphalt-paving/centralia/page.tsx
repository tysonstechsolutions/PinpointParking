import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving in Centralia, IL | Driveways & Parking Lots',
  description: 'Professional asphalt paving services in Centralia, IL. Residential driveways, commercial parking lots, and municipal projects. Free estimates! Call 618-214-7656.',
  keywords: 'asphalt paving Centralia IL, driveway paving Centralia, parking lot paving Marion County, asphalt contractor Centralia Illinois',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Asphalt Paving in Centralia, IL",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking",
    "telephone": "+1-618-214-7656"
  },
  "areaServed": {
    "@type": "City",
    "name": "Centralia",
    "addressRegion": "IL"
  },
  "serviceType": "Asphalt Paving"
};

export default function AsphaltPavingCentraliaPage() {
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
            <span className="current">Centralia</span>
          </nav>
          <h1>Asphalt Paving in Centralia, IL</h1>
          <p>Professional asphalt paving for Centralia homes and businesses. Quality materials and expert installation just 19 miles from our Mount Vernon headquarters.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Centralia&apos;s Asphalt Paving Experts</h2>
              <p>Pinpoint Parking provides professional asphalt paving services to Centralia and Marion County. Located just 19 miles from our Mount Vernon base, Centralia is a community we know well and serve regularly.</p>

              <p>From historic downtown properties to newer developments, we deliver quality paving solutions designed for Centralia&apos;s needs and budget.</p>

              <h2>Asphalt Services in Centralia</h2>
              <ul>
                <li><strong>Residential Driveways:</strong> New paving and replacements for Centralia homes</li>
                <li><strong>Commercial Parking Lots:</strong> Business and retail property paving</li>
                <li><strong>Industrial Sites:</strong> Warehouse and facility parking areas</li>
                <li><strong>Church &amp; School Properties:</strong> Community facility paving</li>
                <li><strong>Asphalt Repairs:</strong> Patching, overlays, and resurfacing</li>
              </ul>

              <h2>Why Centralia Chooses Pinpoint Parking</h2>
              <ul>
                <li><strong>Close Proximity:</strong> Just 19 miles—we respond quickly to Centralia projects</li>
                <li><strong>Local Knowledge:</strong> We understand Marion County conditions</li>
                <li><strong>Quality Materials:</strong> Hot-mix asphalt for lasting results</li>
                <li><strong>Fair Pricing:</strong> Competitive rates for Centralia properties</li>
                <li><strong>Free Estimates:</strong> No-obligation quotes for your project</li>
              </ul>

              <h2>Centralia Areas We Serve</h2>
              <p>We provide asphalt paving throughout Centralia, including:</p>
              <ul>
                <li>Downtown Centralia</li>
                <li>East Centralia</li>
                <li>Route 51 corridor</li>
                <li>Hospital district</li>
                <li>Residential neighborhoods</li>
              </ul>

              <h2>Get Your Free Centralia Estimate</h2>
              <p>Ready to discuss your Centralia paving project? Contact us today for a free estimate. We&apos;ll evaluate your property and provide straightforward recommendations.</p>

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
                <h3>Centralia Paving Quote</h3>
                <p>Professional paving just 19 miles away.</p>
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
          <h2>Ready for Quality Asphalt Paving in Centralia?</h2>
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
