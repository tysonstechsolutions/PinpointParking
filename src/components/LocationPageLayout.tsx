import Link from 'next/link';

interface LocationPageLayoutProps {
  cityName: string;
  county: string;
  distance: string;
  description: string;
  children: React.ReactNode;
}

const services = [
  { name: 'Asphalt Paving', href: '/services/asphalt-paving' },
  { name: 'Sealcoating', href: '/services/sealcoating' },
  { name: 'Line Striping', href: '/services/line-striping' },
  { name: 'Crack Filling', href: '/services/crack-filling' },
  { name: 'Pothole Repair', href: '/services/pothole-repair' },
];

export default function LocationPageLayout({ cityName, county, distance, description, children }: LocationPageLayoutProps) {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/locations">Service Areas</Link>
            <span>/</span>
            <span className="current">{cityName}</span>
          </nav>
          <h1>Asphalt Paving &amp; Sealcoating in {cityName}, IL</h1>
          <p>{description}</p>
        </div>
      </section>

      {/* Location Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <div className="location-stats">
                <div className="location-stat">
                  <span className="location-stat-number">{distance}</span>
                  <span className="location-stat-label">From Mount Vernon</span>
                </div>
                <div className="location-stat">
                  <span className="location-stat-number">{county}</span>
                  <span className="location-stat-label">County</span>
                </div>
                <div className="location-stat">
                  <span className="location-stat-number">Free</span>
                  <span className="location-stat-label">Estimates</span>
                </div>
              </div>

              {children}

              <h2>Our Services in {cityName}</h2>
              <p>Pinpoint Parking provides complete pavement solutions for {cityName} homes and businesses:</p>
              <ul>
                <li><strong>Asphalt Paving:</strong> New driveways, parking lots, and roads</li>
                <li><strong>Sealcoating:</strong> Protective coating to extend asphalt life</li>
                <li><strong>Line Striping:</strong> ADA-compliant parking lot markings</li>
                <li><strong>Crack Filling:</strong> Stop cracks before they become potholes</li>
                <li><strong>Pothole Repair:</strong> Fast, permanent repairs</li>
              </ul>

              <h2>Why Choose Pinpoint Parking?</h2>
              <ul>
                <li>Free, no-obligation estimates</li>
                <li>Quality materials built for Southern Illinois conditions</li>
                <li>Transparent pricing with no hidden fees</li>
                <li>Professional workmanship on every project</li>
                <li>Satisfaction guaranteed</li>
              </ul>

              <h2>Get Your Free Estimate</h2>
              <p>Ready to discuss your {cityName} paving project? Contact Pinpoint Parking today for a free, detailed estimate. We&apos;ll assess your needs and provide honest recommendations.</p>

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
                <h3>Get Your Free Quote</h3>
                <p>Serving {cityName} and all of {county}.</p>
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
                  {services.map((service) => (
                    <li key={service.href}>
                      <Link href={service.href}>{service.name}</Link>
                    </li>
                  ))}
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
          <h2>Ready to Get Started in {cityName}?</h2>
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
