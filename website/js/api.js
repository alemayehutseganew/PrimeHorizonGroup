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
  var ACCESS_TOKEN = null;
  var apiMode = "offline";

  function getToken() {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch (e) {}
    ACCESS_TOKEN = t;
  }
  function clearToken() {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {}
    ACCESS_TOKEN = null;
  }

  function unwrap(data) {
    if (data && Array.isArray(data.results)) return data.results;
    return data;
  }

  function headers(extra) {
    var h = { "Content-Type": "application/json" };
    if (ACCESS_TOKEN) h["Authorization"] = "Bearer " + ACCESS_TOKEN;
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  async function apiRequest(path, opts) {
    opts = opts || {};
    var url = API_BASE + path;
    if (!opts.headers) opts.headers = {};
    for (var k in headers()) opts.headers[k] = headers()[k];
    try {
      var res = await fetch(url, opts);
      if (!res.ok) {
        var err;
        try { err = await res.json(); } catch (_) { err = { detail: "HTTP " + res.status }; }
        throw { status: res.status, body: err };
      }
      var ct = res.headers.get("content-type") || "";
      if (ct.indexOf("application/json") !== -1) return await res.json();
      return await res.text();
    } catch (err) {
      if (err && err.status !== undefined) throw err;
      throw { status: 0, body: { detail: "Network unreachable — is the API running?" } };
    }
  }

  /* ---------- Auth ---------- */
  async function login(email, password) {
    var data = await apiRequest("/auth/token/", {
      method: "POST", body: JSON.stringify({ email: email.toLowerCase(), password: password })
    });
    var access = data.access;
    setToken(access);
    return access;
  }

  function logout() {
    clearToken();
    apiMode = "offline";
  }

  async function me() {
    return apiRequest("/auth/me/", { method: "GET" });
  }
  /* ---------- Data endpoints ---------- */
  var ENDPOINTS = {
    shareholders: "/shareholders/",
    contributions: "/contributions/",
    meetings: "/meetings/",
    customers: "/customers/",
    leads: "/leads/",
    vehicles: "/vehicles/",
    drivers: "/drivers/",
    trips: "/trips/",
    maintenance: "/maintenance/",
    projects: "/projects/",
    tasks: "/tasks/",
    transactions: "/transactions/",
    invoices: "/invoices/",
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
    return apiRequest("/contributions/" + encodeURIComponent(code) + "/reject/",
      { method: "POST", body: JSON.stringify({ note: note || "" }) });
  }

  function postInquiry(payload) {
    return apiRequest("/inquiries/", { method: "POST", body: JSON.stringify(payload) });
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
      safeList("users", adaptUser)
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
    PHG_DATA.sharePrice = m.share_price || 250000;
    window.PHG_DATA = PHG_DATA;
    return { user: u, mode: "live" };
  }

  window.PHG_API = {
    login: login, logout: logout, me: me, list: list, summary: summary,
    approveContribution: approveContribution, rejectContribution: rejectContribution,
    postInquiry: postInquiry, hydrate: hydrate, setMode: setMode, getMode: getMode,
    baseUrl: baseUrl, getToken: function () { return ACCESS_TOKEN; }
  };
})();

