import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Icon = ({ children }) => (
  <span className="home-icon" aria-hidden="true">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      {children}
    </svg>
  </span>
);

const IndustryIcon = () => <Icon><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M3 11h18" /><path d="M8 7V4h8v3" /></Icon>;
const MultiIcon = () => <Icon><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></Icon>;
const ResearchIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /><path d="M11 8v6" /><path d="M8 11h6" /></Icon>;
const PowerIcon = () => <Icon><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Icon>;
const ITIcon = () => <Icon><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" /></Icon>;
const NetworkIcon = () => <Icon><circle cx="12" cy="12" r="3" /><circle cx="4" cy="6" r="2" /><circle cx="20" cy="6" r="2" /><circle cx="4" cy="18" r="2" /><circle cx="20" cy="18" r="2" /><path d="M6 7l4 3" /><path d="M18 7l-4 3" /><path d="M6 17l4-3" /><path d="M18 17l-4-3" /></Icon>;
const ShieldIcon = () => <Icon><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></Icon>;
const CodeIcon = () => <Icon><path d="M8 9l-4 3 4 3" /><path d="M16 9l4 3-4 3" /><path d="M13 7l-2 10" /></Icon>;
const AnalysisIcon = () => <Icon><path d="M3 20h18" /><path d="M6 16v-6" /><path d="M10 16V8" /><path d="M14 16v-9" /><path d="M18 16v-4" /></Icon>;
const BankIcon = () => <Icon><path d="M3 10l9-6 9 6" /><path d="M4 10h16v10H4z" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" /></Icon>;
const TowerIcon = () => <Icon><path d="M12 2v20" /><path d="M8 6h8" /><path d="M6 10h12" /><path d="M4 14h16" /><path d="M10 22h4" /></Icon>;
const IntegrityIcon = () => <Icon><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></Icon>;
const ExcellenceIcon = () => <Icon><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.3 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8L12 2z" /></Icon>;
const CollaborationIcon = () => <Icon><circle cx="9" cy="8" r="3" /><circle cx="17" cy="8" r="3" /><path d="M3 20c0-3 2.5-5 6-5" /><path d="M21 20c0-3-2.5-5-6-5" /></Icon>;
const AccountabilityIcon = () => <Icon><path d="M4 4h16v16H4z" /><path d="M9 9h6" /><path d="M9 13h6" /><path d="M9 17h4" /></Icon>;
const InnovationIcon = () => <Icon><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></Icon>;
const LearningIcon = () => <Icon><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" /><path d="M4 19h16" /><path d="M8 8h8" /><path d="M8 12h6" /></Icon>;
const EvidenceIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /><path d="M8 11h6" /></Icon>;
const KnowledgeIcon = () => <Icon><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h10" /><path d="M18 17l2 2 3-3" /></Icon>;
const ImprovementIcon = () => <Icon><path d="M3 20l6-6 4 4 8-10" /><path d="M17 8h4v4" /></Icon>;
const BoltIcon = () => <Icon><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Icon>;
const GridIcon = () => <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Icon>;
const ConnectIcon = () => <Icon><path d="M4 12h16" /><path d="M12 4v16" /><circle cx="12" cy="12" r="2" /></Icon>;

const strengths = [
  { icon: <IndustryIcon />, title: 'Industry Experience', text: 'Our members bring professional experience from demanding institutional and technical environments, contributing practical insight into complex operational challenges.' },
  { icon: <MultiIcon />, title: 'Multidisciplinary Expertise', text: 'We bring together knowledge from engineering, power systems, information technology, telecommunications, cybersecurity, software development, and research.' },
  { icon: <ResearchIcon />, title: 'Research and Innovation', text: 'Academic engagement and continuous learning encourage evidence-based thinking, informed decisions, and the pursuit of practical solutions.' },
];

const expertise = [
  { icon: <PowerIcon />, title: 'Electrical Power and Engineering', items: ['Engineering knowledge and technical analysis.', 'Power infrastructure and operational considerations.', 'Practical engineering problem-solving.'] },
  { icon: <ITIcon />, title: 'Information Technology', items: ['Enterprise systems and IT infrastructure.', 'Systems administration and technology operations.', 'Digital transformation and operational reliability.'] },
  { icon: <NetworkIcon />, title: 'Telecommunications and Networking', items: ['Communication networks and connectivity.', 'Network infrastructure and operations.', 'Technical troubleshooting and performance improvement.'] },
  { icon: <ShieldIcon />, title: 'Cybersecurity and Information Assurance', items: ['Secure technology practices.', 'Network and information protection.', 'Security-conscious systems management.'] },
  { icon: <CodeIcon />, title: 'Software Development and Digital Solutions', items: ['Software design and development.', 'Digital tools and business process improvement.', 'Practical and maintainable technology solutions.'] },
  { icon: <AnalysisIcon />, title: 'Research and Technical Analysis', items: ['Research-informed problem-solving.', 'Technical evaluation and analytical thinking.', 'Continuous learning and knowledge development.'] },
];

