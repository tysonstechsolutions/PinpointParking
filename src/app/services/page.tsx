import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Services | Pinpoint Parking',
  description: 'Professional asphalt paving, sealcoating, line striping, crack filling, and pothole repair services in Mount Vernon, IL and Southern Illinois.',
  alternates: {
    canonical: 'https://pinpointparking.net/services',
  },
};

const services = [
  {
    title: 'Asphalt Paving',
    description: 'New driveways, parking lots, and roads built to last. Expert installation with proper base preparation and drainage.',
    href: '/services/asphalt-paving',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M2 10h20"/>
        <path d="M6 14h.01M10 14h.01M14 14h.01M18 14h.01"/>
      </svg>
    ),
  },
  {
    title: 'Sealcoating',
    description: 'Protect and extend the life of your asphalt with professional sealcoating. Guards against UV rays, water, and chemicals.',
    href: '/services/sealcoating',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/>
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
      </svg>
    ),
  },
  {
    title: 'Line Striping',
    description: 'ADA-compliant parking lot striping, traffic markings, and custom layouts. Crisp, visible lines that last.',
    href: '/services/line-striping',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
      </svg>
    ),
  },
  {
    title: 'Crack Filling',
    description: 'Stop cracks before they spread. Professional crack sealing prevents water infiltration and costly repairs.',
    href: '/services/crack-filling',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    title: 'Pothole Repair',
    description: 'Fast, permanent pothole repairs that eliminate hazards and restore smooth surfaces. Same-week service available.',
    href: '/services/pothole-repair',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
      </svg>
    ),
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">Services</span>
          </nav>
          <h1>Our Services</h1>
          <p>Complete pavement solutions for residential and commercial properties throughout Southern Illinois.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services" style={{ paddingTop: '60px' }}>
        <div className="container">
          <div className="services-grid">
            {services.map((service) => (
              <Link href={service.href} className="service-card" key={service.title}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="service-link">
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </Link>
            ))}

            <div className="service-card service-card-cta">
              <h3>Not Sure What You Need?</h3>
              <p>Our experts will assess your pavement and recommend the best solution for your budget and goals.</p>
              <Link href="/contact" className="btn btn-primary">
                Get Free Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Ready to Get Started?</h2>
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
