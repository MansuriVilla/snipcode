/**
 * ================================================================
 * Main Application JavaScript
 * ================================================================
 * Optimized for performance across all devices
 * Features: Smooth scrolling, animations, interactive effects
 */

// ================================================================
// CONFIGURATION & CONSTANTS
// ================================================================

const CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  ANIMATION_THRESHOLD: 0.25,
  DEBOUNCE_DELAY: 100,
  THROTTLE_DELAY: 16, // ~60fps
};

// ================================================================
// SMOOTH SCROLLING SETUP (Lenis)
// ================================================================

/**
 * Initialize Lenis smooth scrolling with GSAP integration
 */
function initSmoothScrolling() {
  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Sync with ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  // Add to GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Enable lag smoothing to prevent huge jumps (default behavior)
  // gsap.ticker.lagSmoothing(0);

  return lenis;
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = performance.now();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Check if device is mobile
 */
function isMobile() {
  return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
}

/**
 * Check if device is tablet or smaller
 */
function isTabletOrSmaller() {
  return window.innerWidth <= CONFIG.TABLET_BREAKPOINT;
}

// ================================================================
// COLOR UTILITIES
// ================================================================

function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function getLuminance([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function colorDifference([r1, g1, b1], [r2, g2, b2]) {
  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
}

function getBestTextColor(backgroundColor, palette) {
  let bestColor = "#fff";
  let maxContrast = 0;

  palette.forEach((color) => {
    const luminanceContrast = Math.abs(
      getLuminance(backgroundColor) - getLuminance(color)
    );

    if (
      luminanceContrast > maxContrast &&
      colorDifference(backgroundColor, color) > 80
    ) {
      maxContrast = luminanceContrast;
      bestColor = rgbToHex(...color);
    }
  });

  return bestColor;
}

function applyColors(image, targetElement, colorThief) {
  if (image.naturalWidth === 0) return;

  const dominantColor = colorThief.getColor(image);
  const palette = colorThief.getPalette(image, 5);

  // Use a brighter color if dominant is too dark
  const backgroundColor =
    (getLuminance(dominantColor) < 0.3 &&
      palette.find((c) => getLuminance(c) > 0.5)) ||
    dominantColor;

  targetElement.style.backgroundColor = rgbToHex(...backgroundColor);
  targetElement.style.color = getBestTextColor(backgroundColor, palette);
}

// ================================================================
// NAVIGATION & MENU
// ================================================================

function initOffCanvasMenu() {
  const elements = {
    menuToggle: document.querySelector(".menu-toggle"),
    offCanvasMenu: document.querySelector(".off-canvas-menu"),
    menu: document.querySelector(".menu"),
    ctaMain: document.querySelector(".cta_main"),
    menuClose: document.querySelector(".menu-close"),
    header: document.querySelector(".header"),
    headerNav: document.querySelector(".header_navigations_links"),
  };

  if (!elements.menuToggle || !elements.offCanvasMenu) return;

  // Initialize GSAP Timeline
  let menuTimeline = null;

  const createMenuTimeline = () => {
    // Kill existing timeline if any to prevent conflicts
    if (menuTimeline) menuTimeline.kill();

    menuTimeline = gsap.timeline({ paused: true });

    // Initial state set by CSS (translateX: 100%) for menu
    // We need to target the actual list items for stagger effect
    const menuItems = elements.offCanvasMenu.querySelectorAll("li");

    // Set initial state for items (hidden and slightly down)
    gsap.set(menuItems, { y: 20, autoAlpha: 0 });

    menuTimeline
      // Step 1: Menu slides in from right to left
      .to(elements.offCanvasMenu, {
        x: "0%",
        duration: 0.8,
        ease: "power3.inOut", // Cubic bezier feel
      })
      // Step 2: Items reveal with stagger
      .to(
        menuItems,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.4" // Overlap slightly with slide-in
      );
  };

  /**
   * Move menu to appropriate container based on screen size
   */
  const repositionMenu = () => {
    const targetContainer = isMobile()
      ? elements.offCanvasMenu
      : elements.headerNav;

    // Move menu list
    if (!targetContainer.contains(elements.menu)) {
      targetContainer.appendChild(elements.menu);
    }
    // Move CTA button
    if (!targetContainer.contains(elements.ctaMain)) {
      targetContainer.appendChild(elements.ctaMain);
    }

    // Re-create timeline whenever DOM structure changes (items move)
    if (isMobile()) {
      createMenuTimeline();
    }
  };

  const toggleMenu = (isOpen) => {
    if (!menuTimeline) createMenuTimeline();

    if (isOpen) {
      elements.header.classList.add("menu-active");
      menuTimeline.play();
    } else {
      // Create a reverse timeline for specific close requirement:
      // "first items goes from y0 to y 20 and then menu goes revers"

      const menuItems = elements.offCanvasMenu.querySelectorAll("li");
      const closeTimeline = gsap.timeline({
        onComplete: () => {
          elements.header.classList.remove("menu-active");
          // Reset timeline to start
          menuTimeline.pause(0);
        },
      });

      closeTimeline
        .to(menuItems, {
          y: 20,
          autoAlpha: 0,
          duration: 0.3,
          stagger: {
            each: 0.05,
            from: "start", // or "end" if you want bottom-up, user implied simple reverse but "first items" usually means top-down
          },
          ease: "power2.in",
        })
        .to(
          elements.offCanvasMenu,
          {
            x: "100%", // Slide back out to right
            duration: 0.6,
            ease: "power3.inOut",
          },
          "-=0.1"
        );
    }
  };

  // Event listeners
  window.addEventListener(
    "resize",
    debounce(repositionMenu, CONFIG.DEBOUNCE_DELAY)
  );
  repositionMenu(); // Run once on init

  elements.menuToggle.addEventListener("click", () => toggleMenu(true));

  if (elements.menuClose) {
    elements.menuClose.addEventListener("click", () => toggleMenu(false));
  }

  // Close menu when clicking on links
  elements.offCanvasMenu.addEventListener("click", (event) => {
    if (event.target.classList.contains("header_nav_links")) {
      toggleMenu(false);
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    // Only verify clicks if menu is actually open (rough check via transform or class if we maintained one,
    // but here we can check if timeline is active or progress > 0)

    // Simplest check: is menu visually open?
    const isMenuOpen = elements.header.classList.contains("menu-active");

    if (
      isMenuOpen &&
      !elements.offCanvasMenu.contains(event.target) &&
      !elements.menuToggle.contains(event.target)
    ) {
      toggleMenu(false);
    }
  });
}

function initHeaderActiveEffect() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".has_active--effect");

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(
          `.has_active--effect[href="#${entry.target.id}"]`
        );

        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("isActive"));
          if (link) link.classList.add("isActive");
        }
      });
    },
    { threshold: CONFIG.ANIMATION_THRESHOLD }
  );

  sections.forEach((section) => observer.observe(section));

  // Smooth scroll on click
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (href.startsWith("#")) {
        event.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          navLinks.forEach((l) => l.classList.remove("isActive"));
          link.classList.add("isActive");
        }
      }
    });
  });
}

