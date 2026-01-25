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
