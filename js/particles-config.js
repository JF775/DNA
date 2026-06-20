/**
 * Particle Systems v2 — Petal Canvas, Cursor Trail, Sparkles, Confetti, Garden FX
 */

/* ==========================================
   PETAL SYSTEM (Canvas-based falling petals)
   ========================================== */
class PetalSystem {
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.running = false;
    this.o = {
      count: opts.count || 40,
      colors: opts.colors || [
        'rgba(255,182,193,0.7)', 'rgba(255,133,161,0.6)',
        'rgba(255,192,203,0.5)', 'rgba(255,182,193,0.4)',
        'rgba(233,30,140,0.25)', 'rgba(212,175,55,0.15)',
      ],
      minSize: opts.minSize || 6,
      maxSize: opts.maxSize || 18,
      speed: opts.speed || 0.8,
      wind: opts.wind || 0.4,
    };
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }
  _resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }
  _create() {
    const s = this.o.minSize + Math.random() * (this.o.maxSize - this.o.minSize);
    return {
      x: Math.random() * this.canvas.width,
      y: -s - Math.random() * this.canvas.height * 0.3,
      s, sy: 0.2 + Math.random() * this.o.speed,
      sx: -0.3 + Math.random() * this.o.wind,
      r: Math.random() * 360, rs: (Math.random() - 0.5) * 2,
      osc: 0.5 + Math.random() * 1.5, osd: 30 + Math.random() * 50,
      c: this.o.colors[Math.floor(Math.random() * this.o.colors.length)],
      a: 0.3 + Math.random() * 0.7, t: Math.random() * Math.PI * 2,
    };
  }
  _draw(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate((p.r * Math.PI) / 180);
    this.ctx.globalAlpha = p.a;
    this.ctx.beginPath();
    const s = p.s;
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(s * 0.4, -s * 0.3, s, -s * 0.2, s * 0.5, s * 0.5);
    this.ctx.bezierCurveTo(s * 0.2, s * 0.8, -s * 0.2, s * 0.3, 0, 0);
    this.ctx.fillStyle = p.c;
    this.ctx.fill();
    this.ctx.restore();
  }
  _loop() {
    if (!this.canvas || !this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    while (this.petals.length < this.o.count) this.petals.push(this._create());
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      p.t += 0.02;
      p.y += p.sy;
      p.x += Math.sin(p.t * p.osc) * 0.5 + p.sx;
      p.r += p.rs;
      this._draw(p);
      if (p.y > this.canvas.height + p.s || p.x < -50 || p.x > this.canvas.width + 50) {
        this.petals[i] = this._create();
        this.petals[i].y = -this.petals[i].s;
      }
    }
    requestAnimationFrame(() => this._loop());
  }
  start() { if (this.running || !this.canvas) return; this.running = true; this._loop(); }
  stop() { this.running = false; }
}

/* ==========================================
   CURSOR TRAIL (Glowing particles follow cursor)
   ========================================== */
class CursorTrail {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || window.matchMedia('(pointer: coarse)').matches) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.running = true;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this._emit();
    });
    this._loop();
  }
  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  _emit() {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: this.mouse.x + (Math.random() - 0.5) * 8,
        y: this.mouse.y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        size: 2 + Math.random() * 4,
        hue: 330 + Math.random() * 30,
      });
    }
  }
  _loop() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      this.ctx.save();
      this.ctx.globalAlpha = p.life * 0.6;
      this.ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life})`;
      this.ctx.shadowColor = `hsla(${p.hue}, 80%, 70%, 0.5)`;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================
   STAR FIELD (For wish section)
   ========================================== */
class StarField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.running = false;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }
  _resize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: 0.5 + Math.random() * 2,
        a: Math.random(),
        speed: 0.003 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  _loop() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const t = Date.now() * 0.001;
    for (const s of this.stars) {
      const alpha = 0.3 + Math.sin(t * s.speed * 60 + s.phase) * 0.4;
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, alpha);
      this.ctx.fillStyle = '#FFD700';
      this.ctx.shadowColor = '#FFD700';
      this.ctx.shadowBlur = s.r * 4;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    requestAnimationFrame(() => this._loop());
  }
  start() { if (this.running) return; this.running = true; this._loop(); }
  stop() { this.running = false; }
}

/* ==========================================
   CONFETTI SYSTEM
   ========================================== */
class ConfettiSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.colors = ['#FFB6C1', '#FF85A1', '#C2185B', '#E91E8C', '#D4AF37', '#FFC0CB', '#FFD700', '#FF69B4', '#fff'];
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }
  _resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
  burst(count = 150) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
        y: window.innerHeight * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        s: 3 + Math.random() * 8,
        c: this.colors[Math.floor(Math.random() * this.colors.length)],
        r: Math.random() * 360, rs: (Math.random() - 0.5) * 12,
        g: 0.12 + Math.random() * 0.08,
        a: 1, shape: Math.random() > 0.4 ? 'rect' : 'circle',
        w: 0.4 + Math.random() * 0.6,
      });
    }
    if (!this.running) { this.running = true; this._loop(); }
  }
  _loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.99;
      p.r += p.rs; p.a -= 0.004;
      if (p.a <= 0) { this.particles.splice(i, 1); continue; }
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.r * Math.PI) / 180);
      this.ctx.globalAlpha = p.a;
      this.ctx.fillStyle = p.c;
      if (p.shape === 'rect') this.ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * p.w);
      else { this.ctx.beginPath(); this.ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2); this.ctx.fill(); }
      this.ctx.restore();
    }
    if (this.particles.length > 0) requestAnimationFrame(() => this._loop());
    else { this.running = false; this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
  }
}

/* ==========================================
   GARDEN PARTICLE EMITTER
   ========================================== */
class GardenParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }
  _resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = r.width;
    this.canvas.height = r.height;
  }
  emit(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const sp = 2 + Math.random() * 5;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
        s: 2 + Math.random() * 6, c: color, a: 1,
        g: 0.06, life: 1, decay: 0.01 + Math.random() * 0.015,
        r: Math.random() * 360, rs: (Math.random() - 0.5) * 8,
      });
    }
    if (!this.running) { this.running = true; this._loop(); }
  }
  _loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g;
      p.life -= p.decay; p.a = p.life; p.r += p.rs;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.r * Math.PI) / 180);
      this.ctx.globalAlpha = p.a * 0.7;
      this.ctx.fillStyle = p.c;
      this.ctx.beginPath();
      // petal shape
      const s = p.s;
      this.ctx.moveTo(0, 0);
      this.ctx.bezierCurveTo(s * 0.3, -s * 0.3, s, -s * 0.1, s * 0.4, s * 0.4);
      this.ctx.bezierCurveTo(s * 0.1, s * 0.6, -s * 0.1, s * 0.2, 0, 0);
      this.ctx.fill();
      this.ctx.restore();
    }
    if (this.particles.length > 0) requestAnimationFrame(() => this._loop());
    else this.running = false;
  }
}
