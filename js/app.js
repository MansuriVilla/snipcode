const lenis = new Lenis({
  duration: 1.2,
  easing: (e) => 1 - Math.pow(1 - e, 3),
  smooth: !0,
  smoothTouch: !0,
  direction: "vertical",
  gestureDirection: "vertical",
  wheelMultiplier: 1.2,
  touchMultiplier: 2,
  normalizeWheel: !0,
  infinite: !1,
});
function rgbToHex(e, t, n) {
  return `#${((1 << 24) | (e << 16) | (t << 8) | n).toString(16).slice(1)}`;
}
function getLuminance([e, t, n]) {
  return (0.299 * e + 0.587 * t + 0.114 * n) / 255;
}
function colorDifference([e, t, n], [o, r, a]) {
  return Math.sqrt(
    Math.pow(o - e, 2) + Math.pow(r - t, 2) + Math.pow(a - n, 2)
  );
}
function getBestTextColor(e, t) {
  let n = "#fff",
    o = 0;
  return (
    t.forEach((t) => {
      const r = Math.abs(getLuminance(e) - getLuminance(t));
      r > o && colorDifference(e, t) > 80 && ((o = r), (n = rgbToHex(...t)));
    }),
    n
  );
}
function applyColors(e, t, n) {
  if (0 === e.naturalWidth) return;
  const o = n.getColor(e),
    r = n.getPalette(e, 5),
    a = (getLuminance(o) < 0.3 && r.find((e) => getLuminance(e) > 0.5)) || o;
  (t.style.backgroundColor = rgbToHex(...a)),
    (t.style.color = getBestTextColor(a, r));
}
function offcanvasMenu() {
  const e = {
      menuToggle: document.querySelector(".menu-toggle"),
      offCanvasMenu: document.querySelector(".off-canvas-menu"),
      menu: document.querySelector(".menu"),
      ctaMain: document.querySelector(".cta_main"),
      menuClose: document.querySelector(".menu-close"),
      header: document.querySelector(".header"),
      headerNav: document.querySelector(".header_navigations_links"),
    },
    t = () => {
      const t = window.innerWidth <= 768 ? e.offCanvasMenu : e.headerNav;
      t.contains(e.menu) || t.appendChild(e.menu),
        t.contains(e.ctaMain) || t.appendChild(e.ctaMain);
    },
    n = (t) => {
      e.offCanvasMenu.classList.toggle("active", t),
        e.header.classList.toggle("menu-active", t);
    };
  window.addEventListener("resize", debounce(t, 100)),
    t(),
    e.menuToggle.addEventListener("click", () => n(!0)),
    e.menuClose.addEventListener("click", () => n(!1)),
    e.offCanvasMenu.addEventListener("click", (e) => {
      e.target.classList.contains("header_nav_links") && n(!1);
    }),
    document.addEventListener("click", (t) => {
      e.offCanvasMenu.contains(t.target) ||
        e.menuToggle.contains(t.target) ||
        n(!1);
    });
}
function particlesMainFn() {
  if (!document.getElementById("Home") || !window.particlesJS) return;
  const e = window.innerWidth < 768 ? 40 : 80;
  particlesJS("Home", {
    particles: {
      number: { value: e, density: { enable: !0, value_area: 800 } },
      color: { value: "#fff" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: !0 },
      line_linked: {
        enable: !0,
        distance: 150,
        color: "#fff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: !0,
        speed: 2,
        direction: "none",
        random: !1,
        straight: !1,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "body",
      events: {
        onhover: { enable: !0, mode: "grab" },
        onclick: { enable: !0, mode: "push" },
        resize: !0,
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: !0,
  });
}
function headerActiveEffect() {
  const e = document.querySelectorAll("section"),
    t = document.querySelectorAll(".has_active--effect"),
    n = new IntersectionObserver(
      (e) => {
        e.forEach((e) => {
          const n = document.querySelector(
            `.has_active--effect[href="#${e.target.id}"]`
          );
          e.isIntersecting &&
            (t.forEach((e) => e.classList.remove("isActive")),
            n && n.classList.add("isActive"));
        });
      },
      { threshold: 0.25 }
    );
  e.forEach((e) => n.observe(e)),
    t.forEach((e) => {
      e.addEventListener("click", (n) => {
        const o = e.getAttribute("href");
        o.startsWith("#") &&
          (n.preventDefault(),
          document.querySelector(o)?.scrollIntoView({ behavior: "smooth" }),
          t.forEach((e) => e.classList.remove("isActive")),
          e.classList.add("isActive"));
      });
    });
}
function speedCtrl() {
  const e = document.querySelectorAll(".has_scroll--speed__section");
  let t = !1,
    n = window.innerHeight;
  const o = () => {
    e.forEach((e) => {
      const t = e.getBoundingClientRect(),
        o = t.top <= n && t.bottom >= 0;
      if (
        (e.classList.toggle("is_view", o),
        o &&
          !(
            window.innerWidth <=
            (parseInt(e.getAttribute("data-disable-scroll-animation")) || 1 / 0)
          ))
      ) {
        const o = t.top - n;
        e.querySelectorAll(".has_scroll--speed__element").forEach((e) => {
          const t = parseFloat(e.getAttribute("data-scroll-speed")) || 1;
          e.style.transform = `translateY(${Math.round(o / t)}px)`;
        });
      }
    }),
      (t = !1);
  };
  window.addEventListener(
    "scroll",
    throttle(() => !t && ((t = !0), requestAnimationFrame(o)), 16),
    { passive: !0 }
  ),
    window.addEventListener(
      "resize",
      debounce(() => {
        (n = window.innerHeight), o();
      }, 100)
    );
}
function formValidationHandler() {
  const e = document.querySelector(".site_form--container");
  if (!e) return;
  e.addEventListener("submit", (n) => {
    n.preventDefault(),
      document.querySelectorAll(".error-msg").forEach((e) => e.remove());
    let o = !0;
    [
      { id: "name", message: "Please enter your name." },
      {
        id: "phone",
        message: "Please enter a valid phone number.",
        regex: /^\+?\d{7,}$/,
      },
      {
        id: "email",
        message: "Please enter a valid email address.",
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      { id: "company", message: "Please enter a company name." },
    ].forEach(({ id: e, message: n, regex: r }) => {
      const a = document.getElementById(e);
      (a && a.value.trim() && (!r || r.test(a.value.trim()))) ||
        ((o = !1), t(a, n));
    }),
      ["service", "budget"].forEach((e) => {
        document.querySelector(`input[name="${e}"]:checked`) ||
          ((o = !1),
          t(
            document.querySelector(`input[name="${e}"]`),
            `Please select a ${e}.`
          ));
      }),
      o && e.submit();
  });
  const t = (e, t) => {
      if (!e) return;
      const n = document.createElement("div");
      (n.className = "error-msg"),
        (n.style.cssText =
          "display: flex; align-items: center; gap: 5px; color: red; font-size: 0.75rem;"),
        (n.innerHTML = "<span>⚠️</span>" + t),
        e.parentElement.appendChild(n);
    },
    n = document.getElementById("phone");
  n?.addEventListener("input", () => (n.value = n.value.replace(/\D/g, "")));
}
function magneticEffect() {
  document.querySelectorAll(".has_magnatic--effect").forEach((e) => {
    const t = throttle((t) => {
      const n = e.getBoundingClientRect(),
        o = 0.2 * (t.clientX - n.left - n.width / 2),
        r = 0.2 * (t.clientY - n.top - n.height / 2);
      (e.style.transform = `translate(${o}px, ${r}px) scale(1.1)`),
        e.classList.add("is_magnatic--effect");
    }, 16);
    e.addEventListener("mousemove", t, { passive: !0 }),
      e.addEventListener("mouseleave", () => {
        (e.style.transform = "translate(0, 0) scale(1)"),
          e.classList.remove("is_magnatic--effect");
      });
  });
}
function velocitySlider() {
  document.querySelectorAll(".siteVelocity__slider").forEach((e) => {
    let t,
      n,
      o = Array.from(e.children),
      r = 0,
      a = 0,
      i = 1;
    const s = () => {
      (t = o[0].offsetWidth + 20), (n = t * o.length);
    };
    for (s(); e.scrollWidth < 2 * window.innerWidth; )
      o.forEach((t) => e.appendChild(t.cloneNode(!0))),
        (o = Array.from(e.children)),
        s();
    const c = () => {
      (r = (r + (0.5 + a) * i) % n),
        (e.style.transform = `translateX(${-r}px)`),
        (a *= 0.95),
        requestAnimationFrame(c);
    };
    window.addEventListener(
      "wheel",
      throttle((e) => {
        (i = e.deltaY > 0 ? -1 : 1),
          (a = Math.min(a + 0.02 * Math.abs(e.deltaY), 12));
      }, 50),
      { passive: !0 }
    ),
      window.addEventListener(
        "resize",
        debounce(() => {
          s(), (r %= n);
        }, 100)
      ),
      (e.style.willChange = "transform"),
      c();
  });
}
function throttle(e, t) {
  let n = 0;
  return (...o) => {
    const r = performance.now();
    r - n >= t && (e(...o), (n = r));
  };
}
function debounce(e, t) {
  let n;
  return (...o) => {
    clearTimeout(n), (n = setTimeout(() => e(...o), t));
  };
}
lenis.on("scroll", ScrollTrigger.update),
  gsap.ticker.add((e) => lenis.raf(1e3 * e)),
  gsap.ticker.lagSmoothing(0),
  document.addEventListener("DOMContentLoaded", () => {
    const e = document.getElementById("customCursor");
    if (!e) return;
    let t = 0, n = 0, o = 0, r = 0;
  
    const a = () => {
      o += 0.2 * (t - o); // Smooth lerp for x
      r += 0.2 * (n - r); // Smooth lerp for y
      e.style.transform = `translate3d(${o - 40}px, ${r - 40}px, 0)`; // Use translate3d
      requestAnimationFrame(a);
    };
  
    document.addEventListener(
      "mousemove",
      (e) => {
        t = e.clientX;
        n = e.clientY;
      },
      { passive: true }
    );
  
    a();
  
    document.querySelectorAll(".project_content-item").forEach((t) => {
      t.addEventListener("mouseenter", () => {
        e.classList.add("hovering");
      });
      t.addEventListener("mouseleave", () => {
        e.classList.remove("hovering");
      });
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.ColorThief) return;
    const e = new ColorThief();
    document.querySelectorAll(".skills_icon").forEach((t) => {
      const n = t.querySelector(".skill"),
        o = t.querySelector(".skills__Label");
      (n.crossOrigin = "Anonymous"),
        n.complete
          ? applyColors(n, o, e)
          : n.addEventListener("load", () => applyColors(n, o, e), {
              once: !0,
            });
    });
  }),
  document.addEventListener("DOMContentLoaded", offcanvasMenu),
  particlesMainFn(),
  gsap.registerPlugin(ScrollTrigger),
  gsap.to(".header", {
    scrollTrigger: {
      trigger: ".site_top--area",
      start: "40% 20%",
      end: "bottom bottom",
      scrub: !0,
      onEnter: () =>
        document.querySelector(".header").classList.add("scrolled"),
      onLeaveBack: () =>
        document.querySelector(".header").classList.remove("scrolled"),
    },
    backgroundColor: "#00000030",
    backdropFilter: "blur(30px)",
    width: () => (window.innerWidth <= 1024 ? "90%" : "60%"),
    y: "20px",
    borderRadius: "50px",
    ease: "none",
  }),
  headerActiveEffect(),
  (window.onload = function () {
    document.querySelectorAll(".right-box").forEach(function (e) {
      gsap.to(e, {
        color: "#fff",
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
          trigger: e,
          start: "0% 78%",
          end: "100% 78%",
          scrub: !0,
        },
      });
    });
  }),
  speedCtrl(),
  formValidationHandler(),
  magneticEffect(),
  velocitySlider(),
  gsap.to("#projects", {
    "--scale": 1,
    scrollTrigger: {
      trigger: "#projects",
      start: "top 2%",
      end: "bottom 80%",
      scrub: !0,
    },
  });
