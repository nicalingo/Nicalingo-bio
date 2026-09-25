/**
 * NicaLingo by Sinskira — Multi-Link Application
 * Animaciones generativas en Canvas (ondas y partículas étnicas),
 * generador dinámico de banderines en SVG, filtrado y Web Share.
 */

document.addEventListener('DOMContentLoaded', () => {
  initEthnicCanvas();
  renderPennants();
  initCurrentYear();
  initThemeToggle();
  initFilterTabs();
  initShareAction();
});

/**
 * 1. Generador de banderines geométricos multicolor (SVG inline dinámico)
 */
function renderPennants() {
  const topBar = document.getElementById('pennantsTop');
  const bottomBar = document.getElementById('pennantsBottom');

  // Paleta extraída de la imagen de referencia
  const colors = ['#f5b732', '#ea580c', '#dc2626', '#06b6d4', '#2563eb'];
  const count = Math.ceil(window.innerWidth / 22) + 2;

  function buildPennantsHTML(isTop) {
    let html = '';
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const delay = (i * 0.12).toFixed(2);
      // Triángulo hacia abajo si es top, hacia arriba si es bottom
      const points = isTop ? '0,0 26,0 13,28' : '0,28 26,28 13,0';

      html += `
        <svg class="pennant-triangle" viewBox="0 0 26 28" style="animation-delay: -${delay}s;">
          <polygon points="${points}" fill="${color}" />
        </svg>
      `;
    }
    return html;
  }

  if (topBar) topBar.innerHTML = buildPennantsHTML(true);
  if (bottomBar) bottomBar.innerHTML = buildPennantsHTML(false);

  window.addEventListener('resize', () => {
    if (topBar) topBar.innerHTML = buildPennantsHTML(true);
    if (bottomBar) bottomBar.innerHTML = buildPennantsHTML(false);
  });
}

/**
 * 2. Canvas étnico: Ondas sinusoidales continuas y cúmulos de partículas orgánicas
 */
function initEthnicCanvas() {
  const canvas = document.getElementById('ethnicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let animationFrameId;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Configuración de ondas (líneas doradas y celestes de la referencia)
  const waves = [
    { yRatio: 0.28, amplitude: 14, wavelength: 0.0035, speed: 0.012, color: 'rgba(245, 183, 50, 0.28)', width: 1.5 },
    { yRatio: 0.72, amplitude: 18, wavelength: 0.0028, speed: -0.010, color: 'rgba(6, 182, 212, 0.22)', width: 1.5 }
  ];

  // Grupos de partículas que flotan de fondo (cúmulos oscuros/azules)
  const clusters = [
    { cxRatio: 0.18, cyRatio: 0.22, count: 18, radius: 45 },
    { cxRatio: 0.82, cyRatio: 0.18, count: 15, radius: 40 },
    { cxRatio: 0.80, cyRatio: 0.85, count: 20, radius: 55 }
  ];

  const particles = [];
  clusters.forEach(c => {
    for (let i = 0; i < c.count; i++) {
      particles.push({
        baseXRatio: c.cxRatio,
        baseYRatio: c.cyRatio,
        offsetX: (Math.random() - 0.5) * c.radius * 2,
        offsetY: (Math.random() - 0.5) * c.radius * 2,
        size: Math.random() * 5 + 3.5,
        alpha: Math.random() * 0.15 + 0.06,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.02 + 0.01
      });
    }
  });

  let tick = 0;

  function animate() {
    tick++;
    ctx.clearRect(0, 0, width, height);

    // 1. Dibujar cúmulos de partículas
    particles.forEach(p => {
      p.phase += p.driftSpeed;
      const wobbleX = Math.sin(p.phase) * 6;
      const wobbleY = Math.cos(p.phase) * 6;
      const x = width * p.baseXRatio + p.offsetX + wobbleX;
      const y = height * p.baseYRatio + p.offsetY + wobbleY;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
      ctx.fill();
    });

    // 2. Dibujar ondas sinusoidales suaves
    waves.forEach(w => {
      ctx.beginPath();
      const centerY = height * w.yRatio;
      ctx.lineWidth = w.width;
      ctx.strokeStyle = w.color;

      for (let x = 0; x <= width; x += 4) {
        const y = centerY + Math.sin(x * w.wavelength + tick * w.speed) * w.amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

/**
 * 3. Asignación automática del año en el footer
 */
function initCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/**
 * 4. Alternar tema oscuro/claro con persistencia
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');
  
  const savedTheme = localStorage.getItem('nicalingo-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('nicalingo-theme', nextTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-sun';
      themeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
    }
  }
}

/**
 * 5. Filtrado por categorías (Pills)
 */
function initFilterTabs() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const linkCards = document.querySelectorAll('.link-card');
  const dividers = document.querySelectorAll('.section-divider');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.getAttribute('data-filter');

      linkCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });

      dividers.forEach(divider => {
        const divCategory = divider.getAttribute('data-category');
        if (filterValue === 'all' || divCategory === filterValue) {
          divider.classList.remove('is-hidden');
        } else {
          divider.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * 6. Botón Compartir (Web Share API con fallback al portapapeles)
 */
function initShareAction() {
  const shareBtn = document.getElementById('shareBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimeout = null;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'NicaLingo by Sinskira — Enlaces Oficiales',
      text: 'Revitalizando las lenguas originarias de Nicaragua. Conoce NicaLingo y el equipo de Sinskira.',
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(window.location.href);
        }
      }
    } else {
      copyToClipboard(window.location.href);
    }
  });

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('¡Enlace copiado al portapapeles!');
    } catch {
      showToast('No se pudo copiar el enlace');
    }
  }

  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastMsg.textContent = message;
    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }
}