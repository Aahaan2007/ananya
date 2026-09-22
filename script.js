/* =========================================================
   1. Intro splash — canvas particle burst + dismiss
========================================================= */
(function introSplash() {
  const overlay  = document.getElementById('introOverlay');
  const canvas   = document.getElementById('introCanvas');
  const btn      = document.getElementById('introBtn');
  if (!overlay || !canvas || !btn) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;
  let running = false;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- particle helpers ----
  const COLOURS = ['#FF6F5E','#FFC857','#CFE3C4','#FFFBF4','#c97fff','#80d0ff'];

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = 3 + Math.random() * 7;
      const size   = 5 + Math.random() * 8;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        gravity: 0.18,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        color: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        size,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;
      p.rotation += p.spin;
      drawParticle(p);
    });
    if (running || particles.length > 0) raf = requestAnimationFrame(tick);
  }

  // Initial ambient burst from random positions
  function startAmbient() {
    running = true;
    let t = 0;
    function drop() {
      if (!running) return;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5;
      spawnBurst(x, y, 6);
      t++;
      if (t < 18) setTimeout(drop, 130);
    }
    drop();
    tick();
  }

  // Big burst when button is clicked
  function bigBurst() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnBurst(cx + (Math.random()-0.5)*200, cy + (Math.random()-0.5)*200, 30), i * 80);
    }
  }

  // Dismiss
  function dismiss() {
    bigBurst();
    running = false;
    setTimeout(() => {
      overlay.classList.add('hide');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      // Trigger page reveal
      triggerPageReveal();
    }, 350);
  }

  btn.addEventListener('click', dismiss);

  // Auto-start ambient confetti on overlay
  startAmbient();
})();


/* =========================================================
   2. Page reveal — animate hero elements in after overlay closes
========================================================= */
function triggerPageReveal() {
  // Immediately reveal hero items
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('in-view'), i * 160);
  });
  // Then kick off the IntersectionObserver for the rest of the page
  startScrollReveal();
}

function startScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(el => observer.observe(el));

  // Gallery images staggered
  const imgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in-view'), i * 80);
          imgObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );
  document.querySelectorAll('.gallery-grid img').forEach(img => imgObserver.observe(img));
}


/* =========================================================
   3. Drifting confetti in the background
========================================================= */
(function confettiSky() {
  const sky    = document.getElementById('sky');
  const colors = ['#FF6F5E', '#FFC857', '#CFE3C4', '#3B1F3D'];
  const count  = window.innerWidth < 600 ? 14 : 26;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left              = Math.random() * 100 + 'vw';
    piece.style.background        = colors[i % colors.length];
    piece.style.animationDuration = (10 + Math.random() * 10) + 's';
    piece.style.animationDelay    = (Math.random() * 12) + 's';
    piece.style.opacity           = 0.4 + Math.random() * 0.4;
    const scale = 0.6 + Math.random() * 0.8;
    piece.style.transform         = `scale(${scale})`;
    sky.appendChild(piece);
  }
})();


/* =========================================================
   4. Blow out the candle
========================================================= */
(function candle() {
  const cake = document.getElementById('cake');
  const btn  = document.getElementById('blowBtn');
  const wish = document.getElementById('wishText');
  if (!cake || !btn) return;

  btn.addEventListener('click', () => {
    cake.classList.add('blown');
    btn.disabled     = true;
    btn.textContent  = 'wish sent 🕯️';
    wish.classList.add('show');
    burstConfetti();
  });

  function burstConfetti() {
    const colors = ['#FF6F5E', '#FFC857', '#CFE3C4', '#3B1F3D'];
    const rect   = cake.getBoundingClientRect();
    for (let i = 0; i < 32; i++) {
      const bit = document.createElement('span');
      bit.style.cssText = `
        position:fixed;
        left:${rect.left + rect.width / 2}px;
        top:${rect.top}px;
        width:7px; height:12px;
        background:${colors[i % colors.length]};
        border-radius:2px;
        pointer-events:none;
        z-index:10;
      `;
      const angle    = (Math.random() - 0.5) * Math.PI;
      const distance = 80 + Math.random() * 180;
      const dx = Math.sin(angle) * distance;
      const dy = -Math.cos(angle) * distance - 60;
      bit.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 280}px) rotate(${Math.random() * 520}deg)`, opacity: 0 },
      ], { duration: 1400 + Math.random() * 600, easing: 'cubic-bezier(.2,.6,.2,1)' });
      document.body.appendChild(bit);
      setTimeout(() => bit.remove(), 2100);
    }
  }
})();


/* =========================================================
   5. Photo gallery
   ---------------------------------------------------------
   Add your images to the /photos folder, then list their
   filenames below.
========================================================= */
const PHOTOS = [
  'photos/1.jpg',
  'photos/2.jpeg',
  'photos/3.jpg',
  'photos/5.jpeg',
  'photos/7.JPG',
];

(function gallery() {
  const grid  = document.getElementById('galleryGrid');
  if (!grid) return;

  PHOTOS.forEach((src, i) => {
    const img   = document.createElement('img');
    img.src     = src;
    img.alt     = `Ananya — photo ${i + 1}`;
    img.loading = 'lazy';
    img.onerror = () => img.remove();
    grid.appendChild(img);
  });
})();


/* =========================================================
   6. Lightbox
========================================================= */
(function lightbox() {
  const overlay  = document.getElementById('lightbox');
  const img      = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn  = document.getElementById('lightboxPrev');
  const nextBtn  = document.getElementById('lightboxNext');
  const grid     = document.getElementById('galleryGrid');
  if (!overlay || !img || !grid) return;

  let photos = [];   // live list — built after gallery images load
  let current = 0;

  // Collect loaded images whenever gallery populates
  function getPhotos() {
    return Array.from(grid.querySelectorAll('img'));
  }

  function open(index) {
    photos  = getPhotos();
    current = index;
    update();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function update() {
    const photo = photos[current];
    if (!photo) return;
    // Swap with a quick fade
    img.style.opacity = '0';
    img.style.transform = 'scale(0.92)';
    setTimeout(() => {
      img.src = photo.src;
      img.alt = photo.alt;
      img.style.opacity = '';
      img.style.transform = '';
    }, 120);
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === photos.length - 1;
  }

  function prev() { if (current > 0) { current--; update(); } }
  function next() { if (current < photos.length - 1) { current++; update(); } }

  // Open on gallery image click (delegated — works for dynamically added imgs)
  grid.addEventListener('click', e => {
    const clicked = e.target.closest('img');
    if (!clicked) return;
    const idx = getPhotos().indexOf(clicked);
    if (idx !== -1) open(idx);
  });

  // Controls
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Click backdrop (not the image itself) to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  // Keyboard: Esc to close, ← → to navigate
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
})();

