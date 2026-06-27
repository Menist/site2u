/*!
 * site2u.by — Animations v2.1
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

  function onVisible(elements, callback, once = true) {
    const targets = Array.isArray(elements) ? elements : [elements];
    if (!targets.length) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          callback(entry.target);
          if (once) io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -300px 0px" }
    );

    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) {
        callback(el);
        if (once) return;
      }
      io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     1. HERO — CINEMATIC ENTRANCE (GSAP)
  ═══════════════════════════════════════════════════════════════════════════ */

  function initHeroEntrance() {
    const overlay  = document.querySelector(".hero__overlay");
    const logo     = document.querySelector(".hero__logo");
    const navLinks = document.querySelectorAll(".hero__nav-link");
    const titleEl  = document.querySelector(".hero__title");
    const subtitle = document.querySelector(".hero__subtitle");
    const cta      = document.querySelector(".hero__cta");
    const arrow    = document.querySelector(".hero__arrow");

    if (!titleEl) return;

    if (reduced) {
      document
        .querySelectorAll(".hero__nav-link, .hero__logo, .hero__subtitle, .hero__cta, .hero__arrow, .hero__word")
        .forEach(el => {
          if (el) el.style.opacity = "1";
          if (el && el.style) el.style.transform = "translateY(0)";
        });
      return;
    }

    // Слова уже есть в DOM, просто получаем их
    const titleWords = titleEl.querySelectorAll(".hero__word");

    // Устанавливаем начальное состояние через GSAP
    gsap.set(titleWords, {
      y: "110%",
      opacity: 0,
      clearProps: "all" // очищаем inline стили, которые могли быть установлены CSS
    });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });

    // Overlay
    tl.fromTo(
      overlay,
      { opacity: 0.9 },
      { opacity: 0.45, duration: 2.2, ease: "power3.out" },
      0
    );

    // Logo
    if (logo) {
      tl.fromTo(
        logo,
        { opacity: 0, letterSpacing: "20px" },
        { opacity: 1, letterSpacing: "5px", duration: 1.3 },
        0.25
      );
    }

    // Nav links
    if (navLinks.length) {
      tl.fromTo(
        navLinks,
        { y: -22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 },
        0.4
      );
    }

    // Title words — анимация уже готовой структуры
    tl.fromTo(
      titleWords,
      { y: "110%", opacity: 0 },
      { y: "0%", opacity: 1, stagger: 0.065, duration: 1.1 },
      0.75
    );

    // Subtitle
    if (subtitle) {
      tl.fromTo(
        subtitle,
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        1.15
      );
    }

    // CTA
    if (cta) {
      tl.fromTo(
        cta,
        { y: 22, opacity: 0, scale: 0.88 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.6)" },
        1.4
      );
    }

    // Arrow with bounce
    if (arrow) {
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
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. SECTION REVEALS (унифицированная функция)
  ═══════════════════════════════════════════════════════════════════════════ */

  function initSectionReveal(selector, className = "is-visible") {
    const section = document.querySelector(selector);
    if (!section) return;
    onVisible(section, () => section.classList.add(className));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     3. MAGNETIC BUTTONS
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
    document.documentElement.classList.remove('js-loading');
    document.body.classList.add("js-ready");

    // Инициализируем все анимации
    initHeroEntrance();

    // Секции с is-visible
    const sections = [
      '.services',
      '.about-teaser',
      '.advantages',
      '.process',
      '.configurator',
      '.cta'
    ];

    sections.forEach(selector => initSectionReveal(selector));

    initMagneticButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();