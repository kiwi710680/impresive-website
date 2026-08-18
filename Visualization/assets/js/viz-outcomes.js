/* Modules 3 and 4 — Event rates and Risk estimate.
   Both are driven by the same construct: a list of analyses (a fixed main
   analysis plus any number of user-defined subgroups) crossed with a list of
   selected outcomes. Event rates render as tables, risk estimates as a
   forest plot. */
(function () {
  "use strict";

  var V = window.VIZ;

  var ESTIMATORS = [
    { id: "HR", label: "Hazard ratio (default)", point: "HR", low: "HR_low", high: "HR_up" },
    { id: "HR_FG", label: "Fine & Gray subdistribution hazard ratio", point: "HR_FG", low: "HR_FG_low", high: "HR_FG_up" },
    { id: "IRR", label: "Incidence rate ratio", point: "IRR", low: "IRR_low", high: "IRR_up" }
  ];

  /* ------------------------------------------------- analysis row builder */

  /* Builds the "Main analysis + subgroup 1..n" control block shared by both
     modules. Each row edits age / sex / history; the main analysis row is
     fixed at "All" so there is always a reference analysis on screen. */
  function analysisBuilder(mount, dims, onChange) {
    var analyses = [{ id: "main", label: "Main analysis (default)", age: 0, sex: 0, hx: 0, fixed: true }];
    var nextId = 1;

    function selectFor(record, field, options, label) {
      var wrap = V.el("label", "explorer-field");
      wrap.appendChild(V.el("span", "", label));
      var select = document.createElement("select");
      Object.keys(options).forEach(function (value) {
        var option = V.el("option", "", options[value]);
        option.value = value;
        select.appendChild(option);
      });
      select.value = String(record[field]);
      select.disabled = Boolean(record.fixed);
      select.addEventListener("change", function () {
        record[field] = Number(select.value);
        onChange(analyses);
      });
      wrap.appendChild(select);
      return wrap;
    }

    function render() {
      V.clear(mount);
      analyses.forEach(function (record, index) {
        var row = V.el("div", "analysis-row" + (record.fixed ? " analysis-row--main" : ""));
        row.appendChild(V.el("span", "analysis-row__label", record.fixed ? record.label : "Subgroup analysis " + index));
        var fields = V.el("div", "analysis-row__fields");
        fields.appendChild(selectFor(record, "age", dims.age_group, "Age"));
        fields.appendChild(selectFor(record, "sex", dims.sex, "Sex"));
        fields.appendChild(selectFor(record, "hx", dims.hx_ASCVD, "History of ASCVD"));
        row.appendChild(fields);
        if (!record.fixed) {
          var remove = V.el("button", "analysis-remove", "×");
          remove.type = "button";
          remove.setAttribute("aria-label", "Remove subgroup analysis " + index);
          remove.addEventListener("click", function () {
            analyses = analyses.filter(function (a) { return a !== record; });
            render();
            onChange(analyses);
          });
          row.appendChild(remove);
        }
        mount.appendChild(row);
      });
    }

    return {
      render: render,
      get: function () { return analyses; },
      add: function () {
        analyses.push({ id: "sg" + nextId++, age: 0, sex: 0, hx: 0 });
        render();
        onChange(analyses);
      }
    };
  }

  /* Multi-select outcome chips. */
  function outcomePicker(mount, outcomes, initial, onChange) {
    var selected = new Set(initial);
    function render() {
      V.clear(mount);
      outcomes.forEach(function (o) {
        var chip = V.button(o.label + (o.primary ? " ★" : ""), selected.has(o.name), "outcome-chip");
        chip.addEventListener("click", function () {
          if (selected.has(o.name)) {
            if (selected.size === 1) return;   /* never leave the view empty */
            selected.delete(o.name);
          } else selected.add(o.name);
          render();
          onChange(Array.from(selected));
        });
        mount.appendChild(chip);
      });
    }
    render();
    return { get: function () { return Array.from(selected); } };
  }

  function analysisLabel(record, dims, index) {
    if (record.fixed) return "Main analysis (default)";
    return "Subgroup analysis " + index;
  }

  function analysisDescription(record, dims) {
    return "Age: " + dims.age_group[record.age] +
      " | Sex: " + dims.sex[record.sex] +
      " | History: " + dims.hx_ASCVD[record.hx];
  }

  /* ------------------------------------------------------- module 3: rates */

  function initEventRates(root) {
    var period = 0;
    var dims = V.state.study.dimensions;
    var outcomes = V.state.study.outcomes;
    var selectedOutcomes = outcomes.filter(function (o) { return o.primary; }).map(function (o) { return o.name; });
    if (!selectedOutcomes.length) selectedOutcomes = [outcomes[0].name];

    var pickerMount = root.querySelector("[data-rates-outcomes]");
    var builderMount = root.querySelector("[data-rates-analyses]");
    var addButton = root.querySelector("[data-rates-add]");
    var resultMount = root.querySelector("[data-rates-result]");
    var exportButton = root.querySelector("[data-rates-export]");

    var picker = outcomePicker(pickerMount, outcomes, selectedOutcomes, function (next) {
      selectedOutcomes = next;
      render();
    });
    var builder = analysisBuilder(builderMount, dims, function () { render(); });
    builder.render();
    addButton.addEventListener("click", function () { builder.add(); });

    function rowsFor(outcomeName) {
      return builder.get().map(function (record, index) {
        var setting = { period: period, age: record.age, sex: record.sex, hx: record.hx };
        var data = V.outcome(setting, outcomeName);
        return { record: record, index: index, data: data };
      });
    }

    function render() {
      V.clear(resultMount);
      selectedOutcomes.forEach(function (name, i) {
        var outcome = outcomes.filter(function (o) { return o.name === name; })[0];
        if (!outcome) return;
        var details = V.el("details", "outcome-panel");
        details.open = i === 0;
        var summary = V.el("summary");
        summary.appendChild(V.el("strong", "", outcome.label));
        if (outcome.primary) summary.appendChild(V.el("span", "outcome-primary", "Primary outcome"));
        details.appendChild(summary);

        var headers = [
          "Analysis", { label: "Patients", numeric: true }, { label: "Events", numeric: true },
          { label: "Events (%)", numeric: true }, { label: "Mean follow-up (years)", numeric: true },
          { label: "IR per 100 PY (95% CI)", numeric: true }
        ];
        var body = [];
        rowsFor(name).forEach(function (row) {
          var d = row.data;
          var label = analysisLabel(row.record, dims, row.index) + " — " + analysisDescription(row.record, dims);
          if (!d) {
            body.push([label + " · Very high-risk", "—", "—", "—", "—", "—"]);
            return;
          }
          body.push([
            label + " · Very high-risk group",
            V.n(d.exposure_patient_number), V.n(d.exposure_event_n),
            d.exposure_patient_number ? V.pct(d.exposure_event_n / d.exposure_patient_number * 100) : "—",
            V.d(d.exposure_fu_years, 2),
            V.ci(d.exposure_IR, d.exposure_IR_low, d.exposure_IR_up)
          ]);
          body.push([
            label + " · High-risk group",
            V.n(d.none_exposure_patient_number), V.n(d.none_exposure_event_n),
            d.none_exposure_patient_number ? V.pct(d.none_exposure_event_n / d.none_exposure_patient_number * 100) : "—",
            V.d(d.none_exposure_fu_years, 2),
            V.ci(d.none_exposure_IR, d.none_exposure_IR_low, d.none_exposure_IR_up)
          ]);
        });
        details.appendChild(V.scroller(V.table(headers, body), outcome.label + " event rates"));
        resultMount.appendChild(details);
      });

      if (!selectedOutcomes.length) {
        resultMount.appendChild(V.el("p", "viz-empty", "Select at least one outcome."));
      }
    }

    exportButton.addEventListener("click", function () {
      var headers = ["Outcome", "Analysis", "Age", "Sex", "History", "Group", "Patients", "Events", "Mean follow-up (years)", "IR per 100 PY", "IR lower", "IR upper"];
      var body = [];
      selectedOutcomes.forEach(function (name) {
        var outcome = outcomes.filter(function (o) { return o.name === name; })[0];
        rowsFor(name).forEach(function (row) {
          var d = row.data;
          if (!d) return;
          var common = [outcome.label, analysisLabel(row.record, dims, row.index),
            dims.age_group[row.record.age], dims.sex[row.record.sex], dims.hx_ASCVD[row.record.hx]];
          body.push(common.concat(["Very high-risk", d.exposure_patient_number, d.exposure_event_n, d.exposure_fu_years, d.exposure_IR, d.exposure_IR_low, d.exposure_IR_up]));
          body.push(common.concat(["High-risk", d.none_exposure_patient_number, d.none_exposure_event_n, d.none_exposure_fu_years, d.none_exposure_IR, d.none_exposure_IR_low, d.none_exposure_IR_up]));
        });
      });
      V.download("impresive-event-rates.csv", V.toCsv(headers, body));
    });

    render();
    return { render: render, setPeriod: function (p) { period = p; render(); } };
  }

  /* ------------------------------------------------- module 4: risk forest */

  function initRiskEstimate(root) {
    var period = 0;
    var dims = V.state.study.dimensions;
    var outcomes = V.state.study.outcomes;
    var selectedOutcomes = outcomes.filter(function (o) { return o.primary; }).map(function (o) { return o.name; });
    if (!selectedOutcomes.length) selectedOutcomes = [outcomes[0].name];
    var estimator = ESTIMATORS[0];

    var pickerMount = root.querySelector("[data-risk-outcomes]");
    var estimatorSelect = root.querySelector("[data-risk-estimator]");
    var builderMount = root.querySelector("[data-risk-analyses]");
    var addButton = root.querySelector("[data-risk-add]");
    var chartMount = root.querySelector("[data-risk-chart]");
    var tableMount = root.querySelector("[data-risk-table]");
    var exportButton = root.querySelector("[data-risk-export]");

    ESTIMATORS.forEach(function (e) {
      var option = V.el("option", "", e.label);
      option.value = e.id;
      estimatorSelect.appendChild(option);
    });
    estimatorSelect.addEventListener("change", function () {
      estimator = ESTIMATORS.filter(function (e) { return e.id === estimatorSelect.value; })[0] || ESTIMATORS[0];
      render();
    });

    outcomePicker(pickerMount, outcomes, selectedOutcomes, function (next) {
      selectedOutcomes = next;
      render();
    });
    var builder = analysisBuilder(builderMount, dims, function () { render(); });
    builder.render();
    addButton.addEventListener("click", function () { builder.add(); });

    function collect() {
      var rows = [];
      selectedOutcomes.forEach(function (name) {
        var outcome = outcomes.filter(function (o) { return o.name === name; })[0];
        if (!outcome) return;
        builder.get().forEach(function (record, index) {
          var setting = { period: period, age: record.age, sex: record.sex, hx: record.hx };
          var d = V.outcome(setting, name);
          rows.push({
            outcome: outcome,
            analysis: analysisLabel(record, dims, index),
            description: analysisDescription(record, dims),
            point: d ? d[estimator.point] : null,
            low: d ? d[estimator.low] : null,
            high: d ? d[estimator.high] : null
          });
        });
      });
      return rows;
    }

    function render() {
      var rows = collect();
      V.clear(chartMount);
      V.clear(tableMount);

      var usable = rows.filter(function (r) { return typeof r.point === "number"; });
      if (!usable.length) {
        chartMount.appendChild(V.el("p", "viz-empty", "The workbook does not report " + estimator.label.toLowerCase() + " for this combination."));
        return;
      }

      /* Log axis: ratio scales are multiplicative, so 0.5 and 2 should sit
         the same distance from the reference line. Bounds come from the data. */
      var lo = Infinity, hi = -Infinity;
      usable.forEach(function (r) {
        lo = Math.min(lo, r.low !== null && r.low !== undefined ? r.low : r.point);
        hi = Math.max(hi, r.high !== null && r.high !== undefined ? r.high : r.point);
      });
      lo = Math.min(lo, 0.9); hi = Math.max(hi, 1.1);
      var logLo = Math.log(lo) - 0.12, logHi = Math.log(hi) + 0.12;

      var rowHeight = 62;
      var width = 960, left = 372, right = 910, top = 46;
      var height = top + rows.length * rowHeight + 52;
      var x = function (v) { return left + ((Math.log(v) - logLo) / (logHi - logLo)) * (right - left); };

      var node = V.svg("svg", { viewBox: "0 0 " + width + " " + height, class: "viz-chart viz-chart--forest",
        role: "img", "aria-label": "Forest plot of " + estimator.label + " by outcome and analysis" });
      var tip = V.tooltip(chartMount);
      var marks = [];

      ticksFor(lo, hi).forEach(function (tick) {
        if (tick < Math.exp(logLo) || tick > Math.exp(logHi)) return;
        node.appendChild(V.svg("line", { x1: x(tick), x2: x(tick), y1: top - 20, y2: height - 40,
          class: tick === 1 ? "viz-reference" : "viz-gridline" }));
        node.appendChild(V.svg("text", { x: x(tick), y: height - 20, "text-anchor": "middle", class: "viz-axis-label" },
          tick < 1 ? String(tick) : String(tick)));
      });
      node.appendChild(V.svg("text", { x: x(1), y: top - 26, "text-anchor": "middle", class: "viz-annotation" }, "No difference"));

      rows.forEach(function (r, i) {
        var y = top + i * rowHeight + 16;
        var l1 = V.svg("text", { x: left - 18, y: y - 4, "text-anchor": "end", class: "viz-row-label" },
          r.outcome.label + " | " + r.analysis);
        node.appendChild(l1);
        node.appendChild(V.svg("text", { x: left - 18, y: y + 13, "text-anchor": "end", class: "viz-row-sublabel" }, r.description));
        node.appendChild(V.svg("text", { x: left - 18, y: y + 29, "text-anchor": "end", class: "viz-row-sublabel" },
          estimator.label.replace(" (default)", "") + ": " + V.ci(r.point, r.low, r.high)));

        if (typeof r.point !== "number") {
          node.appendChild(V.svg("text", { x: left + 8, y: y + 6, class: "viz-row-sublabel" }, "Not reported"));
          return;
        }
        if (typeof r.low === "number" && typeof r.high === "number") {
          node.appendChild(V.svg("line", { x1: x(r.low), x2: x(r.high), y1: y, y2: y, class: "viz-interval", stroke: V.COLORS.exposure }));
          node.appendChild(V.svg("line", { x1: x(r.low), x2: x(r.low), y1: y - 6, y2: y + 6, class: "viz-interval-cap", stroke: V.COLORS.exposure }));
          node.appendChild(V.svg("line", { x1: x(r.high), x2: x(r.high), y1: y - 6, y2: y + 6, class: "viz-interval-cap", stroke: V.COLORS.exposure }));
        }
        var dot = V.svg("circle", { cx: x(r.point), cy: y, r: 7, fill: V.COLORS.exposure, class: "viz-point" });
        node.appendChild(dot);
        marks.push({ node: dot, label: r.outcome.label + " · " + r.analysis + " — " + estimator.label.replace(" (default)", "") + " " + V.ci(r.point, r.low, r.high) });
      });

      node.appendChild(V.svg("text", { x: (left + right) / 2, y: height - 4, "text-anchor": "middle", class: "viz-axis-title" },
        estimator.label.replace(" (default)", "") + " (log scale)"));

      chartMount.insertBefore(node, tip.node);
      V.makeNavigable(node, marks, tip);

      var headers = ["Outcome", "Analysis", { label: "Estimate (95% CI)", numeric: true }];
      tableMount.appendChild(V.scroller(V.table(headers, rows.map(function (r) {
        return [r.outcome.label, r.analysis + " — " + r.description, V.ci(r.point, r.low, r.high)];
      })), "Risk estimate table"));
    }

    function ticksFor(lo, hi) {
      var candidates = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
      return candidates.filter(function (c) { return c >= lo * 0.85 && c <= hi * 1.15; });
    }

    exportButton.addEventListener("click", function () {
      var headers = ["Outcome", "Analysis", "Estimator", "Estimate", "Lower 95% CI", "Upper 95% CI"];
      var body = collect().map(function (r) {
        return [r.outcome.label, r.analysis + " — " + r.description, estimator.label, r.point, r.low, r.high];
      });
      V.download("impresive-risk-estimates.csv", V.toCsv(headers, body));
    });

    render();
    return { render: render, setPeriod: function (p) { period = p; render(); } };
  }

  window.VIZ_OUTCOMES = { initEventRates: initEventRates, initRiskEstimate: initRiskEstimate };
})();
