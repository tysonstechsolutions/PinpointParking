'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    service: '',
    propertyType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits.length > 0 ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};

    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = true;
    if (!formData.phone.trim()) newErrors.phone = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Form submission would go here
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        service: '',
        propertyType: '',
        message: '',
      });
    }
  };

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="current">Contact</span>
          </nav>
          <h1>Contact Us</h1>
          <p>Ready to discuss your project? Get a free, no-obligation estimate. We typically respond within 24 hours.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="service-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form">
              <h2>Request Your Free Estimate</h2>
              <p>Fill out the form below and we&apos;ll get back to you within 24 hours with a detailed quote.</p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="John Smith"
                    className={errors.name ? 'error' : ''}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className={errors.email ? 'error' : ''}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    placeholder="(618) 555-1234"
                    className={errors.phone ? 'error' : ''}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">Job Site Location (City or Full Address)</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="Where is the work needed? (e.g., 123 Main St, Mount Vernon)"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Enter the address where the paving/sealcoating work will be done
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="service">Service Needed</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">Select a service...</option>
                    <option value="asphalt-paving">Asphalt Paving</option>
                    <option value="sealcoating">Sealcoating</option>
                    <option value="line-striping">Line Striping</option>
                    <option value="crack-filling">Crack Filling</option>
                    <option value="pothole-repair">Pothole Repair</option>
                    <option value="multiple">Multiple Services</option>
                    <option value="not-sure">Not Sure - Need Assessment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="property-type">Property Type</label>
                  <select
                    id="property-type"
                    name="property-type"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  >
                    <option value="">Select property type...</option>
                    <option value="residential">Residential (Home/Driveway)</option>
                    <option value="commercial">Commercial (Business/Parking Lot)</option>
                    <option value="hoa">HOA/Multi-Family</option>
                    <option value="municipal">Municipal/Government</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Project Details</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your project - approximate size, current condition, any specific concerns..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Send Request
                </button>
              </form>

              {submitted && (
                <div className="form-success">
                  <p>Thank you! We&apos;ll be in touch within 24 hours.</p>
                </div>
              )}
            </div>

            <div className="contact-info-section">
              <h2>Get In Touch</h2>
              <p>Prefer to talk directly? Give us a call or send an email. We&apos;re here to help with all your paving needs.</p>

              <div className="contact-details">
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <h4>Phone</h4>
                    <p><a href="tel:6182147656">(618) 214-7656</a></p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <h4>Email</h4>
                    <p><a href="mailto:pinpointparkingco@gmail.com">pinpointparkingco@gmail.com</a></p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <h4>Business Hours</h4>
                    <p>Monday - Friday: 7:00 AM - 6:00 PM<br/>Saturday: By Appointment<br/>Sunday: Closed</p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="contact-detail-content">
                    <h4>Service Area</h4>
                    <p>Mount Vernon, IL and all communities within a 45-mile radius including Carbondale, Marion, Centralia, Salem, and more.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '24px', backgroundColor: 'var(--gray-100)', borderRadius: '8px', borderLeft: '4px solid var(--yellow)' }}>
                <h4 style={{ marginBottom: '8px' }}>What Happens Next?</h4>
                <p style={{ marginBottom: 0, color: 'var(--gray-600)' }}>After you submit your request, we&apos;ll review your project details and reach out within 24 hours to schedule a free on-site assessment. There&apos;s no obligation—just honest advice and accurate pricing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
