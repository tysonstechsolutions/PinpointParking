import Link from 'next/link';

interface ServicePageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  currentService?: string;
}

const services = [
  { name: 'Asphalt Paving', href: '/services/asphalt-paving', slug: 'asphalt-paving' },
  { name: 'Sealcoating', href: '/services/sealcoating', slug: 'sealcoating' },
  { name: 'Line Striping', href: '/services/line-striping', slug: 'line-striping' },
  { name: 'Crack Filling', href: '/services/crack-filling', slug: 'crack-filling' },
  { name: 'Pothole Repair', href: '/services/pothole-repair', slug: 'pothole-repair' },
];

export default function ServicePageLayout({ title, description, children, currentService }: ServicePageLayoutProps) {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services">Services</Link>
            <span>/</span>
            <span className="current">{title}</span>
          </nav>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>

      {/* Service Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              {children}

              <div style={{ marginTop: '48px' }}>
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
                <p>Ready to discuss your project? Contact us for a free estimate.</p>
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
                      <Link
                        href={service.href}
                        className={currentService === service.slug ? 'active' : ''}
                      >
                        {service.name}
                      </Link>
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
          <h2>Ready to Get Started?</h2>
          <p>Get a free, no-obligation estimate for your {title.toLowerCase()} project.</p>
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
