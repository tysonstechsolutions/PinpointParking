import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sealcoating in Carbondale, IL | Driveway & Parking Lot Sealing',
  description: 'Professional asphalt sealcoating in Carbondale, IL. Protect driveways and parking lots near SIU. Residential and commercial service. Free estimates! Call 618-214-7656.',
  keywords: 'sealcoating Carbondale IL, driveway sealing Carbondale, parking lot sealcoating Jackson County, asphalt sealer Carbondale',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sealcoating in Carbondale, IL",
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
  "serviceType": "Asphalt Sealcoating"
};

export default function SealcoatingCarbondalePage() {
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
            <span className="current">Carbondale</span>
          </nav>
          <h1>Sealcoating in Carbondale, IL</h1>
          <p>Professional asphalt sealcoating for Carbondale homes and businesses. Protect your investment with quality service.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Professional Sealcoating for Carbondale</h2>
              <p>Pinpoint Parking delivers expert sealcoating services throughout Carbondale and Jackson County. Whether you&apos;re protecting a residential driveway or maintaining a high-traffic commercial parking lot near SIU, we provide the quality sealcoating your asphalt needs.</p>

              <p>Carbondale&apos;s busy properties—especially those near the university—experience heavy traffic that wears down asphalt. Regular sealcoating protects against this wear while guarding against sun damage, water infiltration, and chemical spills.</p>

              <h2>Carbondale Sealcoating Services</h2>
              <ul>
                <li><strong>Residential Driveways:</strong> Home driveway sealing throughout Carbondale</li>
                <li><strong>Commercial Parking Lots:</strong> Business, retail, and restaurant properties</li>
                <li><strong>Student Housing:</strong> Apartment complex parking maintenance</li>
                <li><strong>University Area Properties:</strong> Near-campus business sealcoating</li>
                <li><strong>Crack Filling:</strong> Pre-sealcoat repairs for optimal results</li>
              </ul>

              <h2>Benefits of Sealcoating Your Carbondale Property</h2>
              <ul>
                <li><strong>Traffic Protection:</strong> Guards against wear from heavy use</li>
                <li><strong>UV Protection:</strong> Prevents oxidation and brittleness</li>
                <li><strong>Water Resistance:</strong> Stops water damage and potholes</li>
                <li><strong>Professional Appearance:</strong> Dark, fresh look for your property</li>
                <li><strong>Cost Effective:</strong> Fraction of replacement cost</li>
                <li><strong>Extended Lifespan:</strong> Adds years to your asphalt</li>
              </ul>

              <h2>When to Sealcoat in Carbondale</h2>
              <p>Southern Illinois weather allows sealcoating from May through September when temperatures stay above 50°F. We recommend:</p>
              <ul>
                <li>New asphalt: Wait 90 days after installation</li>
                <li>Maintenance: Every 2-3 years for optimal protection</li>
                <li>Best timing: Late spring or early fall for ideal curing</li>
              </ul>

              <h2>Get Your Free Carbondale Estimate</h2>
              <p>Ready to protect your Carbondale asphalt? Contact us for a free sealcoating estimate. We&apos;ll assess your driveway or parking lot and recommend the best approach.</p>

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
                <h3>Carbondale Sealcoating</h3>
                <p>Protect your Jackson County property today.</p>
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
          <h2>Protect Your Carbondale Asphalt Today</h2>
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
