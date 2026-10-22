/* Prime Horizon Group â€” Management Portal (demo SPA)
   Role-aware navigation, mock data, approval workflows and audit trail.
   NOTE: This is a front-end demonstration. In production, every permission
   check, calculation and approval must be enforced by the Django REST API. */
(function () {
  "use strict";

  var D = window.PHG_DATA;

  /* ---------- Role â†’ allowed views ---------- */
  var ROLE_VIEWS = {
    gm:         ["dashboard","shareholders","contributions","leads","projects","tasks","finance","invoices","documents","meetings","reports","notifications","audit","users","settings"],
    finance:    ["dashboard","shareholders","contributions","leads","finance","invoices","documents","meetings","reports","notifications","audit","settings"],
    projects:   ["dashboard","leads","projects","tasks","finance","documents","reports","notifications","settings"],
    admin:      ["dashboard","shareholders","contributions","projects","tasks","documents","meetings","notifications","audit","users","settings"],
    shareholder:["dashboard","shareholders","contributions","documents","meetings","reports","notifications","settings"],
    transport:  ["dashboard","leads","projects","tasks","finance","invoices","documents","reports","notifications","settings"]
  };

  var VIEW_META = {
    dashboard:     { title: "Overview",                 section: "Main",        icon: "grid" },
    shareholders:  { title: "Shareholders",             section: "Governance",  icon: "users" },
    contributions: { title: "Capital Contributions",    section: "Governance",  icon: "bank" },
    meetings:      { title: "Meetings & Resolutions",   section: "Governance",  icon: "gavel" },
    leads:         { title: "Customers & Leads",        section: "Operations",  icon: "briefcase" },
    vehicles:      { title: "Vehicles",                 section: "Operations",  icon: "truck" },
    drivers:       { title: "Drivers",                  section: "Operations",  icon: "idcard" },
    trips:         { title: "Trips & Bookings",         section: "Operations",  icon: "route" },
    maintenance:   { title: "Maintenance",              section: "Operations",  icon: "wrench" },
    projects:      { title: "Projects",                 section: "Operations",  icon: "folder" },
    tasks:         { title: "Tasks",                    section: "Operations",  icon: "check" },
    finance:       { title: "Income & Expenses",        section: "Finance",     icon: "chart" },
    invoices:      { title: "Invoices",                 section: "Finance",     icon: "file" },
    documents:     { title: "Documents",                section: "Resources",   icon: "archive" },
    reports:       { title: "Reports",                  section: "Resources",   icon: "report" },
    notifications: { title: "Notifications",            section: "Resources",   icon: "bell" },
    audit:         { title: "Audit Log",                section: "Admin",       icon: "shield" },
    users:         { title: "User Management",          section: "Admin",       icon: "usercog" },
    settings:      { title: "Settings",                 section: "Admin",       icon: "cog" }
  };
  /* ---------- Session state ---------- */
  var session = null;
  var pollTimer;
  var currentView = "dashboard";
  var dataReady = false;
  // Notifications mirror the hydrated PHG_DATA copy once live data arrives.
  var notifications = [];

  /* ---------- Utilities ---------- */
  function fmtETB(n) {
    return "ETB " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  function el(id) { return document.getElementById(id); }
  function data() {
    // Always read the current hydrated store; D may be replaced on login.
    return window.PHG_DATA || D || {};
  }
  function syncNotifications() {
    var src = data().notifications;
    notifications = Array.isArray(src) ? src.slice() : [];
    updateBell();
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function apiError(e) {
    if (!e) return "Unknown error";
    if (e.status === 0) return "Network unreachable â€” is the API running?";
    if (e.status === 401) return "Session expired â€” please sign in again.";
    if (e.body && typeof e.body === "object") {
      if (e.body.detail) return e.body.detail;
      var bits = [];
      for (var k in e.body) {
        var v = e.body[k];
        bits.push(k + ": " + (Array.isArray(v) ? v.join(", ") : v));
      }
      return bits.join("; ") || ("HTTP " + e.status);
    }
    return String(e.body || ("HTTP " + (e.status || "error")));
  }
  // Â§7.2/Â§7.3 helper: generic modal create-form that POSTs real data.
  // No demo fallback â€” validation errors stay on the form (Â§7.2).
  function openFormModal(title, fields, onSubmit, initial) {
    initial = initial || {};
    var ov = document.createElement("div");
    ov.className = "modal-overlay";
    ov.style.cssText = "position:fixed;inset:0;background:rgba(16,41,74,.5);display:flex;align-items:center;justify-content:center;z-index:200;";
    var inputs = fields.map(function (f, i) {
      var val = (initial[f.name] !== undefined && initial[f.name] !== null) ? initial[f.name] : "";
      return '<label style="display:block;margin:8px 0;font-size:.85rem">' + esc(f.label) +
        '<input data-f="' + i + '" type="text" value="' + esc(String(val)) + '" style="display:block;width:100%;margin-top:4px;padding:8px;border:1px solid #cbd5e1;border-radius:8px" /></label>';
    }).join("");
    ov.innerHTML = '<div style="background:#fff;border-radius:12px;padding:20px;min-width:320px;max-width:440px">' +
      "<h3 style='margin:0 0 8px'>" + esc(title) + "</h3>" +
      '<div class="ferr" style="display:none;color:#b91c1c;font-size:.82rem;margin-bottom:6px"></div>' +
      inputs +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">' +
      '<button class="btn btn-outline" data-x="cancel">Cancel</button>' +
      '<button class="btn btn-primary" data-x="save">Save</button></div></div>';
    document.body.appendChild(ov);
    function close() { if (ov.parentNode) ov.parentNode.removeChild(ov); }
    ov.querySelector('[data-x="cancel"]').addEventListener("click", close);
    ov.addEventListener("click", function (ev) { if (ev.target === ov) close(); });
    ov.querySelector('[data-x="save"]').addEventListener("click", function () {
      var vals = {};
      fields.forEach(function (f, i) {
        vals[f.name] = ov.querySelector('[data-f="' + i + '"]').value.trim();
        if (f.required && !vals[f.name]) vals.__missing = f.label;
      });
      var ferr = ov.querySelector(".ferr");
      if (vals.__missing) {
        ferr.style.display = "block";
        ferr.textContent = vals.__missing + " is required.";
        return;
      }
      ferr.style.display = "none";
      onSubmit(vals, function (errMsg) {
        if (errMsg) { ferr.style.display = "block"; ferr.textContent = errMsg; }
        else close();
      });
    });
  }
  function refreshLiveData() {
    // Re-fetch live rows then re-render current view (Â§7.2â€“7.4).
    if (!window.PHG_API || !PHG_API.hydrate) { navigate(currentView); return; }
    PHG_API.hydrate().then(function () {
      if (window.PHG_DATA) D = window.PHG_DATA;
      syncNotifications();
      navigate(currentView);
    }).catch(function (err) {
      toast("Refresh failed: " + apiError(err) + " â€” showing last loaded data.");
      navigate(currentView);
    });
  }
  function badgeFor(status) {
    var map = {
      "Active":"green","Approved":"green","Paid":"green","Completed":"green","Done":"green","Won":"green",
      "Pending":"amber","Booked":"amber","Scheduled":"amber","Sent":"amber","Partially paid":"amber","Under review":"amber","To do":"gray","New":"gray","Contacted":"gray","In progress":"blue","Qualified":"blue","Quotation sent":"blue","Negotiation":"blue","On trip":"blue",
      "Overdue":"red","Suspended":"red","Blocked":"red","Maintenance":"red","Cancelled":"red",
      "Available":"teal","Closed":"gray","Lead":"gray"
    };
    return '<span class="badge ' + (map[status] || "gray") + '">' + esc(status) + '</span>';
  }
  function toast(msg, type) {
    var t = el("portalToast");
    t.textContent = msg;
    t.className = "toast show " + (type || "");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.className = "toast"; }, 3200);
  }
  function can(view) {
    return session && ROLE_VIEWS[session.role].indexOf(view) !== -1;
  }
  /* ---------- Login ---------- */
  async function tryRestoreSession() {
    // FIX Â§6.1/Â§9: restore token-auth session on reload so protected API
    // calls succeed without forcing a fresh login every refresh.
    var token = null;
    try { token = window.PHG_API && PHG_API.getToken ? PHG_API.getToken() : null; } catch (e) {}
    if (!token) return false;
    try {
      try { await PHG_API.hydrate(); } catch (hErr) {
        console.warn("hydrate partial failure (continuing):", hErr);
      }
      D = window.PHG_DATA;
      var me = await PHG_API.me();
      var mu = (me && me.user) || {};
      var nm = ((mu.first_name || "") + (mu.last_name ? " " + mu.last_name : "")).trim() || mu.email || "";
      var role = String(mu.role || "").trim().toLowerCase();
      if (!role) {
          // Invalidate session â€” no role means not authenticated
          session = null;
          // Show authentication/authorization error and return to login
          return;
      }
      // Validate role against known application roles
      // Unknown roles must fail closed â€” do not grant shareholder access
      if (ROLE_VIEWS[role] === undefined) {
          // Unknown role â€” fail closed
          session = null;
          return;
      }
      session = { email: mu.email || "", name: nm, role: role, title: mu.title || mu.role || "" };
      startApp();
      return true;
    } catch (e) {
      try { PHG_API.logout(); } catch (_) {}
      return false;
    }
  }
  function initLogin() {
    // Attempt silent restore first (same login pipeline, no credentials).
    tryRestoreSession().catch(function () {});
    var form = el("loginForm");
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = el("loginEmail").value.trim().toLowerCase();
      var pass = el("loginPass").value;
      var err = el("loginError");
      err.classList.remove("show");
      err.className = "alert error";
      var token = null;
      try {
        token = await PHG_API.login(email, pass);
        PHG_API.setMode("live");
        try { await PHG_API.hydrate(); } catch (hErr) {
          console.warn("hydrate partial failure (continuing):", hErr);
        }
        D = window.PHG_DATA;
        var me = await PHG_API.me();
        var mu = me.user || {};
        var nm = ((mu.first_name || "") + (mu.last_name ? " " + mu.last_name : "")).trim() || mu.email || email;
        // Build the session exactly like tryRestoreSession() does. Without this
        // the app rendered no sidebar and every view threw on session.role.
        var role = String(mu.role || "").trim().toLowerCase();
        if (!role || ROLE_VIEWS[role] === undefined) {
          // Authenticated but not authorised for the portal - fail closed.
          try { await PHG_API.logout(); } catch (_) {}
          throw { status: 403, body: { detail: "Account has no portal role assigned." } };
        }
        session = { email: mu.email || email, name: nm, role: role, title: mu.title || mu.role_label || mu.role || "" };
        startApp();
        return;
      } catch (err2) {
        console.error("login pipeline error:", err2);
        var d = err2 && err2.body && (err2.body.detail || err2.body.email || err2.body.password);
        // Check if this is a PHG_API initialization error (not a real auth failure)
        var isInitError = !window.PHG_API || typeof window.PHG_API !== "object"
          || (err2 && err2.message && err2.message.indexOf("PHG_API not initialized") !== -1);
        if (isInitError) {
          // Portal services failed to initialize â€” do not expose internal JS errors as auth failures
          err.textContent = "Portal services failed to initialize. Please refresh the page.";
          console.error("PHG_API initialization failure, portal cannot start:", err2);
        } else {
          err.textContent = d ? ("Login failed: " + d)
            : ("Login failed: " + ((err2 && (err2.message || String(err2))) || "unknown error"));
          console.error("Login error:", err2);
        }
        err.classList.add("show");
      }
    });

    // Dev quick-login chips: localhost only. In production the
    // #demoAccounts block stays hidden so no credential is advertised.
    var isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(location.hostname || "");
    var daBox = document.getElementById("demoAccounts");
    if (daBox && isLocalHost) daBox.hidden = false;
    if (isLocalHost) document.querySelectorAll(".demo-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        el("loginEmail").value = chip.getAttribute("data-email");
        el("loginPass").value = "demo1234";
        el("loginError").classList.remove("show");
      });
    });

    /* ---------- Panel switching: login <-> reset <-> signup ---------- */
    function showPanel(which) {
      el("loginForm").hidden = which !== "login";
      el("resetForm").hidden = which !== "reset";
      el("signupForm").hidden = which !== "signup";
      ["loginError", "resetError", "resetDone", "signupError", "signupDone"]
        .forEach(function (id) { el(id).classList.remove("show"); });
      // Reset the multi-step forms when leaving them.
      if (which !== "reset") {
        el("resetStep1").hidden = false;
        el("resetStep2").hidden = true;
        el("resetForm").reset();
      }
      if (which !== "signup") {
        el("signupStep1").hidden = false;
        el("signupStep2").hidden = true;
        el("signupForm").reset();
      }
    }
    el("linkForgot").addEventListener("click", function (e) {
      e.preventDefault(); showPanel("reset");
    });
    el("linkSignup").addEventListener("click", function (e) {
      e.preventDefault(); showPanel("signup");
    });
    document.querySelectorAll(".backToLogin").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); showPanel("login"); });
    });

    function apiErrText(e, fallback) {
      var b = e && e.body;
      if (!b) return fallback;
      if (typeof b === "string") return fallback + ": " + b;
      var d = b.detail || b.email || b.username || b.token ||
        b.new_password || b.password || b.password_confirmation;
      if (Array.isArray(d)) d = d.join(" ");
      return d ? (fallback + ": " + d) : fallback;
    }

    /* ---------- Password reset ---------- */
    el("resetSend").addEventListener("click", async function () {
      var email = el("resetEmail").value.trim().toLowerCase();
      if (!email) return;
      var errBox = el("resetError"), doneBox = el("resetDone");
      errBox.classList.remove("show"); doneBox.classList.remove("show");
      try {
        await PHG_API.requestPasswordReset(email);
        el("resetStep1").hidden = true;
        el("resetStep2").hidden = false;
        doneBox.textContent = "If an account matches that email, a reset token " +
          "has been sent. Enter it below with your new password.";
        doneBox.classList.add("show");
      } catch (e2) {
        errBox.textContent = apiErrText(e2, "Could not request a reset.");
        errBox.classList.add("show");
      }
    });
    el("resetForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var token = el("resetToken").value.trim();
      var p1 = el("resetPass").value, p2 = el("resetPass2").value;
      var errBox = el("resetError"), doneBox = el("resetDone");
      errBox.classList.remove("show"); doneBox.classList.remove("show");
      if (p1 !== p2) {
        errBox.textContent = "Passwords do not match.";
        errBox.classList.add("show");
        return;
      }
      try {
        await PHG_API.confirmPasswordReset(token, p1, p2);
        showPanel("login");
        el("loginError").textContent =
          "Password reset successful â€” sign in with your new password.";
        el("loginError").className = "alert success show";
      } catch (e2) {
        el("loginError").className = "alert error";
        errBox.textContent = apiErrText(e2, "Password reset failed.");
        errBox.classList.add("show");
      }
    });

    /* ---------- Signup + email verification ---------- */
    el("signupSend").addEventListener("click", async function () {
      var email = el("signupEmail").value.trim().toLowerCase();
      var username = el("signupUsername").value.trim();
      var pass = el("signupPass").value;
      var errBox = el("signupError"), doneBox = el("signupDone");
      errBox.classList.remove("show"); doneBox.classList.remove("show");
      if (!email || !username || !pass) return;
      try {
        await PHG_API.signup(email, username, pass);
        el("signupStep1").hidden = true;
        el("signupStep2").hidden = false;
        doneBox.textContent = "Account created. Check your email for the " +
          "verification token, then enter it below to activate.";
        doneBox.classList.add("show");
      } catch (e2) {
        errBox.textContent = apiErrText(e2, "Sign-up failed.");
        errBox.classList.add("show");
      }
    });
    el("signupForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var token = el("signupToken").value.trim();
      var errBox = el("signupError"), doneBox = el("signupDone");
      errBox.classList.remove("show"); doneBox.classList.remove("show");
      try {
        await PHG_API.verifyEmail(token);
        showPanel("login");
        el("loginError").textContent =
          "Account verified â€” you can sign in now.";
        el("loginError").className = "alert success show";
      } catch (e2) {
        el("loginError").className = "alert error";
        errBox.textContent = apiErrText(e2, "Verification failed.");
        errBox.classList.add("show");
      }
    });
  }

  function startApp() {
    // FIX: re-point module cache at hydrated store + restore notifications.
    D = window.PHG_DATA || D;
    syncNotifications();
    PHG_API.setMode("live");
    var modeBadge = PHG_API.getMode() === "offline" ? ' <span style="font-size:0.72rem;color:#d97706">ï¿½? OFFLINE</span>' : '';
    el("loginScreen").style.display = "none";
    el("portalShell").classList.add("active");
    el("topbarTitle").innerHTML = VIEW_META.dashboard.title + modeBadge;
    renderSidebar();
    navigate("dashboard");
  }

  async function logout() {
    try { await PHG_API.logout(); } catch (e) {}
    if (pollTimer) clearInterval(pollTimer);
    session = null;
    el("portalShell").classList.remove("active");
    el("loginScreen").style.display = "";
    el("loginPass").value = "";
  }

  /* ---------- Sidebar ---------- */
  var ICONS = {
    grid:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>',
    bank:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 3v3M17 3v3"/>',
    gavel:'<path d="M14 13l-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="M18 3l3 3-4 4-3-3z"/><path d="M14 7l3 3"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
    truck:'<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    idcard:'<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="9" cy="10" r="2.2"/><path d="M5.5 16.5c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7"/><line x1="15" y1="9" x2="19" y2="9"/><line x1="15" y1="13" x2="19" y2="13"/>',
    route:'<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5"/>',
    wrench:'<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"/>',
    folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    check:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    chart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    archive:'<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
    report:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    usercog:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6"/><circle cx="18" cy="16" r="3"/>',
    cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10l2 2M19 5l-2 2M7 17l-2 2"/>'
  };
  function svgIcon(name, size) {
    return '<svg width="' + (size || 17) + '" height="' + (size || 17) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.grid) + '</svg>';
  }
  function renderSidebar() {
    var views = ROLE_VIEWS[session.role];
    var sections = ["Main","Governance","Operations","Finance","Resources","Admin"];
    var html = "";
    sections.forEach(function (sec) {
      var items = views.filter(function (v) { return VIEW_META[v].section === sec; });
      if (!items.length) return;
      html += '<div class="sn-section">' + sec + "</div>";
      items.forEach(function (v) {
        var pending = pendingCount(v);
        html += '<button class="sn-item' + (v === currentView ? " active" : "") + '" data-view="' + v + '">' +
          svgIcon(VIEW_META[v].icon) + "<span>" + VIEW_META[v].title + "</span>" +
          (pending ? '<span class="sn-badge">' + pending + "</span>" : "") +
          "</button>";
      });
    });
    el("sidebarNav").innerHTML = html;
    el("sidebarNav").querySelectorAll(".sn-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigate(btn.getAttribute("data-view"));
        el("portalSidebar").classList.remove("open");
      });
    });
    var initials = session.name.replace(/^(Ato|W\/ro)\s+/, "").split(" ").filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    el("userName").textContent = session.name;
    el("userTitle").textContent = session.title;
    el("userAvatar").textContent = initials;
  }

  function pendingCount(view) {
    if (view === "contributions" && (session.role === "gm" || session.role === "finance")) {
      return D.contributions.filter(function (c) { return c.status === "Pending"; }).length;
    }
    if (view === "finance" && (session.role === "gm" || session.role === "finance")) {
      return D.transactions.filter(function (t) { return t.status === "Pending"; }).length;
    }
    return 0;
  }

  /* ---------- Router ---------- */
  var VIEWS = {};
  async function navigate(view) {
    if (!can(view)) view = "dashboard";
    currentView = view;
    renderSidebar();
    el("topbarTitle").textContent = VIEW_META[view].title;
    el("topbarSub").textContent = session.title + " Â· " + session.name;
    el("portalContent").innerHTML = "";
    if (PHG_API.getMode() === "live") {
      try { await PHG_API.hydrate(); } catch (_) {}
    }
    (VIEWS[view] || VIEWS.dashboard)();
    window.scrollTo(0, 0);
  }
  /* ---------- View helpers ---------- */
  function content() { return el("portalContent"); }
  /* ---------- Modal lifecycle helpers (single source of truth) ---------- */
  function openModal(mb) {
    mb = mb || el("modalBackdrop");
    if (!mb) return;
    /* Reset the confirm button: a previous failed save may have left it disabled. */
    var ok = el("modalOk");
    if (ok) ok.disabled = false;
    mb.classList.add("open");
    mb.style.display = "flex";
  }
  function closeModal() {
    var mb = el("modalBackdrop");
    if (mb) { mb.classList.remove("open"); mb.style.display = "none"; }
  }
  function pageHead(title, sub, actionsHtml) {
    return '<div class="page-head"><div><h1>' + title + '</h1><p>' + sub + '</p></div>' +
      (actionsHtml ? '<div style="display:flex; gap:10px; flex-wrap:wrap">' + actionsHtml + "</div>" : "") + "</div>";
  }
  function statCard(icon, tone, value, label) {
    return '<div class="stat-card"><div class="sc-icon ' + tone + '">' + svgIcon(icon, 21) + '</div>' +
      '<div><div class="sc-value">' + value + '</div><div class="sc-label">' + label + "</div></div></div>";
  }
  function panel(title, sub, bodyHtml, actionsHtml, flush) {
    return '<div class="panel"><div class="panel-head"><div><h3>' + title + "</h3>" +
      (sub ? '<div class="ph-sub">' + sub + "</div>" : "") + "</div>" +
      (actionsHtml || "") + "</div>" +
      '<div class="panel-body' + (flush ? " flush" : "") + '">' + bodyHtml + "</div></div>";
  }
  function emptyState(text) {
    return '<div class="empty-state">' + svgIcon("archive", 34) + "<p>" + text + "</p></div>";
  }

  /* Bar chart from [{label, value}] */
  function barChart(data, tealFrom) {
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var html = '<div class="bar-chart">';
    data.forEach(function (d, i) {
      var h = max ? Math.round((d.value / max) * 150) : 4;
      html += '<div class="bar-col' + (tealFrom !== undefined && i >= tealFrom ? " teal" : "") + '">' +
        '<div class="bar" style="height:' + h + 'px"><span class="bar-val">' +
        (d.value >= 1000000 ? (d.value / 1000000).toFixed(1) + "M" : Math.round(d.value / 1000) + "K") +
        '</span></div><span class="bar-label">' + d.label + "</span></div>";
    });
    return html + "</div>";
  }

  /* Donut chart from [{label, value, color}] */
  function donut(data, centerLabel, centerValue) {
    var total = data.reduce(function (s, d) { return s + d.value; }, 0) || 1;
    var angle = 0;
    var r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
    var segs = "";
    data.forEach(function (d) {
      var frac = d.value / total;
      segs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + d.color + '" stroke-width="18" ' +
        'stroke-dasharray="' + (frac * circ) + " " + circ + '" stroke-dashoffset="' + (-angle * circ) + '" transform="rotate(-90 ' + cx + " " + cy + ')"/>';
      angle += frac;
    });
    var legend = data.map(function (d) {
      return '<div class="dl-item"><span class="dl-dot" style="background:' + d.color + '"></span>' +
        d.label + " <strong>" + (d.value >= 1000000 ? (d.value / 1000000).toFixed(2) + "M" : Math.round(d.value / 1000) + "K") + "</strong></div>";
    }).join("");
    return '<div class="donut-row"><svg width="128" height="128" viewBox="0 0 128 128">' + segs +
      '<text x="64" y="60" text-anchor="middle" font-size="13" font-weight="700" fill="#10294a">' + centerValue + "</text>" +
      '<text x="64" y="76" text-anchor="middle" font-size="8" fill="#5b6b7c">' + centerLabel + "</text></svg>" +
      '<div class="donut-legend">' + legend + "</div></div>";
  }
  /* ---------- Dashboard ---------- */
  VIEWS.dashboard = function () {
    var committed = D.shareholders.reduce(function (s, sh) { return s + sh.shares * D.sharePrice; }, 0);
    var received = D.shareholders.reduce(function (s, sh) { return s + sh.paid; }, 0);
    var outstanding = committed - received;
    var pct = committed ? Math.round((received / committed) * 100) : 0;

    var income = D.transactions.filter(function (t) { return t.type === "Income"; }).reduce(function (s, t) { return s + t.amount; }, 0);
    var expense = D.transactions.filter(function (t) { return t.type === "Expense"; }).reduce(function (s, t) { return s + t.amount; }, 0);

    var roleNote = {
      gm: "Full operational and financial visibility across both divisions.",
      finance: "You see governance, finance and reporting modules. Fleet and project records are read-only summaries.",

      projects: "You manage projects, tasks and related customer activity.",
      admin: "You administer accounts, documents and audit history. Business financials are restricted.",
      shareholder: "Read-only shareholder view: ownership, contributions, governance documents and reports.",
      transport: "Technical operations view: projects, tasks, documents and reporting (fleet modules hidden)."
    }[session.role];

    var html = "";
    html += '<div class="role-banner">' + svgIcon("shield", 18) + "<span><strong>" + session.title + " view.</strong> " + roleNote + "</span></div>";

    html += '<div class="stat-row">';
    html += statCard("bank", "", fmtETB(received), "Capital received (" + pct + "% collected)");
    html += statCard("chart", "green", fmtETB(income - expense), "Feb operating result*");
    html += statCard("folder", "amber", D.projects.filter(function (p) { return p.status === "In progress"; }).length, "Active projects");
    html += "</div>";

    html += '<div class="duo-grid">';

    var charts = panel("Revenue plan (3-year outlook)",
      "Illustrative forecast â€” not a statutory projection",
      barChart(D.revenuePlan));
    var capitalPanel = panel("Capital collection",
      "Paid-in capital vs outstanding commitments",
      donut([
        { label: "Paid-in capital", value: received, color: "#12a594" },
        { label: "Outstanding", value: outstanding, color: "#e3eefb" }
      ], "COLLECTED", pct + "%"));
    html += "<div>" + charts + capitalPanel + "</div>";

    /* Right column */
    var right = "";
    var pendingHtml = "";
    if (session.role === "gm" || session.role === "finance") {
      D.contributions.filter(function (c) { return c.status === "Pending"; }).forEach(function (c) {
        var sh = D.shareholders.filter(function (s) { return s.id === c.sh; })[0];
        pendingHtml += '<div class="audit-item"><div class="ai-icon">' + svgIcon("bank", 16) + '</div><div><div class="ai-text"><strong>' + c.id + "</strong> Â· " + fmtETB(c.amount) + " â€” " + (sh ? sh.name : c.sh) + '</div><div class="ai-time">Contribution awaiting approval</div></div></div>';
      });
      D.transactions.filter(function (t) { return t.status === "Pending"; }).forEach(function (t) {
        pendingHtml += '<div class="audit-item"><div class="ai-icon">' + svgIcon("chart", 16) + '</div><div><div class="ai-text"><strong>' + t.id + "</strong> Â· " + fmtETB(t.amount) + " â€” " + t.category + '</div><div class="ai-time">' + t.type + " awaiting approval</div></div></div>";
      });
      if (!pendingHtml) pendingHtml = emptyState("Nothing pending approval. Well done.");
    } else {
      pendingHtml = emptyState("Approvals are handled by Finance and Management.");
    }
    right += panel("Pending approvals", "Entry, approval and authorization are separated", pendingHtml);

    var recentAudit = D.auditLog.slice(-4).reverse().map(function (a) {
      return '<div class="audit-item"><div class="ai-icon">' + svgIcon("shield", 16) + '</div><div><div class="ai-text"><strong>' + esc(a.actor) + "</strong> " + esc(a.action.toLowerCase()) + '</div><div class="ai-time">' + a.time + " Â· " + a.outcome + "</div></div></div>";
    }).join("");
    right += panel("Recent audit activity", "Immutable history of sensitive actions", recentAudit);

    html += "<div>" + right + "</div>";
    html += "</div>";
    html += '<p style="font-size:0.76rem; color:var(--text-muted); margin-top:8px">* Operating result = recorded income âˆ’ recorded expenses for February. It is <strong>not</strong> statutory net profit; depreciation, financing, tax and other required accounting items are excluded.</p>';

    content().innerHTML = html;
  };
  /* ---------- Shareholders ---------- */
  VIEWS.shareholders = function () {
    var totalShares = D.shareholders.reduce(function (s, sh) { return s + sh.shares; }, 0);
    var committed = D.shareholders.reduce(function (s, sh) { return s + sh.shares * D.sharePrice; }, 0);
    var received = D.shareholders.reduce(function (s, sh) { return s + sh.paid; }, 0);

    var html = pageHead("Shareholder Register",
      "14 founders Â· " + totalShares + " shares issued (planning scenario) Â· share price " + fmtETB(D.sharePrice),
      (session.role === "finance" || session.role === "gm" || session.role === "admin")
        ? '<button class="btn btn-outline" id="btnExportSH">Export CSV</button> ' +
          '<button class="btn btn-primary" id="btnAddSH">+ Add Shareholder</button>' : "");

    html += '<div class="stat-row">';
    html += statCard("users", "", D.shareholders.length, "Registered shareholders");
    html += statCard("bank", "teal", fmtETB(committed), "Agreed capital commitments");
    html += statCard("chart", "green", fmtETB(received), "Paid-in capital");
    html += statCard("file", "amber", fmtETB(committed - received), "Outstanding contributions");
    html += "</div>";

    var rows = "";
    D.shareholders.forEach(function (sh) {
      var own = ((sh.shares / totalShares) * 100).toFixed(2);
      var outstanding = sh.shares * D.sharePrice - sh.paid;
      var payBadge = outstanding === 0 ? '<span class="badge green">Fully paid</span>'
        : sh.paid === 0 ? '<span class="badge red">Unpaid</span>'
        : '<span class="badge amber">Partially paid</span>';
      rows += "<tr><td><strong>" + sh.id + "</strong></td><td>" + esc(sh.name) + "</td>" +
        '<td class="num">' + sh.shares + "</td>" +
        '<td class="num">' + own + "%</td>" +
        '<td class="num">' + fmtETB(sh.shares * D.sharePrice) + "</td>" +
        '<td class="num">' + fmtETB(sh.paid) + "</td>" +
        '<td class="num">' + fmtETB(outstanding) + "</td>" +
        "<td>" + payBadge + "</td><td>" + sh.joined + "</td>" +
        "<td>" + ((session.role === "finance" || session.role === "gm" || session.role === "admin")
          ? '<button class="btn btn-outline btn-xs" data-edit-sh="' + sh.id + '">Edit</button> ' +
            '<button class="btn btn-danger btn-xs" data-del-sh="' + sh.id + '">Delete</button>'
          : "â€”") + "</td></tr>";
    });

    html += panel("Register", "Ownership % = shareholder shares Ã· total issued shares Ã— 100",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>ID</th><th>Shareholder</th><th class='num'>Shares</th><th class='num'>Ownership</th>" +
      "<th class='num'>Commitment</th><th class='num'>Paid</th><th class='num'>Outstanding</th><th>Status</th><th>Admitted</th><th>Actions</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>",
      "", true);

    html += '<p style="font-size:0.76rem; color:var(--text-muted)">Business rule: issued shares, authorized shares, promised contributions and paid-in capital are tracked as distinct quantities. Ownership changes are recorded as events with approval â€” never silently overwritten. Contact details are stored privately and shown only to authorized roles.</p>';

    content().innerHTML = html;

    // delegate delete buttons
    document.querySelectorAll("[data-del-sh]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-del-sh");
        confirmModal("Delete shareholder", "Delete " + id + "? This cannot be undone.", function () {
          PHG_API.del("shareholders", id).then(function () {
            toast("Shareholder deleted.", "success");
            refreshLiveData();
          }).catch(function (e) {
            toast("Delete failed: " + apiError(e), "error");
          });
        });
      });
    });

    // delegate edit buttons
    document.querySelectorAll("[data-edit-sh]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-edit-sh");
        var rec = (data().shareholders || []).filter(function (x) { return x.id === id; })[0];
        if (!rec) { toast("Record not found.", "error"); return; }
        openFormModal("Edit Shareholder", [
          { name: "name", label: "Legal name", required: true },
          { name: "email", label: "Email", required: false },
          { name: "phone", label: "Phone", required: false },
          { name: "country", label: "Country", required: false },
          { name: "shares", label: "Shares", required: true },
          { name: "share_price", label: "Share price", required: false },
          { name: "paid", label: "Paid-in", required: false },
          { name: "status", label: "Status (Active/Inactive/Suspended)", required: false }
        ], function (vals, done) {
          var payload = {
            name: vals.name,
            email: vals.email || "",
            phone: vals.phone || "",
            country: vals.country || "",
            shares: parseInt(vals.shares, 10) || 0,
            share_price: vals.share_price || rec.share_price,
            paid: vals.paid || "0.00",
            status: vals.status || rec.status
          };
          PHG_API.update("shareholders", id, payload).then(function () {
            toast("Shareholder updated.", "success");
            refreshLiveData();
          }).catch(function (e) {
            toast("Update failed: " + apiError(e), "error");
          });
          done(null);
        }, {
          name: rec.name, email: rec.email, phone: rec.phone, country: rec.country,
          shares: rec.shares, share_price: rec.share_price, paid: rec.paid, status: rec.status
        });
      });
    });

    var addSh = el("btnAddSH");
    if (addSh) addSh.addEventListener("click", function () {
      openFormModal("Add Shareholder", [
        { name: "name", label: "Legal name", required: true },
        { name: "email", label: "Email", required: false },
        { name: "phone", label: "Phone", required: false },
        { name: "country", label: "Country", required: false },
        { name: "shares", label: "Shares", required: true },
        { name: "share_price", label: "Share price", required: false },
        { name: "paid", label: "Paid-in", required: false },
        { name: "status", label: "Status (Active/Inactive/Suspended)", required: false }
      ], function (vals, done) {
        var payload = {
          name: vals.name,
          email: vals.email || "",
          phone: vals.phone || "",
          country: vals.country || "",
          shares: parseInt(vals.shares, 10) || 0,
          share_price: vals.share_price || "250000.00",
          paid: vals.paid || "0.00",
          status: vals.status || "Active"
        };
        PHG_API.create("shareholders", payload).then(function () {
          toast("Shareholder added.", "success");
          refreshLiveData();
        }).catch(function (e) {
          toast("Create failed: " + apiError(e), "error");
        });
        done(null);
      });
    });

    var btn = el("btnExportSH");
    if (btn) btn.addEventListener("click", function () {
      var csv = "ID,Name,Shares,Commitment,Paid,Outstanding\n";
      D.shareholders.forEach(function (sh) {
        csv += [sh.id, '"' + sh.name + '"', sh.shares, sh.shares * D.sharePrice, sh.paid, sh.shares * D.sharePrice - sh.paid].join(",") + "\n";
      });
      downloadCSV(csv, "shareholder-register.csv");
      toast("Shareholder register exported (CSV).", "success");
    });
  };
  /* ---------- Contributions ---------- */
  VIEWS.contributions = function () {
    var canApprove = session.role === "gm" || session.role === "finance";
    var html = pageHead("Capital Contributions",
      "Every contribution requires evidence and approval; corrections use adjustments, not deletions.",
      canApprove ? '<button class="btn btn-primary" id="btnAddCT">+ Record Contribution</button>' : "");

    var rows = "";
    D.contributions.slice().reverse().forEach(function (c) {
      var sh = D.shareholders.filter(function (s) { return s.id === c.sh; })[0];
      rows += "<tr><td><strong>" + c.id + "</strong></td><td>" + (sh ? esc(sh.name) : c.sh) + "</td>" +
        '<td class="num">' + fmtETB(c.amount) + "</td><td>" + c.date + "</td><td>" + c.method + "</td><td>" + c.ref + "</td>" +
        "<td>" + badgeFor(c.status) + "</td>" +
        "<td>" + (canApprove && c.status === "Pending"
          ? '<button class="btn btn-success btn-xs" data-approve="' + c.id + '">Approve</button> ' +
            '<button class="btn btn-danger btn-xs" data-reject="' + c.id + '">Reject</button>'
          : "<span style='font-size:0.78rem;color:var(--text-muted)'>" + c.by + "</span>") + "</td></tr>";
    });

    html += panel("Contribution transactions", D.contributions.length + " records Â· " +
      D.contributions.filter(function (c) { return c.status === "Pending"; }).length + " pending approval",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Txn</th><th>Shareholder</th><th class='num'>Amount</th><th>Date</th><th>Method</th><th>Reference</th><th>Status</th><th>Action</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;

    content().querySelectorAll("[data-approve]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-approve");
        confirmModal("Approve contribution", "Approve " + id + "? This updates paid-in capital and is recorded in the audit log.", function () {
          PHG_API.approveContribution(id).then(function () {
            toast(id + " approved. Paid-in capital updated.", "success");
            navigate("contributions");
          }).catch(function (e) {
            toast("Approve failed: " + apiError(e), "error");
          });
        });
      });
    });
    content().querySelectorAll("[data-reject]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-reject");
        confirmModal("Reject contribution", "Rejecting " + id + " requires a recorded reason. Enter a reason below.", function () {
          var note = prompt("Reason for rejection:", "");
          if (note === null) return;
          PHG_API.rejectContribution(id, note).then(function () {
            toast(id + " rejected. Reason recorded in audit log.", "error");
            navigate("contributions");
          }).catch(function (e) {
            toast("Reject failed: " + apiError(e), "error");
          });
        });
      });
    });
    var addBtn = el("btnAddCT");
    if (addBtn) addBtn.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Record Contribution";
      body.innerHTML = '<form id="addCtForm" style="display:grid;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Shareholder code (e.g. SH-001)</span><input name="shareholder_code" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Amount (ETB)</span><input name="amount" type="number" min="1" step="any" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Date</span><input name="paid_on" type="date" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Reference</span><input name="reference" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Method</span><input name="method" value="Bank transfer" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Record Contribution";
      var submitCt = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Recording...";
        var fd = new FormData(el("addCtForm"));
        var shCode = fd.get("shareholder_code");
        var sh = D.shareholders.filter(function (s) { return s.id === shCode; })[0];
        if (!sh) { toast("Unknown shareholder code: " + shCode, "error"); btn.disabled = false; btn.textContent = "Record Contribution"; return; }
        var payload = {
          shareholder_code: shCode,
          amount: parseFloat(fd.get("amount")) || 0,
          currency: "ETB",
          kind: "Share capital",
          date: fd.get("paid_on") || new Date().toISOString().slice(0, 10),
          method: fd.get("method") || "Bank transfer",
          ref: fd.get("reference") || ""
        };
        try {
          var created = await PHG_API.create("contributions", payload);
          closeModal();
          toast("Contribution " + (created.id || created.sh) + " recorded (pending approval).", "success");
          navigate("contributions");
        } catch (e) {
          btn.disabled = false;
          btn.textContent = "Record Contribution";
          toast("Create failed: " + apiError(e), "error");
        }
      };
      el("modalOk").onclick = submitCt;
      el("addCtForm").onsubmit = function (e) { e.preventDefault(); submitCt(); };
      openModal(mb);
    });
  };
  /* ---------- Vehicles ---------- */
  VIEWS.vehicles = function () {
    var fleetValue = D.vehicles.reduce(function (s, v) { return s + v.purchase; }, 0);
    var html = pageHead("Vehicles", "Fleet asset register with insurance, odometer and status tracking.",
      session.role === "gm" || session.role === "admin"
        ? '<button class="btn btn-primary" id="btnAddVeh">+ Add Vehicle</button>' : "");

    html += '<div class="stat-row">';
    html += statCard("truck", "", D.vehicles.length, "Vehicles registered");
    html += statCard("chart", "teal", fmtETB(fleetValue), "Acquisition value");
    html += statCard("check", "green", D.vehicles.filter(function (v) { return v.status === "Available"; }).length, "Available now");
    html += statCard("wrench", "amber", D.vehicles.filter(function (v) { return v.status === "Maintenance"; }).length, "In maintenance");
    html += "</div>";

    var rows = "";
    var canEditVeh = session.role === "gm" || session.role === "admin";
    D.vehicles.forEach(function (v) {
      var insSoon = new Date(v.insurance) - new Date("2026-02-18") < 1000 * 60 * 60 * 24 * 120;
      rows += "<tr><td><strong>" + v.id + "</strong></td><td>" + v.plate + "</td><td>" + v.make + " " + v.model + "</td>" +
        "<td>" + v.year + "</td><td>" + v.category + "</td><td>" + v.driver + "</td>" +
        '<td class="num">' + v.odometer.toLocaleString() + " km</td>" +
        "<td>" + v.insurance + (insSoon ? ' <span class="badge amber">Expiring</span>' : "") + "</td>" +
        "<td>" + badgeFor(v.status) + "</td>" +
        "<td>" + (canEditVeh ? '<button class="btn btn-xs btn-outline" data-veh-edit="' + v.code + '">Edit</button> <button class="btn btn-xs btn-danger" data-veh-del="' + v.code + '">Deactivate</button>' : "") + "</td></tr>";
    });

    html += panel("Fleet register", "Overlapping bookings for the same vehicle are blocked where dates conflict.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>ID</th><th>Plate</th><th>Make / Model</th><th>Year</th><th>Category</th><th>Driver</th><th class='num'>Odometer</th><th>Insurance until</th><th>Status</th><th>Actions</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
    (D.vehicles || []).forEach(function (v) {
      var eb = document.querySelector('[data-veh-edit="' + v.code + '"]');
      var db = document.querySelector('[data-veh-del="' + v.code + '"]');
      if (eb) eb.addEventListener("click", function () { openVehEditModal(v); });
      if (db) db.addEventListener("click", function () { confirmModal("Deactivate Vehicle " + v.code, "Deactivate \"" + v.plate + "\"? This marks the vehicle as inactive and it will no longer appear as available for trips.", function () { PHG_API.update("vehicles", v.code, { status: "Inactive" }).then(function(){toast(v.code + " deactivated.","success");navigate("vehicles");}).catch(function(e){toast("Deactivate failed: "+apiError(e),"error");}); }); });
    });
    var b = el("btnAddVeh");
    if (b) b.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Add Vehicle";
      body.innerHTML = '<form id="addVehForm" style="display:grid;gap:10px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Plate</span><input name="plate" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Make</span><input name="make" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Model</span><input name="model" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Year</span><input name="year" type="number" min="1900" max="2030" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Category</span><input name="category" value="Pickup" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Driver</span><input name="driver" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Odometer (km)</span><input name="odometer" type="number" min="0" value="0" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Insurance until</span><input name="insurance_until" type="date" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Purchase cost (ETB)</span><input name="purchase_cost" type="number" min="0" step="any" value="0" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Create Vehicle";
      var submitVeh = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Creating...";
        var fd = new FormData(el("addVehForm"));
        var payload = {
          plate: fd.get("plate"),
          make: fd.get("make"),
          model: fd.get("model"),
          year: parseInt(fd.get("year"), 10),
          category: fd.get("category") || "Pickup",
          driver: fd.get("driver") || "â€”",
          odometer: parseInt(fd.get("odometer"), 10) || 0,
          insurance: fd.get("insurance_until") || null,
          purchase: parseFloat(fd.get("purchase_cost")) || 0,
          status: "Available"
        };
        try {
          var created = await PHG_API.postVehicle(payload);
          closeModal();
          toast("Vehicle " + (created.id || created.plate) + " added.");
          refreshLiveData();
        } catch (e) {
          btn.disabled = false;
          btn.textContent = "Create Vehicle";
          toast("Create failed: " + apiError(e));
        }
      };
      el("modalOk").onclick = submitVeh;
      el("addVehForm").onsubmit = function (e) { e.preventDefault(); submitVeh(); };
      openModal(mb);
    });
  };

  function openVehEditModal(v) {
    var mb = el("modalBackdrop"), body = el("modalBody");
    var code = v.code || v.id;
    el("modalTitle").textContent = "Edit Vehicle " + code;
    body.innerHTML = '<form id="editVehForm" style="display:grid;gap:10px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Plate</span><input name="plate" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(v.plate || "") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Make</span><input name="make" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(v.make || "") + '"></label>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Model</span><input name="model" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(v.model || "") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Year</span><input name="year" type="number" min="1900" max="2030" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + (v.year || "") + '"></label>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Category</span><input name="category" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(v.category || "Pickup") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Driver</span><input name="driver" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(v.driver || "") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Odometer (km)</span><input name="odometer" type="number" min="0" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + (v.odometer || 0) + '"></label>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Insurance until</span><input name="insurance_until" type="date" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + (v.insurance || "") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Purchase cost (ETB)</span><input name="purchase_cost" type="number" min="0" step="any" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + (v.purchase || 0) + '"></label>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Status</span><select name="status" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"><option value="Available"' + (v.status === "Available" ? " selected" : "") + '>Available</option><option value="Maintenance"' + (v.status === "Maintenance" ? " selected" : "") + '>Maintenance</option><option value="Inactive"' + (v.status === "Inactive" ? " selected" : "") + '>Inactive</option></select></label>' +
      '</div>' +
      '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
      '</form>';
    el("modalCancel").style.display = "inline-block";
    el("modalOk").style.display = "inline-block";
    el("modalOk").textContent = "Save";
    var saveVeh = async function () {
      var btn = el("modalOk");
      btn.disabled = true;
      btn.textContent = "Saving...";
      var fd = new FormData(el("editVehForm"));
      var payload = {
        plate: fd.get("plate"),
        make: fd.get("make"),
        model: fd.get("model"),
        year: parseInt(fd.get("year"), 10),
        category: fd.get("category") || "Pickup",
        driver: fd.get("driver") || "â€”",
        odometer: parseInt(fd.get("odometer"), 10) || 0,
        insurance: fd.get("insurance_until") || null,
        purchase: parseFloat(fd.get("purchase_cost")) || 0,
        status: fd.get("status") || "Available"
      };
      try { await PHG_API.update("vehicles", code, payload); closeModal(); toast(code + " updated.", "success"); navigate("vehicles"); } catch (e) { btn.disabled = false; btn.textContent = "Save"; toast("Update failed: " + apiError(e), "error"); }
    };
    el("modalOk").onclick = saveVeh;
    el("editVehForm").onsubmit = function (e) { e.preventDefault(); saveVeh(); };
    openModal(mb);
  }

  /* ---------- Trips ---------- */
  VIEWS.trips = function () {
    var revenue = D.trips.reduce(function (s, t) { return s + t.price; }, 0);
    var fuel = D.trips.reduce(function (s, t) { return s + t.fuel; }, 0);
    var html = pageHead("Trips & Bookings", "Trip records link customer, vehicle, driver, route and cost.",
      session.role === "gm" || session.role === "admin"
        ? '<button class="btn btn-primary" id="btnAddTrip">+ Book Trip</button>' : "");

    html += '<div class="stat-row">';
    html += statCard("route", "", D.trips.length, "Trips recorded");
    html += statCard("chart", "green", fmtETB(revenue), "Contracted revenue");
    html += statCard("truck", "amber", fmtETB(fuel), "Fuel captured");
    html += statCard("check", "teal", D.trips.filter(function (t) { return t.status === "Completed"; }).length, "Completed");
    html += "</div>";

    var rows = "";
    D.trips.forEach(function (t) {
      rows += "<tr><td><strong>" + t.id + "</strong></td><td>" + esc(t.customer) + "</td><td>" + t.vehicle + "</td><td>" + t.driver + "</td>" +
        "<td>" + t.route + "</td><td>" + t.start + " â†’ " + t.end + "</td>" +
        '<td class="num">' + fmtETB(t.price) + '</td><td class="num">' + fmtETB(t.fuel) + "</td><td>" + badgeFor(t.status) + "</td></tr>";
    });

    html += panel("Trip records", "A trip cannot be marked complete until required information is supplied.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Trip</th><th>Customer</th><th>Vehicle</th><th>Driver</th><th>Route</th><th>Dates</th><th class='num'>Price</th><th class='num'>Fuel</th><th>Status</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
    var b = el("btnAddTrip");
    if (b) b.addEventListener("click", function () {
      // Â§7.2: real POST /trips/ â€” no demo fallback.
      openFormModal("Book Trip", [
        { name: "customer", label: "Customer", required: true },
        { name: "route", label: "Route", required: true },
        { name: "start", label: "Start date (YYYY-MM-DD)", required: true },
        { name: "end", label: "End date (YYYY-MM-DD)", required: true }
      ], function (vals, done) {
        PHG_API.create("trips", {
          customer_name: vals.customer, route: vals.route,
          start_date: vals.start, end_date: vals.end, status: "Booked"
        }).then(function () { done(); toast("Trip booked."); refreshLiveData(); })
          .catch(function (e) { done("Create failed: " + apiError(e)); });
      });
    });
  };

  /* ---------- Maintenance ---------- */
  VIEWS.maintenance = function () {
    var total = D.maintenance.reduce(function (s, m) { return s + m.cost; }, 0);
    var html = pageHead("Maintenance Records", "Full service history per vehicle with costs and next-service dates.");

    html += '<div class="stat-row">';
    html += statCard("wrench", "", D.maintenance.length, "Service records");
    html += statCard("chart", "amber", fmtETB(total), "Total maintenance cost");
    html += statCard("truck", "teal", D.maintenance.filter(function (m) { return m.status === "In progress"; }).length, "In progress");
    html += statCard("check", "green", D.maintenance.filter(function (m) { return m.status === "Completed"; }).length, "Completed");
    html += "</div>";

    var rows = "";
    D.maintenance.forEach(function (m) {
      rows += "<tr><td><strong>" + m.id + "</strong></td><td>" + m.vehicle + "</td><td>" + m.date + "</td><td>" + m.provider + "</td><td>" + m.work + "</td>" +
        '<td class="num">' + fmtETB(m.cost) + "</td><td>" + m.next + "</td><td>" + badgeFor(m.status) + "</td></tr>";
    });

    html += panel("Service history", "Invoices and receipts are attached to each record.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Record</th><th>Vehicle</th><th>Service date</th><th>Provider</th><th>Work</th><th class='num'>Cost</th><th>Next due</th><th>Status</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
  };
  /* ---------- Drivers ---------- */
  VIEWS.drivers = function () {
    var html = pageHead("Drivers", "Driver roster with licence class, status and trip history. Only licensed drivers are assigned to trips.",
      session.role === "gm" || session.role === "admin"
        ? '<button class="btn btn-primary" id="btnAddDriver">+ Add Driver</button>' : "");

    html += '<div class="stat-row">';
    html += statCard("idcard", "", D.drivers.length, "Registered drivers");
    html += statCard("check", "green", D.drivers.filter(function (d) { return d.status === "Active"; }).length, "Active");
    html += statCard("route", "teal", D.trips.filter(function (t) { return t.status === "Completed"; }).length, "Trips completed");
    html += statCard("truck", "amber", D.vehicles.filter(function (v) { return v.status !== "Maintenance"; }).length + "/" + D.vehicles.length, "Vehicles serviceable");
    html += "</div>";

    var rows = "";
    D.drivers.forEach(function (d) {
      rows += "<tr><td><strong>" + d.id + "</strong></td><td>" + esc(d.name) + "</td>" +
        "<td><span class='badge'>" + d.licence + "</span></td><td>" + d.phone + "</td>" +
        '<td class="num">' + d.trips + "</td><td>" + badgeFor(d.status) + "</td></tr>";
    });

    html += panel("Driver roster", "Licence class and medical status are checked before every trip assignment.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>ID</th><th>Name</th><th>Licence class</th><th>Phone</th><th class='num'>Trips completed</th><th>Status</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
    var bd = el("btnAddDriver");
    if (bd) bd.addEventListener("click", function () {
      // Â§7.2: real POST /drivers/ â€” no demo fallback.
      openFormModal("Add Driver", [
        { name: "name", label: "Full name", required: true },
        { name: "licence", label: "Licence class (e.g. C)", required: true },
        { name: "phone", label: "Phone", required: false }
      ], function (vals, done) {
        PHG_API.create("drivers", {
          name: vals.name, licence_class: vals.licence,
          phone: vals.phone, status: "Active"
        }).then(function () { done(); toast("Driver added.", "success"); refreshLiveData(); })
          .catch(function (e) { done("Create failed: " + apiError(e)); });
      });
    });
  };

  /* ---------- Customers & Leads ---------- */
  VIEWS.leads = function () {
    var pipelineValue = D.leads.filter(function (l) { return l.stage !== "Won" && l.stage !== "Lost"; })
      .reduce(function (s, l) { return s + l.value; }, 0);
    var html = pageHead("Customers & Leads", "Lightweight CRM: website inquiries become leads, then quotations, then projects or trips.");

    html += '<div class="stat-row">';
    html += statCard("briefcase", "", D.customers.length, "Active customers");
    html += statCard("route", "teal", D.leads.length, "Open leads");
    html += statCard("chart", "amber", fmtETB(pipelineValue), "Pipeline value");
    html += statCard("check", "green", D.leads.filter(function (l) { return l.stage === "Won"; }).length, "Won this quarter");
    html += "</div>";

    var leadRows = "";
    D.leads.forEach(function (l) {
      leadRows += "<tr><td><strong>" + l.id + "</strong></td><td>" + l.source + "</td><td>" + l.service + "</td>" +
        '<td class="num">' + fmtETB(l.value) + "</td><td>" + l.assignee + "</td><td>" + badgeFor(l.stage) + "</td><td>" + l.follow + "</td></tr>";
    });
    html += panel("Lead pipeline", "Stages: New â†’ Contacted â†’ Qualified â†’ Quotation sent â†’ Negotiation â†’ Won/Lost",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Lead</th><th>Source</th><th>Service</th><th class='num'>Value</th><th>Assignee</th><th>Stage</th><th>Follow-up</th>" +
      "</tr></thead><tbody>" + leadRows + "</tbody></table></div>", "", true);

    var custRows = "";
    D.customers.forEach(function (c) {
      custRows += "<tr><td><strong>" + c.id + "</strong></td><td>" + esc(c.name) + "</td><td>" + c.contact + "</td><td>" + c.phone + "</td><td>" + c.category + "</td><td>" + badgeFor(c.status) + "</td></tr>";
    });
    html += panel("Customers", "Customer contact details are restricted to authorized roles.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>ID</th><th>Organization</th><th>Contact person</th><th>Phone</th><th>Category</th><th>Status</th>" +
      "</tr></thead><tbody>" + custRows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
  };

  /* ---------- Projects ---------- */
  VIEWS.projects = function () {
    var totalValue = D.projects.reduce(function (s, p) { return s + p.value; }, 0);
    var totalSpent = D.projects.reduce(function (s, p) { return s + p.spent; }, 0);
    var html = pageHead("Projects", "Statuses: Lead â†’ Quotation â†’ Approved â†’ In progress â†’ Under review â†’ Completed â†’ Closed");

    html += '<div class="stat-row">';
    html += statCard("folder", "", D.projects.length, "Projects");
    html += statCard("chart", "teal", fmtETB(totalValue), "Total contract value");
    html += statCard("file", "amber", fmtETB(totalSpent), "Actual expenses");
    html += statCard("check", "green", D.projects.filter(function (p) { return p.status === "Completed"; }).length, "Completed");
    html += "</div>";

    var rows = "";
    D.projects.forEach(function (p) {
      var margin = p.value ? Math.round(((p.value - p.spent) / p.value) * 100) : 0;
      rows += "<tr><td><strong>" + p.id + "</strong></td><td>" + esc(p.name) + "</td><td>" + esc(p.customer) + "</td><td>" + p.division + "</td>" +
        "<td>" + p.manager + "</td>" +
        '<td class="num">' + fmtETB(p.value) + '</td><td class="num">' + fmtETB(p.spent) + "</td>" +
        '<td><div class="progress"><span class="' + (p.progress === 100 ? "green" : p.progress < 40 ? "amber" : "") + '" style="width:' + p.progress + '%"></span></div><span style="font-size:0.72rem;color:var(--text-muted)">' + p.progress + "%</span></td>" +
        "<td>" + badgeFor(p.status) + "</td><td>" + p.due + "</td></tr>";
    });

    html += panel("Project register", "Budget vs actual tracked per project; status changes are history-tracked.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Project</th><th>Name</th><th>Customer</th><th>Division</th><th>Manager</th><th class='num'>Value</th><th class='num'>Spent</th><th>Progress</th><th>Status</th><th>Due</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
  };

  /* ---------- Tasks ---------- */
  VIEWS.tasks = function () {
    var html = pageHead("Tasks", "Assigned work across all projects with priorities and due dates.");
    var rows = "";
    D.tasks.forEach(function (t) {
      var overdue = t.status !== "Done" && new Date(t.due) < new Date("2026-02-18");
      rows += "<tr><td><strong>" + t.id + "</strong></td><td>" + esc(t.title) + "</td><td>" + t.project + "</td><td>" + t.assignee + "</td>" +
        "<td>" + (t.priority === "High" ? '<span class="badge red">High</span>' : '<span class="badge amber">Medium</span>') + "</td>" +
        "<td>" + t.due + (overdue ? ' <span class="badge red">Overdue</span>' : "") + "</td><td>" + badgeFor(t.status) + "</td></tr>";
    });
    html += panel("Task board", "Overdue and approaching deadlines are surfaced in notifications.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Task</th><th>Title</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);
    content().innerHTML = html;
  };
  /* ---------- Income & Expenses ---------- */
  VIEWS.finance = function () {
    var canApprove = session.role === "gm" || session.role === "finance";
    var income = D.transactions.filter(function (t) { return t.type === "Income"; }).reduce(function (s, t) { return s + t.amount; }, 0);
    var expense = D.transactions.filter(function (t) { return t.type === "Expense"; }).reduce(function (s, t) { return s + t.amount; }, 0);

    var html = pageHead("Income & Expenses", "Operational finance tracking by division and category.",
      canApprove ? '<button class="btn btn-primary" id="btnAddTx">+ Record Transaction</button>' : "");

    html += '<div class="stat-row">';
    html += statCard("chart", "green", fmtETB(income), "Income (recorded)");
    html += statCard("chart", "amber", fmtETB(expense), "Expenses (recorded)");
    html += statCard("bank", "", fmtETB(income - expense), "Operating result*");
    html += statCard("file", "teal", D.transactions.filter(function (t) { return t.status === "Pending"; }).length, "Pending approval");
    html += "</div>";

    var byDiv = {};
    D.transactions.filter(function (t) { return t.type === "Income" && t.status === "Approved"; }).forEach(function (t) {
      byDiv[t.division] = (byDiv[t.division] || 0) + t.amount;
    });
    var divData = Object.keys(byDiv).map(function (k) { return { label: k, value: byDiv[k] }; });
    html += panel("Approved income by division", "Division-level reporting supports performance reviews", barChart(divData));

    var rows = "";
    D.transactions.slice().reverse().forEach(function (t) {
      rows += "<tr><td><strong>" + t.id + "</strong></td><td>" + t.date + "</td>" +
        "<td>" + (t.type === "Income" ? '<span class="badge green">Income</span>' : '<span class="badge amber">Expense</span>') + "</td>" +
        "<td>" + t.category + "</td><td>" + t.division + "</td><td>" + t.ref + "</td>" +
        '<td class="num">' + fmtETB(t.amount) + "</td><td>" + badgeFor(t.status) + "</td>" +
        "<td>" + (canApprove && t.status === "Pending"
          ? '<button class="btn btn-success btn-xs" data-approve-tx="' + t.id + '">Approve</button>'
          : "<span style='font-size:0.74rem;color:var(--text-muted)'>â€”</span>") + "</td></tr>";
    });

    html += panel("Transaction register", "Supporting evidence required for material expenses; approved records cannot be silently edited.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Txn</th><th>Date</th><th>Type</th><th>Category</th><th>Division</th><th>Reference</th><th class='num'>Amount</th><th>Status</th><th>Action</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    html += '<p style="font-size:0.76rem; color:var(--text-muted); margin-top:8px">* Revenue minus expenses is <strong>not</strong> statutory net profit. Depreciation, financing, tax and other required accounting items must be properly accounted for before drawing that conclusion.</p>';

    content().innerHTML = html;

    content().querySelectorAll("[data-approve-tx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-approve-tx");
        confirmModal("Approve transaction", "Approve " + id + "? Approved records lock and enter the audit trail.", function () {
          PHG_API.update("transactions", id, { status: "Approved" }).then(function () {
            toast(id + " approved.", "success");
            navigate("finance");
          }).catch(function (e) {
            toast("Approve failed: " + apiError(e), "error");
          });
        });
      });
    });
    var b = el("btnAddTx");
    if (b) b.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Record Transaction";
      body.innerHTML = '<form id="addTxForm" style="display:grid;gap:10px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Date</span><input name="txn_date" type="date" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Type</span><select name="kind" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"><option value="Income">Income</option><option value="Expense">Expense</option></select></label>' +
        '</div>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Category</span><input name="category" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Division</span><input name="division" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Description</span><input name="description" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Amount (ETB)</span><input name="amount" type="number" min="0.01" step="any" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Reference</span><input name="reference" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Record Transaction";
      var submitTx = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Recording...";
        var fd = new FormData(el("addTxForm"));
        var payload = {
          type: fd.get("kind"),
          category: fd.get("category"),
          division: fd.get("division"),
          description: fd.get("description"),
          amount: parseFloat(fd.get("amount")) || 0,
          date: fd.get("txn_date") || new Date().toISOString().slice(0, 10),
          ref: fd.get("reference") || ""
        };
        try {
          await PHG_API.create("transactions", payload);
          closeModal();
          toast("Transaction recorded (pending approval).", "success");
          navigate("finance");
        } catch (e) {
          btn.disabled = false;
          btn.textContent = "Record Transaction";
          toast("Create failed: " + apiError(e), "error");
        }
      };
      el("modalOk").onclick = submitTx;
      el("addTxForm").onsubmit = function (e) { e.preventDefault(); submitTx(); };
      openModal(mb);
    });
  };
  /* ---------- Invoices ---------- */
  VIEWS.invoices = function () {
    var totalBilled = D.invoices.reduce(function (s, i) { return s + i.total; }, 0);
    var totalPaid = D.invoices.reduce(function (s, i) { return s + i.paid; }, 0);
    var html = pageHead("Invoices", "Billing with line items, payment history and outstanding balances.");

    html += '<div class="stat-row">';
    html += statCard("file", "", D.invoices.length, "Invoices");
    html += statCard("chart", "teal", fmtETB(totalBilled), "Total billed");
    html += statCard("check", "green", fmtETB(totalPaid), "Collected");
    html += statCard("bell", "amber", fmtETB(totalBilled - totalPaid), "Receivables");
    html += "</div>";

    var rows = "";
    D.invoices.forEach(function (i) {
      rows += "<tr><td><strong>" + i.id + "</strong></td><td>" + esc(i.customer) + "</td><td>" + i.issue + "</td><td>" + i.due + "</td>" +
        '<td class="num">' + fmtETB(i.total) + '</td><td class="num">' + fmtETB(i.paid) + '</td><td class="num">' + fmtETB(i.total - i.paid) + "</td>" +
        "<td>" + badgeFor(i.status) + "</td></tr>";
    });
    html += panel("Invoice register", "Outstanding and overdue balances are reported and chased by Finance.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Invoice</th><th>Customer</th><th>Issued</th><th>Due</th><th class='num'>Total</th><th class='num'>Paid</th><th class='num'>Balance</th><th>Status</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
  };

  /* ---------- Documents ---------- */
  VIEWS.documents = function () {
    var canEditDoc = session.role === "admin" || session.role === "gm" || session.role === "projects";
    var html = pageHead("Documents", "Private, categorized storage with authorized downloads â€” never public URLs.",
      canEditDoc ? '<button class="btn btn-primary" id="btnAddDoc">+ Add Document</button>' : "");
    var rows = "";
    D.documents.forEach(function (d) {
      rows += "<tr><td><strong>" + d.id + "</strong></td><td>" + esc(d.name) + "</td><td>" + d.category + "</td><td>" + d.linked + "</td>" +
        "<td>" + d.uploaded + "</td><td>" + d.by + "</td><td><span class='badge gray'>" + d.access + "</span></td>" +
        '<td>' + (canEditDoc ? '<button class="btn btn-xs btn-outline" data-doc-edit="' + d.id + '">Edit</button> <button class="btn btn-xs btn-danger" data-doc-del="' + d.id + '">Delete</button>' : '<button class="btn btn-outline btn-xs" data-doc="' + d.id + '">Download</button>') + '</td></tr>';
    });
    html += panel("Document vault", "File type and size are validated; malware scanning is applied where feasible.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Doc</th><th>Name</th><th>Category</th><th>Linked to</th><th>Uploaded</th><th>By</th><th>Access</th><th>Action</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    content().innerHTML = html;
    (D.documents || []).forEach(function (d) {
      if (canEditDoc) {
        var eb = document.querySelector('[data-doc-edit="' + d.id + '"]');
        var db = document.querySelector('[data-doc-del="' + d.id + '"]');
        if (eb) eb.addEventListener("click", function () { openDocEditModal(d); });
        if (db) db.addEventListener("click", function () { confirmModal("Delete Document " + d.id, "Delete \"" + d.name + "\"? This cannot be undone.", function () { PHG_API.del("documents", d.id).then(function(){toast(d.id + " deleted.","success");navigate("documents");}).catch(function(e){toast("Delete failed: "+apiError(e),"error");}); }); });
      } else {
        content().querySelectorAll('[data-doc="' + d.id + '"]').forEach(function (btn) {
          btn.addEventListener("click", function () {
            toast("Document metadata only â€” file download is unavailable until file storage is configured.", "error");
          });
        });
      }
    });

    var addBtn = el("btnAddDoc");
    if (addBtn) addBtn.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Add Document";
      body.innerHTML = '<form id="addDocForm" style="display:grid;gap:10px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Name</span><input name="name" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Category</span><input name="category" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Linked to</span><input name="linked_to" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"></label>' +
        '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Access level</span><select name="access_level" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"><option value="Private">Private</option><option value="Internal">Internal</option><option value="Public">Public</option></select></label>' +
        '</div>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Create";
      var submitDoc = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Creating...";
        var fd = new FormData(el("addDocForm"));
        var payload = {
          name: fd.get("name"),
          category: fd.get("category"),
          linked_to: fd.get("linked_to") || "",
          access_level: fd.get("access_level") || "Private"
        };
        try {
          await PHG_API.create("documents", payload);
          closeModal();
          toast("Document \"" + payload.name + "\" added.");
          refreshLiveData();
        } catch (e) {
          btn.disabled = false;
          btn.textContent = "Create";
          toast("Create failed: " + apiError(e), "error");
        }
      };
      el("modalOk").onclick = submitDoc;
      el("addDocForm").onsubmit = function (e) { e.preventDefault(); submitDoc(); };
      openModal(mb);
    });
  };
  function openDocEditModal(d) {
    var mb = el("modalBackdrop"), body = el("modalBody");
    var code = d.id || d.code;
    el("modalTitle").textContent = "Edit Document " + code;
    body.innerHTML = '<form id="editDocForm" style="display:grid;gap:10px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Name</span><input name="name" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(d.name || "") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Category</span><input name="category" required style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(d.category || "") + '"></label>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Linked to</span><input name="linked_to" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px" value="' + esc(d.linked || "") + '"></label>' +
      '<label style="display:flex;flex-direction:column;font-size:0.85rem"><span style="color:#64748b;margin-bottom:4px">Access level</span><select name="access_level" style="padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px"><option value="Private"' + (d.access === "Private" ? " selected" : "") + '>Private</option><option value="Internal"' + (d.access === "Internal" ? " selected" : "") + '>Internal</option><option value="Public"' + (d.access === "Public" ? " selected" : "") + '>Public</option></select></label>' +
      '</div>' +
      '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
      '</form>';
    el("modalCancel").style.display = "inline-block";
    el("modalOk").style.display = "inline-block";
    el("modalOk").textContent = "Save";
    var saveDoc = async function () {
      var btn = el("modalOk");
      btn.disabled = true;
      btn.textContent = "Saving...";
      var fd = new FormData(el("editDocForm"));
      var payload = {
        name: fd.get("name"),
        category: fd.get("category"),
        linked_to: fd.get("linked_to") || "",
        access_level: fd.get("access_level") || "Private"
      };
      try { await PHG_API.update("documents", code, payload); closeModal(); toast(code + " updated.", "success"); navigate("documents"); } catch (e) { btn.disabled = false; btn.textContent = "Save"; toast("Update failed: " + apiError(e), "error"); }
    };
    el("modalOk").onclick = saveDoc;
    el("editDocForm").onsubmit = function (e) { e.preventDefault(); saveDoc(); };
    openModal(mb);
  }

  /* ---------- Meetings ---------- */
  VIEWS.meetings = function () {
    var canManage = session.role === "gm" || session.role === "admin";
    var html = pageHead("Meetings & Resolutions", "Governance records: notices, attendance, minutes and follow-up actions.",
      canManage ? '<button class="btn btn-primary" id="btnAddMeeting">+ Record Meeting</button>' : "");
    var rows = "";
    D.meetings.forEach(function (m) {
      rows += "<tr><td><strong>" + m.id + "</strong></td><td>" + m.type + "</td><td>" + m.date + "</td><td>" + m.attendees + "</td>" +
        "<td>" + badgeFor(m.status) + "</td><td>" + esc(m.summary) + "</td></tr>";
    });
    html += panel("Meeting register", "Voting, quorum and approval thresholds follow the company's governing documents â€” not assumptions.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>Meeting</th><th>Type</th><th>Date</th><th>Attendance</th><th>Status</th><th>Summary</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);
    content().innerHTML = html;
    var bm = el("btnAddMeeting");
    if (bm) bm.addEventListener("click", function () {
      // Â§7.2: real POST /meetings/ â€” no demo fallback.
      openFormModal("Record Meeting", [
        { name: "type", label: "Type (e.g. Board)", required: true },
        { name: "date", label: "Date (YYYY-MM-DD)", required: true },
        { name: "attendees", label: "Attendees", required: false }
      ], function (vals, done) {
        PHG_API.create("meetings", {
          kind: vals.type, held_on: vals.date,
          attendees: vals.attendees, status: "Scheduled"
        }).then(function () { done(); toast("Meeting recorded.", "success"); refreshLiveData(); })
          .catch(function (e) { done("Create failed: " + apiError(e)); });
      });
    });
  };

  /* ---------- Reports ---------- */
  VIEWS.reports = function () {
    var html = pageHead("Reports", "Filterable reports with generation date, applied filters and accounting limitations shown.");

    var reportCards = [
      ["Shareholder ownership & contributions", "Register with ownership %, paid-in and outstanding per founder.", "shareholders"],
      ["Capital collection status", "Total agreed vs received vs outstanding with collection rate.", "shareholders"],
      ["Revenue & expenses by period", "Income and expense transactions by date and category.", "finance"],
      ["Division performance", "Approved income split across divisions.", "finance"],
      ["Vehicle maintenance costs", "Service history costs with next-due schedule.", "maintenance"],
      ["Project status & profitability", "Contract value vs actual expenses and progress.", "projects"],
      ["Approvals & audit events", "Immutable log of sensitive actions and outcomes.", "audit"]
    ];

    var cardsHtml = '<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px">';
    reportCards.forEach(function (r) {
      var allowed = can(r[2]);
      cardsHtml += '<div class="stat-card" style="display:block; ' + (allowed ? "" : "opacity:0.55") + '">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px">' +
        "<div><div style='font-weight:700; color:var(--navy-900); font-size:0.92rem'>" + r[0] + "</div>" +
        "<div style='font-size:0.8rem; color:var(--text-muted); margin-top:4px'>" + r[1] + "</div></div>" +
        (allowed
          ? '<button class="btn btn-outline btn-xs" data-report="' + r[2] + '">Open</button>'
          : '<span class="badge red">Restricted</span>') +
        "</div></div>";
    });
    cardsHtml += "</div>";
    html += panel("Available reports", "Exports are limited to authorized users; sensitive data requires appropriate role.", cardsHtml);
    html += '<p style="font-size:0.76rem; color:var(--text-muted)">Reports display generation date, applied filters and currency (ETB). Currency conversion is never performed silently â€” an explicit exchange rate, source and date are required.</p>';

    content().innerHTML = html;
    content().querySelectorAll("[data-report]").forEach(function (btn) {
      btn.addEventListener("click", function () { navigate(btn.getAttribute("data-report")); });
    });
  };
  /* ---------- Notifications ---------- */
  VIEWS.notifications = function () {
    var html = pageHead("Notifications", "In-app alerts for inquiries, tasks, deadlines, approvals and governance events.",
      '<button class="btn btn-outline" id="btnMarkRead">Mark all read</button>');

    var items = notifications.map(function (n) {
      return '<div class="notif-item ' + (n.unread ? "unread" : "read") + '">' +
        '<span class="ni-dot"></span><div><div class="ni-text">' + esc(n.text) + "</div>" +
        '<div class="ni-time">' + n.time + "</div></div></div>";
    }).join("");
    html += panel("All notifications", notifications.filter(function (n) { return n.unread; }).length + " unread", items, "", true);

    content().innerHTML = html;
    el("btnMarkRead").addEventListener("click", function () {
      var unread = notifications.filter(function (n) { return n.unread; });
      if (!unread.length) { toast("No unread notifications.", "success"); return; }
      Promise.all(unread.map(function (n) {
        return PHG_API.update("notifications", n.id, { is_read: true });
      })).then(function () {
        toast("All notifications marked as read.", "success");
        refreshLiveData();
      }).catch(function (e) {
        toast("Mark read failed: " + apiError(e), "error");
      });
    });
  };

  /* ---------- Audit log ---------- */
  VIEWS.audit = function () {
    var html = pageHead("Audit Log", "Immutable history of sensitive actions â€” who did what, when, and the outcome.");
    var items = D.auditLog.slice().reverse().map(function (a) {
      var tone = a.outcome === "Blocked" ? "style='background:#fee2e2; color:var(--red-500)'" : "";
      return '<div class="audit-item"><div class="ai-icon" ' + tone + ">" + svgIcon("shield", 16) + "</div>" +
        '<div style="flex:1"><div class="ai-text"><strong>' + esc(a.actor) + "</strong> â€” " + esc(a.action) + "</div>" +
        '<div class="ai-time">' + a.time + " Â· target " + a.target + " Â· " + a.outcome + "</div></div></div>";
    }).join("");
    html += panel("Audit events", "Log records cannot be edited or deleted through the application.", items, "", true);
    content().innerHTML = html;
  };

  /* ---------- Users ---------- */
  VIEWS.users = function () {
    var html = pageHead("User Management", "Accounts, roles and access states. Deactivation preserves historical records.",
      '<button class="btn btn-primary" id="btnInvite">+ Invite User</button>');

    var rows = "";
    D.users.forEach(function (u) {
      rows += "<tr><td><strong>" + u.id + "</strong></td><td>" + esc(u.name) + "</td><td>" + u.email + "</td>" +
        "<td><span class='badge'>" + u.role + "</span></td><td>" + badgeFor(u.status) + "</td><td>" + u.last + "</td></tr>";
    });
    html += panel("Accounts", "A user may hold more than one role where authorized; permissions remain distinct.",
      '<div class="table-scroll"><table class="pt"><thead><tr>' +
      "<th>User</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign-in</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>", "", true);

    var roleCards = [
      ["System administrator", "User accounts, application configuration, access control"],
      ["Shareholder", "View permitted ownership, capital, reports, meeting records and notices"],
      ["General manager", "Operations, approvals, business performance, staff coordination"],
      ["Finance officer", "Contributions, expenses, invoices, payments and financial reports"],

      ["Technical project manager", "Technical projects, tasks, assignments, deliverables and deadlines"],
      ["Sales / customer service", "Leads, customer records, quotations and service requests"],
      ["Auditor (read-only)", "Access approved reports and audit records without editing business data"]
    ];
    var rc = '<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px">';
    roleCards.forEach(function (r) {
      rc += '<div style="border:1px solid var(--border); border-radius:10px; padding:14px 16px">' +
        "<div style='font-weight:700; color:var(--navy-900); font-size:0.88rem'>" + r[0] + "</div>" +
        "<div style='font-size:0.78rem; color:var(--text-muted); margin-top:4px'>" + r[1] + "</div></div>";
    });
    rc += "</div>";
    html += panel("Role definitions", "Navigation hides unauthorized items; the backend independently enforces every permission.", rc);

    content().innerHTML = html;
    var inviteBtn = el("btnInvite");
    if (inviteBtn) inviteBtn.addEventListener("click", function () {
      // Â§8: real admin-controlled POST /users/ â€” never self-elevation.
      // The new account is created Inactive-equivalent ("Invited") so an
      // admin must activate it; the backend ignores any client role games.
      openFormModal("Invite User", [
        { name: "email", label: "Email", required: true },
        { name: "first_name", label: "First name", required: true },
        { name: "role", label: "role (admin/gm/finance/projects/sales/shareholder/auditor)", required: true }
      ], function (vals, done) {
        PHG_API.create("users", {
          email: vals.email, username: vals.email.split("@")[0],
          first_name: vals.first_name, role: vals.role.toLowerCase(),
          status: "Invited", password: "Temp" + Math.random().toString(36).slice(2, 10) + "xA1"
        }).then(function () { done(); toast("User invited (status: Invited).", "success"); refreshLiveData(); })
          .catch(function (e) { done("Invite failed: " + apiError(e)); });
      });
    });
  };

  /* ---------- Settings ---------- */
  VIEWS.settings = function () {
    var html = pageHead("Settings", "Account and portal preferences.");
    html += panel("Profile", "",
      '<div style="max-width:420px">' +
        '<div class="f-field"><label>Full name</label><input type="text" value="' + esc(session.name) + '" disabled></div>' +
        '<div class="f-field"><label>Email</label><input type="email" value="' + esc(session.email) + '" disabled></div>' +
        '<div class="f-field"><label>Role</label><input type="text" value="' + esc(session.title) + '" disabled></div>' +
        '<p class="form-note">Profile changes and password resets are processed through verified flows; reset tokens expire and cannot be reused.</p>' +
      "</div>");
    html += panel("Security posture", "Controls enforced in production",
      '<ul style="list-style:none; display:grid; gap:10px; font-size:0.88rem">' +
      "<li>âœ“ Secure HTTP-only session cookies with CSRF protection</li>" +
      "<li>âœ“ Backend authorization on every protected endpoint (role + object level)</li>" +
      "<li>âœ“ Rate-limited login, password-reset and sensitive endpoints</li>" +
      "<li>âœ“ Multi-factor authentication available for privileged users</li>" +
      "<li>âœ“ HTTPS enforced in production; secrets kept outside source control</li>" +
      "<li>âœ“ Automated database backups with periodic restore tests</li>" +
      "</ul>");
    content().innerHTML = html;
  };
  /* ---------- Utilities ---------- */
  function pushAudit(action, target, outcome) {
    var now = new Date();
    var stamp = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0");
    D.auditLog.push({
      id: "AU-" + (9000 + D.auditLog.length + 1),
      actor: session ? session.title : "System",
      action: action,
      target: target || "â€”",
      time: stamp,
      outcome: outcome || "Success"
    });
  }

  function downloadCSV(csv, filename) {
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* Confirm modal */
  function confirmModal(title, message, onConfirm) {
    var backdrop = el("modalBackdrop");
    el("modalTitle").textContent = title;
    el("modalBody").innerHTML = "<p>" + esc(message) + "</p>";
    el("modalCancel").style.display = "inline-block";
    el("modalOk").style.display = "inline-block";
    el("modalOk").textContent = "Confirm";
    el("modalOk").onclick = function () { closeModal(); onConfirm(); };
    openModal(backdrop);
  }

  /* Notifications bell */
  function updateBell() {
    var count = notifications.filter(function (n) { return n.unread; }).length;
    var badge = el("bellCount");
    badge.textContent = count;
    badge.style.display = count ? "" : "none";
  }

  function renderNotifMenu() {
    var menu = el("notifMenu");
    var list = notifications.slice(0, 8).map(function (n) {
      return '<div class="notif-item ' + (n.unread ? "unread" : "read") + '">' +
        '<span class="ni-dot"></span><div><div class="ni-text">' + esc(n.text) + "</div>" +
        '<div class="ni-time">' + n.time + "</div></div></div>";
    }).join("");
    menu.querySelector(".nm-list").innerHTML = list || '<div class="empty-state"><p>No notifications.</p></div>';
  }

  /* ---------- Global search (simple filter on current view) ---------- */
  function initSearch() {
    var input = el("globalSearch");
    var timer;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = input.value.trim().toLowerCase();
        var rows = content().querySelectorAll("table.pt tbody tr");
        rows.forEach(function (row) {
          row.style.display = !q || row.textContent.toLowerCase().indexOf(q) !== -1 ? "" : "none";
        });
      }, 250);
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    initSearch();
    updateBell();

    el("btnLogout").addEventListener("click", logout);
    var sidebarBackdrop = null;
    function closeSidebar() {
      el("portalSidebar").classList.remove("open");
      document.body.classList.remove("portal-nav-open");
      if (sidebarBackdrop) sidebarBackdrop.classList.remove("open");
    }
    function openSidebar() {
      el("portalSidebar").classList.add("open");
      document.body.classList.add("portal-nav-open");
      if (!sidebarBackdrop) {
        sidebarBackdrop = document.createElement("div");
        sidebarBackdrop.className = "portal-sidebar-backdrop";
        document.body.appendChild(sidebarBackdrop);
        sidebarBackdrop.addEventListener("click", closeSidebar);
      }
      sidebarBackdrop.classList.add("open");
    }
    el("sidebarToggle").addEventListener("click", function () {
      if (el("portalSidebar").classList.contains("open")) closeSidebar(); else openSidebar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSidebar();
    });
    el("portalSidebar").addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeSidebar();
    });

    el("btnRefresh").addEventListener("click", function () {
      navigate(currentView || "dashboard");
    });

    el("bellBtn").addEventListener("click", function (e) {
      e.stopPropagation();
      renderNotifMenu();
      el("notifMenu").classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      var menu = el("notifMenu");
      if (!menu.contains(e.target) && e.target !== el("bellBtn")) {
        menu.classList.remove("open");
      }
    });

    el("notifViewAll").addEventListener("click", function (e) {
      e.preventDefault();
      el("notifMenu").classList.remove("open");
      if (session) navigate("notifications");
    });

    /* Delegated modal close: X button (data-close), Cancel button (data-cancel), and backdrop click.
       Uses closest() so a click on the SVG icon inside the X button still resolves to the button. */
    el("modalBackdrop").addEventListener("click", function (e) {
      if (e.target === el("modalBackdrop")) { closeModal(); return; }
      var closer = e.target.closest && e.target.closest("[data-close], [data-cancel]");
      if (closer) closeModal();
    });
    /* Global: Escape closes any open modal */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var mb = el("modalBackdrop");
        if (mb && mb.classList.contains("open")) closeModal();
      }
    });
    /* Global: prevent page reload on form submit inside modal body */
    document.addEventListener("submit", function (e) {
      var form = e.target.closest("form");
      if (!form || !form.closest("#modalBody")) return;
      e.preventDefault();
    }, true);

    function startPoll() {
      if (PHG_API.getMode() !== "live") return;
      pollTimer = setInterval(function () {
        if (currentView === "dashboard") {
          navigate("dashboard");
        }
      }, 30000);
    }
    startPoll();
  });
  /* ---------- Maintenance CRUD ---------- */
  VIEWS.maintenance = function () {
    var canEdit = session.role === "admin" || session.role === "gm";
    var html = pageHead("Maintenance Records", "Full service history per vehicle.", canEdit ? '<button class="btn btn-primary" id="btnAddMaintenance">+ Add Record</button>' : "");
    var rows = "";
    (D.maintenance || []).forEach(function (m) {
      var id = m.id || m.code;
      rows += "<tr><td><strong>" + id + "</strong></td><td>" + (m.vehicle || "-") + "</td><td>" + (m.date || "-") + "</td><td>" + (m.provider || "-") + "</td><td>" + (m.work || "-") + "</td>" +
        '<td class="num">' + (m.cost || 0) + "</td><td>" + (m.next || "-") + "</td><td>" + (m.status || "-") + "</td>" +
        "<td>" + (canEdit ? '<button class="mv-' + id + '" data-id="' + id + '">View</button> <button class="me-' + id + '" data-id="' + id + '">Edit</button> <button class="md-' + id + '" data-id="' + id + '">Delete</button>' : "View-only") + "</td></tr>";
    });
    html += panel("Service history", (D.maintenance || []).length + " records", '<div class="table-scroll"><table class="pt"><thead><tr><th>Record</th><th>Vehicle</th><th>Date</th><th>Provider</th><th>Work</th><th class="num">Cost</th><th>Next</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rows + "</tbody></table></div>", "", true);
    content().innerHTML = html;
    (D.maintenance || []).forEach(function (m) {
      var id = m.id || m.code;
      var vb = el("mv-" + id), eb = el("me-" + id), db = el("md-" + id);
      if (vb) vb.addEventListener("click", function () { alert("Maintenance " + id + "\\nVehicle: " + (m.vehicle||"N/A") + "\\nDate: " + (m.date||"N/A") + "\\nWork: " + (m.work||"N/A") + "\\nStatus: " + (m.status||"N/A")); });
      if (eb) eb.addEventListener("click", function () { openMaintEditModal(m); });
      if (db) db.addEventListener("click", function () { confirmModal("Delete " + id, "Delete maintenance record?", function () { PHG_API.del("maintenance", id).then(function(){toast(id+" deleted.","success");navigate("maintenance");}).catch(function(e){toast("Delete failed: "+apiError(e),"error");}); }); });
    });
    var ab = el("btnAddMaintenance");
    if (ab) ab.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Add Maintenance Record";
      body.innerHTML = '<form id="addMaintForm" style="display:grid;gap:10px"><div class="form-group"><label>Vehicle Plate</label><input type="text" class="form-control" id="mVehicle" placeholder="VH-001"></div>' +
        '<div class="form-group"><label>Service Date</label><input type="date" class="form-control" id="mDate"></div>' +
        '<div class="form-group"><label>Provider</label><input type="text" class="form-control" id="mProvider"></div>' +
        '<div class="form-group"><label>Work</label><input type="text" class="form-control" id="mWork"></div>' +
        '<div class="form-group"><label>Cost</label><input type="number" class="form-control" id="mCost" step="0.01"></div>' +
        '<div class="form-group"><label>Next Due</label><input type="date" class="form-control" id="mNext"></div>' +
        '<div class="form-group"><label>Status</label><select class="form-control" id="mStatus"><option>Completed</option><option>In progress</option><option>Scheduled</option><option>Cancelled</option></select></div>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Create";
      var submitMaint = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Creating...";
        var p = { vehicle: el("mVehicle").value.trim(), date: el("mDate").value.trim()||null, provider: el("mProvider").value.trim(), work: el("mWork").value.trim(), cost: parseFloat(el("mCost").value)||0, next: el("mNext").value.trim()||null, status: el("mStatus").value };
        if (!p.vehicle) { toast("Vehicle required","error"); btn.disabled = false; btn.textContent = "Create"; return; }
        try { await PHG_API.create("maintenance", p); closeModal(); toast("Created.","success"); navigate("maintenance"); } catch(e){btn.disabled = false; btn.textContent = "Create"; toast("Failed: "+apiError(e),"error");}
      };
      el("modalOk").onclick = submitMaint;
      el("addMaintForm").onsubmit = function (e) { e.preventDefault(); submitMaint(); };
      openModal(mb);
    });
  };


  function openMaintEditModal(m) {
    var mb = el("modalBackdrop"), body = el("modalBody");
    var id = m.id || m.code;
    el("modalTitle").textContent = "Edit Maintenance " + id;
    body.innerHTML = '<form id="editMaintForm" style="display:grid;gap:10px"><div class="form-group"><label>Vehicle Plate</label><input type="text" class="form-control" id="mVehicle" value="' + esc(m.vehicle || "") + '"></div>' +
      '<div class="form-group"><label>Service Date</label><input type="date" class="form-control" id="mDate" value="' + (m.date || "") + '"></div>' +
      '<div class="form-group"><label>Provider</label><input type="text" class="form-control" id="mProvider" value="' + esc(m.provider || "") + '"></div>' +
      '<div class="form-group"><label>Work</label><input type="text" class="form-control" id="mWork" value="' + esc(m.work || "") + '"></div>' +
      '<div class="form-group"><label>Cost</label><input type="number" class="form-control" id="mCost" step="0.01" value="' + (m.cost || 0) + '"></div>' +
      '<div class="form-group"><label>Next Due</label><input type="date" class="form-control" id="mNext" value="' + (m.next || "") + '"></div>' +
      '<div class="form-group"><label>Status</label><select class="form-control" id="mStatus"><option' + (m.status === "Completed" ? " selected" : "") + '>Completed</option><option' + (m.status === "In progress" ? " selected" : "") + '>In progress</option><option' + (m.status === "Scheduled" ? " selected" : "") + '>Scheduled</option><option' + (m.status === "Cancelled" ? " selected" : "") + '>Cancelled</option></select></div>' +
      '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
      '</form>';
    el("modalCancel").style.display = "inline-block";
    el("modalOk").style.display = "inline-block";
    el("modalOk").textContent = "Save";
    var saveMaint = async function () {
      var btn = el("modalOk");
      btn.disabled = true;
      btn.textContent = "Saving...";
      var p = { vehicle: el("mVehicle").value.trim(), date: el("mDate").value.trim() || null, provider: el("mProvider").value.trim(), work: el("mWork").value.trim(), cost: parseFloat(el("mCost").value) || 0, next: el("mNext").value.trim() || null, status: el("mStatus").value };
      try { await PHG_API.update("maintenance", id, p); closeModal(); toast(id + " updated.", "success"); navigate("maintenance"); } catch (e) { btn.disabled = false; btn.textContent = "Save"; toast("Update failed: " + apiError(e), "error"); }
    };
    el("modalOk").onclick = saveMaint;
    el("editMaintForm").onsubmit = function (e) { e.preventDefault(); saveMaint(); };
    openModal(mb);
  }


  /* ---------- Projects CRUD ---------- */
  VIEWS.projects = function () {
    var canEdit = session.role === "admin" || session.role === "gm";
    var html = pageHead("Projects", "Project register.", canEdit ? '<button class="btn btn-primary" id="btnAddProject">+ Add Project</button>' : "");
    var rows = "";
    (D.projects || []).forEach(function (p) {
      var id = p.id || p.code;
      rows += "<tr><td><strong>" + id + "</strong></td><td>" + (p.name || "-") + "</td><td>" + (p.customer || "-") + "</td><td>" + (p.division || "-") + "</td><td>" + (p.manager || "-") + "</td>" +
        '<td class="num">' + (p.value || 0) + "</td><td>" + (p.status || "-") + "</td><td>" + (p.priority || "-") + "</td>" +
        "<td>" + (canEdit ? '<button class="pv-' + id + '">View</button> <button class="pe-' + id + '">Edit</button> <button class="pa-' + id + '">Archive</button>' : "View-only") + "</td></tr>";
    });
    html += panel("Project register", (D.projects || []).length + " projects", '<div class="table-scroll"><table class="pt"><thead><tr><th>Project</th><th>Name</th><th>Customer</th><th>Division</th><th>Manager</th><th class="num">Value</th><th>Status</th><th>Priority</th><th>Actions</th></tr></thead><tbody>' + rows + "</tbody></table></div>", "", true);
    content().innerHTML = html;
    (D.projects || []).forEach(function (p) {
      var id = p.id || p.code;
      var vb = el("pv-" + id), eb = el("pe-" + id), ab = el("pa-" + id);
      if (vb) vb.addEventListener("click", function () { alert("Project " + id + "\\nName: " + (p.name||"N/A") + "\\nCustomer: " + (p.customer||"N/A") + "\\nStatus: " + (p.status||"N/A")); });
      if (eb) eb.addEventListener("click", function () { openProjectEditModal(p); });
      if (ab) ab.addEventListener("click", function () { confirmModal("Archive " + id, "Archive this project?", function () { PHG_API.update("projects", id, {status:"Archived"}).then(function(){toast(id+" archived.","success");navigate("projects");}).catch(function(e){toast("Failed: "+apiError(e),"error");}); }); });
    });
    var addBtn = el("btnAddProject");
    if (addBtn) addBtn.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Add Project";
      body.innerHTML = '<form id="addProjectForm" style="display:grid;gap:10px"><div class="form-group"><label>Code</label><input type="text" class="form-control" id="pCode"></div>' +
        '<div class="form-group"><label>Name</label><input type="text" class="form-control" id="pName"></div>' +
        '<div class="form-group"><label>Customer</label><input type="text" class="form-control" id="pCustomer"></div>' +
        '<div class="form-group"><label>Division</label><select class="form-control" id="pDivision"><option>Technical</option><option>Shared</option></select></div>' +
        '<div class="form-group"><label>Manager</label><input type="text" class="form-control" id="pManager"></div>' +
        '<div class="form-group"><label>Value</label><input type="number" class="form-control" id="pValue" step="0.01"></div>' +
        '<div class="form-group"><label>Priority</label><select class="form-control" id="pPriority"><option>Low</option><option selected>Medium</option><option>High</option></select></div>' +
        '<div class="form-group"><label>Status</label><select class="form-control" id="pStatus"><option selected>Approved</option><option>Lead</option><option>Quotation</option><option>In progress</option><option>Completed</option></select></div>' +
        '<div class="form-group"><label>Due Date</label><input type="date" class="form-control" id="pDue"></div>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Create";
      var submitProject = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Creating...";
        var p = { code: el("pCode").value.trim(), name: el("pName").value.trim(), customer: el("pCustomer").value.trim(), division: el("pDivision").value, manager: el("pManager").value.trim(), value: parseFloat(el("pValue").value)||0, priority: el("pPriority").value, status: el("pStatus").value, due: el("pDue").value.trim()||null };
        if (!p.code || !p.name) { toast("Code and Name required","error"); btn.disabled = false; btn.textContent = "Create"; return; }
        try { await PHG_API.create("projects", p); closeModal(); toast("Created.","success"); navigate("projects"); } catch(e){btn.disabled = false; btn.textContent = "Create"; toast("Failed: "+apiError(e),"error");}
      };
      el("modalOk").onclick = submitProject;
      el("addProjectForm").onsubmit = function (e) { e.preventDefault(); submitProject(); };
      openModal(mb);
    });
  };


  function openProjectEditModal(p) {
    var mb = el("modalBackdrop"), body = el("modalBody");
    var id = p.id || p.code;
    el("modalTitle").textContent = "Edit Project " + id;
    body.innerHTML = '<form id="editProjectForm" style="display:grid;gap:10px"><div class="form-group"><label>Name</label><input type="text" class="form-control" id="pName" value="' + esc(p.name||"") + '"></div>' +
      '<div class="form-group"><label>Customer</label><input type="text" class="form-control" id="pCustomer" value="' + esc(p.customer||"") + '"></div>' +
      '<div class="form-group"><label>Division</label><select class="form-control" id="pDivision"><option' + (p.division==="Technical"?" selected":"") + '>Technical</option><option' + (p.division==="Shared"?" selected":"") + '>Shared</option></select></div>' +
      '<div class="form-group"><label>Manager</label><input type="text" class="form-control" id="pManager" value="' + esc(p.manager||"") + '"></div>' +
      '<div class="form-group"><label>Value</label><input type="number" class="form-control" id="pValue" step="0.01" value="' + (p.value||0) + '"></div>' +
      '<div class="form-group"><label>Priority</label><select class="form-control" id="pPriority"><option' + (p.priority==="Low"?" selected":"") + '>Low</option><option' + (p.priority==="Medium"?" selected":"") + '>Medium</option><option' + (p.priority==="High"?" selected":"") + '>High</option></select></div>' +
      '<div class="form-group"><label>Status</label><select class="form-control" id="pStatus"><option' + (p.status==="Approved"?" selected":"") + '>Approved</option><option' + (p.status==="Lead"?" selected":"") + '>Lead</option><option' + (p.status==="In progress"?" selected":"") + '>In progress</option><option' + (p.status==="Completed"?" selected":"") + '>Completed</option><option' + (p.status==="Archived"?" selected":"") + '>Archived</option></select></div>' +
      '<div class="form-group"><label>Due Date</label><input type="date" class="form-control" id="pDue" value="' + (p.due||"") + '"></div>' +
      '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
      '</form>';
    el("modalCancel").style.display = "inline-block";
    el("modalOk").style.display = "inline-block";
    el("modalOk").textContent = "Save";
    var saveProject = async function () {
      var btn = el("modalOk");
      btn.disabled = true;
      btn.textContent = "Saving...";
      var payload = { name: el("pName").value.trim(), customer: el("pCustomer").value.trim(), division: el("pDivision").value, manager: el("pManager").value.trim(), value: parseFloat(el("pValue").value)||0, priority: el("pPriority").value, status: el("pStatus").value, due: el("pDue").value.trim()||null };
      try { await PHG_API.update("projects", id, payload); closeModal(); toast(id + " updated.", "success"); navigate("projects"); } catch (e) { btn.disabled = false; btn.textContent = "Save"; toast("Update failed: " + apiError(e), "error"); }
    };
    el("modalOk").onclick = saveProject;
    el("editProjectForm").onsubmit = function (e) { e.preventDefault(); saveProject(); };
    openModal(mb);
  }


  /* ---------- Tasks CRUD ---------- */
  VIEWS.tasks = function () {
    var canEdit = session.role === "admin" || session.role === "gm";
    var html = pageHead("Tasks", "Task register.", canEdit ? '<button class="btn btn-primary" id="btnAddTask">+ Add Task</button>' : "");
    var rows = "";
    (D.tasks || []).forEach(function (t) {
      var id = t.id || t.code;
      var proj = (D.projects || []).filter(function (p) { return (p.id || p.code) === t.project; })[0];
      rows += "<tr><td><strong>" + id + "</strong></td><td>" + (proj ? (proj.id||proj.code) : (t.project||"-")) + "</td><td>" + (t.title || "-") + "</td><td>" + (t.assignee || "-") + "</td><td>" + (t.priority || "-") + "</td><td>" + (t.status || "-") + "</td><td>" + (t.due || "-") + "</td>" +
        "<td>" + (canEdit ? '<button class="tv-' + id + '">View</button> <button class="te-' + id + '">Edit</button> <button class="td-' + id + '">Delete</button>' : "View-only") + "</td></tr>";
    });
    html += panel("Task register", (D.tasks || []).length + " tasks", '<div class="table-scroll"><table class="pt"><thead><tr><th>Task</th><th>Project</th><th>Title</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th><th>Actions</th></tr></thead><tbody>' + rows + "</tbody></table></div>", "", true);
    content().innerHTML = html;
    (D.tasks || []).forEach(function (t) {
      var id = t.id || t.code;
      var vb = el("tv-" + id), eb = el("te-" + id), db = el("td-" + id);
      if (vb) vb.addEventListener("click", function () { alert("Task " + id + "\\nTitle: " + (t.title||"N/A") + "\\nProject: " + (t.project||"N/A") + "\\nStatus: " + (t.status||"N/A")); });
      if (eb) eb.addEventListener("click", function () { openTaskEditModal(t); });
      if (db) db.addEventListener("click", function () { confirmModal("Delete " + id, "Delete this task?", function () { PHG_API.del("tasks", id).then(function(){toast(id+" deleted.","success");navigate("tasks");}).catch(function(e){toast("Failed: "+apiError(e),"error");}); }); });
    });
    var addBtn = el("btnAddTask");
    if (addBtn) addBtn.addEventListener("click", function () {
      var mb = el("modalBackdrop"), body = el("modalBody");
      el("modalTitle").textContent = "Add Task";
      var projOpts = (D.projects || []).map(function (p) { var pid = p.id || p.code; return '<option value="' + pid + '">' + pid + " - " + (p.name||"") + "</option>"; }).join("");
      body.innerHTML = '<form id="addTaskForm" style="display:grid;gap:10px"><div class="form-group"><label>Code</label><input type="text" class="form-control" id="tCode"></div>' +
        '<div class="form-group"><label>Project</label><select class="form-control" id="tProject"><option value="">Select project</option>' + projOpts + '</select></div>' +
        '<div class="form-group"><label>Title</label><input type="text" class="form-control" id="tTitle"></div>' +
        '<div class="form-group"><label>Assignee</label><input type="text" class="form-control" id="tAssignee"></div>' +
        '<div class="form-group"><label>Priority</label><select class="form-control" id="tPriority"><option>Low</option><option selected>Medium</option><option>High</option></select></div>' +
        '<div class="form-group"><label>Status</label><select class="form-control" id="tStatus"><option selected>To do</option><option>In progress</option><option>Done</option><option>Blocked</option></select></div>' +
        '<div class="form-group"><label>Due Date</label><input type="date" class="form-control" id="tDue"></div>' +
        '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
        '</form>';
      el("modalCancel").style.display = "inline-block";
      el("modalOk").style.display = "inline-block";
      el("modalOk").textContent = "Create";
      var submitTask = async function () {
        var btn = el("modalOk");
        btn.disabled = true;
        btn.textContent = "Creating...";
        var t = { code: el("tCode").value.trim(), project: el("tProject").value.trim(), title: el("tTitle").value.trim(), assignee: el("tAssignee").value.trim(), priority: el("tPriority").value, status: el("tStatus").value, due: el("tDue").value.trim()||null };
        if (!t.code) { toast("Code required","error"); btn.disabled = false; btn.textContent = "Create"; return; }
        if (!t.project) { toast("Project required","error"); btn.disabled = false; btn.textContent = "Create"; return; }
        if (!t.title) { toast("Title required","error"); btn.disabled = false; btn.textContent = "Create"; return; }
        try { await PHG_API.create("tasks", t); closeModal(); toast("Created.","success"); navigate("tasks"); } catch(e){btn.disabled = false; btn.textContent = "Create"; toast("Failed: "+apiError(e),"error");}
      };
      el("modalOk").onclick = submitTask;
      el("addTaskForm").onsubmit = function (e) { e.preventDefault(); submitTask(); };
      openModal(mb);
    });
  };


  function openTaskEditModal(t) {
    var mb = el("modalBackdrop"), body = el("modalBody");
    var id = t.id || t.code;
    el("modalTitle").textContent = "Edit Task " + id;
    var projOpts = (D.projects || []).map(function (p) { var pid = p.id || p.code; return '<option value="' + pid + '"' + (pid === t.project ? " selected" : "") + '>' + pid + " - " + (p.name||"") + "</option>"; }).join("");
    body.innerHTML = '<form id="editTaskForm" style="display:grid;gap:10px"><div class="form-group"><label>Project</label><select class="form-control" id="tProject"><option value="">Select project</option>' + projOpts + '</select></div>' +
      '<div class="form-group"><label>Title</label><input type="text" class="form-control" id="tTitle" value="' + esc(t.title||"") + '"></div>' +
      '<div class="form-group"><label>Assignee</label><input type="text" class="form-control" id="tAssignee" value="' + esc(t.assignee||"") + '"></div>' +
      '<div class="form-group"><label>Priority</label><select class="form-control" id="tPriority"><option' + (t.priority==="Low"?" selected":"") + '>Low</option><option' + (t.priority==="Medium"?" selected":"") + '>Medium</option><option' + (t.priority==="High"?" selected":"") + '>High</option></select></div>' +
      '<div class="form-group"><label>Status</label><select class="form-control" id="tStatus"><option' + (t.status==="To do"?" selected":"") + '>To do</option><option' + (t.status==="In progress"?" selected":"") + '>In progress</option><option' + (t.status==="Done"?" selected":"") + '>Done</option><option' + (t.status==="Blocked"?" selected":"") + '>Blocked</option></select></div>' +
      '<div class="form-group"><label>Due Date</label><input type="date" class="form-control" id="tDue" value="' + (t.due||"") + '"></div>' +
      '<button type="submit" style="position:absolute;opacity:0;width:0;height:0;border:none;padding:0;margin:0;pointer-events:none"></button>' +
      '</form>';
    el("modalCancel").style.display = "inline-block";
    el("modalOk").style.display = "inline-block";
    el("modalOk").textContent = "Save";
    var saveTask = async function () {
      var btn = el("modalOk");
      btn.disabled = true;
      btn.textContent = "Saving...";
      var payload = { project: el("tProject").value.trim(), title: el("tTitle").value.trim(), assignee: el("tAssignee").value.trim(), priority: el("tPriority").value, status: el("tStatus").value, due: el("tDue").value.trim()||null };
      try { await PHG_API.update("tasks", id, payload); closeModal(); toast(id + " updated.", "success"); navigate("tasks"); } catch (e) { btn.disabled = false; btn.textContent = "Save"; toast("Update failed: " + apiError(e), "error"); }
    };
    el("modalOk").onclick = saveTask;
    el("editTaskForm").onsubmit = function (e) { e.preventDefault(); saveTask(); };
    openModal(mb);
  }


})();
