import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import './Home.css';

const inquiryCategories = [
  'General inquiry',
  'Service consultation or quotation',
  'Partnership proposal',
  'Government or institutional contract opportunity',
  'NGO or development project collaboration',
];

function formatApiError(error) {
  if (!error) return 'Failed to send inquiry.';
  if (error.body && typeof error.body === 'object') {
    const parts = [];
    Object.keys(error.body).forEach((key) => {
      const val = error.body[key];
      const text = Array.isArray(val) ? val.join(' ') : String(val);
      parts.push(`${key}: ${text}`);
    });
    if (parts.length) return parts.join(' ');
  }
  return error.message || `Request failed (${error.status || 0})`;
}

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '', organization: '', email: '', phone: '', category: '', subject: '', message: '',
  });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', category: '', message: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = { name: '', email: '', phone: '', category: '', message: '' };
    let valid = true;
    if (!formData.name.trim()) { newErrors.name = 'Please enter your name.'; valid = false; }
    if (!formData.email.trim()) { newErrors.email = 'Please enter your email address.'; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = 'Please enter a valid email address.'; valid = false; }
    if (!formData.phone.trim()) { newErrors.phone = 'Please enter your phone number.'; valid = false; }
    if (!formData.category) { newErrors.category = 'Please select an inquiry category.'; valid = false; }
    if (!formData.message.trim()) { newErrors.message = 'Please enter a message.'; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setStatus({ type: 'info', message: 'Sending your inquiry...' });
    try {
      const message = formData.subject.trim()
        ? `Subject: ${formData.subject.trim()}\n\n${formData.message.trim()}`
        : formData.message.trim();
      const created = await api.post('/inquiries/', {
        name: formData.name.trim(),
        organization: formData.organization.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        topic: formData.category,
        message,
        source: 'website',
      });
      setStatus({
        type: 'success',
        message: created && created.reference
          ? `Your inquiry has been received. Reference: ${created.reference}`
          : 'Your inquiry has been received successfully.',
      });
      setFormData({ name: '', organization: '', email: '', phone: '', category: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: formatApiError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="contact-hero-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow">CONTACT • INQUIRIES • PARTNERSHIPS</p>
            <h1 id="contact-hero-title" className="home-hero-title">Discuss your requirement with a team that responds.</h1>
            <p className="home-hero-text">
              Technical service requests, project briefs, support requests, partnership proposals and institutional opportunities all go through the same door. We aim to respond within one business day.
            </p>
            <div className="home-hero-actions">
              <a href="mailto:info@primehorizon.et" className="home-btn home-btn-primary">Email Us</a>
              <a href="tel:+251911000000" className="home-btn home-btn-outline">Call +251 911 000 000</a>
            </div>
          </div>
          <div className="home-hero-visual" aria-hidden="true">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Abstract contact illustration">
              <rect x="24" y="24" width="432" height="312" rx="24" fill="#f1f5f9" />
              <rect x="90" y="90" width="300" height="180" rx="16" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
              <path d="M90 110l150 95 150-95" stroke="#2563eb" strokeWidth="2" />
              <circle cx="120" cy="240" r="18" fill="#0d9488" opacity="0.15" />
              <circle cx="360" cy="240" r="18" fill="#0d9488" opacity="0.15" />
            </svg>
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="contact-form-title">
        <div className="home-container">
          <div className="split" style={{ alignItems: 'start', gap: '44px' }}>
            <div style={{ flex: 1 }}>
              <p className="home-eyebrow">INQUIRY FORM</p>
              <h2 id="contact-form-title" style={{ marginBottom: '22px' }}>Send an inquiry</h2>
              {status && (
                <div className="alert" style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: status.type === 'success' ? '#e7f6f3' : status.type === 'error' ? '#fdedec' : '#eef3f9', color: status.type === 'success' ? 'var(--green-600)' : status.type === 'error' ? 'var(--red-500)' : 'var(--navy-800)', border: '1px solid ' + (status.type === 'success' ? 'var(--teal-100)' : status.type === 'error' ? '#fecaca' : 'var(--border)') }}>
                  {status.message}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contact-name">Full name <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input id="contact-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-organization">Organization</label>
                    <input id="contact-organization" type="text" name="organization" value={formData.organization} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input id="contact-email" type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input id="contact-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder="+251 ..." />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-category">Inquiry category <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <select id="contact-category" name="category" value={formData.category} onChange={handleChange} required className="form-control">
                      <option value="">Select a category</option>
                      {inquiryCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && <span className="error-msg">{errors.category}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-subject">Subject</label>
                    <input id="contact-subject" type="text" name="subject" value={formData.subject} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="contact-message">Message or project requirements <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} required className="form-control" rows={5} />
                    {errors.message && <span className="error-msg">{errors.message}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Inquiry'}
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  Submissions are sent to the company management portal. We respond within one business day.
                </p>
              </form>
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <p className="home-eyebrow">REACH US DIRECTLY</p>
              <h2 style={{ marginBottom: '22px' }}>Office & operations</h2>
              <ul className="value-list" style={{ marginTop: 0 }}>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>??</span>
                  <div>
                    <h4>Office</h4>
                    <p>Bole Sub-city, Addis Ababa, Ethiopia<br /><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visits by appointment.</span></p>
                  </div>
                </li>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>??</span>
                  <div>
                    <h4>Phone</h4>
                    <p><a href="tel:+251911000000">+251 911 000 000</a><br /><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Operations desk, Mon-Sat 8:00-17:30</span></p>
                  </div>
                </li>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>??</span>
                  <div>
                    <h4>Email</h4>
                    <p><a href="mailto:info@primehorizon.et">info@primehorizon.et</a><br /><a href="mailto:careers@primehorizon.et">careers@primehorizon.et</a></p>
                  </div>
                </li>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>?</span>
                  <div>
                    <h4>Hours</h4>
                    <p>Monday - Saturday, 8:00 - 17:30<br /><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Emergency support for contract clients: 24/7</span></p>
                  </div>
                </li>
              </ul>
              <div className="card" style={{ marginTop: '26px' }}>
                <h3>Shareholder & staff portal</h3>
                <p style={{ marginTop: '8px' }}>Capital contributions, project records and reports live in the management portal, not on this public site.</p>
                <Link to="/portal" className="btn btn-outline btn-sm" style={{ marginTop: '14px' }}>Open Portal Login</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="contact-cta-title">
        <div className="home-container home-cta-inner">
          <h2 id="contact-cta-title">Not sure where to start?</h2>
          <p>Send a short description of your requirement and we will guide you to the right service or next step.</p>
          <div className="home-cta-actions">
            <Link to="/services" className="home-btn home-btn-light">Explore Services</Link>
            <Link to="/partnership" className="home-btn home-btn-ghost-light">Partnership Request</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;