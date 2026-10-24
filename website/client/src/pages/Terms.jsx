import React from 'react';
import { Link } from 'react-router-dom';

export const Terms = () => {
  return (
    <div className="container">
      <section className="section-sm bg-white">
        <div className="section-head">
          <span className="eyebrow">Terms of Use</span>
          <h1>Terms of Use</h1>
          <p style={{fontSize: '0.9rem'}}>Last updated: October 2026. These terms govern your use of the Prime Horizon Group Plc website and management portal.</p>
        </div>
      </section>

      <section className="section">
        <div style={{maxWidth: '820px'}}>
          <div className="card reveal">
            <h3>1. Acceptance</h3>
            <p style={{marginTop: '8px'}}>By using this website you agree to these terms. If you do not agree, please discontinue use.</p>

            <h3 style={{marginTop: '26px'}}>2. Informational nature of public content</h3>
            <p style={{marginTop: '8px'}}>Content on the public website describes our services and capabilities. It is not a binding offer. Service scope, price, timelines and support terms become binding only through a signed agreement or written quotation.</p>

            <h3 style={{marginTop: '26px'}}>3. Portal access</h3>
            <ul className="checklist" style={{marginTop: '10px'}}>
              <li>Portal accounts are issued only to authorized users and may not be shared.</li>
              <li>You must keep credentials confidential and report suspected compromise immediately.</li>
              <li>All portal activity is recorded in audit logs; misuse may result in suspension.</li>
              <li>Financial and ownership records displayed in the portal are confidential company information.</li>
            </ul>

            <h3 style={{marginTop: '26px'}}>4. Acceptable use</h3>
            <ul className="checklist" style={{marginTop: '10px'}}>
              <li>No unlawful, fraudulent or harmful purposes.</li>
              <li>No attempts to circumvent security, scrape data or interfere with availability.</li>
              <li>No misrepresentation of affiliation with the company.</li>
            </ul>

            <h3 style={{marginTop: '26px'}}>5. Intellectual property</h3>
            <p style={{marginTop: '8px'}}>Website design, text, logos and graphics belong to Prime Horizon Group Plc or its licensors. Client project materials and portal data remain the property of their respective owners.</p>

            <h3 style={{marginTop: '26px'}}>6. Governing law</h3>
            <p style={{marginTop: '8px'}}>These terms are governed by the laws of the Federal Democratic Republic of Ethiopia.</p>

            <h3 style={{marginTop: '26px'}}>7. Contact</h3>
            <p style={{marginTop: '8px'}}>Questions: <a href="mailto:info@primehorizon.et">info@primehorizon.et</a>.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
