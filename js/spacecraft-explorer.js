/**
 * ORBITX Spacecraft Explorer
 * Curated NASA mission facts with a provider-ready normalized data adapter.
 */
class SpacecraftExplorer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.zoom = 1;
    this.rotation = 0;
    this.dragging = false;
    this.lastX = 0;
    this.selectedId = 'voyager-1';
    this.spacecraft = [
      {
        id: 'voyager-1',
        name: 'Voyager 1',
        shortName: 'VGR-1',
        category: 'INTERPLANETARY PROBE',
        launch: '5 Sep 1977',
        destination: 'Interstellar space',
        status: 'Ongoing',
        color: '#38BDF8',
        kind: 'voyager',
        description: 'NASA launched Voyager 1 in 1977 for Jupiter and Saturn flybys. It entered interstellar space and continues communicating with Earth.',
        path: 0.74
      },
      {
        id: 'voyager-2',
        name: 'Voyager 2',
        shortName: 'VGR-2',
        category: 'OUTER PLANETS PROBE',
        launch: '20 Aug 1977',
        destination: 'Interstellar space',
        status: 'Ongoing',
        color: '#A78BFA',
        kind: 'voyager',
        description: 'Voyager 2 is the only spacecraft to have flown by Jupiter, Saturn, Uranus, and Neptune on its outer planets Grand Tour.',
        path: 0.68
      },
      {
        id: 'jwst',
        name: 'James Webb Space Telescope',
        shortName: 'JWST',
        category: 'SPACE OBSERVATORY',
        launch: '25 Dec 2021',
        destination: 'Sun-Earth L2',
        status: 'Ongoing science',
        color: '#F59E0B',
        kind: 'telescope',
        description: 'JWST is an infrared observatory studying early galaxies, star formation, planetary systems, and exoplanet atmospheres.',
        path: 0.26
      },
      {
        id: 'hubble',
        name: 'Hubble Space Telescope',
        shortName: 'HUBBLE',
        category: 'ORBITING OBSERVATORY',
        launch: '24 Apr 1990',
        destination: 'Low Earth orbit',
        status: 'Ongoing science',
        color: '#22D3EE',
        kind: 'telescope',
        description: 'Hubble observes ultraviolet, visible, and near-infrared light above most of Earth’s atmosphere.',
        path: 0.18
      },
      {
        id: 'perseverance',
        name: 'Perseverance',
        shortName: 'PERSEVERANCE',
        category: 'MARS ROVER',
        launch: '30 Jul 2020',
        destination: 'Jezero Crater, Mars',
        status: 'Surface operations',
        color: '#EF4444',
        kind: 'rover',
        description: 'Perseverance explores Jezero Crater, studies ancient habitability, and collects rock and sediment samples.',
        path: 0.42
      },
      {
        id: 'curiosity',
        name: 'Curiosity',
        shortName: 'CURIOSITY',
        category: 'MARS ROVER',
        launch: '26 Nov 2011',
        destination: 'Gale Crater, Mars',
        status: 'Surface operations',
        color: '#FB923C',
        kind: 'rover',
        description: 'Curiosity investigates ancient habitable environments and the geological history of Gale Crater.',
        path: 0.38
      }
    ];
    this.init();
  }

  init() {
    this.resize();
    this.renderSelector();
    this.bindControls();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(this.animationFrame);
      else this.animate();
    });
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = rect.width || 700;
    this.height = rect.height || 560;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  renderSelector() {
    const selector = document.getElementById('spacecraft-selector');
    if (!selector) return;
    selector.innerHTML = this.spacecraft.map(item => `
      <button type="button" class="${item.id === this.selectedId ? 'active' : ''}" data-spacecraft-id="${item.id}">
        <span style="--craft-color:${item.color}"></span>
        <strong>${item.shortName}</strong>
      </button>
    `).join('');
    selector.addEventListener('click', event => {
      const button = event.target.closest('[data-spacecraft-id]');
      if (!button) return;
      this.select(button.dataset.spacecraftId);
    });
    this.select(this.selectedId);
  }

  bindControls() {
    document.getElementById('spacecraft-zoom-in')?.addEventListener('click', () => { this.zoom = Math.min(1.8, this.zoom * 1.18); });
    document.getElementById('spacecraft-zoom-out')?.addEventListener('click', () => { this.zoom = Math.max(0.7, this.zoom / 1.18); });
    document.getElementById('spacecraft-rotate-left')?.addEventListener('click', () => { this.rotation -= 0.18; });
    document.getElementById('spacecraft-rotate-right')?.addEventListener('click', () => { this.rotation += 0.18; });
    document.getElementById('spacecraft-reset')?.addEventListener('click', () => { this.zoom = 1; this.rotation = 0; });

    this.canvas.addEventListener('pointerdown', event => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      this.rotation += (event.clientX - this.lastX) * 0.006;
      this.lastX = event.clientX;
    });
    this.canvas.addEventListener('pointerup', () => { this.dragging = false; });
  }

  select(id) {
    const item = this.spacecraft.find(craft => craft.id === id);
    if (!item) return;
    this.selectedId = id;
    document.querySelectorAll('[data-spacecraft-id]').forEach(button => button.classList.toggle('active', button.dataset.spacecraftId === id));
    document.getElementById('spacecraft-name').textContent = item.name;
    document.getElementById('spacecraft-category').textContent = item.category;
    document.getElementById('spacecraft-description').textContent = item.description;
    document.getElementById('spacecraft-launch').textContent = item.launch;
    document.getElementById('spacecraft-destination').textContent = item.destination;
    document.getElementById('spacecraft-status').textContent = item.status;
  }

  updateFromProvider(records) {
    if (!Array.isArray(records) || !records.length) return false;
    this.spacecraft = records.map((record, index) => ({
      id: record.id || `mission-${index}`,
      name: record.name || 'Mission',
      shortName: record.shortName || record.name || 'MISSION',
      category: record.category || 'SPACECRAFT',
      launch: record.launch || 'Unavailable',
      destination: record.destination || 'Unavailable',
      status: record.status || 'Archive',
      description: record.description || 'Mission description unavailable.',
      color: '#38BDF8',
      kind: record.kind || 'voyager',
      path: Number(record.path) || 0.35
    }));
    this.selectedId = this.spacecraft[0].id;
    this.renderSelector();
    document.getElementById('spacecraft-source-label').textContent = 'PROVIDER DATA';
    return true;
  }

  animate() {
    this.animationFrame = cancelAnimationFrame(this.animationFrame);
    this.draw();
    if (!document.hidden) this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const cx = this.width / 2;
    const cy = this.height / 2;
    const background = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(this.width, this.height) * 0.7);
    background.addColorStop(0, 'rgba(37,99,235,.18)');
    background.addColorStop(1, '#02040d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.scale(this.zoom, this.zoom);

    const selected = this.spacecraft.find(item => item.id === this.selectedId);
    if (!selected) return ctx.restore();

    ctx.strokeStyle = `${selected.color}66`;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 8]);
    ctx.beginPath();
    ctx.moveTo(-this.width * 0.38, this.height * 0.18);
    ctx.bezierCurveTo(-this.width * 0.18, -this.height * 0.24, this.width * 0.18, -this.height * 0.2, this.width * 0.38 * selected.path, -this.height * 0.12);
    ctx.stroke();
    ctx.setLineDash([]);

    const craftX = this.width * 0.38 * selected.path;
    const craftY = -this.height * 0.12;
    ctx.translate(craftX, craftY);
    ctx.rotate(-0.18);
    this.drawCraft(ctx, selected);
    ctx.restore();

    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = selected.color;
    ctx.textAlign = 'center';
    ctx.fillText(`${selected.name} • SIMULATED MODEL`, craftX + cx, craftY + cy + 62);
  }

  drawCraft(ctx, craft) {
    ctx.shadowColor = craft.color;
    ctx.shadowBlur = 18;
    if (craft.kind === 'rover') {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-23, -8, 46, 16);
      ctx.fillStyle = craft.color;
      ctx.fillRect(-18, -3, 36, 7);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 4;
      [-16, 16].forEach(x => { ctx.beginPath(); ctx.arc(x, 13, 7, 0, Math.PI * 2); ctx.stroke(); });
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(0, -14, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (craft.kind === 'telescope') {
      ctx.fillStyle = craft.id === 'jwst' ? '#F8FAFC' : '#CBD5E1';
      ctx.fillRect(-8, -25, 16, 50);
      ctx.fillStyle = craft.id === 'jwst' ? '#FCD34D' : '#38BDF8';
      ctx.fillRect(-42, -20, 28, 40);
      ctx.fillRect(14, -20, 28, 40);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-5, -40, 10, 15);
    } else {
      ctx.fillStyle = '#D8B4FE';
      ctx.fillRect(-17, -14, 34, 28);
      ctx.fillStyle = '#FB923C';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#93C5FD';
      ctx.fillRect(-54, -5, 34, 10);
      ctx.fillRect(20, -5, 34, 10);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(17, -10);
      ctx.lineTo(35, -28);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }
}

window.SpacecraftExplorer = SpacecraftExplorer;