// ================================================================
// PARTICLE EFFECTS
// ================================================================

function initParticles() {
  if (!document.getElementById("Home") || typeof particlesJS === "undefined") {
    return;
  }

  const particleCount = isMobile() ? 40 : 80;

  particlesJS("Home", {
    particles: {
      number: {
        value: particleCount,
        density: { enable: true, value_area: 800 },
      },
      color: { value: "#fff" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#fff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "body",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });

  // Optimize: Pause particles when off-screen
  const homeSection = document.getElementById("Home");
  if (homeSection && window.pJSDom) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Find the pJS instance for this container
          const pJSInstance = window.pJSDom.find((p) =>
            p.pJS.canvas.el.closest("#Home")
          );

          if (!pJSInstance) return;

          if (entry.isIntersecting) {
            if (!pJSInstance.pJS.particles.move.enable) {
              pJSInstance.pJS.particles.move.enable = true;
              pJSInstance.pJS.fn.vendors.draw();
            }
          } else {
            pJSInstance.pJS.particles.move.enable = false;
          }
        });
      },
      { threshold: 0 }
    ); // Trigger as soon as it leaves/enters

    observer.observe(homeSection);
  }
}

// ================================================================
// SCROLL EFFECTS
// ================================================================

/**
 * Initialize scroll-speed controlled elements
 */
