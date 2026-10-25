import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import './Home.css';

const expertiseAreas = [
  { title: 'IT Support & Administration', text: 'Helpdesk, user administration, backups, endpoint protection and routine system maintenance.' },
  { title: 'Networking & Infrastructure', text: 'Structured cabling, LAN/Wi-Fi design, server rooms and network documentation.' },
  { title: 'Cybersecurity', text: 'Security hardening, access control, backup resilience and incident-readiness support.' },
  { title: 'Software Development', text: 'Web applications, internal portals, dashboards and API integrations.' },
  { title: 'Electrical Services', text: 'Building and industrial wiring, distribution boards, lighting, earthing and fault finding.' },
  { title: 'Power & Energy', text: 'Generator systems, solar-hybrid backup, load studies and energy audits.' },
];

function formatApiError(error) {
  if (!error) return 'Failed to submit expression of interest.';
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

export const Careers = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', area: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = { name: '', email: '', phone: '', message: '' };
    let valid = true;
    if (!formData.name.trim()) { newErrors.name = 'Please enter your name.'; valid = false; }
    if (!formData.email.trim()) { newErrors.email = 'Please enter your email address.'; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = 'Please enter a valid email address.'; valid = false; }
    if (!formData.phone.trim()) { newErrors.phone = 'Please enter your phone number.'; valid = false; }
    if (!formData.message.trim()) { newErrors.message = 'Please describe your experience and availability.'; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setStatus({ type: 'info', message: 'Submitting your expression of interest...' });
    try {
      const message = formData.area.trim()
        ? `Area of interest: ${formData.area.trim()}\n\n${formData.message.trim()}`
        : formData.message.trim();
      const created = await api.post('/inquiries/', {
        name: formData.name.trim(),
        organization: '',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        topic: 'Career Opportunity',
        message,
        source: 'website',
      });
      setStatus({
        type: 'success',
        message: created && created.reference
          ? `Your expression of interest has been received. Reference: ${created.reference}`
          : 'Your expression of interest has been received successfully.',
      });
      setFormData({ name: '', email: '', phone: '', area: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: formatApiError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="careers-hero-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow">CAREERS • SKILLS • PROFESSIONAL CONTRIBUTION</p>
            <h1 id="careers-hero-title" className="home-hero-title">Contribute your skills to practical technical work.</h1>
            <p className="home-hero-text">
              Prime Horizon Group Plc values professionals who can support clients with dependable technical work, clear communication and accountable delivery. We welcome expressions of interest from skilled contributors as project demand grows.
            </p>
            <div className="home-hero-actions">
              <a href="mailto:careers@primehorizon.et" className="home-btn home-btn-primary">Email a CV</a>
              <Link to="/contact" className="home-btn home-btn-outline">Contact Us</Link>
            </div>
          </div>
          <div className="home-hero-visual" aria-hidden="true">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Abstract team illustration">
              <rect x="24" y="24" width="432" height="312" rx="24" fill="#f1f5f9" />
              <circle cx="150" cy="150" r="44" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
              <circle cx="240" cy="150" r="44" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              <circle cx="330" cy="150" r="44" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <path d="M106 250c0-24 20-40 44-40s44 16 44 40" stroke="#94a3b8" strokeWidth="2" />
              <path d="M196 250c0-24 20-40 44-40s44 16 44 40" stroke="#94a3b8" strokeWidth="2" />
              <path d="M286 250c0-24 20-40 44-40s44 16 44 40" stroke="#94a3b8" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="careers-intro-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">WHO WE ARE</p>
            <h2 id="careers-intro-title">A professional place to contribute skills and support clients</h2>
            <p>
              Prime Horizon Group Plc brings together expertise in engineering, electrical power, information technology, telecommunications, cybersecurity, software development and research. We value people who can turn that expertise into reliable services, practical solutions and documented outcomes.
            </p>
          </div>
          <div className="home-values-grid">
            <article className="home-value-card">
              <h3>Practical contribution</h3>
              <p>Work that addresses real client requirements rather than abstract promises.</p>
            </article>
            <article className="home-value-card">
              <h3>Accountable delivery</h3>
              <p>Clear scope, tracked execution, documented handover and responsible communication.</p>
            </article>
            <article className="home-value-card">
              <h3>Continuous learning</h3>
              <p>Exposure to technical, operational and research-oriented problem solving.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted" aria-labelledby="careers-areas-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">AREAS OF CONTRIBUTION</p>
            <h2 id="careers-areas-title">Where contributors may add value</h2>
            <p>These areas reflect verified business activities. They are not job advertisements or hiring guarantees.</p>
          </div>
          <div className="home-feature-grid">
            {expertiseAreas.map((area) => (
              <article className="home-feature-card" key={area.title}>
                <h3>{area.title}</h3>
                <p>{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="careers-openings-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">CURRENT OPENINGS</p>
            <h2 id="careers-openings-title">Verified vacancies</h2>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px', boxShadow: 'var(--shadow-sm)', maxWidth: '760px' }}>
            <h3 style={{ marginBottom: '10px' }}>No current openings are listed</h3>
            <p style={{ margin: 0 }}>
              We do not publish unverified vacancies. When a reliable source confirms an opening, it will be listed here with role, division, requirements and application instructions.
            </p>
            <p className="home-note" style={{ marginTop: '18px' }}>
              You may still send an expression of interest below or email your CV to careers@primehorizon.et. We keep suitable candidates on file and reach out when a matching role opens.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="careers-eoi-title">
        <div className="home-container">
          <div className="split" style={{ alignItems: 'start', gap: '44px' }}>
            <div style={{ flex: 1 }}>
              <p className="home-eyebrow">EXPRESSION OF INTEREST</p>
              <h2 id="careers-eoi-title" style={{ marginBottom: '22px' }}>Send an open application</h2>
              {status && (
                <div className="alert" style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: status.type === 'success' ? '#e7f6f3' : status.type === 'error' ? '#fdedec' : '#eef3f9', color: status.type === 'success' ? 'var(--green-600)' : status.type === 'error' ? 'var(--red-500)' : 'var(--navy-800)', border: '1px solid ' + (status.type === 'success' ? 'var(--teal-100)' : status.type === 'error' ? '#fecaca' : 'var(--border)') }}>
                  {status.message}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="careers-name">Full name <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input id="careers-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="careers-email">Email <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input id="careers-email" type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="careers-phone">Phone <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <input id="careers-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder="+251 ..." />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="careers-area">Area of interest</label>
                    <select id="careers-area" name="area" value={formData.area} onChange={handleChange} className="form-control">
                      <option value="">Select an area</option>
                      {expertiseAreas.map((area) => (
                        <option key={area.title} value={area.title}>{area.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="careers-message">Experience and availability <span style={{ color: 'var(--red-500)' }}>*</span></label>
                    <textarea id="careers-message" name="message" value={formData.message} onChange={handleChange} required className="form-control" rows={5} />
                    {errors.message && <span className="error-msg">{errors.message}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Expression of Interest'}
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  This form sends your details to the company management portal. CVs and supporting documents should be emailed to careers@primehorizon.et so they can be reviewed securely.
                </p>
              </form>
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <p className="home-eyebrow">APPLICATION ROUTE</p>
              <h2 style={{ marginBottom: '22px' }}>How to apply</h2>
              <ul className="value-list" style={{ marginTop: 0 }}>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>1</span>
                  <div>
                    <h4>Send your CV</h4>
                    <p>Email your CV and a short note about your role to <a href="mailto:careers@primehorizon.et">careers@primehorizon.et</a>, or use the expression-of-interest form.</p>
                  </div>
                </li>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>2</span>
                  <div>
                    <h4>Initial review</h4>
                    <p>A short call confirms basics such as certificates, availability and expected compensation.</p>
                  </div>
                </li>
                <li>
                  <span className="vi" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>3</span>
                  <div>
                    <h4>Verification</h4>
                    <p>For operational roles this may include a practical assessment. Documents are verified before any offer.</p>
                  </div>
                </li>
              </ul>
              <div className="card" style={{ marginTop: '26px' }}>
                <h3>Supplier & partner applications</h3>
                <p style={{ marginTop: '8px' }}>We work with suppliers of electrical materials, IT equipment and technical services. Partners are onboarded with documented terms, tax documents and payment schedules.</p>
                <Link to="/partnership" className="btn btn-outline btn-sm" style={{ marginTop: '14px' }}>Submit a Partnership Request</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="careers-cta-title">
        <div className="home-container home-cta-inner">
          <h2 id="careers-cta-title">Not sure which area fits?</h2>
          <p>Send an open application. We keep good candidates on file and reach out when a matching opportunity opens.</p>
          <div className="home-cta-actions">
            <Link to="/contact" className="home-btn home-btn-light">Send Open Application</Link>
            <Link to="/partnership" className="home-btn home-btn-ghost-light">Partnership Request</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Careers;