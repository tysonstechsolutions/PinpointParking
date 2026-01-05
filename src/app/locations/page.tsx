import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Service Areas | Pinpoint Parking',
  description: 'Pinpoint Parking serves Mount Vernon, IL and all communities within a 45-mile radius including Carbondale, Marion, Centralia, Salem, and Herrin.',
};

const locations = [
  { name: 'Mount Vernon', county: 'Jefferson County', distance: 'Headquarters', href: '/locations/mount-vernon', featured: true },
  { name: 'Carbondale', county: 'Jackson County', distance: '44 miles', href: '/locations/carbondale' },
  { name: 'Marion', county: 'Williamson County', distance: '41 miles', href: '/locations/marion' },
  { name: 'Centralia', county: 'Marion County', distance: '19 miles', href: '/locations/centralia' },
  { name: 'Herrin', county: 'Williamson County', distance: '36 miles', href: '/locations/herrin' },
  { name: 'Salem', county: 'Marion County', distance: '25 miles', href: '/locations/salem' },
  { name: 'Benton', county: 'Franklin County', distance: '20 miles', href: '/locations/benton' },
  { name: 'West Frankfort', county: 'Franklin County', distance: '25 miles', href: '/locations/west-frankfort' },
  { name: 'Du Quoin', county: 'Perry County', distance: '30 miles', href: '/locations/du-quoin' },
  { name: 'Nashville', county: 'Washington County', distance: '30 miles', href: '/locations/nashville' },
  { name: 'Fairfield', county: 'Wayne County', distance: '30 miles', href: '/locations/fairfield' },
  { name: 'Effingham', county: 'Effingham County', distance: '45 miles', href: '/locations/effingham' },
  { name: 'Murphysboro', county: 'Jackson County', distance: '40 miles', href: '/locations/murphysboro' },
  { name: 'Carterville', county: 'Williamson County', distance: '35 miles', href: '/locations/carterville' },
  { name: 'Harrisburg', county: 'Saline County', distance: '40 miles', href: '/locations/harrisburg' },
];

export default function LocationsPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">Service Areas</span>
          </nav>
          <h1>Service Areas</h1>
          <p>Based in Mount Vernon, we proudly serve communities within a 45-mile radius throughout Southern Illinois.</p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="service-areas" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <span className="section-label" style={{ color: 'var(--yellow-dark)' }}>Where We Work</span>
            <h2 style={{ color: 'var(--black)' }}>Communities We Serve</h2>
            <p style={{ color: 'var(--gray-500)' }}>Don&apos;t see your city listed? If you&apos;re within 45 miles of Mount Vernon, we can probably help. Give us a call!</p>
          </div>

          <div className="areas-grid" style={{ marginBottom: '60px' }}>
            {locations.map((location) => (
              <Link
                href={location.href}
                className={`area-card ${location.featured ? 'area-card-featured' : ''}`}
                key={location.name}
                style={!location.featured ? { backgroundColor: 'var(--white)', borderColor: 'var(--gray-200)' } : undefined}
              >
                {location.featured && <div className="area-badge">Headquarters</div>}
                <h3 style={!location.featured ? { color: 'var(--black)' } : undefined}>{location.name}</h3>
                <p style={!location.featured ? { color: 'var(--gray-500)' } : undefined}>{location.county} • {location.distance}</p>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom: '16px' }}>Other Areas We Serve</h3>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>
              We also provide service to Ina, Woodlawn, Waltonville, Johnston City, Zeigler, Christopher, Sesser, Valier, Opdyke, Belle Rive, Bluford, Wayne City, Fairfield, Flora, Olney, and many more communities throughout Southern Illinois.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Contact Us About Your Area
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Contact us for a free estimate. If you&apos;re in Southern Illinois, we&apos;re here to help.</p>
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
