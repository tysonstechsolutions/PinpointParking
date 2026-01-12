import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ADA Parking Requirements 2026 ★ Avoid $75,000 Fines (Free Chart)',
  description: '⚠️ Fines up to $150K for violations! FREE ADA space calculator + requirements chart. How many handicap spots you need, dimensions, signage rules.',
  keywords: 'ADA parking requirements 2026, handicap parking requirements Illinois, ADA compliant parking lot, accessible parking spaces, ADA parking fines',
  alternates: {
    canonical: 'https://pinpointparking.net/blog/ada-parking-lot-requirements',
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ADA Parking Lot Requirements: Complete Compliance Guide",
  "description": "ADA parking requirements for Illinois businesses. Number of accessible spaces, dimensions, signage, and striping requirements.",
  "author": { "@type": "Organization", "name": "Pinpoint Parking" },
  "publisher": { "@type": "Organization", "name": "Pinpoint Parking" },
  "datePublished": "2026-01-01",
  "dateModified": "2026-01-01"
};

export default function ADARequirementsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="current">ADA Parking Requirements</span>
          </nav>
          <h1>ADA Parking Lot Requirements</h1>
          <p>Complete compliance guide for Illinois businesses</p>
        </div>
      </section>

      <article className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <p><strong>Important:</strong> ADA compliance isn&apos;t optional—it&apos;s federal law. Non-compliant businesses face fines up to $75,000 for first violations and $150,000 for subsequent violations, plus potential lawsuits.</p>

              <h2>How Many Accessible Spaces Do You Need?</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Total Parking Spaces</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Required Accessible Spaces</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>1-25</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>1</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>26-50</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>2</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>51-75</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>3</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>76-100</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>4</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>101-150</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>5</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>151-200</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>6</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>201-300</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>7</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>301-400</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>8</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>Van-Accessible Requirement:</strong> At least 1 in every 6 accessible spaces must be van-accessible.</p>

              <h2>Accessible Space Dimensions</h2>

              <h3>Standard Accessible Space</h3>
              <ul>
                <li><strong>Width:</strong> 8 feet minimum</li>
                <li><strong>Access aisle:</strong> 5 feet minimum</li>
                <li><strong>Total width:</strong> 13 feet (space + aisle)</li>
              </ul>

              <h3>Van-Accessible Space</h3>
              <ul>
                <li><strong>Width:</strong> 8 feet minimum</li>
                <li><strong>Access aisle:</strong> 8 feet minimum</li>
                <li><strong>Total width:</strong> 16 feet (space + aisle)</li>
                <li><strong>Vertical clearance:</strong> 98 inches minimum</li>
              </ul>

              <h2>Striping Requirements</h2>
              <ul>
                <li><strong>Space lines:</strong> Blue or white, clearly visible</li>
                <li><strong>Access aisle:</strong> Diagonal stripes, blue or white</li>
                <li><strong>&quot;No Parking&quot; in aisle:</strong> Required in access aisles</li>
                <li><strong>International symbol:</strong> Must be painted on pavement</li>
              </ul>

              <h2>Signage Requirements</h2>
              <ul>
                <li><strong>Height:</strong> Bottom of sign at least 60 inches above ground</li>
                <li><strong>International symbol:</strong> Required on sign</li>
                <li><strong>Van-accessible:</strong> Additional &quot;Van Accessible&quot; sign required</li>
                <li><strong>Fine amount:</strong> Many jurisdictions require fine amount posted</li>
              </ul>

              <h2>Location Requirements</h2>
              <ul>
                <li>Closest spaces to accessible entrance</li>
                <li>On the shortest accessible route</li>
                <li>Connected to accessible path of travel</li>
                <li>No obstructions between space and entrance</li>
              </ul>

              <h2>Common Compliance Mistakes</h2>
              <ol>
                <li><strong>Wrong number of spaces:</strong> Calculate based on total lot capacity</li>
                <li><strong>Insufficient van spaces:</strong> 1 in 6 must be van-accessible</li>
                <li><strong>Faded striping:</strong> Lines must be clearly visible</li>
                <li><strong>Missing access aisles:</strong> Every space needs an adjacent aisle</li>
                <li><strong>Signs too low:</strong> Must be 60 inches minimum height</li>
                <li><strong>Blocked access routes:</strong> Path to entrance must be clear</li>
              </ol>

              <h2>Medical Facilities: Additional Requirements</h2>
              <p>Hospitals, outpatient facilities, and rehabilitation centers need additional accessible parking based on the services they provide.</p>

              <h2>Penalties for Non-Compliance</h2>
              <ul>
                <li><strong>First violation:</strong> Up to $75,000</li>
                <li><strong>Subsequent violations:</strong> Up to $150,000</li>
                <li><strong>Private lawsuits:</strong> Unlimited damages possible</li>
                <li><strong>Required remediation:</strong> Must fix issues regardless of fines</li>
              </ul>

              <h2>Get Your Parking Lot Compliant</h2>
              <p>We provide <Link href="/services/line-striping">ADA-compliant line striping</Link> services. We&apos;ll assess your lot, calculate requirements, and ensure proper striping and marking.</p>

              <div style={{ marginTop: '32px' }}>
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Get Compliance Assessment
                </Link>
                <a href="tel:6182147656" className="btn btn-outline-dark btn-lg" style={{ marginLeft: '16px' }}>
                  Call (618) 214-7656
                </a>
              </div>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-cta">
                <h3>ADA Compliance Help</h3>
                <p>Professional striping and assessment.</p>
                <Link href="/contact" className="btn btn-primary">
                  Request Assessment
                </Link>
                <a href="tel:6182147656" className="btn btn-outline">
                  Call (618) 214-7656
                </a>
              </div>

              <div className="sidebar-services">
                <h4>Related Services</h4>
                <ul>
                  <li><Link href="/services/line-striping">Line Striping</Link></li>
                  <li><Link href="/services/sealcoating">Sealcoating</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Ensure ADA Compliance Today</h2>
          <p>Professional parking lot striping for Southern Illinois businesses.</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn btn-dark btn-lg">
              Get Free Assessment
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
