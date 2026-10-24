import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export const Contact = () => {
  const [formData, setFormData] = useState({name: '', organization: '', email: '', phone: '', topic: '', message: ''});
  const [errors, setErrors] = useState({name: '', email: '', phone: '', topic: '', message: ''});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
    setErrors({...errors, [name]: ''});
  };

  const validate = () => {
    let valid = true;
    const newErrors = {...errors};
    if (!formData.name.trim()) { newErrors.name = 'Please enter your name.'; valid = false; }
    if (!formData.email.trim()) { newErrors.email = 'Please enter your email address.'; valid = false; }
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) { newErrors.email = 'Please enter a valid email address.'; valid = false; }
    if (!formData.phone.trim()) { newErrors.phone = 'Please enter your phone.'; valid = false; }
    if (!formData.topic) { newErrors.topic = 'Please select a topic.'; valid = false; }
    if (!formData.message.trim()) { newErrors.message = 'Please enter a message.'; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus({type: 'info', message: 'Sending your inquiry...'});
    try {
      await api.post('/inquiries/', {...formData, source: 'website'});
      setStatus({type: 'success', message: 'Your inquiry has been sent successfully!'});
      setFormData({name: '', organization: '', email: '', phone: '', topic: '', message: ''});
    } catch (error) {
      setStatus({type: 'error', message: (error && error.message) || 'Failed to send inquiry'});
    }
  };

  const topics = ['IT Support', 'Software Development', 'Electrical Engineering', 'Networking & Infrastructure', 'Power & Energy', 'Career Opportunity', 'Partnership', 'Other'];

  return (
    <div className="container">
      <section className="section-sm bg-white">
        <div className="section-head">
          <span className="eyebrow">Contact</span>
          <h1>Tell us what you need. We respond within one business day.</h1>
          <p>Technical service requests, project briefs, support requests and partnership inquiries all go through the same door — this one.</p>
        </div>
      </section>

      <section className="section">
        <div className="split" style={{alignItems: 'start', gap: '44px'}}>
          <div style={{flex: 1}}>
            <span className="eyebrow">Inquiry form</span>
            <h2 style={{marginBottom: '22px'}}>Send an inquiry</h2>
            {status && (
              <div className="alert" style={{marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: status.type === 'success' ? '#e7f6f3' : '#fdedec', color: status.type === 'success' ? 'var(--green-600)' : 'var(--red-500)', border: '1px solid ' + (status.type === 'success' ? 'var(--teal-100)' : '#fecaca')}}>
                {status.message}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full name <span style={{color: 'var(--red-500)', marginLeft: '0.3rem'}}>*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Organization <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem'}}>(optional)</span></label>
                  <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Email <span style={{color: 'var(--red-500)', marginLeft: '0.3rem'}}>*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone <span style={{color: 'var(--red-500)', marginLeft: '0.3rem'}}>*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder="+251 ..." />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Topic <span style={{color: 'var(--red-500)', marginLeft: '0.3rem'}}>*</span></label>
                  <select name="topic" value={formData.topic} onChange={handleChange} required className="form-control">
                    <option value="">Select a topic</option>
 {topics.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 {errors.topic && <span className="error-msg">{errors.topic}</span>}
 </div>
 <div className="form-group" style={{gridColumn: '1 / -1'}}>
 <label>Message <span style={{color: 'var(--red-500)', marginLeft: '0.3rem'}}>*</span></label>
 <textarea name="message" value={formData.message} onChange={handleChange} required className="form-control" rows={4}></textarea>
 {errors.message && <span className="error-msg">{errors.message}</span>}
 </div>
 <div className="form-group" style={{gridColumn: '1 / -1', marginTop: '8px'}}>
 <button type="submit" className="btn btn-primary">Send Inquiry</button>
 </div>
 </div>
 <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px'}}>
 Submissions are sent to the management portal API; when offline they are stored in your browser.
 </p>
 </form>
 </div>
 <div style={{flex: 1, minWidth: '280px'}}>
 <span className="eyebrow">Reach us directly</span>
 <h2 style={{marginBottom: '22px'}}>Office &amp; operations</h2>
 <ul className="value-list" style={{marginTop: 0}}>
 <li>
 <span className="vi" style={{width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0}}>📍</span>
 <div>
 <h4>Office</h4>
 <p>Bole Sub-city, Addis Ababa, Ethiopia<br/><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Visits by appointment.</span></p>
 </div>
 </li>
 <li>
 <span className="vi" style={{width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0}}>📞</span>
 <div>
 <h4>Phone</h4>
 <p><a href="tel:+251911000000">+251 911 000 000</a><br/><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Operations desk, Mon–Sat 8:00–17:30</span></p>
 </div>
 </li>
 <li>
 <span className="vi" style={{width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0}}>📧</span>
 <div>
 <h4>Email</h4>
 <p><a href="mailto:info@primehorizon.et">info@primehorizon.et</a><br/><a href="mailto:careers@primehorizon.et">careers@primehorizon.et</a></p>
 </div>
 </li>
 <li>
 <span className="vi" style={{width: '34px', height: '34px', borderRadius: '9px', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'grid', placeItems: 'center', flexShrink: 0}}>⏰</span>
 <div>
 <h4>Hours</h4>
 <p>Monday – Saturday, 8:00 – 17:30<br/><span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Emergency support for contract clients: 24/7</span></p>
 </div>
 </li>
 </ul>
 <div className="card" style={{marginTop: '26px'}}>
 <h3>Shareholder &amp; staff portal</h3>
 <p style={{marginTop: '8px'}}>Capital contributions, project records and reports live in the management portal — not on this public site.</p>
 <Link to="/portal" className="btn btn-outline btn-sm" style={{marginTop: '14px'}}>Open Portal Login</Link>
 </div>
 </div>
 </div>
 </section>
 </div>
 );
};
