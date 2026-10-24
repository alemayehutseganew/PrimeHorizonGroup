import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const BoltIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 L4 14 h7 l-1 8 9-12 h-7 z" /></svg>);
const GridIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
const BankIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9 L12 4 L21 9" /><path d="M4 9 v9 M8 9 v9 M12 9 v9 M16 9 v9 M20 9 v9" /><path d="M3 18 h18" /><path d="M2 21 h20" /></svg>);
const ShieldIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 L20 6 V12 C20 17 16.5 20.8 12 22 C7.5 20.8 4 17 4 12 V6 Z" /><path d="M9 12 l2 2 l4 -4" /></svg>);
const TowerIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 v6" /><path d="M8 8 h8" /><path d="M10 8 v14 M14 8 v14" /><circle cx="12" cy="4" r="1.5" /><path d="M6 22 h12" /></svg>);

const institutions = [
  { icon: <BoltIcon />, name: 'Ethiopian Electric Power (EEP)', desc: "Professional experience associated with Ethiopia's electric power sector, contributing to knowledge of power infrastructure, engineering challenges, and the systems that support reliable electricity generation and transmission." },
  { icon: <GridIcon />, name: 'Ethiopian Electric Utility (EEU)', desc: 'Experience connected to electricity distribution and utility operations, supporting an understanding of service delivery, operational processes, infrastructure, and technical reliability.' },
  { icon: <BankIcon />, name: 'Commercial Bank of Ethiopia (CBE)', desc: 'Professional experience in the banking environment, bringing familiarity with critical information systems, operational continuity, enterprise technology, and the importance of security and accountability.' },
  { icon: <ShieldIcon />, name: 'Information Network Security Administration (INSA)', desc: 'Experience connected to information security and technology environments, contributing knowledge of cybersecurity, secure systems, network protection, and information assurance.' },
  { icon: <TowerIcon />, name: 'Ethio telecom', desc: "Professional experience within Ethiopia's telecommunications sector, contributing knowledge of communication networks, digital infrastructure, connectivity, and technology operations." },
];
const PowerIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 L4 14 h6 l-1 8 9-12 h-6 z" /></svg>);
const ITIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20 h8 M12 16 v4" /></svg>);
const NetIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7 v4 M10 11 L6 17 M14 11 L18 17" /></svg>);
const CyberIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 L20 6 V12 C20 17 16.5 20.8 12 22 C7.5 20.8 4 17 4 12 V6 Z" /><path d="M9 12 l2 2 l4 -4" /></svg>);
const CodeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 8 L4 12 L8 16" /><path d="M16 8 L20 12 L16 16" /><path d="M13 6 L11 18" /></svg>);
const ResearchIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5 L21 21" /><path d="M8 11 h6 M11 8 v6" /></svg>);
const CheckIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12 l4 4 L19 6" /></svg>);

const expertise = [
  { icon: <PowerIcon />, title: 'Electrical Power and Engineering', items: ['Electrical engineering and power-system knowledge.', 'Engineering problem-solving and technical analysis.', 'Infrastructure and operational reliability.'] },
  { icon: <ITIcon />, title: 'Information Technology and Enterprise Systems', items: ['Enterprise information systems.', 'Infrastructure and systems administration.', 'Reliable technology operations and digital transformation.'] },
  { icon: <NetIcon />, title: 'Telecommunications and Networking', items: ['Communication networks and connectivity.', 'Network infrastructure and operations.', 'Technical troubleshooting and performance improvement.'] },
  { icon: <CyberIcon />, title: 'Cybersecurity and Information Assurance', items: ['Information security awareness.', 'Secure systems and network protection.', 'Risk-conscious technology practices.'] },
  { icon: <CodeIcon />, title: 'Software Development and Digital Solutions', items: ['Software design and development.', 'Process improvement through technology.', 'Practical, maintainable digital solutions.'] },
  { icon: <ResearchIcon />, title: 'Research, Analysis, and Innovation', items: ['Analytical and evidence-based problem-solving.', 'Academic and technical research experience.', 'Continuous learning and knowledge sharing.'] },
];

const UsersIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20 c0-3.5 3-5.5 6-5.5 s6 2 6 5.5" /><path d="M15 16 c2 0 5 1.5 5 4" /></svg>);
const BulbIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18 h6 M10 21 h4" /><path d="M12 3 a6 6 0 0 0-3.5 10.9 c.6.5 1 1.3 1 2.1 h5 c0-.8.4-1.6 1-2.1 A6 6 0 0 0 12 3 z" /></svg>);
const BriefcaseIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7 V5 a2 2 0 0 1 2-2 h2 a2 2 0 0 1 2 2 v2" /><path d="M3 12 h18" /></svg>);
const NodesIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><circle cx="12" cy="12" r="2" /><path d="M12 7 v3 M10 13 L6 17 M14 13 L18 17 M7 19 h10" /></svg>);
const TargetIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>);
const EyeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12 s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7 z" /><circle cx="12" cy="12" r="3" /></svg>);
const HeartIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20 s-7-4.5-7-10 a4 4 0 0 1 7-2.6 A4 4 0 0 1 19 10 c0 5.5-7 10-7 10 z" /></svg>);

const researchFeatures = [
  { icon: <CheckIcon />, title: 'Evidence-Based Thinking', desc: 'We value careful analysis, structured problem-solving, and decisions informed by relevant evidence.' },
  { icon: <UsersIcon />, title: 'Knowledge Exchange', desc: 'We recognize the value of collaboration, academic engagement, and sharing professional knowledge.' },
  { icon: <BulbIcon />, title: 'Continuous Innovation', desc: 'We encourage learning, exploration, and the development of practical approaches to emerging challenges.' },
];

const values = [
  { icon: <ShieldIcon />, title: 'Integrity', desc: 'Acting honestly, responsibly, and transparently.' },
  { icon: <TargetIcon />, title: 'Professional Excellence', desc: 'Maintaining high standards of quality and competence.' },
  { icon: <UsersIcon />, title: 'Collaboration', desc: 'Combining diverse skills and perspectives to achieve shared goals.' },
  { icon: <CheckIcon />, title: 'Accountability', desc: 'Taking responsibility for commitments, decisions, and results.' },
  { icon: <BulbIcon />, title: 'Innovation', desc: 'Applying knowledge and creative thinking to practical challenges.' },
  { icon: <ResearchIcon />, title: 'Continuous Learning', desc: 'Developing our capabilities through experience, research, and knowledge sharing.' },
];

const benefits = [
  { icon: <BriefcaseIcon />, title: 'Real-World Perspective', desc: 'Our members bring knowledge shaped by professional experience in demanding institutional and technical environments.' },
  { icon: <NodesIcon />, title: 'Multidisciplinary Thinking', desc: 'We draw on different fields of expertise to understand challenges and identify practical approaches.' },
  { icon: <ResearchIcon />, title: 'Research-Oriented Problem-Solving', desc: 'We value analysis, learning, and informed decision-making when addressing complex problems.' },
  { icon: <ShieldIcon />, title: 'Commitment to Accountability', desc: 'We emphasize professional conduct, clear communication, dependable delivery, and responsible execution.' },
];

