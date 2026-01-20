import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving Cost 2026 ★ $3-$7/sqft | Illinois Price Calculator',
  description: '💰 REAL 2026 prices: Driveways $2,500-$6,000, Parking lots from $8K. See cost breakdown by size + 5 ways to save money. FREE quote from local contractor!',
  keywords: 'asphalt paving cost 2026, driveway paving cost Illinois, parking lot paving price, asphalt driveway cost per square foot, how much does paving cost',
  alternates: {
    canonical: 'https://pinpointparking.net/blog/how-much-does-asphalt-paving-cost',
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How Much Does Asphalt Paving Cost in 2026? Complete Illinois Pricing Guide",
  "description": "Comprehensive guide to asphalt paving costs in Southern Illinois, including driveways, parking lots, and factors affecting price.",
  "image": "https://pinpointparking.net/media/parking-lot-aerial.jpg",
  "author": {
    "@type": "Person",
    "name": "Tyson",
    "jobTitle": "Founder & Asphalt Specialist",
    "description": "Disabled Army Veteran and founder of Pinpoint Parking with hands-on experience in asphalt paving throughout Southern Illinois.",
    "worksFor": {
      "@type": "Organization",
      "name": "Pinpoint Parking"
    }
  },
  "publisher": {
    "@type": "Organization",
    "name": "Pinpoint Parking",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pinpointparking.net/favicon.svg"
    }
  },
  "datePublished": "2024-10-15",
  "dateModified": "2026-01-14",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://pinpointparking.net/blog/how-much-does-asphalt-paving-cost"
  }
};

const breadcrumbSchema = {
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
      "name": "Blog",
      "item": "https://pinpointparking.net/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Asphalt Paving Cost Guide",
      "item": "https://pinpointparking.net/blog/how-much-does-asphalt-paving-cost"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does it cost to pave a driveway in Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In Southern Illinois, asphalt driveway paving typically costs $3-$7 per square foot, or $2,500-$6,000 for an average 2-car driveway. Factors like base preparation, thickness, and accessibility affect final pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Is asphalt cheaper than concrete?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, asphalt is typically 30-40% cheaper than concrete upfront. Asphalt costs $3-$7 per square foot while concrete costs $5-$10 per square foot in Southern Illinois."
      }
    },
    {
      "@type": "Question",
      "name": "How long does an asphalt driveway last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A properly installed and maintained asphalt driveway lasts 20-30 years. Regular sealcoating every 2-3 years and prompt crack repairs can maximize lifespan."
      }
    }
  ]
};

