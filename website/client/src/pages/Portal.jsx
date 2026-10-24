import React, {useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, clearTokens } from '../api/client';
import './Portal.css';

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
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await api.login({ username, password });
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
      <aside className="portal-sidebar">
        <div className="brand-mark" style={{width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--navy-800), var(--blue-600))', display: 'grid', placeItems: 'center', marginBottom: '24px'}}>
          <svg width="22" height="22" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <path d="M10 30 L22 12 L34 30" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
        <h3 style={{color: 'var(--teal-500)', marginBottom: '24px'}}>Prime Horizon Portal</h3>
        <nav>
          <ul style={{lineHeight: '1.8', paddingLeft: 0, margin: 0, listStyle: 'none'}}>
            <li style={{margin: '8px 0'}}><Link to="/portal" onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''} style={{color: 'rgba(255,255,255,0.9)', textDecoration: 'none'}}><span style={{marginRight: '10px', color: 'var(--teal-500)'}}>▦</span>Overview</Link></li>
            {canView('shareholders') && (<li style={{margin: '8px 0'}}><Link to="/portal/shareholders" onClick={() => setView('shareholders')} className={view === 'shareholders' ? 'active' : ''} style={{color: 'rgba(255,255,255,0.9)', textDecoration: 'none'}}><span style={{marginRight: '10px', color: 'var(--teal-500)'}}>👥</span>Shareholders</Link></li>)}
            {canView('contributions') && (<li style={{margin: '8px 0'}}><Link to="/portal/contributions" onClick={() => setView('contributions')} className={view === 'contributions' ? 'active' : ''} style={{color: 'rgba(255,255,255,0.9)', textDecoration: 'none'}}><span style={{marginRight: '10px', color: 'var(--teal-500)'}}>💰</span>Capital Contributions</Link></li>)}
            {canView('projects') && (<li style={{margin: '8px 0'}}><Link to="/portal/projects" onClick={() => setView('projects')} className={view === 'projects' ? 'active' : ''} style={{color: 'rgba(255,255,255,0.9)', textDecoration: 'none'}}><span style={{marginRight: '10px', color: 'var(--teal-500)'}}>📁</span>Projects</Link></li>)}
            {canView('documents') && (<li style={{margin: '8px 0'}}><Link to="/portal/documents" onClick={() => setView('documents')} className={view === 'documents' ? 'active' : ''} style={{color: 'rgba(255,255,255,0.9)', textDecoration: 'none'}}><span style={{marginRight: '10px', color: 'var(--teal-500)'}}>📄</span>Documents</Link></li>)}
          </ul>
        </nav>
        <div style={{marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <button onClick={handleLogout} style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', width: '100%'}}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <h2 id="topbarTitle" style={{margin: 0, color: 'var(--navy-800)'}}>{view === 'dashboard' ? 'Overview' : view === 'shareholders' ? 'Shareholders' : view === 'contributions' ? 'Capital Contributions' : view === 'projects' ? 'Projects' : 'Documents'}</h2>
            <div className="pt-sub" id="topbarSub" style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>—</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto'}}>
            <button className="pt-btn" id="btnRefresh" title="Refresh" onClick={() => setRefreshKey((k) => k + 1)} style={{padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', color: 'var(--navy-800)', cursor: 'pointer', fontSize: '0.85rem'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            </button>
            <button onClick={handleLogout} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '8px'}}>
              Sign out
            </button>
          </div>
        </header>

        <div id="portalContent" style={{padding: '2rem'}}>
          {dataLoading && <p style={{color: 'var(--text-muted)'}}>Loading…</p>}
          {dataError && <div style={{color: '#c0392b', marginBottom: '1rem'}}>{dataError}</div>}
          {!dataLoading && !dataError && view === 'dashboard' && (
            <div>
              <h2 style={{color: 'var(--navy-900)', marginBottom: '1rem'}}>Overview</h2>
              <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>Welcome to the Prime Horizon Group management portal. Select a section from the sidebar to view portal data.</p>
              {user && <p style={{marginBottom: '1rem'}}>Signed in as <strong>{user.email || user.username}</strong> ({role || 'user'}).</p>}
              {data && typeof data === 'object' && !Array.isArray(data) && (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                  {Object.entries(data).map(([k, v]) => (
                    <div key={k} style={{background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem'}}>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize'}}>{k}</div>
                      <pre style={{margin: '0.5rem 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap'}}>{JSON.stringify(v, null, 1)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!dataLoading && !dataError && view !== 'dashboard' && Array.isArray(data) && (
            <div>
              <h2 style={{color: 'var(--navy-900)', marginBottom: '1rem', textTransform: 'capitalize'}}>{view}</h2>
              {data.length === 0 ? (
                <p style={{color: 'var(--text-muted)'}}>No records found.</p>
              ) : (
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', background: '#fff'}}>
                    <thead>
                      <tr>
                        {Object.keys(data[0]).slice(0, 8).map((k) => (
                          <th key={k} style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', fontSize: '0.8rem'}}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, i) => (
                        <tr key={i}>
                          {Object.keys(data[0]).slice(0, 8).map((k) => (
                            <td key={k} style={{padding: '8px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem'}}>{String(row[k] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {!dataLoading && !dataError && view !== 'dashboard' && !Array.isArray(data) && data && (
            <div>
              <h2 style={{color: 'var(--navy-900)', marginBottom: '1rem', textTransform: 'capitalize'}}>{view}</h2>
              <pre style={{background: '#fff', padding: '1rem', borderRadius: '8px', overflowX: 'auto'}}>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
