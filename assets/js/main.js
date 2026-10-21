(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var pages = [
    { id: "home", href: "index.html", label: "Home" },
    { id: "about", href: "about.html", label: "About" },
    { id: "objective", href: "objective.html", label: "Objective" },
    { id: "how", href: "how.html", label: "How" },
    { id: "cases", href: "cases.html", label: "Accomplishment" },
    { id: "databases", href: "databases.html", label: "Partner" },
    { id: "join", href: "join.html", label: "Join", cta: true }
  ];

  /* Pages that are reached from a parent rather than from the primary nav.
     Methods is deliberately not a nav item: it is the technical destination
     behind How, so How stays marked as current while it is open. */
  var caseChildren = {
    "case-ascvd": "cases", "case-adpn": "cases", "transportability": "cases",
    "visualization": "cases", "methods": "how"
  };

  var activePage = document.body.getAttribute("data-page") || "";
  var header = document.querySelector(".site-header");
  var footer = document.querySelector(".site-footer");
  var main = document.querySelector("main");

  /* Pages served from a sub-directory (the visualization app) declare how far
     up the site root is, so the shared header and footer resolve from there
     instead of from their own folder. */
  var base = document.body.getAttribute("data-nav-base") || "";

  var navPage = caseChildren[activePage] || activePage;

  function pageLink(page) {
    var current = page.id === navPage ? ' aria-current="page"' : "";
    var cssClass = page.cta ? ' class="nav-join"' : "";
    return '<a href="' + base + page.href + '"' + cssClass + current + '>' + page.label + "</a>";
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
        '<a class="brand" href="' + base + 'index.html" aria-label="IMPRESIVE home">' +
          '<img src="' + base + 'assets/img/favicon.svg" alt="">' +
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
      '<div class="wrap">' +
        '<div class="footer-grid">' +
          '<div><div class="footer-brand"><img src="' + base + 'assets/img/favicon.svg" alt="">IMPRESIVE</div><p>International multi-database study preparedness for reproducible, privacy-preserving real-world evidence.</p></div>' +
          '<div><h3>Explore</h3><ul><li><a href="' + base + 'about.html">About IMPRESIVE</a></li><li><a href="' + base + 'objective.html">Objectives for multinational studies</a></li><li><a href="' + base + 'how.html">How IMPRESIVE works</a></li><li><a href="' + base + 'methods.html">Methods &amp; technical reference</a></li><li><a href="' + base + 'cases.html">Accomplishments</a></li></ul></div>' +
          '<div><h3>Evidence &amp; participation</h3><ul><li><a href="' + base + 'cases.html#case-register">Cases &amp; evidence</a></li><li><a href="' + base + 'databases.html">Partners &amp; readiness</a></li><li><a href="' + base + 'about.html#programme-roadmap">Programme roadmap</a></li><li><a href="' + base + 'about.html#governance-transparency">Governance &amp; transparency</a></li><li><a href="' + base + 'join.html">Join, FAQ &amp; contact</a></li></ul></div>' +
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
      comparator.querySelectorAll("[data-radar-series]").forEach(function (series) {
        series.classList.toggle("is-active", series.getAttribute("data-radar-series") === tab.getAttribute("aria-controls"));
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
      comparator.querySelectorAll("[data-radar-series]").forEach(function (series) {
        series.classList.toggle("is-active", series.getAttribute("data-radar-series") === tab.getAttribute("aria-controls"));
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