const institutions = [
  { icon: <PowerIcon />, title: 'Ethiopian Electric Power (EEP)', text: 'Experience associated with Ethiopia\u2019s power sector and the engineering environments supporting electricity generation and transmission.' },
  { icon: <GridIcon />, title: 'Ethiopian Electric Utility (EEU)', text: 'Professional background connected to electricity distribution, utility operations, infrastructure, and service reliability.' },
  { icon: <BankIcon />, title: 'Commercial Bank of Ethiopia (CBE)', text: 'Experience within the banking environment, contributing knowledge of enterprise systems, operational continuity, and technology management.' },
  { icon: <ShieldIcon />, title: 'Information Network Security Administration (INSA)', text: 'Professional background associated with information security, secure systems, network protection, and information assurance.' },
  { icon: <TowerIcon />, title: 'Ethio telecom', text: 'Experience within telecommunications and digital infrastructure, including communication networks and technology operations.' },
];

const researchFeatures = [
  { icon: <EvidenceIcon />, title: 'Evidence-Based Thinking', text: 'We value analysis, relevant evidence, and structured problem-solving.' },
  { icon: <KnowledgeIcon />, title: 'Knowledge Sharing', text: 'We recognize the importance of learning, academic engagement, and exchanging professional knowledge.' },
  { icon: <ImprovementIcon />, title: 'Continuous Improvement', text: 'We encourage the development of capabilities and practical solutions through ongoing learning.' },
];

const values = [
  { icon: <IntegrityIcon />, title: 'Integrity', text: 'Acting honestly, responsibly, and transparently.' },
  { icon: <ExcellenceIcon />, title: 'Professional Excellence', text: 'Maintaining high standards of competence and quality.' },
  { icon: <CollaborationIcon />, title: 'Collaboration', text: 'Bringing different skills and perspectives together.' },
  { icon: <AccountabilityIcon />, title: 'Accountability', text: 'Taking responsibility for decisions, commitments, and results.' },
  { icon: <InnovationIcon />, title: 'Innovation', text: 'Applying knowledge and creative thinking to practical challenges.' },
  { icon: <LearningIcon />, title: 'Continuous Learning', text: 'Developing our capabilities through experience and research.' },
];

const processSteps = [
  { number: '01', title: 'Understand', text: 'Clarify the challenge, requirements, and expected outcomes.' },
  { number: '02', title: 'Analyze', text: 'Apply relevant professional knowledge, technical reasoning, and evidence.' },
  { number: '03', title: 'Develop', text: 'Identify practical approaches and develop solutions appropriate to the requirements.' },
  { number: '04', title: 'Deliver Responsibly', text: 'Emphasize quality, clear communication, accountability, and continuous improvement.' },
];

