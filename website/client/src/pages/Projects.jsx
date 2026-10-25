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

const FolderIcon = () => <Icon><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Icon>;
const LayersIcon = () => <Icon><path d="M12 2l9 5-9 5-9-5 9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 17l9 5 9-5" /></Icon>;
const CheckIcon = () => <Icon><path d="M20 6L9 17l-5-5" /></Icon>;

const categories = [
  { title: 'IT Support & Infrastructure', text: 'Helpdesk, user administration, backups, endpoint protection, structured cabling, LAN/Wi-Fi and server room setup.' },
  { title: 'Cybersecurity & Resilience', text: 'Access control, security hardening, backup resilience, incident-readiness guidance and continuity planning.' },
  { title: 'Software & Digital Solutions', text: 'Custom web applications, internal portals, dashboards, reporting tools and API integrations.' },
  { title: 'Electrical Installations', text: 'Building and industrial wiring, distribution boards, lighting, earthing and fault finding under permit.' },
  { title: 'Power & Energy Systems', text: 'Generator supply, installation and servicing, solar-hybrid backup systems, load studies and energy audits.' },
  { title: 'Project Delivery Support', text: 'Scoping, documentation, coordination, handover packages and maintenance planning for technical work.' },
];

const deliverySteps = [
  { number: '01', title: 'Scoped in writing', text: 'Deliverables, exclusions, assumptions and acceptance criteria are documented before work starts.' },
  { number: '02', title: 'Tracked delivery', text: 'Progress, risks, budget and upcoming milestones are reviewed throughout the engagement.' },
  { number: '03', title: 'Clear communication', text: 'A named responsible person keeps stakeholders informed of status and decisions needed.' },
  { number: '04', title: 'Documented handover', text: 'Certificates, as-builts, credentials, manuals and warranty terms are delivered with the work.' },
];

export const Projects = () => {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="projects-hero-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow">PROJECTS • DELIVERY • DOCUMENTED OUTCOMES</p>
            <h1 id="projects-hero-title" className="home-hero-title">Project and solution focus grounded in verified work.</h1>
            <p className="home-hero-text">
              Prime Horizon Group Plc can support technical projects across IT, networking, cybersecurity, software, electrical and power systems. We publish only verified case studies; where none are available, we describe the kinds of solutions we can scope and deliver.
            </p>
            <div className="home-hero-actions">
              <Link to="/contact" className="home-btn home-btn-primary">Discuss a Requirement</Link>
              <Link to="/services" className="home-btn home-btn-outline">Explore Services</Link>
            </div>
          </div>
          <div className="home-hero-visual" aria-hidden="true">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Abstract project grid illustration">
              <rect x="24" y="24" width="432" height="312" rx="24" fill="#f1f5f9" />
              <rect x="70" y="70" width="150" height="90" rx="12" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
              <rect x="260" y="70" width="150" height="90" rx="12" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              <rect x="70" y="190" width="150" height="90" rx="12" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <rect x="260" y="190" width="150" height="90" rx="12" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <path d="M100 100h90" stroke="#94a3b8" strokeWidth="2" />
              <path d="M290 100h90" stroke="#94a3b8" strokeWidth="2" />
              <path d="M100 220h90" stroke="#94a3b8" strokeWidth="2" />
              <path d="M290 220h90" stroke="#94a3b8" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="projects-categories-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">PROJECT CATEGORIES</p>
            <h2 id="projects-categories-title">Types of work we can scope and deliver</h2>
            <p>These categories are based on verified service capabilities. They are not presented as completed client engagements.</p>
          </div>
          <div className="home-feature-grid">
            {categories.map((category) => (
              <article className="home-feature-card" key={category.title}>
                <div className="home-card-icon"><FolderIcon /></div>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted" aria-labelledby="projects-empty-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">VERIFIED CASE STUDIES</p>
            <h2 id="projects-empty-title">Published project records</h2>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px', boxShadow: 'var(--shadow-sm)', maxWidth: '760px' }}>
            <div className="home-card-icon" style={{ marginBottom: '16px' }}><LayersIcon /></div>
            <h3 style={{ marginBottom: '10px' }}>No verified case studies are published yet</h3>
            <p style={{ margin: 0 }}>
              We do not present illustrative projects as completed company engagements. When authorized client references and verified outcomes are available, they will be published here with scope, status and completion period.
            </p>
            <p className="home-note" style={{ marginTop: '18px' }}>
              If you have a similar requirement, we can scope the work, agree deliverables and provide references during the evaluation process where disclosure is permitted.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="projects-delivery-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">DELIVERY DISCIPLINE</p>
            <h2 id="projects-delivery-title">How project work is managed</h2>
            <p>These are working practices, not claims about specific completed projects.</p>
          </div>
          <div className="home-process-grid">
            {deliverySteps.map((step) => (
              <article className="home-process-step" key={step.number}>
                <span className="home-process-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="projects-cta-title">
        <div className="home-container home-cta-inner">
          <h2 id="projects-cta-title">Have a project in mind?</h2>
          <p>Send the brief, even a rough one, and we will help you scope it properly.</p>
          <div className="home-cta-actions">
            <Link to="/contact" className="home-btn home-btn-light">Start a Conversation</Link>
            <Link to="/services" className="home-btn home-btn-ghost-light">Explore Services</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Projects;