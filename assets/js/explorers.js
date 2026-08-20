(function () {
  "use strict";

  var DATA_URL = "assets/data/expansion-0812.json";

  function el(name, className, text) {
    var node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function number(value) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function csvCell(value) {
    var text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function downloadCsv(filename, headers, rows) {
    var csv = [headers.map(csvCell).join(",")]
      .concat(rows.map(function (row) { return row.map(csvCell).join(","); }))
      .join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function button(label, selected) {
    var node = el("button", "explorer-button", label);
    node.type = "button";
    node.setAttribute("aria-pressed", String(Boolean(selected)));
    return node;
  }


  var COUNTRY_FLAG_ASSETS = {
    Taiwan: "assets/img/taiwan.png",
    "South Korea": "assets/img/south-korea.png",
    Japan: "assets/img/japan.png",
    "Hong Kong": "assets/img/Hong Kong.png"
  };

  function countryFlag(country, className, decorative) {
    var image = el("img", className || "country-flag");
    image.src = COUNTRY_FLAG_ASSETS[country] || "assets/favicon.svg";
    image.alt = decorative ? "" : country + " flag";
    if (decorative) image.setAttribute("aria-hidden", "true");
    image.width = 40;
    image.height = 40;
    return image;
  }

  function dataTable(headers, rows) {
    var table = el("table", "data-table");
    var thead = el("thead");
    var heading = el("tr");
    headers.forEach(function (header) { var th = el("th", "", header); th.scope = "col"; heading.appendChild(th); });
    thead.appendChild(heading); table.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (value, index) { var cell = el(index === 0 ? "th" : "td", "", value); if (index === 0) cell.scope = "row"; tr.appendChild(cell); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function createChartTooltip(container) {
    var tooltip = el("div", "chart-tooltip");
    tooltip.hidden = true;
    container.appendChild(tooltip);
    return tooltip;
  }

  function bindChartTooltip(target, tooltip, container, label) {
    target.setAttribute("tabindex", "0");
    target.setAttribute("role", "img");
    target.setAttribute("aria-label", label);
    function show() {
      tooltip.textContent = label;
      tooltip.hidden = false;
      var targetBox = target.getBoundingClientRect();
      var containerBox = container.getBoundingClientRect();
      tooltip.style.left = Math.max(8, Math.min(containerBox.width - tooltip.offsetWidth - 8, targetBox.left - containerBox.left + targetBox.width / 2 - tooltip.offsetWidth / 2)) + "px";
      tooltip.style.top = Math.max(8, targetBox.top - containerBox.top - tooltip.offsetHeight - 10) + "px";
    }
    function hide() { tooltip.hidden = true; }
    target.addEventListener("mouseenter", show);
    target.addEventListener("mouseleave", hide);
    target.addEventListener("focus", show);
    target.addEventListener("blur", hide);
  }

  function setError(root, message) {
    clear(root);
    root.appendChild(el("p", "chart-error", message));
  }

  function initCohorts(payload) {
    document.querySelectorAll("[data-cohort-summary]").forEach(function (root) {
      var requested = root.getAttribute("data-cohort-summary");
      var keys = requested === "ADPN" ? ["AD", "PN"] : [requested];
      var active = keys[0];
      var controls = el("div", "explorer-controls");
      var output = el("div", "cohort-summary-grid");

      function render() {
        clear(output);
        (payload.cohorts[active] || []).forEach(function (row) {
          var database = payload.databases[row.database];
          var card = el("article", "cohort-summary-card");
          card.style.setProperty("--db-color", database.color);
          var databaseLabel = el("span", "cohort-db");
          databaseLabel.appendChild(countryFlag(database.country, "country-flag country-flag--cohort", true));
          databaseLabel.appendChild(document.createTextNode(row.database));
          card.appendChild(databaseLabel);
          card.appendChild(el("strong", "cohort-n", "N = " + number(row.n)));
          card.appendChild(el("span", "cohort-period", row.period));
          card.appendChild(el("span", "cohort-female", "Female: " + number(row.female) + " (" + row.femalePercent + "%)"));
          if (row.status) card.appendChild(el("span", "cohort-status", row.status));
          output.appendChild(card);
        });
      }

      if (keys.length > 1) {
        keys.forEach(function (key) {
          var control = button(key === "AD" ? "Atopic dermatitis" : "Prurigo nodularis", key === active);
          control.addEventListener("click", function () {
            active = key;
            Array.from(controls.children).forEach(function (item) { item.setAttribute("aria-pressed", String(item === control)); });
            render();
          });
          controls.appendChild(control);
        });
        root.appendChild(controls);
      }
      root.appendChild(output);
      render();
    });
  }

  function initNetwork(payload) {
    document.querySelectorAll("[data-network-growth]").forEach(function (root) {
      var data = payload.networkGrowth;
      var index = 0;
      var controls = el("div", "network-stepper");
      var stage = el("div", "network-stage");
      var status = el("p", "network-status");

      function render() {
        var step = data.steps[index];
        Array.from(controls.children).forEach(function (item, i) { item.setAttribute("aria-pressed", String(i === index)); });
        clear(stage);
        stage.classList.remove("is-revealed");
        var databaseRail = el("div", "network-country-journey");
        var countries = [];
        step.databases.forEach(function (code) {
          var countryName = payload.databases[code].country;
          if (countries.indexOf(countryName) === -1) countries.push(countryName);
        });
        countries.forEach(function (countryName) {
          var countryCard = el("article", "network-country-card");
          var heading = el("div", "network-country-card__heading");
          heading.appendChild(countryFlag(countryName, "country-flag country-flag--network", true));
          heading.appendChild(el("strong", "", countryName));
          countryCard.appendChild(heading);
          var databases = el("div", "network-country-databases");
          step.databases.filter(function (code) { return payload.databases[code].country === countryName; }).forEach(function (code) {
            var db = el("span", "network-database-chip", code);
            db.style.setProperty("--db-color", payload.databases[code].color);
            databases.appendChild(db);
          });
          countryCard.appendChild(databases);
          databaseRail.appendChild(countryCard);
        });
        var diseaseRail = el("div", "network-diseases");
        ["ASCVD", "AD", "PN"].forEach(function (disease) {
          var chip = el("span", "network-disease", disease);
          chip.classList.toggle("is-connected", step.diseases.indexOf(disease) !== -1);
          diseaseRail.appendChild(chip);
        });
        stage.appendChild(databaseRail);
        stage.appendChild(diseaseRail);
        var routeSummary = el("div", "network-route-summary");
        routeSummary.appendChild(el("span", "technical-label", "Selected stage"));
        routeSummary.appendChild(el("strong", "", step.label));
        routeSummary.appendChild(el("small", "", step.databases.join(" → ")));
        stage.appendChild(routeSummary);
        requestAnimationFrame(function () { stage.classList.add("is-revealed"); });
        status.textContent = step.label + ": " + step.databases.length + " data environments, " + step.diseases.length + " disease area" + (step.diseases.length > 1 ? "s" : "") + (step.cohorts === null ? "." : ", " + step.cohorts + " represented cohorts.");
      }

      data.steps.forEach(function (step, i) {
        var control = button("", i === index);
        control.classList.add("network-journey-button");
        control.setAttribute("aria-label", "Step " + (i + 1) + ": " + step.label);
        control.appendChild(el("span", "network-step-number", String(i + 1).padStart(2, "0")));
        control.appendChild(el("strong", "", step.label));
        control.addEventListener("click", function () { index = i; render(); });
        controls.appendChild(control);
      });
      root.appendChild(controls);
      root.appendChild(stage);
      root.appendChild(status);
      root.appendChild(el("p", "source-note", data.note));
      render();
    });
  }

  function renderGroupedBars(root, categories, series, colors, tableMount) {
    clear(root);
    if (tableMount) clear(tableMount);
    var names = Object.keys(series);
    var width = 1000;
    var categoryColumn = 24;
    var seriesColumn = 268;
    var left = 292;
    var right = 920;
    var top = 54;
    var groupHeight = Math.max(62, names.length * 20 + 24);
    var height = top + categories.length * groupHeight + 48;
    var max = 50;
    var svg = createSvg("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": "Index-event proportions by selected subgroup" });
    [0, 10, 20, 30, 40, 50].forEach(function (tick) {
      var x = left + (tick / max) * (right - left);
      svg.appendChild(createSvg("line", { x1: x, x2: x, y1: top - 18, y2: height - 38, class: "chart-gridline" }));
      var label = createSvg("text", { x: x, y: height - 14, "text-anchor": "middle", class: "chart-axis-label" }); label.textContent = tick + "%"; svg.appendChild(label);
    });
    var tooltip = createChartTooltip(root);
    var rows = [];
    categories.forEach(function (category, categoryIndex) {
      var groupTop = top + categoryIndex * groupHeight;
      var categoryLabel = createSvg("text", { x: categoryColumn, y: groupTop + (Math.max(1, names.length) * 20) / 2 + 8, "text-anchor": "start", class: "research-svg-category" }); categoryLabel.textContent = category; svg.appendChild(categoryLabel);
      names.forEach(function (name, seriesIndex) {
        var value = series[name][categoryIndex];
        var y = groupTop + seriesIndex * 20 + 4;
        var bar = createSvg("rect", { x: left, y: y, width: Math.max(1, (value / max) * (right - left)), height: 12, rx: 6, fill: colors[seriesIndex % colors.length], class: "research-svg-bar" });
        svg.appendChild(bar);
        var valueLabel = createSvg("text", { x: Math.min(right + 4, left + (value / max) * (right - left) + 7), y: y + 10, class: "research-svg-value" }); valueLabel.textContent = value + "%"; svg.appendChild(valueLabel);
        var seriesLabel = createSvg("text", { x: seriesColumn, y: y + 10, "text-anchor": "end", class: "research-svg-series" }); seriesLabel.textContent = names.length > 1 ? name : ""; svg.appendChild(seriesLabel);
        bindChartTooltip(bar, tooltip, root, category + " · " + name + ": " + value + "%");
        rows.push([category, name, value + "%"]);
      });
    });
    root.appendChild(svg);
    root.appendChild(tooltip);
    if (tableMount) tableMount.appendChild(dataTable(["Index event", "Group", "Reported proportion"], rows));
  }

  function initSubgroups(payload) {
    document.querySelectorAll("[data-subgroup-explorer]").forEach(function (root) {
      var data = payload.ascvdSubgroups;
      var controls = el("div", "explorer-controls");
      var title = el("h3", "explorer-current-title");
      var chart = el("div", "research-bars-chart research-bars-chart--svg");
      var tableMount = root.closest("figure") ? root.closest("figure").querySelector("[data-table-mount]") : null;
      var active = "allPatients";
      var colors = ["#0063c3", "#2d746a", "#9c3c67"];

      function render() {
        title.textContent = data.views[active].label;
        renderGroupedBars(chart, data.categories, data.views[active].series, colors, tableMount);
      }

      Object.keys(data.views).forEach(function (key) {
        var labels = { allPatients: "All patients", age: "Age groups", age40Sex: "Age 40–64 × sex", age65Sex: "Age 65+ × sex" };
        var control = button(labels[key], key === active);
        control.addEventListener("click", function () {
          active = key;
          Array.from(controls.children).forEach(function (item) { item.setAttribute("aria-pressed", String(item === control)); });
          render();
        });
        controls.appendChild(control);
      });
      root.appendChild(controls);
      root.appendChild(title);
      root.appendChild(chart);
      render();
    });
  }

  function initConcordance(payload) {
    document.querySelectorAll("[data-cdm-concordance]").forEach(function (root) {
      var data = payload.cdmConcordance;
      var groups = [
        { prefix: "[Major event]", label: "Major events", description: "Events used to classify recurrent or prior major cardiovascular disease." },
        { prefix: "[Index]", label: "Index characteristics", description: "The qualifying event recorded at cohort entry." },
        { prefix: "[High Risk]", label: "High-risk criteria", description: "Additional characteristics used to distinguish the high-risk strata." }
      ];
      var countries = Object.keys(data.countries);
      var groupList = el("div", "concordance-groups");

      function formatPercent(value) { return value.toFixed(value < 1 ? 3 : 1) + "%"; }
      function createCountryHeading(country) {
        var heading = el("span", "concordance-table-country");
        heading.appendChild(countryFlag(country.replace(/ (NHIRD|NHIS)$/, ""), "country-flag country-flag--table", true));
        heading.appendChild(el("span", "", country));
        return heading;
      }
      function createPair(country, categoryIndex) {
        var cell = el("td", "concordance-pair");
        var omop = data.countries[country].OMOP[categoryIndex];
        var sentinel = data.countries[country].Sentinel[categoryIndex];
        [["OMOP", omop, "concordance-route--omop"], ["Sentinel", sentinel, "concordance-route--sentinel"]].forEach(function (item) {
          var value = el("span", "concordance-route " + item[2]);
          var track = el("span", "concordance-route__track");
          var fill = el("i", "concordance-route__fill");
          fill.style.width = Math.max(0, Math.min(100, item[1])) + "%";
          track.appendChild(fill);
          value.appendChild(track);
          value.appendChild(el("small", "", item[0]));
          value.appendChild(el("strong", "", formatPercent(item[1])));
          cell.appendChild(value);
        });
        cell.appendChild(el("span", "concordance-delta", "Difference " + Math.abs(omop - sentinel).toFixed(2) + " pp"));
        return cell;
      }

      groups.forEach(function (group, groupIndex) {
        var indices = data.categories.map(function (category, index) { return category.indexOf(group.prefix) === 0 ? index : -1; }).filter(function (index) { return index >= 0; });
        var disclosure = el("details", "concordance-group");
        disclosure.open = groupIndex === 0;
        var summary = el("summary", "concordance-group__summary");
        var summaryText = el("span", "");
        summaryText.appendChild(el("strong", "", group.label));
        summaryText.appendChild(el("small", "", group.description));
        summary.appendChild(summaryText);
        summary.appendChild(el("span", "concordance-group__count", indices.length + " variables"));
        disclosure.appendChild(summary);

        var scroll = el("div", "concordance-table-scroll");
        scroll.tabIndex = 0;
        scroll.setAttribute("aria-label", group.label + " comparison table");
        var table = el("table", "concordance-table");
        var thead = el("thead");
        var header = el("tr");
        var variableHeading = el("th", "", "Variable"); variableHeading.scope = "col"; header.appendChild(variableHeading);
        countries.forEach(function (country) { var th = el("th"); th.scope = "col"; th.appendChild(createCountryHeading(country)); header.appendChild(th); });
        thead.appendChild(header); table.appendChild(thead);
        var tbody = el("tbody");
        indices.forEach(function (categoryIndex) {
          var row = el("tr");
          var label = el("th", "", data.categories[categoryIndex].replace(group.prefix, "").trim()); label.scope = "row"; row.appendChild(label);
          countries.forEach(function (country) { row.appendChild(createPair(country, categoryIndex)); });
          tbody.appendChild(row);
        });
        table.appendChild(tbody); scroll.appendChild(table); disclosure.appendChild(scroll); groupList.appendChild(disclosure);
      });
      root.appendChild(groupList);
      root.appendChild(el("p", "source-note"));

      var exportButton = root.closest("section") && root.closest("section").querySelector("[data-cdm-export]");
      if (exportButton) {
        exportButton.addEventListener("click", function () {
          var rows = [];
          data.categories.forEach(function (category, categoryIndex) {
            countries.forEach(function (country) {
              var omop = data.countries[country].OMOP[categoryIndex];
              var sentinel = data.countries[country].Sentinel[categoryIndex];
              rows.push([
                category.replace(/^\[[^\]]+\]\s*/, ""), country, omop, sentinel,
                Math.abs(omop - sentinel).toFixed(2)
              ]);
            });
          });
          downloadCsv("impresive-ascvd-cdm-comparison.csv",
            ["Variable", "Data environment", "OMOP (%)", "Sentinel (%)", "Absolute difference (percentage points)"], rows);
        });
      }
    });
  }

  function createSvg(name, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }

  function initAgePrevalence(payload) {
    document.querySelectorAll("[data-age-prevalence]").forEach(function (root) {
      var data = payload.agePrevalence;
      var disease = "AD";
      var controls = el("div", "explorer-controls");
      var chart = el("div", "line-chart-shell");
      var legend = el("div", "chart-legend");

      function render() {
        clear(chart); clear(legend);
        var tooltip = createChartTooltip(chart);
        var svg = createSvg("svg", { viewBox: "0 0 760 360", role: "img", "aria-label": disease + " prevalence by age and database" });
        var max = disease === "AD" ? 14 : 1;
        var left = 70, top = 35, width = 650, height = 250;
        [0, .25, .5, .75, 1].forEach(function (fraction) {
          var y = top + height - height * fraction;
          var line = createSvg("line", { x1: left, x2: left + width, y1: y, y2: y, class: "chart-gridline" });
          svg.appendChild(line);
          var text = createSvg("text", { x: left - 12, y: y + 5, "text-anchor": "end", class: "chart-axis-label" }); text.textContent = (max * fraction).toFixed(max < 2 ? 2 : 0) + "%"; svg.appendChild(text);
        });
        data.ageGroups.forEach(function (label, i) {
          var x = left + (width / (data.ageGroups.length - 1)) * i;
          var text = createSvg("text", { x: x, y: top + height + 35, "text-anchor": "middle", class: "chart-axis-label" }); text.textContent = label; svg.appendChild(text);
        });
        data.databaseOrder.forEach(function (code) {
          var values = data.diseases[disease][code];
          var color = payload.databases[code].color;
          var points = values.map(function (value, i) {
            if (value === null) return null;
            return [left + (width / (data.ageGroups.length - 1)) * i, top + height - (value / max) * height, value];
          }).filter(Boolean);
          var path = createSvg("polyline", { points: points.map(function (p) { return p[0] + "," + p[1]; }).join(" "), fill: "none", stroke: color, "stroke-width": "4", class: "research-line" });
          svg.appendChild(path);
          points.forEach(function (p) {
            var ageIndex = Math.round((p[0] - left) / (width / (data.ageGroups.length - 1)));
            var dot = createSvg("circle", { cx: p[0], cy: p[1], r: "7", fill: color, class: "research-point" });
            var label = code + " · " + data.ageGroups[ageIndex] + ": " + p[2] + "%";
            var title = createSvg("title"); title.textContent = label; dot.appendChild(title); svg.appendChild(dot);
            bindChartTooltip(dot, tooltip, chart, label);
          });
          var item = el("span", "chart-legend-item", code); item.style.setProperty("--legend-color", color); legend.appendChild(item);
        });
        chart.insertBefore(svg, tooltip);
      }
      ["AD", "PN"].forEach(function (key) {
        var control = button(key === "AD" ? "Atopic dermatitis" : "Prurigo nodularis", key === disease);
        control.addEventListener("click", function () { disease = key; Array.from(controls.children).forEach(function (item) { item.setAttribute("aria-pressed", String(item === control)); }); render(); });
        controls.appendChild(control);
      });
      root.appendChild(controls);
      root.appendChild(chart);
      root.appendChild(legend);
      render();
    });
  }

  function initMedication(payload) {
    document.querySelectorAll("[data-medication-mix]").forEach(function (root) {
      var data = payload.medicationMix;
      var disease = "AD";
      var controls = el("div", "explorer-controls medication-disease-controls");
      var chart = el("div", "medication-matrix-scroll");
      function render() {
        clear(chart);
        var matrix = el("div", "medication-matrix");
        matrix.style.setProperty("--medication-columns", String(data.databaseOrder.length));
        matrix.appendChild(el("div", "medication-matrix__corner", "Medication category"));
        data.databaseOrder.forEach(function (code) {
          var heading = el("div", "medication-matrix__database");
          heading.appendChild(countryFlag(payload.databases[code].country, "country-flag country-flag--table", true));
          heading.appendChild(el("strong", "", code));
          matrix.appendChild(heading);
        });
        data.categories.forEach(function (category, i) {
          matrix.appendChild(el("div", "medication-matrix__category", category));
          data.databaseOrder.forEach(function (code) {
            var value = data.diseases[disease][code][i];
            var cell = el("div", "medication-matrix__cell");
            var track = el("span", "medication-track"); var fill = el("span", "medication-fill"); fill.style.width = value + "%"; track.appendChild(fill); cell.appendChild(track); cell.appendChild(el("strong", "", value + "%"));
            cell.setAttribute("aria-label", category + " in " + code + ": " + value + "%"); matrix.appendChild(cell);
          });
        });
        chart.appendChild(matrix);
      }
      [["AD", "Atopic dermatitis"], ["PN", "Prurigo nodularis"]].forEach(function (item) {
        var control = button(item[1], item[0] === disease);
        control.addEventListener("click", function () { disease = item[0]; Array.from(controls.children).forEach(function (node) { node.setAttribute("aria-pressed", String(node === control)); }); render(); });
        controls.appendChild(control);
      });
      root.appendChild(controls); root.appendChild(chart); root.appendChild(el("p", "source-note", data.note)); render();
    });
  }

  function initModules(payload) {
    document.querySelectorAll("[data-analysis-modules]").forEach(function (root) {
      var data = payload.analysisModules;
      var controls = el("div", "module-pipeline");
      var detail = el("article", "module-detail");
      function show(module, selected) {
        Array.from(controls.children).forEach(function (item) { item.setAttribute("aria-pressed", String(item === selected)); });
        clear(detail);
        var heading = el("div", "module-detail-heading"); heading.appendChild(el("span", "technical-label", module.caseUse)); heading.appendChild(el("h3", "", module.label)); detail.appendChild(heading);
        var grid = el("dl", "module-detail-grid");
        [["Output", module.output], ["Parameters that change", module.changes], ["Code that remains shared", module.unchanged]].forEach(function (item) { var wrap = el("div"); wrap.appendChild(el("dt", "", item[0])); wrap.appendChild(el("dd", "", item[1])); grid.appendChild(wrap); });
        detail.appendChild(grid);
      }
      data.modules.forEach(function (module, index) {
        var control = button(module.label, index === 0);
        if (module.new) control.appendChild(el("span", "module-new", "Added for AD/PN"));
        control.addEventListener("click", function () { show(module, control); }); controls.appendChild(control);
      });
      root.appendChild(controls); root.appendChild(detail); show(data.modules[0], controls.firstChild);
    });
  }

  function initCodeLists(payload) {
    document.querySelectorAll("[data-code-comparator]").forEach(function (root) {
      var data = payload.codeLists;
      var concept = Object.keys(data.concepts)[0], harmonized = false;
      var form = el("div", "explorer-form");
      var select = document.createElement("select");
      var toggle = button("Harmonize", false);
      var grid = el("div", "code-list-grid");
      Object.keys(data.concepts).forEach(function (name) { var option = el("option", "", name); option.value = name; select.appendChild(option); });
      function render() {
        concept = select.value; clear(grid);
        payload.databaseOrder.forEach(function (code) {
          var card = el("article", "code-list-card"); card.style.setProperty("--db-color", payload.databases[code].color); card.appendChild(el("h3", "", code));
          if (harmonized) {
            card.appendChild(el("span", "harmonized-concept", "Shared study concept")); card.appendChild(el("strong", "", concept)); card.appendChild(el("p", "source-note", "Local codes remain documented below the shared concept boundary."));
          }
          var codes = el("div", "code-chip-list"); data.concepts[concept][code].forEach(function (value) { codes.appendChild(el("code", "code-chip", value)); }); card.appendChild(codes); grid.appendChild(card);
        });
      }
      var label = el("label", "explorer-field"); label.appendChild(el("span", "", "Clinical concept")); label.appendChild(select); form.appendChild(label); form.appendChild(toggle);
      select.addEventListener("change", render); toggle.addEventListener("click", function () { harmonized = !harmonized; toggle.setAttribute("aria-pressed", String(harmonized)); render(); });
      root.appendChild(form); root.appendChild(grid); render();
    });
  }

  function initPartnerMap(payload) {
    document.querySelectorAll("[data-partner-map]").forEach(function (root) {
      var data = payload.partnerSurvey;
      var type = "all", country = null, cohort = "ASCVD";
      var controls = el("div", "explorer-controls");
      var layout = el("div", "partner-map-layout");
      var map = el("div", "partner-map-stage");
      var detail = el("article", "partner-map-detail");
      detail.tabIndex = -1;
      detail.setAttribute("aria-live", "polite");
      var countryPositions = { Taiwan: [58, 73], "South Korea": [57, 31], Japan: [81, 31], "Hong Kong": [34, 80] };

      function visibleDatabases(name) {
        return data.countries[name].databases.filter(function (code) { return type === "all" || payload.databases[code].type === type; });
      }
      function mapText(svg, x, y, text) { var label = createSvg("text", { x: x, y: y, class: "partner-map-label" }); label.textContent = text; svg.appendChild(label); }
      function appendMapBase(svg) {
        [180, 360, 540, 720].forEach(function (x) { svg.appendChild(createSvg("line", { x1: x, x2: x, y1: 0, y2: 520, class: "partner-map-gridline" })); });
        [130, 260, 390].forEach(function (y) { svg.appendChild(createSvg("line", { x1: 0, x2: 900, y1: y, y2: y, class: "partner-map-gridline" })); });
        svg.appendChild(createSvg("path", { d: "M0 0H545C532 24 535 51 516 76C500 97 505 121 487 143C466 167 446 178 428 201C408 226 399 253 391 283C382 316 364 347 337 369C310 390 281 401 250 419C208 444 162 471 107 520H0Z", class: "partner-land" }));
        svg.appendChild(createSvg("path", { d: "M503 105C520 111 533 126 537 144C541 162 533 181 522 198L508 218L495 197C486 181 489 162 495 148C501 134 497 119 503 105Z", class: "partner-land partner-land--focus" }));
        svg.appendChild(createSvg("path", { d: "M723 62L748 70L765 91L750 109L724 101L711 82ZM747 119C770 129 786 150 790 173C793 194 807 210 823 225L808 242L784 224L770 199L754 181L741 155ZM705 211L730 217L737 232L719 242L696 234ZM676 232L700 241L695 261L672 269L654 253Z", class: "partner-land partner-land--focus" }));
        svg.appendChild(createSvg("path", { d: "M517 347C529 358 534 376 528 394C523 410 511 424 500 417C490 410 493 392 498 377C503 362 505 351 517 347Z", class: "partner-land partner-land--focus" }));
        svg.appendChild(createSvg("path", { d: "M305 404C313 400 322 404 325 412C321 419 311 421 304 416Z", class: "partner-land partner-land--focus" }));
        svg.appendChild(createSvg("path", { d: "M475 452L488 468L482 489L468 496L459 479ZM514 438L523 451L520 466L509 471L501 456ZM548 460L557 474L552 491L540 497L532 480Z", class: "partner-island" }));
        mapText(svg, 205, 258, "CHINA");
        mapText(svg, 470, 84, "KOREAN PENINSULA");
        mapText(svg, 730, 42, "JAPAN");
        mapText(svg, 535, 430, "TAIWAN");
        mapText(svg, 260, 445, "HONG KONG");
      }
      function selectedCohorts() {
        if (!country) return [];
        return (payload.cohorts[cohort] || []).filter(function (row) { return data.countries[country].databases.indexOf(row.database) !== -1; });
      }
      function render() {
        clear(map); clear(detail);
        layout.classList.toggle("has-detail", Boolean(country));
        detail.hidden = !country;
        var mapSvg = createSvg("svg", { viewBox: "0 0 900 520", class: "partner-map-svg", role: "img", "aria-label": "Stylized East Asia location map" });
        appendMapBase(mapSvg);
        map.appendChild(mapSvg);
        Object.keys(data.countries).forEach(function (name) {
          var codes = visibleDatabases(name);
          var pin = button("", name === country);
          pin.className = "map-country-pin";
          pin.setAttribute("data-country", name);
          pin.setAttribute("aria-label", name + ": " + codes.length + " matching data environment" + (codes.length === 1 ? "" : "s"));
          pin.style.left = countryPositions[name][0] + "%";
          pin.style.top = countryPositions[name][1] + "%";
          pin.hidden = !codes.length;
          pin.appendChild(countryFlag(name, "country-flag country-flag--map", true));
          pin.appendChild(el("span", "map-country-name", name));
          pin.appendChild(el("span", "map-country-count", String(codes.length)));
          pin.addEventListener("click", function () { country = name; render(); requestAnimationFrame(function () { detail.focus(); }); });
          map.appendChild(pin);
        });
        if (!country) return;
        var record = data.countries[country];
        var detailHeading = el("div", "partner-map-detail__heading"); detailHeading.appendChild(countryFlag(country, "country-flag country-flag--detail", true)); var headingText = el("div"); headingText.appendChild(el("h3", "", country)); headingText.appendChild(el("small", "", visibleDatabases(country).length + " matching data environment" + (visibleDatabases(country).length === 1 ? "" : "s"))); detailHeading.appendChild(headingText); var close = button("Close", false); close.className = "map-detail-close"; close.setAttribute("aria-label", "Close " + country + " details"); close.addEventListener("click", function () { var previousCountry = country; country = null; render(); requestAnimationFrame(function () { var previousPin = map.querySelector('[data-country="' + previousCountry + '"]'); if (previousPin) previousPin.focus(); }); }); detailHeading.appendChild(close); detail.appendChild(detailHeading);
        var dbList = el("div", "map-db-list"); visibleDatabases(country).forEach(function (code) { var chip = el("div", "map-db-chip"); chip.style.setProperty("--db-color", payload.databases[code].color); chip.appendChild(el("strong", "", code)); chip.appendChild(el("span", "", payload.databases[code].type === "ehr" ? "Hospital EHR" : "Claims")); dbList.appendChild(chip); }); detail.appendChild(dbList);
        detail.appendChild(el("h4", "", "Represented study cohorts"));
        var cohortControls = el("div", "map-cohort-controls");
        ["ASCVD", "AD", "PN"].forEach(function (key) { var control = button(key, key === cohort); control.addEventListener("click", function () { cohort = key; render(); requestAnimationFrame(function () { var activeControl = detail.querySelector('.map-cohort-controls [aria-pressed="true"]'); if (activeControl) activeControl.focus(); }); }); cohortControls.appendChild(control); });
        detail.appendChild(cohortControls);
        var cohortList = el("div", "map-cohort-list");
        selectedCohorts().forEach(function (row) {
          var card = el("article", "map-cohort-card");
          card.style.setProperty("--db-color", payload.databases[row.database].color);
          var heading = el("div", "map-cohort-card__heading"); heading.appendChild(el("strong", "", row.database)); heading.appendChild(el("span", "", row.period)); card.appendChild(heading);
          card.appendChild(el("span", "map-cohort-n", "N = " + number(row.n)));
          card.appendChild(el("small", "", "Female: " + number(row.female) + " (" + row.femalePercent + "%)"));
          if (row.status) card.appendChild(el("span", "cohort-status", row.status));
          cohortList.appendChild(card);
        });
        if (!cohortList.children.length) cohortList.appendChild(el("p", "source-note", "No " + cohort + " cohort is represented for this setting in the current source deck."));
        detail.appendChild(cohortList);
        detail.appendChild(el("h4", "", "Coding context")); var coding = el("ul"); record.coding.forEach(function (item) { coding.appendChild(el("li", "", item)); }); detail.appendChild(coding);
      }
      [["all", "All environments"], ["claims", "Claims"], ["ehr", "EHR"]].forEach(function (item) { var control = button(item[1], item[0] === type); control.addEventListener("click", function () { type = item[0]; Array.from(controls.children).forEach(function (node) { node.setAttribute("aria-pressed", String(node === control)); }); if (country && !visibleDatabases(country).length) country = null; render(); }); controls.appendChild(control); });
      root.appendChild(controls); layout.appendChild(map); layout.appendChild(detail); root.appendChild(layout); render();

      var exportButton = root.closest("section") && root.closest("section").querySelector("[data-partner-export]");
      if (exportButton) {
        exportButton.addEventListener("click", function () {
          var rows = [];
          Object.keys(data.countries).forEach(function (countryName) {
            var record = data.countries[countryName];
            record.databases.forEach(function (code) {
              var matched = [];
              ["ASCVD", "AD", "PN"].forEach(function (caseName) {
                (payload.cohorts[caseName] || []).filter(function (cohortRow) {
                  return cohortRow.database === code;
                }).forEach(function (cohortRow) {
                  matched.push([caseName, cohortRow.n, cohortRow.female, cohortRow.femalePercent, cohortRow.period, cohortRow.status || ""]);
                });
              });
              if (!matched.length) matched.push(["", "", "", "", "", ""]);
              matched.forEach(function (cohortRow) {
                rows.push([
                  countryName, code, payload.databases[code].type,
                  record.coding.join("; ")
                ].concat(cohortRow));
              });
            });
          });
          downloadCsv("impresive-partner-map-data.csv",
            ["Country", "Data environment", "Source type", "Coding context", "Case cohort", "N", "Female N", "Female (%)", "Period", "Status"], rows);
        });
      }
    });
  }

  function initAscvdRiskForest(payload) {
    document.querySelectorAll("[data-ascvd-risk-forest]").forEach(function (root) {
      var data = payload.ascvdRiskForest;
      var selected = new Set(data.databaseOrder);
      var controls = el("div", "explorer-controls forest-controls");
      var chart = el("div", "forest-chart-shell");
      var tableMount = root.closest("figure") ? root.closest("figure").querySelector("[data-table-mount]") : null;

      function forestMarker(database, xPosition, yPosition) {
        var attrs = { fill: database.color, class: "chart-marker forest-point" };
        if (database.marker === "circle") return createSvg("circle", Object.assign({ cx: xPosition, cy: yPosition, r: 5 }, attrs));
        if (database.marker === "triangle") return createSvg("polygon", Object.assign({ points: xPosition + "," + (yPosition - 6) + " " + (xPosition - 6) + "," + (yPosition + 5) + " " + (xPosition + 6) + "," + (yPosition + 5) }, attrs));
        if (database.marker === "diamond") return createSvg("polygon", Object.assign({ points: xPosition + "," + (yPosition - 6) + " " + (xPosition - 6) + "," + yPosition + " " + xPosition + "," + (yPosition + 6) + " " + (xPosition + 6) + "," + yPosition }, attrs));
        if (database.marker === "cross") return createSvg("path", Object.assign({ d: "M" + (xPosition - 6) + " " + (yPosition - 2) + "H" + (xPosition - 2) + "V" + (yPosition - 6) + "H" + (xPosition + 2) + "V" + (yPosition - 2) + "H" + (xPosition + 6) + "V" + (yPosition + 2) + "H" + (xPosition + 2) + "V" + (yPosition + 6) + "H" + (xPosition - 2) + "V" + (yPosition + 2) + "H" + (xPosition - 6) + "Z" }, attrs));
        if (database.marker === "hexagon") return createSvg("polygon", Object.assign({ points: (xPosition - 6) + "," + yPosition + " " + (xPosition - 3) + "," + (yPosition - 5) + " " + (xPosition + 3) + "," + (yPosition - 5) + " " + (xPosition + 6) + "," + yPosition + " " + (xPosition + 3) + "," + (yPosition + 5) + " " + (xPosition - 3) + "," + (yPosition + 5) }, attrs));
        return createSvg("rect", Object.assign({ x: xPosition - 5, y: yPosition - 5, width: 10, height: 10, rx: 1 }, attrs));
      }

      function draw() {
        clear(chart); if (tableMount) clear(tableMount);
        var width = 980, left = 235, right = 900, top = 70, rowHeight = 78, height = top + data.outcomes.length * rowHeight + 70;
        var xMin = 0.5, xMax = 8;
        var x = function (value) { return left + ((value - xMin) / (xMax - xMin)) * (right - left); };
        var svg = createSvg("svg", { viewBox: "0 0 " + width + " " + height, role: "img" });
        var tooltip = createChartTooltip(chart);
        [1, 2, 3, 4, 5, 6, 7, 8].forEach(function (tick) {
          svg.appendChild(createSvg("line", { x1: x(tick), x2: x(tick), y1: 38, y2: height - 54, class: tick === 1 ? "forest-reference" : "chart-gridline" }));
          var tickLabel = createSvg("text", { x: x(tick), y: height - 28, "text-anchor": "middle", class: "chart-axis-label" }); tickLabel.textContent = tick; svg.appendChild(tickLabel);
        });
        var rows = [];
        data.outcomes.forEach(function (outcome, outcomeIndex) {
          var baseY = top + outcomeIndex * rowHeight;
          var label = createSvg("text", { x: left - 18, y: baseY + 16, "text-anchor": "end", class: "forest-outcome-label" }); label.textContent = outcome.label; svg.appendChild(label);
          svg.appendChild(createSvg("line", { x1: left, x2: right, y1: baseY + 34, y2: baseY + 34, class: "forest-row-line" }));
          var visibleIndex = 0;
          data.databaseOrder.forEach(function (code) {
            if (!selected.has(code)) return;
            var values = outcome.values[code];
            var y = baseY + visibleIndex * 10;
            visibleIndex += 1;
            var database = payload.databases[code];
            var interval = createSvg("line", { x1: x(values[1]), x2: x(values[2]), y1: y, y2: y, stroke: database.color, class: "confidence-interval" }); svg.appendChild(interval);
            var point = forestMarker(database, x(values[0]), y); svg.appendChild(point);
            var tooltipText = code + " · " + outcome.label + ": HR ≈ " + values[0].toFixed(2) + " (95% CI ≈ " + values[1].toFixed(2) + "–" + values[2].toFixed(2) + ") · provisional image-derived value";
            bindChartTooltip(point, tooltip, chart, tooltipText);
            rows.push([outcome.label, code, "≈ " + values[0].toFixed(2), "≈ " + values[1].toFixed(2) + "–" + values[2].toFixed(2), "Provisional"]);
          });
        });
        var axisTitle = createSvg("text", { x: (left + right) / 2, y: height - 4, "text-anchor": "middle", class: "forest-axis-title" }); axisTitle.textContent = data.measure; svg.appendChild(axisTitle);
        chart.appendChild(svg); chart.appendChild(tooltip);
        if (tableMount) tableMount.appendChild(dataTable(["Outcome", "Database", "HR", "95% CI", "Status"], rows));
      }

      data.databaseOrder.forEach(function (code) {
        var control = button("", true);
        control.classList.add("forest-database-button");
        control.appendChild(countryFlag(payload.databases[code].country, "country-flag country-flag--control", true));
        control.appendChild(el("span", "", code));
        control.style.setProperty("--db-color", payload.databases[code].color);
        control.addEventListener("click", function () { if (selected.has(code) && selected.size > 1) selected.delete(code); else selected.add(code); control.setAttribute("aria-pressed", String(selected.has(code))); draw(); });
        controls.appendChild(control);
      });
      root.appendChild(controls); root.appendChild(chart); draw();
    });
  }

  function initRouteFilter() {
    document.querySelectorAll("[data-route-table]").forEach(function (root) {
      var controls = root.querySelector("[data-route-controls]");
      if (!controls) return;
      ["both", "omop", "sentinel"].forEach(function (mode) {
        var control = controls.querySelector('[data-route-mode="' + mode + '"]');
        if (!control) return;
        control.addEventListener("click", function () {
          root.setAttribute("data-route-active", mode);
          controls.querySelectorAll("button").forEach(function (node) { node.setAttribute("aria-pressed", String(node === control)); });
        });
      });
    });
  }

  function initHarmonizationSteppers() {
    document.querySelectorAll("[data-harmonization-stepper]").forEach(function (root) {
      var buttons = Array.from(root.querySelectorAll("[data-layer-step]"));
      var panels = Array.from(root.querySelectorAll("[data-layer-panel]"));
      function show(index) {
        buttons.forEach(function (control, i) { control.setAttribute("aria-selected", String(i === index)); control.tabIndex = i === index ? 0 : -1; });
        panels.forEach(function (panel, i) { panel.hidden = i !== index; });
      }
      buttons.forEach(function (control, index) {
        control.addEventListener("click", function () { show(index); });
        control.addEventListener("keydown", function (event) {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault(); var next = (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length; show(next); buttons[next].focus();
        });
      });
      show(0);
    });
  }

  initRouteFilter();
  initHarmonizationSteppers();

  var needsData = document.querySelector("[data-cohort-summary], [data-network-growth], [data-subgroup-explorer], [data-ascvd-risk-forest], [data-cdm-concordance], [data-age-prevalence], [data-medication-mix], [data-analysis-modules], [data-code-comparator], [data-partner-map]");
  if (!needsData) return;
  fetch(DATA_URL).then(function (response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); }).then(function (payload) {
    initCohorts(payload); initNetwork(payload); initSubgroups(payload); initAscvdRiskForest(payload); initConcordance(payload); initAgePrevalence(payload); initMedication(payload); initModules(payload); initCodeLists(payload); initPartnerMap(payload);
    document.dispatchEvent(new CustomEvent("impresive:content-ready"));
  }).catch(function (error) {
    document.querySelectorAll("[data-cohort-summary], [data-network-growth], [data-subgroup-explorer], [data-ascvd-risk-forest], [data-cdm-concordance], [data-age-prevalence], [data-medication-mix], [data-analysis-modules], [data-code-comparator], [data-partner-map]").forEach(function (root) { setError(root, "The interactive source data could not be loaded. Use a local web server and try again. " + error.message); });
  });
})();
