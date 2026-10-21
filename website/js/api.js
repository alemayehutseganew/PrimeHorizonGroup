/* Prime Horizon Group — API service layer */
(function () {
  "use strict";

  // Production: Vercel serves the Django app ONLY as the per-file function
  // at /api/index (the router ignores rewrites whose destination is a
  // function, so /api/auth/token/ 404s at the platform). Call the function
  // at its native route and pass the real API path in __phg_path;
  // api/index.py restores it as PATH_INFO before Django resolves the URL.
  var API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8001/api"
    : "/api/index?__phg_path=";

  var TOKEN_KEY = "phg_access_token";
  var REFRESH_KEY = "phg_refresh_token";

  function getStored(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  // FIX: restore persisted session at startup. Previously ACCESS_TOKEN
  // stayed null after refresh, forcing 401s until next login.
  var ACCESS_TOKEN = getStored(TOKEN_KEY);
  var REFRESH_TOKEN = getStored(REFRESH_KEY);
  var apiMode = ACCESS_TOKEN ? "live" : "offline";

  function getToken() { return ACCESS_TOKEN || getStored(TOKEN_KEY); }
  function setToken(t, refresh) {
    ACCESS_TOKEN = t || null;
    try {
      if (t) sessionStorage.setItem(TOKEN_KEY, t);
      else sessionStorage.removeItem(TOKEN_KEY);
      if (refresh !== undefined) {
        if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
        else sessionStorage.removeItem(REFRESH_KEY);
      }
    } catch (e) {}
    if (refresh !== undefined) REFRESH_TOKEN = refresh || null;
  }
  function clearToken() {
    ACCESS_TOKEN = null; REFRESH_TOKEN = null;
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {}
    try { sessionStorage.removeItem(REFRESH_KEY); } catch (e) {}
  }

  function unwrap(data) {
    if (data && Array.isArray(data.results)) return data.results;
    return data;
  }

  function headers(extra, noBody) {
    var h = {};
    var token = ACCESS_TOKEN || getStored(TOKEN_KEY);
    if (token) h["Authorization"] = "Bearer " + token;
    // FIX: never send JSON Content-Type on bodyless GET/DELETE/HEAD;
    // FormData uploads need browser-generated multipart boundary.
    if (!noBody) h["Content-Type"] = "application/json";
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  async function rawFetch(url, opts) {
    var res = await fetch(url, opts);
    if (res.status === 204) return null;
    var ct = res.headers.get("content-type") || "";
    var payload = null;
    try {
      payload = ct.indexOf("application/json") !== -1
        ? await res.json() : await res.text();
    } catch (_) { payload = { detail: "HTTP " + res.status }; }
    if (!res.ok) throw { status: res.status, body: payload };
    return payload;
  }

  async function tryRefresh() {
    var rt = REFRESH_TOKEN || getStored(REFRESH_KEY);
    if (!rt) return false;
    try {
      var base = API_BASE;
      var url = base + "/auth/token/refresh/";
      var res = await fetch(url, { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: rt }) });
      if (!res.ok) { clearToken(); return false; }
      var data = await res.json();
      if (data.access) { setToken(data.access, data.refresh || rt); return true; }
    } catch (_) {}
    clearToken(); return false;
  }

  async function apiRequest(path, opts) {
    opts = opts || {};
    var method = (opts.method || "GET").toUpperCase();
    var hasBody = opts.body !== undefined && method !== "GET" && method !== "HEAD";
    var url = API_BASE + path;
    var reqHeaders = headers(opts.headers, !hasBody);
    if (opts.body && typeof opts.body !== "string"
        && !((typeof FormData !== "undefined") && (opts.body instanceof FormData))) {
      opts.body = JSON.stringify(opts.body);
    }
    // Drop JSON content-type if body is FormData (browser sets boundary).
    if ((typeof FormData !== "undefined") && (opts.body instanceof FormData)) {
      delete reqHeaders["Content-Type"];
    }
    try {
      try {
        return await rawFetch(url, { method: method, headers: reqHeaders,
          body: hasBody ? opts.body : undefined, credentials: "same-origin" });
      } catch (err) {
        if (err && err.status === 401 && !opts._retried) {
          opts._retried = true;
          if (await tryRefresh()) return apiRequest(path, opts);
        }
        throw err;
      }
    } catch (err) {
      if (err && err.status !== undefined) throw err;
      throw { status: 0, body: { detail: "Network unreachable — is the API running?" } };
    }
  }

  /* ---------- Auth ---------- */
  async function login(email, password) {
    var data = await apiRequest("/auth/token/", {
      method: "POST", body: { email: email.toLowerCase(), password: password }
    });
    var access = data.access;
    setToken(access, data.refresh || null);
    apiMode = "live";
    return access;
  }

  async function logout() {
    var refresh = REFRESH_TOKEN || getStored(REFRESH_KEY);

    try {
      if (refresh) {
        await apiRequest("/auth/logout/", {
          method: "POST",
          body: { refresh: refresh },
          _retried: true
        });
      }
    } finally {
      clearToken();
      apiMode = "offline";
    }
  }

  async function me() {
    return apiRequest("/auth/me/", { method: "GET" });
  }

  /* ---------- Account lifecycle (signup / verify / reset) ---------- */
  async function signup(email, username, password) {
    return apiRequest("/auth/signup/", {
      method: "POST",
      body: { email: email.toLowerCase(), username: username, password: password }
    });
  }

  async function verifyEmail(token) {
    return apiRequest("/auth/email-verification/", {
      method: "POST", body: { token: token }
    });
  }

  async function requestPasswordReset(email) {
    // Backend always returns the same generic response whether or not the
    // account exists — never surface account state to the caller.
    return apiRequest("/auth/password-reset/", {
      method: "POST", body: { email: email.toLowerCase() }
    });
  }

  async function confirmPasswordReset(token, newPassword, confirmation) {
    return apiRequest("/auth/password-reset/confirm/", {
      method: "POST",
      body: {
        token: token,
        new_password: newPassword,
        password_confirmation: confirmation || newPassword
      }
    });
  }
  /* ---------- Data endpoints ---------- */
  var ENDPOINTS = {
    shareholders: "/shareholders/",
    contributions: "/contributions/",
    meetings: "/meetings/",
    customers: "/customers/",
    leads: "/leads/",
    inquiries: "/inquiries/",
    vehicles: "/vehicles/",
    drivers: "/drivers/",
    trips: "/trips/",
    maintenance: "/maintenance/",
    projects: "/projects/",
    tasks: "/tasks/",
    transactions: "/transactions/",
    invoices: "/invoices/",
    payments: "/payments/",
    documents: "/documents/",
    notifications: "/notifications/",
    audit: "/audit/",
    users: "/users/"
  };

  function list(endpoint) {
    var url = ENDPOINTS[endpoint] || endpoint;
    return apiRequest(url, { method: "GET" }).then(unwrap);
  }

  function approveContribution(code, note) {
    return apiRequest("/contributions/" + encodeURIComponent(code) + "/approve/",
      { method: "POST", body: JSON.stringify(note ? { note: note } : {}) });
  }
  function rejectContribution(code, note) {
    return apiRequest("/contributions/" + encodeURIComponent(code) + "/reject",
      { method: "POST", body: JSON.stringify({ note: note || "" }) });
  }

  function approveProject(id) {
    return apiRequest("/projects/" + encodeURIComponent(id) + "/approve",
      { method: "POST" });
  }

  function rejectProject(id, note) {
    return apiRequest("/projects/" + encodeURIComponent(id) + "/reject",
      { method: "POST", body: JSON.stringify({ note: note || "" }) });
  }

  function approveTask(id) {
    return apiRequest("/tasks/" + encodeURIComponent(id) + "/approve",
      { method: "POST" });
  }

  function rejectTask(id, note) {
    return apiRequest("/tasks/" + encodeURIComponent(id) + "/reject",
      { method: "POST", body: JSON.stringify({ note: note || "" }) });
  }

  function postInquiry(payload) {
    return apiRequest("/inquiries/", { method: "POST", body: JSON.stringify(payload) });
  }
  function postVehicle(payload) {
    return apiRequest("/vehicles/", { method: "POST", body: JSON.stringify(payload) });
  }

  /* ---------- Generic CRUD ---------- */
  function create(endpoint, payload) {
    var url = ENDPOINTS[endpoint] || endpoint;
    return apiRequest(url, { method: "POST", body: JSON.stringify(payload) });
  }
  function update(endpoint, code, payload) {
    var url = ENDPOINTS[endpoint] || endpoint;
    return apiRequest(url + encodeURIComponent(code) + "/", { method: "PATCH", body: JSON.stringify(payload) });
  }
  function del(endpoint, code) {
    var url = ENDPOINTS[endpoint] || endpoint;
    return apiRequest(url + encodeURIComponent(code) + "/", { method: "DELETE" });
  }

  function summary() {
    return apiRequest("/summary/", { method: "GET" });
  }

  function setMode(mode) { apiMode = mode; }
  function getMode() { return apiMode; }
  function baseUrl() { return API_BASE; }

  /* ---------- Adaptation helpers ---------- */
  function num(v) { return typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0; }

  function adaptShareholder(s) {
    return {
      id: s.id, name: s.name, email: s.email, phone: s.phone || "",
      country: s.country || "Ethiopia", shares: num(s.shares),
      share_price: num(s.share_price), paid: num(s.paid),
      status: s.status, joined: s.joined || ""
    };
  }
  function adaptContribution(c) {
    return {
      id: c.id, sh: c.sh, amount: num(c.amount),
      currency: c.currency || "ETB", kind: c.kind || "Share capital",
      date: c.date, method: c.method || "Bank transfer",
      ref: c.ref, status: c.status, by: c.by || ""
    };
  }
  function adaptVehicle(v) {
    return {
      id: v.id, plate: v.plate, make: v.make, model: v.model,
      year: num(v.year), category: v.category, status: v.status,
      driver: v.driver || "—", odometer: num(v.odometer),
      insurance: v.insurance || "", purchase: num(v.purchase)
    };
  }
  function adaptDriver(d) {
    return {
      id: d.id, name: d.name, licence: d.licence || "B",
      phone: d.phone || "", trips: num(d.trips), status: d.status
    };
  }
  function adaptTrip(t) {
    return {
      id: t.id, customer: t.customer, vehicle: t.vehicle,
      driver: t.driver || "—", route: t.route, start: t.start, end: t.end,
      price: num(t.price), fuel: num(t.fuel), status: t.status
    };
  }
  function adaptMaintenance(m) {
    return {
      id: m.id, vehicle: m.vehicle, date: m.date,
      provider: m.provider || "", work: m.work || "",
      cost: num(m.cost), next: m.next || "", status: m.status
    };
  }
  function adaptProject(p) {
    return {
      id: p.id, name: p.name, customer: p.customer, division: p.division,
      manager: p.manager || "", value: num(p.value), spent: num(p.spent),
      progress: num(p.progress), status: p.status,
      priority: p.priority || "Medium", due: p.due || ""
    };
  }
  function adaptTask(t) {
    return {
      id: t.id, project: t.project, title: t.title, assignee: t.assignee || "",
      priority: t.priority || "Medium", due: t.due || "", status: t.status
    };
  }
  function adaptTransaction(t) {
    return {
      id: t.id, date: t.date, type: t.type, category: t.category,
      division: t.division, amount: num(t.amount), ref: t.ref, status: t.status
    };
  }
  function adaptInvoice(i) {
    return {
      id: i.id, customer: i.customer, issue: i.issue, due: i.due,
      total: num(i.total), paid: num(i.paid), status: i.status
    };
  }
  function adaptDocument(d) {
    return {
      id: d.id, name: d.name, category: d.category, linked: d.linked,
      uploaded: d.uploaded, by: d.by, access: d.access
    };
  }
  function adaptMeeting(m) {
    return {
      id: m.id, type: m.type, date: m.date, attendees: m.attendees || "",
      status: m.status, summary: m.summary || ""
    };
  }
  function adaptCustomer(c) {
    return {
      id: c.id, name: c.name, contact: c.contact || "",
      phone: c.phone || "", category: c.category || "",
      status: c.status || "Active"
    };
  }
  function adaptLead(l) {
    return {
      id: l.id, source: l.source || "", service: l.service || "",
      value: num(l.value), assignee: l.assignee || "",
      stage: l.stage || "New", follow: l.follow || ""
    };
  }
  function adaptNotification(n) {
    return {
      id: n.id, text: n.text, time: n.time,
      unread: n.unread !== undefined ? n.unread : !n.is_read,
      target: n.target || ""
    };
  }
  function adaptUser(u) {
    var full = (u.first_name || "") + (u.last_name ? " " + u.last_name : "");
    return {
      id: u.id, name: full.trim() || u.email.split("@")[0], email: u.email,
      role: u.role, title: u.title || u.role_label || u.role,
      phone: u.phone || "", status: u.status, last: u.last_login || ""
    };
  }

  async function safeList(endpoint, adapt) {
    try {
      var r = await list(endpoint);
      return r.map(adapt || function (x) { return x; });
    } catch (e) {
      // 403 = role not permitted for this section (expected for
      // shareholders/auditors); 404 = endpoint missing. Either way the
      // dashboard renders with the sections the user is allowed to see.
      if (e && (e.status === 403 || e.status === 404)) return [];
      throw e;
    }
  }

  /* Hydrate window.PHG_DATA from the live API. Returns {user, mode}. */
  async function hydrate() {
    var m = await me();
    var u = adaptUser(m.user);
    var fetched = await Promise.all([
      safeList("shareholders", adaptShareholder),
      safeList("contributions", adaptContribution),
      safeList("vehicles", adaptVehicle),
      safeList("drivers", adaptDriver),
      safeList("trips", adaptTrip),
      safeList("maintenance", adaptMaintenance),
      safeList("projects", adaptProject),
      safeList("tasks", adaptTask),
      safeList("transactions", adaptTransaction),
      safeList("invoices", adaptInvoice),
      safeList("documents", adaptDocument),
      safeList("meetings", adaptMeeting),
      safeList("notifications", adaptNotification),
      safeList("audit", function (a) {
        return { id: a.id, actor: a.actor, action: a.action, target: a.target, time: a.time, outcome: a.outcome };
      }),
      safeList("users", adaptUser),
      // FIX §7.1: customers & leads were never hydrated — the CRM view
      // rendered an empty pipeline even when the API had rows.
      safeList("customers", adaptCustomer),
      safeList("leads", adaptLead)
    ]);
    var PHG_DATA = window.PHG_DATA || {};
    PHG_DATA.shareholders = fetched[0];
    PHG_DATA.contributions = fetched[1];
    PHG_DATA.vehicles = fetched[2];
    PHG_DATA.drivers = fetched[3];
    PHG_DATA.trips = fetched[4];
    PHG_DATA.maintenance = fetched[5];
    PHG_DATA.projects = fetched[6];
    PHG_DATA.tasks = fetched[7];
    PHG_DATA.transactions = fetched[8];
    PHG_DATA.invoices = fetched[9];
    PHG_DATA.documents = fetched[10];
    PHG_DATA.meetings = fetched[11];
    PHG_DATA.notifications = fetched[12];
    PHG_DATA.auditLog = fetched[13];
    PHG_DATA.users = fetched[14];
    PHG_DATA.customers = fetched[15];
    PHG_DATA.leads = fetched[16];
    PHG_DATA.sharePrice = m.share_price || 250000;
    window.PHG_DATA = PHG_DATA;
    return { user: u, mode: "live" };
  }

  // Ensure PHG_API is always defined, even if something goes wrong above.
  // This fallback prevents the "PHG_API is not defined" error that breaks login.
  var phgApiFallback = {
    login: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    logout: function () { return Promise.resolve(); },
    me: function () { return Promise.resolve({ user: null, mode: "offline" }); },
    list: function () { return Promise.resolve([]); },
    summary: function () { return { shareholders: [], contributions: [], totalShares: 0, sharePrice: 250000 }; },
    approveContribution: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    rejectContribution: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    approveProject: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    rejectProject: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    approveTask: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    rejectTask: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    postInquiry: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    postVehicle: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    create: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    update: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    del: function () { return Promise.reject(new Error("PHG_API not initialized")); },
    hydrate: function () { return Promise.resolve({ user: null, mode: "offline" }); },
    setMode: function () {}, getMode: function () { return "offline"; },
    baseUrl: "/api/index?__phg_path=", getToken: function () { return null; }
  };

  

  // Also expose a handy reference for portal.js initialization checks.
  window.PHG_API = {
  login: login, logout: logout, me: me, list: list, summary: summary,
  signup: signup, verifyEmail: verifyEmail,
  requestPasswordReset: requestPasswordReset,
  confirmPasswordReset: confirmPasswordReset,
  approveContribution: approveContribution, rejectContribution: rejectContribution,
  approveProject: approveProject, rejectProject: rejectProject,
  approveTask: approveTask, rejectTask: rejectTask,
  postInquiry: postInquiry, postVehicle: postVehicle,
  create: create, update: update, del: del,
  hydrate: hydrate, setMode: setMode, getMode: getMode,
  baseUrl: baseUrl, getToken: function () { return ACCESS_TOKEN || getStored(TOKEN_KEY); }
};

// Fail-closed: if for some reason PHG_API is not a proper object, remove it.
try {
  if (typeof window.PHG_API !== 'object' || typeof window.PHG_API.login !== 'function') {
    delete window.PHG_API;
    window.PHG_API_INIT_ERROR = true;
  } else {
    window.PHG_API_INIT_ERROR = false;
  }
} catch (e) {
  delete window.PHG_API;
  window.PHG_API_INIT_ERROR = true;
}

// PHG_API is now the real implementation using rawFetch and apiRequest infrastructure.
// If the real implementation couldn't be verified, window.PHG_API is undefined
// and window.PHG_API_INIT_ERROR = true, causing portal.js to show:
// "Portal services failed to initialize. Please refresh the page."

// Also expose a handy reference for portal.js initialization checks.
window.PHG_API_INIT_ERROR = false;
})();

