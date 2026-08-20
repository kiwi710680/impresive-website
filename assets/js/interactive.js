(function () {
  "use strict";

  function el(name, className, text) {
    var node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /* ----------------------------------------------------------
     ETL walkthrough — source deck slides 14 and 16.
     Turns the static four-step diagram into a step you can open,
     including the quality gate that sends the work back.
     ---------------------------------------------------------- */

  var ETL_STEPS = [
    {
      name: "Summarize the source database",
      question: "What is actually in this database?",
      body: "Document source structure, coding systems, date behaviour, field availability, and database-specific constraints before writing any conversion code.",
      produces: [
        "A source-data summary covering the eight target domains",
        "A record of which fields are direct, derivable, or unavailable"
      ],
      gate: null
    },
    {
      name: "Create and review the ETL document",
      question: "How will each source field become a target field?",
      body: "Specify structural mappings, source vocabulary handling, and database-specific variable definitions. The document is reviewed before implementation, not written afterwards to describe what happened.",
      produces: [
        "A reviewable transformation specification",
        "Mapping tables for standardized and non-standardized codes",
        "Documented derivation rules and their assumptions"
      ],
      gate: null
    },
    {
      name: "Implement ETL in SAS",
      question: "Does the specification survive contact with the real environment?",
      body: "Apply the reviewed specification inside the approved implementation environment. For the OMOP route this work was developed externally against dummy data and then transferred into the secure environment; the Sentinel route was implemented directly inside the secure SAS environment.",
      produces: [
        "Converted tables in the target common data structure",
        "An implementation log of adaptations and exceptions"
      ],
      gate: null
    },
    {
      name: "Perform data-quality checks",
      question: "Did conversion preserve what the study needs?",
      body: "Compare the transformed structure and study-relevant outputs against expectations. Conformance, completeness, and plausibility are assessed before any analysis is allowed to proceed.",
      produces: [
        "Quality-check output against the CDM specification",
        "A pass or fail decision that gates the analysis"
      ],
      gate: "A failed check does not end here. It returns the work to the ETL document, the mappings, the variable definitions, or the implementation — and the cycle repeats until review passes."
    }
  ];

  document.querySelectorAll("[data-etl-walkthrough]").forEach(function (widget) {
    var listMount = widget.querySelector("[data-etl-steps]");
    var detailMount = widget.querySelector("[data-etl-detail]");
    if (!listMount || !detailMount) return;

    var buttons = [];

    function show(index) {
      var step = ETL_STEPS[index];
      buttons.forEach(function (button, position) {
        button.setAttribute("aria-pressed", String(position === index));
      });

      clear(detailMount);
      detailMount.appendChild(el("p", "technical-label", "Step 0" + (index + 1)));
      detailMount.appendChild(el("h4", "", step.question));
      detailMount.appendChild(el("p", "", step.body));
      detailMount.appendChild(el("p", "technical-label", "What this step produces"));
      var list = document.createElement("ul");
      step.produces.forEach(function (item) { list.appendChild(el("li", "", item)); });
      detailMount.appendChild(list);
      if (step.gate) detailMount.appendChild(el("p", "etl-gate", step.gate));
    }

    clear(listMount);
    ETL_STEPS.forEach(function (step, index) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.appendChild(el("span", "step-num", "0" + (index + 1)));
      button.appendChild(el("span", "step-name", step.name));
      button.addEventListener("click", function () { show(index); });
      item.appendChild(button);
      listMount.appendChild(item);
      buttons.push(button);
    });

    show(0);
  });

})();
