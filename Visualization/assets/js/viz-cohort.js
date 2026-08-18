/* Module 1 — Study cohort.
   Cohort flow diagram from Table1, then a composition explorer that crosses a
   chosen main variable with an optional subgroup filter and renders the
   composition, the age-decade distribution, and the calendar-year distribution. */
(function () {
  "use strict";

  var V = window.VIZ;

  var AGE_BANDS = [
    ["age0to9", "0–9"], ["age10to19", "10–19"], ["age20to29", "20–29"],
    ["age30to39", "30–39"], ["age40to49", "40–49"], ["age50to59", "50–59"],
    ["age60to69", "60–69"], ["age70to79", "70–79"], ["age80to89", "80–89"],
    ["age90to99", "90–99"], ["age100up", "100+"]
  ];

  var YEARS = ["2015", "2016", "2017", "2018", "2019", "2020", "2021"];

  /* The four things a user can put on the main axis. Each resolves to a list
     of series, and every series knows how to read its own count for a given
     analysis setting. */
  var MAIN_VARIABLES = {
    risk: {
      label: "Very high-risk or high risk group",
      series: function () {
        return [
          { id: "exposure", label: "Very high-risk group", color: V.COLORS.exposure, read: function (c) { return c ? c.exposure : null; } },
          { id: "reference", label: "High-risk group", color: V.COLORS.reference, read: function (c) { return c ? c.noneExposure : null; } }
        ];
      }
    },
    sex: {
      label: "Sex",
      series: function () {
        return [
          { id: "female", label: "Female", color: V.COLORS.reference, sexKey: 2 },
          { id: "male", label: "Male", color: V.COLORS.exposure, sexKey: 1 }
        ];
      }
    },
    age: {
      label: "Age Groups",
      series: function () {
        return [
          { id: "a1", label: "0–39", color: "#7fb4e6", ageKey: 1 },
          { id: "a2", label: "39–64", color: V.COLORS.exposure, ageKey: 2 },
          { id: "a3", label: "65+", color: "#073763", ageKey: 3 }
        ];
      }
    },
    hx: {
      label: "History of ASCVD",
      series: function () {
        return [
          { id: "h1", label: "With history of ASCVD", color: V.COLORS.exposure, hxKey: 1 },
          { id: "h2", label: "Without history of ASCVD", color: V.COLORS.reference, hxKey: 2 }
        ];
      }
    }
  };

  /* Reading a count means picking the right analysis setting and the right
     column. A sex/age/history series shifts the setting key; a risk series
     shifts the column. Combining a main variable with a subgroup filter is
     therefore just composing those two moves. */
  function readCount(base, series, subSeries, varName) {
    var setting = { period: base.period, age: base.age, sex: base.sex, hx: base.hx };
    var column = null;

    [series, subSeries].forEach(function (s) {
      if (!s) return;
      if (s.sexKey !== undefined) setting.sex = s.sexKey;
      if (s.ageKey !== undefined) setting.age = s.ageKey;
      if (s.hxKey !== undefined) setting.hx = s.hxKey;
      if (s.read) column = s.read;
    });

    var c = V.characteristic(setting, varName);
    if (!c) return null;
    return column ? column(c) : c.all;
  }

  function combinedSeries(mainKey, subKey) {
    var main = MAIN_VARIABLES[mainKey].series();
    if (!subKey) return main.map(function (s) { return { label: s.label, color: s.color, parts: [s] }; });
    var sub = MAIN_VARIABLES[subKey].series();
    var out = [];
    main.forEach(function (m, mi) {
      sub.forEach(function (s, si) {
        out.push({
          label: m.label + " - " + s.label.toLowerCase(),
          color: shade(m.color, si / Math.max(1, sub.length - 1)),
          parts: [m, s],
          groupIndex: mi
        });
      });
    });
    return out;
  }

  /* Lighten a series colour so a subgroup reads as a variation of its parent
     rather than an unrelated hue. */
  function shade(hex, t) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var mix = function (c) { return Math.round(c + (255 - c) * t * 0.62); };
    return "#" + [mix(r), mix(g), mix(b)].map(function (c) { return c.toString(16).padStart(2, "0"); }).join("");
  }

  /* ------------------------------------------------------------ flow chart */

  function renderFlow(mount, period) {
    V.clear(mount);
    var rows = V.state.study.cohortFlow[String(period)];
    if (!rows) return;
    var by = {};
    rows.forEach(function (r) { by[r.name] = r; });

    function node(record, className) {
      var box = V.el("div", "flow-node " + (className || ""));
      box.appendChild(V.el("strong", "", record.label));
      box.appendChild(V.el("span", "flow-node__n", "n = " + V.n(record.n)));
      return box;
    }

    /* One centred spine. Every step is a full-width child of the same grid so
       the vertical connectors, the exclusion branch, and the terminal split
       all line up on the same axis. */
    var wrap = V.el("div", "cohort-flow");

    var inc = V.el("div", "cohort-flow__step");
    inc.appendChild(node(by.include_all, "flow-node--include"));
    wrap.appendChild(inc);
    wrap.appendChild(V.el("div", "flow-link"));

    var excludeBox = V.el("div", "flow-node flow-node--exclude");
    excludeBox.appendChild(V.el("strong", "", by.exclude_all.label));
    excludeBox.appendChild(V.el("span", "flow-node__n", "n = " + V.n(by.exclude_all.n)));
    var list = V.el("ul", "flow-exclusions");
    ["exclude1", "exclude2", "exclude3"].forEach(function (id) {
      if (!by[id]) return;
      var li = V.el("li", "", by[id].label + " (n = " + V.n(by[id].n) + ")");
      if (id === "exclude3") {
        var sub = V.el("ul");
        ["exclude3_1", "exclude3_2"].forEach(function (s) {
          if (by[s]) sub.appendChild(V.el("li", "", by[s].label + " (n = " + V.n(by[s].n) + ")"));
        });
        li.appendChild(sub);
      }
      list.appendChild(li);
    });
    excludeBox.appendChild(list);

    /* The spine runs straight through this row; the exclusion box hangs off it
       to the right on a horizontal connector. */
    var branch = V.el("div", "flow-branch");
    branch.appendChild(V.el("span", "flow-branch__connector"));
    var branchBox = V.el("div", "flow-branch__box");
    branchBox.appendChild(V.el("span", "flow-branch__label", "Excluded from the cohort"));
    branchBox.appendChild(excludeBox);
    branch.appendChild(branchBox);
    wrap.appendChild(branch);

    wrap.appendChild(V.el("div", "flow-link"));

    var target = V.el("div", "cohort-flow__step");
    target.appendChild(node(by.targed_all, "flow-node--target"));
    wrap.appendChild(target);

    /* The split draws its own T: a stub down from the spine, a horizontal bar
       between the two column centres, and a drop into each box. */
    var split = V.el("div", "flow-split");
    split.appendChild(node(by.targed_exposure1, "flow-node--exposure"));
    split.appendChild(node(by.targed_exposure2, "flow-node--reference"));
    wrap.appendChild(split);

    mount.appendChild(wrap);
  }

  /* ----------------------------------------------------------------- pie */

  function renderPie(mount, series, values, title) {
    V.clear(mount);
    var total = values.reduce(function (a, b) { return a + (b || 0); }, 0);
    if (!total) {
      mount.appendChild(V.el("p", "viz-empty", "No counts are reported for this combination."));
      return;
    }
    var size = 320, r = 118, cx = size / 2, cy = size / 2;
    var node = V.svg("svg", { viewBox: "0 0 " + size + " " + size, class: "viz-chart viz-chart--pie", role: "img", "aria-label": title });
    var tip = V.tooltip(mount);
    var marks = [];
    var angle = -Math.PI / 2;

    values.forEach(function (value, i) {
      if (!value) return;
      var frac = value / total;
      var end = angle + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      var x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      var path = V.svg("path", {
        d: "M " + cx + " " + cy + " L " + x1 + " " + y1 + " A " + r + " " + r + " 0 " + large + " 1 " + x2 + " " + y2 + " Z",
        fill: series[i].color, class: "viz-slice"
      });
      node.appendChild(path);

      var mid = (angle + end) / 2;
      if (frac > 0.055) {
        var lr = r * 0.62;
        var label = V.svg("text", {
          x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid),
          "text-anchor": "middle", class: "viz-slice-label"
        }, V.n(value));
        node.appendChild(label);
        node.appendChild(V.svg("text", {
          x: cx + lr * Math.cos(mid), y: cy + lr * Math.sin(mid) + 15,
          "text-anchor": "middle", class: "viz-slice-label viz-slice-label--pct"
        }, "(" + (frac * 100).toFixed(1) + "%)"));
      }
      marks.push({ node: path, label: series[i].label + ": " + V.n(value) + " (" + (frac * 100).toFixed(1) + "%)" });
      angle = end;
    });

    mount.insertBefore(node, tip.node);
    V.makeNavigable(node, marks, tip);
    mount.appendChild(legend(series));
  }

  function legend(series) {
    var box = V.el("div", "viz-legend");
    series.forEach(function (s) {
      var item = V.el("span", "viz-legend__item", s.label);
      item.style.setProperty("--legend-color", s.color);
      box.appendChild(item);
    });
    return box;
  }

  /* -------------------------------------------------------- stacked bars */

  function renderStacked(mount, series, categories, matrix, title, axisLabel) {
    V.clear(mount);
    var max = 0;
    matrix.forEach(function (column) {
      var sum = column.reduce(function (a, b) { return a + (b || 0); }, 0);
      if (sum > max) max = sum;
    });
    if (!max) {
      mount.appendChild(V.el("p", "viz-empty", "No counts are reported for this combination."));
      return;
    }
    /* Axis maximum comes from the data with headroom, never a hardcoded cap. */
    var ceiling = niceCeiling(max);

    var width = 820, height = 340, left = 66, right = 800, top = 24, bottom = 274;
    var node = V.svg("svg", { viewBox: "0 0 " + width + " " + height, class: "viz-chart", role: "img", "aria-label": title });
    var tip = V.tooltip(mount);
    var marks = [];

    var ticks = 5;
    for (var t = 0; t <= ticks; t += 1) {
      var value = (ceiling / ticks) * t;
      var y = bottom - (value / ceiling) * (bottom - top);
      node.appendChild(V.svg("line", { x1: left, x2: right, y1: y, y2: y, class: "viz-gridline" }));
      node.appendChild(V.svg("text", { x: left - 10, y: y + 4, "text-anchor": "end", class: "viz-axis-label" }, formatAxis(value)));
    }
    node.appendChild(V.svg("text", {
      x: 14, y: (top + bottom) / 2, class: "viz-axis-title",
      transform: "rotate(-90 14 " + ((top + bottom) / 2) + ")", "text-anchor": "middle"
    }, axisLabel || "Patients"));

    var slot = (right - left) / categories.length;
    var barWidth = Math.min(46, slot * 0.62);

    categories.forEach(function (category, ci) {
      var x = left + slot * ci + slot / 2 - barWidth / 2;
      var stackTop = bottom;
      series.forEach(function (s, si) {
        var value = matrix[ci][si] || 0;
        if (!value) return;
        var h = (value / ceiling) * (bottom - top);
        stackTop -= h;
        var rect = V.svg("rect", { x: x, y: stackTop, width: barWidth, height: h, fill: s.color, class: "viz-bar" });
        node.appendChild(rect);
        marks.push({ node: rect, label: category + " · " + s.label + ": " + V.n(value) });
      });
      node.appendChild(V.svg("text", { x: x + barWidth / 2, y: bottom + 20, "text-anchor": "middle", class: "viz-axis-label" }, category));
    });

    node.appendChild(V.svg("line", { x1: left, x2: right, y1: bottom, y2: bottom, class: "viz-axis-line" }));
    mount.insertBefore(node, tip.node);
    V.makeNavigable(node, marks, tip);
    mount.appendChild(legend(series));
  }

  function niceCeiling(max) {
    var magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    var scaled = max / magnitude;
    var step = scaled <= 1.2 ? 1.2 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
    return step * magnitude;
  }

  function formatAxis(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return Math.round(value / 1000) + "k";
    return String(Math.round(value));
  }

  /* ------------------------------------------------------------- module */

  function init(root) {
    var setting = { period: 0, age: 0, sex: 0, hx: 0 };
    var mainKey = "risk";
    var subKey = null;

    var flowMount = root.querySelector("[data-cohort-flow]");
    var mainControls = root.querySelector("[data-cohort-main]");
    var subControls = root.querySelector("[data-cohort-sub]");
    var pieMount = root.querySelector("[data-cohort-pie]");
    var ageMount = root.querySelector("[data-cohort-age]");
    var yearMount = root.querySelector("[data-cohort-year]");
    var titleMount = root.querySelector("[data-cohort-title]");
    var flowExport = root.querySelector("[data-cohort-export]");

    if (flowExport) {
      flowExport.addEventListener("click", function () {
        var rows = V.state.study.cohortFlow[String(setting.period)] || [];
        V.download("impresive-ascvd-cohort-flow-" + setting.period + ".csv",
          V.toCsv(["Step", "Label", "N"], rows.map(function (row) {
            return [row.name, row.label, row.n];
          })));
      });
    }

    Object.keys(MAIN_VARIABLES).forEach(function (id) {
      var control = V.button(MAIN_VARIABLES[id].label, id === mainKey);
      control.addEventListener("click", function () {
        mainKey = id;
        if (subKey === mainKey) subKey = null;
        syncControls();
        render();
      });
      control.dataset.mainKey = id;
      mainControls.appendChild(control);
    });

    Object.keys(MAIN_VARIABLES).forEach(function (id) {
      if (id === "risk") return;   /* risk is the primary axis, not a filter */
      var control = V.button(MAIN_VARIABLES[id].label, false, "explorer-button--sub");
      control.addEventListener("click", function () {
        subKey = subKey === id ? null : id;
        syncControls();
        render();
      });
      control.dataset.subKey = id;
      subControls.appendChild(control);
    });

    function syncControls() {
      mainControls.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.mainKey === mainKey));
      });
      subControls.querySelectorAll("button").forEach(function (b) {
        var disabled = b.dataset.subKey === mainKey;
        b.disabled = disabled;
        b.setAttribute("aria-pressed", String(!disabled && b.dataset.subKey === subKey));
      });
    }

    function render() {
      renderFlow(flowMount, setting.period);
      var series = combinedSeries(mainKey, subKey);
      var name = MAIN_VARIABLES[mainKey].label + (subKey ? " & " + MAIN_VARIABLES[subKey].label : "");
      titleMount.textContent = "Distribution of " + name;

      /* Composition uses Total_n so the slices are patient counts, not a
         proportion of some other denominator. */
      var totals = series.map(function (s) {
        return readCount(setting, s.parts[0], s.parts[1], "Total_n");
      });
      renderPie(pieMount, series, totals, "Distribution of " + name);

      var ageMatrix = AGE_BANDS.map(function (band) {
        return series.map(function (s) { return readCount(setting, s.parts[0], s.parts[1], band[0]); });
      });
      renderStacked(ageMount, series, AGE_BANDS.map(function (b) { return b[1]; }), ageMatrix,
        "Distribution of " + name + " by decade of age", "Patients");

      var yearMatrix = YEARS.map(function (year) {
        return series.map(function (s) { return readCount(setting, s.parts[0], s.parts[1], "index_year_" + year); });
      });
      renderStacked(yearMount, series, YEARS, yearMatrix,
        "Distribution of " + name + " by calendar year", "Patients");
    }

    syncControls();

    return {
      render: render,
      setPeriod: function (period) { setting.period = period; render(); }
    };
  }

  window.VIZ_COHORT = { init: init };
})();
