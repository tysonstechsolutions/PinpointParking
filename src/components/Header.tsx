'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, memo } from 'react';

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
  { name: 'Herrin', href: '/locations/herrin' },
  { name: 'View All Areas', href: '/locations' },
];

function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-left">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Serving Mount Vernon &amp; 45-Mile Radius
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              Mon-Fri: 7AM - 6PM
            </span>
          </div>
          <div className="top-bar-right">
            <a href="mailto:pinpointparkingco@gmail.com">pinpointparkingco@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            <span className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
            </span>
            <div className="logo-text">
              <span className="logo-name">PINPOINT</span>
              <span className="logo-tagline">PARKING</span>
            </div>
          </Link>

          <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`} id="mainNav">
            <ul className="nav-list">
              <li>
                <Link href="/" className={pathname === '/' ? 'active' : ''}>
                  Home
                </Link>
              </li>
              <li className="has-dropdown">
                <Link href="/services" className={pathname.startsWith('/services') ? 'active' : ''}>
                  Services
                </Link>
                <ul className="dropdown">
                  {services.map((service) => (
                    <li key={service.href}>
                      <Link href={service.href}>{service.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="has-dropdown">
                <Link href="/locations" className={pathname.startsWith('/locations') ? 'active' : ''}>
                  Service Areas
                </Link>
                <ul className="dropdown">
                  {locations.map((location) => (
                    <li key={location.href}>
                      <Link href={location.href}>{location.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link href="/gallery" className={pathname === '/gallery' ? 'active' : ''}>
                  Our Work
                </Link>
              </li>
              <li>
                <Link href="/about" className={pathname === '/about' ? 'active' : ''}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className={pathname.startsWith('/blog') ? 'active' : ''}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-cta">
            <a href="tel:6182147656" className="phone-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>(618) 214-7656</span>
            </a>
            <Link href="/book" className="btn btn-primary">
              FREE Quote
            </Link>
          </div>

          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(Header);
