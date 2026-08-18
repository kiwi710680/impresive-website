/* Interactive evidence-preparation flowchart (how.html).

   The diagram is one complete pathway, steps 1 to 9, so the whole process is
   readable without clicking anything. Interaction only adds commentary:

     hover / focus  — explain the step in the side panel
     click / Enter  — pin that explanation instead of navigating away
     panel link     — open the canonical technical page

   Copy lives in assets/data/architecture.json, so wording changes never
   require touching this file. Without JavaScript the diagram still renders
   and reads correctly; only the commentary panel is inert. */
(function () {
  "use strict";

  var root = document.querySelector("[data-architecture]");
  if (!root) return;

  var panel = {
    box: root.querySelector("[data-arch-panel]"),
    eyebrow: root.querySelector("[data-arch-panel-eyebrow]"),
    title: root.querySelector("[data-arch-panel-title]"),
    body: root.querySelector("[data-arch-panel-body]"),
    story: root.querySelector("[data-arch-panel-case]"),
    link: root.querySelector("[data-arch-panel-link]")
  };
  if (!panel.box) return;

  var nodes = Array.prototype.slice.call(root.querySelectorAll(".arch-node"));
  if (!nodes.length) return;

  var data = null;
  var pinned = null;

  root.classList.add("arch--enhanced");

  function showIntro() {
    if (!data || !data.intro) return;
    panel.eyebrow.textContent = data.intro.eyebrow;
    panel.title.textContent = data.intro.title;
    panel.body.textContent = data.intro.body;
    panel.story.hidden = true;
    panel.link.parentNode.hidden = true;
  }

  function showNode(id) {
    if (!data) return;
    var n = data.nodes[id];
    if (!n) return;
    panel.eyebrow.textContent = n.step ? "Step " + n.step : "In this pathway";
    panel.title.textContent = n.label;
    panel.body.textContent = n.summary;
    if (n.case) { panel.story.textContent = n.case; panel.story.hidden = false; }
    else panel.story.hidden = true;
    if (n.link) {
      panel.link.setAttribute("href", n.link.href);
      panel.link.textContent = n.link.text + " →";
      panel.link.parentNode.hidden = false;
    } else {
      panel.link.parentNode.hidden = true;
    }
  }

  function select(node) {
    nodes.forEach(function (el) {
      el.classList.toggle("is-selected", el === node);
      if (el === node) el.setAttribute("aria-pressed", "true");
      else el.removeAttribute("aria-pressed");
    });
  }

  nodes.forEach(function (node) {
    var id = node.getAttribute("data-node");

    function preview() { if (!pinned) showNode(id); }
    function restore() { if (!pinned) showIntro(); }

    node.addEventListener("mouseenter", preview);
    node.addEventListener("mouseleave", restore);
    node.addEventListener("focus", preview);
    node.addEventListener("blur", restore);

    function pin(event) {
      event.preventDefault();
      if (pinned === node) {          /* clicking the pinned step releases it */
        pinned = null;
        select(null);
        showIntro();
        return;
      }
      pinned = node;
      select(node);
      showNode(id);
    }

    node.addEventListener("click", pin);
    node.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") pin(event);
      if (event.key === "Escape" && pinned) { pinned = null; select(null); showIntro(); }
    });
  });

  fetch("assets/data/architecture.json")
    .then(function (response) {
      if (!response.ok) throw new Error("architecture.json " + response.status);
      return response.json();
    })
    .then(function (payload) {
      data = payload;
      showIntro();
      document.dispatchEvent(new CustomEvent("impresive:content-ready"));
    })
    .catch(function () {
      /* The pathway is meaningful on its own; only the commentary is lost. */
      panel.box.hidden = true;
      root.classList.add("arch--nopanel");
    });
})();
