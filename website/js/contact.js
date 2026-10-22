/* Contact page â€” client-side validation + local demo storage.
   Note: this is a static demo. A production deployment must submit to the
   backend API (Django REST) which repeats all validation server-side. */
(function () {
  "use strict";

  var form = document.getElementById("inquiryForm");
  if (!form) return;

  var alertBox = document.getElementById("formAlert");

  function showError(id, on) {
    var input = document.getElementById(id);
    var msg = form.querySelector('.error-msg[data-for="' + id + '"]');
    if (input) input.classList.toggle("invalid", on);
    if (msg) msg.classList.toggle("show", on);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  function validPhone(v) {
    var digits = v.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  var validators = {
    cfName: function (v) { return v.trim().length >= 2; },
    cfEmail: function (v) { return validEmail(v.trim()); },
    cfPhone: function (v) { return validPhone(v.trim()); },
    cfTopic: function (v) { return v !== ""; },
    cfMessage: function (v) { return v.trim().length >= 10; }
  };

  /* Live re-validation once a field has errored */
  Object.keys(validators).forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      if (el.classList.contains("invalid")) {
        showError(id, !validators[id](el.value));
      }
    });
    el.addEventListener("blur", function () {
      if (el.value !== "") showError(id, !validators[id](el.value));
    });
  });

  function setAlert(type, text) {
    alertBox.className = "alert show " + type;
    alertBox.innerHTML = text;
    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    var firstBad = null;
    Object.keys(validators).forEach(function (id) {
      var el = document.getElementById(id);
      var ok = validators[id](el.value);
      showError(id, !ok);
      if (!ok && !firstBad) firstBad = el;
    });

    if (firstBad) {
      setAlert("error", "<strong> Please fix the highlighted fields.</strong>");
      firstBad.focus();
      return;
    }

    var ref = "PHG-INQ-" + Date.now().toString(36).toUpperCase();
    var record = {
      reference: ref,
      name: document.getElementById("cfName").value.trim(),
      organization: document.getElementById("cfOrg").value.trim(),
      email: document.getElementById("cfEmail").value.trim(),
      phone: document.getElementById("cfPhone").value.trim(),
      topic: document.getElementById("cfTopic").value,
      message: document.getElementById("cfMessage").value.trim(),
      submittedAt: new Date().toISOString()
    };

    try {
      var created = await PHG_API.postInquiry(record);
      ref = created.reference || ref;
    } catch (apiErr) {
      /* offline fallback: store in browser */
      try {
        var key = "phg_inquiries";
        var all = JSON.parse(localStorage.getItem(key) || "[]");
        all.push(record);
        localStorage.setItem(key, JSON.stringify(all));
      } catch (_) { /* storage unavailable â€” still show success for demo */ }
    }

    setAlert("success",
      "<strong>Thank you, " + record.name.replace(/[<>&]/g, "") + "!</strong> " +
      "Your inquiry has been recorded with reference <strong>" + ref + "</strong>. " +
      "Our team will respond within one business day. " +
      "<span class='form-note'>(Static demo: the record was saved in this browser only.)</span>");

    form.reset();
  });
})();
