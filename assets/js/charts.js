(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function htmlElement(name, className, text) {
    var node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgElement(name, attributes, text) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function formatNumber(value) {
    if (value === null || value === undefined) return "Not reported";
    return new Intl.NumberFormat("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(value);
  }

  function appendSvgTitle(svg, title, description, idBase) {
    var titleId = idBase + "-title";
    var descriptionId = idBase + "-description";
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-labelledby", titleId + " " + descriptionId);
    svg.appendChild(svgElement("title", { id: titleId }, title));
    svg.appendChild(svgElement("desc", { id: descriptionId }, description));
  }

  function appendMarker(parent, x, y, database, size, open) {
    var group = svgElement("g", {
      class: "chart-marker",
      transform: "translate(" + x + " " + y + ")",
      stroke: database.color,
      "stroke-width": 2,
      fill: open ? "#ffffff" : database.color
    });
    var radius = size || 6;

    if (database.marker === "square") {
      group.appendChild(svgElement("rect", {
        x: -radius,
        y: -radius,
        width: radius * 2,
        height: radius * 2,
        rx: 1
      }));
    } else if (database.marker === "triangle") {
      group.appendChild(svgElement("polygon", {
        points: "0," + (-radius - 1) + " " + (radius + 1) + "," + radius + " " + (-radius - 1) + "," + radius
      }));
    } else if (database.marker === "diamond") {
      group.appendChild(svgElement("polygon", {
        points: "0," + (-radius - 1) + " " + (radius + 1) + ",0 0," + (radius + 1) + " " + (-radius - 1) + ",0"
      }));
    } else if (database.marker === "cross") {
      group.setAttribute("fill", "none");
      group.setAttribute("stroke-width", 3);
      group.appendChild(svgElement("path", {
        d: "M " + (-radius) + " " + (-radius) + " L " + radius + " " + radius + " M " + radius + " " + (-radius) + " L " + (-radius) + " " + radius
      }));
    } else if (database.marker === "hexagon") {
      group.appendChild(svgElement("polygon", {
        points: (-radius) + ",0 " + (-radius / 2) + "," + (-radius) + " " + (radius / 2) + "," + (-radius) + " " + radius + ",0 " + (radius / 2) + "," + radius + " " + (-radius / 2) + "," + radius
      }));
    } else {
      group.appendChild(svgElement("circle", { cx: 0, cy: 0, r: radius }));
    }

    parent.appendChild(group);
    return group;
  }

  function appendHtmlMarker(parent, database) {
    var svg = svgElement("svg", {
      class: "legend-marker",
      viewBox: "0 0 22 22",
      "aria-hidden": "true",
      focusable: "false"
    });
    appendMarker(svg, 11, 11, database, 5, false);
    parent.appendChild(svg);
  }

  function createTable(headers, rows) {
    var table = htmlElement("table", "data-table");
    var thead = htmlElement("thead");
    var headingRow = htmlElement("tr");
    headers.forEach(function (header) {
      var th = htmlElement("th", "", header);
      th.scope = "col";
      headingRow.appendChild(th);
    });
    thead.appendChild(headingRow);
    table.appendChild(thead);

    var tbody = htmlElement("tbody");
    rows.forEach(function (row) {
      var tr = htmlElement("tr");
      row.forEach(function (cell, index) {
        var node = htmlElement(index === 0 ? "th" : "td", "", cell);
        if (index === 0) node.scope = "row";
        tr.appendChild(node);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function addDatabaseControls(mount, idBase, codes, databases, selected, onChange) {
    var fieldset = htmlElement("fieldset", "database-controls");
    fieldset.appendChild(htmlElement("legend", "", "Databases shown"));

    codes.forEach(function (code) {
      var label = htmlElement("label", "database-option");
      var input = htmlElement("input");
      input.type = "checkbox";
      input.value = code;
      input.id = idBase + "-database-" + code.toLowerCase();
      input.checked = selected.has(code);
      input.addEventListener("change", function () {
        if (input.checked) selected.add(code);
        else selected.delete(code);
        onChange();
      });
      label.appendChild(input);
      appendHtmlMarker(label, databases[code]);
      label.appendChild(document.createTextNode(code + (databases[code].sourceMarker || "")));
      fieldset.appendChild(label);
    });

    mount.appendChild(fieldset);
  }

  function renderAscvd(figure, data) {
    var mount = figure.querySelector("[data-chart-mount]");
    var tableMount = figure.querySelector("[data-table-mount]");
    clear(mount);
    clear(tableMount);

    var width = 820;
    var height = 250;
    var left = 92;
    var right = 755;
    var axisY = 150;
    var scaleMin = 0.8;
    var scaleMax = 1.8;
    var x = function (value) {
      return left + ((value - scaleMin) / (scaleMax - scaleMin)) * (right - left);
    };

    var svg = svgElement("svg", {
      class: "evidence-chart evidence-chart--range",
      viewBox: "0 0 " + width + " " + height
    });
    appendSvgTitle(
      svg,
      data.title,
      "A hazard-ratio reference line at 1 and a reported programme-level range from 1.2 to 1.6.",
      "ascvd-range"
    );

    [0.8, 1, 1.2, 1.4, 1.6, 1.8].forEach(function (tick) {
      var tickX = x(tick);
      svg.appendChild(svgElement("line", {
        x1: tickX,
        y1: 78,
        x2: tickX,
        y2: axisY + 12,
        class: tick === 1 ? "chart-reference" : "chart-gridline"
      }));
      svg.appendChild(svgElement("text", {
        x: tickX,
        y: axisY + 38,
        class: "chart-tick",
        "text-anchor": "middle"
      }, formatNumber(tick)));
    });

    svg.appendChild(svgElement("text", {
      x: x(1),
      y: 58,
      class: "chart-annotation",
      "text-anchor": "middle"
    }, "Reference: HR 1"));

    svg.appendChild(svgElement("line", {
      x1: x(data.range.lower),
      y1: axisY,
      x2: x(data.range.upper),
      y2: axisY,
      pathLength: 1,
      class: "range-estimate"
    }));
    [data.range.lower, data.range.upper].forEach(function (value) {
      var endpoint = svgElement("circle", {
        cx: x(value),
        cy: axisY,
        r: 7,
        class: "range-endpoint",
        tabindex: 0,
        role: "img",
        "aria-label": "Reported hazard-ratio range endpoint: " + formatNumber(value),
        "data-chart-tooltip": "Reported hazard-ratio range endpoint: " + formatNumber(value)
      });
      svg.appendChild(endpoint);
      svg.appendChild(svgElement("text", {
        x: x(value),
        y: axisY - 22,
        class: "chart-value",
        "text-anchor": "middle"
      }, formatNumber(value)));
    });
    svg.appendChild(svgElement("text", {
      x: (x(data.range.lower) + x(data.range.upper)) / 2,
      y: 222,
      class: "chart-axis-label",
      "text-anchor": "middle"
    }, "Hazard ratio"));

    mount.appendChild(svg);
    tableMount.appendChild(createTable(
      ["Reported element", "Value", "Context"],
      [
        ["Reference", "1.0", "High-risk group"],
        ["Programme-level hazard-ratio range", "1.2–1.6", "Very-high-risk versus high-risk groups"],
        ["High-intensity statin use during hospitalization", "18%–34%", data.treatmentFinding.statement]
      ]
    ));
  }

  function renderAdOutcomes(figure, data, databases) {
    var mount = figure.querySelector("[data-chart-mount]");
    var controls = figure.querySelector("[data-chart-controls]");
    var tableMount = figure.querySelector("[data-table-mount]");
    var selected = new Set(data.databaseOrder);
    var scaleMode = "log";

    clear(controls);
    var scaleFieldset = htmlElement("fieldset", "scale-controls");
    scaleFieldset.appendChild(htmlElement("legend", "", "Horizontal scale"));
    ["log", "linear"].forEach(function (mode) {
      var label = htmlElement("label", "control-option");
      var input = htmlElement("input");
      input.type = "radio";
      input.name = "ad-scale";
      input.value = mode;
      input.checked = mode === scaleMode;
      input.addEventListener("change", function () {
        scaleMode = mode;
        draw();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(mode === "log" ? "Logarithmic" : "Linear"));
      scaleFieldset.appendChild(label);
    });
    controls.appendChild(scaleFieldset);
    addDatabaseControls(controls, "ad-outcomes", data.databaseOrder, databases, selected, draw);

    function draw() {
      clear(mount);
      clear(tableMount);
      var width = 920;
      var panelHeight = 168;
      var top = 34;
      var height = top + data.outcomes.length * panelHeight + 46;
      var labelX = 22;
      var zeroX = 182;
      var plotLeft = 235;
      var plotRight = 865;
      var positiveMin = 0.01;
      var positiveMax = 10;
      var linearMax = 6;

      function x(value) {
        if (value === 0) return zeroX;
        if (scaleMode === "linear") {
          return plotLeft + (value / linearMax) * (plotRight - plotLeft);
        }
        return plotLeft + ((Math.log10(value) - Math.log10(positiveMin)) / (Math.log10(positiveMax) - Math.log10(positiveMin))) * (plotRight - plotLeft);
      }

      var svg = svgElement("svg", {
        class: "evidence-chart evidence-chart--outcomes",
        viewBox: "0 0 " + width + " " + height
      });
      appendSvgTitle(
        svg,
        data.title,
        "Three panels show database-specific incidence-rate estimates and confidence intervals. A separate lane represents values reported as zero; the default positive-value scale is logarithmic.",
        "ad-outcomes"
      );

      data.outcomes.forEach(function (outcome, panelIndex) {
        var panelTop = top + panelIndex * panelHeight;
        var axisBottom = panelTop + 126;
        svg.appendChild(svgElement("text", {
          x: labelX,
          y: panelTop + 2,
          class: "chart-panel-title"
        }, outcome.label));
        svg.appendChild(svgElement("text", {
          x: zeroX,
          y: panelTop + 22,
          class: "chart-zero-label",
          "text-anchor": "middle"
        }, "Reported 0"));

        var ticks = scaleMode === "linear" ? [0, 1, 2, 3, 4, 5, 6] : [0.01, 0.1, 1, 10];
        ticks.forEach(function (tick) {
          var tickX = tick === 0 ? plotLeft : x(tick);
          svg.appendChild(svgElement("line", {
            x1: tickX,
            y1: panelTop + 30,
            x2: tickX,
            y2: axisBottom,
            class: "chart-gridline"
          }));
          svg.appendChild(svgElement("text", {
            x: tickX,
            y: axisBottom + 18,
            class: "chart-tick",
            "text-anchor": "middle"
          }, formatNumber(tick)));
        });

        var rowIndex = 0;
        data.databaseOrder.forEach(function (code) {
          if (!selected.has(code)) return;
          var value = outcome.values[code];
          var y = panelTop + 40 + rowIndex * 17;
          rowIndex += 1;

          svg.appendChild(svgElement("text", {
            x: 148,
            y: y + 4,
            class: "chart-database-label",
            "text-anchor": "end"
          }, code));

          if (value.estimate > 0) {
            svg.appendChild(svgElement("line", {
              x1: x(value.lower),
              y1: y,
              x2: x(value.upper),
              y2: y,
              pathLength: 1,
              stroke: databases[code].color,
              class: "confidence-interval"
            }));
          }
          var marker = appendMarker(svg, x(value.estimate), y, databases[code], 5, value.estimate === 0);
          var tooltip = outcome.label + " · " + code + ": " + formatNumber(value.estimate) + " events per person-year (95% CI " + formatNumber(value.lower) + "–" + formatNumber(value.upper) + ")";
          marker.setAttribute("tabindex", "0"); marker.setAttribute("role", "img"); marker.setAttribute("aria-label", tooltip); marker.setAttribute("data-chart-tooltip", tooltip);
        });
      });

      svg.appendChild(svgElement("text", {
        x: (plotLeft + plotRight) / 2,
        y: height - 8,
        class: "chart-axis-label",
        "text-anchor": "middle"
      }, "Incidence rate (events per person-year)"));
      mount.appendChild(svg);

      var rows = [];
      data.outcomes.forEach(function (outcome) {
        data.databaseOrder.forEach(function (code) {
          if (!selected.has(code)) return;
          var value = outcome.values[code];
          rows.push([
            outcome.label,
            code,
            formatNumber(value.estimate),
            formatNumber(value.lower) + "–" + formatNumber(value.upper)
          ]);
        });
      });
      tableMount.appendChild(createTable(
        ["Outcome", "Database", "Estimate", "Confidence interval"],
        rows
      ));
    }

    draw();
  }

  function renderCaseDefinitions(figure, data, databases) {
    var mount = figure.querySelector("[data-chart-mount]");
    var controls = figure.querySelector("[data-chart-controls]");
    var tableMount = figure.querySelector("[data-table-mount]");
    var explanation = figure.querySelector("[data-definition-explanation]");
    var diseaseCode = "AD";
    var emphasizedDefinition = "d1";
    var selected = new Set(data.databaseOrder);

    clear(controls);
    var diseaseFieldset = htmlElement("fieldset", "disease-controls");
    diseaseFieldset.appendChild(htmlElement("legend", "", "Disease"));
    Object.keys(data.diseases).forEach(function (code) {
      var label = htmlElement("label", "control-option");
      var input = htmlElement("input");
      input.type = "radio";
      input.name = "case-definition-disease";
      input.value = code;
      input.checked = code === diseaseCode;
      input.addEventListener("change", function () {
        diseaseCode = code;
        draw();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(data.diseases[code].label + " (" + code + ")"));
      diseaseFieldset.appendChild(label);
    });
    controls.appendChild(diseaseFieldset);

    var definitionFieldset = htmlElement("fieldset", "definition-controls");
    definitionFieldset.appendChild(htmlElement("legend", "", "Definition emphasis"));
    data.definitions.forEach(function (definition) {
      var label = htmlElement("label", "control-option");
      var input = htmlElement("input");
      input.type = "radio";
      input.name = "case-definition-emphasis";
      input.value = definition.id;
      input.checked = definition.id === emphasizedDefinition;
      input.addEventListener("change", function () {
        emphasizedDefinition = definition.id;
        draw();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(definition.shortLabel));
      definitionFieldset.appendChild(label);
    });
    controls.appendChild(definitionFieldset);
    addDatabaseControls(controls, "case-definitions", data.databaseOrder, databases, selected, draw);

    function draw() {
      clear(mount);
      clear(tableMount);
      var disease = data.diseases[diseaseCode];
      var width = 900;
      var height = 505;
      var left = 115;
      var right = 820;
      var top = 45;
      var bottom = 420;
      var xPositions = [left + 70, (left + right) / 2, right - 70];
      var minValue = 0.001;
      var maxValue = 100;
      var y = function (value) {
        return bottom - ((Math.log10(value) - Math.log10(minValue)) / (Math.log10(maxValue) - Math.log10(minValue))) * (bottom - top);
      };

      var svg = svgElement("svg", {
        class: "evidence-chart evidence-chart--slope",
        viewBox: "0 0 " + width + " " + height
      });
      appendSvgTitle(
        svg,
        disease.label + " prevalence by case definition",
        "A logarithmic slope chart compares adult 2020 prevalence across three fixed case definitions. Missing values create visible gaps and are not treated as zero.",
        "case-definition-" + diseaseCode.toLowerCase()
      );

      var emphasizedIndex = data.definitions.findIndex(function (definition) {
        return definition.id === emphasizedDefinition;
      });
      svg.appendChild(svgElement("rect", {
        x: xPositions[emphasizedIndex] - 48,
        y: top,
        width: 96,
        height: bottom - top,
        rx: 6,
        class: "chart-definition-highlight"
      }));

      [0.001, 0.01, 0.1, 1, 10, 100].forEach(function (tick) {
        var tickY = y(tick);
        svg.appendChild(svgElement("line", {
          x1: left,
          y1: tickY,
          x2: right,
          y2: tickY,
          class: "chart-gridline"
        }));
        svg.appendChild(svgElement("text", {
          x: left - 18,
          y: tickY + 4,
          class: "chart-tick",
          "text-anchor": "end"
        }, formatNumber(tick) + "%"));
      });

      data.definitions.forEach(function (definition, index) {
        var tickX = xPositions[index];
        svg.appendChild(svgElement("line", {
          x1: tickX,
          y1: top,
          x2: tickX,
          y2: bottom,
          class: "chart-definition-line"
        }));
        svg.appendChild(svgElement("text", {
          x: tickX,
          y: bottom + 32,
          class: "chart-definition-label",
          "text-anchor": "middle"
        }, definition.shortLabel));
      });

      data.databaseOrder.forEach(function (code) {
        if (!selected.has(code)) return;
        var values = disease.values[code];
        var database = databases[code];

        for (var index = 0; index < data.definitions.length - 1; index += 1) {
          var current = values[data.definitions[index].id];
          var next = values[data.definitions[index + 1].id];
          if (current === null || next === null) continue;
          svg.appendChild(svgElement("line", {
            x1: xPositions[index],
            y1: y(current),
            x2: xPositions[index + 1],
            y2: y(next),
            pathLength: 1,
            stroke: database.color,
            class: "slope-segment"
          }));
        }

        data.definitions.forEach(function (definition, index) {
          var value = values[definition.id];
          if (value === null) {
            svg.appendChild(svgElement("text", {
              x: xPositions[index],
              y: top - 10,
              class: "chart-not-reported",
              "text-anchor": "middle"
            }, code + ": not reported"));
            return;
          }
          var marker = appendMarker(svg, xPositions[index], y(value), database, 5, false);
          var tooltip = code + " · " + definition.shortLabel + ": " + formatNumber(value) + "%";
          marker.appendChild(svgElement("title", {}, tooltip));
          marker.setAttribute("tabindex", "0"); marker.setAttribute("role", "img"); marker.setAttribute("aria-label", tooltip); marker.setAttribute("data-chart-tooltip", tooltip);
        });
      });

      svg.appendChild(svgElement("text", {
        x: 18,
        y: (top + bottom) / 2,
        class: "chart-axis-label",
        transform: "rotate(-90 18 " + ((top + bottom) / 2) + ")",
        "text-anchor": "middle"
      }, "Prevalence (%, logarithmic scale)"));
      mount.appendChild(svg);

      if (explanation) {
        var selectedDefinition = data.definitions[emphasizedIndex];
        var explanationText = selectedDefinition.shortLabel + " — " + selectedDefinition.label+".";
        if (selectedDefinition.databaseSpecificNote) explanationText += " " + selectedDefinition.databaseSpecificNote;
        explanation.textContent = explanationText;
      }

      var rows = [];
      data.databaseOrder.forEach(function (code) {
        if (!selected.has(code)) return;
        var values = disease.values[code];
        rows.push([
          code + (databases[code].sourceMarker || ""),
          formatNumber(values.d1),
          formatNumber(values.d2),
          formatNumber(values.d3)
        ]);
      });
      tableMount.appendChild(createTable(
        ["Database", "D1 (%)", "D2 (%)", "D3 (%)"],
        rows
      ));
    }

    draw();
  }

  function showLoadError(message) {
    document.querySelectorAll("[data-chart-status]").forEach(function (status) {
      status.textContent = message;
      status.classList.add("chart-error");
    });
  }

  var figures = document.querySelectorAll("[data-evidence-figure]");
  if (!figures.length) return;

  fetch("assets/data/results.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Evidence data returned HTTP " + response.status + ".");
      return response.json();
    })
    .then(function (payload) {
      var ascvdFigure = document.querySelector('[data-evidence-figure="ascvd"]');
      var outcomesFigure = document.querySelector('[data-evidence-figure="ad-outcomes"]');
      var definitionsFigure = document.querySelector('[data-evidence-figure="case-definitions"]');

      if (ascvdFigure) renderAscvd(ascvdFigure, payload.figures.ascvdRisk);
      if (outcomesFigure) renderAdOutcomes(outcomesFigure, payload.figures.adOutcomes, payload.databases);
      if (definitionsFigure) renderCaseDefinitions(definitionsFigure, payload.figures.caseDefinitionPrevalence, payload.databases);

      document.querySelectorAll("[data-chart-status]").forEach(function (status) {
        status.hidden = true;
      });
      document.dispatchEvent(new CustomEvent("impresive:content-ready"));
    })
    .catch(function (error) {
      showLoadError("The figure data could not be loaded. Use the source notes below or view this site through its local web server. " + error.message);
    });
})();
