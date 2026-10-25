import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Icon = ({ children }) => (
  <span className="home-icon" aria-hidden="true">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      {children}
    </svg>
  </span>
);

const ITIcon = () => <Icon><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" /></Icon>;
const NetworkIcon = () => <Icon><circle cx="12" cy="12" r="3" /><circle cx="4" cy="6" r="2" /><circle cx="20" cy="6" r="2" /><circle cx="4" cy="18" r="2" /><circle cx="20" cy="18" r="2" /><path d="M6 7l4 3" /><path d="M18 7l-4 3" /><path d="M6 17l4-3" /><path d="M18 17l-4-3" /></Icon>;
const ShieldIcon = () => <Icon><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></Icon>;
const CodeIcon = () => <Icon><path d="M8 9l-4 3 4 3" /><path d="M16 9l4 3-4 3" /><path d="M13 7l-2 10" /></Icon>;
const BoltIcon = () => <Icon><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Icon>;
const PowerIcon = () => <Icon><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Icon>;

const serviceAreas = [
  { icon: <ITIcon />, title: 'IT Support & Administration', text: 'Helpdesk, user accounts, backups, endpoint protection and routine system maintenance for organizations that need dependable IT without a full in-house team.', benefit: 'Benefit: keeps daily operations running and reduces avoidable downtime.' },
  { icon: <NetworkIcon />, title: 'Networking & IT Infrastructure', text: 'Structured cabling, LAN/Wi-Fi design, server rooms and network documentation delivered with tested, labelled handover packages.', benefit: 'Benefit: creates a reliable foundation for communication, data and future growth.' },
  { icon: <ShieldIcon />, title: 'Cybersecurity', text: 'Practical security hardening, access control, backup resilience and incident-readiness guidance for business and institutional environments.', benefit: 'Benefit: reduces exposure to common security risks and supports continuity planning.' },
  { icon: <CodeIcon />, title: 'Software Development & Digital Solutions', text: 'Custom web applications, internal portals, dashboards and API integrations shaped around actual workflows and reporting needs.', benefit: 'Benefit: replaces manual processes with tools that fit the organization.' },
  { icon: <BoltIcon />, title: 'Electrical Services', text: 'Building and industrial wiring, distribution boards, lighting, earthing and fault finding carried out by qualified personnel under permit.', benefit: 'Benefit: safer, compliant installations with documented inspection and handover.' },
  { icon: <PowerIcon />, title: 'Power & Energy Solutions', text: 'Generator supply, installation and servicing, solar-hybrid backup systems, load studies and energy audits.', benefit: 'Benefit: reduces downtime and helps control operating energy costs.' },
];

const audiences = [
  { title: 'Government & public institutions', text: 'Support for offices that need reliable IT, power, networking and documented delivery aligned with procurement, accountability and service-continuity requirements.' },
  { title: 'NGOs & development organizations', text: 'Practical technical support for project offices, field operations and program delivery, with clear scope, transparent communication and documented handover.' },
  { title: 'Private businesses & other organizations', text: 'Services for commercial, industrial and professional organizations seeking a dependable technical partner for planning, implementation and ongoing support.' },
];

const processSteps = [
  { number: '01', title: 'Understand requirements', text: 'Clarify the challenge, constraints, expected outcomes and operating environment.' },
  { number: '02', title: 'Propose a solution', text: 'Recommend a practical approach with scope, assumptions and estimated effort.' },
  { number: '03', title: 'Agree scope', text: 'Confirm deliverables, timeline, price and support terms in writing before work starts.' },
  { number: '04', title: 'Implement', text: 'Execute with a named responsible person, progress updates and quality checks.' },
  { number: '05', title: 'Support', text: 'Provide handover, documentation, warranty support and maintenance options.' },
];

export const Services = () => {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="services-hero-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow">ENGINEERING • TECHNOLOGY • PROFESSIONAL EXCELLENCE</p>
            <h1 id="services-hero-title" className="home-hero-title">Technical services delivered with precision and accountability.</h1>
            <p className="home-hero-text">
              Prime Horizon Group Plc provides IT, networking, cybersecurity, software development, electrical and power services for organizations that need dependable technical work, clear scope and documented handover.
            </p>
            <div className="home-hero-actions">
              <Link to="/contact" className="home-btn home-btn-primary">Request a Consultation</Link>
              <Link to="/contact" className="home-btn home-btn-outline">Contact Us</Link>
            </div>
          </div>
          <div className="home-hero-visual" aria-hidden="true">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Abstract service network illustration">
              <rect x="24" y="24" width="432" height="312" rx="24" fill="#f1f5f9" />
              <circle cx="120" cy="100" r="34" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
              <circle cx="240" cy="180" r="46" fill="url(#servicesHeroGrad)" />
              <circle cx="360" cy="100" r="34" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              <circle cx="150" cy="270" r="26" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <circle cx="330" cy="270" r="26" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <defs>
                <linearGradient id="servicesHeroGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <path d="M154 100h52" stroke="#94a3b8" strokeWidth="2" />
              <path d="M286 100h40" stroke="#94a3b8" strokeWidth="2" />
              <path d="M140 134l70 26" stroke="#94a3b8" strokeWidth="2" />
              <path d="M340 134l-70 26" stroke="#94a3b8" strokeWidth="2" />
              <path d="M176 270l40-56" stroke="#94a3b8" strokeWidth="2" />
              <path d="M304 270l-40-56" stroke="#94a3b8" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="services-areas-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">SERVICE AREAS</p>
            <h2 id="services-areas-title">What we can help you plan, deliver and support</h2>
            <p>Service descriptions reflect the capabilities already documented for Prime Horizon Group Plc. Scope, licensing and availability are confirmed during consultation.</p>
          </div>
          <div className="home-feature-grid">
            {serviceAreas.map((service) => (
              <article className="home-feature-card" key={service.title}>
                <div className="home-card-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--navy-800)', fontWeight: 600 }}>{service.benefit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted" aria-labelledby="services-audience-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">WHO WE SERVE</p>
            <h2 id="services-audience-title">Support shaped around real operating needs</h2>
            <p>We do not imply existing contracts or partnerships. We describe how verified services can support different types of organization.</p>
          </div>
          <div className="home-values-grid">
            {audiences.map((audience) => (
              <article className="home-value-card" key={audience.title}>
                <h3>{audience.title}</h3>
                <p>{audience.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="services-approach-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">OUR APPROACH</p>
            <h2 id="services-approach-title">A realistic process from requirement to support</h2>
            <p>Every engagement is confirmed in writing before work begins. Timelines and outcomes depend on scope, site conditions and agreed responsibilities.</p>
          </div>
          <div className="home-process-grid">
            {processSteps.map((step) => (
              <article className="home-process-step" key={step.number}>
                <span className="home-process-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="services-cta-title">
        <div className="home-container home-cta-inner">
          <h2 id="services-cta-title">Need a consultation, quotation or partnership discussion?</h2>
          <p>Send your requirement through Contact and we will respond with the appropriate next step.</p>
          <div className="home-cta-actions">
            <Link to="/contact" className="home-btn home-btn-light">Request a Consultation</Link>
            <Link to="/partnership" className="home-btn home-btn-ghost-light">Partnership Request</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;