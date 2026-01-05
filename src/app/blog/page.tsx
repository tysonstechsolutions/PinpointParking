import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asphalt Paving Blog | Tips, Guides & Cost Information',
  description: 'Expert tips, guides, and cost information about asphalt paving, sealcoating, and pavement maintenance for Southern Illinois homeowners and businesses.',
  keywords: 'asphalt paving blog, driveway tips, parking lot maintenance guide, sealcoating information',
  alternates: {
    canonical: 'https://pinpointparking.net/blog',
  },
};

const blogPosts = [
  {
    title: 'How Much Does Asphalt Paving Cost in 2025?',
    excerpt: 'Complete pricing guide for driveways and parking lots in Southern Illinois. Learn what affects cost and how to save money.',
    date: 'January 2025',
    category: 'Costs',
    href: '/blog/how-much-does-asphalt-paving-cost',
    featured: true,
  },
  {
    title: 'Asphalt vs Concrete Driveway: Which is Better?',
    excerpt: 'Compare asphalt and concrete for Southern Illinois homes. Cost, durability, maintenance, and which handles freeze-thaw better.',
    date: 'January 2025',
    category: 'Driveways',
    href: '/blog/asphalt-vs-concrete-driveway',
    featured: true,
  },
  {
    title: 'When to Sealcoat Your Driveway',
    excerpt: 'Learn the best time to sealcoat in Southern Illinois. Ideal temperatures, seasons, and how often to sealcoat.',
    date: 'January 2025',
    category: 'Sealcoating',
    href: '/blog/when-to-sealcoat-driveway',
  },
  {
    title: '7 Signs You Need a New Driveway',
    excerpt: 'Know when it\'s time to repair vs replace. Alligator cracks, drainage issues, and warning signs you shouldn\'t ignore.',
    date: 'January 2025',
    category: 'Maintenance',
    href: '/blog/signs-you-need-new-driveway',
  },
  {
    title: 'How Long Does an Asphalt Driveway Last?',
    excerpt: 'Asphalt driveways last 20-30 years with proper maintenance. Learn factors affecting lifespan and how to extend it.',
    date: 'January 2025',
    category: 'Driveways',
    href: '/blog/how-long-does-asphalt-last',
  },
  {
    title: 'Complete Parking Lot Maintenance Guide',
    excerpt: 'Everything business owners need to know about maintaining commercial parking lots. Schedules, costs, and best practices.',
    date: 'January 2025',
    category: 'Commercial',
    href: '/blog/parking-lot-maintenance-guide',
  },
  {
    title: 'ADA Parking Lot Requirements Guide',
    excerpt: 'ADA parking requirements for Illinois businesses. Number of spaces, dimensions, signage, and how to avoid fines.',
    date: 'January 2025',
    category: 'Commercial',
    href: '/blog/ada-parking-lot-requirements',
  },
  {
    title: 'Best Time to Pave a Driveway',
    excerpt: 'Seasonal guide for asphalt paving in Southern Illinois. Best months, weather conditions, and planning tips.',
    date: 'January 2025',
    category: 'Driveways',
    href: '/blog/best-time-to-pave-driveway',
  },
  {
    title: 'How to Fix Driveway Cracks',
    excerpt: 'DIY vs professional crack repair. Types of cracks, repair methods, and when to call a professional.',
    date: 'January 2025',
    category: 'Maintenance',
    href: '/blog/how-to-fix-driveway-cracks',
  },
  {
    title: 'Commercial Parking Lot Paving Costs',
    excerpt: 'How much does a commercial parking lot cost? Pricing by size, factors affecting cost, and ROI for businesses.',
    date: 'January 2025',
    category: 'Commercial',
    href: '/blog/commercial-parking-lot-costs',
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">Blog</span>
          </nav>
          <h1>Paving Tips &amp; Guides</h1>
          <p>Expert information about asphalt paving, sealcoating, costs, and maintenance for Southern Illinois.</p>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="services" style={{ backgroundColor: 'var(--gray-50)', paddingBottom: '40px' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '30px' }}>
            <span className="section-label" style={{ color: 'var(--yellow-dark)' }}>Featured Guides</span>
            <h2>Most Popular Articles</h2>
          </div>
          <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {featuredPosts.map((post) => (
              <Link href={post.href} key={post.title} style={{ textDecoration: 'none' }}>
                <article className="blog-card" style={{ backgroundColor: 'var(--white)', border: '2px solid var(--yellow)', height: '100%' }}>
                  <div className="blog-card-content" style={{ padding: '24px' }}>
                    <div className="blog-card-meta" style={{ color: 'var(--yellow-dark)', fontWeight: '600' }}>{post.category}</div>
                    <h3 style={{ color: 'var(--black)', marginBottom: '12px' }}>{post.title}</h3>
                    <p style={{ color: 'var(--gray-600)' }}>{post.excerpt}</p>
                    <span className="service-link" style={{ color: 'var(--yellow-dark)', marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      Read Guide
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="services" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '30px' }}>
            <h2>All Articles</h2>
          </div>
          <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {regularPosts.map((post) => (
              <Link href={post.href} key={post.title} style={{ textDecoration: 'none' }}>
                <article className="blog-card" style={{ backgroundColor: 'var(--gray-50)', height: '100%' }}>
                  <div className="blog-card-content" style={{ padding: '24px' }}>
                    <div className="blog-card-meta" style={{ color: 'var(--gray-500)' }}>{post.date} • {post.category}</div>
                    <h3 style={{ color: 'var(--black)', marginBottom: '12px' }}>{post.title}</h3>
                    <p style={{ color: 'var(--gray-600)' }}>{post.excerpt}</p>
                    <span className="service-link" style={{ color: 'var(--black)', marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      Read More
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Have Questions About Your Pavement?</h2>
          <p>Contact us for a free consultation. We&apos;re happy to assess your property and provide honest recommendations.</p>
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
