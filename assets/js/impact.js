(function () {
  "use strict";

  var impactData = window.IMPRESIVE_IMPACT_DATA || [];
  if (!impactData.length) return;

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function impactIcon(id) {
    var dimensions = {
      scientific: [105, 105],
      clinical: [141, 141],
      economic: [145, 144],
      education: [135, 135]
    };
    var size = dimensions[id];
    return '<img class="impact-icon" src="assets/img/impact/' + id + '.png" alt="" width="' + size[0] + '" height="' + size[1] + '" loading="lazy" decoding="async">';
  }

  function cardMarkup(item, index, prefix, mode) {
    var detailCopy = mode === "summary"
      ? '<span class="impact-card__summary">' + item.summary + '</span><span class="impact-card__action">Read more <span aria-hidden="true">→</span></span>'
      : "";
    var content =
      '<span class="impact-card__mark" aria-hidden="true">' + (mode === "summary" ? pad(index + 1) : impactIcon(item.id)) + "</span>" +
      '<span class="impact-card__content">' +
        '<span class="impact-card__title">' + item.title + "</span>" +
        '<span class="impact-card__themes">' + item.themes + "</span>" +
        detailCopy +
      "</span>";

    if (mode === "summary") {
      return '<a class="impact-card impact-card--' + item.id + '" href="about.html#impact-tab-' + item.id + '" aria-label="Read the full ' + item.title + '">' + content + "</a>";
    }

    /* Detail mode (IW2): nothing is open at first. Hover or keyboard focus
       shows a one-line preview inside the card; a click opens the full text. */
    return '<button class="impact-card impact-card--' + item.id + '" id="' + prefix + '-tab-' + item.id + '" type="button" aria-expanded="false" aria-controls="' + prefix + '-detail" data-impact-tab data-impact-index="' + index + '">' +
      content +
      '<span class="impact-card__peek" aria-hidden="true">' +
        '<span class="impact-card__peek-text">' + item.summary + "</span>" +
        '<span class="impact-card__peek-action">Click for details <span>+</span></span>' +
      "</span>" +
      '<span class="impact-card__hint" aria-hidden="true">+</span>' +
    "</button>";
  }

  function detailMarkup(item, prefix) {
    return '<article class="impact-detail__panel" id="' + prefix + '-panel-' + item.id + '" role="region" aria-labelledby="' + prefix + '-tab-' + item.id + '" tabindex="-1" data-impact-panel>' +
      '<p class="impact-detail__label">' + item.title + "</p>" +
      "<h3>" + item.themes + "</h3>" +
      '<p class="impact-detail__lead">' + item.summary + "</p>" +
      "<p>" + item.detail + "</p>" +
    "</article>";
  }

  document.querySelectorAll("[data-impact]").forEach(function (module, moduleIndex) {
    var content = module.querySelector("[data-impact-content]");
    if (!content) return;
    var fallback = module.querySelector(".impact-static-fallback");
    if (fallback) fallback.remove();

    var mode = module.getAttribute("data-impact-mode") || "detail";
    var prefix = module.id === "impact" ? "impact" : "impact-" + moduleIndex;

    if (mode === "summary") {
      content.innerHTML = '<div class="impact-grid impact-grid--summary" aria-label="IMPRESIVE impact areas">' +
        impactData.map(function (item, index) { return cardMarkup(item, index, prefix, mode); }).join("") +
      "</div>";
      module.classList.add("is-enhanced", "impact-section--summary");
      return;
    }

    content.innerHTML =
      '<div class="impact-grid impact-grid--reveal" aria-label="IMPRESIVE impact areas">' +
        impactData.map(function (item, index) { return cardMarkup(item, index, prefix, mode); }).join("") +
      "</div>" +
      '<div class="impact-detail" id="' + prefix + '-detail" data-impact-detail data-impact-active="0" hidden>' +
        '<div class="impact-detail__toolbar">' +
          '<span class="impact-detail__counter" data-impact-counter>01 / ' + pad(impactData.length) + "</span>" +
          '<div class="impact-detail__controls" aria-label="Browse impact details">' +
            '<button type="button" data-impact-previous aria-label="Show previous impact">←</button>' +
            '<button type="button" data-impact-next aria-label="Show next impact">→</button>' +
            '<button type="button" class="impact-detail__close" data-impact-close aria-label="Close impact details">×</button>' +
          "</div>" +
        "</div>" +
        impactData.map(function (item) { return detailMarkup(item, prefix); }).join("") +
      "</div>";

    var tabs = Array.from(module.querySelectorAll("[data-impact-tab]"));
    var panels = Array.from(module.querySelectorAll("[data-impact-panel]"));
    var detail = module.querySelector("[data-impact-detail]");
    var counter = module.querySelector("[data-impact-counter]");
    var previous = module.querySelector("[data-impact-previous]");
    var next = module.querySelector("[data-impact-next]");
    var close = module.querySelector("[data-impact-close]");
    var activeIndex = -1;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function headerOffset() {
      var header = document.querySelector(".site-header");
      return header ? header.offsetHeight : 0;
    }

    function collapse(returnFocus) {
      var wasIndex = activeIndex;
      activeIndex = -1;
      detail.hidden = true;
      module.classList.remove("has-open-impact");
      tabs.forEach(function (tab) {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-expanded", "false");
      });
      if (returnFocus && tabs[wasIndex]) tabs[wasIndex].focus();
    }

    function open(index, options) {
      var settings = options || {};
      activeIndex = (index + tabs.length) % tabs.length;
      detail.hidden = false;
      module.classList.add("has-open-impact");

      tabs.forEach(function (tab, position) {
        var selected = position === activeIndex;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-expanded", String(selected));
      });

      panels.forEach(function (panel, position) {
        panel.hidden = position !== activeIndex;
      });

      var activePanel = panels[activeIndex];
      if (!reduceMotion && activePanel) {
        activePanel.classList.remove("impact-panel-enter");
        void activePanel.offsetWidth;
        activePanel.classList.add("impact-panel-enter");
        window.setTimeout(function () { activePanel.classList.remove("impact-panel-enter"); }, 200);
      }

      detail.setAttribute("data-impact-active", String(activeIndex));
      counter.textContent = pad(activeIndex + 1) + " / " + pad(tabs.length);

      if (settings.reveal) {
        /* Scroll only when the opened text would start below the fold. */
        var rect = detail.getBoundingClientRect();
        if (rect.top > window.innerHeight * .72 || rect.top < headerOffset()) {
          var targetTop = rect.top + window.pageYOffset - headerOffset() - 16;
          window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        if (activeIndex === index) collapse(false);
        else open(index, { reveal: true });
      });
    });

    previous.addEventListener("click", function () { open(activeIndex - 1); });
    next.addEventListener("click", function () { open(activeIndex + 1); });
    close.addEventListener("click", function () { collapse(true); });
    detail.addEventListener("keydown", function (event) {
      if (event.key === "Escape") collapse(true);
    });

    var hashIndex = impactData.findIndex(function (item) {
      return window.location.hash === "#" + prefix + "-tab-" + item.id;
    });

    module.classList.add("is-enhanced");
    if (hashIndex >= 0) {
      open(hashIndex);
      window.requestAnimationFrame(function () {
        var targetTop = module.getBoundingClientRect().top + window.pageYOffset - headerOffset();
        window.scrollTo({ top: targetTop, behavior: "auto" });
      });
    }
  });
})();
