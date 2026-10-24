import React from 'react';
import { Link } from 'react-router-dom';

export const Careers = () => {
  return (
    <div className="container">
      <section className="section-sm bg-white">
        <div className="section-head">
          <span className="eyebrow">Careers & Partnerships</span>
          <h2>Build your career with a company that keeps its records straight.</h2>
          <p>We are building teams in technical services and administration. If you are skilled, licensed and honest about your work, we want to meet you.</p>
        </div>

        <section className="section bg-white">
          <div className="section-head">
            <span className="eyebrow">Open Applications</span>
            <h2>Roles we regularly recruit for</h2>
            <p>Availability changes as project demand grows. Send an application even if a role is not currently listed as open.</p>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Division</th>
                  <th>Key requirements</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Electrician / Electrical Technician</strong></td>
                  <td>Technical</td>
                  <td>Certified LV installation experience, safety discipline</td>
                  <td><span className="badge green">Open</span></td>
                </tr>
                <tr>
                  <td><strong>IT Support Technician</strong></td>
                  <td>Technical</td>
                  <td>Windows/Linux administration, networking basics, customer communication</td>
                  <td><span className="badge amber">Closing soon</span></td>
                </tr>
                <tr>
                  <td><strong>Software Engineer (Frontend)</strong></td>
                  <td>Technical</td>
                  <td>React/TypeScript, API integration, testing habits</td>
                  <td><span className="badge gray">Waitlist</span></td>
                </tr>
                <tr>
                  <td><strong>Finance Officer</strong></td>
                  <td>Administration</td>
                  <td>Accounting qualification, invoicing and reconciliation experience</td>
                  <td><span className="badge amber">Closing soon</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <div className="split">
            <div>
              <span className="eyebrow">How to apply</span>
              <h3>Application process</h3>
              <ul style={{marginLeft: '1.5rem', marginTop: '1rem'}}>
                <li>Send your CV and a short note about the role to <a href="mailto:careers@primehorizon.et">careers@primehorizon.et</a>, or use the contact form and select “Career opportunity”.</li>
                <li>A short call to confirm basics – licence class, certificates, availability and expected compensation.</li>
                <li>For operational roles this includes a practical assessment. Documents are verified before any offer.</li>
              </ul>
            </div>
            <div className="card" style={{background: 'linear-gradient(145deg, var(--navy-800), var(--blue-600))', border: 0, color: '#fff', padding: '2rem'}}>
              <h3 style={{color: '#fff'}}>Supplier &amp; partner applications</h3>
              <p style={{color: '#c9d8ea', marginTop: '10px'}}>We work with suppliers of electrical materials, IT equipment and technical services. Partners are onboarded with documented terms, tax documents and payment schedules.</p>
              <ul className="checklist" style={{marginTop: '18px', color: '#c9d8ea'}}>
                <li>Business licence and TIN documentation</li>
                <li>Transparent quotation and pricing terms</li>
                <li>Agreed payment schedule and records</li>
                <li>Performance review each quarter</li>
              </ul>
              <Link to="/contact" className="btn btn-light" style={{marginTop: '22px'}}>Apply as a Supplier</Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="cta-band">
            <div>
              <h2>Not sure which role fits?</h2>
              <p>Send an open application. We keep good candidates on file and reach out when a matching role opens.</p>
            </div>
            <Link to="/contact" className="btn btn-light">Send Open Application</Link>
          </div>
        </section>
      </section>
    </div>
  );
};