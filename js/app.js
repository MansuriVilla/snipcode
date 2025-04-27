// Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => 1 - Math.pow(1 - t, 3),
  smooth: true,
  smoothTouch: true,
  direction: 'vertical',
  gestureDirection: 'vertical',
  wheelMultiplier: 1.2,
  touchMultiplier: 2,
  normalizeWheel: true,
  infinite: false
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

document.addEventListener("DOMContentLoaded", () => {
  const customCursor = document.getElementById("customCursor");
  if (!customCursor) return;

  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  const speed = 0.2;

  const updateMouse = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  const animateCursor = () => {
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    customCursor.style.transform = `translate(${cursorX - 40}px, ${cursorY - 40}px)`;
    requestAnimationFrame(animateCursor);
  };

  document.addEventListener("mousemove", updateMouse, { passive: true });
  animateCursor();

  // Add hover functionality for "project_content-item" elements
  const items = document.querySelectorAll(".project_content-item");
  items.forEach(item => {
    item.addEventListener("mouseenter", () => {
      customCursor.classList.add("hovering");
    });
    item.addEventListener("mouseleave", () => {
      customCursor.classList.remove("hovering");
    });
  });
});

// Color Extraction
function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function getLuminance([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function colorDifference([r1, g1, b1], [r2, g2, b2]) {
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}

function getBestTextColor(bgColor, palette) {
  let bestColor = "#fff", maxContrast = 0;
  palette.forEach(color => {
    const contrast = Math.abs(getLuminance(bgColor) - getLuminance(color));
    if (contrast > maxContrast && colorDifference(bgColor, color) > 80) {
      maxContrast = contrast;
      bestColor = rgbToHex(...color);
    }
  });
  return bestColor;
}

function applyColors(img, label, colorThief) {
  if (img.naturalWidth === 0) return;

  const dominantColor = colorThief.getColor(img);
  const palette = colorThief.getPalette(img, 5);
  const bgLum = getLuminance(dominantColor);
  const finalBgColor = bgLum < 0.3 ? (palette.find(color => getLuminance(color) > 0.5) || dominantColor) : dominantColor;

  label.style.backgroundColor = rgbToHex(...finalBgColor);
  label.style.color = getBestTextColor(finalBgColor, palette);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.ColorThief) return;
  const colorThief = new ColorThief();
  const skillIcons = document.querySelectorAll(".skills_icon");

  skillIcons.forEach(icon => {
    const img = icon.querySelector(".skill");
    const label = icon.querySelector(".skills__Label");
    img.crossOrigin = "Anonymous";
    img.complete ? applyColors(img, label, colorThief) : img.addEventListener("load", () => applyColors(img, label, colorThief), { once: true });
  });
});

// Off-Canvas Menu
function offcanvasMenu() {
  const elements = {
    menuToggle: document.querySelector('.menu-toggle'),
    offCanvasMenu: document.querySelector('.off-canvas-menu'),
    menu: document.querySelector('.menu'),
    ctaMain: document.querySelector('.cta_main'),
    menuClose: document.querySelector('.menu-close'),
    header: document.querySelector('.header'),
    headerNav: document.querySelector('.header_navigations_links')
  };

  const moveMenuAndCta = () => {
    const isMobile = window.innerWidth <= 768;
    const target = isMobile ? elements.offCanvasMenu : elements.headerNav;
    if (!target.contains(elements.menu)) target.appendChild(elements.menu);
    if (!target.contains(elements.ctaMain)) target.appendChild(elements.ctaMain);
  };

  const toggleMenu = (open) => {
    elements.offCanvasMenu.classList.toggle('active', open);
    elements.header.classList.toggle('menu-active', open);
  };

  window.addEventListener('resize', debounce(moveMenuAndCta, 100));
  moveMenuAndCta();

  elements.menuToggle.addEventListener('click', () => toggleMenu(true));
  elements.menuClose.addEventListener('click', () => toggleMenu(false));
  elements.offCanvasMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('header_nav_links')) toggleMenu(false);
  });
  document.addEventListener('click', (e) => {
    if (!elements.offCanvasMenu.contains(e.target) && !elements.menuToggle.contains(e.target)) toggleMenu(false);
  });
}

document.addEventListener('DOMContentLoaded', offcanvasMenu);

// Particle Effects
function particlesMainFn() {
  const home = document.getElementById('Home');
  if (!home || !window.particlesJS) return;

  const particleCount = window.innerWidth < 768 ? 40 : 80;
  particlesJS('Home', {
    particles: {
      number: { value: particleCount, density: { enable: true, value_area: 800 } },
      color: { value: '#fff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#fff', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'body',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } }
    },
    retina_detect: true
  });
}

particlesMainFn();

// Scroll Animations
gsap.registerPlugin(ScrollTrigger);
gsap.to('.header', {
  scrollTrigger: {
    trigger: '.site_top--area',
    start: '40% 20%',
    end: 'bottom bottom',
    scrub: true,
    onEnter: () => document.querySelector('.header').classList.add('scrolled'),
    onLeaveBack: () => document.querySelector('.header').classList.remove('scrolled')
  },
  backgroundColor: '#00000030',
  backdropFilter: 'blur(30px)',
  width: () => window.innerWidth <= 1024 ? '90%' : '60%',
  y: '20px',
  borderRadius: '50px',
  ease: 'none'
});

