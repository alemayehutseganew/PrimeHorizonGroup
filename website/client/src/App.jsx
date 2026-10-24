import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const isDev = import.meta.env.DEV;
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || (isDev ? 'http://127.0.0.1:8000/api' : '');

function getStored(key) {
  try { return sessionStorage.getItem(key); } catch (e) { return null; }
}
const ACCESS_TOKEN = getStored('phg_access_token');
const REFRESH_TOKEN = getStored('phg_refresh_token');

function setToken(t, refresh) {
  try { sessionStorage.setItem('phg_access_token', t || ''); } catch (e) {}
  try { sessionStorage.setItem('phg_refresh_token', refresh || ''); } catch (e) {}
}
function clearToken() {
  try { sessionStorage.removeItem('phg_access_token'); } catch (e) {}
  try { sessionStorage.removeItem('phg_refresh_token'); } catch (e) {}
}

window.PHG_API = {
  login: async function (credentials) {
    const res = await fetch(API_BASE + '/auth/token/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (data.access) { setToken(data.access, data.refresh || ''); return {user: data.user, mode: 'live'};}
    throw new Error('Login failed');
  },
  logout: async function () { clearToken(); return Promise.resolve(); },
  me: async function () {
    try {
      const res = await fetch(API_BASE + '/auth/me/');
      const data = await res.json();
      return {user: data, mode: 'live'};
    } catch (_) { clearToken(); return {user: null, mode: 'offline'}; }
  },
};
import {Home} from './pages/Home';
import {About} from './pages/About';
import {Services} from './pages/Services';
import {Projects} from './pages/Projects';
import {Contact} from './pages/Contact';
import {Careers} from './pages/Careers';
import {Privacy} from './pages/Privacy';
import {Terms} from './pages/Terms';
import {Portal} from './pages/Portal';

function PublicLayout() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Header />
      <main style={{flex: 1}}><Outlet /></main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(ACCESS_TOKEN ? 'live' : 'offline');
  const [user, setUser] = useState(ACCESS_TOKEN ? {id: 1, name: 'Current User'} : null);

  useEffect(() => {
    setMode(ACCESS_TOKEN ? 'live' : 'offline');
    setUser(ACCESS_TOKEN ? {id: 1, name: 'Current User'} : null);
  }, [ACCESS_TOKEN]);

  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path='about' element={<About />} />
          <Route path='services' element={<Services />} />
          <Route path='projects' element={<Projects />} />
          <Route path='careers' element={<Careers />} />
          <Route path='contact' element={<Contact />} />
          <Route path='privacy' element={<Privacy />} />
          <Route path='terms' element={<Terms />} />
          <Route path='shareholders' element={<div className='container section'><h2>Shareholders</h2><p>Shareholder management</p></div>} />
          <Route path='contributions' element={<div className='container section'><h2>Contributions</h2><p>Capital contributions</p></div>} />
          <Route path='summary' element={<div className='container section'><h2>Summary</h2><p>Dashboard summary</p></div>} />
          <Route path='auth/me' element={<div className='container section'><h2>User Profile</h2><p>User information</p></div>} />
          <Route path='auth/login' element={<div className='container section'><h2>Login</h2><p>Use the portal at /portal to log in.</p></div>} />
          <Route path='auth/logout' element={<Navigate to='/' replace />} />
        </Route>
        <Route path='portal' element={<Portal />} />
      </Routes>
    </Router>
  );
}
