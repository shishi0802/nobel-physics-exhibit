/*
  Shared museum-walk page transitions.
  Include after gallery-transition.css is loaded.

  Usage: pages with [data-transition] links will get museum-walk effects.
  Auto-removes .is-entering on load, auto-attaches link handlers.
*/
(function () {
  "use strict";

  function attachTransitions(root) {
    root = root || document;
    root.querySelectorAll("[data-transition]").forEach(function (link) {
      if (link.dataset.transitionBound) return;
      link.dataset.transitionBound = "1";
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");
        if (!href || href === "#") return;
        event.preventDefault();
        if (window.location.search && href.indexOf("?") === -1 && href.indexOf("#") !== 0) {
          href += window.location.search;
        }
        document.body.classList.add("is-leaving");
        var portal = document.getElementById("portalTransition");
        if (portal) portal.classList.add("active");
        sessionStorage.setItem("museumTransition", "soft");
        window.setTimeout(function () {
          window.location.href = href;
        }, 640);
      });
    });
  }

  function initEntrance() {
    window.setTimeout(function () {
      document.body.classList.remove("is-entering");
    }, 820);
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      attachTransitions();
      initEntrance();
    });
  } else {
    attachTransitions();
    initEntrance();
  }

  // Expose for pages that dynamically add links
  window.MuseumTransitions = { attach: attachTransitions };
})();
