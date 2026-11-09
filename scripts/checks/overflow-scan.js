/*
 * Narrow-width / zoom overflow scan.
 *
 * Browser zoom behaves like a narrower window, so each page is loaded at several
 * widths and the scan reports (a) page-level horizontal scrolling and (b) text that
 * extends past the edge of the box it sits in. Elements inside horizontal scrollers
 * (tables, "On this page" bars) are ignored because scrolling is intended there.
 *
 * How to run: serve the site root, open it in a browser, paste this file into the
 * developer console. It takes about a minute; progress is in window.__overflow.
 */
(async () => {
  const pages = ["index", "about", "objective", "how", "cases", "databases", "join", "methods", "case-ascvd", "case-adpn",
    "transportability", "404", "Visualization/index"];
  const widths = [1280, 1100, 960, 820, 700, 600, 480, 375];
  const state = (window.__overflow = { done: false, loads: 0, found: [] });
  for (const page of pages) {
    for (const width of widths) {
      const frame = document.createElement("iframe");
      frame.style.cssText = `position:fixed;left:-4000px;top:0;width:${width}px;height:900px`;
      frame.src = `/${page}.html?w=${width}_${Date.now()}`;
      document.body.appendChild(frame);
      await new Promise((r) => (frame.onload = r));
      await new Promise((r) => setTimeout(r, 450));
      state.loads++;
      const d = frame.contentDocument, w = frame.contentWindow;
      const inScroller = (e) => { for (let n = e; n && n !== d.body; n = n.parentElement) { if (/(auto|scroll)/.test(w.getComputedStyle(n).overflowX)) return true; } return false; };
      if (d.documentElement.scrollWidth > width + 1) state.found.push(`${page} @${width}px: page scrolls sideways (${d.documentElement.scrollWidth}px)`);
      for (const el of d.querySelectorAll("main *")) {
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const s = w.getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden" || s.position === "absolute" || s.position === "fixed") continue;
        if (el.closest("[hidden],svg,.impact-card__peek,.process-rail")) continue;
        let box = el.parentElement;
        while (box && box !== d.body) {
          const bs = w.getComputedStyle(box);
          if ((parseFloat(bs.borderRightWidth) > 0 || bs.backgroundColor !== "rgba(0, 0, 0, 0)" || bs.overflowX !== "visible") && bs.display !== "inline") break;
          box = box.parentElement;
        }
        if (!box || box === d.body) continue;
        const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
        if (!r.width) continue;
        const over = Math.max(r.right - b.right, el.scrollWidth > el.clientWidth + 2 && s.overflowX === "visible" && s.display !== "inline" ? el.scrollWidth - el.clientWidth : 0);
        if (over > 2 && !inScroller(el)) state.found.push(`${page} @${width}px: ${(el.className || el.tagName).toString().slice(0, 35)} +${Math.round(over)}px "${el.textContent.trim().slice(0, 30)}"`);
      }
      frame.remove();
    }
  }
  state.done = true;
  const unique = [...new Set(state.found)];
  console.log(`${state.loads} page loads, ${unique.length} finding(s).`);
  unique.forEach((line) => console.log(line));
})();
