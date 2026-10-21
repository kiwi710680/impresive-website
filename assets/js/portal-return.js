// A way back to the PHDc-AsPEN-IMPRESIVE Alliance portal for visitors who
// arrived from it (its links carry ?via=portal, or the referrer says so).
// The chip stays for the session, can be dismissed, and the parameter is
// removed from the address bar. Self-contained: no markup or CSS elsewhere.
(function () {
  var PORTAL = "https://phd-center.github.io/portal/";
  var KEY = "impresive:via-portal";
  var store = null;
  try { store = window.sessionStorage; } catch (e) {}
  var url = new URL(location.href);
  var fromQuery = url.searchParams.get("via") === "portal";
  var fromReferrer = /^https:\/\/phd-center\.github\.io\/portal\/?/.test(document.referrer || "");
  var on = fromQuery || fromReferrer;
  try {
    if (on && store) store.setItem(KEY, "1");
    else if (store && store.getItem(KEY) === "1") on = true;
  } catch (e) {}
  if (fromQuery) {
    url.searchParams.delete("via");
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  }
  if (!on) return;

  var style = document.createElement("style");
  style.textContent =
    ".portal-return{position:fixed;left:1rem;bottom:1rem;z-index:60;display:inline-flex;align-items:center;gap:.45rem;" +
    "padding:.45rem .55rem .45rem .8rem;border-radius:999px;background:var(--green-800,#215b56);color:#fff;" +
    "font:600 .8rem/1 var(--font,system-ui,sans-serif);letter-spacing:.01em;text-decoration:none;" +
    "border:1px solid rgba(255,255,255,.25);box-shadow:0 6px 18px rgba(23,48,56,.28)}" +
    ".portal-return:hover{background:var(--green-700,#2d746a)}" +
    ".portal-return:focus-visible{outline:2px solid var(--green-600,#3d8b78);outline-offset:3px}" +
    ".portal-return__x{width:1.35rem;height:1.35rem;border-radius:999px;border:0;cursor:pointer;" +
    "background:rgba(255,255,255,.18);color:#fff;font:400 .95rem/1 system-ui,sans-serif}" +
    ".portal-return__x:hover{background:rgba(255,255,255,.32)}" +
    "@media print{.portal-return{display:none}}";
  document.head.appendChild(style);

  var chip = document.createElement("a");
  chip.className = "portal-return";
  chip.href = PORTAL;
  chip.innerHTML = '<span aria-hidden="true">←</span><span>Alliance portal</span>' +
    '<button type="button" class="portal-return__x" aria-label="Hide this link">×</button>';
  chip.querySelector(".portal-return__x").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    chip.remove();
    try { if (store) store.removeItem(KEY); } catch (err) {}
  });
  document.body.appendChild(chip);
})();
