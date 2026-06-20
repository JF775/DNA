/**
 * Timeline v2 — GSAP ScrollTrigger driven animations
 */
class TimelineAnimator {
  constructor() {
    this.container = document.getElementById('timelineContainer');
    this.trackFill = document.getElementById('timelineTrackFill');
    if (!this.container || !this.trackFill) return;
    this.items = this.container.querySelectorAll('.timeline-item');
    this.init();
  }

  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      this.fallback();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Animate the track fill line
    gsap.to(this.trackFill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: this.container,
        start: 'top 65%',
        end: 'bottom 65%',
        scrub: 1,
      },
    });

    // Each timeline item: slide in from left/right + fade
    this.items.forEach((item, i) => {
      const side = item.getAttribute('data-side');
      const xDir = side === 'left' ? -80 : 80;

      gsap.fromTo(item, {
        opacity: 0,
        x: xDir,
        y: 30,
        scale: 0.92,
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });

      // Node pop
      const node = item.querySelector('.timeline-node');
      if (node) {
        gsap.from(node, {
          scale: 0,
          rotation: -180,
          duration: 0.6,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: node,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });
  }

  fallback() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = 1;
          e.target.style.transform = 'translateY(0) translateX(0) scale(1)';
        }
      });
    }, { threshold: 0.2 });

    this.items.forEach(item => {
      item.style.transition = 'all 0.8s cubic-bezier(0.19,1,0.22,1)';
      observer.observe(item);
    });

    // Simple scroll-based fill
    window.addEventListener('scroll', () => {
      const rect = this.container.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height));
      this.trackFill.style.height = (progress * 100) + '%';
    }, { passive: true });
  }
}
