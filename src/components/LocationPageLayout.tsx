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

const allLocations = [
  { name: 'Mount Vernon', slug: 'mount-vernon' },
  { name: 'Carbondale', slug: 'carbondale' },
  { name: 'Marion', slug: 'marion' },
  { name: 'Centralia', slug: 'centralia' },
  { name: 'Herrin', slug: 'herrin' },
  { name: 'Salem', slug: 'salem' },
  { name: 'Benton', slug: 'benton' },
  { name: 'West Frankfort', slug: 'west-frankfort' },
  { name: 'Du Quoin', slug: 'du-quoin' },
  { name: 'Nashville', slug: 'nashville' },
  { name: 'Fairfield', slug: 'fairfield' },
  { name: 'Effingham', slug: 'effingham' },
  { name: 'Murphysboro', slug: 'murphysboro' },
  { name: 'Carterville', slug: 'carterville' },
  { name: 'Harrisburg', slug: 'harrisburg' },
];

function generateBreadcrumbSchema(cityName: string) {
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pinpointparking.net"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Service Areas",
        "item": "https://pinpointparking.net/locations"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cityName,
        "item": `https://pinpointparking.net/locations/${citySlug}`
      }
    ]
  };
}

function generateLocalBusinessSchema(cityName: string, county: string, description: string) {
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Pinpoint Parking - ${cityName}`,
    "description": description,
    "url": `https://pinpointparking.net/locations/${citySlug}`,
    "telephone": "+1-618-214-7656",
    "email": "pinpointparkingco@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressRegion": "IL",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": county
      }
    },
    "parentOrganization": {
      "@type": "LocalBusiness",
      "@id": "https://pinpointparking.net/#organization",
      "name": "Pinpoint Parking"
    },
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "18:00"
    }
  };
}

export default function LocationPageLayout({ cityName, county, distance, description, children }: LocationPageLayoutProps) {
  const breadcrumbSchema = generateBreadcrumbSchema(cityName);
  const localBusinessSchema = generateLocalBusinessSchema(cityName, county, description);

  // Get nearby locations (exclude current city, show up to 5)
  const currentSlug = cityName.toLowerCase().replace(/\s+/g, '-');
  const nearbyLocations = allLocations
    .filter(loc => loc.slug !== currentSlug)
    .slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
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

              <div className="sidebar-services" style={{ marginTop: '24px' }}>
                <h4>Nearby Locations</h4>
                <ul>
                  {nearbyLocations.map((location) => (
                    <li key={location.slug}>
                      <Link href={`/locations/${location.slug}`}>{location.name}, IL</Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/locations"
                  style={{
                    display: 'block',
                    marginTop: '12px',
                    fontSize: '14px',
                    color: 'var(--yellow-dark)',
                    textDecoration: 'none'
                  }}
                >
                  View all locations →
                </Link>
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
