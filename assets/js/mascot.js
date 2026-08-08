(function () {
  "use strict";

  var OUTLINE = 'stroke="#0a2540" stroke-width="2.4" stroke-linejoin="round"';

  function fig(options) {
    var o = options || {};
    var color = o.c || "#4E8AC4";
    var dark = o.cd || "#3C72A8";
    var panel = o.pl || "#5E9AD4";
    var head = o.hd || "#5E9AD4";
    var highlight = o.hl || "#6FA8DF";
    var lens = o.lens || "#d6e8fb";
    var accessory = o.acc || "down";
    var arms;

    if (o.wave) {
      arms = '<path d="M66 130 C46 146 46 178 62 190 L76 184 C66 172 68 152 84 146 Z" fill="' + color + '"/>' +
        '<g class="lego-arm"><path d="M150 140 C150 114 168 96 180 92 L189 104 C178 110 166 128 164 146 Z" fill="' + color + '"/>' +
        '<circle cx="185" cy="90" r="11" fill="' + head + '"/></g>';
    } else if (accessory === "scroll") {
      arms = '<path d="M66 132 C44 150 44 176 60 188 L74 180 C64 168 66 152 82 146 Z" fill="' + color + '"/>' +
        '<path d="M158 132 C180 150 180 176 164 188 L150 180 C160 168 158 152 142 146 Z" fill="' + color + '"/>' +
        '<rect x="60" y="170" width="104" height="26" rx="13" fill="#ECDBAC"/>' +
        '<ellipse cx="60" cy="183" rx="9" ry="13" fill="#d8c188"/><ellipse cx="164" cy="183" rx="9" ry="13" fill="#d8c188"/>';
    } else if (accessory === "mag") {
      arms = '<path d="M66 132 C44 150 44 176 60 188 L74 180 C64 168 66 152 82 146 Z" fill="' + color + '"/>' +
        '<path d="M158 132 C182 144 184 120 168 112 L156 122 C166 130 160 140 146 142 Z" fill="' + color + '"/>' +
        '<line x1="150" y1="118" x2="170" y2="98" stroke="#16263f" stroke-width="7"/>' +
        '<circle cx="182" cy="84" r="17" fill="#d6e8fb"/>';
    } else {
      arms = '<path d="M66 130 C46 146 46 178 62 190 L76 184 C66 172 68 152 84 146 Z" fill="' + color + '"/>' +
        '<path d="M158 130 C178 146 178 178 162 190 L148 184 C158 172 156 152 140 146 Z" fill="' + color + '"/>';
    }

    return '<svg class="lego-fig" viewBox="0 0 220 256" aria-hidden="true" focusable="false">' +
      '<ellipse cx="112" cy="246" rx="60" ry="8" fill="rgba(10,37,64,.16)"/>' +
      '<g stroke="#16263f" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">' +
        '<rect x="80" y="196" width="28" height="44" rx="7" fill="' + dark + '"/>' +
        '<rect x="116" y="196" width="28" height="44" rx="7" fill="' + dark + '"/>' +
        '<rect x="64" y="120" width="96" height="84" rx="12" fill="' + color + '"/>' +
        '<rect x="84" y="138" width="56" height="50" rx="8" fill="' + panel + '"/>' + arms +
        '<rect x="58" y="22" width="104" height="92" rx="16" fill="' + head + '"/>' +
        '<rect x="58" y="22" width="104" height="40" rx="16" fill="' + highlight + '"/>' +
        '<rect x="92" y="8" width="36" height="18" rx="6" fill="' + highlight + '"/>' +
      "</g>" +
      '<g stroke="#16263f" stroke-width="5.5" stroke-linejoin="round">' +
        '<rect x="70" y="64" width="36" height="28" rx="9" fill="' + lens + '"/>' +
        '<rect x="114" y="64" width="36" height="28" rx="9" fill="' + lens + '"/>' +
      "</g>" +
      '<path d="M106 78 H114" stroke="#16263f" stroke-width="5.5"/>' +
      '<g class="lego-eyes"><circle cx="88" cy="78" r="4.4" fill="#16263f"/><circle cx="132" cy="78" r="4.4" fill="#16263f"/></g>' +
      (o.mood === "cross"
        ? '<path d="M74 60 L98 67" stroke="#16263f" stroke-width="5" stroke-linecap="round"/><path d="M146 60 L122 67" stroke="#16263f" stroke-width="5" stroke-linecap="round"/><path d="M96 106 q14 -9 28 0" fill="none" stroke="#16263f" stroke-width="4.5" stroke-linecap="round"/>'
        : '<path d="M96 100 q14 10 28 0" fill="none" stroke="#16263f" stroke-width="4.5" stroke-linecap="round"/>') +
    "</svg>";
  }

  var presets = Object.freeze({
    BLUE: Object.freeze({ c: "#4E8AC4", cd: "#3C72A8", pl: "#5E9AD4", hd: "#5E9AD4", hl: "#6FA8DF", lens: "#d6e8fb", acc: "scroll" }),
    GREEN: Object.freeze({ c: "#3F8C6E", cd: "#2E6B54", pl: "#54A484", hd: "#54A484", hl: "#67B395", lens: "#eaf6ee", acc: "mag" }),
    TEAL: Object.freeze({ c: "#2E8FA0", cd: "#1F6B78", pl: "#46A6B5", hd: "#46A6B5", hl: "#5FBCCB", lens: "#def3f6", acc: "down" }),
    NAVY: Object.freeze({ c: "#0E4E96", cd: "#0A3A6B", pl: "#2480D8", hd: "#2480D8", hl: "#3f8fe0", lens: "#d6e8fb", acc: "scroll" }),
    RED: Object.freeze({ c: "#D8472F", cd: "#A8331F", pl: "#E86A55", hd: "#E0533C", hl: "#EE7A66", lens: "#ffe3dc", acc: "down", mood: "cross" })
  });

  function tower() {
    return '<svg class="lego-tower" viewBox="0 0 170 168" aria-hidden="true" focusable="false">' +
      '<g ' + OUTLINE + '><rect x="30" y="118" width="120" height="42" rx="6" fill="#0A4E96"/><rect x="44" y="80" width="92" height="40" rx="6" fill="#0F6FD0"/><rect x="58" y="42" width="64" height="40" rx="6" fill="#2480D8"/></g>' +
      '<g stroke="#0a2540" stroke-width="1.8"><g fill="#2f7fd6"><ellipse cx="58" cy="118" rx="10" ry="5"/><ellipse cx="90" cy="118" rx="10" ry="5"/><ellipse cx="122" cy="118" rx="10" ry="5"/></g><g fill="#3f8fe0"><ellipse cx="66" cy="80" rx="10" ry="5"/><ellipse cx="114" cy="80" rx="10" ry="5"/></g><g fill="#5aa3ea"><ellipse cx="78" cy="42" rx="10" ry="5"/><ellipse cx="102" cy="42" rx="10" ry="5"/></g></g>' +
      '<text x="90" y="106" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" font-family="Inter,sans-serif">DATA</text><line x1="90" y1="42" x2="90" y2="20" stroke="#0a2540" stroke-width="3"/><path d="M90 20 L120 26 L90 36 Z" fill="#3F8C6E" stroke="#0a2540" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  }

  var glyphs = {
    chart: '<g fill="#fff"><rect x="14" y="34" width="6" height="9"/><rect x="26" y="28" width="6" height="15"/><rect x="38" y="22" width="6" height="21"/></g>',
    shield: '<path d="M30 18 l13 5 v9 c0 9 -7 14 -13 17 c-6 -3 -13 -8 -13 -17 v-9 z" fill="#fff"/>',
    network: '<g fill="#fff" stroke="#fff" stroke-width="2"><circle cx="18" cy="34" r="3.5"/><circle cx="42" cy="26" r="3.5"/><circle cx="42" cy="42" r="3.5"/><path d="M21 33 L39 27 M21 35 L39 41"/></g>',
    check: '<path d="M15 33 l8 8 L45 21" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    globe: '<g fill="none" stroke="#fff" stroke-width="2.4"><circle cx="30" cy="33" r="12"/><path d="M18 33 H42 M30 21 v24 M22 26 q8 7 16 0 M22 40 q8 -7 16 0"/></g>'
  };

  function tile(glyph, color) {
    var fill = color || "#0063C3";
    return '<svg class="lego-tile" viewBox="0 0 60 54" aria-hidden="true" focusable="false"><rect x="4" y="10" width="52" height="40" rx="7" fill="' + fill + '" ' + OUTLINE + '/><g fill="' + fill + '" stroke="#0a2540" stroke-width="1.6"><ellipse cx="18" cy="10" rx="8" ry="4"/><ellipse cx="42" cy="10" rx="8" ry="4"/></g>' + (glyphs[glyph] || "") + "</svg>";
  }

  function stack() {
    return '<div class="lego-tiles">' + Array.prototype.slice.call(arguments).join("") + "</div>";
  }

  function waved(preset) {
    return Object.assign({}, preset, { wave: true });
  }

  function injectHero() {
    var hero = document.querySelector(".hero, .page-hero");
    if (!hero || hero.querySelector(".lego-scene")) return;

    var scenes = {
      home: [tower(), fig(presets.BLUE), fig(presets.GREEN), stack(tile("chart", "#0063C3"), tile("network", "#2589A0"))],
      about: [tower(), fig(presets.BLUE), fig(presets.TEAL)],
      why: [fig(presets.RED), fig(presets.BLUE), fig(presets.GREEN), stack(tile("check", "#3F8C6E"))],
      methods: [fig(presets.GREEN), fig(presets.BLUE), stack(tile("chart", "#0063C3"), tile("check", "#2589A0"))],
      cases: [tower(), fig(presets.GREEN), fig(presets.BLUE)],
      "case-ascvd": [fig(presets.BLUE), fig(presets.NAVY), stack(tile("chart", "#0063C3"), tile("check", "#3F8C6E"))],
      "case-adpn": [fig(presets.TEAL), fig(presets.GREEN), stack(tile("network", "#2589A0"))],
      visualization: [fig(presets.BLUE), fig(presets.TEAL), stack(tile("chart", "#0063C3"), tile("network", "#3F8C6E"))],
      databases: [tower(), fig(presets.BLUE), stack(tile("globe", "#2589A0"))],
      join: [fig(presets.BLUE), fig(presets.GREEN), fig(presets.NAVY), stack(tile("network", "#2589A0"))]
    };
    var scene = document.createElement("div");
    scene.className = "lego-scene";
    scene.setAttribute("aria-hidden", "true");
    scene.innerHTML = (scenes[document.body.getAttribute("data-page")] || [tower(), fig(presets.BLUE)]).join("");
    var mobileKeeper = scene.querySelector(".lego-fig");
    if (mobileKeeper) mobileKeeper.classList.add("lego-mobile-keeper");
    hero.appendChild(scene);
    document.body.classList.add("mascot-enabled");
  }

  function injectHeader() {
    var brand = document.querySelector(".site-header .brand");
    if (!brand || brand.querySelector(".lego-header-crew")) return;
    var crew = document.createElement("span");
    crew.className = "lego-header-crew";
    crew.setAttribute("aria-hidden", "true");
    crew.innerHTML = fig(waved(presets.BLUE)) + tile("network", "#2589A0");
    brand.appendChild(crew);
  }

  function injectFooter() {
    var footer = document.querySelector(".site-footer");
    if (!footer || footer.querySelector(".lego-parade")) return;
    var parade = document.createElement("div");
    parade.className = "lego-parade";
    parade.setAttribute("aria-hidden", "true");
    parade.innerHTML = tile("shield", "#0F6FD0") + fig(presets.BLUE) + fig(presets.GREEN) + fig(presets.TEAL) + fig(presets.NAVY) + tile("network", "#3F8C6E");
    var slot = footer.querySelector(".lego-parade-slot");
    if (slot) slot.appendChild(parade);
    else footer.insertBefore(parade, footer.firstChild);
  }

  function cardPreset(card, index) {
    if (card.classList.contains("impact-card--clinical")) return presets.RED;
    if (card.classList.contains("impact-card--economic")) return presets.GREEN;
    if (card.classList.contains("impact-card--education")) return presets.TEAL;
    if (card.classList.contains("impact-card--scientific")) return presets.BLUE;
    if (document.body.getAttribute("data-page") === "why" && index % 2 === 0) return presets.RED;
    return [presets.BLUE, presets.GREEN, presets.TEAL, presets.NAVY][index % 4];
  }

  function injectCards() {
    var selector = [
      ".impact-card",
      ".model-card",
      ".readiness-card",
      ".route-card",
      ".card.partner",
      "[data-mascot-scope] .card"
    ].join(",");
    var messages = ["RWE!", "Data!", "Ready!", "Let's build!"];

    Array.from(new Set(document.querySelectorAll(selector))).forEach(function (card, index) {
      if (card.closest(".impact-static-fallback")) return;
      if (card.querySelector(".lego-peek")) return;
      card.classList.add("has-lego-mascot");
      var peek = document.createElement("span");
      peek.className = "lego-peek pk" + (index % 3);
      peek.setAttribute("aria-hidden", "true");
      peek.style.setProperty("--bd", ((index % 5) * 1.1 + 0.4).toFixed(2) + "s");
      peek.innerHTML = '<span class="lego-bubble">' + messages[index % messages.length] + "</span>" + fig(waved(cardPreset(card, index)));
      card.appendChild(peek);
    });
  }

  function setupVisibilityPausing() {
    var targets = Array.from(document.querySelectorAll(".lego-scene, .lego-parade, .lego-peek"));

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("mascot-animation-paused", !entry.isIntersecting);
        });
      }, { threshold: 0, rootMargin: "96px 0px" });
      targets.forEach(function (target) { observer.observe(target); });
    }

    function updatePageVisibility() {
      document.documentElement.classList.toggle("mascot-page-hidden", document.hidden);
    }

    updatePageVisibility();
    document.addEventListener("visibilitychange", updatePageVisibility);
  }

  window.IMPRESIVEMascot = Object.freeze({ fig: fig, tower: tower, tile: tile, presets: presets });
  injectHero();
  injectHeader();
  injectFooter();
  injectCards();
  setupVisibilityPausing();
})();
