/*!
 * site2u.by — Animations v2.0
 * Зависимости: GSAP core (~27 KB gzip)
 * Подключить в Layout.astro:
 *   <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
 *   <script defer src="/animations.js"></script>
 */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobile = () => window.innerWidth <= 768;

  /* ═══════════════════════════════════════════════════════════════════════════
     UTILS
  ═══════════════════════════════════════════════════════════════════════════ */

  function splitWords(el) {
    if (!el) return [];
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (w, i) =>
          `<span class="word-wrap"><span class="word" style="--i:${i}">${w}</span></span>`
      )
      .join(" ");
    return Array.from(el.querySelectorAll(".word"));
  }

  function onVisible(elements, callback) {
    const targets = Array.isArray(elements) ? elements : [elements];
    if (!targets.length) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          callback(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -300px 0px" }
    );

    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) {
        callback(el);
      } else {
        io.observe(el);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     1. HERO — CINEMATIC ENTRANCE (GSAP)
  ═══════════════════════════════════════════════════════════════════════════ */

  function initHeroEntrance() {
    const overlay  = document.querySelector(".hero__overlay");
    const navLinks = document.querySelectorAll(".hero__nav-link");
    const logo     = document.querySelector(".hero__logo");
    const titleEl  = document.querySelector(".hero__title");
    const subtitle = document.querySelector(".hero__subtitle");
    const cta      = document.querySelector(".hero__cta");
    const arrow    = document.querySelector(".hero__arrow");

    if (!titleEl) return;

    if (reduced) {
      document
        .querySelectorAll(".hero__nav-link, .hero__logo, .hero__subtitle, .hero__cta, .hero__arrow")
        .forEach(el => (el.style.opacity = "1"));
      return;
    }

    const titleWords = splitWords(titleEl);
    gsap.set(titleWords, { y: "110%", opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });

    tl.fromTo(
      overlay,
      { opacity: 0.9 },
      { opacity: 0.45, duration: 2.2, ease: "power3.out" },
      0
    );

    tl.fromTo(
      logo,
      { opacity: 0, letterSpacing: "20px" },
      { opacity: 1, letterSpacing: "5px", duration: 1.3 },
      0.25
    );

    tl.fromTo(
      navLinks,
      { y: -22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 },
      0.4
    );

    tl.fromTo(
      titleWords,
      { y: "110%", opacity: 0 },
      { y: "0%", opacity: 1, stagger: 0.065, duration: 1.1 },
      0.75
    );

    tl.fromTo(
      subtitle,
      { y: 34, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      1.15
    );

    tl.fromTo(
      cta,
      { y: 22, opacity: 0, scale: 0.88 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.6)" },
      1.4
    );

    tl.fromTo(
      arrow,
      { y: -10, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7,
        onComplete() {
          gsap.to(arrow, {
            y: 10, duration: 1.1,
            ease: "sine.inOut", repeat: -1, yoyo: true,
          });
        },
      },
      1.65
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. SERVICES
  ═══════════════════════════════════════════════════════════════════════════ */

  function initServicesReveal() {
    const section = document.querySelector(".services");
    if (!section) return;
    onVisible(section, () => section.classList.add("is-visible")); // ← убрали .services__grid
  }

  function initAboutReveal() {
    const section = document.querySelector(".about-teaser");
    if (!section) return;
    onVisible(section, () => section.classList.add("is-visible")); // ← убрали .about-teaser__grid
  }

  function initFeaturesReveal() {
    const section = document.querySelector(".advantages");
    if (!section) return;
    onVisible(section, () => section.classList.add("is-visible")); // ← убрали .advantages__grid
  }

  function initProcessReveal() {
    const section = document.querySelector(".process");
    if (!section) return;
    onVisible(section, () => section.classList.add("is-visible")); // ← убрали .process__grid
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     6. CONFIGURATOR
  ═══════════════════════════════════════════════════════════════════════════ */

  function initConfiguratorReveal() {
    const section = document.querySelector(".configurator");
    if (!section) return;
    onVisible(section, () => section.classList.add("is-visible"));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     7. CTA
  ═══════════════════════════════════════════════════════════════════════════ */

  function initCtaReveal() {
    const section = document.querySelector(".cta");
    if (!section) return;
    onVisible(section, () => section.classList.add("is-visible"));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     8. MAGNETIC BUTTONS
  ═══════════════════════════════════════════════════════════════════════════ */

  function initMagneticButtons() {
    if (isMobile() || reduced || isTouch) return;

    document.querySelectorAll(".hero__cta, .cta__btn").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r  = btn.getBoundingClientRect();
        const dX = (e.clientX - (r.left + r.width  / 2)) * 0.38;
        const dY = (e.clientY - (r.top  + r.height / 2)) * 0.38;
        gsap.to(btn, { x: dX, y: dY, duration: 0.45, ease: "power2.out", overwrite: true });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.75, ease: "elastic.out(1, 0.4)", overwrite: true });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════════════════ */

  function init() {
    document.body.classList.add("js-ready");

    initHeroEntrance();
    initServicesReveal();
    initAboutReveal();
    initFeaturesReveal();
    initProcessReveal();
    initConfiguratorReveal();
    initCtaReveal();
    initMagneticButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();