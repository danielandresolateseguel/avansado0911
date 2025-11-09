// Módulo unificado de optimización y lazy-loading de imágenes
document.addEventListener('DOMContentLoaded', function() {
  // Ajustes base para imágenes de productos
  function setupProductImagesDefaults() {
    const productImages = document.querySelectorAll('.product-image img');
    productImages.forEach(img => {
      try {
        img.decoding = 'async';
        // Por defecto baja prioridad; se elevará cerca del fold
        img.setAttribute('fetchpriority', 'low');
        const src = img.getAttribute('src');
        if (src && !src.includes('placeholder')) {
          img.setAttribute('srcset', src);
        }
      } catch (e) {
        // silencioso
      }
    });
  }

  // IntersectionObserver para marcar imágenes como cargadas al entrar en el viewport
  function setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (!img.dataset.loaded) {
              img.dataset.loaded = true;
              img.classList.add('loaded');
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '600px 0px', threshold: 0.01 });

      document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));
    } else {
      // Fallback: verificar en scroll/resize para navegadores sin IO
      function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
      }
      function lazyLoadFallback() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
          if (isInViewport(img) && !img.dataset.loaded) {
            img.dataset.loaded = true;
            img.classList.add('loaded');
          }
        });
      }
      window.addEventListener('scroll', lazyLoadFallback);
      window.addEventListener('resize', lazyLoadFallback);
      lazyLoadFallback();
    }
  }

  // Manejo de errores de carga de imágenes
  function handleImageError() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.onerror = function() {
        // Reemplazar con imagen local de respaldo si falla la carga
        this.src = 'Imagenes/asus-proart-p16.png';
        this.alt = 'Imagen no disponible';
      };
    });
  }

  // Priorizar imágenes cercanas al fold
  function boostAboveFoldPriorities() {
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const margin = 150; // adelanta un poco la descarga
    const candidates = document.querySelectorAll('.product-image img');
    candidates.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < viewportH + margin) {
        img.setAttribute('fetchpriority', 'high');
      }
    });
  }

  // Ajustar prioridades del carrusel
  function adjustCarouselImagePriorities() {
    const carouselImages = document.querySelectorAll('.carousel-slides .carousel-slide img');
    if (!carouselImages.length) return;
    carouselImages.forEach((img, idx) => {
      try {
        img.decoding = 'async';
        if (idx === 0) {
          img.setAttribute('loading', 'eager');
          img.setAttribute('fetchpriority', 'high');
        } else {
          img.setAttribute('loading', 'lazy');
          img.setAttribute('fetchpriority', 'low');
        }
      } catch (e) {
        // silencioso
      }
    });
  }

  // Asegurar que la imagen de modal no se demore
  function prioritizeModalImage() {
    const modalImage = document.getElementById('modal-product-image');
    if (modalImage) {
      try {
        modalImage.decoding = 'async';
        modalImage.setAttribute('loading', 'eager');
        modalImage.setAttribute('fetchpriority', 'high');
      } catch (e) {
        // silencioso
      }
    }
  }

  // Inicialización
  setupProductImagesDefaults();
  adjustCarouselImagePriorities();
  setupIntersectionObserver();
  boostAboveFoldPriorities();
  handleImageError();
  prioritizeModalImage();
});