(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var pages = [
    { id: "home", href: "index.html", label: "Home" },
    { id: "about", href: "about.html", label: "About" },
    { id: "why", href: "why.html", label: "Objective" },
    { id: "methods", href: "methods.html", label: "How" },
    { id: "cases", href: "cases.html", label: "Accomplishment" },
    { id: "databases", href: "databases.html", label: "Partner" },
    { id: "join", href: "join.html", label: "Join", cta: true }
  ];

  var caseChildren = { "case-ascvd": "cases", "case-adpn": "cases", "visualization": "cases" };

  var activePage = document.body.getAttribute("data-page") || "";
  var header = document.querySelector(".site-header");
  var footer = document.querySelector(".site-footer");
  var main = document.querySelector("main");

  var navPage = caseChildren[activePage] || activePage;

  function pageLink(page) {
    var current = page.id === navPage ? ' aria-current="page"' : "";
    var cssClass = page.cta ? ' class="nav-join"' : "";
    return '<a href="' + page.href + '"' + cssClass + current + '>' + page.label + "</a>";
  }

  if (main) {
    main.id = main.id || "main";
    var skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#" + main.id;
    skip.textContent = "Skip to content";
    document.body.insertBefore(skip, document.body.firstChild);
  }

  if (header) {
    header.innerHTML =
      '<div class="wrap nav">' +
        '<a class="brand" href="index.html" aria-label="IMPRESIVE home">' +
          '<img src="assets/img/favicon.svg" alt="">' +
          '<span>IMPRESIVE<small>Study preparedness platform</small></span>' +
        "</a>" +
        '<button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-navigation"><span class="nav-toggle-lines" aria-hidden="true"></span></button>' +
        '<nav class="nav-links" id="site-navigation" aria-label="Primary navigation">' + pages.map(pageLink).join("") + "</nav>" +
      "</div>";

    var toggle = header.querySelector(".nav-toggle");
    var navigation = header.querySelector(".nav-links");
    var closeMenu = function (returnFocus) {
      var wasOpen = navigation.classList.contains("is-open");
      navigation.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      if (returnFocus && wasOpen) toggle.focus();
    };

    toggle.addEventListener("click", function () {
      var isOpen = navigation.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      if (isOpen) {
        var firstLink = navigation.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });
    navigation.addEventListener("click", function (event) {
      if (event.target.tagName === "A") closeMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu(true);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1020) closeMenu(false);
    });
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (footer) {
    footer.innerHTML =
      '<div class="lego-parade-slot" aria-hidden="true"></div>' +
      '<div class="wrap">' +
        '<div class="footer-grid">' +
          '<div><div class="footer-brand"><img src="assets/img/favicon.svg" alt="">IMPRESIVE</div><p>International multi-database study preparedness for reproducible, privacy-preserving real-world evidence.</p></div>' +
          '<div><h3>Explore</h3><ul><li><a href="about.html">About IMPRESIVE</a></li><li><a href="why.html">Objectives for multinational studies</a></li><li><a href="methods.html">How IMPRESIVE works</a></li><li><a href="cases.html">Accomplishments</a></li></ul></div>' +
          '<div><h3>Evidence &amp; participation</h3><ul><li><a href="cases.html#case-register">Cases &amp; evidence</a></li><li><a href="databases.html">Partners &amp; readiness</a></li><li><a href="about.html#programme-roadmap">Programme roadmap</a></li><li><a href="about.html#governance-transparency">Governance &amp; transparency</a></li><li><a href="join.html">Join, FAQ &amp; contact</a></li></ul></div>' +
        "</div>" +
        '<div class="footer-bottom"><span>&copy; <span id="year"></span> IMPRESIVE</span><span>Prepared databases · Integrated evidence · Timely decisions</span></div>' +
      "</div>";
    var year = footer.querySelector("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  document.querySelectorAll("[data-timeline]").forEach(function (timeline) {
    var tabs = Array.from(timeline.querySelectorAll('[role="tab"]'));
    var panels = Array.from(timeline.querySelectorAll('[role="tabpanel"]'));

    function selectTab(tab) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (event) {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        var nextIndex;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else {
          var direction = event.key === "ArrowRight" ? 1 : -1;
          nextIndex = (index + direction + tabs.length) % tabs.length;
        }
        var next = tabs[nextIndex];
        selectTab(next);
        next.focus();
      });
    });
  });

  document.querySelectorAll("[data-model-comparator]").forEach(function (comparator) {
    var tabs = Array.from(comparator.querySelectorAll('.model-controls [role="tab"]'));
    var panels = Array.from(comparator.querySelectorAll("[data-model-panel]"));
    if (!tabs.length || tabs.length !== panels.length) return;

    function selectModel(tab) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });
    }

    comparator.classList.add("model-comparator-enhanced");
    selectModel(tabs[0]);

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectModel(tab); });
      tab.addEventListener("keydown", function (event) {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        var nextIndex;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else {
          var direction = event.key === "ArrowRight" ? 1 : -1;
          nextIndex = (index + direction + tabs.length) % tabs.length;
        }
        selectModel(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
  });

  document.querySelectorAll(".faq-question").forEach(function (button) {
    button.addEventListener("click", function () {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });

  document.querySelectorAll("[data-readiness-assessment]").forEach(function (assessment) {
    var form = assessment.querySelector("[data-assessment-form]");
    var summary = assessment.querySelector("[data-readiness-summary]");
    var summarizeButton = assessment.querySelector("[data-assessment-summarize]");
    var copyButton = assessment.querySelector("[data-assessment-copy]");
    var printButton = assessment.querySelector("[data-assessment-print]");
    if (!form || !summary || !summarizeButton || !copyButton || !printButton) return;

    var domainSelects = Array.from(form.querySelectorAll(".assessment-item select"));
    var contextFields = Array.from(form.querySelectorAll(".assessment-context textarea"));
    var currentSummary = "";
    var statusLabels = {
      "available": "Available — direct",
      "derivable": "Derivable — preparation required",
      "not-available": "Not available — feasibility issue",
      "not-known": "Not yet known — unresolved"
    };

    function appendSummaryMetric(list, label, value) {
      list.appendChild(Object.assign(document.createElement("dt"), { textContent: label }));
      list.appendChild(Object.assign(document.createElement("dd"), { textContent: String(value) }));
    }

    function assessmentRecords() {
      return domainSelects.map(function (select) {
        var item = select.closest(".assessment-item");
        return {
          domain: item.querySelector("strong").textContent,
          value: select.value
        };
      });
    }

    function operationalContext() {
      return contextFields.map(function (field) {
        return {
          label: field.closest("label").querySelector("span").textContent,
          value: field.value.trim()
        };
      }).filter(function (item) { return item.value; });
    }

    function renderAssessment() {
      var records = assessmentRecords();
      var context = operationalContext();
      var counts = {
        available: 0,
        derivable: 0,
        "not-available": 0,
        "not-known": 0,
        incomplete: 0
      };
      records.forEach(function (record) {
        if (record.value) counts[record.value] += 1;
        else counts.incomplete += 1;
      });

      var title;
      var conclusion;
      if (counts.incomplete || counts["not-known"]) {
        title = "Preliminary result: unresolved";
        conclusion = "Resolve missing or not-yet-known domains before a formal feasibility decision.";
      } else if (counts["not-available"]) {
        title = "Preliminary result: feasibility work needed";
        conclusion = "At least one required source domain is not available. Revisit the protocol, data source, or operational definition.";
      } else if (counts.derivable) {
        title = "Preliminary result: derivation work required";
        conclusion = "All domains have a stated route, but derivation specifications and validation are required before conversion.";
      } else {
        title = "Preliminary result: direct availability reported";
        conclusion = "All eight domains were marked available. Study-specific definitions, quality checks, and governance review are still required.";
      }

      clearElement(summary);
      summary.appendChild(htmlText("p", "technical-label", "Current summary"));
      summary.appendChild(htmlText("h3", "", title));
      summary.appendChild(htmlText("p", "", conclusion));
      var list = document.createElement("dl");
      appendSummaryMetric(list, "Available — direct", counts.available);
      appendSummaryMetric(list, "Derivable", counts.derivable);
      appendSummaryMetric(list, "Not available", counts["not-available"]);
      appendSummaryMetric(list, "Not yet known or incomplete", counts["not-known"] + counts.incomplete);
      summary.appendChild(list);
      summary.appendChild(htmlText("p", "summary-warning", "This browser-only result is a planning aid, not partner certification or formal study approval."));

      if (context.length) {
        var contextHeading = htmlText("h4", "", "Optional context recorded in this tab");
        var contextList = document.createElement("ul");
        context.forEach(function (item) {
          contextList.appendChild(htmlText("li", "", item.label + ": " + item.value));
        });
        summary.appendChild(contextHeading);
        summary.appendChild(contextList);
      }

      var lines = [
        "IMPRESIVE readiness self-assessment",
        title,
        conclusion,
        "",
        "Available — direct: " + counts.available,
        "Derivable — preparation required: " + counts.derivable,
        "Not available — feasibility issue: " + counts["not-available"],
        "Not yet known or incomplete: " + (counts["not-known"] + counts.incomplete),
        "",
        "Domain record:"
      ];
      records.forEach(function (record) {
        lines.push("- " + record.domain + ": " + (statusLabels[record.value] || "Incomplete"));
      });
      if (context.length) {
        lines.push("", "Optional operational context:");
        context.forEach(function (item) { lines.push("- " + item.label + ": " + item.value); });
      }
      lines.push("", "Planning aid only; not partner certification or formal study approval.");
      currentSummary = lines.join("\n");
      copyButton.disabled = false;
      printButton.disabled = false;
    }

    function htmlText(tagName, className, value) {
      var node = document.createElement(tagName);
      if (className) node.className = className;
      node.textContent = value;
      return node;
    }

    function clearElement(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    }

    function copyWithFallback(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        var copied = document.execCommand("copy");
        field.remove();
        if (copied) resolve();
        else reject(new Error("Clipboard access was unavailable."));
      });
    }

    summarizeButton.addEventListener("click", renderAssessment);
    copyButton.addEventListener("click", function () {
      copyWithFallback(currentSummary).then(function () {
        copyButton.textContent = "Copied";
        window.setTimeout(function () { copyButton.textContent = "Copy summary"; }, 1600);
      }).catch(function () {
        copyButton.textContent = "Copy unavailable";
        window.setTimeout(function () { copyButton.textContent = "Copy summary"; }, 2200);
      });
    });
    printButton.addEventListener("click", function () { window.print(); });
    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        currentSummary = "";
        copyButton.disabled = true;
        printButton.disabled = true;
        clearElement(summary);
        summary.appendChild(htmlText("p", "technical-label", "Current summary"));
        summary.appendChild(htmlText("h3", "", "Complete the domain review"));
        summary.appendChild(htmlText("p", "", "Choose one status for each domain, then generate a neutral feasibility summary."));
      }, 0);
    });
  });

  (function addScrollReveals() {
    var items = Array.from(document.querySelectorAll("main .section-heading"));
    if (!items.length) return;

    items.forEach(function (item) { item.classList.add("reveal-target"); });

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (item) { observer.observe(item); });
  })();
})();
