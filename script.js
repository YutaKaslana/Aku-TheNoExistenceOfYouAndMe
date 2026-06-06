
(function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.setProperty('--dur', (8 + Math.random() * 12) + 's');
    p.style.setProperty('--delay', (Math.random() * 15) + 's');
    if (Math.random() > 0.6) {
      p.style.background = 'var(--gold)';
    }
    container.appendChild(p);
  }
})();

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

// Smooth lagging ring with Anime.js
(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

const hoverTargets = document.querySelectorAll('a, button, .accordion-header');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.classList.add('hover');
    anime({
      targets: ring,
      width: ['36px','58px'],
      height: ['36px','58px'],
      opacity: [0.7, 1],
      borderColor: ['#00f0ff','#ffb700'],
      duration: 300,
      easing: 'easeOutElastic(1, 0.5)'
    });
  });
  el.addEventListener('mouseleave', () => {
    ring.classList.remove('hover');
    anime({
      targets: ring,
      width: '36px',
      height: '36px',
      opacity: 0.7,
      borderColor: '#00f0ff',
      duration: 400,
      easing: 'easeOutExpo'
    });
  });
});

/* ============================================================
   BOOT SEQUENCE ANIMATION
============================================================ */
function buildWavePath(progress, amplitude, segments) {
  const w = 1440, h = 60, cx = w/2, cy = h;
  const activeW = w * progress;
  const startX = cx - activeW/2;
  const endX = cx + activeW/2;

  if (progress < 0.98) {
    return `M ${startX} ${cy} L ${endX} ${cy}`;
  }

  // Spike wave
  let d = `M 0 ${cy}`;
  for (let i = 0; i <= segments; i++) {
    const x = (i/segments) * w;
    const spikeAmp = amplitude * Math.sin(i * Math.PI / segments) * (Math.random() * 0.4 + 0.8);
    const y = cy + (i % 2 === 0 ? -spikeAmp : spikeAmp) * Math.sin(Date.now()*0.005 + i);
    d += ` L ${x} ${y}`;
  }
  return d + ` L ${w} ${cy}`;
}

const bootOverlay = document.getElementById('boot-overlay');
const bootPath = document.getElementById('boot-line-path');
const homeInner = document.getElementById('home-inner');

let bootProgress = 0;
let bootPhase = 'extend'; // extend -> spike -> reveal
let spikeAmplitude = 0;
let bootStart = null;

function bootAnimation(ts) {
  if (!bootStart) bootStart = ts;
  const elapsed = ts - bootStart;

  if (bootPhase === 'extend') {
    bootProgress = Math.min(elapsed / 800, 1);
    const cx = 720, cy = 60;
    const activeW = 1440 * bootProgress;
    bootPath.setAttribute('d', `M ${cx - activeW/2} ${cy} L ${cx + activeW/2} ${cy}`);

    if (bootProgress >= 1) {
      bootPhase = 'spike';
      bootStart = ts;
    }
    requestAnimationFrame(bootAnimation);

  } else if (bootPhase === 'spike') {
    const t = elapsed / 600;
    spikeAmplitude = Math.sin(t * Math.PI) * 45;
    const w = 1440, cy = 60, segs = 40;
    let d = `M 0 ${cy}`;
    for (let i = 0; i <= segs; i++) {
      const x = (i/segs) * w;
      const env = Math.sin(i * Math.PI / segs);
      const noise = (Math.random()-0.5) * spikeAmplitude * 0.6;
      const spike = (i % 2 === 0 ? -1 : 1) * spikeAmplitude * env + noise;
      d += ` L ${x} ${cy + spike}`;
    }
    bootPath.setAttribute('d', d + ` L ${w} ${cy}`);

    if (t >= 1) {
      bootPhase = 'reveal';
      bootStart = ts;
    }
    requestAnimationFrame(bootAnimation);

  } else if (bootPhase === 'reveal') {
    // Fade out overlay, reveal home
    anime({
      targets: bootOverlay,
      opacity: 0,
      duration: 500,
      easing: 'easeOutExpo',
      complete: () => { bootOverlay.style.display = 'none'; }
    });

    homeInner.style.opacity = 1;

    // Glitch-in the headline letters
    const headline = document.getElementById('home-headline');
    const originalText = headline.innerText;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@!_:';

    // Wrap each non-space, non-newline character
    let html = '';
    let idx = 0;
    for (const span of headline.querySelectorAll('.line1, .line2')) {
      const text = span.innerHTML;
      span.innerHTML = text.split('').map(c => {
        if (c === ' ' || c === '<' || c === '>') return c;
        return `<span class="letter" data-char="${c}" style="opacity:0">${c}</span>`;
      }).join('');
    }

    const letters = headline.querySelectorAll('.letter');
    letters.forEach((letter, i) => {
      let iterations = 0;
      const maxIter = 6 + Math.floor(Math.random() * 8);
      const targetChar = letter.getAttribute('data-char');
      setTimeout(() => {
        const glitchInterval = setInterval(() => {
          if (iterations >= maxIter) {
            clearInterval(glitchInterval);
            letter.textContent = targetChar;
            letter.style.opacity = 1;
          } else {
            letter.textContent = chars[Math.floor(Math.random() * chars.length)];
            letter.style.opacity = 1;
            iterations++;
          }
        }, 45);
      }, i * 28 + Math.random() * 100);
    });

    // Animate rest of home content
    anime({
      targets: ['.home-eyebrow', '.home-sub', '.hero-btns', '#wave-canvas'],
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(120, { start: 600 }),
      duration: 700,
      easing: 'easeOutExpo'
    });

    startWaveCanvas();
  }
}

