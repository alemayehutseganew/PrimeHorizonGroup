import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="header" role="banner">
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <span className="topbar-item" aria-label="Office">📍 Bole Sub-city, Addis Ababa</span>
            <span className="topbar-item" aria-label="Phone">📞 +251 911 000 000</span>
            <span className="topbar-item" aria-label="Hours">Mon–Sat · 8:00–17:30</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-sm btn-ghost-light nav-toggle" aria-label="Toggle navigation" aria-expanded={mobileOpen} aria-controls="main-nav" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="nav-bar">
        <div className="container">
          <div className="brand">
            <Link to="/" className="logo-link" aria-label="Prime Horizon Group Plc home" onClick={() => setMobileOpen(false)}>
              <span className="brand-mark" style={{width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--navy-800), var(--blue-600))', display: 'grid', placeItems: 'center'}}>
                <svg width="26" height="26" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                  <path d="M10 30 L22 12 L34 30" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="brand-name">Prime Horizon Group <span style={{fontSize: '0.7rem', fontWeight: '600', color: 'var(--teal-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: '4px'}}>Plc</span></span>
            </Link>
          </div>

          <nav className="nav" id="main-nav">
            <ul className="nav-list">
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/about" className="nav-link">About</Link></li>
              <li><Link to="/services" className="nav-link">Services</Link></li>
              <li><Link to="/projects" className="nav-link">Projects</Link></li>
              <li><Link to="/careers" className="nav-link">Careers</Link></li>
              <li><Link to="/contact" className="nav-link">Contact</Link></li>
            </ul>
            <div className="nav-actions">
              <Link to="/portal" className="btn btn-outline nav-cta-mobile">Shareholder Portal</Link>
            </div>
          </nav>
        </div>
      </div>
      <nav className={"nav-mobile" + (mobileOpen ? " open" : "")} id="nav-mobile" role="navigation" aria-label="Mobile navigation">
        <ul className="nav-mobile-list">
          <li><Link to="/" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Home</Link></li>
          <li><Link to="/about" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>About</Link></li>
          <li><Link to="/services" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Services</Link></li>
          <li><Link to="/projects" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Projects</Link></li>
          <li><Link to="/careers" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Careers</Link></li>
          <li><Link to="/contact" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Contact</Link></li>
          <li><Link to="/portal" className="nav-mobile-link nav-mobile-portal" onClick={() => setMobileOpen(false)}>Shareholder Portal</Link></li>
        </ul>
      </nav>
    </header>
  );
}