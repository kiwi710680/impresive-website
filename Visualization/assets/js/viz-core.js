/* Shared plumbing for the ASCVD visualization modules:
   data loading, the analysis-key model, formatting, and SVG helpers.
   No framework, no build step, no chart library — same constraints as the
   parent site. */
window.VIZ = (function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------------------------------------------------------------- DOM */

  function el(name, className, text) {
    var node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function svg(name, attrs, text) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, String(attrs[key]));
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function button(label, pressed, className) {
    var node = el("button", "explorer-button" + (className ? " " + className : ""), label);
    node.type = "button";
    node.setAttribute("aria-pressed", String(Boolean(pressed)));
    return node;
  }

  /* ------------------------------------------------------------ format */

  var int0 = new Intl.NumberFormat("en-US");

  function n(value) {
    if (value === null || value === undefined || value === "") return "—";
    return int0.format(Math.round(value));
  }

  function d(value, digits) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value !== "number") return String(value);
    return value.toFixed(digits === undefined ? 2 : digits);
  }

  function pct(value, digits) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value !== "number") return String(value);
    return value.toFixed(digits === undefined ? 1 : digits) + "%";
  }

  /* Effect estimate with its interval, e.g. "1.51 (1.49–1.53)". */
  function ci(point, low, high, digits) {
    if (point === null || point === undefined) return "—";
    var p = d(point, digits === undefined ? 2 : digits);
    if (low === null || low === undefined || high === null || high === undefined) return p;
    return p + " (" + d(low, digits === undefined ? 2 : digits) + "–" + d(high, digits === undefined ? 2 : digits) + ")";
  }

  /* --------------------------------------------------------- analysis key */

  /* An analysis is fully identified by the four workbook dimensions. */
  function key(setting) {
    return [setting.period, setting.age, setting.sex, setting.hx].join("_");
  }

  function describe(setting, dims) {
    var parts = [];
    parts.push(dims.age_group[setting.age]);
    parts.push(dims.sex[setting.sex] === "All" ? "All sexes" : dims.sex[setting.sex]);
    parts.push(dims.hx_ASCVD[setting.hx]);
    return parts.join(" · ");
  }

  function isMainAnalysis(setting) {
    return setting.age === 0 && setting.sex === 0 && setting.hx === 0;
  }

  /* ------------------------------------------------------------- palette */

  var COLORS = {
    exposure: "#0063c3",       /* very-high-risk group */
    exposureSoft: "#7fb4e6",
    reference: "#c2426a",      /* high-risk group */
    referenceSoft: "#f0a8bf",
    neutral: "#5c7285",
    grid: "#d8e4ea",
    ink: "#173038",
    smd: ["#3d8b78", "#0063c3", "#c2426a"]  /* <0.1, 0.1–0.3, >=0.3 */
  };

  /* --------------------------------------------------------------- tooltip */

  /* One tooltip per chart container, positioned on hover and on focus so it
     is reachable without a mouse. Repositions on scroll, which the parent
     site's chart tooltips currently do not. */
  function tooltip(container) {
    var node = el("div", "chart-tooltip");
    node.hidden = true;
    container.appendChild(node);
    var current = null;

    function place() {
      if (!current) return;
      var t = current.getBoundingClientRect();
      var c = container.getBoundingClientRect();
      var left = t.left - c.left + t.width / 2 - node.offsetWidth / 2;
      node.style.left = Math.max(6, Math.min(c.width - node.offsetWidth - 6, left)) + "px";
      node.style.top = Math.max(6, t.top - c.top - node.offsetHeight - 9) + "px";
    }

    function show(target, text) {
      current = target;
      node.textContent = text;
      node.hidden = false;
      place();
    }

    function hide() { current = null; node.hidden = true; }

    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);

    return { show: show, hide: hide, node: node };
  }

  /* Charts take a single tab stop; arrow keys move between marks. Attaching
     tabindex to every mark would add dozens of tab stops per figure. */
  function makeNavigable(chartEl, marks, tip) {
    if (!marks.length) return;
    var index = 0;
    chartEl.setAttribute("tabindex", "0");
    chartEl.setAttribute("role", "application");

    function focusMark(i) {
      index = (i + marks.length) % marks.length;
      var m = marks[index];
      tip.show(m.node, m.label);
      marks.forEach(function (other, j) {
        if (other.node.classList) other.node.classList.toggle("is-active-mark", j === index);
      });
    }

    chartEl.addEventListener("keydown", function (event) {
      if (["ArrowRight", "ArrowDown"].indexOf(event.key) !== -1) { event.preventDefault(); focusMark(index + 1); }
      else if (["ArrowLeft", "ArrowUp"].indexOf(event.key) !== -1) { event.preventDefault(); focusMark(index - 1); }
      else if (event.key === "Home") { event.preventDefault(); focusMark(0); }
      else if (event.key === "End") { event.preventDefault(); focusMark(marks.length - 1); }
      else if (event.key === "Escape") { tip.hide(); }
    });
    chartEl.addEventListener("blur", function () { tip.hide(); });

    marks.forEach(function (m) {
      m.node.addEventListener("mouseenter", function () { tip.show(m.node, m.label); });
      m.node.addEventListener("mouseleave", function () { tip.hide(); });
    });
  }

  /* --------------------------------------------------------------- tables */

  function table(headers, rows, options) {
    var opts = options || {};
    var node = el("table", "data-table" + (opts.className ? " " + opts.className : ""));
    var thead = el("thead");
    var hr = el("tr");
    headers.forEach(function (h) {
      var th = el("th", "", typeof h === "string" ? h : h.label);
      th.scope = "col";
      if (typeof h === "object" && h.numeric) th.classList.add("is-numeric");
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    node.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (cell, i) {
        var c = el(i === 0 ? "th" : "td", "", cell);
        if (i === 0) c.scope = "row";
        else if (typeof headers[i] === "object" && headers[i].numeric) c.classList.add("is-numeric");
        tr.appendChild(c);
      });
      tbody.appendChild(tr);
    });
    node.appendChild(tbody);
    return node;
  }

  /* Wraps any wide element so it scrolls inside its own box rather than
     making the page scroll sideways. */
  function scroller(child, label) {
    var box = el("div", "viz-scroll");
    box.setAttribute("tabindex", "0");
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", label || "Scrollable content");
    box.appendChild(child);
    return box;
  }

  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function download(filename, text, mime) {
    saveBlob(new Blob([text], { type: mime || "text/csv;charset=utf-8" }), filename);
  }

  function toCsv(headers, rows) {
    function cell(v) {
      var s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    return [headers.map(function (h) { return cell(typeof h === "string" ? h : h.label); }).join(",")]
      .concat(rows.map(function (r) { return r.map(cell).join(","); }))
      .join("\r\n");
  }

  /* ------------------------------------------------------- figure export */

  function inlineSvgPresentation(source, clone) {
    var sourceNodes = [source].concat(Array.from(source.querySelectorAll("*")));
    var cloneNodes = [clone].concat(Array.from(clone.querySelectorAll("*")));
    var properties = [
      "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
      "stroke-dasharray", "opacity", "font-family", "font-size", "font-weight",
      "font-style", "text-anchor"
    ];
    sourceNodes.forEach(function (node, index) {
      var target = cloneNodes[index];
      if (!target) return;
      var computed = window.getComputedStyle(node);
      properties.forEach(function (property) {
        var value = computed.getPropertyValue(property);
        if (value) target.style.setProperty(property, value);
      });
      target.style.removeProperty("animation");
      target.style.removeProperty("transition");
      target.style.removeProperty("transform");
      if (node.hasAttribute && node.hasAttribute("transform")) {
        target.setAttribute("transform", node.getAttribute("transform"));
      }
    });
  }

  function serializeSvg(source) {
    var clone = source.cloneNode(true);
    clone.setAttribute("xmlns", SVG_NS);
    inlineSvgPresentation(source, clone);
    var viewBox = (clone.getAttribute("viewBox") || "0 0 1200 800").split(/\s+/).map(Number);
    clone.setAttribute("width", String(viewBox[2] || 1200));
    clone.setAttribute("height", String(viewBox[3] || 800));
    return new XMLSerializer().serializeToString(clone);
  }

  function temporaryLabel(buttonNode, message) {
    var original = buttonNode.textContent;
    buttonNode.textContent = message;
    window.setTimeout(function () { buttonNode.textContent = original; }, 1600);
  }

  function downloadSvg(source, filename, buttonNode) {
    saveBlob(new Blob([serializeSvg(source)], { type: "image/svg+xml;charset=utf-8" }), filename + ".svg");
    temporaryLabel(buttonNode, "SVG saved");
  }

  function downloadPng(source, filename, buttonNode) {
    var url = URL.createObjectURL(new Blob([serializeSvg(source)], { type: "image/svg+xml;charset=utf-8" }));
    var image = new Image();
    image.onload = function () {
      var viewBox = (source.getAttribute("viewBox") || "0 0 1200 800").split(/\s+/).map(Number);
      var width = viewBox[2] || 1200;
      var height = viewBox[3] || 800;
      var scale = 2;
      var canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      var context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function (png) {
        if (png) saveBlob(png, filename + "@2x.png");
        temporaryLabel(buttonNode, png ? "PNG saved" : "PNG unavailable");
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    image.onerror = function () {
      URL.revokeObjectURL(url);
      temporaryLabel(buttonNode, "PNG unavailable");
    };
    image.src = url;
  }

  function setupChartDownloads(root) {
    (root || document).querySelectorAll("[data-viz-export]").forEach(function (figure) {
      var pngButton = figure.querySelector('[data-viz-download="png"]');
      var svgButton = figure.querySelector('[data-viz-download="svg"]');
      var mount = figure.querySelector(".viz-chart-shell");
      if (!pngButton || !svgButton || !mount) return;
      var filename = figure.getAttribute("data-viz-export") || "impresive-visualization";
      function currentSvg() { return mount.querySelector("svg"); }
      function sync() {
        var ready = Boolean(currentSvg());
        pngButton.disabled = !ready;
        svgButton.disabled = !ready;
      }
      pngButton.addEventListener("click", function () {
        var current = currentSvg();
        if (current) downloadPng(current, filename, pngButton);
      });
      svgButton.addEventListener("click", function () {
        var current = currentSvg();
        if (current) downloadSvg(current, filename, svgButton);
      });
      sync();
      new MutationObserver(sync).observe(mount, { childList: true, subtree: true });
    });
  }

  /* ----------------------------------------------------------------- load */

  var state = {
    study: null,
    characteristics: null,
    outcomes: null,
    period: 0
  };

  function loadAll() {
    return Promise.all([
      fetch("assets/data/study.json").then(check),
      fetch("assets/data/characteristics.json").then(check),
      fetch("assets/data/outcomes.json").then(check)
    ]).then(function (parts) {
      state.study = parts[0];
      state.characteristics = parts[1];
      state.outcomes = parts[2];
      state.varIndex = {};
      state.study.variables.forEach(function (v, i) { state.varIndex[v.name] = i; });
      state.outcomeIndex = {};
      state.study.outcomes.forEach(function (o, i) { state.outcomeIndex[o.name] = i; });
      return state;
    });
  }

  function check(response) {
    if (!response.ok) throw new Error("HTTP " + response.status + " for " + response.url);
    return response.json();
  }

  /* Read one characteristic for one analysis setting. Returns null when the
     workbook has no row, rather than substituting a zero. */
  function characteristic(setting, varName) {
    var combo = state.characteristics.combos[key(setting)];
    var i = state.varIndex[varName];
    if (!combo || i === undefined || !combo[i]) return null;
    var row = combo[i];
    return {
      all: row[0], allBracket: row[1],
      exposure: row[2], exposureBracket: row[3],
      noneExposure: row[4], noneExposureBracket: row[5],
      smd: row[6]
    };
  }

  function outcome(setting, outcomeName) {
    var combo = state.outcomes.combos[key(setting)];
    var i = state.outcomeIndex[outcomeName];
    if (!combo || i === undefined || !combo[i]) return null;
    var row = combo[i];
    var out = {};
    state.outcomes.fields.forEach(function (f, j) { out[f] = row[j]; });
    return out;
  }

  return {
    el: el, svg: svg, clear: clear, button: button,
    n: n, d: d, pct: pct, ci: ci,
    key: key, describe: describe, isMainAnalysis: isMainAnalysis,
    COLORS: COLORS,
    tooltip: tooltip, makeNavigable: makeNavigable,
    table: table, scroller: scroller, download: download, toCsv: toCsv,
    setupChartDownloads: setupChartDownloads,
    loadAll: loadAll, state: state,
    characteristic: characteristic, outcome: outcome
  };
})();
