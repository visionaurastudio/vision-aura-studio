/* =========================================================
   VISION AURA STUDIO — Main JS
   ========================================================= */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Loading screen ---------------- */
  window.addEventListener("load", function(){
    var loader = document.getElementById("loader");
    setTimeout(function(){
      if(loader){ loader.classList.add("hidden"); }
    }, 550);
  });

  /* ---------------- Year in footer ---------------- */
  var yearEl = document.getElementById("year");
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  /* ---------------- Custom cursor ---------------- */
  var cursorDot = document.getElementById("cursorDot");
  var cursorRing = document.getElementById("cursorRing");
  var hasFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  if(hasFinePointer && cursorDot && cursorRing){
    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener("mousemove", function(e){
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top = mouseY + "px";
    });

    (function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";
      requestAnimationFrame(animateRing);
    })();

    var interactiveSelectors = "a, button, input, textarea, select, .filter-btn, .service-card, .portfolio-card, .team-card";
    document.querySelectorAll(interactiveSelectors).forEach(function(el){
      el.addEventListener("mouseenter", function(){ cursorRing.classList.add("grow"); });
      el.addEventListener("mouseleave", function(){ cursorRing.classList.remove("grow"); });
    });
  } else {
    if(cursorDot) cursorDot.style.display = "none";
    if(cursorRing) cursorRing.style.display = "none";
  }

  /* ---------------- Mouse glow parallax on hero orb ---------------- */
  var apertureFrame = document.querySelector(".aperture-frame");
  if(apertureFrame && hasFinePointer && !reduceMotion){
    document.querySelector(".hero").addEventListener("mousemove", function(e){
      var rect = apertureFrame.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / rect.width;
      var dy = (e.clientY - cy) / rect.height;
      apertureFrame.style.transform = "rotate(" + (dx * 6) + "deg) translate(" + (dx*10) + "px," + (dy*10) + "px)";
    });
  }

  /* ---------------- Navbar scroll state ---------------- */
  var navbar = document.getElementById("navbar");
  var scrollProgress = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");

  function onScroll(){
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if(navbar){ navbar.classList.toggle("scrolled", scrollTop > 20); }
    if(scrollProgress){ scrollProgress.style.width = pct + "%"; }
    if(backToTop){ backToTop.classList.toggle("visible", scrollTop > 600); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if(backToTop){
    backToTop.addEventListener("click", function(){
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- Mobile menu ---------------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMenu(){
    if(menuToggle) menuToggle.classList.remove("active");
    if(mobileMenu) mobileMenu.classList.remove("open");
    menuToggle && menuToggle.setAttribute("aria-expanded", "false");
  }

  if(menuToggle && mobileMenu){
    menuToggle.addEventListener("click", function(){
      var isOpen = mobileMenu.classList.toggle("open");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------------- Scroll reveal (IntersectionObserver) ---------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if("IntersectionObserver" in window){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          entry.target.style.setProperty("--i", i);
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  }

  /* ---------------- Animated counters ---------------- */
  var counters = document.querySelectorAll(".stat-num[data-count]");
  function runCounter(el){
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var startTime = null;

    function step(ts){
      if(!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if(progress < 1){
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
        el.classList.add("counted");
      }
    }
    requestAnimationFrame(step);
  }

  if(counters.length && "IntersectionObserver" in window){
    var counterObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function(el){ counterObserver.observe(el); });
  }

  /* ---------------- Smooth anchor scroll (accounts for fixed navbar) ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener("click", function(e){
      var id = this.getAttribute("href");
      if(id.length < 2) return;
      var target = document.querySelector(id);
      if(target){
        e.preventDefault();
        var offset = 76;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        closeMenu();
      }
    });
  });

  /* ---------------- Portfolio filter ---------------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var portfolioCards = document.querySelectorAll(".portfolio-card");

  filterBtns.forEach(function(btn){
    btn.addEventListener("click", function(){
      filterBtns.forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");

      portfolioCards.forEach(function(card){
        var match = filter === "all" || card.getAttribute("data-cat") === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------------- Contact form (front-end only) ---------------- */
 var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  var formBtnText = document.getElementById("formBtnText");

  // Formspree endpoint. Replace "xxxxabcd" with your real Formspree form ID. in future
  var CONTACT_API_URL = "https://formspree.io/f/xkodkpab";

  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }
      formBtnText.textContent = "Sending...";
      formNote.classList.remove("success");
      formNote.textContent = "";

      fetch(CONTACT_API_URL, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
      .then(function(response){
        formBtnText.textContent = "Send Message";
        if(response.ok){
          formNote.textContent = "Thanks! Your message has been sent — we'll get back to you within a day.";
          formNote.classList.add("success");
          form.reset();
        } else {
          formNote.textContent = "Something went wrong. Please try again or email us directly.";
        }
      })
      .catch(function(){
        formBtnText.textContent = "Send Message";
        formNote.textContent = "Could not reach the server. Please try again or email us directly.";
      });
    });
  }

  /* ---------------- Floating particles (canvas) ---------------- */
  var canvas = document.getElementById("particles");
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext("2d");
    var particles = [];
    var particleCount = window.innerWidth < 768 ? 26 : 55;
    var w, h;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = document.documentElement.scrollHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function makeParticle(){
      var isOrange = Math.random() > 0.5;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.6,
        speedY: Math.random() * 0.25 + 0.05,
        speedX: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.55 + 0.22,
        color: isOrange ? "249,115,22" : "168,85,247"
      };
    }
    for(var i = 0; i < particleCount; i++){ particles.push(makeParticle()); }

    function tick(){
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function(p){
        p.y -= p.speedY;
        p.x += p.speedX;
        if(p.y < -10){ p.y = h + 10; p.x = Math.random() * w; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.color + "," + p.alpha + ")";
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  }
  
})();