function initScrollSpeedEffect() {
  const sections = document.querySelectorAll(".has_scroll--speed__section");
  if (sections.length === 0) return;

  let rafId = null;
  let viewportHeight = window.innerHeight;

  const updateScrollEffect = () => {
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isInView = rect.top <= viewportHeight && rect.bottom >= 0;

      section.classList.toggle("is_view", isInView);

      // Skip animation if disabled for current viewport
      const disableBreakpoint =
        parseInt(section.getAttribute("data-disable-scroll-animation")) ||
        Infinity;

      if (isInView && window.innerWidth > disableBreakpoint) {
        const scrollOffset = rect.top - viewportHeight;
        const elements = section.querySelectorAll(
          ".has_scroll--speed__element"
        );

        elements.forEach((element) => {
          const speed =
            parseFloat(element.getAttribute("data-scroll-speed")) || 1;
          const translateY = Math.round(scrollOffset / speed);
          element.style.transform = `translateY(${translateY}px)`;
        });
      }
    });

    rafId = null;
  };

  const handleScroll = throttle(() => {
    if (!rafId) {
      rafId = requestAnimationFrame(updateScrollEffect);
    }
  }, CONFIG.THROTTLE_DELAY);

  window.addEventListener("scroll", handleScroll, { passive: true });

  window.addEventListener(
    "resize",
    debounce(() => {
      viewportHeight = window.innerHeight;
      updateScrollEffect();
    }, CONFIG.DEBOUNCE_DELAY)
  );
}

// ================================================================
// FORM VALIDATION
// ================================================================

/**
 * Initialize form validation
 */
function initFormValidation() {
  const form = document.querySelector(".site_form--container");
  if (!form) return;

  const showError = (inputElement, message) => {
    if (!inputElement) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-msg";
    errorDiv.style.cssText =
      "display: flex; align-items: center; gap: 5px; color: red; font-size: 0.75rem;";
    errorDiv.innerHTML = `<span>⚠️</span>${message}`;
    inputElement.parentElement.appendChild(errorDiv);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Clear previous errors
    document.querySelectorAll(".error-msg").forEach((error) => error.remove());

    let isValid = true;

    // Text input validation
    const textFields = [
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
    ];

    textFields.forEach(({ id, message, regex }) => {
      const input = document.getElementById(id);
      const value = input?.value.trim();

      if (!value || (regex && !regex.test(value))) {
        isValid = false;
        showError(input, message);
      }
    });

    // Radio button validation
    ["service", "budget"].forEach((name) => {
      if (!document.querySelector(`input[name="${name}"]:checked`)) {
        isValid = false;
        const firstInput = document.querySelector(`input[name="${name}"]`);
        showError(firstInput, `Please select a ${name}.`);
      }
    });

    if (isValid) {
      form.submit();
    }
  });

  // Phone number formatting
  const phoneInput = document.getElementById("phone");
  phoneInput?.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
  });
}

// ================================================================
// INTERACTIVE EFFECTS
// ================================================================

/**
 * Initialize magnetic hover effect on elements
 */
function initMagneticEffect() {
  const elements = document.querySelectorAll(".has_magnatic--effect");
  if (elements.length === 0) return;

  elements.forEach((element) => {
    const handleMouseMove = throttle((event) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (event.clientX - centerX) * 0.2;
      const deltaY = (event.clientY - centerY) * 0.2;

      element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
      element.classList.add("is_magnatic--effect");
    }, CONFIG.THROTTLE_DELAY);

    element.addEventListener("mousemove", handleMouseMove, { passive: true });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "translate(0, 0) scale(1)";
      element.classList.remove("is_magnatic--effect");
    });
  });
}

/**
 * Initialize custom cursor
 */
function initCustomCursor() {
  const cursor = document.getElementById("customCursor");
  if (!cursor) return;

  // Spring physics variables
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let velocityX = 0;
  let velocityY = 0;

  const spring = 0.2;
  const damping = 0.75;
  const mass = 1;

  /**
   * Update cursor position with spring physics
   */
  const updateCursor = () => {
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    const accelerationX = (spring * dx - damping * velocityX) / mass;
    const accelerationY = (spring * dy - damping * velocityY) / mass;

    velocityX += accelerationX;
    velocityY += accelerationY;

    currentX += velocityX;
    currentY += velocityY;

    cursor.style.transform = `translate3d(${currentX - 40}px, ${
      currentY - 40
    }px, 0)`;

    requestAnimationFrame(updateCursor);
  };

  document.addEventListener(
    "mousemove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    },
    { passive: true }
  );

  updateCursor();

  // Add hover effect for project items
  document.querySelectorAll(".project_content-item").forEach((item) => {
    item.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
    item.addEventListener("mouseleave", () =>
      cursor.classList.remove("hovering")
    );
  });
}

// ================================================================
// VELOCITY SLIDER
// ================================================================

/**
 * Initialize infinite velocity-based slider
 */