requestAnimationFrame(bootAnimation);

/* ============================================================
   WAVE CANVAS — DORMANT SOUNDWAVE
============================================================ */
function startWaveCanvas() {
  const canvas = document.getElementById('wave-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  let mouseInfluence = 0;
  let targetInfluence = 0;
  canvas.addEventListener('mouseenter', () => { targetInfluence = 1; });
  canvas.addEventListener('mouseleave', () => { targetInfluence = 0; });

  function drawWave() {
    ctx.clearRect(0, 0, W, H);
    mouseInfluence += (targetInfluence - mouseInfluence) * 0.05;
    t += 0.015;

    const lines = 3;
    for (let l = 0; l < lines; l++) {
      const alpha = l === 0 ? 0.9 : l === 1 ? 0.4 : 0.15;
      const ampMulti = l === 0 ? 1 : l === 1 ? 0.6 : 0.3;
      const speed = l === 0 ? 1 : l === 1 ? 0.7 : 0.4;

      ctx.beginPath();
      const segments = 120;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * W;
        const normalizedX = i / segments;
        const envelope = Math.sin(normalizedX * Math.PI);
        const baseAmp = (12 + mouseInfluence * 20) * envelope * ampMulti;
        const wave1 = Math.sin(normalizedX * Math.PI * 6 + t * speed) * baseAmp;
        const wave2 = Math.sin(normalizedX * Math.PI * 12 - t * speed * 1.3) * baseAmp * 0.35;
        const wave3 = mouseInfluence * Math.sin(normalizedX * Math.PI * 20 + t * 3) * 8 * envelope;
        const y = H / 2 + wave1 + wave2 + wave3;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.15, `rgba(0,240,255,${alpha})`);
      gradient.addColorStop(0.5, `rgba(0,240,255,${alpha})`);
      gradient.addColorStop(0.85, `rgba(0,240,255,${alpha})`);
      gradient.addColorStop(1, 'transparent');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = l === 0 ? 2 : 1;
      ctx.shadowBlur = l === 0 ? 12 : 0;
      ctx.shadowColor = '#00f0ff';
      ctx.stroke();
    }

    // Draw dots at peaks
    if (mouseInfluence > 0.1) {
      for (let i = 0; i < 8; i++) {
        const x = (i / 7) * W;
        const normalizedX = i / 7;
        const envelope = Math.sin(normalizedX * Math.PI);
        const amp = (12 + mouseInfluence * 20) * envelope;
        const y = H / 2 + Math.sin(normalizedX * Math.PI * 6 + t) * amp;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,183,0,${mouseInfluence * 0.8})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffb700';
        ctx.fill();
      }
    }

    requestAnimationFrame(drawWave);
  }
  drawWave();
}

