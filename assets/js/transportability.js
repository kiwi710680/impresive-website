(function () {
  "use strict";

  var root = document.querySelector("[data-transportability-results]");
  if (!root) return;

  function el(name, className, text) {
    var node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svg(name, attrs, text) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  fetch("assets/data/transportability.json")
    .then(function (response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
    .then(function (payload) {
      var comparisons = Object.keys(payload.comparisons);
      var active = comparisons[0];
      var controls = el("div", "explorer-controls");
      var chart = el("div", "transport-chart-shell");
      var tableMount = el("div", "table-scroll");
      var legend = el("div", "chart-legend");
      [["TW", "Taiwan NHIRD", "#2d9d38"], ["Transported", "Japan transported by Taiwan model", "#ed6a00"], ["JP", "Japan DeSC", "#1874b8"]].forEach(function (item) {
        var chip = el("span", "chart-legend-item", item[1]); chip.style.setProperty("--legend-color", item[2]); legend.appendChild(chip);
      });

      function x(value) {
        var min = Math.log(0.3), max = Math.log(3.2);
        return 215 + ((Math.log(value) - min) / (max - min)) * 680;
      }

      function render() {
        Array.from(controls.children).forEach(function (item) { item.setAttribute("aria-pressed", String(item.getAttribute("data-comparison") === active)); });
        clear(chart); clear(tableMount);
        var records = payload.comparisons[active];
        var outcomes = Object.keys(records);
        var view = svg("svg", { viewBox: "0 0 940 530", role: "img", "aria-label": active + " transportability forest plot" });
        view.appendChild(svg("title", {}, active + " transportability estimates"));
        var ticks = [0.3, 0.5, 1, 2, 3];
        ticks.forEach(function (tick) {
          var xpos = x(tick);
          view.appendChild(svg("line", { x1: xpos, x2: xpos, y1: 38, y2: 455, class: tick === 1 ? "forest-reference" : "chart-gridline" }));
          view.appendChild(svg("text", { x: xpos, y: 488, "text-anchor": "middle", class: "chart-axis-label" }, String(tick)));
        });
        outcomes.forEach(function (outcome, rowIndex) {
          var yBase = 70 + rowIndex * 66;
          view.appendChild(svg("text", { x: 195, y: yBase + 6, "text-anchor": "end", class: "forest-outcome-label" }, outcome));
          view.appendChild(svg("line", { x1: 205, x2: 910, y1: yBase + 28, y2: yBase + 28, class: "forest-row-line" }));
          [["TW", -12, "#2d9d38"], ["Transported", 0, "#ed6a00"], ["JP", 12, "#1874b8"]].forEach(function (series) {
            var estimate = records[outcome][series[0]];
            if (!estimate) return;
            var y = yBase + series[1];
            view.appendChild(svg("line", { x1: x(estimate[1]), x2: x(estimate[2]), y1: y, y2: y, stroke: series[2], "stroke-width": "4", "stroke-linecap": "round" }));
            var point = svg("circle", { cx: x(estimate[0]), cy: y, r: "6", fill: series[2] });
            point.appendChild(svg("title", {}, series[0] + " " + outcome + ": " + estimate[0] + " (" + estimate[1] + " to " + estimate[2] + ")"));
            view.appendChild(point);
          });
        });
        view.appendChild(svg("text", { x: 555, y: 520, "text-anchor": "middle", class: "forest-axis-title" }, "Relative risk (95% CI)"));
        chart.appendChild(view);

        var table = el("table", "research-table");
        var caption = el("caption", "", active + " forest-plot estimates"); table.appendChild(caption);
        var head = document.createElement("thead"); var hr = document.createElement("tr"); ["Outcome", "Estimate", "RR", "Lower", "Upper"].forEach(function (label) { hr.appendChild(el("th", "", label)); }); head.appendChild(hr); table.appendChild(head);
        var body = document.createElement("tbody");
        outcomes.forEach(function (outcome) {
          ["TW", "Transported", "JP"].forEach(function (series) {
            var estimate = records[outcome][series]; if (!estimate) return;
            var row = document.createElement("tr"); [outcome, series, estimate[0], estimate[1], estimate[2]].forEach(function (value) { row.appendChild(el("td", "", String(value))); }); body.appendChild(row);
          });
        });
        table.appendChild(body); tableMount.appendChild(table);
      }

      comparisons.forEach(function (comparison, index) {
        var control = el("button", "explorer-button", comparison); control.type = "button"; control.setAttribute("data-comparison", comparison); control.setAttribute("aria-pressed", String(index === 0));
        control.addEventListener("click", function () { active = comparison; render(); }); controls.appendChild(control);
      });
      root.appendChild(controls);
      root.appendChild(chart);
      root.appendChild(legend);
      var details = document.createElement("details"); details.className = "figure-table"; details.appendChild(el("summary", "", "View data table")); details.appendChild(tableMount); root.appendChild(details);
      var sourceParts = [
        "Data status: " + (payload.status || "not stated"),
        payload.source && payload.source.title,
        payload.source && payload.source.source_method,
        payload.source && payload.source.note
      ].filter(Boolean);
      root.appendChild(el("p", "source-note", sourceParts.join(" · ")));
      render();
      document.dispatchEvent(new CustomEvent("impresive:content-ready"));
    })
    .catch(function (error) {
      root.textContent = "The transportability data could not be loaded. Use a local web server and try again. " + error.message;
      root.classList.add("chart-error");
    });
})();
