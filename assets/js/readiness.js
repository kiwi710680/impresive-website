/* Data readiness questionnaire built on the PHDcenter-modified Sentinel CDM
   (mSCDM 8.1.0). Each variable is rated Available / Derivable / Not available /
   Not yet known against its mSCDM definition. Answers stay in page memory only. */
(function () {
  "use strict";

  var root = document.querySelector("[data-readiness-questionnaire]");
  var instrument = window.IMPRESIVE_READINESS;
  if (!root || !instrument) return;

  var STATUSES = [
    { id: "available", label: "Available", hint: "Recorded directly in the source data" },
    { id: "derivable", label: "Derivable", hint: "Obtainable by transformation, calculation, or linkage" },
    { id: "not-available", label: "Not available", hint: "Absent from the local data environment" },
    { id: "not-known", label: "Not yet known", hint: "Still to be confirmed with the data owner" }
  ];
  var STATUS_LABEL = {};
  STATUSES.forEach(function (s) { STATUS_LABEL[s.id] = s.label; });
  var POINTS = { "available": 1, "derivable": 0.75, "not-available": 0, "not-known": 0 };
  var WEIGHT = { essential: 2, supplementary: 1 };
  var TABLE_STATUS = {
    "ready": { label: "Ready", tone: "ready" },
    "derivable": { label: "Ready with derivation", tone: "derivable" },
    "not-ready": { label: "Not ready", tone: "not-ready" },
    "incomplete": { label: "Incomplete", tone: "incomplete" }
  };

  var answers = {};   /* "table/variable" -> status id */
  var notes = {};     /* table id -> free-text note */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function key(table, variable) { return table.id + "/" + variable.name; }
  function pct(value) { return Math.round(value * 100) + "%"; }
  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  /* Multi-line source text: lines that start with a bullet become a list. */
  function richText(text, className) {
    var wrap = el("div", className);
    var list = null;
    text.split("\n").forEach(function (line) {
      var bullet = /^[•\-]\s*/.test(line);
      if (bullet) {
        if (!list) { list = el("ul"); wrap.appendChild(list); }
        list.appendChild(el("li", "", line.replace(/^[•\-]\s*/, "")));
      } else {
        list = null;
        wrap.appendChild(el("p", "", line));
      }
    });
    return wrap;
  }

  /* ------------------------------------------------------------ scoring */

  function scoreTable(table) {
    var earned = 0, possible = 0, answered = 0;
    var gaps = { critical: [], unresolved: [], derive: [], minor: [] };
    var essentialDerivable = 0;
    var tally = { "available": 0, "derivable": 0, "not-available": 0, "not-known": 0 };
    table.variables.forEach(function (variable) {
      var status = answers[key(table, variable)];
      var weight = variable.essential ? WEIGHT.essential : WEIGHT.supplementary;
      possible += weight;
      if (status) { answered += 1; earned += weight * POINTS[status]; tally[status] += 1; }
      if (variable.essential) {
        if (status === "derivable") { essentialDerivable += 1; gaps.derive.push(variable.name); }
        if (status === "not-available") gaps.critical.push(variable.name);
        if (!status || status === "not-known") gaps.unresolved.push(variable.name);
      } else if (status === "not-available") {
        gaps.minor.push(variable.name);
      }
    });
    var state;
    if (gaps.critical.length) state = "not-ready";
    else if (gaps.unresolved.length) state = "incomplete";
    else if (essentialDerivable) state = "derivable";
    else state = "ready";
    return {
      table: table, score: possible ? earned / possible : 0, answered: answered,
      total: table.variables.length, state: state, gaps: gaps, tally: tally
    };
  }

  function scoreAll() {
    var results = instrument.tables.map(scoreTable);
    var core = results.filter(function (r) { return r.table.tier === "core"; });
    var supporting = results.filter(function (r) { return r.table.tier !== "core"; });
    var mean = function (list) {
      return list.length ? list.reduce(function (sum, r) { return sum + r.score; }, 0) / list.length : 0;
    };
    var answered = results.reduce(function (sum, r) { return sum + r.answered; }, 0);
    var total = results.reduce(function (sum, r) { return sum + r.total; }, 0);
    var count = function (list, states) {
      return list.filter(function (r) { return states.indexOf(r.state) >= 0; }).length;
    };
    var verdict;
    var coreBlocked = count(core, ["not-ready"]);
    var coreOpen = count(core, ["incomplete"]);
    if (!answered) {
      verdict = { tone: "idle", title: "Not started", text: "Open a table and rate each variable against its mSCDM definition. This summary updates as you answer." };
    } else if (coreBlocked) {
      verdict = { tone: "not-ready", title: "Essential gaps in " + plural(coreBlocked, "core table"),
        text: "At least one essential variable is not available. Those tables cannot be converted as specified; discuss a proxy, an additional source, or a narrower study scope." };
    } else if (coreOpen) {
      verdict = { tone: "incomplete", title: "Assessment in progress",
        text: plural(coreOpen, "core table") + " still " + (coreOpen > 1 ? "have" : "has") + " essential variables unanswered or not yet known." };
    } else if (count(core, ["derivable"])) {
      verdict = { tone: "derivable", title: "Ready for conversion planning, with derivation work",
        text: "Every essential core variable is available or derivable. Document each derivation rule before conversion begins." };
    } else {
      verdict = { tone: "ready", title: "Ready for conversion planning",
        text: "Every essential core variable is directly available. Study-specific definitions, quality checks, and governance review are still required." };
    }
    return {
      results: results, core: core, supporting: supporting,
      coreIndex: mean(core), supportingIndex: mean(supporting),
      answered: answered, total: total,
      coreReady: count(core, ["ready", "derivable"]), verdict: verdict
    };
  }

  function priorityActions(state) {
    var out = [];
    var push = function (level, pick, text) {
      state.results.forEach(function (r) {
        var names = pick(r);
        if (names && names.length) out.push({ level: level, table: r.table.label, text: text(r, names) });
      });
    };
    push("critical", function (r) { return r.gaps.critical; },
      function (r, n) { return r.table.label + ": essential variable not available — " + n.join(", "); });
    push("unresolved", function (r) { return r.answered ? r.gaps.unresolved : null; },
      function (r, n) { return r.table.label + ": confirm " + n.join(", "); });
    push("derive", function (r) { return r.gaps.derive; },
      function (r, n) { return r.table.label + ": document the derivation of " + n.join(", "); });
    push("minor", function (r) { return r.gaps.minor; },
      function (r, n) { return r.table.label + ": supplementary variable not available — " + n.join(", "); });
    return out;
  }

  /* --------------------------------------------------------- the form */

  var form = root.querySelector("[data-readiness-form]");
  var summary = root.querySelector("[data-readiness-summary]");
  var tableViews = {};
  var CHEVRON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function statusPicker(table, variable) {
    var group = el("div", "rq-choices");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", variable.name + " availability");
    STATUSES.forEach(function (status) {
      var label = el("label", "rq-choice rq-choice--" + status.id);
      label.title = status.hint;
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "rq-" + table.id + "-" + variable.name;
      input.value = status.id;
      input.addEventListener("change", function () {
        answers[key(table, variable)] = status.id;
        update();
      });
      label.appendChild(input);
      label.appendChild(el("span", "", status.label));
      group.appendChild(label);
    });
    return group;
  }

  function variableRow(table, variable) {
    var row = el("div", "rq-var");
    var text = el("div", "rq-var__text");
    var head = el("div", "rq-var__head");
    head.appendChild(el("code", "rq-var__name", variable.name));
    if (variable.essential) head.appendChild(el("span", "rq-tag rq-tag--essential", "Essential"));
    head.appendChild(el("span", "rq-var__type", variable.type));
    text.appendChild(head);
    text.appendChild(richText(variable.definition, "rq-var__definition"));

    var more = el("details", "rq-var__spec");
    more.appendChild(el("summary", "", "Values, missing-value rule, and example"));
    var spec = el("dl");
    [["Values", variable.values], ["Missing allowed", variable.missingAllowed], ["Example", variable.example]]
      .forEach(function (pair) {
        if (!pair[1]) return;
        spec.appendChild(el("dt", "", pair[0]));
        var dd = el("dd");
        dd.appendChild(richText(pair[1].replace(/\s+\/\s+/g, "\n"), "rq-var__values"));
        spec.appendChild(dd);
      });
    more.appendChild(spec);
    text.appendChild(more);
    row.appendChild(text);
    row.appendChild(statusPicker(table, variable));
    return row;
  }

  function buildForm() {
    clear(form);
    [["core", "Core tables", "Needed for a full mSCDM conversion and scored in the core readiness index."],
     ["supporting", "Supporting tables", "Reference tables for facilities, providers, and drug strength, scored separately."]]
      .forEach(function (group) {
        var tables = instrument.tables.filter(function (t) { return (t.tier === "core") === (group[0] === "core"); });
        var wrap = el("section", "rq-group");
        var head = el("header", "rq-group__head");
        head.appendChild(el("h3", "", group[1] + " · " + tables.length));
        head.appendChild(el("p", "", group[2]));
        wrap.appendChild(head);
        var list = el("div", "rq-group__list");
        tables.forEach(function (table) { list.appendChild(tableSection(table)); });
        wrap.appendChild(list);
        form.appendChild(wrap);
      });
  }

  /* Every table starts collapsed; the summary links open the one chosen. */
  function tableSection(table) {
    var section = el("details", "rq-table");
    section.id = "rq-" + table.id;
    var essentialCount = table.variables.filter(function (v) { return v.essential; }).length;

    var line = el("summary", "rq-table__summary");
    var chevron = el("span", "rq-table__chevron");
    chevron.innerHTML = CHEVRON;
    line.appendChild(chevron);
    var title = el("span", "rq-table__title");
    title.appendChild(el("strong", "", table.label));
    title.appendChild(el("small", "", table.variables.length + " variables · " + essentialCount + " essential"));
    line.appendChild(title);
    var meter = el("span", "rq-table__meter");
    var mix = el("span", "rq-mix");
    mix.setAttribute("aria-hidden", "true");
    var progress = el("span", "rq-table__progress");
    meter.appendChild(mix);
    meter.appendChild(progress);
    line.appendChild(meter);
    var chip = el("span", "rq-status");
    line.appendChild(chip);
    section.appendChild(line);

    var body = el("div", "rq-table__body");
    var intro = el("div", "rq-table__intro");
    intro.appendChild(richText(table.description, "rq-table__description"));
    body.appendChild(intro);

    var toolbar = el("div", "rq-table__toolbar");
    toolbar.appendChild(el("span", "", "Rate each variable below. Essential variables decide the table’s status."));
    var fill = el("button", "rq-link-button", "Mark the rest as Available");
    fill.type = "button";
    fill.addEventListener("click", function () {
      table.variables.forEach(function (variable) {
        var id = key(table, variable);
        if (answers[id]) return;
        answers[id] = "available";
        var input = section.querySelector('input[name="rq-' + table.id + "-" + variable.name + '"][value="available"]');
        if (input) input.checked = true;
      });
      update();
    });
    toolbar.appendChild(fill);
    body.appendChild(toolbar);

    var vars = el("div", "rq-table__vars");
    table.variables.forEach(function (variable) { vars.appendChild(variableRow(table, variable)); });
    body.appendChild(vars);

    var noteLabel = el("label", "rq-note");
    noteLabel.appendChild(el("span", "", "Derivation rules or local source notes (optional)"));
    var note = document.createElement("textarea");
    note.rows = 2;
    note.placeholder = "For example: Enr_End derived as the earlier of death date and database end date";
    note.addEventListener("input", function () { notes[table.id] = note.value.trim(); });
    noteLabel.appendChild(note);
    body.appendChild(noteLabel);
    section.appendChild(body);
    tableViews[table.id] = { section: section, progress: progress, chip: chip, mix: mix, fill: fill };
    return section;
  }

  /* -------------------------------------------------------- the summary */

  function renderSummary(state) {
    clear(summary);
    var head = el("div", "rq-score rq-score--" + state.verdict.tone);
    head.appendChild(el("h3", "rq-score__heading", "Readiness summary"));
    var figure = el("p", "rq-score__figure");
    figure.appendChild(el("strong", "", pct(state.coreIndex)));
    figure.appendChild(el("span", "", "core readiness index"));
    head.appendChild(figure);

    /* One cell per core table, coloured by its current state. */
    var strip = el("ol", "rq-strip");
    strip.setAttribute("aria-label", "Core tables: " + state.coreReady + " of " + state.core.length + " ready");
    state.core.forEach(function (r) {
      var cell = el("li", "rq-strip__cell rq-strip__cell--" + (r.answered ? TABLE_STATUS[r.state].tone : "idle"));
      cell.title = r.table.label + ": " + (r.answered ? TABLE_STATUS[r.state].label : "Not started");
      strip.appendChild(cell);
    });
    head.appendChild(strip);

    var facts = el("dl", "rq-facts");
    [["Core tables ready", state.coreReady + " / " + state.core.length],
     ["Supporting tables", pct(state.supportingIndex)],
     ["Variables answered", state.answered + " / " + state.total]].forEach(function (pair) {
      var item = el("div");
      item.appendChild(el("dt", "", pair[0]));
      item.appendChild(el("dd", "", pair[1]));
      facts.appendChild(item);
    });
    head.appendChild(facts);
    summary.appendChild(head);

    var verdict = el("div", "rq-verdict");
    verdict.appendChild(el("h4", "", state.verdict.title));
    verdict.appendChild(el("p", "", state.verdict.text));
    summary.appendChild(verdict);

    var actions = priorityActions(state);
    if (actions.length && state.answered) {
      var follow = el("div", "rq-followup");
      follow.appendChild(el("h4", "", "Priority follow-up"));
      var ul = el("ul", "rq-actions");
      actions.slice(0, 3).forEach(function (a) { ul.appendChild(el("li", "rq-actions__" + a.level, a.text)); });
      if (actions.length > 3) ul.appendChild(el("li", "rq-actions__more", plural(actions.length - 3, "more item") + " in the full report"));
      follow.appendChild(ul);
      summary.appendChild(follow);
    }
  }

  function update() {
    var state = scoreAll();
    state.results.forEach(function (r) {
      var view = tableViews[r.table.id];
      /* Answer mix: one segment per status, unanswered share left blank. */
      clear(view.mix);
      STATUSES.forEach(function (status) {
        if (!r.tally[status.id]) return;
        var seg = el("span", "rq-mix__seg rq-mix__seg--" + status.id);
        seg.style.flexGrow = r.tally[status.id];
        view.mix.appendChild(seg);
      });
      var open = r.total - r.answered;
      if (open) { var rest = el("span", "rq-mix__seg"); rest.style.flexGrow = open; view.mix.appendChild(rest); }
      view.progress.textContent = r.answered + " of " + r.total + " answered";
      view.chip.className = "rq-status rq-status--" + (r.answered ? TABLE_STATUS[r.state].tone : "idle");
      view.chip.textContent = r.answered ? TABLE_STATUS[r.state].label + " · " + pct(r.score) : "Not started";
      view.fill.hidden = open === 0;
    });
    renderSummary(state);
    return state;
  }

  /* ------------------------------------------------------ formal report */

  var reportFields = {};
  root.querySelectorAll("[data-report-field]").forEach(function (input) {
    reportFields[input.getAttribute("data-report-field")] = input;
  });
  function field(name) { return reportFields[name] ? reportFields[name].value.trim() : ""; }

  function reportDate() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  /* One model feeds the printed page, the HTML clipboard copy, and the plain
     text copy, so the three never disagree. */
  function reportModel() {
    var state = scoreAll();
    return {
      state: state,
      title: "Data Readiness Self-Assessment Report",
      standard: instrument.source,
      meta: [
        ["Data environment", field("environment") || "Not specified"],
        ["Prepared by", field("preparer") || "Not specified"],
        ["Date of assessment", reportDate()],
        ["Reference standard", instrument.source]
      ],
      headline: [
        ["Overall result", state.verdict.title],
        ["Core readiness index", pct(state.coreIndex)],
        ["Core tables ready", state.coreReady + " of " + state.core.length],
        ["Supporting tables index", pct(state.supportingIndex)],
        ["Variables answered", state.answered + " of " + state.total]
      ],
      actions: priorityActions(state)
    };
  }

  function cell(tag, text, className) {
    var node = el(tag, className, text);
    return node;
  }

  function htmlTable(headers, rows, className) {
    var table = el("table", className);
    var thead = el("thead");
    var tr = el("tr");
    headers.forEach(function (h) { tr.appendChild(cell("th", h)); });
    thead.appendChild(tr);
    table.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (row) {
      var r = el("tr");
      row.forEach(function (value, i) {
        var td = cell(i === 0 ? "th" : "td", value);
        if (i === 0) td.scope = "row";
        r.appendChild(td);
      });
      tbody.appendChild(r);
    });
    table.appendChild(tbody);
    return table;
  }

  function buildReport() {
    var m = reportModel();
    var doc = el("article", "rq-report");
    var header = el("header", "rq-report__header");
    header.appendChild(el("p", "rq-report__org", "IMPRESIVE · Study Preparedness Platform"));
    header.appendChild(el("h1", "", m.title));
    header.appendChild(el("p", "rq-report__standard", m.standard));
    doc.appendChild(header);

    var meta = el("dl", "rq-report__meta");
    m.meta.forEach(function (pair) {
      var item = el("div");
      item.appendChild(el("dt", "", pair[0]));
      item.appendChild(el("dd", "", pair[1]));
      meta.appendChild(item);
    });
    doc.appendChild(meta);

    doc.appendChild(el("h2", "", "1. Overall result"));
    doc.appendChild(htmlTable(["Measure", "Result"], m.headline, "rq-report__table rq-report__table--key"));
    doc.appendChild(el("p", "", m.state.verdict.text));

    doc.appendChild(el("h2", "", "2. Readiness by table"));
    doc.appendChild(htmlTable(["Table", "Tier", "Status", "Score", "Answered", "Essential gaps"],
      m.state.results.map(function (r) {
        var gaps = r.gaps.critical.concat(r.answered ? r.gaps.unresolved : []);
        return [r.table.label, r.table.tier === "core" ? "Core" : "Supporting",
          r.answered ? TABLE_STATUS[r.state].label : "Not started",
          r.answered ? pct(r.score) : "—", r.answered + " / " + r.total, gaps.length ? gaps.join(", ") : "None"];
      }), "rq-report__table"));

    doc.appendChild(el("h2", "", "3. Priority follow-up"));
    if (m.actions.length) {
      var ol = el("ol", "rq-report__actions");
      m.actions.forEach(function (a) { ol.appendChild(el("li", "", a.text)); });
      doc.appendChild(ol);
    } else {
      doc.appendChild(el("p", "", m.state.answered ? "No follow-up items." : "No variables have been rated yet."));
    }

    doc.appendChild(el("h2", "", "4. Variable-level responses"));
    m.state.results.forEach(function (r) {
      var block = el("section", "rq-report__block");
      block.appendChild(el("h3", "", r.table.label + " table" + (r.table.tier === "core" ? "" : " (supporting)")));
      block.appendChild(htmlTable(["Variable", "Type", "Essential", "Response"],
        r.table.variables.map(function (v) {
          return [v.name, v.type, v.essential ? "Yes" : "No", STATUS_LABEL[answers[key(r.table, v)]] || "Unanswered"];
        }), "rq-report__table rq-report__table--vars"));
      if (notes[r.table.id]) block.appendChild(el("p", "rq-report__note", "Note: " + notes[r.table.id]));
      doc.appendChild(block);
    });

    doc.appendChild(el("h2", "", "5. Scoring method"));
    doc.appendChild(el("p", "", "Each response scores Available 100%, Derivable 75%, Not available 0%, Not yet known 0%. Essential variables count twice as much as supplementary variables. A table is Not ready if any essential variable is not available, Incomplete if any essential variable is unanswered or not yet known, Ready with derivation if any essential variable is only derivable, and otherwise Ready. The core readiness index is the mean score of the eight core tables."));
    var foot = el("footer", "rq-report__footer");
    foot.appendChild(el("p", "", "This self-assessment is a planning aid. It is not partner certification or formal study approval, and does not replace study-specific feasibility protocols or formal data reviews."));
    doc.appendChild(foot);
    return doc;
  }

  function reportText() {
    var m = reportModel();
    var rule = "------------------------------------------------------------";
    var lines = [m.title.toUpperCase(), m.standard, rule];
    m.meta.forEach(function (p) { lines.push(p[0] + ": " + p[1]); });
    lines.push("", "1. OVERALL RESULT", rule);
    m.headline.forEach(function (p) { lines.push(p[0] + ": " + p[1]); });
    lines.push(m.state.verdict.text, "", "2. READINESS BY TABLE", rule);
    m.state.results.forEach(function (r) {
      lines.push(r.table.label + " (" + (r.table.tier === "core" ? "core" : "supporting") + "): " +
        (r.answered ? TABLE_STATUS[r.state].label + ", score " + pct(r.score) : "Not started") +
        ", " + r.answered + " of " + r.total + " answered");
    });
    lines.push("", "3. PRIORITY FOLLOW-UP", rule);
    if (m.actions.length) m.actions.forEach(function (a, i) { lines.push((i + 1) + ". " + a.text); });
    else lines.push(m.state.answered ? "No follow-up items." : "No variables have been rated yet.");
    lines.push("", "4. VARIABLE-LEVEL RESPONSES", rule);
    m.state.results.forEach(function (r) {
      lines.push(r.table.label + " table");
      r.table.variables.forEach(function (v) {
        lines.push("  - " + v.name + (v.essential ? " [essential]" : "") + ": " + (STATUS_LABEL[answers[key(r.table, v)]] || "Unanswered"));
      });
      if (notes[r.table.id]) lines.push("  Note: " + notes[r.table.id]);
    });
    lines.push("", rule, "This self-assessment is a planning aid. It is not partner certification or formal study approval.");
    return lines.join("\n");
  }

  function printReport() {
    var old = document.querySelector("body > .rq-report");
    if (old) old.remove();
    var report = buildReport();
    document.body.appendChild(report);
    document.body.classList.add("rq-printing");
    var done = function () {
      document.body.classList.remove("rq-printing");
      report.remove();
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
    /* Some browsers return from print() before afterprint fires. */
    window.setTimeout(function () { if (!window.matchMedia("print").matches) done(); }, 1000);
  }

  function copyReport() {
    var text = reportText();
    var html = '<div style="font-family:Arial,sans-serif;font-size:11pt">' + buildReport().outerHTML + "</div>";
    if (navigator.clipboard && window.isSecureContext && window.ClipboardItem) {
      return navigator.clipboard.write([new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" })
      })]).catch(function () { return navigator.clipboard.writeText(text); });
    }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand("copy");
      area.remove();
      if (ok) resolve(); else reject(new Error("Clipboard unavailable"));
    });
  }

  function csvCell(value) {
    var text = String(value === undefined || value === null ? "" : value);
    return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function downloadCsv() {
    var rows = [["Data environment", "Date", "Table", "Tier", "Variable", "Type", "Essential", "Response", "Table status", "Table score", "Table note"]];
    var state = scoreAll();
    state.results.forEach(function (r) {
      r.table.variables.forEach(function (v) {
        rows.push([field("environment"), reportDate(), r.table.label, r.table.tier, v.name, v.type, v.essential ? "Yes" : "No",
          STATUS_LABEL[answers[key(r.table, v)]] || "Unanswered",
          r.answered ? TABLE_STATUS[r.state].label : "Not started", r.answered ? pct(r.score) : "", notes[r.table.id] || ""]);
      });
    });
    var blob = new Blob(["﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n")], { type: "text/csv;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "impresive-data-readiness-" + reportDate() + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }

  function flash(button, message) {
    var original = button.textContent;
    button.textContent = message;
    window.setTimeout(function () { button.textContent = original; }, 1800);
  }

  var copyButton = root.querySelector("[data-readiness-copy]");
  var csvButton = root.querySelector("[data-readiness-csv]");
  var printButton = root.querySelector("[data-readiness-print]");
  var resetButton = root.querySelector("[data-readiness-reset]");

  if (copyButton) copyButton.addEventListener("click", function () {
    copyReport().then(function () { flash(copyButton, "Report copied"); }, function () { flash(copyButton, "Copy failed"); });
  });
  if (csvButton) csvButton.addEventListener("click", downloadCsv);
  if (printButton) printButton.addEventListener("click", printReport);
  if (resetButton) resetButton.addEventListener("click", function () {
    answers = {};
    notes = {};
    form.querySelectorAll("input").forEach(function (input) { input.checked = false; });
    form.querySelectorAll("textarea").forEach(function (area) { area.value = ""; });
    update();
  });

  buildForm();
  update();
})();
