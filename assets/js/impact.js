(function () {
  "use strict";

  var impactData = window.IMPRESIVE_IMPACT_DATA || [];
  if (!impactData.length) return;

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function cardMarkup(item, index, prefix, mode) {
    var content =
      '<span class="impact-card__mark" aria-hidden="true">' + pad(index + 1) + "</span>" +
      '<span class="impact-card__content">' +
        '<span class="impact-card__title">' + item.title + "</span>" +
        '<span class="impact-card__themes">' + item.themes + "</span>" +
        '<span class="impact-card__summary">' + item.summary + "</span>" +
        '<span class="impact-card__action">' + (mode === "summary" ? "Read the full impact" : "Explore this impact") + ' <span aria-hidden="true">→</span></span>' +
      "</span>";

    if (mode === "summary") {
      return '<a class="impact-card impact-card--' + item.id + '" href="about.html#impact-tab-' + item.id + '" aria-label="Read the full ' + item.title + '">' + content + "</a>";
    }

    return '<button class="impact-card impact-card--' + item.id + (index === 0 ? " is-active" : "") + '" id="' + prefix + '-tab-' + item.id + '" type="button" role="tab" aria-selected="' + (index === 0 ? "true" : "false") + '" aria-controls="' + prefix + '-panel-' + item.id + '" tabindex="' + (index === 0 ? "0" : "-1") + '" data-impact-tab data-impact-index="' + index + '">' + content + "</button>";
  }

  function detailMarkup(item, prefix) {
    return '<article class="impact-detail__panel" id="' + prefix + '-panel-' + item.id + '" role="tabpanel" aria-labelledby="' + prefix + '-tab-' + item.id + '" tabindex="0" data-impact-panel>' +
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
      '<div class="impact-grid" role="tablist" aria-label="IMPRESIVE impact areas">' +
        impactData.map(function (item, index) { return cardMarkup(item, index, prefix, mode); }).join("") +
      "</div>" +
      '<div class="impact-detail" data-impact-detail data-impact-active="0">' +
        '<div class="impact-detail__toolbar">' +
          '<span class="impact-detail__counter" data-impact-counter>01 / ' + pad(impactData.length) + "</span>" +
          '<div class="impact-detail__controls" aria-label="Browse impact details">' +
            '<button type="button" data-impact-previous aria-label="Show previous impact">←</button>' +
            '<button type="button" data-impact-next aria-label="Show next impact">→</button>' +
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
    var activeIndex = 0;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function activate(index, options) {
      var settings = options || {};
      activeIndex = (index + tabs.length) % tabs.length;

      tabs.forEach(function (tab, position) {
        var selected = position === activeIndex;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
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
      if (settings.focusTab) tabs[activeIndex].focus();
      if (settings.revealDetail) {
        var header = document.querySelector(".site-header");
        var headerHeight = header ? header.offsetHeight : 0;
        var targetTop = detail.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { activate(index, { revealDetail: true }); });
      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = index + 1;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = index - 1;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        activate(nextIndex, { focusTab: true });
      });
    });

    previous.addEventListener("click", function () { activate(activeIndex - 1); });
    next.addEventListener("click", function () { activate(activeIndex + 1); });

    var hashIndex = impactData.findIndex(function (item) {
      return window.location.hash === "#" + prefix + "-tab-" + item.id;
    });

    module.classList.add("is-enhanced");
    activate(hashIndex >= 0 ? hashIndex : 0);
    if (hashIndex >= 0) {
      window.requestAnimationFrame(function () {
        var header = document.querySelector(".site-header");
        var headerHeight = header ? header.offsetHeight : 0;
        var targetTop = module.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetTop, behavior: "auto" });
      });
    }
  });
})();
