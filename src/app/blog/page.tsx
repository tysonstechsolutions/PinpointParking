import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | Pinpoint Parking',
  description: 'Tips, guides, and news about asphalt paving, sealcoating, and pavement maintenance from Pinpoint Parking in Southern Illinois.',
};

const blogPosts = [
  {
    title: 'When Is the Best Time to Sealcoat Your Driveway?',
    excerpt: 'Learn the optimal timing for sealcoating in Southern Illinois to maximize protection and get the best results from your investment.',
    date: 'January 2025',
    category: 'Sealcoating',
  },
  {
    title: '5 Signs Your Parking Lot Needs Professional Attention',
    excerpt: 'Don\'t wait for small problems to become big expenses. Here are the warning signs every property manager should watch for.',
    date: 'December 2024',
    category: 'Maintenance',
  },
  {
    title: 'Asphalt vs. Concrete: Which Is Right for Your Driveway?',
    excerpt: 'A practical comparison of asphalt and concrete driveways for Southern Illinois homeowners, including costs, maintenance, and longevity.',
    date: 'November 2024',
    category: 'Asphalt Paving',
  },
  {
    title: 'How to Extend the Life of Your Asphalt Parking Lot',
    excerpt: 'Simple maintenance tips that can help commercial property owners get more years out of their pavement investment.',
    date: 'October 2024',
    category: 'Maintenance',
  },
  {
    title: 'Understanding ADA Parking Requirements',
    excerpt: 'A guide to ADA compliance for parking lots, including the number of spaces required and proper signage and striping.',
    date: 'September 2024',
    category: 'Line Striping',
  },
  {
    title: 'Why Crack Filling Should Be Your First Priority',
    excerpt: 'Small cracks lead to big problems. Learn why addressing cracks early is the most cost-effective pavement maintenance strategy.',
    date: 'August 2024',
    category: 'Crack Filling',
  },
];

export default function BlogPage() {
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
          <h1>Paving Tips &amp; Insights</h1>
          <p>Helpful information about asphalt paving, maintenance, and keeping your pavement in great condition.</p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="services" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article className="blog-card" key={post.title}>
                <div className="blog-card-image"></div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">{post.date} • {post.category}</div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="service-link">
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </article>
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
