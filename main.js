/* ═══════════════════════════════════
   AGORALAB · main.js v3.0 (shared)
═══════════════════════════════════ */

/* ── Navbar: transparent → glass on scroll + auto-hide ── */
const navbar = document.querySelector('.navbar');
if (navbar) {
  // On inner pages (no .hero), always show glass navbar
  const hasHero = !!document.querySelector('.hero');
  if (!hasHero) navbar.classList.add('scrolled');

  let lastY = window.scrollY, ticking = false;

  function updateNav() {
    const y = window.scrollY;
    // Glass effect once past 60px (or always if no hero)
    if (hasHero) navbar.classList.toggle('scrolled', y > 60);

    // Auto-hide / show on scroll direction (only once past 120px)
    if (y > 120) {
      if (y > lastY + 5) navbar.classList.add('nav-hidden');
      else if (y < lastY - 5) navbar.classList.remove('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastY = y; ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });
  updateNav();
}

/* ── Active nav link ── */
(function markActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.dataset.page === page || (page === '' && el.dataset.page === 'index.html')) {
      el.classList.add('active');
    }
  });
})();

/* ── Mobile nav drawer ── */
const toggle  = document.querySelector('.nav-toggle');
const drawer  = document.querySelector('.nav-drawer');

if (toggle && drawer) {
  toggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    // Keep navbar visible and opaque while drawer is open
    if (navbar) navbar.classList.toggle('drawer-open', open);
  });

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
      if (navbar) navbar.classList.remove('drawer-open');
    });
  });
}

/* ── Scroll animations (safe: content always visible if JS fails) ── */
(function() {
  const els = document.querySelectorAll('.animate');
  if (!els.length) return;
  // Only hide elements AFTER JS is confirmed running
  document.body.classList.add('anim-ready');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => {
    // Elements already in viewport on load: show immediately
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) { el.classList.add('visible'); }
    else { io.observe(el); }
  });
})();

/* ── Accordion ── */
document.querySelectorAll('.acc-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const acc = btn.closest('.accordion');
    const open = acc.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
});

/* ── Package sliders (mobile) ── */
document.querySelectorAll('[data-slider]').forEach(wrap => {
  const track  = wrap.querySelector('.pkg-track');
  const dotsEl = wrap.querySelector('.sl-dots');
  const prev   = wrap.querySelector('.sl-btn.prev');
  const next   = wrap.querySelector('.sl-btn.next');
  if (!track) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let cur = 0;
  let desk = window.innerWidth >= 768;

  if (dotsEl && total > 1) {
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'sl-dot' + (i === 0 ? ' on' : '');
      d.setAttribute('aria-label', `Paquete ${i + 1}`);
      d.addEventListener('click', () => go(i));
      dotsEl.appendChild(d);
    });
  }

  function dots() { return dotsEl ? Array.from(dotsEl.querySelectorAll('.sl-dot')) : []; }

  function go(i) {
    if (desk) return;
    cur = ((i % total) + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots().forEach((d, j) => d.classList.toggle('on', j === cur));
  }

  if (prev) prev.addEventListener('click', e => { e.stopPropagation(); go(cur - 1); });
  if (next) next.addEventListener('click', e => { e.stopPropagation(); go(cur + 1); });

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (desk) return;
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) go(cur + (d > 0 ? 1 : -1));
  });

  new ResizeObserver(() => {
    desk = window.innerWidth >= 768;
    if (desk) track.style.transform = '';
  }).observe(document.body);
});

/* ── Gallery collapsible ── */
document.querySelectorAll('.gallery.collapsible').forEach(g => {
  const lim  = parseInt(g.dataset.limit) || 4;
  const imgs = Array.from(g.querySelectorAll('img'));
  const btn  = g.parentElement.querySelector('.tog-btn');
  let exp = false;

  function render() {
    imgs.forEach((img, i) => img.classList.toggle('show', exp || i < lim));
    if (btn) {
      const ch = btn.querySelector('.chevron');
      btn.classList.toggle('expanded', exp);
      btn.firstChild.textContent = exp ? 'Ver menos ' : 'Ver más ';
      if (ch) ch.style.transform = exp ? 'rotate(180deg)' : '';
    }
  }

  if (imgs.length <= lim) {
    imgs.forEach(img => img.classList.add('show'));
    if (btn) btn.style.display = 'none';
    return;
  }

  if (btn) btn.addEventListener('click', () => { exp = !exp; render(); });
  render();
});

/* ── Lightbox ── */
const lb      = document.getElementById('lightbox');
const lbImg   = document.getElementById('lb-img');
const lbCtr   = document.getElementById('lb-ctr');
const lbClose = document.getElementById('lb-close');
const lbPrev  = document.getElementById('lb-prev');
const lbNext  = document.getElementById('lb-next');

let lbArr = [], lbI = 0;

function openLB(arr, i) {
  lbArr = arr; lbI = i;
  showLB();
  lb.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  lb.setAttribute('hidden', '');
  document.body.style.overflow = '';
}
function showLB() {
  lbImg.src = lbArr[lbI].src;
  lbImg.alt = lbArr[lbI].alt;
  if (lbCtr) lbCtr.textContent = `${lbI + 1} / ${lbArr.length}`;
}
function stepLB(d) { lbI = ((lbI + d) % lbArr.length + lbArr.length) % lbArr.length; showLB(); }

if (lb) {
  if (lbClose) lbClose.addEventListener('click', closeLB);
  if (lbPrev)  lbPrev.addEventListener('click', e => { e.stopPropagation(); stepLB(-1); });
  if (lbNext)  lbNext.addEventListener('click', e => { e.stopPropagation(); stepLB(1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });

  let ltx = 0;
  lb.addEventListener('touchstart', e => { ltx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const d = ltx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) stepLB(d > 0 ? 1 : -1); });
}

document.addEventListener('keydown', e => {
  if (!lb || lb.hasAttribute('hidden')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') stepLB(-1);
  if (e.key === 'ArrowRight') stepLB(1);
});

document.querySelectorAll('.gallery').forEach(g => {
  const imgs = Array.from(g.querySelectorAll('img'));
  imgs.forEach((img, i) => img.addEventListener('click', () => openLB(imgs, i)));
});

/* ── Formspree AJAX ── */
const form    = document.getElementById('contact-form');
const formOk  = document.getElementById('form-ok');
const formErr = document.getElementById('form-err');
const subBtn  = document.getElementById('sub-btn');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (formOk)  formOk.hidden  = true;
    if (formErr) formErr.hidden = true;
    subBtn.disabled = true;
    subBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) { form.reset(); if (formOk) formOk.hidden = false; }
      else throw new Error();
    } catch { if (formErr) formErr.hidden = false; }
    finally {
      subBtn.disabled = false;
      subBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar mensaje';
    }
  });
}

/* ── Footer year ── */
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();
