import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const REQUEST_TYPES = [
  { value: 'partnership', label: 'Partnership proposal' },
  { value: 'procurement', label: 'Contract or procurement opportunity' },
  { value: 'quotation', label: 'Request for quotation or services' },
  { value: 'ngo', label: 'NGO / development project collaboration' },
  { value: 'general', label: 'General business inquiry' },
];

const SECTORS = [
  { value: 'government', label: 'Government / public institution' },
  { value: 'ngo', label: 'NGO / development organization' },
  { value: 'private', label: 'Private sector' },
  { value: 'other', label: 'Other' },
];

function formatApiError(error) {
  if (!error) return 'Failed to submit partnership request.';
  if (error.body && typeof error.body === 'object') {
    const parts = [];
    Object.keys(error.body).forEach((key) => {
      const val = error.body[key];
      const text = Array.isArray(val) ? val.join(' ') : String(val);
      parts.push(`${key}: ${text}`);
    });
    if (parts.length) return parts.join(' ');
  }
  return error.message || `Request failed (${error.status || 0})`;
}

export const Partnership = () => {
  const [formData, setFormData] = useState({
    request_type: 'partnership',
    sector: 'other',
    organization_name: '',
    contact_name: '',
    contact_role: '',
    email: '',
    phone: '',
    country: 'Ethiopia',
    location: '',
    subject: '',
    requirements: '',
    deliverables: '',
    timeline: '',
    budget: '',
    procurement_reference: '',
    privacy_acknowledged: false,
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
    setErrors((prev) => ({ ...prev, attachments: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.organization_name.trim()) newErrors.organization_name = 'Organization name is required.';
    if (!formData.contact_name.trim()) newErrors.contact_name = 'Contact name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address.';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.requirements.trim()) newErrors.requirements = 'Please describe your requirements.';
    if (!formData.privacy_acknowledged) newErrors.privacy_acknowledged = 'You must acknowledge the privacy notice.';
    if (files.length > 5) newErrors.attachments = 'At most 5 attachments are allowed.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setStatus({ type: 'info', message: 'Submitting your partnership request...' });

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'privacy_acknowledged') {
        payload.append(key, formData[key] ? 'true' : 'false');
      } else {
        payload.append(key, formData[key]);
      }
    });
    files.forEach((file) => payload.append('attachments', file));

    try {
      const created = await api.post('/partnership-requests/', payload);
      setStatus({
        type: 'success',
        message: `Your request has been recorded with reference ${created.reference || ''}. Our team will review it and respond within one business day.`,
      });
      setFormData({
        request_type: 'partnership',
        sector: 'other',
        organization_name: '',
        contact_name: '',
        contact_role: '',
        email: '',
        phone: '',
        country: 'Ethiopia',
        location: '',
        subject: '',
        requirements: '',
        deliverables: '',
        timeline: '',
        budget: '',
        procurement_reference: '',
        privacy_acknowledged: false,
      });
      setFiles([]);
      const input = document.getElementById('prAttachments');
      if (input) input.value = '';
    } catch (error) {
      setStatus({ type: 'error', message: formatApiError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container'>
      <section className='section-sm bg-white'>
        <div className='section-head'>
          <span className='eyebrow'>Partnership &amp; contracts</span>
          <h1>Submit a partnership or contract request.</h1>
          <p>
            Use this form for partnership proposals, procurement or contract opportunities, quotations,
            NGO collaboration and general business inquiries. Attach supporting documents where helpful.
          </p>
        </div>
      </section>

      <section className='section'>
        <div className='split' style={{ alignItems: 'start', gap: '44px' }}>
          <div style={{ flex: 1.4 }}>
            {status && (
              <div
                className='alert'
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: status.type === 'success' ? '#e7f6f3' : status.type === 'error' ? '#fdedec' : '#eef3f9',
                  color: status.type === 'success' ? 'var(--green-600)' : status.type === 'error' ? 'var(--red-500)' : 'var(--navy-800)',
                  border: '1px solid ' + (status.type === 'success' ? 'var(--teal-100)' : status.type === 'error' ? '#fecaca' : 'var(--blue-100)'),
                }}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className='form-grid'>
                <div className='form-group'>
                  <label>Request type</label>
                  <select name='request_type' value={formData.request_type} onChange={handleChange} className='form-control'>
                    {REQUEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className='form-group'>
                  <label>Sector</label>
                  <select name='sector' value={formData.sector} onChange={handleChange} className='form-control'>
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className='form-group'>
                  <label>Organization name <span style={{ color: 'var(--red-500)' }}>*</span></label>
                  <input type='text' name='organization_name' value={formData.organization_name} onChange={handleChange} className='form-control' required />
                  {errors.organization_name && <span className='error-msg'>{errors.organization_name}</span>}
                </div>
                <div className='form-group'>
                  <label>Contact name <span style={{ color: 'var(--red-500)' }}>*</span></label>
                  <input type='text' name='contact_name' value={formData.contact_name} onChange={handleChange} className='form-control' required />
                  {errors.contact_name && <span className='error-msg'>{errors.contact_name}</span>}
                </div>

                <div className='form-group'>
                  <label>Contact role</label>
                  <input type='text' name='contact_role' value={formData.contact_role} onChange={handleChange} className='form-control' />
                </div>
                <div className='form-group'>
                  <label>Email <span style={{ color: 'var(--red-500)' }}>*</span></label>
                  <input type='email' name='email' value={formData.email} onChange={handleChange} className='form-control' required />
                  {errors.email && <span className='error-msg'>{errors.email}</span>}
                </div>

                <div className='form-group'>
                  <label>Phone</label>
                  <input type='tel' name='phone' value={formData.phone} onChange={handleChange} className='form-control' placeholder='+251 ...' />
                </div>
                <div className='form-group'>
                  <label>Country</label>
                  <input type='text' name='country' value={formData.country} onChange={handleChange} className='form-control' />
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label>Location</label>
                  <input type='text' name='location' value={formData.location} onChange={handleChange} className='form-control' placeholder='City, region or site' />
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label>Subject <span style={{ color: 'var(--red-500)' }}>*</span></label>
                  <input type='text' name='subject' value={formData.subject} onChange={handleChange} className='form-control' required />
                  {errors.subject && <span className='error-msg'>{errors.subject}</span>}
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label>Requirements <span style={{ color: 'var(--red-500)' }}>*</span></label>
                  <textarea name='requirements' value={formData.requirements} onChange={handleChange} className='form-control' rows={5} required />
                  {errors.requirements && <span className='error-msg'>{errors.requirements}</span>}
                </div>
                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label>Deliverables</label>
                  <textarea name='deliverables' value={formData.deliverables} onChange={handleChange} className='form-control' rows={3} placeholder='Expected outputs or scope' />
                </div>

                <div className='form-group'>
                  <label>Timeline</label>
                  <input type='text' name='timeline' value={formData.timeline} onChange={handleChange} className='form-control' placeholder='e.g. Q3 2026' />
                </div>
                <div className='form-group'>
                  <label>Budget</label>
                  <input type='text' name='budget' value={formData.budget} onChange={handleChange} className='form-control' placeholder='Indicative budget' />
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label>Procurement reference</label>
                  <input type='text' name='procurement_reference' value={formData.procurement_reference} onChange={handleChange} className='form-control' placeholder='Tender or reference number' />
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label>Attachments (PDF, DOC, XLS, images; max 5 files, 5 MB each)</label>
                  <input id='prAttachments' type='file' multiple onChange={handleFiles} className='form-control' />
                  {errors.attachments && <span className='error-msg'>{errors.attachments}</span>}
                  {files.length > 0 && (
                    <ul style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {files.map((f) => (
                        <li key={f.name + f.size}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: 'normal' }}>
                    <input
                      type='checkbox'
                      name='privacy_acknowledged'
                      checked={formData.privacy_acknowledged}
                      onChange={handleChange}
                      style={{ marginTop: '4px' }}
                    />
                    <span>
                      I acknowledge that the information provided will be used to evaluate this request and
                      that supporting documents may be stored securely for that purpose.
                    </span>
                  </label>
                  {errors.privacy_acknowledged && <span className='error-msg'>{errors.privacy_acknowledged}</span>}
                </div>

                <div className='form-group' style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <button type='submit' className='btn btn-primary' disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <span className='eyebrow'>How it works</span>
            <h2 style={{ marginBottom: '16px' }}>What happens next</h2>
            <ul className='value-list' style={{ marginTop: 0 }}>
              <li>
                <span className='vi' style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>1</span>
                <div><h4>Reference issued</h4><p>You receive a reference number immediately on submission.</p></div>
              </li>
              <li>
                <span className='vi' style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>2</span>
                <div><h4>Review</h4><p>Our team reviews the request, scope and attachments.</p></div>
              </li>
              <li>
                <span className='vi' style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>3</span>
                <div><h4>Response</h4><p>We respond within one business day with next steps or a quotation.</p></div>
              </li>
            </ul>
            <div className='card' style={{ marginTop: '26px' }}>
              <h3>Prefer email?</h3>
              <p style={{ marginTop: '8px' }}>
                Send your brief to <a href='mailto:info@primehorizon.et'>info@primehorizon.et</a> or call
                <a href='tel:+251911000000'> +251 911 000 000</a>.
              </p>
              <Link to='/contact' className='btn btn-outline btn-sm' style={{ marginTop: '14px' }}>General inquiry form</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partnership;