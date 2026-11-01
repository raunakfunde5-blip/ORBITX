/**
 * ORBITX - Cinematic Dynamic Starfield Canvas
 * Twinkling multi-depth stars, drifting celestial dust, and shooting stars
 */

class Starfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.stars = [];
    this.shootingStars = [];
    this.numStars = 280;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    this.starColors = [
      '#FFFFFF',
      '#F5F7FF',
      '#38BDF8', // Cyan
      '#8B5CF6', // Nebula Purple
      '#93C5FD', // Light Blue
      '#FEF08A'  // Pale Yellow
    ];

    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    
    window.addEventListener('resize', () => {
      this.resize();
      this.createStars();
    });

    window.addEventListener('mousemove', (e) => {
      // Gentle parallax target calculation
      this.mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.04;
      this.mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.04;
    });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Trigger occasional shooting stars every 3-7 seconds
    this.scheduleShootingStar();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createStars() {
    this.stars = [];
    // Adjust density based on screen size
    const count = Math.floor((this.width * this.height) / 5000);
    this.numStars = Math.min(Math.max(count, 150), 380);

    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1.5,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: this.starColors[Math.floor(Math.random() * this.starColors.length)],
        layer: Math.random() * 2 + 1 // Depth parallax layer
      });
    }
  }

  scheduleShootingStar() {
    const delay = Math.random() * 4000 + 3000;
    setTimeout(() => {
      this.spawnShootingStar();
      this.scheduleShootingStar();
    }, delay);
  }

  spawnShootingStar() {
    const startX = Math.random() * this.width * 0.8;
    const startY = Math.random() * (this.height * 0.4);
    const length = Math.random() * 120 + 80;
    const speed = Math.random() * 10 + 14;
    const angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45 degrees diagonal

    this.shootingStars.push({
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: length,
      life: 1.0,
      decay: Math.random() * 0.015 + 0.012
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse parallax easing
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Draw Twinkling Stars
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Update twinkle opacity
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha >= 1.0) {
        star.alpha = 1.0;
        star.twinkleDir = -1;
      } else if (star.alpha <= star.baseAlpha * 0.2) {
        star.alpha = star.baseAlpha * 0.2;
        star.twinkleDir = 1;
      }

      // Parallax shift based on depth layer
      const px = star.x + this.mouse.x * star.layer;
      const py = star.y + this.mouse.y * star.layer;

      this.ctx.save();
      this.ctx.globalAlpha = star.alpha;
      this.ctx.fillStyle = star.color;
      this.ctx.shadowBlur = star.size > 2 ? 8 : 0;
      this.ctx.shadowColor = star.color;

      this.ctx.beginPath();
      this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];

      const tailX = ss.x - (ss.dx / Math.hypot(ss.dx, ss.dy)) * ss.length;
      const tailY = ss.y - (ss.dy / Math.hypot(ss.dx, ss.dy)) * ss.length;

      const grad = this.ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
      grad.addColorStop(0.3, `rgba(56, 189, 248, ${ss.life * 0.8})`);
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');

      this.ctx.save();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(ss.x, ss.y);
      this.ctx.stroke();
      this.ctx.restore();

      // Move shooting star
      ss.x += ss.dx;
      ss.y += ss.dy;
      ss.life -= ss.decay;

      if (ss.life <= 0 || ss.x > this.width + 100 || ss.y > this.height + 100) {
        this.shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// Auto instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new Starfield('starfield-canvas');
});
