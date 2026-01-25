// Gestión de galerías colapsables con límite de imágenes y botón Ver más
document.querySelectorAll('.gallery.collapsible').forEach(gallery => {
  const limit = parseInt(gallery.dataset.limit);
  const images = [...gallery.querySelectorAll('img')];
  const button = gallery.parentElement.querySelector('.toggle-btn');
  const project = gallery.closest('.project');

  if (images.length <= limit) {
    if (button) button.style.display = 'none';
    images.forEach(img => img.classList.add('visible'));
    return;
  }

  let expanded = false;

  const render = () => {
    images.forEach((img, i) => {
      img.classList.toggle('visible', expanded || i < limit);
    });
    if (button) button.textContent = expanded ? 'Ver menos' : 'Ver más';
  };

  if (button) {
    button.addEventListener('click', () => {
      expanded = !expanded;
      render();
      if (!expanded && project) {
        project.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  render();
});

// Animaciones de aparición con IntersectionObserver
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.animate').forEach(el => observer.observe(el));

// Lightbox de imágenes
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const prevBtn = document.querySelector('.lightbox-arrow.prev');
const nextBtn = document.querySelector('.lightbox-arrow.next');

let currentImages = [];
let currentIndex = 0;

document.querySelectorAll('.gallery').forEach(gallery => {
  const imgs = [...gallery.querySelectorAll('img')];
  imgs.forEach((img, index) => {
    img.addEventListener('click', () => {
      currentImages = imgs;
      currentIndex = index;
      openLightbox();
    });
  });
});

function openLightbox() {
  lightboxImg.src = currentImages[currentIndex].src;
  lightbox.classList.add('active');
}
function closeLightbox() {
  lightbox.classList.remove('active');
}
prevBtn.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  openLightbox();
});
nextBtn.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % currentImages.length;
  openLightbox();
});
lightbox.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevBtn.click();
  if (e.key === 'ArrowRight') nextBtn.click();
});

// Menú responsive
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

// Categorías de paquetes
document.querySelectorAll('.category-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.closest('.category');
    const expanded = category.classList.toggle('open');
    btn.setAttribute('aria-expanded', expanded);
  });
});

// Descripción de proyectos
document.querySelectorAll('.project-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const project = btn.closest('.project');
    const expanded = project.classList.toggle('show-details');
    btn.setAttribute('aria-expanded', expanded);
  });
});

// Carruseles con desplazamiento y arrastre
document.querySelectorAll('.package-slider').forEach(slider => {
  const container = slider.querySelector('.packages');
  const prev = slider.querySelector('.packages-arrow.prev');
  const next = slider.querySelector('.packages-arrow.next');
  let index = 0;
  const total = container ? container.children.length : 0;

  function update() {
    if (!container) return;
    const card = container.children[0];
    if (!card) return;
    const style = window.getComputedStyle(card);
    const marginRight = parseFloat(style.marginRight) || 0;
    const cardWidth = card.offsetWidth + marginRight;
    container.style.transform = `translateX(-${index * cardWidth}px)`;
  }

  if (prev && next && container) {
    prev.addEventListener('click', e => {
      e.stopPropagation();
      index = (index - 1 + total) % total;
      update();
    });
    next.addEventListener('click', e => {
      e.stopPropagation();
      index = (index + 1) % total;
      update();
    });

    let startX = 0;
    let dragging = false;
    const onPointerDown = x => {
      dragging = true;
      startX = x;
    };
    const onPointerMove = x => {
      if (!dragging) return;
      const diff = x - startX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          prev.click();
        } else {
          next.click();
        }
        dragging = false;
      }
    };
    const onPointerUp = () => {
      dragging = false;
    };
    slider.addEventListener('mousedown', e => onPointerDown(e.clientX));
    slider.addEventListener('mousemove', e => onPointerMove(e.clientX));
    window.addEventListener('mouseup', onPointerUp);
    slider.addEventListener('touchstart', e => onPointerDown(e.touches[0].clientX));
    slider.addEventListener('touchmove', e => onPointerMove(e.touches[0].clientX));
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('resize', update);
  }
  update();
});

