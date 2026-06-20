/**
 * Main Application v3 — Full-Page Slider Architecture
 * Loading screen, GSAP Observer slider, Passcode Lock,
 * Netflix Gallery, Reasons Cloud, Envelope, Garden, Confetti.
 */

document.addEventListener('DOMContentLoaded', () => {
  // GSAP Plugins
  gsap.registerPlugin(Observer);

  // ============================================
  // 0. LOADING SCREEN
  // ============================================
  const loader = document.getElementById('loaderScreen');
  const loaderBar = document.getElementById('loaderBarFill');
  document.body.classList.add('loading');

  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress >= 100) loadProgress = 100;
    if (loaderBar) loaderBar.style.width = loadProgress + '%';
    if (loadProgress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        loader?.classList.add('hidden');
        document.body.classList.remove('loading');
        initEverything();
      }, 600);
    }
  }, 200);

  // Loader Petals
  const loaderPetals = document.getElementById('loaderPetals');
  if (loaderPetals) {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position:absolute; width:${8 + Math.random() * 10}px; height:${8 + Math.random() * 10}px;
        border-radius:50% 50% 50% 0; background:rgba(255,182,193,${0.2 + Math.random() * 0.3});
        left:${Math.random() * 100}%; top:-20px;
        animation: petalFall ${6 + Math.random() * 6}s linear infinite;
        animation-delay: ${Math.random() * 6}s;
      `;
      loaderPetals.appendChild(p);
    }
  }

  function initEverything() {
    initCursor();
    initRevealTextPrep();
    initFullpageSlider();
    initHero();
    initCounter();
    initPasscode();
    initNetflixGallery();
    initReasonsCloud();
    initEnvelope();
    initWish();
    initMusicPlayer();
    initConfetti();
    
    // Start first slide animation
    playSlideAnim(0);
    
    console.log('💖 Birthday Website v3 Loaded! 💖');
  }

  // ============================================
  // CURSOR SYSTEM
  // ============================================
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mx = 0, my = 0, dx = 0, dy = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    });

    function updateCursor() {
      dx += (mx - dx) * 0.15;
      dy += (my - dy) * 0.15;
      rx += (mx - rx) * 0.08;
      ry += (my - ry) * 0.08;
      dot.style.left = dx + 'px';
      dot.style.top = dy + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const interactives = 'a, button, .kp-btn, .netflix-card, .reason-bubble, .envelope-3d, .garden-flower, [data-magnetic]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        dot.classList.add('hover'); ring.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        dot.classList.remove('hover'); ring.classList.remove('hover');
      }
    });

    if (typeof CursorTrail !== 'undefined') new CursorTrail('cursorTrail');
  }

  // ============================================
  // REVEAL TEXT PREP
  // ============================================
  function initRevealTextPrep() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const text = el.textContent.trim();
      el.innerHTML = text.split(' ').map(word =>
        `<span class="word"><span class="word-inner">${word}</span></span>`
      ).join(' ');
    });
  }

  // ============================================
  // FULLPAGE SLIDER (GSAP OBSERVER)
  // ============================================
  let currentIndex = 0;
  let animating = false;
  const sections = document.querySelectorAll('.slide-section');
  let isLocked = true; // Lock active at index 2 (Passcode)
  
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  function initFullpageSlider() {
    gsap.set(sections, { autoAlpha: 0, zIndex: 1 });
    gsap.set(sections[0], { autoAlpha: 1, zIndex: 2 });
    sections[0].classList.add('active');
    updateNavArrows();

    // Navigation is now strictly controlled by contextual buttons inside each slide.
    document.querySelectorAll('.slide-next-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!animating) gotoSlide(currentIndex + 1, 1);
      });
    });
    document.querySelectorAll('.slide-prev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!animating) gotoSlide(currentIndex - 1, -1);
      });
    });
  }

  function updateNavArrows() {
    if (prevBtn) {
      if (currentIndex === 0) prevBtn.classList.add('disabled');
      else prevBtn.classList.remove('disabled');
    }
    if (nextBtn) {
      if (currentIndex === sections.length - 1) nextBtn.classList.add('disabled');
      else nextBtn.classList.remove('disabled');
    }
  }

  function gotoSlide(index, direction) {
    if (index < 0 || index >= sections.length) return;
    
    // Check lock
    if (index > 2 && isLocked) {
      const pc = document.querySelector('.passcode-container');
      if (pc) gsap.fromTo(pc, {x: -10}, {x: 10, yoyo: true, repeat: 3, duration: 0.1});
      return;
    }

    animating = true;
    const currentSection = sections[currentIndex];
    const nextSection = sections[index];

    const dX = direction === 1 ? 100 : -100;

    const tl = gsap.timeline({
      onComplete: () => {
        animating = false;
        currentSection.classList.remove('active');
        nextSection.classList.add('active');
        updateNavArrows();
        playSlideAnim(index);
      }
    });

    gsap.set(nextSection, { zIndex: 2 });
    gsap.set(currentSection, { zIndex: 1 });

    // Horizontal slide transition with scale
    tl.fromTo(currentSection, 
        { xPercent: 0, scale: 1 }, 
        { xPercent: -dX * 0.2, scale: 0.9, autoAlpha: 0, duration: 1, ease: "power3.inOut" }
      )
      .fromTo(nextSection, 
        { xPercent: dX, autoAlpha: 0, scale: 1.1 }, 
        { xPercent: 0, autoAlpha: 1, scale: 1, duration: 1, ease: "power3.inOut" }, 
        0
      );

    currentIndex = index;
  }

  function playSlideAnim(index) {
    // Reveal text
    const section = sections[index];
    const reveals = section.querySelectorAll('[data-reveal]');
    reveals.forEach(el => {
      el.classList.add('revealed');
      const words = el.querySelectorAll('.word-inner');
      words.forEach((w, i) => { w.style.transitionDelay = (i * 0.06) + 's'; });
    });

    if (index === 0) playHeroAnim();
    if (index === 1) playCountdownAnim();
    if (index === 2) playSurpriseAnim();
    if (index === 3) playGalleryAnim();
    if (index === 4) playReasonsAnim();
    if (index === 5) playEnvelopeAnim();
    if (index === 6) playWishAnim();
  }

  // ============================================
  // SPECIFIC SLIDE ANIMATIONS
  // ============================================
  function playHeroAnim() {
    gsap.fromTo('#heroPreTitle .char', {y: 20, opacity: 0}, {y: 0, opacity: 1, stagger: 0.03, duration: 0.4, ease: 'power3.out'});
    gsap.fromTo('.hero-line-1', {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2});
    gsap.fromTo('.hero-line-2', {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5});
    gsap.fromTo('.hero-flower-anim', {opacity: 0}, {opacity: 1, duration: 0.5, delay: 0.7});
    gsap.fromTo('.hero-cta-group', {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.6, delay: 0.8});
    gsap.fromTo('.scroll-invite', {opacity: 0}, {opacity: 1, duration: 0.6, delay: 1});
    
    // Typewriter
    const text = "You are the most beautiful thing that ever happened to me...";
    const el = document.getElementById('heroSubtitle');
    if (el && !el.dataset.typed) {
      el.dataset.typed = true;
      el.style.opacity = 1;
      let i = 0; el.textContent = "";
      el.style.borderRight = '2px solid var(--pink-soft)';
      function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(type, 40 + Math.random() * 30);
        } else {
          setTimeout(() => { el.style.borderRight = 'none'; }, 2000);
        }
      }
      setTimeout(type, 600);
    }
  }

  function playCountdownAnim() {
    gsap.fromTo('.counter-card', 
      {opacity: 0, y: 60, scale: 0.8}, 
      {opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.8, ease: 'back.out(1.5)', overwrite: true}
    );
  }

  function playSurpriseAnim() {
    gsap.fromTo('.passcode-container', {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.2)'});
  }

  function playGalleryAnim() {
    gsap.fromTo('.netflix-item', {x: 100, opacity: 0}, {x: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power2.out"});
  }

  function playReasonsAnim() {
    gsap.fromTo('.reason-bubble', {scale: 0, opacity: 0}, {scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, ease: "back.out(1.5)"});
  }

  function playEnvelopeAnim() {
    gsap.fromTo('.envelope-3d', {opacity: 0, y: 60, rotateX: 20, scale: 0.9}, {opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1, ease: 'power3.out'});
  }

  function playGardenAnim() {
    gsap.fromTo('.garden-flower', {opacity: 0, y: 40}, {opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out'});
  }

  function playWishAnim() {
    gsap.fromTo('#wishFrame', {opacity: 0, scale: 0.9, y: 30}, {opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out'});
  }

  // ============================================
  // COMPONENT INITIALIZATIONS
  // ============================================
  function initHero() {
    if(typeof PetalSystem !== 'undefined') {
      const petalSys = new PetalSystem('petalCanvas', { count: 40, speed: 0.9, wind: 0.4 });
      petalSys.start();
    }
  }

  function initCounter() {
    const targetDate = new Date('2026-06-22T00:00:00');
    function update() {
      const now = new Date();
      let diff = targetDate - now;
      if (diff < 0) diff = 0; // If the date has passed, stop at 0
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setNum('counterDays', days);
      setNum('counterHours', hours);
      setNum('counterMinutes', minutes);
      setNum('counterSeconds', seconds);

      setRing('ringDays', days % 365, 365);
      setRing('ringHours', hours, 24);
      setRing('ringMinutes', minutes, 60);
      setRing('ringSeconds', seconds, 60);
    }

    function setNum(id, val) {
      const el = document.getElementById(id);
      if (!el) return;
      const old = parseInt(el.textContent);
      if (old !== val) {
        el.textContent = val;
        el.classList.add('tick');
        setTimeout(() => el.classList.remove('tick'), 300);
      }
    }

    function setRing(id, val, max) {
      const el = document.getElementById(id);
      if (!el) return;
      const circumference = 2 * Math.PI * 45; 
      const offset = circumference - (val / max) * circumference;
      el.style.strokeDashoffset = offset;
    }

    update();
    setInterval(update, 1000);
  }

  function initPasscode() {
    const code = "2206";
    const targetDate = new Date('2026-06-22T00:00:00'); // Time-gate
    let input = "";
    const dots = document.querySelectorAll('.p-dot');
    const hint = document.getElementById('passcodeHint');
    
    document.querySelectorAll('.kp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isLocked) return;
        if (btn.classList.contains('kp-clear')) {
          input = "";
          updateDots();
          hint.textContent = "";
        } else if (btn.classList.contains('kp-enter')) {
          if (input === code) {
            const now = new Date();
            if (now < targetDate) {
              hint.textContent = "It's not your birthday yet! Be patient 💕";
              hint.style.color = "orange";
              dots.forEach(d => d.classList.add('error'));
              setTimeout(() => {
                dots.forEach(d => d.classList.remove('error'));
                input = "";
                updateDots();
                hint.textContent = "";
              }, 2000);
            } else {
              hint.textContent = "Unlocked! Entering memories... 💖";
              hint.style.color = "#66BB6A";
              isLocked = false;
              setTimeout(() => gotoSlide(3, 1), 1000);
            }
          } else {
            hint.textContent = "Incorrect passcode. Try again!";
            hint.style.color = "red";
            dots.forEach(d => d.classList.add('error'));
            setTimeout(() => {
              dots.forEach(d => d.classList.remove('error'));
              input = "";
              updateDots();
            }, 400);
          }
        } else {
          if (input.length < 4) {
            input += btn.textContent;
            updateDots();
          }
        }
      });
    });

    function updateDots() {
      dots.forEach((dot, i) => {
        if (i < input.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
      });
    }

    // --- Photo Album Book Logic ---
    let currentBookPage = 0;
    const bookPages = document.querySelectorAll('.book-page');
    
    // Initialize z-indexes so that first page is on top
    bookPages.forEach((page, index) => {
      page.style.zIndex = bookPages.length - index + 5;
    });

    window.turnBookPage = function(dir) {
      if (dir === 'next' && currentBookPage < bookPages.length) {
        const page = bookPages[currentBookPage];
        page.classList.add('flipped');
        
        // Mid-flip z-index fix to prevent bleed-through
        setTimeout(() => {
          page.style.zIndex = currentBookPage + 5;
        }, 400);

        currentBookPage++;
      } else if (dir === 'prev' && currentBookPage > 0) {
        currentBookPage--;
        const page = bookPages[currentBookPage];
        page.classList.remove('flipped');
        
        // Mid-flip z-index fix to restore order
        setTimeout(() => {
          page.style.zIndex = bookPages.length - currentBookPage + 5;
        }, 400);
      }
    };

    window.flipPage = function(pageEl) {
      if (pageEl.classList.contains('flipped')) {
        turnBookPage('prev');
      } else {
        turnBookPage('next');
      }
    };
  }

  function initNetflixGallery() {
    // Gallery is now replaced by the CSS 3D Photo Album Book 
    // Interaction is handled inline via onclick attributes or the flipPage/turnBookPage functions.
  }

  function initReasonsCloud() {
    const reasons = [
      "Your smile lights up my entire world",
      "The way you laugh makes everything better",
      "Your kindness inspires me every day",
      "You understand me like no one else",
      "Your strength amazes me constantly",
      "The way your eyes sparkle when you're happy",
      "You make even boring days feel magical",
      "Your hugs feel like coming home",
      "The sound of your voice calms my soul",
      "You believe in me even when I don't",
      "Your passion for life is contagious",
      "The way you care for others so deeply",
      "You make me want to be better",
      "Your creativity and imagination",
      "Every adventure is better with you",
      "The little things you do that show you care",
    ];
    
    const stage = document.getElementById('cloudStage');
    const modal = document.getElementById('reasonModal');
    const rmText = document.getElementById('rmText');
    const rmClose = document.getElementById('rmClose');
    if (!stage) return;

    reasons.forEach((reason, i) => {
      const b = document.createElement('div');
      b.className = 'reason-bubble';
      b.textContent = "💗";
      
      const posX = 10 + Math.random() * 80;
      const posY = 10 + Math.random() * 80;
      b.style.left = posX + "%";
      b.style.top = posY + "%";
      
      gsap.to(b, {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      b.addEventListener('pointerdown', () => {
        rmText.textContent = reason;
        modal.classList.add('active');
      });

      stage.appendChild(b);
    });

    rmClose?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  function initEnvelope() {
    const env = document.getElementById('envelope3d');
    let opened = false;
    env?.addEventListener('click', () => {
      if (opened) return;
      opened = true;
      env.classList.add('opened');
    });
  }


  function initWish() {
    if(typeof StarField !== 'undefined') {
      const starField = new StarField('wishStars');
      starField.start(); // Since wish section comes later, we can just start it and let it run
    }
  }

  function initMusicPlayer() {
    const player = document.getElementById('musicPlayer');
    const audio = document.getElementById('bgAudio');
    const playBtn = document.getElementById('amPlayPause');
    const progressBar = document.getElementById('amProgressBar');
    const currentTimeEl = document.getElementById('amCurrentTime');
    const durationEl = document.getElementById('amDuration');
    const volumeSlider = document.getElementById('amVolumeSlider');
    const video = document.getElementById('photoboxVideo');
    
    if (!player || !audio) return;

    let playing = false;

    function formatTime(seconds) {
      if (isNaN(seconds)) return "0:00";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function togglePlay() {
      if (playing) {
        audio.pause();
      } else {
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);

    audio.addEventListener('play', () => {
      playing = true;
      if (playBtn) playBtn.textContent = '⏸';
      player.classList.add('playing');
    });

    audio.addEventListener('pause', () => {
      playing = false;
      if (playBtn) playBtn.textContent = '▶';
      player.classList.remove('playing');
    });

    audio.addEventListener('timeupdate', () => {
      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      if (audio.duration && progressBar) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    });

    if (progressBar) {
      progressBar.addEventListener('input', (e) => {
        if (audio.duration) {
          audio.currentTime = (e.target.value / 100) * audio.duration;
        }
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
      });
      audio.volume = volumeSlider.value / 100;
    }

    // Auto-pause background music when photobox video plays
    if (video) {
      video.addEventListener('play', () => {
        if (playing) {
          audio.pause();
        }
      });
    }

    setTimeout(() => player.classList.add('visible'), 3000);
  }

  function initConfetti() {
    const btn = document.getElementById('confettiBtn');
    if(btn && typeof ConfettiSystem !== 'undefined') {
      const confetti = new ConfettiSystem('confettiCanvas');
      btn.addEventListener('click', () => {
        confetti.burst(180);
        gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
      });
    }
  }
});
