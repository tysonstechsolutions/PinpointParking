import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sealcoating in Mount Vernon, IL | Driveway & Parking Lot Sealing',
  description: 'Professional asphalt sealcoating in Mount Vernon, IL. Protect your driveway or parking lot from UV damage, water, and chemicals. Free estimates! Call 618-214-7656.',
  keywords: 'sealcoating Mount Vernon IL, driveway sealing Mount Vernon, parking lot sealcoating Jefferson County, asphalt sealer Mount Vernon',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sealcoating in Mount Vernon, IL",
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
  "serviceType": "Asphalt Sealcoating"
};

export default function SealcoatingMountVernonPage() {
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
            <span className="current">Mount Vernon</span>
          </nav>
          <h1>Sealcoating in Mount Vernon, IL</h1>
          <p>Protect your asphalt investment with professional sealcoating. Local Mount Vernon service with quality materials.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Mount Vernon&apos;s Sealcoating Experts</h2>
              <p>Pinpoint Parking provides professional sealcoating services right here in Mount Vernon. As your local asphalt maintenance company, we understand Jefferson County&apos;s climate challenges—the hot summers that oxidize asphalt and the freeze-thaw cycles that cause cracks.</p>

              <p>Sealcoating is the most cost-effective way to protect your driveway or parking lot. A quality sealcoat extends asphalt life, prevents water damage, and restores that fresh, dark appearance.</p>

              <h2>Sealcoating Services in Mount Vernon</h2>
              <ul>
                <li><strong>Residential Driveway Sealing:</strong> Protect your home&apos;s driveway and boost curb appeal</li>
                <li><strong>Commercial Parking Lots:</strong> Maintain your business&apos;s professional appearance</li>
                <li><strong>HOA &amp; Apartment Complexes:</strong> Multi-property sealcoating programs</li>
                <li><strong>Church &amp; School Properties:</strong> Community facility maintenance</li>
                <li><strong>Crack Filling:</strong> Pre-sealcoat repairs for best results</li>
              </ul>

              <h2>Why Sealcoat Your Mount Vernon Property?</h2>
              <ul>
                <li><strong>UV Protection:</strong> Prevents sun damage that makes asphalt brittle</li>
                <li><strong>Water Resistance:</strong> Stops water infiltration that causes potholes</li>
                <li><strong>Chemical Protection:</strong> Guards against oil and gas spills</li>
                <li><strong>Extended Life:</strong> Regular sealcoating can double asphalt lifespan</li>
                <li><strong>Curb Appeal:</strong> Restores rich, dark color</li>
                <li><strong>Cost Savings:</strong> Far cheaper than premature replacement</li>
              </ul>

              <h2>Our Mount Vernon Sealcoating Process</h2>
              <ul>
                <li><strong>Surface Cleaning:</strong> Remove all dirt, debris, and vegetation</li>
                <li><strong>Crack Repair:</strong> Fill cracks before sealing (recommended)</li>
                <li><strong>Oil Spot Treatment:</strong> Prime stained areas</li>
                <li><strong>Professional Application:</strong> Even coverage with commercial equipment</li>
                <li><strong>Proper Curing:</strong> Allow adequate dry time</li>
              </ul>

              <h2>Mount Vernon Sealcoating Pricing</h2>
              <p>Residential driveways in Mount Vernon typically cost $0.15-$0.30 per square foot. Commercial pricing varies based on lot size and condition. Contact us for a free, detailed estimate.</p>

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
                <h3>Mount Vernon Sealcoating</h3>
                <p>Local service, quality protection. Get your free quote.</p>
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
          <h2>Protect Your Mount Vernon Asphalt Today</h2>
          <p>Get a free sealcoating estimate for your driveway or parking lot.</p>
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