// Navbar: oculta al bajar y aparece al subir
const navbar = document.querySelector('.navbar');
let previousScroll = window.pageYOffset || document.documentElement.scrollTop;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > previousScroll && currentScroll > 100) {
    navbar.classList.add('hidden');
  } else if (currentScroll < previousScroll) {
    navbar.classList.remove('hidden');
  }
  previousScroll = currentScroll;
});

// Animación del hero: bloquea el scroll inicial y usa el desplazamiento del ratón/touch para revelar gradualmente el contenido
(() => {
  const hero = document.querySelector('.hero');
  const heroOverlay = document.querySelector('.hero-overlay');
  const heroText = document.querySelector('.hero-text');
  if (!hero || !heroOverlay || !heroText) return;
  const heroTextElements = Array.from(heroText.children);
  let heroProgress = 0;
  let lastTouchY = null;
  // Umbral a partir del cual se desbloquea el scroll (80 % de la animación).
  const finalThreshold = 0.8;
  // Bloquear el scroll de la página hasta que se haya completado la animación del hero
  document.body.style.overflowY = 'hidden';
  function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
  }
  function updateHeroProgress() {
    // Normaliza el progreso respecto al umbral final, de manera que 1 represente el estado final.
    const normalized = clamp(heroProgress / finalThreshold, 0, 1);
    // Ajusta la opacidad del overlay linealmente hasta el 50 %.
    heroOverlay.style.opacity = (normalized * 0.5).toString();
    // Muestra cada elemento de texto de manera escalonada.
    heroTextElements.forEach((el, idx) => {
      // El inicio y final de cada elemento se separan por 0.2 de progreso normalizado.
      const start = idx * 0.2;
      const end = start + 0.3;
      let elProgress;
      if (normalized <= start) {
        elProgress = 0;
      } else if (normalized >= end) {
        elProgress = 1;
      } else {
        elProgress = (normalized - start) / (end - start);
      }
      // Opacidad y posición de cada elemento.
      el.style.opacity = elProgress;
      const translateY = (1 - elProgress) * 60;
      el.style.transform = `translateY(${translateY}px)`;
    });
  }
  function finalizeHero() {
    // Asegura que todos los elementos sean visibles y fija la opacidad del overlay al 50 %.
    heroOverlay.style.opacity = '0.5';
    heroTextElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    // Quita los listeners y restaura el scroll.
    document.removeEventListener('wheel', handleWheel, { passive: false });
    document.removeEventListener('touchstart', handleTouchStart, { passive: false });
    document.removeEventListener('touchmove', handleTouchMove, { passive: false });
    document.removeEventListener('touchend', handleTouchEnd, { passive: false });
    document.body.style.overflowY = '';
  }
  function handleWheel(e) {
    e.preventDefault();
    const heroHeight = hero.offsetHeight || window.innerHeight;
    heroProgress += e.deltaY / (heroHeight * 1.5);
    if (heroProgress >= finalThreshold) {
      heroProgress = finalThreshold;
      updateHeroProgress();
      finalizeHero();
    } else {
      heroProgress = clamp(heroProgress, 0, finalThreshold);
      updateHeroProgress();
    }
  }
  function handleTouchStart(e) {
    if (e.touches && e.touches.length === 1) {
      lastTouchY = e.touches[0].clientY;
    }
  }
  function handleTouchMove(e) {
    if (lastTouchY === null) return;
    const currentY = e.touches[0].clientY;
    const delta = lastTouchY - currentY;
    const heroHeight = hero.offsetHeight || window.innerHeight;
    heroProgress += delta / (heroHeight * 1.5);
    lastTouchY = currentY;
    if (heroProgress >= finalThreshold) {
      heroProgress = finalThreshold;
      updateHeroProgress();
      finalizeHero();
    } else {
      heroProgress = clamp(heroProgress, 0, finalThreshold);
      updateHeroProgress();
    }
    e.preventDefault();
  }
  function handleTouchEnd() {
    lastTouchY = null;
  }
  // Listeners para interceptar el desplazamiento.
  document.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  // Inicializa el estado de la animación.
  updateHeroProgress();
})();
