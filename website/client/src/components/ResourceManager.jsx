import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const labelFor = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const RESOURCE_CONFIG = {
  shareholders: {
    title: 'Shareholders',
    columns: ['id', 'name', 'email', 'phone', 'country', 'shares', 'share_price', 'paid', 'commitment', 'outstanding', 'status', 'joined'],
    fields: [
      { name: 'name', label: 'Legal name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'country', label: 'Country', type: 'text' },
      { name: 'shares', label: 'Shares', type: 'number' },
      { name: 'share_price', label: 'Share price', type: 'number' },
      { name: 'paid', label: 'Paid', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Suspended'] },
      { name: 'joined', label: 'Joined', type: 'date' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  contributions: {
    title: 'Contributions',
    columns: ['id', 'sh', 'shareholder_code', 'amount', 'currency', 'kind', 'date', 'method', 'ref', 'status', 'by', 'evidence_note', 'decision_note'],
    fields: [
      { name: 'shareholder_code', label: 'Shareholder code', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'text' },
      { name: 'kind', label: 'Kind', type: 'text' },
      { name: 'date', label: 'Paid on', type: 'date' },
      { name: 'method', label: 'Method', type: 'text' },
      { name: 'ref', label: 'Reference', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected', 'Reversed'] },
      { name: 'evidence_note', label: 'Evidence note', type: 'text' },
      { name: 'decision_note', label: 'Decision note', type: 'text' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  meetings: {
    title: 'Meetings',
    columns: ['id', 'type', 'date', 'attendees', 'status', 'summary'],
    fields: [
      { name: 'type', label: 'Type', type: 'text' },
      { name: 'date', label: 'Held on', type: 'date' },
      { name: 'attendees', label: 'Attendees', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Approved', 'Cancelled'] },
      { name: 'summary', label: 'Summary', type: 'textarea' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  customers: {
    title: 'Customers',
    columns: ['id', 'name', 'contact', 'phone', 'email', 'category', 'status', 'stage'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'contact', label: 'Contact person', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  leads: {
    title: 'Leads',
    columns: ['id', 'source', 'service', 'value', 'assignee', 'stage', 'follow'],
    fields: [
      { name: 'source', label: 'Source', type: 'text' },
      { name: 'service', label: 'Service', type: 'text' },
      { name: 'value', label: 'Value', type: 'number' },
      { name: 'assignee', label: 'Assignee', type: 'text' },
      { name: 'stage', label: 'Stage', type: 'select', options: ['New', 'Contacted', 'Qualified', 'Quotation sent', 'Negotiation', 'Won', 'Lost'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  inquiries: {
    title: 'Inquiries',
    columns: ['reference', 'name', 'organization', 'email', 'phone', 'topic', 'message', 'status'],
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'organization', label: 'Organization', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'topic', label: 'Topic', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['New', 'Contacted', 'Converted', 'Closed'] },
    ],
    canCreate: true, canUpdate: true, canDelete: false,
  },
  vehicles: {
    title: 'Vehicles',
    columns: ['id', 'plate', 'make', 'model', 'year', 'category', 'status', 'driver', 'odometer', 'insurance', 'purchase'],
    fields: [
      { name: 'plate', label: 'Plate', type: 'text', required: true },
      { name: 'make', label: 'Make', type: 'text' },
      { name: 'model', label: 'Model', type: 'text' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Available', 'Booked', 'On trip', 'Maintenance', 'Inactive'] },
      { name: 'driver', label: 'Driver', type: 'text' },
      { name: 'odometer', label: 'Odometer', type: 'number' },
      { name: 'insurance', label: 'Insurance until', type: 'date' },
      { name: 'purchase', label: 'Purchase cost', type: 'number' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  drivers: {
    title: 'Drivers',
    columns: ['id', 'name', 'licence', 'phone', 'trips', 'status'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'licence', label: 'Licence class', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'trips', label: 'Trips completed', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Suspended'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
};

Object.assign(RESOURCE_CONFIG, {
  trips: {
    title: 'Trips',
    columns: ['id', 'customer', 'vehicle', 'driver', 'route', 'start', 'end', 'price', 'fuel', 'status'],
    fields: [
      { name: 'customer', label: 'Customer', type: 'text' },
      { name: 'vehicle', label: 'Vehicle plate', type: 'text' },
      { name: 'driver', label: 'Driver', type: 'text' },
      { name: 'route', label: 'Route', type: 'text' },
      { name: 'start', label: 'Start date', type: 'date' },
      { name: 'end', label: 'End date', type: 'date' },
      { name: 'price', label: 'Price', type: 'number' },
      { name: 'fuel', label: 'Fuel cost', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Booked', 'In progress', 'Completed', 'Cancelled'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  maintenance: {
    title: 'Maintenance',
    columns: ['id', 'vehicle', 'date', 'provider', 'work', 'cost', 'next', 'status'],
    fields: [
      { name: 'vehicle', label: 'Vehicle plate', type: 'text' },
      { name: 'date', label: 'Service date', type: 'date' },
      { name: 'provider', label: 'Provider', type: 'text' },
      { name: 'work', label: 'Work', type: 'textarea' },
      { name: 'cost', label: 'Cost', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Completed', 'In progress', 'Scheduled', 'Cancelled'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
});

Object.assign(RESOURCE_CONFIG, {
  projects: {
    title: 'Projects',
    columns: ['id', 'name', 'customer', 'division', 'manager', 'value', 'spent', 'progress', 'status', 'priority', 'due'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'customer', label: 'Customer', type: 'text' },
      { name: 'division', label: 'Division', type: 'select', options: ['Technical', 'Transport', 'Shared'] },
      { name: 'manager', label: 'Manager', type: 'text' },
      { name: 'value', label: 'Contract value', type: 'number' },
      { name: 'spent', label: 'Actual cost', type: 'number' },
      { name: 'progress', label: 'Progress', type: 'number' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
      { name: 'status', label: 'Status', type: 'select', options: ['Lead', 'Quotation', 'Approved', 'In progress', 'Under review', 'Completed', 'Closed', 'On hold', 'Cancelled'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  tasks: {
    title: 'Tasks',
    columns: ['id', 'project', 'title', 'assignee', 'priority', 'due', 'status'],
    fields: [
      { name: 'project', label: 'Project code', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'assignee', label: 'Assignee', type: 'text' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
      { name: 'status', label: 'Status', type: 'select', options: ['To do', 'In progress', 'Done', 'Blocked'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
});

Object.assign(RESOURCE_CONFIG, {
  transactions: {
    title: 'Transactions',
    columns: ['id', 'date', 'type', 'category', 'division', 'description', 'amount', 'ref', 'status'],
    fields: [
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'type', label: 'Type', type: 'select', options: ['Income', 'Expense'] },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'division', label: 'Division', type: 'select', options: ['Transport', 'Technical', 'Shared'] },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'ref', label: 'Reference', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected', 'Reversed'] },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  invoices: {
    title: 'Invoices',
    columns: ['id', 'customer', 'issue', 'due', 'total', 'paid', 'balance', 'status'],
    fields: [
      { name: 'customer', label: 'Customer', type: 'text' },
      { name: 'issue', label: 'Issue date', type: 'date' },
      { name: 'due', label: 'Due date', type: 'date' },
      { name: 'total', label: 'Total', type: 'number' },
      { name: 'paid', label: 'Paid', type: 'number' },
      { name: 'status', label: 'Status', type: 'text' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  payments: {
    title: 'Payments',
    columns: ['id', 'invoice_code', 'amount', 'date', 'method', 'reference'],
    fields: [
      { name: 'invoice_code', label: 'Invoice code', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'date', label: 'Paid on', type: 'date' },
      { name: 'method', label: 'Method', type: 'text' },
      { name: 'reference', label: 'Reference', type: 'text' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
});

Object.assign(RESOURCE_CONFIG, {
  documents: {
    title: 'Documents',
    columns: ['id', 'name', 'category', 'linked', 'uploaded', 'by', 'access'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'linked', label: 'Linked to', type: 'text' },
      { name: 'access', label: 'Access', type: 'text' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  notifications: {
    title: 'Notifications',
    columns: ['id', 'text', 'time', 'unread', 'is_read', 'target'],
    fields: [
      { name: 'text', label: 'Text', type: 'text' },
      { name: 'target', label: 'Target', type: 'text' },
      { name: 'is_read', label: 'Read', type: 'select', options: ['true', 'false'] },
    ],
    canCreate: false, canUpdate: true, canDelete: false,
  },
  users: {
    title: 'Users',
    columns: ['id', 'email', 'username', 'name', 'role', 'title', 'phone', 'status', 'last_login'],
    fields: [
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'username', label: 'Username', type: 'text' },
      { name: 'first_name', label: 'First name', type: 'text' },
      { name: 'last_name', label: 'Last name', type: 'text' },
      { name: 'role', label: 'Role', type: 'select', options: ['admin', 'gm', 'finance', 'transport', 'projects', 'sales', 'shareholder', 'auditor'] },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Suspended', 'Invited'] },
      { name: 'password', label: 'Password', type: 'password' },
    ],
    canCreate: true, canUpdate: true, canDelete: true,
  },
  audit: {
    title: 'Audit Log',
    columns: ['id', 'actor', 'action', 'target', 'time', 'outcome'],
    fields: [],
    canCreate: false, canUpdate: false, canDelete: false,
  },
});

function buildInitialForm(config) {
  const form = {};
  (config.fields || []).forEach((f) => { form[f.name] = ''; });
  return form;
}

function normalizeForSubmit(config, form) {
  const out = {};
  (config.fields || []).forEach((f) => {
    let v = form[f.name];
    if (v === '' || v === null || v === undefined) return;
    if (f.type === 'number') {
      const n = Number(v);
      if (!Number.isNaN(n)) out[f.name] = n; else out[f.name] = v;
    } else if (f.name === 'is_read') {
      out[f.name] = v === 'true' || v === true;
    } else {
      out[f.name] = v;
    }
  });
  return out;
}

export function ResourceManager({ view, role }) {
  const config = RESOURCE_CONFIG[view] || { title: view, columns: [], fields: [], canCreate: false, canUpdate: false, canDelete: false };
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const canMutate = role && !['shareholder', 'auditor'].includes(String(role).toLowerCase());

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const data = await api.get(`/${view}/?${params.toString()}`);
      const results = Array.isArray(data) ? data : (data && data.results) || [];
      setRows(results);
      setCount((data && typeof data.count === 'number') ? data.count : results.length);
    } catch (e) {
      setError((e && e.message) || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [view, page, search, filters]);

  useEffect(() => { setPage(1); setSearch(''); setSearchInput(''); setFilters({}); }, [view]);
  useEffect(() => { fetchList(); }, [fetchList]);

  const openCreate = () => { setForm(buildInitialForm(config)); setFormError(''); setModal({ mode: 'create', row: null }); };
  const openEdit = (row) => {
    const initial = buildInitialForm(config);
    (config.fields || []).forEach((f) => {
      let v = row[f.name];
      if (v === null || v === undefined) v = '';
      if (f.name === 'is_read') v = v ? 'true' : 'false';
      initial[f.name] = v;
    });
    setForm(initial); setFormError(''); setModal({ mode: 'edit', row });
  };
  const closeModal = () => { if (submitting) return; setModal(null); setFormError(''); };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      const payload = normalizeForSubmit(config, form);
      if (modal.mode === 'create') await api.post(`/${view}/`, payload);
      else {
        const id = modal.row.id || modal.row.code || modal.row.reference;
        await api.patch(`/${view}/${encodeURIComponent(id)}/`, payload);
      }
      setModal(null); await fetchList();
    } catch (e2) {
      const body = e2 && e2.body;
      if (body && typeof body === 'object') {
        const msgs = Object.entries(body).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : String(v)}`);
        setFormError(msgs.join('\n') || (e2.message || 'Request failed'));
      } else setFormError((e2 && e2.message) || 'Request failed');
    } finally { setSubmitting(false); }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const id = deleteTarget.id || deleteTarget.code || deleteTarget.reference;
      await api.delete(`/${view}/${encodeURIComponent(id)}/`);
      setDeleteTarget(null); await fetchList();
    } catch (e) {
      setError((e && e.message) || 'Delete failed'); setDeleteTarget(null);
    } finally { setSubmitting(false); }
  };

  const renderField = (f) => {
    const common = { value: form[f.name] ?? '', onChange: (e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value })), className: 'portal-field-control', required: !!f.required };
    if (f.type === 'select') return (<select {...common}><option value="">—</option>{(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}</select>);
    if (f.type === 'textarea') return <textarea {...common} rows={3} />;
    return <input type={f.type === 'number' ? 'number' : f.type === 'password' ? 'password' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'} {...common} />;
  };

  const labelFor = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="portal-resource">
      <div className="portal-resource-header">
        <div>
          <h2 className="portal-resource-title">{config.title}</h2>
          <p className="portal-resource-sub">Manage {config.title.toLowerCase()} records.</p>
        </div>
        <div className="portal-toolbar">
          <input className="portal-input" placeholder="Search…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }} />
          <button className="portal-btn portal-btn-secondary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</button>
          {config.canCreate && canMutate && (<button className="portal-btn portal-btn-primary" onClick={openCreate}>New</button>)}
        </div>
      </div>

      {config.fields.filter((f) => f.type === 'select').length > 0 && (
        <div className="portal-filter-row">
          {config.fields.filter((f) => f.type === 'select').map((f) => (
            <select key={f.name} className="portal-select" value={filters[f.name] || ''} onChange={(e) => { setFilters((prev) => ({ ...prev, [f.name]: e.target.value })); setPage(1); }}>
              <option value="">{f.label} (all)</option>
              {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      )}

      {loading && <p className="portal-state portal-state-loading">Loading…</p>}
      {error && <div className="portal-state portal-state-error">{error}</div>}

      {!loading && !error && (
        <>
          {rows.length === 0 ? (
            <div className="portal-empty">
              <div className="portal-empty-title">No {config.title.toLowerCase()} records found.</div>
              <div className="portal-empty-text">There are no {config.title.toLowerCase()} to display.</div>
              {canMutate && (
                <button className="portal-btn portal-btn-primary" onClick={openCreate}>Add new</button>
              )}
            </div>
          ) : (
            <div className="portal-table-wrap">
              <table className="portal-table">
                <thead>
                  <tr>
                    {(config.columns || []).map((c) => (<th key={c}>{labelFor(c)}</th>))}
                    {(config.canUpdate || config.canDelete) && canMutate && (<th>Actions</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.id || row.reference || i}>
                      {(config.columns || []).map((c) => (<td key={c}>{String(row[c] ?? '')}</td>))}
                      {(config.canUpdate || config.canDelete) && canMutate && (
                        <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {config.canUpdate && <button onClick={() => openEdit(row)} style={{ marginRight: '6px' }}>Edit</button>}
                          {config.canDelete && <button onClick={() => setDeleteTarget(row)} style={{ color: '#c0392b' }}>Delete</button>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="portal-pagination">
        <span>{count} record(s)</span>
        <div className="portal-pagination-actions">
          <button className="portal-btn portal-btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span className="portal-page-indicator">Page {page}</span>
          <button className="portal-btn portal-btn-secondary" onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', width: 'min(640px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="portal-modal-title">{modal.mode === 'create' ? 'Create' : 'Edit'} {config.title}</h3>
            {formError && <pre style={{ color: '#c0392b', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{formError}</pre>}
            <form onSubmit={submitForm}>
              {(config.fields || []).map((f) => (
                <div key={f.name} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>{f.label}{f.required ? ' *' : ''}</label>
                  {renderField(f)}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: 'var(--navy-900)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>{submitting ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', width: 'min(480px, 100%)' }}>
            <h3 style={{ marginTop: 0 }}>{view === 'users' ? 'Deactivate user?' : 'Delete record?'}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{view === 'users' ? 'This disables login but keeps the account record. Confirm deactivation of ' + (deleteTarget.id || deleteTarget.reference) + '.' : 'This action may be irreversible. Confirm deletion of ' + (deleteTarget.id || deleteTarget.reference) + '.'}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setDeleteTarget(null)} disabled={submitting}>Cancel</button>
              <button onClick={doDelete} disabled={submitting} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>{submitting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