/* ============================================================
   ACCORDION
============================================================ */
function toggleAccordion(header) {
  const body = header.nextElementSibling;
  const allHeaders = document.querySelectorAll('.accordion-header');
  const allBodies = document.querySelectorAll('.accordion-body');

  allHeaders.forEach(h => h.classList.remove('active'));
  allBodies.forEach(b => b.classList.remove('open'));

  if (!body.classList.contains('open')) {
    header.classList.add('active');
    body.classList.add('open');
  }
}

/* ============================================================
   SCROLL-TRIGGERED EQUALIZER
============================================================ */
let eqAnimated = false;

function animateEqualizer() {
  if (eqAnimated) return;
  const bars = document.querySelectorAll('.skill-bar-fill');

  // First: violent bouncing
  bars.forEach((bar, i) => {
    const targetPct = bar.getAttribute('data-pct');
    const delay = i * 80;

    anime({
      targets: bar,
      width: [
        { value: '0%', duration: 0 },
        { value: (Math.random() * 30 + 100) + '%', duration: 200, delay },
        { value: (Math.random() * 20) + '%', duration: 150 },
        { value: (Math.random() * 30 + 80) + '%', duration: 180 },
        { value: (Math.random() * 10) + '%', duration: 120 },
        { value: targetPct + '%', duration: 400 }
      ],
      easing: 'easeInOutQuad',
    });
  });

  eqAnimated = true;
}

const eqObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) animateEqualizer();
  });
}, { threshold: 0.3 });

eqObserver.observe(document.getElementById('eq-container'));

/* ============================================================
   BROADCAST SIGNAL — SHOCKWAVE BLAST
============================================================ */
document.getElementById('broadcast-btn').addEventListener('click', function(e) {
  e.preventDefault();

  const form = document.getElementById('terminal-form');
  const rings = [
    document.getElementById('ring1'),
    document.getElementById('ring2'),
    document.getElementById('ring3')
  ];

  // Seismic jitter on form
  anime({
    targets: form,
    translateX: [0, -4, 6, -3, 5, -6, 4, -2, 3, -1, 0],
    translateY: [0, 3, -5, 4, -3, 5, -4, 2, -3, 1, 0],
    duration: 600,
    easing: 'easeInOutSine'
  });

  // Shockwave rings
  rings.forEach((ring, i) => {
    anime.remove(ring);
    anime({
      targets: ring,
      width: ['0px', `${(i+1)*120 + 60}px`],
      height: ['0px', `${(i+1)*120 + 60}px`],
      opacity: [{ value: 0.9, duration: 100 }, { value: 0, duration: 500 }],
      borderColor: i === 0 ? '#00f0ff' : i === 1 ? '#ffb700' : '#ff3b5c',
      borderWidth: ['3px', '1px'],
      delay: i * 120,
      duration: 700,
      easing: 'easeOutExpo',
    });
  });

  // Button flash
  anime({
    targets: this,
    backgroundColor: ['transparent', 'rgba(0,240,255,0.15)', 'transparent'],
    duration: 400,
    easing: 'easeOutExpo'
  });
});

/* ============================================================
   NAV SCROLL HIGHLIGHT
============================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current ? 'var(--cyan)' : '';
  });
}, { passive: true });

/* ============================================================
   SUBTLE SECTION REVEALS
============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      anime({
        targets: entry.target.querySelectorAll('.section-label, .section-title, .section-divider'),
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(80),
        duration: 600,
        easing: 'easeOutExpo'
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('section').forEach(s => revealObserver.observe(s));

/* ============================================================
   ANOMALY CARDS ENTRANCE
============================================================ */
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      anime({
        targets: entry.target.querySelectorAll('.anomaly-card'),
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(100),
        duration: 700,
        easing: 'easeOutExpo'
      });
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.anomaly-grid').forEach(g => {
  g.querySelectorAll('.anomaly-card').forEach(c => c.style.opacity = 0);
  cardObserver.observe(g);
});