function initVelocitySlider() {
  const sliders = document.querySelectorAll(".siteVelocity__slider");
  if (sliders.length === 0) return;

  sliders.forEach((slider) => {
    let itemWidth;
    let totalWidth;
    let items = Array.from(slider.children);
    let position = 0;
    let velocity = 0;
    let direction = 1;

    /**
     * Calculate dimensions
     */
    const calculateDimensions = () => {
      itemWidth = items[0].offsetWidth + 20; // Include gap
      totalWidth = itemWidth * items.length;
    };

    calculateDimensions();

    // Clone items until slider is wide enough
    while (slider.scrollWidth < 2 * window.innerWidth) {
      items.forEach((item) => slider.appendChild(item.cloneNode(true)));
      items = Array.from(slider.children);
      calculateDimensions();
    }

    // Wheel event for velocity control
    const handleWheel = throttle((event) => {
      direction = event.deltaY > 0 ? -1 : 1;
      velocity = Math.min(velocity + 0.02 * Math.abs(event.deltaY), 12);
    }, 50);

    window.addEventListener("wheel", handleWheel, { passive: true });

    window.addEventListener(
      "resize",
      debounce(() => {
        calculateDimensions();
        position %= totalWidth;
      }, CONFIG.DEBOUNCE_DELAY)
    );

    // Optimize: Pause animation when off-screen
    let isVisible = true;
    let rafId = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!rafId) animate();
        } else {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        }
      });
    });

    observer.observe(slider);

    slider.style.willChange = "transform";

    /**
     * Animate slider
     */
    const animate = () => {
      if (!isVisible) return;

      position = (position + (0.5 + velocity) * direction) % totalWidth;
      slider.style.transform = `translateX(${-position}px)`;
      velocity *= 0.95; // Deceleration
      rafId = requestAnimationFrame(animate);
    };

    animate();
  });
}

// ================================================================
// GSAP ANIMATIONS
// ================================================================

/**
 * Initialize GSAP ScrollTrigger animations
 */
function initGSAPAnimations() {
  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  // Header scroll animation
  const header = document.querySelector(".header");
  if (header) {
    gsap.to(".header", {
      scrollTrigger: {
        trigger: "body",
        start: "top 0%",
        end: "bottom 50%",
        scrub: true,
        endTrigger: "section:first-child",
        markers: false,
        onEnter: () => header.classList.add("scrolled"),
        onLeaveBack: () => header.classList.remove("scrolled"),
        onUpdate: (self) => {
          if (self.progress > 0) {
            header.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
          }
        },
      },
      backgroundColor: "#00000030",
      backdropFilter: "blur(30px)",
      width: () => (isTabletOrSmaller() ? "100%" : "60%"),
      y: () => (isTabletOrSmaller() ? "0px" : "20px"),
      borderRadius: () => (isTabletOrSmaller() ? "0px" : "50px"),
      ease: "none",
    });
  }

  // Right box fade-in animation
  document.querySelectorAll(".right-box").forEach((box) => {
    gsap.to(box, {
      color: "#fff",
      opacity: 1,
      duration: 0.3,
      scrollTrigger: {
        trigger: box,
        start: "0% 78%",
        end: "100% 78%",
        scrub: true,
      },
    });
  });

  if (!isTabletOrSmaller()) {
    // Projects section scale animation
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      gsap.to("#projects", {
        "--scale": 1,
        scrollTrigger: {
          trigger: "#projects",
          start: "top 2%",
          end: "bottom 80%",
          scrub: true,
        },
      });
    }
  }
}

// ================================================================
// COLOR THIEF INTEGRATION
// ================================================================

/**
 * Apply dynamic colors to skill icons based on image colors
 */
function initSkillIconColors() {
  if (typeof ColorThief === "undefined") return;

  const colorThief = new ColorThief();
  const skillIcons = document.querySelectorAll(".skills_icon");

  skillIcons.forEach((iconWrapper) => {
    const image = iconWrapper.querySelector(".skill");
    const label = iconWrapper.querySelector(".skills__Label");

    if (!image || !label) return;

    image.crossOrigin = "Anonymous";

    if (image.complete) {
      applyColors(image, label, colorThief);
    } else {
      image.addEventListener(
        "load",
        () => applyColors(image, label, colorThief),
        {
          once: true,
        }
      );
    }
  });
}

// ================================================================
// INITIALIZATION
// ================================================================

