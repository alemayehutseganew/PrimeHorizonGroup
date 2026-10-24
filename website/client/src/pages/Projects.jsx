import React from 'react';
import { Link } from 'react-router-dom';

export const Projects = () => {
  return (
    <div className="container">
      <section className="section-sm bg-white">
        <div className="section-head">
          <span className="eyebrow">Projects &amp; Case Studies</span>
          <h1>Work we are built to deliver.</h1>
          <p>A selection of representative engagements across our two divisions. Client names are withheld where agreements require it; full references are available on request.</p>
        </div>
      </section>

      <section className="section">
        <div className="grid-3">
          <article className="card reveal">
            <span className="badge teal">Technical Services</span>
            <h3 style={{marginTop: '14px'}}>Office Network &amp; Server Room Build</h3>
            <p>Design and deployment of a structured network for a growing Addis Ababa firm — cabling, switching, Wi-Fi coverage, a tidy server rack and full as-built documentation.</p>
            <ul className="checklist">
              <li>120+ data points installed and tested</li>
              <li>Managed switch + guest Wi-Fi segmentation</li>
              <li>Documented patch schedule handed over</li>
            </ul>
          </article>
          <article className="card reveal">
            <span className="badge teal">Technical Services</span>
            <h3 style={{marginTop: '14px'}}>Business Management Platform</h3>
            <p>A custom web platform for a multi-division company covering customers, projects, invoicing and management dashboards with role-based access.</p>
            <ul className="checklist">
              <li>React + TypeScript front end</li>
              <li>Role-aware dashboards and reports</li>
              <li>Audit history for financial actions</li>
            </ul>
          </article>
          <article className="card reveal">
            <span className="badge teal">Technical Services</span>
            <h3 style={{marginTop: '14px'}}>Electrical Installation &amp; Panel Upgrade</h3>
            <p>Industrial distribution board replacement, lighting circuit upgrade and earthing improvements for a warehouse facility — executed under permit by qualified personnel.</p>
            <ul className="checklist">
              <li>Load study before design</li>
              <li>Phased cutover, zero unplanned downtime</li>
              <li>Test certificates issued</li>
            </ul>
          </article>
          <article className="card reveal">
            <span className="badge teal">Technical Services</span>
            <h3 style={{marginTop: '14px'}}>Managed IT Support</h3>
            <p>Ongoing helpdesk, backup monitoring and user administration for an office of 40+ staff — with a defined SLA and monthly health reporting.</p>
            <ul className="checklist">
              <li>Defined response and resolution times</li>
              <li>Monitored backups with restore tests</li>
              <li>Monthly IT health report</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section bg-white">
        <div className="section-head center reveal">
          <span className="eyebrow">Delivery disciplines</span>
          <h2>Every project runs the same way</h2>
        </div>
        <div className="grid-4">
          <div className="card reveal" style={{padding: '24px'}}><h3 style={{fontSize: '1rem'}}>Scoped in writing</h3><p style={{fontSize: '0.86rem'}}>No verbal scopes. Deliverables, exclusions and assumptions are written down before work starts.</p></div>
          <div className="card reveal" style={{padding: '24px'}}><h3 style={{fontSize: '1rem'}}>Budget tracked</h3><p style={{fontSize: '0.86rem'}}>Contract value, actual expenses and margin are reviewed per project, not at year end.</p></div>
          <div className="card reveal" style={{padding: '24px'}}><h3 style={{fontSize: '1rem'}}>Progress visible</h3><p style={{fontSize: '0.86rem'}}>Percent complete, overdue tasks and upcoming milestones are on the dashboard for the whole team.</p></div>
          <div className="card reveal" style={{padding: '24px'}}><h3 style={{fontSize: '1rem'}}>Handover documented</h3><p style={{fontSize: '0.86rem'}}>Certificates, as-builts, credentials and manuals are delivered with the work.</p></div>
        </div>
        <div className="cta-band reveal" style={{marginTop: '56px'}}>
          <div>
            <h2>Have a project in mind?</h2>
            <p>Send the brief — even a rough one — and we will help you scope it properly.</p>
          </div>
          <Link to="/contact" className="btn btn-light">Start a Conversation</Link>
        </div>
      </section>
    </div>
  );
};
