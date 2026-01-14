import Link from 'next/link';
import Image from 'next/image';
import HeroVideo from '@/components/HeroVideo';

const services = [
  {
    title: 'Asphalt Paving',
    description: 'New driveways, parking lots, and roads built to last. Expert installation with proper base preparation and drainage.',
    href: '/services/asphalt-paving',
    image: '/media/parking-lot-aerial-2.jpg',
  },
  {
    title: 'Sealcoating',
    description: 'Protect and extend the life of your asphalt with professional sealcoating. Guards against UV rays, water, and chemicals.',
    href: '/services/sealcoating',
    image: '/media/parking-lot-aerial.jpg',
  },
  {
    title: 'Line Striping',
    description: 'ADA-compliant parking lot striping, traffic markings, and custom layouts. Crisp, visible lines that last.',
    href: '/services/line-striping',
    image: '/media/ada-striping.jpg',
  },
  {
    title: 'Crack Filling',
    description: 'Stop cracks before they spread. Professional crack sealing prevents water infiltration and costly repairs.',
    href: '/services/crack-filling',
    image: '/media/crack-filling.jpg',
  },
  {
    title: 'Pothole Repair',
    description: 'Fast, permanent pothole repairs that eliminate hazards and restore smooth surfaces. Same-week service available.',
    href: '/services/pothole-repair',
    image: '/media/pothole-repair.jpg',
  },
];

const areas = [
  { name: 'Mount Vernon', description: 'Our home base at the crossroads of I-57 and I-64', href: '/locations/mount-vernon', featured: true },
  { name: 'Carbondale', description: 'Home of SIU • 44 miles', href: '/locations/carbondale' },
  { name: 'Marion', description: 'Williamson County • 41 miles', href: '/locations/marion' },
  { name: 'Centralia', description: 'Railroad hub • 19 miles', href: '/locations/centralia' },
  { name: 'Herrin', description: 'Williamson County • 36 miles', href: '/locations/herrin' },
  { name: 'Salem', description: 'Marion County • 22 miles', href: '/locations/salem' },
  { name: 'Benton', description: 'Franklin County • 22 miles', href: '/locations/benton' },
  { name: 'West Frankfort', description: 'Franklin County • 29 miles', href: '/locations/west-frankfort' },
];

