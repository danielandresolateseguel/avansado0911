// Aplica variables de tema para páginas de gastronomía usando data-theme
// Lee config/gastronomia.json -> themes[theme].palette y setea CSS variables

(function () {
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  function rgbaString({ r, g, b }, alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async function applyTheme() {
    const body = document.body;
    const page = body.dataset.page;
    const theme = body.dataset.theme;
    const slug = (window.BUSINESS_SLUG || (body.dataset && body.dataset.slug) || 'gastronomia');

    if (page !== 'gastronomia' || !theme) return;

    try {
      const res = await fetch(`config/${slug}.json`, { cache: 'no-store' });
      const cfg = await res.json();
      const themeCfg = cfg.themes && cfg.themes[theme];
      if (!themeCfg || !themeCfg.palette) return;

      const p = themeCfg.palette;
      const accentRgb = hexToRgb(p.accent);

      body.style.setProperty('--gastro-accent', p.accent);
      body.style.setProperty('--gastro-accent-dark', p.accentDark || p.accent);
      body.style.setProperty('--gastro-chip-bg', p.chipBg);
      body.style.setProperty('--gastro-chip-hover-bg', p.chipHoverBg || p.chipBg);
      body.style.setProperty('--gastro-chip-text', p.chipText || '#111111');
      body.style.setProperty('--gastro-surface-card', p.surfaceCard || '#ffffff');

      // Derivados del acento con alpha, usados en bordes y sombras
      const alphas = [0.08, 0.18, 0.22, 0.25, 0.28, 0.35, 0.42, 0.55, 0.85];
      for (const a of alphas) {
        body.style.setProperty(`--gastro-accent-${String(a).replace('.', '')}`, rgbaString(accentRgb, a));
      }

      // Fondos y gradientes por sección (opcionales). Si existen en config, se aplican.
      const bg = themeCfg.backgrounds || {};
      const map = {
        page: '--gastro-page-bg',
        specialDiscounts: '--gastro-special-discounts-bg',
        productsSection: '--gastro-products-bg',
        interestSection: '--gastro-interest-bg',
        carousel: '--gastro-carousel-bg',
        cartHeader: '--gastro-cart-header-bg',
        floatingCart: '--gastro-floating-cart-bg',
        restaurantInfo: '--gastro-restaurant-bg',
        footer: '--gastro-footer-bg'
      };
      for (const key in map) {
        if (Object.prototype.hasOwnProperty.call(bg, key) && bg[key]) {
          body.style.setProperty(map[key], bg[key]);
        }
      }

      body.setAttribute('data-theme-loaded', 'true');
    } catch (e) {
      // Silencioso para no romper la UI si falla
      console.warn('theme-loader: no se pudo aplicar tema', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTheme);
  } else {
    applyTheme();
  }
})();