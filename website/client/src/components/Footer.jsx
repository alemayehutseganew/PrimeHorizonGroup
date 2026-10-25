import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-mark" style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--navy-800), var(--blue-600))', display: 'grid', placeItems: 'center', marginBottom: '12px'}}>
              <svg width="22" height="22" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <path d="M10 30 L22 12 L34 30" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{fontWeight: '800', fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '4px'}}>Prime Horizon Group Plc</div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '320px', lineHeight: '1.6'}}>
              Ethiopian technical services company delivering IT, software development, electrical engineering,
              networking and power solutions with accountable governance and documented delivery.
            </p>
          </div>

          <div className="footer-column">
            <h4 style={{color: 'var(--navy-900)', fontSize: '1rem', marginBottom: '16px'}}>Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/partnership">Partnership</Link></li>
              <li><Link to="/portal">Shareholder Portal</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 style={{color: 'var(--navy-900)', fontSize: '1rem', marginBottom: '16px'}}>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Use</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 style={{color: 'var(--navy-900)', fontSize: '1rem', marginBottom: '16px'}}>Contact</h4>
            <ul className="footer-links">
              <li>📍 Bole Sub-city, Addis Ababa, Ethiopia</li>
              <li>📞 <a href="tel:+251911000000">+251 911 000 000</a></li>
              <li>📧 <a href="mailto:info@primehorizon.et">info@primehorizon.et</a></li>
              <li>⏰ Mon–Sat · 8:00–17:30</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Prime Horizon Group Plc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}