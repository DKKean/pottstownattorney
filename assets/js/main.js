/**
 * Bauer & Associates — site behavior (vanilla JS)
 * Contact form: default POST to form action (form-submit.php) with JSON response.
 * Optional: set window.BAUER_WEB3FORMS_KEY before this script (inline in contact.html) to use Web3Forms on hosts without PHP mail.
 */
(function () {
  "use strict";

  function q(sel, r) {
    return (r || document).querySelector(sel);
  }
  function qq(sel, r) {
    return [].slice.call((r || document).querySelectorAll(sel));
  }

  function gtagEvent(name, params) {
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", name, params || {});
      } catch (e) {
        /* no-op */
      }
    }
  }

  function initNav() {
    var btn = q("#js-nav-toggle");
    var nav = q("#js-site-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", !open);
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        btn.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        btn.focus();
      }
    });
  }

  function initFaqFilter() {
    if (!q("#faq-page")) return;
    var buttons = qq("#faq-filters [data-faq-group]");
    var items = qq("#faq-page .faq-item-wrap");
    if (!buttons.length || !items.length) return;

    function setActive(group) {
      items.forEach(function (el) {
        var g = el.getAttribute("data-faq-group");
        if (group === "All" || group === g) {
          el.removeAttribute("hidden");
        } else {
          el.setAttribute("hidden", "hidden");
        }
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-faq-group") === group ? "true" : "false");
      });
    }
    setActive("All");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        setActive(b.getAttribute("data-faq-group") || "All");
        gtagEvent("faq_expand", { group: b.getAttribute("data-faq-group") });
      });
    });
  }

  function showFormMessage(el, text, isError) {
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.className = "form-message" + (isError ? " form-message--error" : " form-message--success");
  }

  function clearFormMessage(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
    el.className = "form-message";
  }

  function postWeb3(fd, key, cb) {
    fd.append("access_key", key);
    fd.append("subject", "Web inquiry — Bauer & Associates");
    fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.success) {
          cb(null);
        } else {
          cb(new Error((data && data.message) || "Could not send."));
        }
      })
      .catch(function (e) {
        cb(e);
      });
  }

  function postPhp(fd, action, cb) {
    fetch(action, { method: "POST", body: fd, credentials: "same-origin" })
      .then(function (r) {
        return r.json().then(
          function (j) {
            return { status: r.status, json: j };
          },
          function () {
            return { status: r.status, json: null };
          }
        );
      })
      .then(function (o) {
        if (o.json && o.json.ok && o.json.code === "sent") {
          cb(null);
          return;
        }
        if (o.json && o.json.ok && o.json.code === "ignored") {
          cb({ silent: true });
          return;
        }
        if (o.status === 404) {
          cb(
            new Error(
              "The contact form is not available right now. Please call (610) 624-6800 or (877) 293-3840 and the office can take your information by phone."
            )
          );
          return;
        }
        if (o.json && o.json.fields) {
          cb({ validation: o.json.fields, message: "Please correct the fields below." });
          return;
        }
        var msg =
          o.json && o.json.message
            ? o.json.message
            : "We could not send your message. Please call (610) 624-6800.";
        cb(new Error(msg));
      })
      .catch(function () {
        cb(new Error("We could not reach the server. If this continues, call (610) 624-6800."));
      });
  }

  function initContactForm() {
    var form = q("#contact-form");
    if (!form) return;
    var company = form.querySelector("#form-company");
    var panel = q("#form-options");
    var toggle = q("#form-options-toggle");
    var statusEl = q("#form-status");
    var submitBtn = form.querySelector('[type="submit"]');
    var formAction = form.getAttribute("action") || "form-submit.php";
    if (toggle && panel) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", function () {
        var hidden = panel.hasAttribute("hidden");
        if (hidden) {
          panel.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        } else {
          panel.setAttribute("hidden", "hidden");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormMessage(statusEl);
      if (company && company.value.trim() !== "") {
        return;
      }

      var first = (q("#first", form) || {}).value;
      var last = (q("#last", form) || {}).value;
      var em = (q("#email", form) || {}).value;
      var ph = (q("#phone", form) || {}).value;
      var sum = (q("#summary", form) || {}).value;
      var ok = true;
      ["#err-first", "#err-last", "#err-email", "#err-phone", "#err-summary"].forEach(function (sel) {
        var n = q(sel, form);
        if (n) n.textContent = "";
      });

      function setErr(id, m) {
        var n = q(id, form);
        if (n) {
          n.textContent = m;
          ok = false;
        }
      }
      if (!String(first || "").trim()) setErr("#err-first", "First name is required.");
      if (!String(last || "").trim()) setErr("#err-last", "Last name is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(em || ""))) setErr("#err-email", "A valid email is required.");
      if (String(String(ph).replace(/\D/g, "")).length < 7) setErr("#err-phone", "A phone number is required.");
      if (String(sum || "").trim().length < 20) setErr("#err-summary", "Add at least 20 characters in the case summary field.");

      if (!ok) {
        gtagEvent("form_error", { page: "contact" });
        if (statusEl) {
          showFormMessage(statusEl, "Please correct the fields marked above.", true);
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        form.setAttribute("aria-busy", "true");
        submitBtn.setAttribute("data-was", submitBtn.textContent || "");
        submitBtn.textContent = "Sending…";
      }

      var fd = new FormData(form);
      var w3 = typeof window.BAUER_WEB3FORMS_KEY === "string" && window.BAUER_WEB3FORMS_KEY.length > 8;

      function done(err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          form.removeAttribute("aria-busy");
          if (submitBtn.getAttribute("data-was")) submitBtn.textContent = submitBtn.getAttribute("data-was");
        }
        if (err && err.silent) {
          return;
        }
        if (err) {
          gtagEvent("form_error", { page: "contact" });
          if (err.validation) {
            var f = err.validation;
            if (f.firstName) setErr("#err-first", f.firstName);
            if (f.lastName) setErr("#err-last", f.lastName);
            if (f.email) setErr("#err-email", f.email);
            if (f.phone) setErr("#err-phone", f.phone);
            if (f.summary) setErr("#err-summary", f.summary);
            if (statusEl) showFormMessage(statusEl, err.message || "Please check the form and try again.", true);
            return;
          }
          if (statusEl) {
            showFormMessage(
              statusEl,
              err.message || "We could not send your message. Please call (610) 624-6800.",
              true
            );
            statusEl.focus();
          } else {
            window.alert("We could not send your message. Please call (610) 624-6800.");
          }
          return;
        }
        gtagEvent("form_submit", { form: "contact" });
        window.location.href = "thank-you.html";
      }

      if (w3) {
        postWeb3(fd, window.BAUER_WEB3FORMS_KEY, function (e) {
          if (e) {
            return done(e);
          }
          done(null);
        });
        return;
      }
      postPhp(fd, formAction, function (e) {
        return done(e);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFaqFilter();
    initContactForm();
  });
})();
