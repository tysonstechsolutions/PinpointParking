import Link from 'next/link';
import { memo } from 'react';

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

function Footer() {
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
            <div className="footer-social">
              <a href="https://www.facebook.com/p/Pinpoint-Parking-61558373593907/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.yelp.com/biz/pinpoint-parking-mount-vernon" target="_blank" rel="noopener noreferrer" aria-label="Yelp">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 9.194 9.194 0 0 1 2.364 3.252 1.073 1.073 0 0 1-.694 1.459zm-3.965 5.835a1.073 1.073 0 0 1-.932 1.356 9.159 9.159 0 0 1-3.94-.246 1.073 1.073 0 0 1-.548-1.508l2.41-4.584c.476-.907 1.855-.608 1.926.418l.284 4.564zm-7.147-.653l3.472-3.753c.67-.724-.104-1.86-1.108-1.634l-5.112 1.149a1.072 1.072 0 0 1-1.173-.666 9.152 9.152 0 0 1-.043-4.001 1.073 1.073 0 0 1 1.327-.784l5.036 1.444c.987.283 1.39 1.58.578 1.863l-5.036 1.753a1.072 1.072 0 0 1-1.327-.784c-.47-1.58-.33-3.29.043-4.001a1.072 1.072 0 0 1 1.173-.666l5.112 1.149c1.004.226 1.778-1.09 1.108-1.634L9.048 3.637a1.073 1.073 0 0 1 .548-1.508 9.159 9.159 0 0 1 3.94-.246 1.073 1.073 0 0 1 .932 1.356l-.284 4.564c-.071 1.026-1.45 1.325-1.926.418L9.848 3.637a1.073 1.073 0 0 1 .548-1.508 9.159 9.159 0 0 1 3.94-.246c.565.09.996.562.932 1.356M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.385 4.09c-.107.001-.213.011-.317.03a.363.363 0 0 0-.29.416l1.244 6.903c.042.232-.198.407-.4.29l-5.91-3.417a.363.363 0 0 0-.498.133c-.904 1.564-1.146 3.392-.657 5.043a.363.363 0 0 0 .449.247l6.787-1.924c.228-.064.428.161.332.375l-2.787 6.19a.363.363 0 0 0 .184.479c1.631.716 3.479.722 5.115.005a.363.363 0 0 0 .188-.477l-2.768-6.2c-.095-.213.108-.437.336-.37l6.772 1.982a.363.363 0 0 0 .447-.25c.474-1.656.216-3.48-.702-5.033a.363.363 0 0 0-.5-.128l-5.89 3.449c-.201.118-.443-.054-.403-.286l1.194-6.91a.363.363 0 0 0-.294-.413 6.465 6.465 0 0 0-.632-.134z"/>
                </svg>
              </a>
              <a href="https://www.google.com/maps/place/Pinpoint+Parking/@38.3172,-88.9031,15z/data=!4m6!3m5!1s0x673cadb41b643589:0xf8ca7b021db5324f" target="_blank" rel="noopener noreferrer" aria-label="Google Business Profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
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
          <p className="footer-credit">
            Website by <a href="https://tysonstechsolutions.com" target="_blank" rel="noopener noreferrer">Tyson's Tech Solutions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Memoize to prevent unnecessary re-renders (footer content is static)
export default memo(Footer);
