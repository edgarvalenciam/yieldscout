(function () {
  "use strict";

  document.documentElement.classList.add("js");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var id = anchor.getAttribute("href");
    if (!id || id === "#") return;
    var target = document.querySelector(id);
    if (!target) return;
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
