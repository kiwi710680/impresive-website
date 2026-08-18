/* Module 2 — Baseline characteristics.
   Categorical variables go to an ASMD scatter against the line of equality;
   continuous variables go to a mean ± 95% CI plot or a box plot. The table
   below drives both: selecting rows filters the figures. */
(function () {
  "use strict";

  var V = window.VIZ;

  var SMD_BANDS = [
    { label: "ASMD < 0.1", test: function (v) { return v < 0.1; }, color: V.COLORS.smd[0] },
    { label: "0.1 ≤ ASMD < 0.3", test: function (v) { return v >= 0.1 && v < 0.3; }, color: V.COLORS.smd[1] },
    { label: "ASMD ≥ 0.3", test: function (v) { return v >= 0.3; }, color: V.COLORS.smd[2] }
  ];

  function band(smd) {
    if (smd === null || smd === undefined) return null;
    var v = Math.abs(Number(smd));
    for (var i = 0; i < SMD_BANDS.length; i += 1) if (SMD_BANDS[i].test(v)) return SMD_BANDS[i];
    return null;
  }

  /* Continuous rows come in mean / median / min / max variants. Only the
     mean rows carry an SD we can turn into a confidence interval; only the
     median rows carry an interquartile range. */
  function variantOf(name) {
    if (/_mean$/.test(name)) return "mean";
    if (/_median$/.test(name)) return "median";
    if (/_min$/.test(name)) return "min";
    if (/_max$/.test(name)) return "max";
    return null;
  }

  function baseOf(name) {
    return name.replace(/_(mean|median|min|max)$/, "");
  }

  function parseRange(text) {
    if (typeof text !== "string") return null;
    var parts = text.split(/[-–~]/).map(function (p) { return parseFloat(p.trim()); });
    if (parts.length < 2 || parts.some(isNaN)) return null;
    return { low: parts[0], high: parts[1] };
  }

  /* ------------------------------------------------------------ scatter */

  function renderScatter(mount, points) {
    V.clear(mount);
    if (!points.length) {
      mount.appendChild(V.el("p", "viz-empty", "Select one or more categorical characteristics in the table below."));
      return;
    }
    var width = 860, height = 470, left = 76, right = 800, top = 28, bottom = 396;
    var node = V.svg("svg", { viewBox: "0 0 " + width + " " + height, class: "viz-chart", role: "img",
      "aria-label": "Proportion of each characteristic in the very-high-risk group against the high-risk group" });
    var tip = V.tooltip(mount);
    var marks = [];

    var x = function (v) { return left + (v / 100) * (right - left); };
    var y = function (v) { return bottom - (v / 100) * (bottom - top); };

    [0, 20, 40, 60, 80, 100].forEach(function (tick) {
      node.appendChild(V.svg("line", { x1: x(tick), x2: x(tick), y1: top, y2: bottom, class: "viz-gridline" }));
      node.appendChild(V.svg("line", { x1: left, x2: right, y1: y(tick), y2: y(tick), class: "viz-gridline" }));
      node.appendChild(V.svg("text", { x: x(tick), y: bottom + 22, "text-anchor": "middle", class: "viz-axis-label" }, tick + "%"));
      node.appendChild(V.svg("text", { x: left - 12, y: y(tick) + 4, "text-anchor": "end", class: "viz-axis-label" }, tick + "%"));
    });

    /* Line of equality: points on it have the same prevalence in both groups. */
    node.appendChild(V.svg("line", { x1: x(0), y1: y(0), x2: x(100), y2: y(100), class: "viz-equality" }));
    node.appendChild(V.svg("text", { x: x(88), y: y(93), class: "viz-annotation" }, "Equal prevalence"));

    points.forEach(function (p) {
      var colour = p.band ? p.band.color : V.COLORS.neutral;
      var mark = V.svg("rect", {
        x: x(p.reference) - 6, y: y(p.exposure) - 6, width: 12, height: 12,
        transform: "rotate(45 " + x(p.reference) + " " + y(p.exposure) + ")",
        fill: colour, class: "viz-point"
      });
      node.appendChild(mark);
      marks.push({
        node: mark,
        label: p.label + " — very-high-risk " + V.pct(p.exposure) + ", high-risk " + V.pct(p.reference) +
          (p.smd === null ? ", ASMD not reported" : ", ASMD " + V.d(Math.abs(p.smd), 3))
      });
    });

    node.appendChild(V.svg("text", { x: (left + right) / 2, y: height - 8, "text-anchor": "middle", class: "viz-axis-title" },
      "Proportion in high-risk patients (%)"));
    node.appendChild(V.svg("text", { x: 18, y: (top + bottom) / 2, "text-anchor": "middle", class: "viz-axis-title",
      transform: "rotate(-90 18 " + ((top + bottom) / 2) + ")" }, "Proportion in very-high-risk patients (%)"));

    mount.insertBefore(node, tip.node);
    V.makeNavigable(node, marks, tip);

    var key = V.el("div", "viz-legend");
    SMD_BANDS.forEach(function (b) {
      var item = V.el("span", "viz-legend__item", b.label);
      item.style.setProperty("--legend-color", b.color);
      key.appendChild(item);
    });
    mount.appendChild(key);
  }

  /* ------------------------------------------- continuous: mean ± 95% CI */

  function renderMeanCi(mount, rows) {
    V.clear(mount);
    var usable = rows.filter(function (r) { return r.exposureMean !== null && r.referenceMean !== null; });
    if (!usable.length) {
      mount.appendChild(V.el("p", "viz-empty", "No continuous characteristic with a reported mean is selected, or the workbook leaves these blank for this subgroup."));
      return;
    }
    /* Each characteristic gets its own horizontal scale. A single axis across
       age, Charlson index, and length of stay would compress every interval
       to less than a pixel, which is what made the caps read as one vertical
       bar instead of a horizontal interval. */
    var rowHeight = 118;
    var width = 1080, left = 300, right = 760, labelX = 786, top = 46;
    var height = top + usable.length * rowHeight + 26;
    var MIN_INTERVAL_PX = 26;   /* keeps a sub-pixel interval readable as horizontal */

    var node = V.svg("svg", { viewBox: "0 0 " + width + " " + height, class: "viz-chart", role: "img",
      "aria-label": "Mean with 95% confidence interval by risk group, each characteristic on its own scale" });
    var tip = V.tooltip(mount);
    var marks = [];
    var anyWidened = false;

    node.appendChild(V.svg("text", { x: labelX, y: top - 18, class: "viz-ci-column-label" }, "Mean (95% CI)"));

    usable.forEach(function (r, i) {
      var baseY = top + i * rowHeight;
      var groups = [
        { mean: r.exposureMean, ci: r.exposureCi, color: V.COLORS.exposure, name: "Very high-risk group", dy: 16 },
        { mean: r.referenceMean, ci: r.referenceCi, color: V.COLORS.reference, name: "High-risk group", dy: 46 }
      ].filter(function (g) { return g.mean !== null; });
      if (!groups.length) return;

      /* Row-local domain: everything this characteristic reports, padded. */
      var values = [];
      groups.forEach(function (g) {
        values.push(g.mean);
        if (g.ci) { values.push(g.ci.low, g.ci.high); }
      });
      var lo = Math.min.apply(null, values);
      var hi = Math.max.apply(null, values);
      var span = hi - lo;
      if (!(span > 0)) span = Math.max(Math.abs(hi) * 0.02, 0.1);
      var pad = span * 0.18;
      lo -= pad; hi += pad;
      var x = function (v) { return left + ((v - lo) / (hi - lo)) * (right - left); };

      node.appendChild(V.svg("text", { x: left - 16, y: baseY + 34, "text-anchor": "end", class: "viz-row-label" }, r.label));

      /* Row axis with its own ticks, so the reader can see the scale differs. */
      var axisY = baseY + 74;
      node.appendChild(V.svg("line", { x1: left, x2: right, y1: axisY, y2: axisY, class: "viz-row-axis" }));
      for (var t = 0; t <= 4; t += 1) {
        var value = lo + ((hi - lo) / 4) * t;
        var tx = x(value);
        node.appendChild(V.svg("line", { x1: tx, x2: tx, y1: baseY + 4, y2: axisY + 5, class: "viz-gridline" }));
        node.appendChild(V.svg("text", { x: tx, y: axisY + 20, "text-anchor": "middle", class: "viz-axis-label" },
          V.d(value, span < 2 ? 2 : 1)));
      }

      groups.forEach(function (g) {
        var y = baseY + g.dy;
        if (g.ci) {
          var x1 = x(g.ci.low), x2 = x(g.ci.high);
          var drawn = x2 - x1;
          var widened = drawn < MIN_INTERVAL_PX;
          if (widened) {
            /* The interval is genuinely narrower than it can be drawn. Render
               it at a readable minimum so it still reads as a horizontal
               interval, and say so in the note below. */
            var mid = (x1 + x2) / 2;
            x1 = mid - MIN_INTERVAL_PX / 2;
            x2 = mid + MIN_INTERVAL_PX / 2;
            anyWidened = true;
          }
          node.appendChild(V.svg("line", {
            x1: x1, x2: x2, y1: y, y2: y, stroke: g.color,
            class: "viz-interval" + (widened ? " viz-interval--minimum" : ""),
            "vector-effect": "non-scaling-stroke"
          }));
          node.appendChild(V.svg("line", { x1: x1, x2: x1, y1: y - 6, y2: y + 6, stroke: g.color, class: "viz-interval-cap", "vector-effect": "non-scaling-stroke" }));
          node.appendChild(V.svg("line", { x1: x2, x2: x2, y1: y - 6, y2: y + 6, stroke: g.color, class: "viz-interval-cap", "vector-effect": "non-scaling-stroke" }));
        }
        var dot = V.svg("circle", { cx: x(g.mean), cy: y, r: 4.5, fill: g.color, class: "viz-point" });
        node.appendChild(dot);
        node.appendChild(V.svg("text", { x: labelX, y: y + 4, fill: g.color, class: "viz-ci-value" },
          V.d(g.mean, 2) + (g.ci ? " (" + V.d(g.ci.low, 2) + "–" + V.d(g.ci.high, 2) + ")" : " (CI not derivable)")));
        marks.push({
          node: dot,
          label: r.label + " — " + g.name + ": mean " + V.d(g.mean, 2) +
            (g.ci ? " (95% CI " + V.d(g.ci.low, 2) + "–" + V.d(g.ci.high, 2) + ")" : ", CI not derivable")
        });
      });
    });

    mount.insertBefore(node, tip.node);
    V.makeNavigable(node, marks, tip);
    mount.appendChild(groupLegend());
    mount.appendChild(V.el("p", "viz-note",
      "Each characteristic is drawn on its own horizontal scale, so intervals can be compared within a row but not between rows. " +
      "Confidence intervals are derived as mean ± 1.96 × SD / √n using the reported standard deviation and group size; the workbook does not supply intervals directly." +
      (anyWidened
        ? " Intervals narrower than " + MIN_INTERVAL_PX + " pixels are drawn at that minimum width so they remain visible as horizontal intervals — read the exact limits printed beside each estimate, not the drawn length."
        : "")));
  }

  /* ------------------------------------------------ continuous: box plot */

  function renderBox(mount, rows) {
    V.clear(mount);
    var usable = rows.filter(function (r) { return r.median !== null && r.iqr; });
    if (!usable.length) {
      mount.appendChild(V.el("p", "viz-empty", "No continuous characteristic with a reported median and interquartile range is selected."));
      return;
    }
    var rowHeight = 56;
    var width = 860, left = 300, right = 810, top = 40;
    var height = top + usable.length * rowHeight + 46;

    var lo = Infinity, hi = -Infinity;
    usable.forEach(function (r) {
      ["exposure", "reference"].forEach(function (side) {
        var b = r[side + "Box"];
        if (!b) return;
        lo = Math.min(lo, b.min !== null ? b.min : b.q1);
        hi = Math.max(hi, b.max !== null ? b.max : b.q3);
      });
    });
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    var pad = (hi - lo) * 0.08 || 1;
    lo -= pad; hi += pad;
    var x = function (v) { return left + ((v - lo) / (hi - lo)) * (right - left); };

    var node = V.svg("svg", { viewBox: "0 0 " + width + " " + height, class: "viz-chart", role: "img",
      "aria-label": "Median, interquartile range and reported extremes by risk group" });
    var tip = V.tooltip(mount);
    var marks = [];

    for (var t = 0; t <= 4; t += 1) {
      var value = lo + ((hi - lo) / 4) * t;
      node.appendChild(V.svg("line", { x1: x(value), x2: x(value), y1: top - 14, y2: height - 40, class: "viz-gridline" }));
      node.appendChild(V.svg("text", { x: x(value), y: height - 20, "text-anchor": "middle", class: "viz-axis-label" }, V.d(value, 1)));
    }

    usable.forEach(function (r, i) {
      var baseY = top + i * rowHeight;
      node.appendChild(V.svg("text", { x: left - 16, y: baseY + 18, "text-anchor": "end", class: "viz-row-label" }, r.label));
      [["exposure", V.COLORS.exposure, "Very high-risk group", 2],
       ["reference", V.COLORS.reference, "High-risk group", 24]].forEach(function (g) {
        var b = r[g[0] + "Box"];
        if (!b) return;
        var y = baseY + g[3];
        if (b.min !== null && b.max !== null) {
          node.appendChild(V.svg("line", { x1: x(b.min), x2: x(b.max), y1: y + 7, y2: y + 7, stroke: g[1], class: "viz-whisker" }));
          node.appendChild(V.svg("line", { x1: x(b.min), x2: x(b.min), y1: y + 2, y2: y + 12, stroke: g[1], class: "viz-interval-cap" }));
          node.appendChild(V.svg("line", { x1: x(b.max), x2: x(b.max), y1: y + 2, y2: y + 12, stroke: g[1], class: "viz-interval-cap" }));
        }
        var boxNode = V.svg("rect", {
          x: x(b.q1), y: y, width: Math.max(2, x(b.q3) - x(b.q1)), height: 15,
          fill: g[1], "fill-opacity": ".22", stroke: g[1], class: "viz-box"
        });
        node.appendChild(boxNode);
        node.appendChild(V.svg("line", { x1: x(b.median), x2: x(b.median), y1: y, y2: y + 15, stroke: g[1], class: "viz-median" }));
        marks.push({
          node: boxNode,
          label: r.label + " — " + g[2] + ": median " + V.d(b.median, 1) + " (Q1–Q3 " + V.d(b.q1, 1) + "–" + V.d(b.q3, 1) + ")" +
            (b.min !== null && b.max !== null ? ", range " + V.d(b.min, 1) + "–" + V.d(b.max, 1) : ", extremes not reported")
        });
      });
    });

    mount.insertBefore(node, tip.node);
    V.makeNavigable(node, marks, tip);
    mount.appendChild(groupLegend());
    mount.appendChild(V.el("p", "viz-note",
      "The box spans the reported interquartile range with the median marked. Whiskers show the workbook's minimum and maximum where reported; they are not Tukey fences."));
  }

  function groupLegend() {
    var box = V.el("div", "viz-legend");
    [["Very high-risk group", V.COLORS.exposure], ["High-risk group", V.COLORS.reference]].forEach(function (g) {
      var item = V.el("span", "viz-legend__item", g[0]);
      item.style.setProperty("--legend-color", g[1]);
      box.appendChild(item);
    });
    return box;
  }

  /* -------------------------------------------------------------- module */

  function init(root) {
    var setting = { period: 0, age: 0, sex: 0, hx: 0 };
    var continuousMode = "ci";
    var selected = null;          /* null = show everything applicable */
    var search = "";
    var sort = { column: "no", direction: 1 };

    var scatterMount = root.querySelector("[data-char-scatter]");
    var continuousMount = root.querySelector("[data-char-continuous]");
    var modeControls = root.querySelector("[data-char-mode]");
    var tableMount = root.querySelector("[data-char-table]");
    var searchInput = root.querySelector("[data-char-search]");
    var statusMount = root.querySelector("[data-char-status]");
    var resetButton = root.querySelector("[data-char-reset]");
    var exportButton = root.querySelector("[data-char-export]");

    [["ci", "Mean ± 95% CI"], ["box", "Box plot"]].forEach(function (m) {
      var control = V.button(m[1], m[0] === continuousMode);
      control.dataset.mode = m[0];
      control.addEventListener("click", function () {
        continuousMode = m[0];
        modeControls.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b.dataset.mode === continuousMode));
        });
        renderCharts();
      });
      modeControls.appendChild(control);
    });

    searchInput.addEventListener("input", function () {
      search = searchInput.value.trim().toLowerCase();
      renderTable();
    });
    resetButton.addEventListener("click", function () {
      selected = null; search = ""; searchInput.value = "";
      renderTable(); renderCharts();
    });

    function rowsForSetting() {
      return V.state.study.variables.map(function (v, i) {
        var c = V.characteristic(setting, v.name);
        return {
          index: i, name: v.name, label: v.label, type: v.type,
          all: c ? c.all : null, allBracket: c ? c.allBracket : null,
          exposure: c ? c.exposure : null, exposureBracket: c ? c.exposureBracket : null,
          reference: c ? c.noneExposure : null, referenceBracket: c ? c.noneExposureBracket : null,
          smd: c ? c.smd : null
        };
      });
    }

    function isSelected(row) {
      return selected === null ? true : selected.has(row.name);
    }

    function renderCharts() {
      var rows = rowsForSetting();
      var totals = V.characteristic(setting, "Total_n");
      var nExposure = totals ? totals.exposure : null;
      var nReference = totals ? totals.noneExposure : null;

      /* Categorical: the bracket columns hold the percentages. */
      var points = rows.filter(function (r) {
        return r.type === 1 && r.name !== "Total_n" && isSelected(r)
          && typeof r.exposureBracket === "number" && typeof r.referenceBracket === "number";
      }).map(function (r) {
        return {
          label: r.label, exposure: r.exposureBracket, reference: r.referenceBracket,
          smd: r.smd === null || r.smd === undefined ? null : Number(r.smd),
          band: band(r.smd)
        };
      });
      renderScatter(scatterMount, points);

      /* Continuous: pair each base measure's mean/median/min/max rows. */
      var byBase = {};
      rows.forEach(function (r) {
        if (r.type !== 0) return;
        var variant = variantOf(r.name);
        if (!variant) return;
        var base = baseOf(r.name);
        if (!byBase[base]) byBase[base] = { label: null, parts: {} };
        byBase[base].parts[variant] = r;
        if (variant === "mean" || (!byBase[base].label && variant === "median")) {
          byBase[base].label = r.label.replace(/,\s*(mean|median)\s*\([^)]*\)\s*[a-z]?$/i, "").trim();
        }
      });

      var continuousRows = Object.keys(byBase).map(function (base) {
        var record = byBase[base];
        var mean = record.parts.mean, median = record.parts.median;
        var anySelected = ["mean", "median", "min", "max"].some(function (v) {
          return record.parts[v] && isSelected(record.parts[v]);
        });
        if (!anySelected) return null;

        var out = { label: record.label || base, median: null, iqr: null,
          exposureMean: null, referenceMean: null, exposureCi: null, referenceCi: null,
          exposureBox: null, referenceBox: null };

        if (mean) {
          out.exposureMean = typeof mean.exposure === "number" ? mean.exposure : null;
          out.referenceMean = typeof mean.reference === "number" ? mean.reference : null;
          out.exposureCi = confidence(out.exposureMean, mean.exposureBracket, nExposure);
          out.referenceCi = confidence(out.referenceMean, mean.referenceBracket, nReference);
        }
        if (median) {
          out.median = typeof median.exposure === "number" ? median.exposure : null;
          var eq = parseRange(median.exposureBracket);
          var rq = parseRange(median.referenceBracket);
          out.iqr = eq;
          if (eq && typeof median.exposure === "number") {
            out.exposureBox = { median: median.exposure, q1: eq.low, q3: eq.high,
              min: numberOrNull(record.parts.min && record.parts.min.exposure),
              max: numberOrNull(record.parts.max && record.parts.max.exposure) };
          }
          if (rq && typeof median.reference === "number") {
            out.referenceBox = { median: median.reference, q1: rq.low, q3: rq.high,
              min: numberOrNull(record.parts.min && record.parts.min.reference),
              max: numberOrNull(record.parts.max && record.parts.max.reference) };
          }
        }
        return out;
      }).filter(Boolean);

      if (continuousMode === "ci") renderMeanCi(continuousMount, continuousRows);
      else renderBox(continuousMount, continuousRows);
    }

    function numberOrNull(v) { return typeof v === "number" ? v : null; }

    function confidence(mean, sd, n) {
      if (mean === null || typeof sd !== "number" || !n) return null;
      var half = 1.96 * sd / Math.sqrt(n);
      return { low: mean - half, high: mean + half };
    }

    function formatValue(value, bracket, type) {
      if (value === null || value === undefined) return "—";
      if (type === 1) {
        return V.n(value) + (typeof bracket === "number" ? " (" + V.d(bracket, 1) + "%)" : "");
      }
      if (typeof bracket === "number") return V.d(value, 2) + " (" + V.d(bracket, 2) + ")";
      if (typeof bracket === "string") return V.d(value, 1) + " (" + bracket + ")";
      return V.d(value, 2);
    }

    var COLUMNS = [
      { id: "label", label: "Characteristic" },
      { id: "all", label: "All", numeric: true },
      { id: "exposure", label: "Very high-risk", numeric: true },
      { id: "reference", label: "High-risk", numeric: true },
      { id: "smd", label: "ASMD", numeric: true }
    ];

    function renderTable() {
      V.clear(tableMount);
      var rows = rowsForSetting().filter(function (r) {
        if (r.name === "Total_n") return false;
        if (!search) return true;
        return (r.label || "").toLowerCase().indexOf(search) !== -1
          || (r.name || "").toLowerCase().indexOf(search) !== -1;
      });

      rows.sort(function (a, b) {
        var av, bv;
        if (sort.column === "label") { av = a.label || ""; bv = b.label || ""; return av.localeCompare(bv) * sort.direction; }
        if (sort.column === "no") return (a.index - b.index) * sort.direction;
        av = a[sort.column]; bv = b[sort.column];
        av = av === null || av === undefined || av === "" ? -Infinity : Number(av);
        bv = bv === null || bv === undefined || bv === "" ? -Infinity : Number(bv);
        if (isNaN(av)) av = -Infinity;
        if (isNaN(bv)) bv = -Infinity;
        return (av - bv) * sort.direction;
      });

      var node = V.el("table", "data-table viz-table");
      var thead = V.el("thead");
      var hr = V.el("tr");

      var selectAll = V.el("th");
      selectAll.scope = "col";
      var allBox = V.el("input");
      allBox.type = "checkbox";
      allBox.id = "char-select-all";
      allBox.checked = selected === null;
      allBox.indeterminate = selected !== null && selected.size > 0;
      allBox.setAttribute("aria-label", "Select all characteristics");
      allBox.addEventListener("change", function () {
        selected = allBox.checked ? null : new Set();
        renderTable(); renderCharts();
      });
      selectAll.appendChild(allBox);
      hr.appendChild(selectAll);

      COLUMNS.forEach(function (col) {
        var th = V.el("th");
        th.scope = "col";
        if (col.numeric) th.classList.add("is-numeric");
        var sorter = V.el("button", "viz-sort", col.label);
        sorter.type = "button";
        var active = sort.column === col.id;
        sorter.setAttribute("aria-label", "Sort by " + col.label);
        if (active) sorter.dataset.direction = sort.direction > 0 ? "asc" : "desc";
        th.setAttribute("aria-sort", active ? (sort.direction > 0 ? "ascending" : "descending") : "none");
        sorter.addEventListener("click", function () {
          if (sort.column === col.id) sort.direction *= -1;
          else { sort.column = col.id; sort.direction = 1; }
          renderTable();
        });
        th.appendChild(sorter);
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      node.appendChild(thead);

      var tbody = V.el("tbody");
      rows.forEach(function (r) {
        var tr = V.el("tr");
        if (isSelected(r) && selected !== null) tr.classList.add("is-selected");

        var pick = V.el("td");
        /* The checkbox sits inside a label that fills the cell, so the tap
           target is the whole cell rather than the 22px box. */
        var pickLabel = V.el("label", "viz-pick");
        var box = V.el("input");
        box.type = "checkbox";
        box.checked = isSelected(r);
        box.setAttribute("aria-label", "Include " + r.label + " in the figures");
        box.addEventListener("change", function () {
          if (selected === null) {
            selected = new Set(V.state.study.variables.map(function (v) { return v.name; }));
            selected.delete("Total_n");
          }
          if (box.checked) selected.add(r.name);
          else selected.delete(r.name);
          renderTable(); renderCharts();
        });
        pickLabel.appendChild(box);
        pick.appendChild(pickLabel);
        tr.appendChild(pick);

        var labelCell = V.el("th", "", r.label);
        labelCell.scope = "row";
        tr.appendChild(labelCell);

        [["all", "allBracket"], ["exposure", "exposureBracket"], ["reference", "referenceBracket"]].forEach(function (pair) {
          var td = V.el("td", "is-numeric", formatValue(r[pair[0]], r[pair[1]], r.type));
          tr.appendChild(td);
        });
        tr.appendChild(V.el("td", "is-numeric", r.smd === null || r.smd === undefined || r.smd === "" ? "—" : V.d(Math.abs(Number(r.smd)), 3)));
        tbody.appendChild(tr);
      });
      node.appendChild(tbody);
      tableMount.appendChild(V.scroller(node, "Baseline characteristics table"));

      var shown = selected === null ? rows.length : rows.filter(isSelected).length;
      V.clear(statusMount);
      statusMount.appendChild(V.el("span", "", shown + " of " + rows.length + " characteristics feed the figures above."));
    }

    exportButton.addEventListener("click", function () {
      var rows = rowsForSetting().filter(function (r) { return r.name !== "Total_n" && isSelected(r); });
      var headers = ["Characteristic", "VarName", "All", "All bracket", "Very high-risk", "Very high-risk bracket", "High-risk", "High-risk bracket", "ASMD"];
      var body = rows.map(function (r) {
        return [r.label, r.name, r.all, r.allBracket, r.exposure, r.exposureBracket, r.reference, r.referenceBracket, r.smd];
      });
      V.download("impresive-characteristics-" + V.key(setting) + ".csv", V.toCsv(headers, body));
    });

    function render() { renderTable(); renderCharts(); }

    return {
      render: render,
      setSetting: function (next) {
        setting = { period: next.period, age: next.age, sex: next.sex, hx: next.hx };
        render();
      }
    };
  }

  window.VIZ_CHARACTERISTICS = { init: init };
})();