const faqs = [
  {
    question: 'How much does asphalt paving cost?',
    answer: 'Asphalt paving typically costs $3-$7 per square foot for residential driveways in Southern Illinois. Commercial projects vary based on size and site preparation needs. Contact us for a free, accurate quote for your specific project.',
  },
  {
    question: 'How long does sealcoating last?',
    answer: 'Quality sealcoating typically lasts 2-3 years depending on traffic and weather exposure. We recommend sealcoating every 2-3 years to maximize your asphalt\'s lifespan and appearance.',
  },
  {
    question: 'When is the best time to pave or sealcoat?',
    answer: 'The ideal season is late spring through early fall when temperatures are consistently above 50°F. In Southern Illinois, this typically means May through September for optimal results.',
  },
  {
    question: 'Do you work with commercial properties?',
    answer: 'Absolutely! We work with HOAs, property managers, churches, schools, retail centers, and businesses of all sizes. We can schedule work during off-hours to minimize disruption.',
  },
  {
    question: 'How far do you travel for projects?',
    answer: 'We serve all communities within a 45-mile radius of Mount Vernon, including Carbondale, Marion, Centralia, Salem, Herrin, and many more. If you\'re in Southern Illinois, give us a call!',
  },
  {
    question: 'How long before I can use my driveway after paving?',
    answer: 'For new asphalt, we recommend waiting 24-48 hours before driving on it and 5-7 days before parking for extended periods. For sealcoating, you can typically walk on it in 24 hours and drive on it in 48-72 hours.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <HeroVideo />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="hero-badge">Mount Vernon&apos;s #1 Rated Asphalt Contractor</div>
          <h1>Get Your FREE Asphalt Quote in 24 Hours</h1>
          <p className="hero-subtitle">
            Professional paving, sealcoating &amp; repairs for driveways and parking lots. Serving Mount Vernon and 45 miles of Southern Illinois. Same-week scheduling available.
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary btn-lg">
              Get FREE Estimate Now
            </Link>
            <a href="tel:6182147656" className="btn btn-outline btn-lg">
              Call (618) 214-7656
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-number">100%</span>
              <span className="trust-label">Satisfaction Guaranteed</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">24hr</span>
              <span className="trust-label">Quote Turnaround</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">$0</span>
              <span className="trust-label">For Estimates</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We Do</span>
            <h2>Complete Pavement Solutions</h2>
            <p>From new construction to maintenance and repairs, Pinpoint Parking delivers professional results for residential and commercial properties throughout Southern Illinois.</p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <Link href={service.href} className="service-card service-card-with-image" key={service.title}>
                <div className="service-image">
                  <Image src={service.image} alt={service.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <span className="service-link">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}

            <div className="service-card service-card-cta">
              <h3>Not Sure What You Need?</h3>
              <p>Our experts will assess your pavement and recommend the best solution for your budget and goals.</p>
              <Link href="/book" className="btn btn-primary">
                Get Instant Estimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us">
        <div className="container">
          <div className="why-us-content">
            <div className="why-us-text">
              <span className="section-label">Why Pinpoint Parking</span>
              <h2>Precision Work. Lasting Results.</h2>
              <p>We&apos;re not just another paving company. Pinpoint Parking combines technical expertise with genuine care for every project—whether it&apos;s a residential driveway or a commercial parking lot.</p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Quality Materials</h4>
                    <p>We use premium-grade asphalt and sealers that withstand Southern Illinois weather extremes.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Transparent Pricing</h4>
                    <p>Detailed quotes with no hidden fees. You know exactly what you&apos;re paying for before work begins.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>Local Expertise</h4>
                    <p>We understand Southern Illinois soil conditions, drainage needs, and climate challenges.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="benefit-content">
                    <h4>On-Time Completion</h4>
                    <p>We respect your schedule. Projects completed on time with minimal disruption to your property.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="why-us-image">
              <div className="image-frame">
                <Image
                  src="/media/parking-lot-aerial.jpg"
                  alt="Aerial view of a freshly sealcoated parking lot with yellow striping - Pinpoint Parking"
                  className="work-photo"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="stats-box">
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Satisfaction Rate</span>
                </div>
                <div className="stat">
                  <span className="stat-number">45mi</span>
                  <span className="stat-label">Service Radius</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="service-areas" id="areas">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Where We Work</span>
            <h2>Serving All of Southern Illinois</h2>
            <p>Based in Mount Vernon, we proudly serve communities within a 45-mile radius. If you&apos;re in Southern Illinois, we&apos;ve got you covered.</p>
          </div>

          <div className="areas-grid">
            {areas.map((area) => (
              <Link
                href={area.href}
                className={`area-card ${area.featured ? 'area-card-featured' : ''}`}
                key={area.name}
              >
                {area.featured && <div className="area-badge">Headquarters</div>}
                <h3>{area.name}</h3>
                <p>{area.description}</p>
              </Link>
            ))}
          </div>

          <div className="areas-cta">
            <p>Don&apos;t see your city? We likely serve your area too!</p>
            <Link href="/locations" className="btn btn-outline">
              View All Service Areas
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2>Simple, Straightforward Process</h2>
            <p>From first call to finished project, we make professional paving easy.</p>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">01</div>
              <h3>Free Consultation</h3>
              <p>Call us or fill out our form. We&apos;ll discuss your project and schedule a free on-site assessment.</p>
            </div>

            <div className="process-connector"></div>

            <div className="process-step">
              <div className="step-number">02</div>
              <h3>Detailed Quote</h3>
              <p>We&apos;ll provide a comprehensive, transparent quote with all costs clearly explained.</p>
            </div>

            <div className="process-connector"></div>

            <div className="process-step">
              <div className="step-number">03</div>
              <h3>Professional Work</h3>
              <p>Our experienced crew completes your project on schedule using quality materials.</p>
            </div>

            <div className="process-connector"></div>

            <div className="process-step">
              <div className="step-number">04</div>
              <h3>Final Walkthrough</h3>
              <p>We review the completed work with you to ensure your complete satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-pattern"></div>
        <div className="container cta-content">
          <h2>Get Your FREE Quote Today</h2>
          <p>Most quotes delivered within 24 hours. We measure your property using satellite imagery - no waiting around for an on-site visit. 100% free, no obligation.</p>
          <div className="cta-buttons">
            <Link href="/book" className="btn btn-dark btn-lg">
              Get FREE Estimate Now
            </Link>
            <a href="tel:6182147656" className="btn btn-outline-dark btn-lg">
              Call (618) 214-7656
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Questions?</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq) => (
              <div className="faq-item" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