// Header Active Effect
function headerActiveEffect() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.has_active--effect');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`.has_active--effect[href="#${entry.target.id}"]`);
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('isActive'));
        if (link) link.classList.add('isActive');
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(section => observer.observe(section));
  navLinks.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        navLinks.forEach(l => l.classList.remove('isActive'));
        anchor.classList.add('isActive');
      }
    });
  });
}

headerActiveEffect();
window.onload = function () {

  document.querySelectorAll('.right-box').forEach(function (box) {
    gsap.to(box, {
      color: '#fff',
      opacity: 1,
      duration: 0.3,
      scrollTrigger: {
        trigger: box,
        start: '0% 78%',
        end: '100% 78%',
        markers: false,
        scrub: true
      }
    })
  })

}

// Speed Control
function speedCtrl() {
  const sections = document.querySelectorAll('.has_scroll--speed__section');
  let ticking = false, viewportHeight = window.innerHeight;

  const updateScrollEffects = () => {
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isInView = rect.top <= viewportHeight && rect.bottom >= 0;
      section.classList.toggle('is_view', isInView);

      if (isInView && !(window.innerWidth <= (parseInt(section.getAttribute('data-disable-scroll-animation')) || Infinity))) {
        const relativeScroll = rect.top - viewportHeight;
        section.querySelectorAll('.has_scroll--speed__element').forEach(el => {
          const scrollSpeed = parseFloat(el.getAttribute('data-scroll-speed')) || 1;
          el.style.transform = `translateY(${Math.round(relativeScroll / scrollSpeed)}px)`;
        });
      }
    });
    ticking = false;
  };

  const onScroll = () => !ticking && (ticking = true, requestAnimationFrame(updateScrollEffects));
  const onResize = () => { viewportHeight = window.innerHeight; updateScrollEffects(); };

  window.addEventListener('scroll', throttle(onScroll, 16), { passive: true });
  window.addEventListener('resize', debounce(onResize, 100));
}

speedCtrl();

// Form Validation
function formValidationHandler() {
  const form = document.querySelector('.site_form--container');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelectorAll('.error-msg').forEach(msg => msg.remove());

    let isValid = true;
    const fields = [
      { id: 'name', message: 'Please enter your name.' },
      { id: 'phone', message: 'Please enter a valid phone number.', regex: /^\+?\d{7,}$/ },
      { id: 'email', message: 'Please enter a valid email address.', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'company', message: 'Please enter a company name.' }
    ];

    fields.forEach(({ id, message, regex }) => {
      const field = document.getElementById(id);
      if (!field || !field.value.trim() || (regex && !regex.test(field.value.trim()))) {
        isValid = false;
        showError(field, message);
      }
    });

    ['service', 'budget'].forEach(name => {
      if (!document.querySelector(`input[name="${name}"]:checked`)) {
        isValid = false;
        showError(document.querySelector(`input[name="${name}"]`), `Please select a ${name}.`);
      }
    });

    if (isValid) form.submit();
  });

  const showError = (input, message) => {
    if (!input) return;
    const error = document.createElement('div');
    error.className = 'error-msg';
    error.style.cssText = 'display: flex; align-items: center; gap: 5px; color: red; font-size: 0.75rem;';
    error.innerHTML = '<span>⚠️</span>' + message;
    input.parentElement.appendChild(error);
  };

  const phone = document.getElementById('phone');
  phone?.addEventListener('input', () => phone.value = phone.value.replace(/\D/g, ''));
}

formValidationHandler();

// Magnetic Effect
function magneticEffect() {
  document.querySelectorAll('.has_magnatic--effect').forEach(button => {
    const move = throttle((e) => {
      const rect = button.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
      button.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
      button.classList.add('is_magnatic--effect');
    }, 16);

    button.addEventListener('mousemove', move, { passive: true });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0) scale(1)';
      button.classList.remove('is_magnatic--effect');
    });
  });
}

magneticEffect();

// Velocity Slider
function velocitySlider() {
  const sliders = document.querySelectorAll(".siteVelocity__slider");
  sliders.forEach(slider => {
    let images = Array.from(slider.children), imgWidth, totalWidth;
    let position = 0, extraSpeed = 0, direction = 1, baseSpeed = 0.5;

    const updateWidths = () => {
      imgWidth = images[0].offsetWidth + 20;
      totalWidth = imgWidth * images.length;
    };

    updateWidths();
    while (slider.scrollWidth < window.innerWidth * 2) {
      images.forEach(img => slider.appendChild(img.cloneNode(true)));
      images = Array.from(slider.children);
      updateWidths();
    }

    const animate = () => {
      const speed = (baseSpeed + extraSpeed) * direction;
      position = (position + speed) % totalWidth;
      slider.style.transform = `translateX(${-position}px)`;
      extraSpeed *= 0.95;
      requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", throttle((event) => {
      direction = event.deltaY > 0 ? -1 : 1;
      extraSpeed = Math.min(extraSpeed + Math.abs(event.deltaY) * 0.02, 12);
    }, 50), { passive: true });

    window.addEventListener("resize", debounce(() => {
      updateWidths();
      position %= totalWidth;
    }, 100));

    slider.style.willChange = "transform";
    animate();
  });
}

velocitySlider();

// Utility Functions
function throttle(fn, wait) {
  let lastTime = 0;
  return (...args) => {
    const now = performance.now();
    if (now - lastTime >= wait) {
      fn(...args);
      lastTime = now;
    }
  };
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
gsap.to("#projects", {
    "--scale": 1,
    scrollTrigger: {
        trigger: "#projects",
        start: "top 2%",
        end: "bottom 80%",
        scrub: true,
        markers: false,
       
    }
});