/* Prime Horizon Group — shared chrome (topbar, header, footer) */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  function logoSvg() {
    return '<svg width="26" height="26" viewBox="0 0 44 44" fill="none" aria-hidden="true">' +
      '<path d="M10 30 L22 12 L34 30" stroke="#7fd8cc" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="14" y1="35" x2="30" y2="35" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/></svg>';
  }

  var NAV = [
    ["/", "Home", "home", "nav.home"],
    ["/about", "About", "about", "nav.about"],
    ["/services", "Services", "services", "nav.services"],
    ["/projects", "Projects", "projects", "nav.projects"],
    ["/careers", "Careers", "careers", "nav.careers"],
    ["/contact", "Contact", "contact", "nav.contact"]
  ];

  function navLinks() {
    return NAV.map(function (n) {
      return '<a href="' + n[0] + '" data-i18n="' + n[3] + '"' + (n[2] === page ? ' class="active"' : '') + '>' + n[1] + '</a>';
    }).join("") + '<a class="nav-cta-mobile" href="/contact" data-i18n="hero.cta2">Get a Quote</a>';
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
          '<span data-i18n="topbar.tagline">Addis Ababa, Ethiopia</span>' +
          '<a href="/portal" data-i18n="nav.portal">Client Portal &#8594;</a>' +
        '</div>' +
      '</div>';
  }

  var headerEl = document.querySelector("[data-site-header]");
  if (headerEl) {
    headerEl.className = "header";
    headerEl.innerHTML =
      '<div class="container">' +
        '<a class="brand" href="/" aria-label="Prime Horizon Group home">' +
          '<span class="brand-mark">' + logoSvg() + '</span>' +
          '<span><span class="brand-name">Prime Horizon Group</span><br>' +
          '<span class="brand-tag" data-i18n="brand.tag">Technical Services</span></span>' +
        '</a>' +
        '<nav class="nav" id="mainNav" aria-label="Main navigation">' + navLinks() + '</nav>' +
        '<div class="header-cta">' +
          '<button type="button" class="btn btn-outline btn-sm lang-toggle" id="langToggle" aria-label="Switch language"><span class="lang-opt" data-lang="en">EN</span><span class="lang-sep">|</span><span class="lang-opt" data-lang="am">አማ</span></button>' +
          '<a href="/portal" class="btn btn-outline btn-sm" data-i18n="nav.login">Client Login</a>' +
          '<a href="/contact" class="btn btn-primary btn-sm" data-i18n="hero.cta2">Get a Quote</a>' +
          '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="mainNav">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  function updateLangToggle(){
    var btn = document.getElementById("langToggle");
    if(!btn) return;
    var cur = (window.PHG_I18N && window.PHG_I18N.getLang) ? window.PHG_I18N.getLang() : "en";
    btn.querySelectorAll(".lang-opt").forEach(function(span){
      span.classList.toggle("active", span.getAttribute("data-lang") === cur);
    });
  }
  var langBtn = document.getElementById("langToggle");
  if(langBtn){
    langBtn.addEventListener("click", function(){
      var cur = (window.PHG_I18N && window.PHG_I18N.getLang) ? window.PHG_I18N.getLang() : "en";
      var next = (cur === "en") ? "am" : "en";
      if(window.PHG_I18N && window.PHG_I18N.setLang) window.PHG_I18N.setLang(next);
      updateLangToggle();
    });
  }
  if(window.PHG_I18N && window.PHG_I18N.apply){ window.PHG_I18N.apply(); }
  updateLangToggle();
  window.addEventListener("phg:lang", updateLangToggle);

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
            '<a class="brand" href="/">' +
              '<span class="brand-mark">' + logoSvg() + '</span>' +
              '<span><span class="brand-name">Prime Horizon Group</span><br>' +
              '<span class="brand-tag" data-i18n="brand.tag">Technical Services</span></span>' +
            '</a>' +
            '<p data-i18n="footer.about">An Ethiopian technical-services company built on transparent governance and disciplined delivery. Registered private limited company, Addis Ababa.</p>' +
          '</div>' +
          '<div><h4 data-i18n="footer.company">Company</h4>' +
            '<a href="/about" data-i18n="nav.about">About Us</a>' +
            '<a href="/projects" data-i18n="nav.projects">Projects</a>' +
            '<a href="/careers" data-i18n="nav.careers">Careers</a>' +
            '<a href="/contact" data-i18n="nav.contact">Contact</a>' +
          '</div>' +
          '<div><h4 data-i18n="footer.services">Services</h4>' +
            '<a href="/services" data-i18n="services.it.title">IT Support &amp; Systems</a>' +
            '<a href="/services" data-i18n="services.software.title">Software Development</a>' +
            '<a href="/services" data-i18n="services.electrical.title">Electrical &amp; Engineering</a>' +
            '<a href="/services" data-i18n="services.networking.title">Networking &amp; Infrastructure</a>' +
            '<a href="/services" data-i18n="services.power.title">Power &amp; Energy Solutions</a>' +
          '</div>' +
          '<div><h4 data-i18n="footer.contact">Contact</h4>' +
            '<ul class="footer-contact">' +
              '<li>' + pin + '<span>Bole Sub-city, Addis Ababa, Ethiopia</span></li>' +
              '<li>' + phone + '<a href="tel:+251911000000">+251 911 000 000</a></li>' +
              '<li>' + mail + '<a href="mailto:info@primehorizon.et">info@primehorizon.et</a></li>' +
              '<li>' + clock + '<span data-i18n="footer.hours">Mon-Sat, 8:00 - 17:30</span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; <span id="year">2026</span> Prime Horizon Group Plc. <span data-i18n="footer.rights">All rights reserved.</span></span>' +
          '<span class="footer-legal">' +
            '<a href="/privacy" data-i18n="footer.privacy">Privacy Policy</a>' +
            '<a href="/terms" data-i18n="footer.terms">Terms of Use</a>' +
            '<a href="/portal" data-i18n="nav.portal">Management Portal</a>' +
          '</span>' +
        '</div>' +
      '</div>';
  }
  if(window.PHG_I18N && window.PHG_I18N.apply){ window.PHG_I18N.apply(); }
})();
