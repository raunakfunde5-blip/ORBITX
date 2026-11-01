class MissionCommandCenter {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.rotation = 0.4;
    this.zoom = 1;
    this.dragging = false;
    this.lastX = 0;
    this.objects = [
      { id: 'orb-01', name: 'ORBITX-01', orbit: 'LEO', inclination: 51.6, period: 92.9, phase: 0, color: '#38BDF8', description: 'Simulated observation platform in low Earth orbit.' },
      { id: 'orb-02', name: 'ORBITX-02', orbit: 'SSO', inclination: 98.2, period: 101.0, phase: 1.8, color: '#A78BFA', description: 'Simulated sun-synchronous weather monitor.' },
      { id: 'orb-03', name: 'ORBITX-03', orbit: 'MEO', inclination: 55.0, period: 718.0, phase: 3.2, color: '#22D3EE', description: 'Simulated navigation constellation object.' },
      { id: 'orb-04', name: 'ORBITX-04', orbit: 'LEO', inclination: 67.5, period: 110.0, phase: 4.7, color: '#F59E0B', description: 'Simulated atmospheric research satellite.' }
    ];
    this.selected = this.objects[0];
    this.init();
  }

  init() {
    this.resize();
    this.renderSelector();
    this.bindControls();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    setTimeout(() => document.getElementById('command-loading')?.classList.add('loaded'), 650);
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = rect.width || 700;
    this.height = rect.height || 430;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  renderSelector() {
    const selector = document.getElementById('command-satellite-selector');
    if (!selector) return;
    selector.innerHTML = this.objects.map(object => `
      <button type="button" data-command-object="${object.id}" class="${object.id === this.selected.id ? 'active' : ''}">
        <i style="--object-color:${object.color}"></i><span><strong>${object.name}</strong><small>${object.orbit}</small></span><em>SIM</em>
      </button>
    `).join('');
    selector.addEventListener('click', event => {
      const button = event.target.closest('[data-command-object]');
      if (button) this.select(button.dataset.commandObject);
    });
  }

  bindControls() {
    document.querySelectorAll('[data-command-view]').forEach(button => {
      button.addEventListener('click', () => this.switchView(button.dataset.commandView, button));
    });
    document.getElementById('command-earth-reset')?.addEventListener('click', () => { this.rotation = .4; this.zoom = 1; });
    document.getElementById('command-fullscreen')?.addEventListener('click', () => {
      const center = document.getElementById('mission-command-center');
      if (!document.fullscreenElement && center.requestFullscreen) center.requestFullscreen();
      else if (document.exitFullscreen) document.exitFullscreen();
    });
    this.canvas.addEventListener('pointerdown', event => {
      this.dragging = true; this.lastX = event.clientX;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      this.rotation += (event.clientX - this.lastX) * .008;
      this.lastX = event.clientX;
    });
    this.canvas.addEventListener('pointerup', () => { this.dragging = false; });
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.zoom = Math.max(.75, Math.min(1.35, this.zoom + (event.deltaY < 0 ? .05 : -.05)));
    }, { passive: false });
  }

  switchView(view, button) {
    document.querySelectorAll('[data-command-view]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const views = {
      overview: ['GLOBAL OVERVIEW', 'Earth Observation', 'Select an orbital object to inspect its simulated mission profile.', 'overview'],
      solar: ['SYSTEM MONITOR', 'Solar System Position', 'Eight planetary positions are shown as a scaled educational simulation.', 'solar'],
      satellites: ['ORBITAL NETWORK', 'Earth Satellite Grid', 'Simulated spacecraft positions can be selected from the command inspector.', 'satellite'],
      missions: ['MISSION ARCHIVE', 'Spacecraft Status', 'Mission status uses curated static records and does not represent live operations.', 'mission']
    };
    const [eyebrow, title, text, mode] = views[view];
    document.getElementById('command-inspector-eyebrow').textContent = eyebrow;
    document.getElementById('command-inspector-title').textContent = title;
    document.getElementById('command-inspector-text').textContent = text;
    document.getElementById('command-earth-stage').dataset.mode = mode;
  }

  select(id) {
    const object = this.objects.find(item => item.id === id);
    if (!object) return;
    this.selected = object;
    document.querySelectorAll('[data-command-object]').forEach(button => button.classList.toggle('active', button.dataset.commandObject === id));
    document.getElementById('command-inspector-eyebrow').textContent = 'SELECTED ORBITAL OBJECT';
    document.getElementById('command-inspector-title').textContent = object.name;
    document.getElementById('command-inspector-text').textContent = object.description;
    document.getElementById('command-object-orbit').textContent = object.orbit;
    document.getElementById('command-object-inclination').textContent = `${object.inclination}°`;
    document.getElementById('command-object-period').textContent = `${object.period} min`;
  }

  animate() {
    this.draw();
    this.rotation += .0007;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const cx = this.width / 2;
    const cy = this.height / 2;
    const earthRadius = Math.min(this.width, this.height) * .29 * this.zoom;
    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(56,189,248,.09)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo((i / 8) * this.width, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo((i / 8) * this.width, this.height); ctx.stroke();
    }

    const atmosphere = ctx.createRadialGradient(cx, cy, earthRadius * .8, cx, cy, earthRadius * 1.28);
    atmosphere.addColorStop(0, 'rgba(56,189,248,0)');
    atmosphere.addColorStop(.72, 'rgba(56,189,248,.16)');
    atmosphere.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = atmosphere;
    ctx.beginPath(); ctx.arc(cx, cy, earthRadius * 1.28, 0, Math.PI * 2); ctx.fill();

    const earth = ctx.createRadialGradient(cx-earthRadius*.35, cy-earthRadius*.35, 2, cx, cy, earthRadius);
    earth.addColorStop(0, '#A7F3D0');
    earth.addColorStop(.14, '#38BDF8');
    earth.addColorStop(.62, '#075985');
    earth.addColorStop(1, '#020617');
    ctx.fillStyle = earth;
    ctx.beginPath(); ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(134,239,172,.62)';
    ctx.lineWidth = Math.max(2, earthRadius * .025);
    ctx.beginPath(); ctx.ellipse(cx-earthRadius*.1, cy-earthRadius*.22, earthRadius*.32, earthRadius*.1, .5, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx-earthRadius*.35, cy+earthRadius*.2, earthRadius*.27, earthRadius*.08, -.4, 0, Math.PI*2); ctx.stroke();
    ctx.restore();

    this.objects.forEach((object, index) => {
      object.phase += .002 * (90 / object.period);
      const orbitRadius = earthRadius * (1.28 + index * .16);
      const orbitY = orbitRadius * (object.inclination / 180);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation + object.inclination * Math.PI / 900);
      ctx.strokeStyle = `${object.color}55`;
      ctx.beginPath(); ctx.ellipse(0, 0, orbitRadius, Math.max(8, orbitY), 0, 0, Math.PI*2); ctx.stroke();
      const x = Math.cos(object.phase) * orbitRadius;
      const y = Math.sin(object.phase) * orbitY;
      ctx.fillStyle = object.color;
      ctx.shadowColor = object.color;
      ctx.shadowBlur = object.id === this.selected.id ? 18 : 8;
      ctx.beginPath(); ctx.arc(x, y, object.id === this.selected.id ? 5 : 3.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }

  updateFromProvider(records) {
    if (!Array.isArray(records) || records.length === 0) return false;
    this.objects = records.map((record, index) => ({
      id: record.id || `object-${index}`,
      name: record.name || `OBJECT-${index + 1}`,
      orbit: record.orbit || 'UNAVAILABLE',
      inclination: Number(record.inclination) || 45,
      period: Number(record.periodMinutes) || 90,
      phase: Number(record.phase) || index,
      color: '#38BDF8',
      description: record.description || 'Provider data unavailable.'
    }));
    this.selected = this.objects[0];
    this.renderSelector();
    return true;
  }
}

window.MissionCommandCenter = MissionCommandCenter;