/**
 * Initialize all features on DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling
  initSmoothScrolling();

  // Navigation
  initOffCanvasMenu();
  initHeaderActiveEffect();

  // Visual effects
  initParticles();
  initCustomCursor();
  initMagneticEffect();
  initVelocitySlider();

  // Scroll effects
  initScrollSpeedEffect();

  // Form
  initFormValidation();

  // Color thief
  initSkillIconColors();

  // GSAP animations
  initGSAPAnimations();

  // Project List Animation
  initProjectListAnimation();
});

// ================================================================
// PROJECT LIST ANIMATION
// ================================================================

function initProjectListAnimation() {
  const projectList = document.querySelector(".project-list");
  const reveal = document.querySelector(".project-hover-reveal");
  const revealImg = document.querySelector(".project-hover-reveal__img");
  const items = document.querySelectorAll(".project-list__item");

  if (!projectList || !reveal || !revealImg || items.length === 0) return;

  // Initial state for reveal
  gsap.set(reveal, { xPercent: -50, yPercent: -50 });

  // Hint browser for performance
  reveal.style.willChange = "transform, opacity";

  // Optimize mouse movement with quickTo (GSAP 3.10+)
  // Fallback to simple tween if quickTo is not available (older GSAP versions)
  let xTo, yTo;

  if (gsap.quickTo) {
    xTo = gsap.quickTo(reveal, "x", { duration: 0.5, ease: "power2.out" });
    yTo = gsap.quickTo(reveal, "y", { duration: 0.5, ease: "power2.out" });
  }

  // Mouse movement for the reveal container
  const moveReveal = (e) => {
    // If reduced motion is preferred, do not follow mouse
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (xTo && yTo) {
      xTo(e.clientX);
      yTo(e.clientY);
    } else {
      gsap.to(reveal, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  projectList.addEventListener("mousemove", moveReveal);

  // Item hover effects
  items.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      const imgPath = item.getAttribute("data-img");

      // Swap image
      if (imgPath) {
        revealImg.style.backgroundImage = `url(${imgPath})`;
      }

      // Show reveal
      gsap.to(reveal, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Animate image inside (scale down effect)
      gsap.fromTo(
        revealImg,
        { scale: 1.2 },
        { scale: 1, duration: 0.5, ease: "power2.out", overwrite: true }
      );
    });

    item.addEventListener("mouseleave", () => {
      // Hide reveal
      gsap.to(reveal, {
        autoAlpha: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });

  // Stagger animation for list items on scroll
  if (typeof ScrollTrigger !== "undefined") {
    gsap.from(".project-list__item", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".project-list",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none none",
      },
    });
  }
}

/**
 * Initialize FAQ GSAP Animations
 */
function initFAQAnimation() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  // 1. Staggered Entrance Animation
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    // Ensure visibility reset first in case of reload mid-page
    gsap.set(faqItems, { autoAlpha: 1 });

    gsap.from(faqItems, {
      scrollTrigger: {
        trigger: ".faq-container",
        start: "top 85%", // Trigger a bit earlier
        toggleActions: "play none none reverse",
      },
      y: 50,
      autoAlpha: 0, // handles opacity + visibility
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      clearProps: "transform", // Clean up after animation to avoid z-index/stacking issues
    });
  } else {
    // Fallback if GSAP fails
    faqItems.forEach((item) => (item.style.opacity = 1));
  }

  // 2. Accordion Logic
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all others
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          otherItem.querySelector(".faq-question").classList.remove("active");
          gsap.to(otherItem.querySelector(".faq-answer"), {
            height: 0,
            duration: 0.4,
            ease: "power2.inOut",
          });
          gsap.to(otherItem.querySelector(".faq-answer p"), {
            opacity: 0,
            y: 10,
            duration: 0.2,
          });
        }
      });

      // Toggle current
      if (!isActive) {
        item.classList.add("active");
        question.classList.add("active");

        // Animate height to auto
        gsap.set(answer, { height: "auto" });
        const height = answer.offsetHeight;
        gsap.set(answer, { height: 0 });

        gsap.to(answer, {
          height: height,
          duration: 0.4,
          ease: "power2.out",
        });

        // Animate content fade in
        gsap.to(answer.querySelector("p"), {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.1,
        });
      } else {
        item.classList.remove("active");
        question.classList.remove("active");

        gsap.to(answer, {
          height: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
        gsap.to(answer.querySelector("p"), {
          opacity: 0,
          y: 10,
          duration: 0.2,
        });
      }
    });
  });
}

/**
 * Mark body as loaded after window.onload
 */
window.onload = () => {
  document.body.classList.add("loaded");

  // Initialize FAQ Animation here to ensure DOM is ready
  initFAQAnimation();
};
