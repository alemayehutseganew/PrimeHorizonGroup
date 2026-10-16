/* Prime Horizon Group — shared chrome (topbar, header, footer)
   Inner pages declare <div data-site-topbar></div>, <header data-site-header></header>,
   <footer data-site-footer></footer> and this script fills them in.
   The page body sets <body data-page="about"> etc. for active-link highlighting. */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  function logoSvg() {
    return '<svg width="26" height="26" viewBox="0 0 44 44" fill="none" aria-hidden="true">' +
      '<path d="M10 30 L22 12 L34 30" stroke="#7fd8cc" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/></svg>';
  }

  var NAV = [
    ["index.html", "Home", "home"],
    ["about.html", "About", "about"],
    ["services.html", "Services", "services"],
    ["fleet.html", "Fleet", "fleet"],
    ["projects.html", "Projects", "projects"],
    ["careers.html", "Careers", "careers"],
    ["contact.html", "Contact", "contact"]
  ];

  function navLinks() {
    return NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[2] === page ? ' class="active"' : '') + '>' + n[1] + '</a>';
    }).join("");
  }

  var topbarEl = document.querySelector("[data-site-topbar]");
  if (topbarEl) {
    topbarEl.className = "topbar";
    topbarEl.innerHTML =
      '<div class="container">' +
        '<div class="topbar-left">' +
          '<a href="tel:+251911000000">&#9742; +251 911 000 000</a>' +
          '<a href="mailto:info@primehorizon.et">&#9993; info@primehorizon.et</a>' +
        '</div>' +
        '<div class="topbar-right">' +
          '<span>Addis Ababa, Ethiopia</span>' +
          '<a href="portal.html">Shareholder &amp; Staff Login &#8594;</a>' +
        '</div>' +
      '</div>';
  }

  var headerEl = document.querySelector("[data-site-header]");
  if (headerEl) {
    headerEl.className = "header";
    headerEl.innerHTML =
      '<div class="container">' +
        '<a class="brand" href="index.html" aria-label="Prime Horizon Group home">' +
          '<span class="brand-mark">' + logoSvg() + '</span>' +
          '<span><span class="brand-name">Prime Horizon Group</span><br>' +
          '<span class="brand-tag">Transport &amp; Technical Services</span></span>' +
        '</a>' +
        '<nav class="nav" id="mainNav" aria-label="Main navigation">' + navLinks() + '</nav>' +
        '<div class="header-cta">' +
          '<a href="portal.html" class="btn btn-outline btn-sm">Client Login</a>' +
          '<a href="contact.html" class="btn btn-primary btn-sm">Get a Quote</a>' +
          '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="mainNav">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>';
  }
  var pin = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var phone = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  var mail = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  var clock = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';

  var footerEl = document.querySelector("[data-site-footer]");
  if (footerEl) {
    footerEl.className = "footer";
    footerEl.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-about">' +
            '<a class="brand" href="index.html">' +
              '<span class="brand-mark">' + logoSvg() + '</span>' +
              '<span><span class="brand-name">Prime Horizon Group</span><br>' +
              '<span class="brand-tag">Transport &amp; Technical Services</span></span>' +
            '</a>' +
            '<p>An Ethiopian transport and technical-services company built on transparent governance and disciplined delivery. Registered private limited company, Addis Ababa.</p>' +
          '</div>' +
          '<div><h4>Company</h4>' +
            '<a href="about.html">About Us</a>' +
            '<a href="projects.html">Projects</a>' +
            '<a href="careers.html">Careers</a>' +
            '<a href="contact.html">Contact</a>' +
          '</div>' +
          '<div><h4>Services</h4>' +
            '<a href="services.html">Transport &amp; Logistics</a>' +
            '<a href="services.html">IT Support &amp; Systems</a>' +
            '<a href="services.html">Software Development</a>' +
            '<a href="services.html">Electrical &amp; Engineering</a>' +
            '<a href="fleet.html">Fleet Services</a>' +
          '</div>' +
          '<div><h4>Contact</h4>' +
            '<ul class="footer-contact">' +
              '<li>' + pin + '<span>Bole Sub-city, Addis Ababa, Ethiopia</span></li>' +
              '<li>' + phone + '<a href="tel:+251911000000">+251 911 000 000</a></li>' +
              '<li>' + mail + '<a href="mailto:info@primehorizon.et">info@primehorizon.et</a></li>' +
              '<li>' + clock + '<span>Mon–Sat, 8:00 – 17:30</span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; <span id="year">2026</span> Prime Horizon Group Plc. All rights reserved.</span>' +
          '<span class="footer-legal">' +
            '<a href="privacy.html">Privacy Policy</a>' +
            '<a href="terms.html">Terms of Use</a>' +
            '<a href="portal.html">Management Portal</a>' +
          '</span>' +
        '</div>' +
      '</div>';
  }
})();