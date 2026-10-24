import React from 'react';
import { Link } from 'react-router-dom';

export const Services = () => {
  return (
    <div className='container'>
      <section className="section-sm bg-white">
        <div className="section-head">
          <span className="eyebrow">Technical Services</span>
          <h1>Technical services delivered with precision and accountability.</h1>
          <p>Five technical service lines, delivered by one accountable team with written scope, tracked execution and documented handover.</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="section-head reveal">
          <span className="eyebrow">Engineering and IT that stays documented after we leave</span>
          <h2>Service lines</h2>
        </div>
        <div className="grid-3">
          <article className="card teal reveal">
            <div className="icon-box">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <rect height="14" rx="2" width="20" x="2" y="3" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <h3>IT Support &amp; Administration</h3>
            <p>Managed helpdesk, user account management, backups, antivirus and system maintenance for offices that need dependable IT without a full in-house team.</p>
            <ul className="checklist">
              <li>On-site and remote support</li>
              <li>Backup monitoring and restore tests</li>
              <li>Employee onboarding / offboarding</li>
              <li>Monthly IT health reports</li>
            </ul>
          </article>
          <article className="card teal reveal">
            <div className="icon-box">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <circle cx="2" cy="12" r="3" /><circle cx="22" cy="12" r="3" /><path d="M5 12h5m4 0h5" /><path d="M12 2v3m0 14v3" />
              </svg>
            </div>
            <h3>Networking &amp; Infrastructure</h3>
            <p>Structured cabling, LAN/Wi-Fi design, server rooms, and industrial maintenance carried out by qualified personnel under permit.</p>
            <ul className="checklist">
              <li>Structured cabling</li>
              <li>LAN and Wi-Fi design</li>
              <li>Server room setup</li>
              <li>Industrial maintenance</li>
            </ul>
          </article>
          <article className="card teal reveal">
            <div className="icon-box">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Electrical &amp; Engineering</h3>
            <p>LV/HV installations, distribution boards, lighting, earthing and industrial maintenance carried out by qualified personnel under permit.</p>
            <ul className="checklist">
              <li>Building and industrial wiring</li>
              <li>Panel building and upgrades</li>
              <li>Inspection and fault finding</li>
              <li>Maintenance contracts</li>
            </ul>
          </article>
          <article className="card teal reveal">
            <div className="icon-box">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Power &amp; Energy Solutions</h3>
            <p>Generator supply, installation and servicing; solar-hybrid systems; load studies and energy audits that cut operating cost and downtime.</p>
            <ul className="checklist">
              <li>Generator supply &amp; commissioning</li>
              <li>Solar hybrid and backup systems</li>
              <li>Preventive maintenance plans</li>
              <li>Energy consumption audits</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head center reveal">
          <span className="eyebrow">Engagement model</span>
          <h2>How engagements run</h2>
        </div>
        <div className="process-grid reveal">
          <div className="process-step"><h4>Inquiry</h4><p>Website form, phone or email — you receive a reference number.</p></div>
          <div className="process-step"><h4>Assessment &amp; Quote</h4><p>Scoping visit where needed, then a written quotation.</p></div>
          <div className="process-step"><h4>Agreement</h4><p>Scope, timeline, price and support terms signed.</p></div>
          <div className="process-step"><h4>Delivery</h4><p>Execution with a named responsible person and updates.</p></div>
          <div className="process-step"><h4>Handover &amp; Support</h4><p>Documentation, sign-off and warranty period.</p></div>
        </div>
        <div className="reveal" style={{textAlign: 'center', marginTop: '44px'}}>
          <Link to="/contact" className="btn btn-primary">Request a Service</Link>
          <Link to="/projects" className="btn btn-outline" style={{marginLeft: '12px'}}>See project examples</Link>
        </div>
      </section>
    </div>
  );
};
