import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us ★ #1 Rated Asphalt Company in Southern Illinois',
  description: '👷 Meet Southern IL\'s most trusted paving team! Family-owned, locally operated from Mount Vernon. ✓ Licensed ✓ Insured ✓ 100% Satisfaction Guaranteed. 45-mile service radius.',
  keywords: ['about Pinpoint Parking', 'asphalt company Mount Vernon IL', 'paving contractor Southern Illinois', 'local paving company'],
  alternates: {
    canonical: 'https://pinpointparking.net/about',
  },
};

const services = [
  { name: 'Asphalt Paving', href: '/services/asphalt-paving' },
  { name: 'Sealcoating', href: '/services/sealcoating' },
  { name: 'Line Striping', href: '/services/line-striping' },
  { name: 'Crack Filling', href: '/services/crack-filling' },
  { name: 'Pothole Repair', href: '/services/pothole-repair' },
];

export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">About Us</span>
          </nav>
          <h1>About Pinpoint Parking</h1>
          <p>Southern Illinois&apos; trusted partner for professional asphalt paving, sealcoating, and pavement maintenance.</p>
        </div>
      </section>

      {/* About Content */}
      <section className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <h2>Precision Work for Southern Illinois</h2>
              <p>Pinpoint Parking was founded with a simple mission: deliver professional-quality paving and pavement maintenance services to Southern Illinois communities—with the precision, reliability, and customer care that homeowners and businesses deserve.</p>

              <p>Based in Mount Vernon at the crossroads of I-57 and I-64, we&apos;re centrally positioned to serve communities throughout a 45-mile radius. From residential driveways in small towns to commercial parking lots in regional centers, we bring the same commitment to quality and attention to detail to every project.</p>

              <h2>Why &quot;Pinpoint&quot;?</h2>
              <p>Our name reflects our approach to every project:</p>

              <ul>
                <li><strong>Precision:</strong> We measure twice, pour once. Proper preparation and careful execution ensure lasting results.</li>
                <li><strong>Accuracy:</strong> Our quotes are detailed and transparent—no surprises, no hidden fees.</li>
                <li><strong>Focus:</strong> We specialize in what we do best: asphalt paving, sealcoating, striping, and repairs.</li>
                <li><strong>Reliability:</strong> When we say we&apos;ll be there, we&apos;re there. Projects completed on time, as promised.</li>
              </ul>

              <h2>Our Services</h2>
              <p>We offer comprehensive pavement solutions for residential and commercial properties:</p>

              <ul>
                <li><strong>Asphalt Paving:</strong> New driveways, parking lots, and roads built to last</li>
                <li><strong>Sealcoating:</strong> Protective coating that extends asphalt life and enhances appearance</li>
                <li><strong>Line Striping:</strong> ADA-compliant parking lot markings and traffic guidance</li>
                <li><strong>Crack Filling:</strong> Stop cracks before they become costly repairs</li>
                <li><strong>Pothole Repair:</strong> Fast, permanent fixes for damaged pavement</li>
              </ul>

              <h2>Our Service Area</h2>
              <p>From our Mount Vernon base, we serve homeowners and businesses throughout Southern Illinois. Our 45-mile service radius includes:</p>

              <ul>
                <li><strong>Jefferson County:</strong> Mount Vernon, Ina, Woodlawn, Waltonville</li>
                <li><strong>Williamson County:</strong> Marion, Herrin, Carterville, Johnston City</li>
                <li><strong>Jackson County:</strong> Carbondale, Murphysboro</li>
                <li><strong>Franklin County:</strong> Benton, West Frankfort, Zeigler</li>
                <li><strong>Marion County:</strong> Centralia, Salem</li>
                <li><strong>Perry County:</strong> Du Quoin, Pinckneyville</li>
                <li><strong>And many more</strong> communities throughout the region</li>
              </ul>

              <p>Not sure if we serve your area? Give us a call—if you&apos;re in Southern Illinois, we can probably help.</p>

              <h2>Our Commitment to You</h2>
              <p>When you work with Pinpoint Parking, you can expect:</p>

              <ul>
                <li><strong>Free, Honest Estimates:</strong> We&apos;ll assess your project and provide transparent pricing with no pressure</li>
                <li><strong>Quality Materials:</strong> We use commercial-grade products designed for Southern Illinois conditions</li>
                <li><strong>Professional Workmanship:</strong> Proper preparation and careful execution on every project</li>
                <li><strong>Clear Communication:</strong> We keep you informed from first call to final walkthrough</li>
                <li><strong>Respect for Your Property:</strong> Clean work areas and minimal disruption</li>
                <li><strong>Satisfaction Guaranteed:</strong> We stand behind our work</li>
              </ul>

              <h2>Ready to Get Started?</h2>
              <p>Whether you need a new driveway, parking lot maintenance, or emergency pothole repair, we&apos;re here to help. Contact us today for a free, no-obligation estimate.</p>

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
                <p>Ready to discuss your project? Contact us for a free estimate.</p>
                <Link href="/contact" className="btn btn-primary">
                  Request Estimate
                </Link>
                <a href="tel:6182147656" className="btn btn-outline">
                  Call (618) 214-7656
                </a>
              </div>

              {/* Credentials Box */}
              <div className="sidebar-services" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ color: '#166534', marginBottom: '16px' }}>✓ Licensed & Insured</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                    <strong>General Liability Insurance</strong>
                    <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '13px' }}>$1M per occurrence / $2M aggregate</p>
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                    <strong>Workers&apos; Compensation</strong>
                    <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '13px' }}>Full coverage for our crew</p>
                  </li>
                  <li style={{ marginBottom: '12px', fontSize: '14px' }}>
                    <strong>Veteran-Owned Business</strong>
                    <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '13px' }}>Disabled Army Veteran Owned</p>
                  </li>
                </ul>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', fontStyle: 'italic' }}>
                  Need proof of insurance? We&apos;ll provide a certificate upon request.
                </p>
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
          <h2>Let&apos;s Discuss Your Project</h2>
          <p>Get a free, no-obligation estimate. We serve Mount Vernon and all of Southern Illinois.</p>
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
