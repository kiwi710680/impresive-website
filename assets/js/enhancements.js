(function () {
  "use strict";

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var storagePrefix = "impresive:";

  function observeOnce(items, callback, options) {
    var elements = Array.from(items || []).filter(Boolean);
    if (!elements.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(callback);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        callback(entry.target);
        observer.unobserve(entry.target);
      });
    }, options || { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    elements.forEach(function (element) { observer.observe(element); });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
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

  function temporaryLabel(button, label, duration) {
    var original = button.textContent;
    button.textContent = label;
    window.setTimeout(function () { button.textContent = original; }, duration || 1600);
  }

  function addScrollProgress() {
    var header = document.querySelector(".site-header");
    if (!header || header.querySelector(".reading-progress")) return;
    var progress = document.createElement("span");
    progress.className = "reading-progress";
    progress.setAttribute("aria-hidden", "true");
    header.appendChild(progress);
    var queued = false;

    function update() {
      var maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var ratio = Math.min(1, Math.max(0, window.scrollY / maximum));
      progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
      queued = false;
    }

    function requestUpdate() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function addRecordBandMotion() {
    document.querySelectorAll(".record-band").forEach(function (band) {
      var values = Array.from(band.querySelectorAll("dd"));
      if (!values.length) return;
      band.classList.add("record-band--motion");
      values.forEach(function (value, index) {
        value.style.setProperty("--motion-delay", (index * 60) + "ms");
      });
      observeOnce([band], function () { band.classList.add("is-motion-visible"); }, { threshold: 0.28 });
    });
  }

  function addRoadmapMotion() {
    document.querySelectorAll(".living-timeline").forEach(function (timeline) {
      var entries = Array.from(timeline.children);
      if (!entries.length) return;
      timeline.classList.add("timeline-motion");
      var supportsViewTimeline = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
      if (!supportsViewTimeline) timeline.classList.add("timeline-motion--fallback");

      if (reducedMotion || !("IntersectionObserver" in window)) {
        entries.forEach(function (entry) { entry.classList.add("is-reached"); });
        timeline.style.setProperty("--timeline-progress", "1");
        return;
      }

      var reached = new Set();
      var observer = new IntersectionObserver(function (observations) {
        observations.forEach(function (observation) {
          if (!observation.isIntersecting) return;
          var entry = observation.target;
          reached.add(entry);
          entry.classList.add("is-reached");
          var furthest = Math.max.apply(null, entries.map(function (item, index) {
            return reached.has(item) ? index : -1;
          }));
          timeline.style.setProperty("--timeline-progress", String(Math.max(0, furthest) / Math.max(1, entries.length - 1)));
          observer.unobserve(entry);
        });
      }, { threshold: 0, rootMargin: "-44% 0px -44% 0px" });
      entries.forEach(function (entry) { observer.observe(entry); });
    });
  }

  function addModelMotion() {
    document.querySelectorAll(".model-comparison").forEach(function (comparison) {
      var scales = Array.from(comparison.querySelectorAll(".variation-scale"));
      if (!scales.length) return;
      scales.forEach(function (scale, index) {
        scale.classList.add("variation-scale--motion");
        scale.style.setProperty("--motion-delay", (index * 90) + "ms");
      });

      function revealVisibleScales() {
        scales.forEach(function (scale) {
          if (scale.closest("[hidden]")) return;
          scale.classList.add("is-motion-visible");
        });
      }

      observeOnce([comparison], revealVisibleScales, { threshold: 0.22 });
      var observer = new MutationObserver(function (records) {
        if (records.some(function (record) { return record.attributeName === "hidden"; })) {
          window.requestAnimationFrame(revealVisibleScales);
        }
      });
      comparison.querySelectorAll("[data-model-panel]").forEach(function (panel) {
        observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
      });
    });
  }

  function prepareChart(svg) {
    if (!svg || svg.dataset.motionPrepared === "true") return;
    svg.dataset.motionPrepared = "true";
    svg.classList.add("chart-motion-ready");
    var lines = Array.from(svg.querySelectorAll(".range-estimate, .confidence-interval, .slope-segment"));
    var marks = Array.from(svg.querySelectorAll(".chart-marker, .range-endpoint"));
    lines.forEach(function (line, index) {
      line.setAttribute("pathLength", "1");
      line.style.setProperty("--motion-index", String(index));
    });
    marks.forEach(function (mark, index) {
      mark.style.setProperty("--motion-index", String(index));
    });
    observeOnce([svg], function () { svg.classList.add("is-chart-visible"); }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
  }

  function inlineSvgPresentation(source, clone) {
    var sourceNodes = [source].concat(Array.from(source.querySelectorAll("*")));
    var cloneNodes = [clone].concat(Array.from(clone.querySelectorAll("*")));
    var properties = [
      "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray",
      "opacity", "font-family", "font-size", "font-weight", "font-style", "text-anchor"
    ];
    sourceNodes.forEach(function (node, index) {
      var target = cloneNodes[index];
      if (!target) return;
      var computed = window.getComputedStyle(node);
      properties.forEach(function (property) {
        var value = computed.getPropertyValue(property);
        if (value) target.style.setProperty(property, value);
      });
      target.style.setProperty("stroke-dashoffset", "0");
      target.style.setProperty("opacity", "1");
      /* CSS transforms override SVG transform attributes. Strip motion styles while
         preserving the SVG translate/rotate geometry used by markers and axis labels. */
      target.style.removeProperty("transform");
      target.style.removeProperty("transform-origin");
      target.style.removeProperty("transform-box");
      if (node.hasAttribute && node.hasAttribute("transform")) {
        target.setAttribute("transform", node.getAttribute("transform"));
      }
      target.style.removeProperty("animation");
      target.style.removeProperty("transition");
      target.style.removeProperty("--motion-index");
    });
  }

  function serializeFigureSvg(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.classList.remove("chart-motion-ready", "is-chart-visible");
    inlineSvgPresentation(svg, clone);
    var viewBox = (clone.getAttribute("viewBox") || "0 0 1200 800").split(/\s+/).map(Number);
    clone.setAttribute("width", String(viewBox[2] || 1200));
    clone.setAttribute("height", String(viewBox[3] || 800));
    return new XMLSerializer().serializeToString(clone);
  }

  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function downloadSvg(figure, button) {
    var svg = figure.querySelector("[data-chart-mount] svg");
    if (!svg) return;
    var name = figure.getAttribute("data-evidence-figure") || "impresive-figure";
    var source = serializeFigureSvg(svg);
    saveBlob(new Blob([source], { type: "image/svg+xml;charset=utf-8" }), name + ".svg");
    temporaryLabel(button, "SVG saved");
  }

  function downloadPng(figure, button) {
    var svg = figure.querySelector("[data-chart-mount] svg");
    if (!svg) return;
    var name = figure.getAttribute("data-evidence-figure") || "impresive-figure";
    var source = serializeFigureSvg(svg);
    var blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var image = new Image();
    image.onload = function () {
      var viewBox = (svg.getAttribute("viewBox") || "0 0 1200 800").split(/\s+/).map(Number);
      var width = viewBox[2] || 1200;
      var height = viewBox[3] || 800;
      var scale = 2;
      var canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      var context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function (png) {
        if (png) saveBlob(png, name + "@2x.png");
        temporaryLabel(button, png ? "PNG saved" : "PNG unavailable", 2000);
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    image.onerror = function () {
      URL.revokeObjectURL(url);
      temporaryLabel(button, "PNG unavailable", 2000);
    };
    image.src = url;
  }

  function setupEvidenceUtilities() {
    document.querySelectorAll("[data-evidence-figure]").forEach(function (figure) {
      var heading = figure.querySelector(".figure-heading");
      var mount = figure.querySelector("[data-chart-mount]");
      if (!heading || !mount) return;
      var name = figure.getAttribute("data-evidence-figure") || "figure";
      var actions = document.createElement("div");
      actions.className = "figure-actions";
      actions.setAttribute("aria-label", "Figure actions");

      var pngButton = document.createElement("button");
      pngButton.type = "button";
      pngButton.className = "figure-action";
      pngButton.textContent = "Download PNG";
      pngButton.disabled = true;

      var svgButton = document.createElement("button");
      svgButton.type = "button";
      svgButton.className = "figure-action";
      svgButton.textContent = "Download SVG";
      svgButton.disabled = true;

      var linkButton = document.createElement("button");
      linkButton.type = "button";
      linkButton.className = "figure-action";
      linkButton.textContent = "Copy link";

      actions.appendChild(pngButton);
      actions.appendChild(svgButton);
      actions.appendChild(linkButton);
      heading.appendChild(actions);

      function chartReady() {
        var svg = mount.querySelector("svg");
        if (!svg) return;
        prepareChart(svg);
        pngButton.disabled = false;
        svgButton.disabled = false;
      }

      chartReady();
      new MutationObserver(chartReady).observe(mount, { childList: true });
      pngButton.addEventListener("click", function () { downloadPng(figure, pngButton); });
      svgButton.addEventListener("click", function () { downloadSvg(figure, svgButton); });
      linkButton.addEventListener("click", function () {
        var section = figure.closest("section[id]");
        var url = window.location.href.split("#")[0] + (section ? "#" + section.id : "");
        copyText(url).then(function () {
          temporaryLabel(linkButton, "Link copied");
        }).catch(function () {
          temporaryLabel(linkButton, "Copy unavailable", 2000);
        });
      });

      var details = figure.querySelector(".figure-table");
      if (details) {
        var storageKey = storagePrefix + "evidence-table:" + name;
        try { details.open = window.localStorage.getItem(storageKey) === "open"; } catch (error) { /* Local preference unavailable. */ }
        details.addEventListener("toggle", function () {
          try { window.localStorage.setItem(storageKey, details.open ? "open" : "closed"); } catch (error) { /* Local preference unavailable. */ }
        });
      }
    });
  }

  function setupReadingTools() {
    if (!["methods", "case-ascvd"].includes(document.body.getAttribute("data-page"))) return;
    var main = document.querySelector("main");
    var hero = main && main.querySelector(":scope > .page-hero");
    if (!main || !hero) return;
    var sections = Array.from(main.querySelectorAll(":scope > section[id]")).filter(function (section) {
      return section.querySelector("h2");
    });
    if (sections.length < 2) return;

    document.body.classList.add("has-reading-tools");
    var words = (main.innerText || "").trim().split(/\s+/).filter(Boolean).length;
    var minutes = Math.max(1, Math.ceil(words / 225));
    var aside = document.createElement("aside");
    aside.className = "reading-tools";
    aside.setAttribute("aria-label", "Page reading guide");
    var details = document.createElement("details");
    details.className = "reading-tools__details";
    var summary = document.createElement("summary");
    summary.textContent = "On this page";
    var time = document.createElement("p");
    time.className = "reading-time";
    time.textContent = "Approx. " + minutes + " min read";
    var list = document.createElement("ol");
    sections.forEach(function (section) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + section.id;
      link.textContent = section.querySelector("h2").textContent;
      link.dataset.sectionLink = section.id;
      item.appendChild(link);
      list.appendChild(item);
    });
    details.appendChild(summary);
    details.appendChild(time);
    details.appendChild(list);
    aside.appendChild(details);
    hero.insertAdjacentElement("afterend", aside);

    var wide = window.matchMedia("(min-width: 1280px)");
    function setDisclosure() {
      if (wide.matches) details.open = true;
    }
    setDisclosure();
    if (wide.addEventListener) wide.addEventListener("change", setDisclosure);

    if ("IntersectionObserver" in window) {
      var links = Array.from(list.querySelectorAll("a"));
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle("is-current", link.dataset.sectionLink === entry.target.id);
          });
        });
      }, { threshold: 0, rootMargin: "-18% 0px -68% 0px" });
      sections.forEach(function (section) { observer.observe(section); });
    }
  }

  addScrollProgress();
  addRecordBandMotion();
  addRoadmapMotion();
  addModelMotion();
  setupEvidenceUtilities();
  setupReadingTools();
})();
