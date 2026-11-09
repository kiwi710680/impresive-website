/*
 * Compare two copies of the site element by element: every computed CSS property of
 * every element (and its ::before / ::after) must be identical. Used to prove that a
 * CSS clean-up (scripts/consolidate-css.py) changed nothing.
 *
 * How to run: serve the PARENT folder that holds both copies on one origin, e.g.
 *   python -m http.server 8777 --directory "C:\Website design"
 * open http://localhost:8777/ and paste this file into the developer console after
 * setting the two folder names below. Progress and results: window.__cmp.
 *
 * Each page is compared at several widths, first as loaded and then after the
 * interactive states are switched on (details opened, FAQ answers opened, first impact
 * area opened, mobile menu opened, first answer of every readiness question chosen).
 * Transitions and animations are switched off in both copies before measuring.
 * :hover and :focus states cannot be forced from script and are not covered.
 */
(async () => {
  const OLD = window.CMP_OLD || "Website_261107";
  const NEW = window.CMP_NEW || "Website_261107-1";
  const pages = ["index", "about", "objective", "how", "cases", "databases", "join", "methods", "case-ascvd",
    "case-adpn", "transportability", "404", "Visualization/index"];
  const widths = window.CMP_WIDTHS || [1400, 1100, 820, 375];
  const state = (window.__cmp = { done: false, runs: 0, elements: 0, values: 0, mismatches: [] });

  const load = async (url, width) => {
    const f = document.createElement("iframe");
    f.style.cssText = `position:fixed;left:-5000px;top:0;width:${width}px;height:900px`;
    f.src = url;
    document.body.appendChild(f);
    await new Promise((r) => (f.onload = r));
    await new Promise((r) => setTimeout(r, 1200));
    const still = f.contentDocument.createElement("style");
    still.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
    f.contentDocument.head.appendChild(still);
    return f;
  };
  const interact = async (f) => {
    const d = f.contentDocument;
    d.querySelectorAll("details").forEach((x) => (x.open = true));
    d.querySelectorAll(".faq-question[aria-expanded='false']").forEach((b) => b.click());
    const impact = d.querySelector("[data-impact-tab]");
    if (impact) impact.click();
    const toggle = d.querySelector(".nav-toggle");
    if (toggle && f.contentWindow.getComputedStyle(toggle).display !== "none") toggle.click();
    const names = new Set();
    d.querySelectorAll("input[type=radio]").forEach((r) => { if (!names.has(r.name)) { names.add(r.name); r.click(); } });
    d.querySelectorAll("input[type=checkbox]").forEach((c) => c.click());
    await new Promise((r) => setTimeout(r, 600));
  };
  const snapshot = (f) => {
    const w = f.contentWindow, d = f.contentDocument;
    const list = [];
    for (const el of d.querySelectorAll("body *")) {
      if (el.tagName === "STYLE" && el.textContent.startsWith("*,*::before")) continue;
      const entry = [];
      for (const pseudo of [null, "::before", "::after"]) {
        const cs = w.getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === "none" || cs.content === "normal")) { entry.push(null); continue; }
        const props = {};
        /* url(...) values resolve to each copy's own folder; compare them folder-neutral. */
        for (let i = 0; i < cs.length; i++) props[cs[i]] = cs.getPropertyValue(cs[i]).split("/" + OLD + "/").join("/SITE/").split("/" + NEW + "/").join("/SITE/");
        entry.push(props);
      }
      list.push({ tag: el.tagName, cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || "", entry });
    }
    return list;
  };
  const diff = (page, width, phase, a, b) => {
    if (a.length !== b.length) {
      state.mismatches.push(`${page} @${width} ${phase}: element count ${a.length} vs ${b.length}`);
      return;
    }
    for (let i = 0; i < a.length; i++) {
      state.elements++;
      for (let k = 0; k < 3; k++) {
        const x = a[i].entry[k], y = b[i].entry[k];
        if (!x && !y) continue;
        if (!x || !y) { state.mismatches.push(`${page} @${width} ${phase}: <${a[i].tag} ${a[i].cls}> pseudo ${k} present in one copy only`); continue; }
        for (const p in x) {
          state.values++;
          if (x[p] !== y[p]) {
            state.mismatches.push(`${page} @${width} ${phase}: <${a[i].tag} ${String(a[i].cls).slice(0, 40)}>${["", "::before", "::after"][k]} ${p}: "${x[p]}" vs "${y[p]}"`);
          }
        }
      }
    }
  };

  for (const page of pages) {
    for (const width of widths) {
      const fa = await load(`/${OLD}/${page}.html?c=${Date.now()}`, width);
      const fb = await load(`/${NEW}/${page}.html?c=${Date.now()}`, width);
      diff(page, width, "loaded", snapshot(fa), snapshot(fb));
      await interact(fa);
      await interact(fb);
      diff(page, width, "interactive", snapshot(fa), snapshot(fb));
      fa.remove();
      fb.remove();
      state.runs++;
    }
  }
  state.done = true;
  console.log(`${state.runs} page/width runs, ${state.elements} element comparisons, ${state.values} property values, ${state.mismatches.length} mismatch(es).`);
  state.mismatches.slice(0, 50).forEach((m) => console.log(m));
})();
