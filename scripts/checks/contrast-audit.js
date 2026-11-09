/*
 * Text-contrast audit (WCAG 2.x AA) for every page.
 *
 * How to run: serve the site root (python -m http.server 8775 --directory .),
 * open http://localhost:8775/ in a browser, open the developer console, paste this
 * file and press Enter. The result is printed as a table and stored in window.__contrast.
 *
 * Text drawn directly on a gradient or image is skipped (no single background
 * colour); check those by hand against the darkest gradient stop.
 * Disabled controls are reported separately because WCAG exempts them.
 * Transitions and animations are switched off first so colours are final values.
 */
(async () => {
  const pages = ["index.html", "about.html", "objective.html", "how.html", "cases.html", "databases.html", "join.html",
    "case-ascvd.html", "case-adpn.html", "transportability.html", "methods.html", "404.html", "Visualization/index.html"];
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const fails = []; const disabled = []; let checked = 0;
  for (const page of pages) {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;left:-3000px;top:0;width:1400px;height:900px";
    frame.src = "/" + page + "?audit=" + Date.now();
    document.body.appendChild(frame);
    await new Promise((r) => (frame.onload = r));
    await new Promise((r) => setTimeout(r, 800));
    const d = frame.contentDocument, w = frame.contentWindow;
    /* Off-screen and background pages can leave CSS transitions paused mid-way
       (e.g. a button fading from its disabled grey), which would report the start
       colour instead of the real one. Switch transitions off before measuring. */
    const still = d.createElement("style");
    still.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
    d.head.appendChild(still);
    for (const el of d.body.querySelectorAll("*")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
      const cs = w.getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || el.closest("[hidden],.impact-card__peek")) continue;
      let fg = parse(cs.color); if (!fg) continue;
      let bg = { r: 255, g: 255, b: 255, a: 1 }; const layers = []; let image = false;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const s = w.getComputedStyle(n);
        if (s.backgroundImage !== "none") image = true;
        const c = parse(s.backgroundColor);
        if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      }
      if (image && !layers.length) continue;
      for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
      if (fg.a < 1) fg = blend(fg, bg);
      checked++;
      const r = ratio(fg, bg), size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      if (r < need) {
        const row = { page, ratio: +r.toFixed(2), need, text: el.textContent.trim().slice(0, 40), element: (el.className || el.tagName).toString().slice(0, 40) };
        (el.disabled || el.closest("button[disabled]") ? disabled : fails).push(row);
      }
    }
    frame.remove();
  }
  window.__contrast = { checked, fails, disabled };
  console.log(`Checked ${checked} text elements: ${fails.length} failure(s), ${disabled.length} disabled control(s).`);
  if (fails.length) console.table(fails);
  if (disabled.length) console.table(disabled);
})();
