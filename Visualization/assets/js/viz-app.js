/* Application controller: loads the data once, wires the shared study-cohort
   selector to every module, and reports failures where the user can see them. */
(function () {
  "use strict";

  var V = window.VIZ;

  function fail(message) {
    var status = document.querySelector("[data-viz-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.add("chart-error");
    status.classList.remove("chart-status");
    status.hidden = false;
  }

  function facts(study) {
    var mount = document.querySelector("[data-study-facts]");
    if (!mount) return;
    V.clear(mount);
    var main = study.cohortFlow["0"] || [];
    var target = main.filter(function (r) { return r.name === "targed_all"; })[0];
    var exposure = main.filter(function (r) { return r.name === "targed_exposure1"; })[0];
    var reference = main.filter(function (r) { return r.name === "targed_exposure2"; })[0];

    [
      ["Target population", target ? V.n(target.n) : "—"],
      ["Very high-risk", exposure ? V.n(exposure.n) : "—"],
      ["High-risk", reference ? V.n(reference.n) : "—"],
      ["Outcomes available", String(study.outcomes.length)]
    ].forEach(function (pair) {
      var box = document.createElement("div");
      box.appendChild(V.el("dt", "", pair[0]));
      box.appendChild(V.el("dd", "", pair[1]));
      mount.appendChild(box);
    });

    var source = document.querySelector("[data-study-source]");
    if (source) {
      var sourceParts = [
        "Data status: " + (study.source.status || "not stated"),
        study.source.source,
        study.source.source_method,
        "study metadata date " + (study.meta.update_date || "not stated")
      ].filter(Boolean);
      source.textContent = sourceParts.join(" · ") + ".";
    }
  }

  V.loadAll().then(function (state) {
    var study = state.study;
    facts(study);

    var periodSelect = document.querySelector("[data-period-select]");
    var periodNote = document.querySelector("[data-period-note]");
    Object.keys(study.dimensions.study_period).forEach(function (value) {
      var option = V.el("option", "", study.dimensions.study_period[value]);
      option.value = value;
      periodSelect.appendChild(option);
    });
    periodSelect.value = "0";

    var cohort = window.VIZ_COHORT.init(document.getElementById("cohort"));
    var characteristics = window.VIZ_CHARACTERISTICS.init(document.getElementById("characteristics"));
    var rates = window.VIZ_OUTCOMES.initEventRates(document.getElementById("rates"));
    var risk = window.VIZ_OUTCOMES.initRiskEstimate(document.getElementById("risk"));

    function applyPeriod() {
      var period = Number(periodSelect.value);
      cohort.setPeriod(period);
      characteristics.setSetting({ period: period, age: 0, sex: 0, hx: 0 });
      rates.setPeriod(period);
      risk.setPeriod(period);
    }

    periodSelect.addEventListener("change", applyPeriod);
    applyPeriod();

    var status = document.querySelector("[data-viz-status]");
    if (status) status.hidden = true;
    var app = document.querySelector("[data-viz-app]");
    if (app) app.hidden = false;
    V.setupChartDownloads(document);
    document.dispatchEvent(new CustomEvent("impresive:content-ready"));

  }).catch(function (error) {
    fail("The standardized outputs could not be loaded. Serve this folder over a local web server rather than opening the file directly. " + error.message);
  });
})();
