import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sealcoating in Centralia, IL | Driveway & Parking Lot Sealing',
  description: 'Professional asphalt sealcoating in Centralia, IL. Protect your driveway or parking lot. Just 19 miles from Mount Vernon. Free estimates! Call 618-214-7656.',
  keywords: 'sealcoating Centralia IL, driveway sealing Centralia, parking lot sealcoating Marion County, asphalt sealer Centralia Illinois',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sealcoating in Centralia, IL",
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
  "serviceType": "Asphalt Sealcoating"
};

export default function SealcoatingCentraliaPage() {
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
            <span className="current">Centralia</span>
          </nav>
          <h1>Sealcoating in Centralia, IL</h1>
          <p>Professional asphalt sealcoating for Centralia homes and businesses. Quality protection just 19 miles from our Mount Vernon base.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Centralia Sealcoating Services</h2>
              <p>Pinpoint Parking brings professional sealcoating services to Centralia and Marion County. Located just 19 miles from our Mount Vernon headquarters, Centralia is a community we serve frequently and know well.</p>

              <p>Whether you need driveway sealing for your Centralia home or parking lot maintenance for your business, we deliver quality results at competitive prices.</p>

              <h2>Our Centralia Sealcoating Services</h2>
              <ul>
                <li><strong>Residential Driveway Sealing:</strong> Protect your home&apos;s driveway</li>
                <li><strong>Commercial Parking Lots:</strong> Business property maintenance</li>
                <li><strong>Church &amp; School Properties:</strong> Community facility sealcoating</li>
                <li><strong>Industrial Facilities:</strong> Warehouse and plant parking areas</li>
                <li><strong>Crack Filling:</strong> Pre-sealcoat repairs for best results</li>
              </ul>

              <h2>Benefits of Sealcoating</h2>
              <ul>
                <li><strong>Asphalt Protection:</strong> Shields against UV rays, water, and chemicals</li>
                <li><strong>Extended Life:</strong> Adds years to your pavement</li>
                <li><strong>Improved Appearance:</strong> Restores dark, professional look</li>
                <li><strong>Cost Savings:</strong> Prevents expensive repairs and early replacement</li>
                <li><strong>Property Value:</strong> Well-maintained asphalt adds curb appeal</li>
              </ul>

              <h2>Why Centralia Chooses Pinpoint Parking</h2>
              <ul>
                <li><strong>Nearby Service:</strong> Just 19 miles—quick response to your project</li>
                <li><strong>Quality Materials:</strong> Commercial-grade sealers that last</li>
                <li><strong>Professional Application:</strong> Even coverage, clean edges</li>
                <li><strong>Fair Pricing:</strong> Competitive rates for Marion County</li>
                <li><strong>Free Estimates:</strong> No-obligation quotes</li>
              </ul>

              <h2>Get Your Free Centralia Estimate</h2>
              <p>Ready to protect your Centralia asphalt? Contact us for a free sealcoating estimate. We&apos;ll assess your property and provide honest recommendations.</p>

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
                <h3>Centralia Sealcoating</h3>
                <p>Quality service just 19 miles away.</p>
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
          <h2>Protect Your Centralia Asphalt Today</h2>
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
