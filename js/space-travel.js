class SpaceTravelSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.destinations = {
      earth: { name: 'Earth', distance: '384,400 km', duration: '18 sec', color: '#38BDF8', position: 0.18 },
      moon: { name: 'Moon', distance: '384,400 km', duration: '25 sec', color: '#CBD5E1', position: 0.28 },
      mars: { name: 'Mars', distance: '225M km avg.', duration: '2 min', color: '#EF4444', position: 0.44 },
      jupiter: { name: 'Jupiter', distance: '778M km avg.', duration: '4 min', color: '#D97706', position: 0.68 },
      saturn: { name: 'Saturn', distance: '1.43B km avg.', duration: '6 min', color: '#FCD34D', position: 0.86 }
    };
    this.destination = 'mars';
    this.speed = 0;
    this.maxSpeed = 0.18;
    this.progress = 0;
    this.running = true;
    this.camera = 'external';
    this.rotationX = 0;
    this.rotationY = 0;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    this.bindControls();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(this.animationFrame);
      else this.animate();
    });
    this.animate();
  }

  createStars() {
    this.stars = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(), size: Math.random() * 1.5 + .2, alpha: Math.random() * .7 + .3
    }));
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = rect.width || 900;
    this.height = rect.height || 620;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  bindControls() {
    const select = document.getElementById('travel-destination-select');
    select?.addEventListener('change', () => this.selectDestination(select.value));
    document.getElementById('travel-accelerate')?.addEventListener('pointerdown', () => this.accelerate(true));
    document.getElementById('travel-brake')?.addEventListener('pointerdown', () => this.accelerate(false));
    document.addEventListener('keydown', event => {
      if (!event.target.matches('input, select, textarea')) {
        const key = event.key.toLowerCase();
        if (event.key === 'ArrowUp' || key === 'w') this.accelerate(true);
        if (event.key === 'ArrowDown' || key === 's') this.accelerate(false);
        if (event.key === 'ArrowLeft' || key === 'a') this.rotationY -= .08;
        if (event.key === 'ArrowRight' || key === 'd') this.rotationY += .08;
      }
    });
    document.querySelectorAll('[data-travel-control]').forEach(button => button.addEventListener('pointerdown', () => {
      const control = button.dataset.travelControl;
      if (control === 'accelerate') this.accelerate(true);
      if (control === 'brake') this.accelerate(false);
      if (control === 'left') this.rotationY -= .12;
      if (control === 'right') this.rotationY += .12;
    }));
    const pause = document.getElementById('travel-pause');
    pause?.addEventListener('click', () => {
      this.running = !this.running;
      pause.innerHTML = this.running ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
      document.getElementById('travel-flight-status').textContent = this.running ? 'IN FLIGHT' : 'PAUSED';
    });
    document.getElementById('travel-reset')?.addEventListener('click', () => this.reset());
    document.getElementById('travel-camera-external')?.addEventListener('click', () => this.setCamera('external'));
    document.getElementById('travel-camera-cockpit')?.addEventListener('click', () => this.setCamera('cockpit'));
    this.canvas.addEventListener('pointerdown', event => {
      this.dragging = true; this.lastX = event.clientX; this.lastY = event.clientY;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      this.rotationY += (event.clientX - this.lastX) * .006;
      this.rotationX += (event.clientY - this.lastY) * .006;
      this.lastX = event.clientX; this.lastY = event.clientY;
    });
    this.canvas.addEventListener('pointerup', () => { this.dragging = false; });
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.accelerate(event.deltaY < 0);
    }, { passive: false });
  }

  accelerate(forward) {
    this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed + (forward ? .008 : -.012)));
    if (this.running) document.getElementById('travel-flight-status').textContent = this.speed > 0 ? 'IN FLIGHT' : 'STANDBY';
  }

  selectDestination(id) {
    if (!this.destinations[id]) return;
    this.destination = id;
    this.progress = 0;
    this.speed = 0;
    const destination = this.destinations[id];
    document.getElementById('travel-destination').textContent = destination.name;
    document.getElementById('travel-progress-name').textContent = destination.name;
    document.getElementById('travel-distance').textContent = destination.distance;
    document.getElementById('travel-duration').textContent = destination.duration;
    this.updateProgress();
  }

  setCamera(camera) {
    this.camera = camera;
    document.getElementById('travel-camera-external').classList.toggle('active', camera === 'external');
    document.getElementById('travel-camera-cockpit').classList.toggle('active', camera === 'cockpit');
  }

  reset() {
    this.speed = 0;
    this.progress = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.running = true;
    document.getElementById('travel-pause').innerHTML = '<i class="fa-solid fa-pause"></i>';
    this.updateProgress();
  }

  updateProgress() {
    const value = Math.round(this.progress);
    document.getElementById('travel-progress-value').textContent = `${value}%`;
    document.getElementById('travel-progress-bar').style.width = `${value}%`;
  }

  animate() {
    cancelAnimationFrame(this.animationFrame);
    this.draw();
    if (this.running && this.speed > 0) {
      this.progress = Math.min(100, this.progress + this.speed * .12);
      if (this.progress >= 100) this.speed = 0;
      this.updateProgress();
    }
    document.getElementById('travel-speed').textContent = `${(this.speed * 55.55).toFixed(2)} c`;
    document.getElementById('travel-heading').textContent = `${Math.round((this.rotationY * 57.2958 + 360) % 360).toString().padStart(3, '0')}° / ${Math.round(this.rotationX * 57.2958 + 360) % 360}`;
    if (!document.hidden) this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const background = ctx.createRadialGradient(this.width * .55, this.height * .45, 0, this.width * .55, this.height * .45, this.width * .7);
    background.addColorStop(0, '#101a35');
    background.addColorStop(1, '#02040b');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, this.width, this.height);

    for (const star of this.stars) {
      ctx.fillStyle = `rgba(226,232,240,${star.alpha})`;
      const streak = Math.max(0, this.speed * 120);
      ctx.fillRect(star.x * this.width, star.y * this.height + streak, star.size, star.size + streak);
    }

    const cx = this.width / 2;
    const cy = this.height / 2;
    const destination = this.destinations[this.destination];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotationY);
    ctx.strokeStyle = 'rgba(56,189,248,.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(-this.width * .4, this.height * .18);
    ctx.quadraticCurveTo(0, -this.height * .12, this.width * destination.position, -this.height * .05);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (this.camera === 'cockpit') {
      this.drawCockpit(ctx, cx, cy);
    } else {
      this.drawSpacecraft(ctx, cx, cy);
      ctx.fillStyle = destination.color;
      ctx.shadowColor = destination.color;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(cx + this.width * .34, cy - this.height * .08, 18 + destination.position * 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  drawSpacecraft(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy + 45);
    ctx.rotate(-.12 + this.rotationX * .12);
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.lineTo(34, 38);
    ctx.lineTo(18, 58);
    ctx.lineTo(-18, 58);
    ctx.lineTo(-34, 38);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = this.speed > 0 ? 28 : 12;
    ctx.beginPath();
    ctx.moveTo(-18, 52);
    ctx.lineTo(18, 52);
    ctx.lineTo(0, 52 + 45 + this.speed * 180);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawCockpit(ctx, cx, cy) {
    ctx.fillStyle = 'rgba(15,23,42,.96)';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, cy + 150);
    ctx.quadraticCurveTo(cx, cy - 80, this.width, cy + 150);
    ctx.lineTo(this.width, this.height);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 95);
    ctx.lineTo(cx, cy + 180);
    ctx.stroke();
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }
}

window.SpaceTravelSimulator = SpaceTravelSimulator;
