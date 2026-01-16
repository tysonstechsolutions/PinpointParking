import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Work | Before & After Project Gallery',
  description: 'See real before and after photos of our asphalt paving, sealcoating, and parking lot projects in Southern Illinois. Quality work you can trust.',
  keywords: 'asphalt paving photos, sealcoating before after, parking lot paving gallery, driveway paving examples, Southern Illinois contractor work',
};

// Placeholder projects - replace with real photos
const projects = [
  {
    id: 1,
    title: "Commercial Parking Lot - Mount Vernon",
    category: "Asphalt Paving",
    description: "Complete parking lot installation for local business. 15,000 sq ft with proper drainage and striping.",
    location: "Mount Vernon, IL",
    beforeImage: "/images/projects/placeholder-before.jpg",
    afterImage: "/images/projects/placeholder-after.jpg",
  },
  {
    id: 2,
    title: "Residential Driveway - Carbondale",
    category: "Asphalt Paving",
    description: "New asphalt driveway installation. 800 sq ft with proper base preparation.",
    location: "Carbondale, IL",
    beforeImage: "/images/projects/placeholder-before.jpg",
    afterImage: "/images/projects/placeholder-after.jpg",
  },
  {
    id: 3,
    title: "Sealcoating - Marion Shopping Center",
    category: "Sealcoating",
    description: "Full sealcoating application to extend pavement life. 25,000 sq ft commercial lot.",
    location: "Marion, IL",
    beforeImage: "/images/projects/placeholder-before.jpg",
    afterImage: "/images/projects/placeholder-after.jpg",
  },
  {
    id: 4,
    title: "Church Parking Lot - Centralia",
    category: "Full Renovation",
    description: "Complete tear-out and replacement with new asphalt, drainage, and ADA-compliant striping.",
    location: "Centralia, IL",
    beforeImage: "/images/projects/placeholder-before.jpg",
    afterImage: "/images/projects/placeholder-after.jpg",
  },
  {
    id: 5,
    title: "Apartment Complex - Herrin",
    category: "Crack Filling & Sealcoating",
    description: "Crack repair and sealcoating to restore aging parking lot. Extended life by 10+ years.",
    location: "Herrin, IL",
    beforeImage: "/images/projects/placeholder-before.jpg",
    afterImage: "/images/projects/placeholder-after.jpg",
  },
  {
    id: 6,
    title: "Medical Office - Salem",
    category: "Line Striping",
    description: "Professional ADA-compliant striping with handicap spaces, directional arrows, and fire lanes.",
    location: "Salem, IL",
    beforeImage: "/images/projects/placeholder-before.jpg",
    afterImage: "/images/projects/placeholder-after.jpg",
  },
];

const categories = ["All", "Asphalt Paving", "Sealcoating", "Line Striping", "Full Renovation"];

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">Project Gallery</span>
          </nav>
          <h1>Our Work Speaks for Itself</h1>
          <p>Real projects. Real results. See the quality difference.</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="section-sm bg-yellow">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5.0</span>
              <span className="stat-label">Google Rating</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Our Own Crew</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Notice */}
      <section className="section bg-gray-100">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="bg-yellow/20 border border-yellow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-2">📸 Gallery Coming Soon!</h2>
              <p className="text-gray-600">
                We&apos;re currently photographing our recent projects to showcase our work.
                In the meantime, <Link href="/contact" className="text-black font-semibold underline">contact us</Link> and
                we&apos;d be happy to share photos of similar projects or provide references in your area.
              </p>
            </div>
          </div>

          {/* Placeholder Project Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                {/* Before/After Placeholder */}
                <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Before & After Photo Coming Soon</p>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-black text-yellow text-xs font-bold px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Our Work Stands Out</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Proper Preparation</h3>
                <p className="text-gray-400 text-sm">We don&apos;t cut corners on base work. Proper preparation means your pavement lasts.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Our Own Crew</h3>
                <p className="text-gray-400 text-sm">We never subcontract. Our trained team does every job, ensuring consistent quality.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Fully Insured</h3>
                <p className="text-gray-400 text-sm">Licensed and insured for your protection. Ask us for proof of insurance anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Ready to Transform Your Property?</h2>
          <p>Get a free quote for your paving or sealcoating project.</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn btn-dark btn-lg">
              Get Free Quote
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
