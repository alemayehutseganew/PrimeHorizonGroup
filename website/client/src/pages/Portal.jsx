import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api, clearTokens } from '../api/client';
import './Portal.css';
import '../portal-dashboard.css';
import { ResourceManager, RESOURCE_CONFIG } from '../components/ResourceManager';

const NAV_GROUPS = [
  { label: 'Overview', keys: ['dashboard'] },
  { label: 'People', keys: ['shareholders', 'customers', 'leads', 'inquiries', 'users'] },
  { label: 'Capital & finance', keys: ['contributions', 'transactions', 'invoices', 'payments'] },
  { label: 'Fleet & transport', keys: ['vehicles', 'drivers', 'trips', 'maintenance'] },
  { label: 'Projects & work', keys: ['projects', 'tasks'] },
  { label: 'Governance & records', keys: ['meetings', 'documents', 'notifications', 'audit'] },
];

export const Portal = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [allowedViews, setAllowedViews] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const canView = (name) => {
    if (name === 'dashboard') return true;
    if (!Array.isArray(allowedViews)) return true;
    return allowedViews.includes(name);
  };

  const hydrate = (me) => {
    const profile = (me && me.user) || me || null;
    setUser(profile);
    setRole((me && me.role) || (profile && profile.role) || null);
    setAllowedViews((me && me.allowed_views) || null);
    setLoggedIn(true);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('phg_access_token');
    if (token) {
      setLoading(true);
      api.me()
        .then((data) => {
          hydrate(data);
        })
        .catch(() => {
          // expired/invalid token
          clearTokens();
          setLoggedIn(false);
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    if (!canView(view)) { setView('dashboard'); return; }
    if (view !== 'dashboard') { setDataLoading(false); setDataError(''); return; }
    let cancelled = false;
    setDataLoading(true);
    setDataError('');
    const path = view === 'dashboard' ? '/summary/' : `/${view}/`;
    api.get(path)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setDataError((e && e.message) || 'Failed to load data'); })
      .finally(() => { if (!cancelled) setDataLoading(false); });
    return () => { cancelled = true; };
  }, [loggedIn, view, allowedViews, refreshKey]);

  // Keep the active view in sync with the URL so resource sections render
  // instead of unmounting the portal on navigation.
  useEffect(() => {
    if (!loggedIn) return;
    const parts = location.pathname.split('/').filter(Boolean);
    const seg = parts.length > 1 ? parts[1] : 'dashboard';
    if (seg === 'dashboard') { setView('dashboard'); return; }
    if (RESOURCE_CONFIG[seg] && canView(seg)) setView(seg);
    else setView('dashboard');
  }, [location.pathname, loggedIn, allowedViews]);

  // Close the mobile nav after navigation and on desktop resize.
  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMobileNavOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('portal-nav-open', mobileNavOpen);
    return () => document.body.classList.remove('portal-nav-open');
  }, [mobileNavOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const identifier = form.username.value.trim();
    const isEmail = identifier.includes("@");
    const password = form.password.value;
    if (!identifier || !password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await api.login({
        email: isEmail ? identifier : "",
        username: isEmail ? "" : identifier,
        password,
      });
      let me = null;
      try { me = await api.me(); } catch (e) {}
      if (me) hydrate(me);
      else {
        if (result && result.user) setUser(result.user);
        if (result && result.role) setRole(result.role);
        setLoggedIn(true);
      }
    } catch (err) {
      setError((err && err.message) || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setLoggedIn(false);
    setUser(null);
    setRole(null);
    setAllowedViews(null);
    setData(null);
  };

  const fmtETB = (n) => {
    if (n === null || n === undefined) return '\u2014';
    const value = Number(n);
    if (!Number.isFinite(value)) return '\u2014';
    return 'ETB ' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const fmtCount = (n) => {
    if (n === null || n === undefined) return '\u2014';
    const value = Number(n);
    return Number.isFinite(value) ? value.toLocaleString('en-US') : '\u2014';
  };

  const fmtPct = (n) => {
    if (n === null || n === undefined) return '\u2014';
    const value = Number(n);
    return Number.isFinite(value) ? value.toFixed(1) + '%' : '\u2014';
  };

  const KpiCard = ({ label, value, variant = 'default', progress = null }) => {
    const accent = {
      default: 'var(--blue-600)',
      success: 'var(--teal-500)',
      warning: 'var(--amber-500)',
      danger: 'var(--red-500)',
    }[variant];
    return (
      <div className="portal-kpi-card" style={{ borderTopColor: accent }}>
        <div className="portal-kpi-label">{label}</div>
        <div className="portal-kpi-value">{value}</div>
        {progress !== null && Number.isFinite(Number(progress)) && (
          <div className="portal-kpi-progress">
            <div className="portal-kpi-progress-bar" style={{ width: Math.max(0, Math.min(100, Number(progress))) + '%' }} />
          </div>
        )}
      </div>
    );
  };

  if (!loggedIn) {
    return (
      <div className="portal-page">
        <div className="portal-layout">
          <section className="portal-intro">
            <Link to="/" className="portal-brand" style={{textDecoration: 'none'}}>
              <span className="portal-brand-mark">
                <svg width="26" height="26" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                  <path d="M10 30 L22 12 L34 30" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round"/>
                </svg>
              </span>
              <span>
                <span className="portal-brand-name">Prime Horizon Group</span><br/>
                <span className="portal-brand-tag">Management Portal</span>
              </span>
            </Link>
            <span className="portal-eyebrow">SHAREHOLDER & MANAGEMENT PORTAL</span>
            <h1 className="portal-headline">The company, under control — from capital to delivery.</h1>
            <p className="portal-description">Shareholders and staff manage ownership records, projects, finances and documents in one auditable system.</p>
            <div className="portal-features">
              <div className="portal-feature">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fd8cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 L20 6 V12 C20 17 16.5 20.8 12 22 C7.5 20.8 4 17 4 12 V6 Z" />
                  <path d="M9 12 l2 2 l4 -4" />
                </svg>
                <span>Role-based access — every user sees only what they are authorized to see.</span>
              </div>
              <div className="portal-feature">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fd8cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9 L9 3 l-3 9 H2" /></svg>
                <span>Capital contributions, approvals and ownership events with full audit history.</span>
              </div>
            </div>
          </section>
          <section className="portal-login-card">
            <h2 className="portal-card-title">Welcome back</h2>
            <p className="portal-card-subtitle">Sign in to access your management portal.</p>
            <form className="portal-form" onSubmit={handleLogin}>
              <div className="portal-field">
                <label htmlFor="portal-username">Username or email</label>
                <input id="portal-username" type="text" name="username" required />
              </div>
              <div className="portal-field">
                <label htmlFor="portal-password">Password</label>
                <input id="portal-password" type="password" name="password" required />
              </div>
              {error && (
                <div style={{color: '#c0392b', fontSize: '0.85rem', marginBottom: '8px'}}>{error}</div>
              )}
              <button type="submit" className="portal-submit-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <div className="portal-security-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L20 6 V12 C20 17 16.5 20.8 12 22 C7.5 20.8 4 17 4 12 V6 Z" />
                <path d="M9 12 l2 2 l4 -4" />
              </svg>
              Secure access · Role-based permissions
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-shell">
      {mobileNavOpen && (
        <div className="portal-sidebar-backdrop open" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
      )}
      <aside id="portal-sidebar" className={`portal-sidebar${mobileNavOpen ? ' open' : ''}`} aria-label="Portal navigation">
        <div className="brand-mark" style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--navy-800), var(--blue-600))', display: 'grid', placeItems: 'center', marginBottom: '24px'}}>
          <svg width="22" height="22" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <path d="M10 30 L22 12 L34 30" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
        <h3 style={{color: 'var(--teal-500)', marginBottom: '24px'}}>Prime Horizon Portal</h3>
        <nav aria-label="Portal sections">
          {NAV_GROUPS.map((group) => {
            const items = group.keys.filter((key) => key === 'dashboard' ? true : (RESOURCE_CONFIG[key] && canView(key)));
            if (!items.length) return null;
            return (
              <div key={group.label} className="portal-nav-group">
                <div className="portal-nav-label">{group.label}</div>
                <ul className="portal-nav-list">
                  {items.map((key) => {
                    const title = key === 'dashboard' ? 'Overview' : RESOURCE_CONFIG[key].title;
                    return (
                      <li key={key}>
                        <Link
                          to={key === 'dashboard' ? '/portal' : `/portal/${key}`}
                          onClick={() => { setView(key); setMobileNavOpen(false); }}
                          className={`portal-nav-link${view === key ? ' active' : ''}`}
                        >
                          {title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <div style={{marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <button onClick={handleLogout} style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', width: '100%'}}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <button type="button" className="sidebar-toggle" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} aria-controls="portal-sidebar" onClick={() => setMobileNavOpen((o) => !o)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="portal-topbar-title">
            <h2>{view === 'dashboard' ? 'Overview' : (RESOURCE_CONFIG[view]?.title || 'Overview')}</h2>
            <div className="portal-topbar-sub">
              {view === 'dashboard'
                ? 'Executive summary of capital, finance, fleet, projects, and pending approvals.'
                : `Manage ${RESOURCE_CONFIG[view]?.title?.toLowerCase() || 'records'} records, search, filter, and update.`}
            </div>
          </div>
          <div className="portal-topbar-actions">
            {view === 'dashboard' && (
              <button className="portal-icon-button" title="Refresh" onClick={() => setRefreshKey((k) => k + 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
              </button>
            )}
            <div className="portal-user-pill">
              <span className="portal-user-name">{user?.name || user?.username || user?.email || 'Signed in'}</span>
              {role && <span className="portal-user-role">{role}</span>}
            </div>
            <button className="portal-signout-button" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <div id="portalContent" style={{padding: '2rem'}}>
          {dataLoading && <p className="portal-state portal-state-loading">Loading summary…</p>}
          {dataError && <div className="portal-state portal-state-error">{dataError}</div>}
          {!dataLoading && !dataError && view === 'dashboard' && !data && (
          <div className="portal-empty">No summary data is available for your account.</div>
        )}
        {!dataLoading && !dataError && view === 'dashboard' && data && (
            <div>
              <h2 style={{color: 'var(--navy-900)', marginBottom: '1rem'}}>Overview</h2>
              <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>Welcome to the Prime Horizon Group management portal. Select a section from the sidebar to view portal data.</p>
              {user && <p style={{marginBottom: '1rem'}}>Signed in as <strong>{user.email || user.username}</strong> ({role || 'user'}).</p>}
              {data && typeof data === 'object' && !Array.isArray(data) && (
                <div style={{marginTop: '1rem'}}>
                  {Object.keys(data).length === 0 ? (
                    <div style={{padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px'}}>
                      No overview data is available for your role.
                    </div>
                  ) : (
                    <div className="portal-kpi-grid">
                      {data.capital && (
                        <section style={{display: 'contents'}}>
                          <h3 className="portal-kpi-section-title">Capital</h3>
                          <KpiCard label="Total shares" value={fmtCount(data.capital.total_shares)} />
                          <KpiCard label="Committed capital" value={fmtETB(data.capital.committed)} />
                          <KpiCard label="Paid-in capital" value={fmtETB(data.capital.received)} variant="success" />
                          <KpiCard label="Outstanding" value={fmtETB(data.capital.outstanding)} variant="warning" />
                          <KpiCard label="Collection" value={fmtPct(data.capital.collection_pct)} progress={data.capital.collection_pct} />
                        </section>
                      )}
                      {data.finance && (
                        <section style={{display: 'contents'}}>
                          <h3 className="portal-kpi-section-title">Finance</h3>
                          <KpiCard label="Income" value={fmtETB(data.finance.income)} variant="success" />
                          <KpiCard label="Expenses" value={fmtETB(data.finance.expenses)} variant="danger" />
                          <KpiCard label="Net result" value={fmtETB(data.finance.result)} variant={Number(data.finance.result) >= 0 ? 'success' : 'danger'} />
                        </section>
                      )}
                      {data.fleet && (
                        <section style={{display: 'contents'}}>
                          <h3 className="portal-kpi-section-title">Fleet</h3>
                          <KpiCard label="Total vehicles" value={fmtCount(data.fleet.total)} />
                          <KpiCard label="Available" value={fmtCount(data.fleet.available)} variant="success" />
                          <KpiCard label="On trip" value={fmtCount(data.fleet.on_trip)} />
                          <KpiCard label="In maintenance" value={fmtCount(data.fleet.maintenance)} variant="warning" />
                        </section>
                      )}
                      {data.projects && (
                        <section style={{display: 'contents'}}>
                          <h3 className="portal-kpi-section-title">Projects</h3>
                          <KpiCard label="Total projects" value={fmtCount(data.projects.total)} />
                          <KpiCard label="Active" value={fmtCount(data.projects.active)} variant="success" />
                        </section>
                      )}
                      {data.pending && (
                        <section style={{display: 'contents'}}>
                          <h3 className="portal-kpi-section-title">Pending approvals</h3>
                          <KpiCard label="Contributions" value={fmtCount(data.pending.contributions)} />
                          <KpiCard label="Transactions" value={fmtCount(data.pending.transactions)} />
                        </section>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {!dataLoading && !dataError && view !== 'dashboard' && (
  <ResourceManager view={view} role={role} />
)}
        </div>
      </main>
    </div>
  );
};
