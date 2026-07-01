(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Scroll progress bar
  --------------------------------------------------------- */
  var progressFill = document.getElementById("progressFill");
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = (i % 6) * 60;
            setTimeout(function () {
              el.classList.add("is-visible");
            }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     Milestone fill (animates to 40% when in view)
  --------------------------------------------------------- */
  var milestoneFill = document.getElementById("milestoneFill");
  if (milestoneFill && "IntersectionObserver" in window) {
    var milestoneIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            milestoneFill.style.width = "40%";
            milestoneIO.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    milestoneIO.observe(milestoneFill);
  } else if (milestoneFill) {
    milestoneFill.style.width = "40%";
  }

  /* ---------------------------------------------------------
     Bearing / radar signature element
     Builds tick marks around the compass ring and animates
     "signal" blips appearing at bearings — representing
     market opportunities detected by NAVI's systems.
  --------------------------------------------------------- */
  var ticksGroup = document.getElementById("ticks");
  var blipsGroup = document.getElementById("blips");
  var CX = 240, CY = 240;

  function polar(cx, cy, r, angleDeg) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  if (ticksGroup) {
    for (var deg = 0; deg < 360; deg += 15) {
      var isMajor = deg % 90 === 0;
      var outer = polar(CX, CY, 210, deg);
      var inner = polar(CX, CY, isMajor ? 196 : 202, deg);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", outer.x);
      line.setAttribute("y1", outer.y);
      line.setAttribute("x2", inner.x);
      line.setAttribute("y2", inner.y);
      if (isMajor) line.setAttribute("class", "major");
      ticksGroup.appendChild(line);
    }
  }

  var signals = [
    { r: 150, deg: 40, label: "Demand" },
    { r: 95, deg: 130, label: "Trends" },
    { r: 175, deg: 210, label: "Supply" },
    { r: 60, deg: 300, label: "Pricing" },
    { r: 130, deg: 15, label: "Behavior" }
  ];

  if (blipsGroup) {
    signals.forEach(function (s, i) {
      var pos = polar(CX, CY, s.r, s.deg);
      var ns = "http://www.w3.org/2000/svg";

      var ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", pos.x);
      ring.setAttribute("cy", pos.y);
      ring.setAttribute("r", "3");
      ring.setAttribute("class", "blip-ring");

      var dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", pos.x);
      dot.setAttribute("cy", pos.y);
      dot.setAttribute("r", "3.2");
      dot.setAttribute("class", "blip");

      blipsGroup.appendChild(ring);
      blipsGroup.appendChild(dot);

      if (!reduceMotion) {
        var delay = i * 1400 + 400;
        var cycle = 7000;
        animateBlip(dot, ring, delay, cycle);
      } else {
        dot.style.opacity = "0.9";
      }
    });
  }

  function animateBlip(dot, ring, delay, cycle) {
    function pulseOnce() {
      dot.style.transition = "opacity 0.3s ease";
      dot.style.opacity = "1";
      ring.style.transition = "opacity 0.3s ease, r 1.1s ease-out";
      ring.style.opacity = "0.55";
      ring.setAttribute("r", "3");

      setTimeout(function () {
        ring.setAttribute("r", "16");
        ring.style.opacity = "0";
      }, 30);

      setTimeout(function () {
        dot.style.transition = "opacity 1.2s ease";
        dot.style.opacity = "0.25";
      }, 1200);
    }
    setTimeout(function () {
      pulseOnce();
      setInterval(pulseOnce, cycle);
    }, delay);
  }

  /* ---------------------------------------------------------
     Header shrink shadow on scroll (subtle)
  --------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.style.borderBottomColor = "rgba(255,255,255,0.08)";
    } else {
      header.style.borderBottomColor = "";
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();
})();
