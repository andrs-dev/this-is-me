(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* - Tema - */
  var THEME_KEY = "portfolio-theme";
  function storedTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function saveTheme(v) { try { localStorage.setItem(THEME_KEY, v); } catch (e) { /* almacenamiento no disponible */ } }
  var saved = storedTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t === "dark") return true;
    if (t === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  document.getElementById("theme-toggle").addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    saveTheme(next);
  });

  /* - Header y menú móvil - */
  var header = document.getElementById("site-header");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("menu-toggle");

  function onScroll() { header.classList.toggle("is-solid", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* - Sección activa - */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = byId[en.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

    /* - Revelado sutil (una sola vez) - */
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal, [data-observe]").forEach(function (el) { reveal.observe(el); });
  } else {
    document.querySelectorAll(".reveal, [data-observe]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* - Copiar correo - */
  var copyBtn = document.getElementById("copy-email");
  var copyLabel = document.getElementById("copy-label");
  var statusEl = document.getElementById("status");
  var EMAIL = document.getElementById("email-text").textContent.trim();
  var copyTimer;

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function copyDone(ok) {
    statusEl.textContent = ok ? "Correo copiado al portapapeles." : "No se pudo copiar. Selecciona el correo manualmente.";
    if (!ok) return;
    copyBtn.classList.add("is-done"); copyLabel.textContent = "Copiado";
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { copyBtn.classList.remove("is-done"); copyLabel.textContent = "Copiar"; statusEl.textContent = ""; }, 2200);
  }
  copyBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { copyDone(true); }, function () { copyDone(fallbackCopy(EMAIL)); });
    } else {
      copyDone(fallbackCopy(EMAIL));
    }
  });
})();
