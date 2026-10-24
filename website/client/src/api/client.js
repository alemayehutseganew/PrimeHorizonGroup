/**
 * Centralized API client for the React (Vite) frontend.
 *
 * - Base URL comes from Vite env (VITE_API_BASE_URL, with legacy VITE_API_BASE fallback).
 * - JWT Bearer authentication with automatic, de-duplicated token refresh.
 * - Consistent error handling for network/HTTP/validation failures.
 */
const isDev = import.meta.env.DEV;
const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  (isDev ? 'http://127.0.0.1:8000/api' : '');

export const API_BASE_URL = String(RAW_BASE).replace(/\/+$/, '');

const ACCESS_KEY = 'phg_access_token';
const REFRESH_KEY = 'phg_refresh_token';

function readStorage(key) {
  try { return sessionStorage.getItem(key); } catch (e) { return null; }
}
function writeStorage(key, value) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch (e) { /* ignore */ }
}

let accessToken = readStorage(ACCESS_KEY);
let refreshToken = readStorage(REFRESH_KEY);

export function getAccessToken() { return accessToken || readStorage(ACCESS_KEY); }
export function getRefreshToken() { return refreshToken || readStorage(REFRESH_KEY); }

export function setTokens(access, refresh) {
  accessToken = access || null;
  if (refresh !== undefined) refreshToken = refresh || null;
  writeStorage(ACCESS_KEY, accessToken);
  if (refresh !== undefined) writeStorage(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  writeStorage(ACCESS_KEY, null);
  writeStorage(REFRESH_KEY, null);
}

function isJsonResponse(res) {
  const ct = res.headers.get('content-type') || '';
  return ct.toLowerCase().includes('application/json');
}

async function parseBody(res) {
  if (res.status === 204) return null;
  if (isJsonResponse(res)) {
    try { return await res.json(); } catch (e) { return null; }
  }
  try { return await res.text(); } catch (e) { return null; }
}

function buildError(res, body) {
  const detail =
    (body && (body.detail || body.message || body.error)) ||
    (typeof body === 'string' ? body : null) ||
    `Request failed (${res.status})`;
  const err = new Error(detail);
  err.status = res.status;
  err.body = body;
  return err;
}

let refreshPromise = null;
async function doRefresh() {
  const rt = getRefreshToken();
  if (!rt) return false;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: rt }),
      });
      const body = await parseBody(res);
      if (!res.ok || !body || !body.access) {
        clearTokens();
        return false;
      }
      setTokens(body.access, body.refresh || rt);
      return true;
    } catch (e) {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const hasBody = options.body !== undefined && method !== 'GET' && method !== 'HEAD';

  const headers = { ...(options.headers || {}) };
  const token = getAccessToken();
  if (token && !options._skipAuth) headers['Authorization'] = `Bearer ${token}`;
  if (hasBody && !headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let body = options.body;
  if (hasBody && body && !(body instanceof FormData) && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: hasBody ? body : undefined,
      credentials: options.credentials,
      signal: options.signal,
    });
  } catch (e) {
    const err = new Error('Network error. Please check your connection.');
    err.status = 0;
    err.body = null;
    throw err;
  }

  if (res.status === 401 && getRefreshToken() && !options._retried && !options._skipAuth) {
    const ok = await doRefresh();
    if (ok) {
      return request(path, { ...options, _retried: true });
    }
  }

  const parsed = await parseBody(res);
  if (!res.ok) {
    throw buildError(res, parsed);
  }
  return parsed;
}

export const api = {
  request,
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),

  login: async (credentials) => {
    const data = await request('/auth/token/', { method: 'POST', body: credentials, _skipAuth: true });
    if (data && data.access) setTokens(data.access, data.refresh || '');
    return data;
  },
  logout: async () => {
    const rt = getRefreshToken();
    try {
      if (rt) await request('/auth/logout/', { method: 'POST', body: { refresh: rt } });
    } catch (e) { /* ignore */ }
    finally { clearTokens(); }
  },
  me: async () => request('/auth/me/'),
};

export default api;

