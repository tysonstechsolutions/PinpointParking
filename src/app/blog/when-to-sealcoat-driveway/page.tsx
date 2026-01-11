import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'When to Sealcoat Your Driveway: Complete Timing Guide (2026)',
  description: 'Learn the best time to sealcoat your asphalt driveway. Ideal temperatures, seasons, and how often to sealcoat in Southern Illinois for maximum protection.',
  keywords: 'when to sealcoat driveway, best time to sealcoat, how often to sealcoat driveway, sealcoating season Illinois',
  alternates: {
    canonical: 'https://pinpointparking.net/blog/when-to-sealcoat-driveway',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What month is best to seal a driveway?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In Southern Illinois, May through September offers the best conditions for sealcoating. Late spring (May-June) and early fall (September) are ideal as temperatures are warm but not extreme."
      }
    },
    {
      "@type": "Question",
      "name": "How often should you sealcoat an asphalt driveway?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sealcoat your asphalt driveway every 2-3 years for optimal protection. High-traffic driveways may need it every 2 years, while low-traffic driveways can go 3 years between applications."
      }
    },
    {
      "@type": "Question",
      "name": "What temperature is too cold for sealcoating?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sealcoating requires temperatures of at least 50°F (10°C) for proper curing. Both air and pavement temperatures must be above this threshold, and temperatures shouldn't drop below 50°F for 24-48 hours after application."
      }
    }
  ]
};

export default function WhenToSealcoatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="current">When to Sealcoat</span>
          </nav>
          <h1>When to Sealcoat Your Driveway</h1>
          <p>The complete timing guide for Southern Illinois homeowners</p>
        </div>
      </section>

      <article className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <p><strong>Quick Answer:</strong> The best time to sealcoat in Southern Illinois is <strong>May through September</strong> when temperatures consistently stay above 50°F. Sealcoat every <strong>2-3 years</strong> for optimal protection.</p>

              <h2>Best Season for Sealcoating in Southern Illinois</h2>

              <h3>Ideal Months: May - September</h3>
              <p>Sealcoating requires specific weather conditions to cure properly:</p>
              <ul>
                <li><strong>Air temperature:</strong> Above 50°F</li>
                <li><strong>Pavement temperature:</strong> Above 50°F</li>
                <li><strong>No rain:</strong> 24-48 hours before and after</li>
                <li><strong>Low humidity:</strong> Helps faster curing</li>
              </ul>

              <h3>Month-by-Month Breakdown</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Month</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Rating</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>January-March</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Not Recommended</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Too cold</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>April</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Possible</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Watch overnight temps</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>May-June</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}><strong>Excellent</strong></td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Ideal conditions</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>July-August</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Good</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Can be very hot</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>September</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}><strong>Excellent</strong></td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Ideal conditions</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>October</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Possible</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Early month only</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>November-December</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Not Recommended</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Too cold</td>
                  </tr>
                </tbody>
              </table>

              <h2>How Often to Sealcoat</h2>
              <p>The general rule is <strong>every 2-3 years</strong>, but several factors affect this:</p>

              <h3>Sealcoat Every 2 Years If:</h3>
              <ul>
                <li>High traffic volume</li>
                <li>Driveway gets full sun exposure</li>
                <li>You want maximum protection</li>
                <li>Previous sealcoat is visibly worn</li>
              </ul>

              <h3>Sealcoat Every 3 Years If:</h3>
              <ul>
                <li>Light residential use</li>
                <li>Shaded areas</li>
                <li>Previous sealcoat still looks good</li>
                <li>Budget is a concern</li>
              </ul>

              <h2>Signs Your Driveway Needs Sealcoating</h2>
              <ul>
                <li><strong>Gray color:</strong> Asphalt turns gray as it oxidizes</li>
                <li><strong>Visible aggregate:</strong> Small stones showing through</li>
                <li><strong>Small cracks forming:</strong> Early-stage cracking</li>
                <li><strong>Rough texture:</strong> Surface feels gritty</li>
                <li><strong>Water absorption:</strong> Water soaks in instead of beading</li>
              </ul>

              <h2>When NOT to Sealcoat</h2>

              <h3>New Asphalt</h3>
              <p>Wait at least <strong>90 days</strong> after new asphalt installation. New asphalt needs time for oils to evaporate and the surface to cure.</p>

              <h3>Recently Sealcoated</h3>
              <p>Don&apos;t over-sealcoat. Too many layers can cause peeling and cracking. If your last sealcoat still looks good, wait another year.</p>

              <h3>Severely Damaged Asphalt</h3>
              <p>Sealcoating won&apos;t fix major problems like alligator cracking, large potholes, or base failure. These need <Link href="/services/asphalt-paving">repair or replacement</Link> first.</p>

              <h2>Frequently Asked Questions</h2>

              <h3>What month is best to seal a driveway?</h3>
              <p>In Southern Illinois, May through September offers the best conditions for sealcoating. Late spring (May-June) and early fall (September) are ideal as temperatures are warm but not extreme.</p>

              <h3>How often should you sealcoat an asphalt driveway?</h3>
              <p>Sealcoat your asphalt driveway every 2-3 years for optimal protection. High-traffic driveways may need it every 2 years, while low-traffic driveways can go 3 years between applications.</p>

              <h3>What temperature is too cold for sealcoating?</h3>
              <p>Sealcoating requires temperatures of at least 50°F (10°C) for proper curing. Both air and pavement temperatures must be above this threshold, and temperatures shouldn&apos;t drop below 50°F for 24-48 hours after application.</p>

              <h2>Schedule Your Sealcoating</h2>
              <p>Ready to protect your driveway? Contact Pinpoint Parking to schedule your <Link href="/services/sealcoating">sealcoating service</Link>. We&apos;ll help you pick the right time for optimal results.</p>

              <div style={{ marginTop: '32px' }}>
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Schedule Sealcoating
                </Link>
                <a href="tel:6182147656" className="btn btn-outline-dark btn-lg" style={{ marginLeft: '16px' }}>
                  Call (618) 214-7656
                </a>
              </div>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-cta">
                <h3>Ready to Sealcoat?</h3>
                <p>Get a free quote for your driveway.</p>
                <Link href="/contact" className="btn btn-primary">
                  Request Estimate
                </Link>
                <a href="tel:6182147656" className="btn btn-outline">
                  Call (618) 214-7656
                </a>
              </div>

              <div className="sidebar-services">
                <h4>Related Services</h4>
                <ul>
                  <li><Link href="/services/sealcoating">Sealcoating</Link></li>
                  <li><Link href="/services/crack-filling">Crack Filling</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Protect Your Driveway Today</h2>
          <p>Professional sealcoating for Southern Illinois.</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn btn-dark btn-lg">
              Get Free Estimate
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