export const About = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="about-breadcrumb-sep" aria-hidden="true">/</span>
            <span aria-current="page">About Us</span>
          </nav>
          <div className="about-hero-grid">
            <div className="about-hero-text">
              <span className="about-eyebrow">WHO WE ARE</span>
              <h1 className="about-hero-title">Expertise. Integrity. Excellence.</h1>
              <p className="about-hero-lead">Prime Horizon Group Plc is a professionally driven company built on the collective expertise, experience, and vision of highly skilled professionals working across Ethiopia's leading institutions, major enterprises, and academic research communities around the world.</p>
              <p className="about-hero-lead">Our strength lies in our people. We bring together diverse professional backgrounds, practical industry experience, technical knowledge, and a research-oriented mindset to develop innovative solutions and create lasting value.</p>
              <div className="about-hero-actions">
                <Link to="/services" className="about-btn about-btn-primary">Explore Our Services</Link>
                <Link to="/contact" className="about-btn about-btn-outline">Contact Our Team</Link>
              </div>
            </div>
            <div className="about-hero-visual" aria-hidden="true">
              <div className="about-visual-card">
                <svg viewBox="0 0 420 320" className="about-visual-svg" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="aboutGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1f5fa8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#12a594" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="420" height="320" fill="url(#aboutGrad)" rx="18" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-section-light">
        <div className="about-container">
          <header className="about-section-head">
            <span className="about-eyebrow">OUR PROFESSIONAL FOUNDATION</span>
            <h2>Experience Built Across Critical Industries</h2>
            <p>Our members bring practical professional experience from organizations that support Ethiopia's energy infrastructure, financial systems, telecommunications networks, information security, and essential public services. This experience strengthens our understanding of complex technical environments, operational reliability, institutional accountability, and technology-driven transformation.</p>
          </header>
          <div className="about-institution-grid">
            {institutions.map((inst) => (
              <article className="about-institution-card" key={inst.name}>
                <div className="about-institution-icon">{inst.icon}</div>
                <h3>{inst.name}</h3>
                <p>{inst.desc}</p>
              </article>
            ))}
          </div>
          <p className="about-note">These institutions represent the professional backgrounds of our members. Their inclusion does not imply that every member has worked at every institution or that these organizations formally endorse or partner with Prime Horizon Group Plc.</p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <header className="about-section-head about-section-head-center">
            <span className="about-eyebrow">OUR COLLECTIVE CAPABILITIES</span>
            <h2>Different Disciplines. One Shared Commitment to Excellence.</h2>
            <p>Our multidisciplinary team brings together knowledge from engineering, information technology, enterprise systems, telecommunications, cybersecurity, and academic research. By combining different professional perspectives, we approach challenges with practical understanding, technical rigor, and a commitment to dependable results.</p>
          </header>
          <div className="about-expertise-grid">
            {expertise.map((e) => (
              <article className="about-expertise-card" key={e.title}>
                <div className="about-expertise-icon">{e.icon}</div>
                <h3>{e.title}</h3>
                <ul className="about-expertise-list">
                  {e.items.map((it) => (
                    <li key={it}><CheckIcon /> {it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-light">
        <div className="about-container">
          <header className="about-section-head">
            <span className="about-eyebrow">RESEARCH &amp; KNOWLEDGE</span>
            <h2>Grounded in Research. Driven by Continuous Learning.</h2>
            <p>Beyond industry experience, our members are engaged in academic research, university-based work, and professional knowledge development across different universities and international research communities. This connection to research encourages analytical thinking, evidence-based decision-making, and a willingness to explore better ways of solving complex problems.</p>
            <p>By bringing together practical industry experience and academic perspectives, we seek to bridge theory and implementation, turn knowledge into useful solutions, and maintain a culture of continuous learning and professional development.</p>
          </header>
          <div className="about-research-grid">
            {researchFeatures.map((f) => (
              <article className="about-research-card" key={f.title}>
                <div className="about-research-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <header className="about-section-head about-section-head-center">
            <span className="about-eyebrow">MISSION, VISION &amp; VALUES</span>
            <h2>Our Mission, Vision, and Values</h2>
          </header>
          <div className="about-mvv-grid">
            <article className="about-mvv-card about-mvv-mission">
              <div className="about-mvv-icon"><TargetIcon /></div>
              <h3>Our Mission</h3>
              <p>To combine professional expertise, technical knowledge, and collaborative problem-solving to deliver reliable services and practical solutions that address real-world challenges and create meaningful value for our clients and stakeholders.</p>
            </article>
            <article className="about-mvv-card about-mvv-vision">
              <div className="about-mvv-icon"><EyeIcon /></div>
              <h3>Our Vision</h3>
              <p>To become a trusted Ethiopian company recognized for technical excellence, professional integrity, innovation, and sustainable impact across the industries and communities we serve.</p>
            </article>
          </div>
          <div className="about-values-grid">
            {values.map((v) => (
              <article className="about-value-card" key={v.title}>
                <div className="about-value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-light">
        <div className="about-container">
          <header className="about-section-head">
            <span className="about-eyebrow">WHY WORK WITH US</span>
            <h2>Professional Knowledge with a Practical Perspective</h2>
            <p>We believe effective solutions begin with understanding the real problem. Our members' exposure to different professional environments and academic disciplines helps us consider technical, operational, and organizational requirements from multiple perspectives.</p>
          </header>
          <div className="about-benefit-grid">
            {benefits.map((b) => (
              <article className="about-benefit-card" key={b.title}>
                <div className="about-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-container about-cta-inner">
          <h2>Let's Turn Expertise into Meaningful Results.</h2>
          <p>Whether you are exploring a technical challenge, seeking professional services, or looking to discuss a potential collaboration, Prime Horizon Group Plc welcomes the opportunity to connect.</p>
          <div className="about-cta-actions">
            <Link to="/services" className="about-btn about-btn-cta-light">Explore Our Services</Link>
            <Link to="/contact" className="about-btn about-btn-cta-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

