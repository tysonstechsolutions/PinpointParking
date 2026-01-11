import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Fix Driveway Cracks: DIY vs Professional Repair (2026)',
  description: 'Learn when you can DIY driveway crack repair and when to call professionals. Types of cracks, repair methods, and costs in Southern Illinois.',
  keywords: 'how to fix driveway cracks, driveway crack repair, asphalt crack filler, crack sealing cost',
  alternates: {
    canonical: 'https://pinpointparking.net/blog/how-to-fix-driveway-cracks',
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Fix Driveway Cracks: DIY vs Professional Repair",
  "description": "Learn when you can DIY driveway crack repair and when to call professionals. Types of cracks, repair methods, and costs.",
  "author": { "@type": "Organization", "name": "Pinpoint Parking" },
  "publisher": { "@type": "Organization", "name": "Pinpoint Parking" },
  "datePublished": "2026-01-01",
  "dateModified": "2026-01-01"
};

export default function HowToFixCracksPage() {
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
            <span className="current">How to Fix Driveway Cracks</span>
          </nav>
          <h1>How to Fix Driveway Cracks</h1>
          <p>DIY options vs professional repair</p>
        </div>
      </section>

      <article className="service-content">
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <p>Cracks in your driveway aren&apos;t just cosmetic—they let water in, which causes much bigger problems. Here&apos;s how to assess your cracks and decide whether to DIY or call a professional.</p>

              <h2>Types of Driveway Cracks</h2>

              <h3>Linear/Longitudinal Cracks</h3>
              <p><strong>What they look like:</strong> Straight cracks running along the driveway</p>
              <p><strong>Cause:</strong> Usually poor joint construction or natural settling</p>
              <p><strong>DIY-able:</strong> Yes, if narrow (&lt;1/4 inch)</p>

              <h3>Alligator/Fatigue Cracks</h3>
              <p><strong>What they look like:</strong> Interconnected cracks resembling alligator skin</p>
              <p><strong>Cause:</strong> Base failure, typically from water damage or poor initial construction</p>
              <p><strong>DIY-able:</strong> No—requires professional repair or replacement</p>

              <h3>Edge Cracks</h3>
              <p><strong>What they look like:</strong> Cracks along the edges of the driveway</p>
              <p><strong>Cause:</strong> Lack of edge support, vehicles driving on edges</p>
              <p><strong>DIY-able:</strong> Small ones yes; extensive edge damage needs professional work</p>

              <h3>Block Cracks</h3>
              <p><strong>What they look like:</strong> Large rectangular patterns</p>
              <p><strong>Cause:</strong> Asphalt shrinkage from age or temperature cycling</p>
              <p><strong>DIY-able:</strong> Individual cracks yes; widespread patterns may need resurfacing</p>

              <h2>DIY Crack Repair</h2>
              <p><strong>Best for:</strong> Small cracks under 1/4 inch wide with no base damage</p>

              <h3>Materials You&apos;ll Need</h3>
              <ul>
                <li>Crack filler (liquid pour or caulk-style)</li>
                <li>Wire brush or screwdriver</li>
                <li>Leaf blower or broom</li>
                <li>Gloves and old clothes</li>
              </ul>

              <h3>DIY Steps</h3>
              <ol>
                <li><strong>Clean the crack:</strong> Remove all debris, vegetation, and loose material</li>
                <li><strong>Dry completely:</strong> Wait for dry weather, no rain for 24 hours</li>
                <li><strong>Apply filler:</strong> Fill crack slightly above surface level</li>
                <li><strong>Smooth:</strong> Level with putty knife or back of trowel</li>
                <li><strong>Cure:</strong> Allow 24-48 hours before driving on it</li>
              </ol>

              <h3>DIY Limitations</h3>
              <ul>
                <li>Store-bought fillers aren&apos;t as durable as professional materials</li>
                <li>May need to repeat annually</li>
                <li>Won&apos;t fix underlying base problems</li>
                <li>Large cracks need professional hot-pour methods</li>
              </ul>

              <h2>When to Call a Professional</h2>
              <p>Contact a <Link href="/services/crack-filling">professional crack repair service</Link> when:</p>
              <ul>
                <li><strong>Cracks are wider than 1/2 inch:</strong> Need hot-pour sealant</li>
                <li><strong>Alligator cracking present:</strong> Indicates base failure</li>
                <li><strong>Cracks are deep:</strong> Need proper filling technique</li>
                <li><strong>Large areas affected:</strong> More efficient to do professionally</li>
                <li><strong>Before sealcoating:</strong> Professional prep ensures best results</li>
              </ul>

              <h2>Professional Crack Repair Methods</h2>

              <h3>Hot-Pour Crack Sealing</h3>
              <ul>
                <li>Rubberized material heated to 400°F</li>
                <li>Stays flexible through temperature changes</li>
                <li>Lasts 3-5+ years</li>
                <li>Best for working cracks</li>
              </ul>

              <h3>Routing and Sealing</h3>
              <ul>
                <li>Crack is widened to create uniform channel</li>
                <li>Allows more sealant for better adhesion</li>
                <li>Best for larger cracks</li>
              </ul>

              <h2>Cost Comparison</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Method</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Cost</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Longevity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>DIY Cold Pour</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$10-$30</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>1-2 years</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Professional Hot-Pour</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$0.50-$1.50/linear ft</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>3-5+ years</td>
                  </tr>
                </tbody>
              </table>

              <h2>Get Professional Crack Repair</h2>
              <p>Need help with your driveway cracks? We provide professional <Link href="/services/crack-filling">crack filling services</Link> throughout Southern Illinois.</p>

              <div style={{ marginTop: '32px' }}>
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Get Free Estimate
                </Link>
                <a href="tel:6182147656" className="btn btn-outline-dark btn-lg" style={{ marginLeft: '16px' }}>
                  Call (618) 214-7656
                </a>
              </div>
            </div>

            <aside className="service-sidebar">
              <div className="sidebar-cta">
                <h3>Professional Crack Repair</h3>
                <p>Lasting repairs that protect your driveway.</p>
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
                  <li><Link href="/services/crack-filling">Crack Filling</Link></li>
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
          <h2>Fix Those Cracks Today</h2>
          <p>Professional crack repair for Southern Illinois.</p>
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
