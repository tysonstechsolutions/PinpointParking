import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sealcoating in Marion, IL | Driveway & Parking Lot Sealing',
  description: 'Professional asphalt sealcoating in Marion, IL. Protect commercial parking lots and residential driveways. Williamson County service. Free estimates! Call 618-214-7656.',
  keywords: 'sealcoating Marion IL, driveway sealing Marion, parking lot sealcoating Williamson County, asphalt sealer Marion Illinois',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sealcoating in Marion, IL",
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
  "serviceType": "Asphalt Sealcoating"
};

export default function SealcoatingMarionPage() {
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
            <span className="current">Marion</span>
          </nav>
          <h1>Sealcoating in Marion, IL</h1>
          <p>Professional asphalt sealcoating for Marion&apos;s busy commercial properties and residential driveways.</p>
        </div>
      </section>

      {/* Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Marion&apos;s Commercial Sealcoating Experts</h2>
              <p>Pinpoint Parking provides professional sealcoating services throughout Marion and Williamson County. As one of Southern Illinois&apos; retail centers, Marion&apos;s commercial properties need regular sealcoating to maintain appearance and protect against heavy traffic wear.</p>

              <p>From Illinois Centre Mall area parking lots to residential driveways, we deliver quality sealcoating that extends asphalt life and keeps properties looking professional.</p>

              <h2>Marion Sealcoating Services</h2>
              <ul>
                <li><strong>Commercial Parking Lots:</strong> Retail centers, restaurants, and office properties</li>
                <li><strong>Residential Driveways:</strong> Home driveway sealing throughout Marion</li>
                <li><strong>Industrial Properties:</strong> Warehouse and distribution facility lots</li>
                <li><strong>Healthcare Facilities:</strong> Medical office and clinic parking</li>
                <li><strong>After-Hours Service:</strong> Commercial sealcoating outside business hours</li>
              </ul>

              <h2>Why Marion Businesses Choose Us</h2>
              <ul>
                <li><strong>Commercial Experience:</strong> We handle high-traffic lots regularly</li>
                <li><strong>Quality Materials:</strong> Commercial-grade sealers that perform</li>
                <li><strong>Minimal Disruption:</strong> Efficient scheduling for businesses</li>
                <li><strong>Professional Results:</strong> Clean, even application every time</li>
                <li><strong>Competitive Pricing:</strong> Fair rates for Williamson County</li>
              </ul>

              <h2>The Importance of Commercial Sealcoating</h2>
              <p>Marion&apos;s commercial parking lots face constant abuse from traffic, oil drips, and weather. Regular sealcoating:</p>
              <ul>
                <li>Protects your asphalt investment</li>
                <li>Maintains professional curb appeal</li>
                <li>Prevents costly repairs and early replacement</li>
                <li>Improves customer perception of your business</li>
                <li>Reduces liability from deteriorating surfaces</li>
              </ul>

              <h2>Get Your Free Marion Estimate</h2>
              <p>Ready to protect your Marion property? Contact us for a free sealcoating estimate. We offer flexible scheduling for commercial properties.</p>

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
                <h3>Marion Sealcoating</h3>
                <p>Commercial and residential service for Williamson County.</p>
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
          <h2>Protect Your Marion Asphalt Today</h2>
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
