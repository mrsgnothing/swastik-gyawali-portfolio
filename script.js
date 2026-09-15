/* =========================================================
   Swastik Gyawali — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav: scrolled state ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 12) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("mobileMenu");
  var setMenu = function (open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    mobile.hidden = !open;
  };
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---- Active link on scroll (scrollspy) ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = "#" + entry.target.id;
          links.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // gentle stagger for grouped items
          var delay = Math.min(i * 60, 180);
          setTimeout(function () { el.classList.add("is-visible"); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Contact form: word counter + AJAX submit ---- */
  var form = document.getElementById("contactForm");
  var message = document.getElementById("message");
  var counter = document.getElementById("counter");
  var status = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var MAX_WORDS = 250;

  var countWords = function (text) {
    var t = text.trim();
    return t ? t.split(/\s+/).length : 0;
  };

  if (message && counter) {
    var updateCounter = function () {
      var words = countWords(message.value);
      counter.textContent = words + " / " + MAX_WORDS + " words";
      counter.classList.toggle("is-over", words > MAX_WORDS);
    };
    message.addEventListener("input", updateCounter);
    updateCounter();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.className = "form__status";

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (countWords(message.value) > MAX_WORDS) {
        status.textContent = "Please keep your message under " + MAX_WORDS + " words.";
        status.classList.add("is-error");
        message.focus();
        return;
      }

      var original = submitBtn.textContent;
      submitBtn.classList.add("is-loading");
      submitBtn.textContent = "Sending…";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (counter) counter.textContent = "0 / " + MAX_WORDS + " words";
            status.textContent = "Thanks! Your message has been sent — I'll be in touch soon.";
            status.classList.add("is-success");
          } else {
            return res.json().then(function (data) {
              var msg = data && data.errors
                ? data.errors.map(function (er) { return er.message; }).join(", ")
                : "Something went wrong. Please try again.";
              throw new Error(msg);
            });
          }
        })
        .catch(function (err) {
          status.textContent = err.message || "Network error. Please try again later.";
          status.classList.add("is-error");
        })
        .finally(function () {
          submitBtn.classList.remove("is-loading");
          submitBtn.textContent = original;
        });
    });
  }
})();
