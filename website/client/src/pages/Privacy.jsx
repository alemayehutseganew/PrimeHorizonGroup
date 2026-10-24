import React from 'react';
import { Link } from 'react-router-dom';

export const Privacy = () => {
  return (
    <div className='container'>
      <section className="section-sm bg-white">
        <div className="section-head">
          <span className="eyebrow">Privacy Policy</span>
          <h1>Privacy Policy</h1>
          <p style={{fontSize: '0.9rem'}}>Last updated: October 2026. This policy explains what information Prime Horizon Group Plc collects and how it is used.</p>
        </div>
      </section>

      <section className="section">
        <div style={{maxWidth: '820px'}}>
          <div className="card reveal">
            <h3>1. Who we are</h3>
            <p style={{marginTop: '8px'}}>Prime Horizon Group Plc is an Ethiopian technical-services company registered in Addis Ababa. References to the company, we or us in this policy mean Prime Horizon Group Plc.</p>

            <h3 style={{marginTop: '26px'}}>2. Information we collect</h3>
            <ul className="checklist" style={{marginTop: '10px'}}>
              <li><strong>Inquiries:</strong> name, organization, email, phone, topic and message submitted through the contact form.</li>
              <li><strong>Careers:</strong> CV and application details you send to our recruitment address.</li>
              <li><strong>Portal accounts:</strong> for authorized shareholders and staff — account identifiers, role assignments and activity records required for audit.</li>
              <li><strong>Client records:</strong> contract, billing and service-delivery information necessary to perform our agreements.</li>
            </ul>

            <h3 style={{marginTop: '26px'}}>3. How we use it</h3>
            <ul className="checklist" style={{marginTop: '10px'}}>
              <li>To respond to inquiries and provide quotations.</li>
              <li>To deliver contracted services and maintain service records.</li>
              <li>To evaluate job applications.</li>
              <li>To meet legal, tax and record-keeping obligations.</li>
              <li>To protect the security of our systems and prevent misuse.</li>
            </ul>

            <h3 style={{marginTop: '26px'}}>4. What we do not do</h3>
            <ul className="checklist" style={{marginTop: '10px'}}>
              <li>We do not sell personal information to third parties.</li>
              <li>We do not publish shareholder contact details or personal documents on the public website.</li>
              <li>We do not send marketing messages without consent.</li>
            </ul>

            <h3 style={{marginTop: '26px'}}>5. Sharing and disclosure</h3>
            <p style={{marginTop: '8px'}}>Information is shared only with authorized employees who need it for their work, with service providers under confidentiality obligations, or where disclosure is required by law.</p>

            <h3 style={{marginTop: '26px'}}>6. Data security</h3>
            <p style={{marginTop: '8px'}}>Personal data is stored in access-controlled systems. Portal access requires authentication and role-based permissions. We enforce HTTPS in production and keep credentials outside source control.</p>

            <h3 style={{marginTop: '26px'}}>7. Your rights</h3>
            <p style={{marginTop: '8px'}}>You may request access to, correction of, or deletion of your personal information, subject to legal record-keeping requirements. Write to <a href="mailto:info@primehorizon.et">info@primehorizon.et</a>.</p>

            <h3 style={{marginTop: '26px'}}>8. Contact</h3>
            <p style={{marginTop: '8px'}}>Questions: <a href="mailto:info@primehorizon.et">info@primehorizon.et</a> or Bole Sub-city, Addis Ababa, Ethiopia.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
