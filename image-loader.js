// Script para optimización de imágenes
document.addEventListener('DOMContentLoaded', function() {
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

    // Función para manejar errores de carga de imágenes
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

    // Función para aplicar srcset a imágenes responsivas
    function setupResponsiveImages() {
        const productImages = document.querySelectorAll('.product-image img');
        
        productImages.forEach(img => {
            // Obtener la ruta base de la imagen
            const src = img.getAttribute('src');
            if (!src.includes('placeholder')) {
                // No modificar imágenes de respaldo
                img.setAttribute('srcset', src);
            }
        });
    }

    // Aumentar prioridad de imágenes cercanas al fold
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

    // Inicializar funciones
    setupIntersectionObserver();
    boostAboveFoldPriorities();
    handleImageError();
    setupResponsiveImages();

    // Asegurar que la imagen de modal no se demore
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
});