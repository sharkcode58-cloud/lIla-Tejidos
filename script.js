/* ============================================================
   LILA TEJIDOS — script.js
   Canvas hero · Flip cards · Galería filtros · Scroll reveal
   Contador animado · Navbar sticky · Smooth scroll · Mobile menu
   ============================================================ */

'use strict';

// ══════════════════════════════════════
// 1. CANVAS HERO ANIMATION — 200 frames a 24fps
// ══════════════════════════════════════
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const TOTAL_FRAMES = 200;
  const FPS = 24;
  const FRAME_INTERVAL = 1000 / FPS;

  const frameImages = [];
  let currentFrame = 0;
  let loadedCount = 0;
  let animationStarted = false;
  let lastTime = 0;
  let animFrameId = null;
  let lastWidth = window.innerWidth;

  // Adaptar canvas al tamaño de ventana
  function resizeCanvas() {
    // Evitar destellos en mobile al scrollear (la barra de direcciones cambia el height y disparaba el resize)
    if (window.innerWidth <= 768 && window.innerWidth === lastWidth && canvas.width !== 0) {
      return; 
    }
    lastWidth = window.innerWidth;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Dibujar el frame con soporte para opacidad (crossfade)
  function drawFrame(index, alpha = 1) {
    const img = frameImages[index];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.globalAlpha = alpha;
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    }
  }

  // Loop de animación con rAF + throttle + Crossfade suave al final
  function animate(timestamp) {
    animFrameId = requestAnimationFrame(animate);
    if (timestamp - lastTime < FRAME_INTERVAL) return;
    lastTime = timestamp;

    const FADE_WINDOW = 20; // Cantidad de frames para la transición suave

    // Limpiamos opacidad previa
    ctx.globalAlpha = 1;

    // Dibujo normal
    drawFrame(currentFrame);

    // Si estamos llegando al final, superponemos el primer frame suavemente
    if (currentFrame > TOTAL_FRAMES - FADE_WINDOW) {
      const alpha = (currentFrame - (TOTAL_FRAMES - FADE_WINDOW)) / FADE_WINDOW;
      drawFrame(0, alpha);
    }

    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
  }

  // Precargar todos los frames
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const num = String(i).padStart(3, '0');
    img.src = `frents animaciones/ezgif-frame-${num}.jpg`;

    img.onload = function () {
      loadedCount++;
      // Arrancar tan pronto como el primer frame esté listo
      if (loadedCount === 1 && !animationStarted) {
        animationStarted = true;
        requestAnimationFrame(animate);
      }
    };

    img.onerror = function () {
      loadedCount++; // contar aunque falle para no bloquear
    };

    frameImages.push(img);
  }
})();


// ══════════════════════════════════════
// 2. NAVBAR — sticky + blur al scroll
// ══════════════════════════════════════
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


// ══════════════════════════════════════
// 3. MENÚ HAMBURGUESA (mobile)
// ══════════════════════════════════════
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar al hacer clic en un link del menú mobile
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


// ══════════════════════════════════════
// 4. SMOOTH SCROLL para links internos
// ══════════════════════════════════════
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


// ══════════════════════════════════════
// 5. SCROLL REVEAL — stagger en cards
// ══════════════════════════════════════
(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger: 100ms entre cada elemento del mismo lote
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


// ══════════════════════════════════════
// 6. CONTADOR ANIMADO — trust bar
// ══════════════════════════════════════
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
})();


// ══════════════════════════════════════
// 7. FLIP CARDS — tap en mobile
// ══════════════════════════════════════
(function initFlipCards() {
  const cards = document.querySelectorAll('.product-card-flip:not(.product-card-special)');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (window.innerWidth <= 767) {
        card.classList.toggle('tapped');
      }
    });
  });
})();


// ══════════════════════════════════════
// 8. GALERÍA — filtros por categoría
// ══════════════════════════════════════
(function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar botón activo
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        // Animación suave de visibilidad
        if (show) {
          item.style.display = 'block';
          requestAnimationFrame(() => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            requestAnimationFrame(() => {
              item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => { item.style.display = 'none'; }, 350);
        }
      });
    });
  });
})();


// ══════════════════════════════════════
// 9. TOAST de confirmación en botones CTA de carrito
// ══════════════════════════════════════
(function initCartButtons() {
  const cartIds = ['cart-muneca', 'cart-garfield', 'cart-oso', 'cart-fresa', 'cart-bolsa', 'btn-encargo-card'];
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;

  function showToast(msg) {
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  cartIds.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // no activar flip en mobile
      showToast('💕 ¡Haz tu encargo por WhatsApp!');
      setTimeout(() => {
        document.getElementById('encargos')?.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    });
  });
})();


// ══════════════════════════════════════
// 10. GALERÍA — Lightbox simple al clic
// ══════════════════════════════════════
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Crear overlay de lightbox dinámicamente
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.style.cssText = `
    display:none;
    position:fixed;
    inset:0;
    background:rgba(45,21,21,0.92);
    z-index:9990;
    align-items:center;
    justify-content:center;
    cursor:zoom-out;
    backdrop-filter:blur(8px);
  `;

  const lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width:90vw;
    max-height:85vh;
    border-radius:16px;
    box-shadow:0 24px 80px rgba(0,0,0,0.5);
    object-fit:contain;
    animation:fadeInUp 0.3s ease;
    cursor:default;
  `;

  const lightboxClose = document.createElement('button');
  lightboxClose.innerHTML = '✕';
  lightboxClose.style.cssText = `
    position:fixed;
    top:24px;
    right:32px;
    background:rgba(255,255,255,0.15);
    border:2px solid rgba(255,255,255,0.3);
    color:white;
    width:44px;
    height:44px;
    border-radius:50%;
    font-size:20px;
    cursor:pointer;
    transition:all 0.2s;
    z-index:9991;
  `;

  overlay.appendChild(lightboxImg);
  overlay.appendChild(lightboxClose);
  document.body.appendChild(overlay);

  function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src);
    });
  });

  overlay.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();


// ══════════════════════════════════════
// 11. PARALLAX suave en el hero overlay
// ══════════════════════════════════════
(function initParallax() {
  const heroOverlay = document.querySelector('.hero-overlay');
  if (!heroOverlay) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroHeight = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
    if (scrolled > heroHeight) return;
    const opacity = Math.min(0.22 + (scrolled / heroHeight) * 0.35, 0.80);
    heroOverlay.style.background = `rgba(253, 250, 245, ${opacity})`;
  }, { passive: true });
})();


// ══════════════════════════════════════
// 12. HOVER en step cards con partículas
// ══════════════════════════════════════
(function initStepHover() {
  const steps = document.querySelectorAll('.step');
  steps.forEach(step => {
    step.addEventListener('mouseenter', () => {
      const icon = step.querySelector('.step-icon');
      if (icon) icon.style.animation = 'float 1.5s ease-in-out infinite';
    });
    step.addEventListener('mouseleave', () => {
      const icon = step.querySelector('.step-icon');
      if (icon) icon.style.animation = 'float 4s ease-in-out infinite';
    });
  });
})();


// ══════════════════════════════════════
// 13. ACTIVE nav link al scroll
// ══════════════════════════════════════
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id], div[id="galeria"]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
})();

// ── Fin de script.js ──────────────────────────────────────····
