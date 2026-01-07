document.querySelectorAll('.gallery.collapsible').forEach(gallery => {
  const limit = parseInt(gallery.dataset.limit);
  const images = [...gallery.querySelectorAll('img')];
  const button = gallery.parentElement.querySelector('.toggle-btn');

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
    button.textContent = expanded ? 'Ver menos' : 'Ver más';
  };

  button.addEventListener('click', () => {
    expanded = !expanded;
    render();
  });

  render();
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.animate').forEach(el => observer.observe(el));

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