export default function AsphaltPavingCostPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Article Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="current">Asphalt Paving Cost Guide</span>
          </nav>
          <h1>How Much Does Asphalt Paving Cost in 2026?</h1>
          <p>Complete pricing guide for driveways and parking lots in Southern Illinois</p>
        </div>
      </section>

      {/* Article Content */}
      <article className="service-content">
        {/* Author Byline */}
        <div className="container" style={{ marginTop: '24px', marginBottom: '-24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#666' }}>
            <span>Written by <strong>Tyson</strong>, Disabled Army Veteran &amp; Founder of Pinpoint Parking</span>
            <span>•</span>
            <span>Updated January 2026</span>
          </div>
        </div>
        <div className="container">
          <div className="service-layout">
            <div className="service-main">
              <p><strong>Quick Answer:</strong> Asphalt paving in Southern Illinois costs <strong>$3-$7 per square foot</strong> for residential driveways and <strong>$2.50-$5 per square foot</strong> for larger commercial parking lots. A typical 2-car driveway (600 sq ft) costs between $2,500-$6,000 installed.</p>

              <h2>Asphalt Paving Cost by Project Type</h2>

              <h3>Residential Driveway Costs</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Driveway Size</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Square Feet</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Cost Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Single Car</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>200-400 sq ft</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$1,200-$2,800</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Two Car</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>400-600 sq ft</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$2,400-$4,200</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Three Car</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>600-900 sq ft</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$3,600-$6,300</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Long/Circular</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>1,000+ sq ft</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$5,000+</td>
                  </tr>
                </tbody>
              </table>

              <h3>Commercial Parking Lot Costs</h3>
              <p>Commercial projects typically cost less per square foot due to economies of scale:</p>
              <ul>
                <li><strong>Small lot (10-20 spaces):</strong> $8,000-$20,000</li>
                <li><strong>Medium lot (20-50 spaces):</strong> $20,000-$50,000</li>
                <li><strong>Large lot (50+ spaces):</strong> $50,000+</li>
              </ul>

              <h2>Factors That Affect Asphalt Paving Cost</h2>

              <h3>1. Site Preparation</h3>
              <p>The condition of your existing surface significantly impacts cost:</p>
              <ul>
                <li><strong>New construction on prepared base:</strong> Lowest cost</li>
                <li><strong>Removing old asphalt:</strong> Add $1-$3 per square foot</li>
                <li><strong>Removing concrete:</strong> Add $2-$4 per square foot</li>
                <li><strong>Grading and base work:</strong> Add $1-$2 per square foot</li>
              </ul>

              <h3>2. Asphalt Thickness</h3>
              <p>Thicker asphalt costs more but lasts longer:</p>
              <ul>
                <li><strong>2 inches:</strong> Light residential use (lowest cost)</li>
                <li><strong>3 inches:</strong> Standard residential driveways</li>
                <li><strong>4+ inches:</strong> Heavy traffic, commercial use</li>
              </ul>

              <h3>3. Base Material</h3>
              <p>A proper aggregate base is essential for longevity:</p>
              <ul>
                <li><strong>4-6 inch base:</strong> Standard for driveways</li>
                <li><strong>8-12 inch base:</strong> Required for parking lots and heavy use</li>
              </ul>

              <h3>4. Accessibility</h3>
              <p>Difficult access increases labor and equipment costs:</p>
              <ul>
                <li>Narrow access points</li>
                <li>Steep grades</li>
                <li>Distance from road</li>
                <li>Obstacles requiring hand work</li>
              </ul>

              <h2>Asphalt vs. Concrete: Cost Comparison</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Factor</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Asphalt</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--gray-300)' }}>Concrete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Installation Cost</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$3-$7/sq ft</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>$5-$10/sq ft</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Lifespan</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>20-30 years</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>30-40 years</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Maintenance Cost</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Higher (sealcoating)</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Lower</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Repair Cost</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Lower, easier</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Higher, harder</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Best For</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Cold climates</td>
                    <td style={{ padding: '12px', border: '1px solid var(--gray-300)' }}>Hot climates</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>For Southern Illinois:</strong> Asphalt is generally the better choice due to our freeze-thaw cycles. Asphalt flexes with temperature changes, while concrete can crack.</p>

              <h2>How to Save Money on Asphalt Paving</h2>
              <ol>
                <li><strong>Get multiple quotes:</strong> Always compare at least 3 estimates</li>
                <li><strong>Time it right:</strong> Late spring and early fall often have better pricing</li>
                <li><strong>Combine with neighbors:</strong> Contractors may offer discounts for multiple jobs in one area</li>
                <li><strong>Prepare the site:</strong> Clear vegetation and obstacles yourself</li>
                <li><strong>Consider overlay:</strong> If your base is solid, resurfacing costs less than full replacement</li>
              </ol>

              <h2>Red Flags When Getting Quotes</h2>
              <ul>
                <li>Prices significantly below competitors (corners will be cut)</li>
                <li>No written contract or warranty</li>
                <li>Demanding full payment upfront</li>
                <li>No physical business address</li>
                <li>Pressure to decide immediately</li>
              </ul>

              <h2>Frequently Asked Questions</h2>

              <h3>How much does it cost to pave a driveway in Illinois?</h3>
              <p>In Southern Illinois, asphalt driveway paving typically costs $3-$7 per square foot, or $2,500-$6,000 for an average 2-car driveway. Factors like base preparation, thickness, and accessibility affect final pricing.</p>

              <h3>Is asphalt cheaper than concrete?</h3>
              <p>Yes, asphalt is typically 30-40% cheaper than concrete upfront. Asphalt costs $3-$7 per square foot while concrete costs $5-$10 per square foot in Southern Illinois.</p>

              <h3>How long does an asphalt driveway last?</h3>
              <p>A properly installed and maintained asphalt driveway lasts 20-30 years. Regular <Link href="/services/sealcoating">sealcoating</Link> every 2-3 years and prompt <Link href="/services/crack-filling">crack repairs</Link> can maximize lifespan.</p>

              <h2>Get a Free Estimate</h2>
              <p>Ready to get an accurate price for your project? Pinpoint Parking provides free, detailed estimates for driveways and parking lots throughout Southern Illinois. We&apos;ll assess your specific situation and provide honest recommendations.</p>

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
                <h3>Get Your Free Quote</h3>
                <p>Accurate pricing for your specific project.</p>
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
                  <li><Link href="/services/asphalt-paving">Asphalt Paving</Link></li>
                  <li><Link href="/services/sealcoating">Sealcoating</Link></li>
                  <li><Link href="/services/crack-filling">Crack Filling</Link></li>
                </ul>
              </div>

              <div className="sidebar-services">
                <h4>Related Articles</h4>
                <ul>
                  <li><Link href="/blog/asphalt-vs-concrete-driveway">Asphalt vs Concrete</Link></li>
                  <li><Link href="/blog/how-long-does-asphalt-last">How Long Does Asphalt Last?</Link></li>
                  <li><Link href="/blog/best-time-to-pave-driveway">Best Time to Pave</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Ready for Your Free Estimate?</h2>
          <p>Get accurate pricing for your asphalt paving project.</p>
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