export const Home = () => {
  useEffect(() => {
    document.title = 'Home | Prime Horizon Group Plc';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Discover Prime Horizon Group Plc, an Ethiopian company bringing together expertise in engineering, electrical power, IT, telecommunications, cybersecurity, software development, and research.';
  }, []);

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow">ENGINEERING • TECHNOLOGY • PROFESSIONAL EXCELLENCE</p>
            <h1 id="home-hero-title" className="home-hero-title">Bringing Expertise Together to Build a Better Future</h1>
            <p className="home-hero-text">
              Prime Horizon Group Plc is a professionally driven Ethiopian company bringing together diverse expertise in engineering, electrical power, information technology, telecommunications, cybersecurity, software development, and research. We combine practical industry knowledge with analytical thinking to support reliable services, innovative solutions, and sustainable value.
            </p>
            <div className="home-hero-actions">
              <Link to="/services" className="home-btn home-btn-primary">Explore Our Services</Link>
              <Link to="/about" className="home-btn home-btn-outline">Discover Our Company</Link>
            </div>
          </div>
          <div className="home-hero-visual" aria-hidden="true">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Abstract network illustration">
              <defs>
                <linearGradient id="homeHeroGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <rect x="24" y="24" width="432" height="312" rx="24" fill="#f1f5f9" />
              <circle cx="120" cy="100" r="34" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
              <circle cx="240" cy="180" r="46" fill="url(#homeHeroGrad)" />
              <circle cx="360" cy="100" r="34" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
              <circle cx="150" cy="270" r="26" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <circle cx="330" cy="270" r="26" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
              <path d="M154 100h52" stroke="#94a3b8" strokeWidth="2" />
              <path d="M286 100h40" stroke="#94a3b8" strokeWidth="2" />
              <path d="M206 180h-?" stroke="#94a3b8" strokeWidth="2" />
              <path d="M140 134l70 26" stroke="#94a3b8" strokeWidth="2" />
              <path d="M340 134l-70 26" stroke="#94a3b8" strokeWidth="2" />
              <path d="M176 270l40-56" stroke="#94a3b8" strokeWidth="2" />
              <path d="M304 270l-40-56" stroke="#94a3b8" strokeWidth="2" />
              <path d="M210 180h60" stroke="#ffffff" strokeWidth="2" />
              <circle cx="240" cy="180" r="10" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="home-strength-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">OUR STRENGTH</p>
            <h2 id="home-strength-title">Our People. Our Expertise. Our Commitment.</h2>
            <p>Our strength lies in the knowledge, experience, and dedication of our members. Their professional backgrounds span major Ethiopian institutions, technical industries, enterprise systems, and academic research communities. By combining these perspectives, we approach challenges with practical understanding, technical rigor, and a commitment to responsible delivery.</p>
          </div>
          <div className="home-feature-grid">
            {strengths.map((item) => (
              <article className="home-feature-card" key={item.title}>
                <div className="home-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="home-section-link-wrap">
            <Link to="/about" className="home-text-link">Learn About Us {'\u2192'}</Link>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-expertise-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">WHAT WE BRING TO THE TABLE</p>
            <h2 id="home-expertise-title">Integrated Expertise for Complex Challenges</h2>
            <p>Our collective capabilities span multiple technical and professional disciplines. We use this breadth of knowledge to understand requirements, evaluate challenges, and identify practical approaches suited to each situation.</p>
          </div>
          <div className="home-expertise-grid">
            {expertise.map((item) => (
              <article className="home-expertise-card" key={item.title}>
                <div className="home-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <ul className="home-bullet-list">
                  {item.items.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link to="/services" className="home-card-link">Learn More {'\u2192'}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section-white" aria-labelledby="home-experience-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">EXPERIENCE THAT INFORMS OUR WORK</p>
            <h2 id="home-experience-title">Knowledge Shaped by Ethiopia\u2019s Critical Industries</h2>
            <p>Our members have worked and continue to work across important Ethiopian institutions and industries. These professional backgrounds provide insight into the technical, operational, and organizational challenges involved in delivering reliable services.</p>
          </div>
          <div className="home-experience-grid">
            {institutions.map((item) => (
              <article className="home-experience-card" key={item.title}>
                <div className="home-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="home-note">These institutions reflect the professional backgrounds of our members. Their inclusion does not imply institutional endorsement, formal partnership, or a direct client relationship with Prime Horizon Group Plc.</p>
          <div className="home-section-link-wrap">
            <Link to="/about" className="home-text-link">Learn More About Our Experience {'\u2192'}</Link>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted" aria-labelledby="home-research-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">KNOWLEDGE BEYOND THE WORKPLACE</p>
            <h2 id="home-research-title">Connecting Practical Experience with Research</h2>
            <p>Our members also engage in academic research, university-based work, and professional knowledge development across different universities and international research communities. We value the role of research in strengthening analytical thinking, encouraging innovation, and exploring better ways to solve complex problems.</p>
          </div>
          <div className="home-research-grid">
            {researchFeatures.map((item) => (
              <article className="home-research-card" key={item.title}>
                <div className="home-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-approach-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">HOW WE WORK</p>
            <h2 id="home-approach-title">A Thoughtful Approach from Understanding to Delivery</h2>
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

      <section className="home-section home-section-white" aria-labelledby="home-values-title">
        <div className="home-container">
          <div className="home-section-head">
            <p className="home-eyebrow">WHAT GUIDES US</p>
            <h2 id="home-values-title">The Principles Behind Our Work</h2>
          </div>
          <div className="home-values-grid">
            {values.map((item) => (
              <article className="home-value-card" key={item.title}>
                <div className="home-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="home-section-link-wrap">
            <Link to="/about" className="home-text-link">Discover Our Values {'\u2192'}</Link>
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <div className="home-container home-cta-inner">
          <h2 id="home-cta-title">Have a Challenge in Mind? Let\u2019s Talk.</h2>
          <p>Whether you are exploring an engineering challenge, seeking technology expertise, or looking to discuss a potential collaboration, Prime Horizon Group Plc welcomes the opportunity to connect.</p>
          <div className="home-cta-actions">
            <Link to="/services" className="home-btn home-btn-light">Explore Our Services</Link>
            <Link to="/contact" className="home-btn home-btn-ghost-light">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
};
