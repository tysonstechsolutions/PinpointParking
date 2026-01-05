import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sealcoating in Herrin, IL | Driveway & Parking Lot Sealing',
  description: 'Professional asphalt sealcoating in Herrin, IL. Protect your driveway or parking lot from damage. Williamson County service. Free estimates! Call 618-214-7656.',
  keywords: 'sealcoating Herrin IL, driveway sealing Herrin, parking lot sealcoating Williamson County, asphalt sealer Herrin Illinois',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sealcoating in Herrin, IL",
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
  "serviceType": "Asphalt Sealcoating"
};

export default function SealcoatingHerrinPage() {
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
            <Link href="/services/sealcoating">Sealcoating</Link>
            <span>/</span>
            <span className="current">Herrin</span>
          </nav>
          <h1>Sealcoating in Herrin, IL</h1>
          <p>Professional asphalt sealcoating for Herrin homes and businesses. Quality protection for Williamson County properties.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Professional Sealcoating for Herrin</h2>
              <p>Pinpoint Parking provides expert sealcoating services throughout Herrin and Williamson County. Protect your asphalt investment with quality sealcoating that guards against Southern Illinois weather, UV damage, and daily wear.</p>

              <p>Whether you&apos;re a Herrin homeowner looking to protect your driveway or a business owner maintaining your parking lot, we deliver professional results at fair prices.</p>

              <h2>Herrin Sealcoating Services</h2>
              <ul>
                <li><strong>Residential Driveways:</strong> Home driveway sealing throughout Herrin</li>
                <li><strong>Commercial Parking Lots:</strong> Business and retail property maintenance</li>
                <li><strong>Church Properties:</strong> Parking lot sealcoating and maintenance</li>
                <li><strong>Multi-Family Housing:</strong> Apartment and townhome communities</li>
                <li><strong>Crack Filling:</strong> Pre-sealcoat repairs for lasting results</li>
              </ul>

              <h2>Why Sealcoat Your Herrin Property?</h2>
              <ul>
                <li><strong>Weather Protection:</strong> Guards against freeze-thaw damage</li>
                <li><strong>UV Resistance:</strong> Prevents sun-caused brittleness and fading</li>
                <li><strong>Water Barrier:</strong> Stops water infiltration that causes potholes</li>
                <li><strong>Chemical Protection:</strong> Resists oil, gas, and road salt damage</li>
                <li><strong>Curb Appeal:</strong> Restores rich, dark appearance</li>
                <li><strong>Cost Savings:</strong> Extends pavement life significantly</li>
              </ul>

              <h2>Our Sealcoating Process</h2>
              <ul>
                <li><strong>Inspection:</strong> Assess condition and identify needed repairs</li>
                <li><strong>Cleaning:</strong> Remove dirt, debris, and vegetation</li>
                <li><strong>Crack Repair:</strong> Fill cracks before sealing</li>
                <li><strong>Application:</strong> Even coverage with professional equipment</li>
                <li><strong>Curing:</strong> Proper dry time before opening to traffic</li>
              </ul>

              <h2>Get Your Free Herrin Estimate</h2>
              <p>Ready to protect your Herrin asphalt? Contact us for a free sealcoating estimate. We&apos;ll evaluate your property and recommend the best solution.</p>

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
                <h3>Herrin Sealcoating</h3>
                <p>Quality asphalt protection for Williamson County.</p>
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
          <h2>Protect Your Herrin Asphalt Today</h2>
          <p>Get a free sealcoating estimate for your property.</p>
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
