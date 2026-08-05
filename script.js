/* ===================================================================
   ETERNAL PULSE — script.js
   Sections:
     1. Loading screen
     2. Custom cursor
     3. Lenis smooth scroll + GSAP ScrollTrigger sync
     4. Three.js floating particle field (background depth)
     5. DOM floating hearts (foreground, cheaper, denser)
     6. Hero entrance timeline (GSAP)
     7. Mouse parallax (hero heart + background)
     8. Scroll reveal animations (sections, text split, timeline, gallery)
     9. Typing effect (love letter)
    10. Counter animation (stats)
    11. Magnetic buttons + ripple
    12. Tilt cards
    13. Gallery lightbox
    14. Music player
    15. Scroll progress bar
    16. Closing heart burst
   =================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth < 861;

  /* ============================================================
     1. LOADING SCREEN
     ============================================================ */
  const loader = document.getElementById('loader');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderBarFill = document.getElementById('loaderBarFill');

  function runLoader(onComplete){
    let progress = 0;
    const duration = 1800; // ms target
    const start = performance.now();

    function tick(now){
      const elapsed = now - start;
      // ease-out curve so it feels premium, not linear
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      progress = Math.floor(eased * 100);
      loaderPercent.textContent = progress;
      loaderBarFill.style.width = progress + '%';

      if (t < 1){
        requestAnimationFrame(tick);
      } else {
        loaderPercent.textContent = 100;
        loaderBarFill.style.width = '100%';
        setTimeout(() => {
          loader.classList.add('done');
          document.body.style.overflow = '';
          setTimeout(onComplete, 750);
        }, 280);
      }
    }
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(tick);
  }

  /* ============================================================
     2. CUSTOM CURSOR
     ============================================================ */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  if (!isTouch){
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing(){
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursorRing.classList.remove('clicking'));

    const hoverTargets = 'a, button, .gallery-item, .tilt-card, input, .music-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.add('hovered');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.remove('hovered');
    });
  }

  /* ============================================================
     5. DOM FLOATING HEARTS (background ambience)
     ============================================================ */
  function spawnFloatingHearts(){
    const layer = document.getElementById('floatingHearts');
    const count = isTouch ? 14 : 26;
    const glyphs = ['♥', '❤'];
    for (let i = 0; i < count; i++){
      const el = document.createElement('span');
      el.className = 'f-heart';
      el.textContent = glyphs[Math.random() > 0.5 ? 0 : 1];
      const size = 8 + Math.random() * 20;
      const duration = 12 + Math.random() * 14;
      const delay = Math.random() * -26;
      const drift = (Math.random() - 0.5) * 160;
      const rot = (Math.random() - 0.5) * 90;
      const opacity = 0.15 + Math.random() * 0.35;

      el.style.left = Math.random() * 100 + '%';
      el.style.fontSize = size + 'px';
      el.style.setProperty('--s', (0.6 + Math.random() * 0.8).toFixed(2));
      el.style.setProperty('--drift', drift + 'px');
      el.style.setProperty('--rot', rot + 'deg');
      el.style.setProperty('--o', opacity.toFixed(2));
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = delay + 's';
      layer.appendChild(el);
    }
  }
  spawnFloatingHearts();

  /* ============================================================
     4. THREE.JS PARTICLE FIELD
     ============================================================ */
  function initThree(){
    const canvas = document.getElementById('webgl-bg');
    if (!window.THREE || prefersReducedMotion) return null;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    const particleCount = isTouch ? 260 : 620;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const colorChoice = [
      new THREE.Color('#ff6ec7'),
      new THREE.Color('#ff2d95'),
      new THREE.Color('#b537f2'),
      new THREE.Color('#ffe3f4')
    ];
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++){
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26;
      scales[i] = Math.random();
      const c = colorChoice[Math.floor(Math.random() * colorChoice.length)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let targetRotX = 0, targetRotY = 0;
    if (!isTouch){
      window.addEventListener('mousemove', (e) => {
        targetRotY = ((e.clientX / window.innerWidth) - 0.5) * 0.35;
        targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.25;
      });
    }

    const clock = new THREE.Clock();
    function animate(){
      const t = clock.getElapsedTime();
      points.rotation.y += 0.0009;
      points.rotation.x += (targetRotX - points.rotation.x) * 0.02;
      points.rotation.y += (targetRotY * 0.4);
      points.position.y = Math.sin(t * 0.15) * 0.6;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { renderer, scene, camera };
  }

  /* ============================================================
     3. LENIS SMOOTH SCROLL
     ============================================================ */
  function initLenis(){
    if (!window.Lenis) return null;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenis.on('scroll', () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
      updateScrollProgress();
    });
    function raf(time){
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return lenis;
  }

  /* ============================================================
     15. SCROLL PROGRESS BAR
     ============================================================ */
  const scrollProgressEl = document.getElementById('scrollProgress');
  function updateScrollProgress(){
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgressEl.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress);

  /* ============================================================
     6. HERO ENTRANCE TIMELINE
     ============================================================ */
  function heroEntrance(){
    if (!window.gsap){ document.body.classList.add('loaded'); return; }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.9 })
      .fromTo('.hero-heart-wrap',
        { opacity: 0, scale: 0.4, filter: 'blur(20px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'back.out(1.4)' },
        '-=0.5')
      .to('.hero-title .line', {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.15, ease: 'power4.out'
      }, '-=0.7')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9 }, '-=0.5')
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
  }

  /* ============================================================
     7. MOUSE PARALLAX — hero heart + glow
     ============================================================ */
  function initParallax(){
    if (isTouch || prefersReducedMotion) return;
    const heartWrap = document.getElementById('heroHeartWrap');
    const heroGlow = document.querySelector('.hero-glow');
    let px = 0, py = 0;

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5);
      const ny = (e.clientY / window.innerHeight - 0.5);
      px = nx; py = ny;
    });

    function loop(){
      if (heartWrap){
        const currentTransform = `translate(${px * 22}px, ${py * 18}px) rotate(${px * 6}deg)`;
        heartWrap.style.transform = currentTransform;
      }
      if (heroGlow){
        heroGlow.style.transform = `translate(calc(-50% + ${px * 40}px), calc(-50% + ${py * 30}px))`;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ============================================================
     UTIL — split text into lines/spans for reveal animation
     ============================================================ */
  function splitTextReveal(el){
    const html = el.innerHTML;
    // split by <br> to preserve manual line breaks, then wrap each chunk
    const lines = html.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(line =>
      `<span class="reveal-line"><span>${line}</span></span>`
    ).join('');
    el.classList.add('text-reveal');
  }

  /* ============================================================
     8. SCROLL REVEAL ANIMATIONS
     ============================================================ */
  function initScrollReveals(){
    if (!window.gsap || !window.ScrollTrigger){
      // graceful fallback: just show everything
      document.querySelectorAll('[data-reveal], [data-split]').forEach(el => {
        el.style.opacity = 1; el.style.transform = 'none';
      });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // split-text elements (headings/eyebrows/paragraphs)
    document.querySelectorAll('[data-split]').forEach(el => {
      splitTextReveal(el);
      gsap.from(el.querySelectorAll('.reveal-line > span'), {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    // generic fade/scale/blur reveal
    document.querySelectorAll('[data-reveal]:not([data-split])').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 30, filter: 'blur(6px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    // welcome stat cards
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: i * 0.1,
          scrollTrigger: { trigger: '.welcome-stats', start: 'top 85%', once: true }
        });
    });

    // favorite cards
    gsap.utils.toArray('.favorite-card').forEach((card, i) => {
      gsap.to(card, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: (i % 4) * 0.1,
        scrollTrigger: { trigger: card, start: 'top 90%', once: true }
      });
    });

    // letter card glow reveal + signature
    gsap.fromTo('.letter-card',
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.letter-card', start: 'top 80%', once: true, onEnter: startTypingEffect }
      });

    // timeline items + connecting line fill
    const items = gsap.utils.toArray('.timeline-item');
    items.forEach((item, i) => {
      const fromX = item.dataset.side === 'left' ? -50 : 50;
      gsap.fromTo(item,
        { opacity: 0, x: fromX, scale: 0.94 },
        {
          opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 82%', once: true }
        });
    });
    gsap.to('#timelineFill', {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6
      }
    });

    // gallery items — staggered scale/fade
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
      gsap.to(item, {
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: item, start: 'top 92%', once: true }
      });
    });

    // section eyebrow underline sweep already handled by split
  }

  /* ============================================================
     9. TYPING EFFECT — love letter
     ============================================================ */
  let typingStarted = false;
  function startTypingEffect(){
    if (typingStarted) return;
    typingStarted = true;
    const target = document.getElementById('typingText');
    const cursorEl = document.getElementById('typingCursor');
    const signature = document.querySelector('.letter-signature');
    
      
      
      

    let i = 0;
    const speed = 28; // ms per char
    function typeChar(){
      if (i < message.length){
        target.textContent += message.charAt(i);
        i++;
        setTimeout(typeChar, speed + Math.random() * 22);
      } else {
        if (signature) signature.classList.add('show');
      }
    }
    typeChar();
  }

  /* ============================================================
     10. COUNTER ANIMATION (stats)
     ============================================================ */
  function initCounters(){
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const obj = { val: 0 };
      if (window.gsap && window.ScrollTrigger){
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = Math.floor(obj.val).toLocaleString('id-ID'); }
        });
      } else {
        el.textContent = target.toLocaleString('id-ID');
      }
    });
  }

  /* ============================================================
     11. MAGNETIC BUTTONS + RIPPLE
     ============================================================ */
  function initMagneticButtons(){
    document.querySelectorAll('.magnetic').forEach(btn => {
      if (!isTouch){
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          if (window.gsap){
            gsap.to(btn, { x: x * 0.3, y: y * 0.4, duration: 0.4, ease: 'power3.out' });
          }
        });
        btn.addEventListener('mouseleave', () => {
          if (window.gsap) gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        });
      }

      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  /* ============================================================
     12. TILT CARDS (3D hover tilt)
     ============================================================ */
  function initTiltCards(){
    if (isTouch) return;
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = (-y * 8).toFixed(2);
        const rotY = (x * 10).toFixed(2);
        card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* ============================================================
     13. GALLERY LIGHTBOX
     ============================================================ */
  function initLightbox(){
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const captionEl = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const placeholder = item.querySelector('.gallery-placeholder');
        content.className = 'lightbox-content ' + placeholder.className.replace('gallery-placeholder', '').trim();
        content.innerHTML = `<i class="${placeholder.querySelector('i').className}"></i>`;
        captionEl.textContent = item.dataset.caption || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ============================================================
     14. MUSIC PLAYER
     ============================================================ */
  function initMusicPlayer(){
    const player = document.getElementById('musicPlayer');
    const audio = document.getElementById('bgAudio');
    const playBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const muteBtn = document.getElementById('muteBtn');
    const volIcon = document.getElementById('volIcon');
    let isMuted = false;

    playBtn.addEventListener('click', () => {
      if (audio.paused){
        audio.play().then(() => {
          player.classList.add('playing');
          playIcon.className = 'fa-solid fa-play';
        }).catch(() => {
          // no audio file provided — fail silently, still toggle UI as a graceful demo state
          player.classList.toggle('playing');
        });
      } else {
        audio.pause();
        player.classList.remove('playing');
      }
    });

    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      audio.muted = isMuted;
      volIcon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    });
  }

  /* ============================================================
     16. CLOSING HEART BURST
     ============================================================ */
  function initHeartBurst(){
    const btn = document.getElementById('closingBtn');
    const layer = document.getElementById('heartBurstLayer');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 18; i++){
        const h = document.createElement('i');
        h.className = 'fa-solid fa-heart burst-heart';
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 160;
        h.style.left = cx + 'px';
        h.style.top = cy + 'px';
        h.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
        h.style.setProperty('--by', Math.sin(angle) * dist - 40 + 'px');
        h.style.setProperty('--br', (Math.random() * 360) + 'deg');
        h.style.fontSize = (10 + Math.random() * 14) + 'px';
        layer.appendChild(h);
        setTimeout(() => h.remove(), 1300);
      }
    });
  }

  /* ============================================================
     INIT SEQUENCE
     ============================================================ */
  function initAll(){
    initThree();
    initLenis();
    heroEntrance();
    initParallax();
    initScrollReveals();
    initCounters();
    initMagneticButtons();
    initTiltCards();
    initLightbox();
    initMusicPlayer();
    initHeartBurst();
    updateScrollProgress();
  }

  document.addEventListener('DOMContentLoaded', () => {
    runLoader(initAll);
  });

})();
