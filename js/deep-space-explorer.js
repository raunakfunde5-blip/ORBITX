/**
 * ORBITX Deep Space Explorer
 * Lightweight canvas-based educational galaxy visualization.
 */
class DeepSpaceExplorer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.zoom = 1;
    this.rotation = 0;
    this.tilt = 0.58;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.running = true;
    this.objects = [
      { id: 'sagittarius-a', name: 'Sagittarius A*', type: 'SIMULATED BLACK HOLE', kind: 'blackhole', distance: '26,670 ly', size: '121 AU horizon scale', description: 'The supermassive black hole in the center of the Milky Way is visualized with an educational accretion disk.', x: 0, y: 0 },
      { id: 'orion', name: 'Orion Nebula', type: 'SIMULATED NEBULA', kind: 'nebula', distance: '1,344 ly', size: '24 ly wide', description: 'A bright nearby stellar nursery represented by glowing simulated gas clouds.', x: -0.58, y: -0.18 },
      { id: 'carina', name: 'Carina Nebula', type: 'SIMULATED NEBULA', kind: 'nebula', distance: '8,500 ly', size: '230 ly wide', description: 'An educational interpretation of a vast star-forming region.', x: 0.42, y: 0.36 },
      { id: 'pleiades', name: 'Pleiades Cluster', type: 'SIMULATED STAR CLUSTER', kind: 'cluster', distance: '444 ly', size: '43 ly wide', description: 'A young open star cluster rendered as a compact blue-white cluster.', x: -0.38, y: 0.44 },
      { id: 'halo', name: 'Andromeda Galaxy', type: 'DISTANT GALAXY', kind: 'galaxy', distance: '2.5M ly', size: '220,000 ly wide', description: 'A simulated distant galaxy companion in the local deep-space view.', x: 0.72, y: -0.48 },
      { id: 'halley', name: 'Halley-class Comet', type: 'SIMULATED COMET', kind: 'comet', distance: 'Variable', size: '11 km nucleus', description: 'An educational comet illustration with a moving simulated coma and tail.', x: 0.18, y: -0.62 }
    ];
    this.objectScreens = [];
    this.createStars();
    this.init();
  }

  createStars() {
    const count = Math.min(900, window.innerWidth < 700 ? 380 : 700);
    let seed = 24681357;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    this.stars = Array.from({ length: count }, () => {
      const arm = Math.floor(random() * 4);
      const armAngle = arm * Math.PI / 2;
      const radius = Math.pow(random(), 0.65) * 0.9;
      return {
        radius,
        angle: armAngle + radius * 7.1 + (random() - 0.5) * 0.65,
        size: random() > 0.96 ? 1.8 : 0.45 + random() * 0.9,
        alpha: 0.25 + random() * 0.75,
        hue: random() > 0.82 ? 210 + random() * 45 : 28 + random() * 28
      };
    });
  }

  init() {
    this.resize();
    this.bindControls();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    document.addEventListener('visibilitychange', () => this.setVisibility(document.hidden));
    this.animate();
  }

  setVisibility(hidden) {
    this.running = !hidden;
    if (!hidden && !this.animationFrame) this.animate();
    if (hidden && this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    this.width = rect.width || 800;
    this.height = rect.height || 620;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  bindControls() {
    document.getElementById('deep-camera-in')?.addEventListener('click', () => this.zoom = Math.min(2, this.zoom * 1.18));
    document.getElementById('deep-camera-out')?.addEventListener('click', () => this.zoom = Math.max(0.65, this.zoom / 1.18));
    document.getElementById('deep-camera-left')?.addEventListener('click', () => { this.rotation -= 0.15; });
    document.getElementById('deep-camera-right')?.addEventListener('click', () => { this.rotation += 0.15; });
    document.getElementById('deep-camera-reset')?.addEventListener('click', () => { this.zoom = 1; this.rotation = 0; });

    document.querySelectorAll('[data-explorer-mode]').forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.explorerMode;
        document.querySelectorAll('[data-explorer-mode]').forEach(item => item.classList.toggle('active', item === button));
        if (mode === 'solar') document.getElementById('solar-system')?.scrollIntoView({ behavior: 'smooth' });
        if (mode === 'earth') document.getElementById('solar-view-earth')?.click();
        if (mode === 'earth') document.getElementById('solar-system')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    this.canvas.addEventListener('pointerdown', event => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      this.rotation += (event.clientX - this.lastX) * 0.006;
      this.tilt = Math.max(0.38, Math.min(0.82, this.tilt + (event.clientY - this.lastY) * 0.002));
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    });
    this.canvas.addEventListener('pointerup', () => { this.dragging = false; });
    this.canvas.addEventListener('click', event => this.handleClick(event));
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.zoom = Math.max(0.65, Math.min(2, this.zoom + (event.deltaY > 0 ? -0.08 : 0.08)));
    }, { passive: false });
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const match = this.objectScreens.find(item => Math.hypot(x - item.x, y - item.y) < 25);
    if (match) this.showObject(match.object);
  }

  showObject(object) {
    document.getElementById('deep-object-type').textContent = object.type;
    document.getElementById('deep-object-name').textContent = object.name;
    document.getElementById('deep-object-description').textContent = object.description;
    document.getElementById('deep-object-distance').textContent = object.distance;
    document.getElementById('deep-object-size').textContent = object.size;
    document.getElementById('deep-object-panel').classList.add('visible');
  }

  animate() {
    this.animationFrame = null;
    this.draw();
    if (this.running) this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const cx = this.width / 2;
    const cy = this.height * 0.52;
    const scale = Math.min(this.width, this.height) * 0.46 * this.zoom;

    const background = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(this.width, this.height) * 0.7);
    background.addColorStop(0, 'rgba(42,24,84,.42)');
    background.addColorStop(0.45, 'rgba(14,18,48,.68)');
    background.addColorStop(1, '#02040d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.scale(1, this.tilt);
    for (const star of this.stars) {
      const x = Math.cos(star.angle) * star.radius * scale;
      const y = Math.sin(star.angle) * star.radius * scale;
      ctx.fillStyle = `hsla(${star.hue}, 85%, 80%, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size / this.zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this.drawNebula(ctx, cx - scale * 0.52, cy - scale * 0.2, scale * 0.18, '#A855F7');
    this.drawNebula(ctx, cx + scale * 0.48, cy + scale * 0.08, scale * 0.16, '#38BDF8');
    this.drawGalaxy(ctx, cx, cy, scale, cx + scale * 0.72, cy - scale * 0.48);
    this.drawObjects(ctx, cx, cy, scale);
  }

  drawNebula(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `${color}A8`);
    gradient.addColorStop(0.45, `${color}38`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGalaxy(ctx, cx, cy, scale, distantX, distantY) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation * 0.18);
    ctx.scale(1, this.tilt);
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.12);
    core.addColorStop(0, '#FFF7CC');
    core.addColorStop(0.18, '#F59E0B');
    core.addColorStop(1, 'rgba(245,158,11,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, scale * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(distantX, distantY);
    ctx.rotate(-0.35 + this.rotation * 0.05);
    ctx.scale(1, 0.36);
    ctx.strokeStyle = 'rgba(167,139,250,.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, scale * 0.09, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawObjects(ctx, cx, cy, scale) {
    this.objectScreens = [];
    for (const object of this.objects) {
      const projectedAngle = this.rotation;
      const x = cx + (object.x * Math.cos(projectedAngle) - object.y * Math.sin(projectedAngle)) * scale;
      const y = cy + (object.y * Math.cos(projectedAngle) + object.x * Math.sin(projectedAngle)) * scale * this.tilt;
      this.objectScreens.push({ x, y, object });

      if (object.kind === 'blackhole') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation * 0.4);
        ctx.scale(1, 0.32);
        const disk = ctx.createRadialGradient(0, 0, 9, 0, 0, 38);
        disk.addColorStop(0, '#02040d');
        disk.addColorStop(0.18, '#02040d');
        disk.addColorStop(0.25, '#FDE68A');
        disk.addColorStop(0.5, '#F97316');
        disk.addColorStop(0.72, '#7C3AED');
        disk.addColorStop(1, 'rgba(124,58,237,0)');
        ctx.fillStyle = disk;
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (object.kind === 'comet') {
        ctx.strokeStyle = 'rgba(56,189,248,.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 48, y + 18);
        ctx.stroke();
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (object.kind === 'cluster') {
        for (let i = 0; i < 9; i++) {
          const angle = i * 2.4 + this.rotation;
          ctx.fillStyle = i % 2 ? '#BAE6FD' : '#F8FAFC';
          ctx.beginPath();
          ctx.arc(x + Math.cos(angle) * (10 + i % 3 * 5), y + Math.sin(angle) * 12, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = object.kind === 'galaxy' ? '#A78BFA99' : '#38BDF899';
        ctx.fillStyle = object.kind === 'galaxy' ? '#A78BFA44' : '#38BDF844';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, object.kind === 'galaxy' ? 13 : 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (this.zoom > 0.8) {
        ctx.font = "600 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#DDE7FF';
        ctx.textAlign = 'center';
        ctx.fillText(object.name, x, y + 25);
      }
    }
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }
}

window.DeepSpaceExplorer = DeepSpaceExplorer;
