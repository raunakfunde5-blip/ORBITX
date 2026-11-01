/**
 * ORBITX Satellite Explorer
 * Uses simulated orbital positions by default.
 * Replace/update updateFromTelemetry() with provider data when live tracking is enabled.
 */
class SatelliteExplorer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.running = true;
    this.rotation = 0;
    this.zoom = 1;
    this.dragging = false;
    this.lastX = 0;
    this.selectedLocation = 'tokyo';
    this.locations = [
      { id: 'tokyo', name: 'Tokyo, Japan', coordinates: '35.6762° N / 139.6503° E', sunrise: '05:42 JST', sunset: '17:58 JST' },
      { id: 'nairobi', name: 'Nairobi, Kenya', coordinates: '1.2921° S / 36.8219° E', sunrise: '06:18 EAT', sunset: '18:29 EAT' },
      { id: 'new-york', name: 'New York, USA', coordinates: '40.7128° N / 74.0060° W', sunrise: '06:51 EST', sunset: '17:32 EST' },
      { id: 'sydney', name: 'Sydney, Australia', coordinates: '33.8688° S / 151.2093° E', sunrise: '06:03 AEDT', sunset: '19:44 AEDT' },
      { id: 'london', name: 'London, UK', coordinates: '51.5074° N / 0.1278° W', sunrise: '07:16 GMT', sunset: '16:12 GMT' },
      { id: 'cape-town', name: 'Cape Town, South Africa', coordinates: '33.9249° S / 18.4241° E', sunrise: '05:48 SAST', sunset: '18:58 SAST' }
    ];
    this.satellites = [
      { name: 'ORBITX-01', purpose: 'Observation', inclination: 51.6, period: 92.9, phase: 0.0, color: '#38BDF8' },
      { name: 'ORBITX-02', purpose: 'Weather', inclination: 98.2, period: 101.0, phase: 1.7, color: '#A78BFA' },
      { name: 'ORBITX-03', purpose: 'Navigation', inclination: 55.0, period: 718.0, phase: 3.1, color: '#22D3EE' },
      { name: 'ORBITX-04', purpose: 'Research', inclination: 67.5, period: 110.0, phase: 4.6, color: '#F59E0B' }
    ];
    this.init();
  }

  init() {
    this.resize();
    this.renderObjectList();
    this.renderLocations();
    this.bindControls();
    window.addEventListener('resize', () => this.resize());
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || 700;
    this.height = rect.height || 620;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  bindControls() {
    const button = document.getElementById('satellite-play');
    button?.addEventListener('click', () => {
      this.running = !this.running;
      button.classList.toggle('active', this.running);
      button.innerHTML = this.running
        ? '<i class="fa-solid fa-pause"></i>'
        : '<i class="fa-solid fa-play"></i>';
      button.setAttribute('aria-label', this.running ? 'Pause satellites' : 'Resume satellites');
    });

    this.canvas.addEventListener('pointerdown', event => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', event => {
      if (!this.dragging) return;
      this.rotation += (event.clientX - this.lastX) * 0.008;
      this.lastX = event.clientX;
    });
    this.canvas.addEventListener('pointerup', () => { this.dragging = false; });
    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.zoom = Math.max(0.7, Math.min(1.35, this.zoom + (event.deltaY > 0 ? -0.05 : 0.05)));
    }, { passive: false });
  }

  renderObjectList() {
    const list = document.getElementById('satellite-object-list');
    if (!list) return;
    list.innerHTML = this.satellites.map((satellite, index) => `
      <button class="satellite-object" data-satellite="${index}" type="button">
        <span class="satellite-object-icon" style="--satellite-color:${satellite.color}">
          <i class="fa-solid fa-satellite"></i>
        </span>
        <span>
          <strong>${satellite.name}</strong>
          <small>${satellite.purpose}</small>
        </span>
        <em>SIM</em>
      </button>
    `).join('');
  }

  renderLocations() {
    const list = document.getElementById('earth-location-list');
    if (!list) return;
    list.innerHTML = this.locations.map(location => `
      <button type="button" data-earth-location="${location.id}" class="${location.id === this.selectedLocation ? 'active' : ''}">
        ${location.name}
      </button>
    `).join('');
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-earth-location]');
      if (!button) return;
      this.selectLocation(button.dataset.earthLocation);
    });
    this.selectLocation(this.selectedLocation);
  }

  selectLocation(id) {
    const location = this.locations.find(item => item.id === id);
    if (!location) return;
    this.selectedLocation = id;
    document.querySelectorAll('[data-earth-location]').forEach(button => {
      button.classList.toggle('active', button.dataset.earthLocation === id);
    });
    document.getElementById('earth-location-name').textContent = location.name;
    document.getElementById('earth-location-coordinates').textContent = location.coordinates;
    document.getElementById('earth-sunrise').textContent = location.sunrise;
    document.getElementById('earth-sunset').textContent = location.sunset;
  }

  // Future live providers should call this method with normalized positions.
  updateFromTelemetry(records) {
    if (!Array.isArray(records)) return false;
    this.satellites = records.map((record, index) => ({
      name: record.name || `SAT-${index + 1}`,
      purpose: record.purpose || 'Tracked object',
      inclination: Number(record.inclination) || 45,
      period: Number(record.periodMinutes) || 90,
      phase: Number(record.phase) || index,
      color: '#38BDF8',
      live: Boolean(record.live)
    }));
    this.renderObjectList();
    return true;
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const cx = this.width / 2;
    const cy = this.height / 2;
    const earthRadius = Math.min(this.width, this.height) * 0.23 * this.zoom;

    const atmosphere = ctx.createRadialGradient(cx, cy, earthRadius * 0.75, cx, cy, earthRadius * 1.45);
    atmosphere.addColorStop(0, 'rgba(56,189,248,0)');
    atmosphere.addColorStop(0.72, 'rgba(56,189,248,.04)');
    atmosphere.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius * 1.45, 0, Math.PI * 2);
    ctx.fill();

    const earth = ctx.createRadialGradient(cx - earthRadius * 0.35, cy - earthRadius * 0.35, earthRadius * 0.08, cx, cy, earthRadius);
    earth.addColorStop(0, '#A7F3D0');
    earth.addColorStop(0.12, '#38BDF8');
    earth.addColorStop(0.55, '#075985');
    earth.addColorStop(1, '#020617');
    ctx.fillStyle = earth;
    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(20, 83, 45, .78)';
    ctx.beginPath();
    ctx.moveTo(cx-earthRadius*.62, cy-earthRadius*.48);
    ctx.bezierCurveTo(cx-earthRadius*.28, cy-earthRadius*.68, cx-earthRadius*.08, cy-earthRadius*.22, cx-earthRadius*.28, cy-earthRadius*.08);
    ctx.bezierCurveTo(cx-earthRadius*.38, cy-earthRadius*.22, cx-earthRadius*.14, cy-earthRadius*.48, cx-earthRadius*.12, cy-earthRadius*.68);
    ctx.bezierCurveTo(cx-earthRadius*.3, cy-earthRadius*.72, cx-earthRadius*.52, cy-earthRadius*.58, cx-earthRadius*.62, cy-earthRadius*.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(34,197,94,.58)';
    ctx.beginPath();
    ctx.ellipse(cx-earthRadius*.05, cy-earthRadius*.36, earthRadius*.22, earthRadius*.09, .7, 0, Math.PI*2);
    ctx.ellipse(cx-earthRadius*.48, cy-earthRadius*.02, earthRadius*.18, earthRadius*.1, -.45, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,.15)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(
        cx-earthRadius*.75 + ((i * earthRadius*.48 + this.rotation * earthRadius) % (earthRadius*1.5)),
        cy-earthRadius*.42 + i*earthRadius*.26,
        earthRadius*.22,
        earthRadius*.025,
        -.1,
        0,
        Math.PI*2
      );
      ctx.fill();
    }

    const night = ctx.createLinearGradient(cx-earthRadius, cy, cx+earthRadius, cy);
    night.addColorStop(0, 'rgba(2,6,23,.72)');
    night.addColorStop(.72, 'rgba(2,6,23,.16)');
    night.addColorStop(1, 'rgba(2,6,23,0)');
    ctx.fillStyle = night;
    ctx.fillRect(cx-earthRadius, cy-earthRadius, earthRadius*1.7, earthRadius*2);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(134,239,172,.58)';
    ctx.lineWidth = Math.max(2, earthRadius * 0.025);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.sin(this.rotation + i * 2.1) * earthRadius * 0.15,
        cy + (i - 1) * earthRadius * 0.33,
        earthRadius * (0.28 + i * 0.08),
        earthRadius * 0.12,
        this.rotation * 0.08,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();

    for (const satellite of this.satellites) {
      if (this.running) satellite.phase += 0.002 * (90 / satellite.period);
      const inclination = satellite.inclination * Math.PI / 180;
      const orbitX = earthRadius * 1.55;
      const orbitY = orbitX * Math.sin(inclination) * 0.38;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation + inclination * 0.12);
      ctx.strokeStyle = `${satellite.color}66`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbitX, orbitY, 0, 0, Math.PI * 2);
      ctx.stroke();

      const angle = satellite.phase;
      const x = Math.cos(angle) * orbitX;
      const y = Math.sin(angle) * orbitY;
      ctx.fillStyle = satellite.color;
      ctx.shadowColor = satellite.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const moonAngle = (Date.now() * 0.00008) % (Math.PI * 2);
    const moonOrbitX = earthRadius * 1.9;
    const moonOrbitY = earthRadius * .62;
    const moonX = cx + Math.cos(moonAngle) * moonOrbitX;
    const moonY = cy + Math.sin(moonAngle) * moonOrbitY;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation * .12);
    ctx.strokeStyle = 'rgba(203,213,225,.24)';
    ctx.beginPath();
    ctx.ellipse(0, 0, moonOrbitX, moonOrbitY, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#CBD5E1';
    ctx.shadowColor = '#CBD5E1';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(moonX, moonY, Math.max(6, earthRadius*.045), 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(226,232,240,.72)';
    ctx.font = "600 9px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('MOON • SIMULATED', moonX, moonY+18);

    if (this.running) this.rotation += 0.0008;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }
}

window.SatelliteExplorer = SatelliteExplorer;
