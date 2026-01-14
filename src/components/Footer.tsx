import Link from 'next/link';

const services = [
  { name: 'Asphalt Paving', href: '/services/asphalt-paving' },
  { name: 'Sealcoating', href: '/services/sealcoating' },
  { name: 'Line Striping', href: '/services/line-striping' },
  { name: 'Crack Filling', href: '/services/crack-filling' },
  { name: 'Pothole Repair', href: '/services/pothole-repair' },
];

const locations = [
  { name: 'Mount Vernon', href: '/locations/mount-vernon' },
  { name: 'Carbondale', href: '/locations/carbondale' },
  { name: 'Marion', href: '/locations/marion' },
  { name: 'Centralia', href: '/locations/centralia' },
  { name: 'Salem', href: '/locations/salem' },
  { name: 'All 15+ Areas', href: '/locations' },
];

const company = [
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'Free Estimate', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <span className="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </span>
              <span>Pinpoint Parking</span>
            </Link>
            <p>Your local Mount Vernon paving crew. We do the work ourselves—no middlemen, no subcontractors.</p>
            <div className="footer-contact">
              <a href="tel:6182147656">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                (618) 214-7656
              </a>
              <a href="mailto:pinpointparkingco@gmail.com">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                pinpointparkingco@gmail.com
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              {services.map((service) => (
                <li key={service.href}>
                  <Link href={service.href}>{service.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Service Areas</h4>
            <ul>
              {locations.map((location) => (
                <li key={location.href}>
                  <Link href={location.href}>{location.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              {company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Pinpoint Parking. All rights reserved. | Serving Mount Vernon, IL and Southern Illinois</p>
        </div>
      </div>
    </footer>
  );
}
