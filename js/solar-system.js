/**
 * ORBITX - Solar System Interactive Explorer
 * Canvas-based orbital mechanics simulator featuring the Sun, 8 planets,
 * asteroid belt, pan/zoom camera, interactive selection, and telemetry HUD.
 */

class SolarSystemSimulator {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Simulation state
    this.isRunning = true;
    this.speedMultiplier = 1.0;
    this.showOrbits = true;
    this.showLabels = true;
    this.selectedPlanetId = null;
    this.cameraMode = 'system';
    this.hoveredPlanetId = null;
    this.textureImages = {};
    this.satelliteScreenPositions = [];
    this.earthSatelliteModels = [
      { id: 'iss-sim', name: 'ISS (SIM)', purpose: 'Orbital research laboratory', altitude: '420 km', inclination: '51.6 deg', phase: 0.15, radius: 1.9, color: '#38BDF8' },
      { id: 'eo-1-sim', name: 'EO-1 (SIM)', purpose: 'Earth observation', altitude: '705 km', inclination: '98.2 deg', phase: 2.35, radius: 2.45, color: '#A78BFA' },
      { id: 'nav-4-sim', name: 'NAV-4 (SIM)', purpose: 'Navigation constellation', altitude: '20,200 km', inclination: '55.0 deg', phase: 4.15, radius: 3.05, color: '#22D3EE' }
    ];

    // Camera transform (Pan & Zoom)
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      zoom: 1.0,
      targetZoom: 1.0,
      minZoom: 0.28,
      maxZoom: 3.5,
      orbitTilt: 0.62,
      rotation: 0
    };

    // Drag / Pan interaction state
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.cameraStart = { x: 0, y: 0 };

    // Planet models configured for clear visual legibility & relative physics
    this.planets = [
      {
        id: 'mercury',
        name: 'Mercury',
        color: '#A8A29E',
        glowColor: 'rgba(168, 162, 158, 0.6)',
        radius: 6,
        orbitDistance: 70,
        speed: 0.040, // Fastest
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'mercury'
      },
      {
        id: 'venus',
        name: 'Venus',
        color: '#EAB308',
        glowColor: 'rgba(234, 179, 8, 0.6)',
        radius: 9,
        orbitDistance: 105,
        speed: 0.024,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'venus'
      },
      {
        id: 'earth',
        name: 'Earth',
        color: '#38BDF8',
        glowColor: 'rgba(56, 189, 248, 0.7)',
        radius: 10,
        orbitDistance: 145,
        speed: 0.018,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'earth',
        hasMoon: true
      },
      {
        id: 'mars',
        name: 'Mars',
        color: '#EF4444',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        radius: 7,
        orbitDistance: 185,
        speed: 0.013,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'mars',
        moons: ['Phobos', 'Deimos']
      },
      {
        id: 'jupiter',
        name: 'Jupiter',
        color: '#F97316',
        glowColor: 'rgba(249, 115, 22, 0.7)',
        radius: 20,
        orbitDistance: 275,
        speed: 0.007,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'jupiter',
        bands: true,
        moons: ['Io', 'Europa', 'Ganymede']
      },
      {
        id: 'saturn',
        name: 'Saturn',
        color: '#FDE047',
        glowColor: 'rgba(253, 224, 71, 0.6)',
        radius: 16,
        orbitDistance: 345,
        speed: 0.0048,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'saturn',
        hasRings: true,
        moons: ['Titan']
      },
      {
        id: 'uranus',
        name: 'Uranus',
        color: '#22D3EE',
        glowColor: 'rgba(34, 211, 238, 0.6)',
        radius: 12,
        orbitDistance: 410,
        speed: 0.0032,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'uranus',
        hasRings: true,
        moons: ['Titania']
      },
      {
        id: 'neptune',
        name: 'Neptune',
        color: '#3B82F6',
        glowColor: 'rgba(59, 130, 246, 0.7)',
        radius: 12,
        orbitDistance: 470,
        speed: 0.0022,
        angle: Math.random() * Math.PI * 2,
        realDataKey: 'neptune',
        moons: ['Triton']
      }
    ];

    // Asteroid Belt Particles between Mars (185) and Jupiter (275)
    this.asteroids = [];
    for (let i = 0; i < 160; i++) {
      const dist = 215 + (Math.random() - 0.5) * 45;
      this.asteroids.push({
        orbitDistance: dist,
        angle: Math.random() * Math.PI * 2,
        speed: (0.010 * (215 / dist)) + (Math.random() * 0.001 - 0.0005),
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    // UI elements references
    this.tooltipEl = document.getElementById('solar-tooltip');
    this.telemetryPanelEl = document.getElementById('solar-telemetry');

    this.loadPlanetTextures();
    this.init();
  }

  init() {
    this.resize();
    this.setupEventListeners();
    this.setupUIControls();

    // Initial center camera
    this.camera.x = this.width / 2;
    this.camera.y = this.height / 2;
    this.camera.targetX = this.width / 2;
    this.camera.targetY = this.height / 2;

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  loadPlanetTextures() {
    const textures = {};
    if (window.PLANETS_DATA) {
      for (const planet of this.planets) {
        const texture = window.PLANETS_DATA[planet.id]?.textureImage;
        if (texture) textures[planet.id] = texture;
      }
    }
    for (const [id, url] of Object.entries(textures)) {
      const image = new Image();
      image.onload = () => { this.textureImages[id] = image; };
      image.src = url;
    }
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height || 680;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    if (!this.width || !this.height) return;

    const availableRadius = Math.max(80, Math.min(this.width, this.height) / 2 - 28);
    const fitZoom = Math.min(1, availableRadius / 470);
    this.baseZoom = Math.max(0.28, fitZoom);
    if (!this.hasResizedCamera) {
      this.camera.zoom = this.baseZoom;
      this.camera.targetZoom = this.baseZoom;
      this.hasResizedCamera = true;
    } else if (this.previousBaseZoom && Math.abs(this.previousBaseZoom - this.baseZoom) > 0.01) {
      const zoomRatio = this.camera.zoom / this.previousBaseZoom;
      this.camera.zoom = this.baseZoom * Math.max(0.9, Math.min(1.1, zoomRatio));
      this.camera.targetZoom = this.baseZoom;
    }
    this.previousBaseZoom = this.baseZoom;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
    });

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    // Mouse Drag Pan
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.cameraStart = { x: this.camera.targetX, y: this.camera.targetY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.camera.targetX = this.cameraStart.x + dx;
        this.camera.targetY = this.cameraStart.y + dy;
      } else {
        this.handleMouseMove(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Mouse Wheel Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      this.setZoom(this.camera.targetZoom * zoomFactor);
    }, { passive: false });

    // Click Detection on Planet or Sun
    this.canvas.addEventListener('click', (e) => {
      const satellite = this.getSatelliteAtMouse(e);
      if (satellite) {
        this.showSatellitePanel(satellite);
        return;
      }
      const clicked = this.getPlanetAtMouse(e);
      if (clicked) {
        this.selectPlanet(clicked.id);
      } else {
        // Check if Sun was clicked (center)
        const sunWorldX = this.camera.x;
        const sunWorldY = this.camera.y;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const distToCenter = Math.hypot(mouseX - sunWorldX, mouseY - sunWorldY);
        
        if (distToCenter < 35 * this.camera.zoom) {
          this.selectPlanet('sun');
        }
      }
    });
  }

  setupUIControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('solar-btn-play');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.isRunning = !this.isRunning;
        playPauseBtn.innerHTML = this.isRunning
          ? '<i class="fa-solid fa-pause"></i> Pause'
          : '<i class="fa-solid fa-play"></i> Play';
        playPauseBtn.classList.toggle('active', this.isRunning);
      });
    }

    // Speed Slider
    const speedSlider = document.getElementById('solar-speed-slider');
    const speedDisplay = document.getElementById('solar-speed-val');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.speedMultiplier = parseFloat(e.target.value);
        if (speedDisplay) speedDisplay.textContent = `${this.speedMultiplier.toFixed(1)}x`;
      });
    }

    // Reset View Button
    const resetBtn = document.getElementById('solar-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetView();
      });
    }

    // Toggle Orbits Button
    const orbitsBtn = document.getElementById('solar-btn-orbits');
    if (orbitsBtn) {
      orbitsBtn.addEventListener('click', () => {
        this.showOrbits = !this.showOrbits;
        orbitsBtn.classList.toggle('active', this.showOrbits);
      });
    }

    // Toggle Labels Button
    const labelsBtn = document.getElementById('solar-btn-labels');
    if (labelsBtn) {
      labelsBtn.addEventListener('click', () => {
        this.showLabels = !this.showLabels;
        labelsBtn.classList.toggle('active', this.showLabels);
      });
    }

    const systemViewBtn = document.getElementById('solar-view-system');
    const earthViewBtn = document.getElementById('solar-view-earth');
    systemViewBtn?.addEventListener('click', () => this.setCameraMode('system'));
    earthViewBtn?.addEventListener('click', () => this.setCameraMode('earth'));

    const fullscreenBtn = document.getElementById('solar-btn-fullscreen');
    const wrapper = document.querySelector('.solar-system-wrapper');
    if (fullscreenBtn && wrapper) {
      fullscreenBtn.addEventListener('click', async () => {
        try {
          if (!document.fullscreenElement) {
              await wrapper.requestFullscreen();
            } else {
              await document.exitFullscreen();
            }
          } catch (error) {
            wrapper.classList.toggle('solar-fullscreen-fallback');
          }
      });
      document.addEventListener('fullscreenchange', () => {
        const active = Boolean(document.fullscreenElement);
        fullscreenBtn.classList.toggle('active', active);
        fullscreenBtn.innerHTML = active
          ? '<i class="fa-solid fa-compress"></i><span>Exit</span>'
          : '<i class="fa-solid fa-expand"></i><span>Fullscreen</span>';
        setTimeout(() => this.resize(), 60);
      });
    }

    document.getElementById('solar-camera-in')?.addEventListener('click', () => this.setZoom(this.camera.targetZoom * 1.22));
    document.getElementById('solar-camera-out')?.addEventListener('click', () => this.setZoom(this.camera.targetZoom / 1.22));
    document.getElementById('solar-camera-left')?.addEventListener('click', () => { this.camera.rotation -= 0.18; });
    document.getElementById('solar-camera-right')?.addEventListener('click', () => { this.camera.rotation += 0.18; });
    document.getElementById('solar-satellite-close')?.addEventListener('click', () => {
      document.getElementById('solar-satellite-panel')?.classList.remove('visible');
    });

    // Planet Quick Select Tabs
    const tabs = document.querySelectorAll('.planet-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const planetId = tab.getAttribute('data-planet');
        this.selectPlanet(planetId);
      });
    });

    // Close Telemetry Card Button
    const closeTelemetryBtn = document.getElementById('solar-telemetry-close');
    if (closeTelemetryBtn) {
      closeTelemetryBtn.addEventListener('click', () => {
        if (this.telemetryPanelEl) this.telemetryPanelEl.style.display = 'none';
        this.selectedPlanetId = null;
        this.updateActiveTab(null);
      });
    }

    // Deep Dive Button (Scrolls to Section 2 and focuses that planet)
    const deepDiveBtn = document.getElementById('solar-telemetry-deepdive');
    if (deepDiveBtn) {
      deepDiveBtn.addEventListener('click', () => {
        if (this.selectedPlanetId && window.OrbitxApp) {
          window.OrbitxApp.openPlanetInExplorer(this.selectedPlanetId);
        }
      });
    }
  }

  setZoom(newZoom) {
    this.camera.targetZoom = Math.min(Math.max(newZoom, this.camera.minZoom), this.camera.maxZoom);
  }

  resetView() {
    this.camera.targetX = this.width / 2;
    this.camera.targetY = this.height / 2;
    this.camera.targetZoom = this.baseZoom || 1;
    this.camera.rotation = 0;
    this.selectedPlanetId = null;
    this.cameraMode = 'system';
    document.getElementById('solar-view-system')?.classList.add('active');
    document.getElementById('solar-view-earth')?.classList.remove('active');
    this.updateActiveTab(null);
    if (this.telemetryPanelEl) this.telemetryPanelEl.style.display = 'none';
  }

  setCameraMode(mode) {
    const systemViewBtn = document.getElementById('solar-view-system');
    const earthViewBtn = document.getElementById('solar-view-earth');
    this.cameraMode = mode;
    systemViewBtn?.classList.toggle('active', mode === 'system');
    earthViewBtn?.classList.toggle('active', mode === 'earth');

    if (mode === 'earth') {
      this.selectedPlanetId = 'earth';
      this.updateActiveTab('earth');
      const earthData = window.PLANETS_DATA?.earth;
      if (earthData) this.renderTelemetryPanel(earthData);
      this.camera.targetZoom = Math.max(3.3, this.camera.minZoom);
    } else {
      this.selectedPlanetId = null;
      this.updateActiveTab(null);
      this.camera.targetX = this.width / 2;
      this.camera.targetY = this.height / 2;
      this.camera.targetZoom = this.baseZoom || 1;
      if (this.telemetryPanelEl) this.telemetryPanelEl.style.display = 'none';
    }
  }

    getOrbitPosition(planet) {
      const angle = planet.angle + this.camera.rotation;
      return {
        x: this.camera.x + Math.cos(angle) * planet.orbitDistance * this.camera.zoom,
        y: this.camera.y + Math.sin(angle) * planet.orbitDistance * this.camera.zoom * this.camera.orbitTilt
      };
    }

    showSatellitePanel(satellite) {
      const panel = document.getElementById('solar-satellite-panel');
      if (!panel) return;
      document.getElementById('solar-satellite-name').textContent = satellite.name;
      document.getElementById('solar-satellite-purpose').textContent = satellite.purpose;
      document.getElementById('solar-satellite-altitude').textContent = satellite.altitude;
      document.getElementById('solar-satellite-inclination').textContent = satellite.inclination;
      panel.classList.add('visible');
    }

  getPlanetAtMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const planet of this.planets) {
      const position = this.getOrbitPosition(planet);
      const px = position.x;
      const py = position.y;
      const hitRadius = Math.max(planet.radius * this.camera.zoom + 10, 16);

      const dist = Math.hypot(mouseX - px, mouseY - py);
      if (dist <= hitRadius) {
        return planet;
      }
    }
    return null;
  }

  getSatelliteAtMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return this.satelliteScreenPositions.find(satellite =>
      Math.hypot(x - satellite.x, y - satellite.y) <= 18
    )?.model || null;
  }

  handleMouseMove(e) {
    const planet = this.getPlanetAtMouse(e);
    if (planet) {
      this.hoveredPlanetId = planet.id;
      this.canvas.style.cursor = 'pointer';
      this.showTooltip(planet, e);
    } else {
      this.hoveredPlanetId = null;
      this.canvas.style.cursor = 'grab';
      this.hideTooltip();
    }
  }

  showTooltip(planet, e) {
    if (!this.tooltipEl) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const data = window.PLANETS_DATA ? window.PLANETS_DATA[planet.id] : null;
    const distAu = data ? `${data.distanceFromSunAu} AU` : `${planet.orbitDistance} px`;
    const speed = data ? `${data.orbitalSpeedKmS} km/s` : 'Orbital';

    this.tooltipEl.innerHTML = `
      <div class="solar-tooltip-title">${planet.name}</div>
      <div class="solar-tooltip-row"><span>Distance:</span> <span class="solar-tooltip-val">${distAu}</span></div>
      <div class="solar-tooltip-row"><span>Velocity:</span> <span class="solar-tooltip-val">${speed}</span></div>
    `;

    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
    this.tooltipEl.style.display = 'block';
  }

  hideTooltip() {
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
  }

  selectPlanet(planetId) {
    this.selectedPlanetId = planetId;
    this.updateActiveTab(planetId);

    const data = window.PLANETS_DATA ? window.PLANETS_DATA[planetId] : null;
    if (!data) return;

    // Center camera on planet (or Sun)
    if (planetId === 'sun') {
      this.camera.targetX = this.width / 2;
      this.camera.targetY = this.height / 2;
      this.camera.targetZoom = 1.3;
    } else {
      const planet = this.planets.find(p => p.id === planetId);
      if (planet) {
        // Target planet position offset to center
        this.camera.targetZoom = 1.6;
      }
    }

    // Populate Telemetry Panel
    this.renderTelemetryPanel(data);
  }

  updateActiveTab(planetId) {
    const tabs = document.querySelectorAll('.planet-tab-btn');
    tabs.forEach(tab => {
      const tabPlanet = tab.getAttribute('data-planet');
      tab.classList.toggle('active', tabPlanet === planetId);
    });
  }

  renderTelemetryPanel(data) {
    if (!this.telemetryPanelEl) return;

    const nameEl = document.getElementById('solar-telemetry-name');
    const taglineEl = document.getElementById('solar-telemetry-tagline');
    const circleEl = document.getElementById('solar-telemetry-circle');
    const distEl = document.getElementById('solar-telemetry-dist');
    const diamEl = document.getElementById('solar-telemetry-diam');
    const periodEl = document.getElementById('solar-telemetry-period');
    const tempEl = document.getElementById('solar-telemetry-temp');

    if (nameEl) nameEl.textContent = data.name;
    if (taglineEl) taglineEl.textContent = data.tagline;
    if (circleEl) {
      circleEl.style.background = data.color;
      circleEl.style.boxShadow = `0 0 12px ${data.color}`;
    }
    if (distEl) distEl.textContent = data.distanceFromSunAu > 0 ? `${data.distanceFromSunAu} AU` : '0 AU (Center)';
    if (diamEl) diamEl.textContent = `${data.diameterKm.toLocaleString()} km`;
    if (periodEl) periodEl.textContent = data.orbitalPeriodDays > 0 ? `${data.orbitalPeriodDays} d` : 'N/A';
    if (tempEl) tempEl.textContent = `${data.surfaceTempC} °C`;

    this.telemetryPanelEl.style.display = 'block';
  }

  animate() {
    // Smooth camera interpolation
    this.camera.x += (this.camera.targetX - this.camera.x) * 0.08;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.08;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;

    // Follow selected planet smoothly if one is selected
    if (this.selectedPlanetId && this.selectedPlanetId !== 'sun') {
      const selected = this.planets.find(p => p.id === this.selectedPlanetId);
      if (selected && !this.isDragging) {
        const px = Math.cos(selected.angle + this.camera.rotation) * (selected.orbitDistance * this.camera.zoom);
        const py = Math.sin(selected.angle + this.camera.rotation) * (selected.orbitDistance * this.camera.zoom * this.camera.orbitTilt);
        this.camera.targetX = (this.width / 2) - px;
        this.camera.targetY = (this.height / 2) - py;
      }
    }

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update Planet Angles if running
    if (this.isRunning) {
      for (const planet of this.planets) {
        planet.angle += planet.speed * 0.5 * this.speedMultiplier;
      }
      for (const asteroid of this.asteroids) {
        asteroid.angle += asteroid.speed * 0.5 * this.speedMultiplier;
      }
    }

    // 1. Draw Orbits (if enabled)
    if (this.showOrbits) {
      for (const planet of this.planets) {
        const orbitRadius = planet.orbitDistance * this.camera.zoom;
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(1, this.camera.orbitTilt);
        this.ctx.arc(0, 0, orbitRadius, 0, Math.PI * 2);
        this.ctx.restore();
        this.ctx.strokeStyle = (planet.id === this.selectedPlanetId || planet.id === this.hoveredPlanetId)
          ? 'rgba(56, 189, 248, 0.45)'
          : 'rgba(37, 99, 235, 0.18)';
        this.ctx.lineWidth = (planet.id === this.selectedPlanetId) ? 1.8 : 1;
        this.ctx.setLineDash([4, 4]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    }

    // 2. Draw Asteroid Belt
    for (const asteroid of this.asteroids) {
      const ax = this.camera.x + Math.cos(asteroid.angle) * (asteroid.orbitDistance * this.camera.zoom);
      const ay = this.camera.y + Math.sin(asteroid.angle) * (asteroid.orbitDistance * this.camera.zoom * this.camera.orbitTilt);

      this.ctx.fillStyle = `rgba(148, 163, 184, ${asteroid.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(ax, ay, asteroid.size * Math.max(this.camera.zoom * 0.8, 0.5), 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Draw The Sun (Thermonuclear Center)
    const sunRadius = 26 * this.camera.zoom;
    const sunGrad = this.ctx.createRadialGradient(
      this.camera.x, this.camera.y, sunRadius * 0.2,
      this.camera.x, this.camera.y, sunRadius * 2.2
    );
    sunGrad.addColorStop(0, '#FFFFFF');
    sunGrad.addColorStop(0.25, '#FFF7D6');
    sunGrad.addColorStop(0.5, '#FDB813');
    sunGrad.addColorStop(0.8, 'rgba(255, 98, 0, 0.4)');
    sunGrad.addColorStop(1, 'rgba(255, 98, 0, 0)');

    this.ctx.fillStyle = sunGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.camera.x, this.camera.y, sunRadius * 2.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Solid Sun Core
    this.ctx.fillStyle = '#FFB703';
    this.ctx.beginPath();
    this.ctx.arc(this.camera.x, this.camera.y, sunRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Sun Label
    if (this.showLabels) {
      this.ctx.font = `600 ${Math.max(11 * this.camera.zoom, 10)}px 'Space Grotesk', sans-serif`;
      this.ctx.fillStyle = '#FDB813';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('SUN', this.camera.x, this.camera.y + sunRadius + 16);
    }

    // 4. Draw Planets & Rings
    for (const planet of this.planets) {
      const position = this.getOrbitPosition(planet);
      const px = position.x;
      const py = position.y;
      const pr = Math.max(planet.radius * this.camera.zoom, 4);

      // Selected / Hovered Highlight Reticle
      if (planet.id === this.selectedPlanetId || planet.id === this.hoveredPlanetId) {
        this.ctx.beginPath();
        this.ctx.arc(px, py, pr + 8, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'var(--accent-cyan, #38BDF8)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Corner crosshair ticks
        this.drawCrosshairTicks(px, py, pr + 12);
      }

      // Planet Glow
      this.ctx.save();
      this.ctx.shadowColor = planet.glowColor;
      this.ctx.shadowBlur = 15;

      // Planet Body
      this.ctx.fillStyle = planet.color;
      this.ctx.beginPath();
      this.ctx.arc(px, py, pr, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      const texture = this.textureImages[planet.id];
      if (texture) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(px, py, pr, 0, Math.PI * 2);
        this.ctx.clip();
        const textureWidth = pr * 2;
        let offset = -((planet.angle * 9) % textureWidth);
        offset = offset < -textureWidth / 2 ? offset + textureWidth : offset;
        for (let x = px - pr + offset - textureWidth; x < px + pr + textureWidth; x += textureWidth) {
          this.ctx.drawImage(texture, x, py - pr, textureWidth, pr * 2);
        }
        this.ctx.restore();
      }

      // Atmospheric / Shadow Shading
      const shadowGrad = this.ctx.createRadialGradient(
        px - pr * 0.3, py - pr * 0.3, pr * 0.1,
        px, py, pr
      );
      shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');

      this.ctx.fillStyle = shadowGrad;
      this.ctx.beginPath();
      this.ctx.arc(px, py, pr, 0, Math.PI * 2);
      this.ctx.fill();

      // Saturn / Uranus Rings
      if (planet.hasRings) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(px, py, pr * 2.2, pr * 0.6, Math.PI / 6, 0, Math.PI * 2);
        this.ctx.strokeStyle = planet.id === 'saturn' ? 'rgba(253, 224, 71, 0.65)' : 'rgba(34, 211, 238, 0.4)';
        this.ctx.lineWidth = Math.max(pr * 0.35, 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Earth's Moon
      if (planet.hasMoon) {
        const moonDist = pr + 8;
        const moonAngle = planet.angle * 8; // Moon orbits Earth ~13 times per year
        const mx = px + Math.cos(moonAngle) * moonDist;
        const my = py + Math.sin(moonAngle) * moonDist;

        this.ctx.fillStyle = '#CBD5E1';
        this.ctx.beginPath();
        this.ctx.arc(mx, my, Math.max(pr * 0.28, 2), 0, Math.PI * 2);
        this.ctx.fill();

        // Moon and simulated Earth-orbiting satellite labels.
        if (this.showLabels) {
          this.ctx.font = "500 9px 'Space Grotesk', sans-serif";
          this.ctx.fillStyle = '#CBD5E1';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('Moon', mx, my + 10);
        }

        this.satelliteScreenPositions = [];
        for (const satellite of this.earthSatelliteModels) {
          const phase = satellite.phase + planet.angle * (satellite.id === 'iss-sim' ? 5.4 : satellite.id === 'eo-1-sim' ? 3.7 : 2.8);
          const orbitRadius = pr * satellite.radius;
          this.ctx.save();
          this.ctx.translate(px, py);
          this.ctx.rotate(this.camera.rotation * 0.45);
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, orbitRadius, orbitRadius * (0.32 + satellite.radius * 0.025), 0, 0, Math.PI * 2);
          this.ctx.strokeStyle = `${satellite.color}55`;
          this.ctx.lineWidth = 1;
          this.ctx.setLineDash([3, 4]);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          this.ctx.restore();

          const sx = px + Math.cos(phase) * orbitRadius;
          const sy = py + Math.sin(phase) * orbitRadius * (0.32 + satellite.radius * 0.025);
          this.satelliteScreenPositions.push({ x: sx, y: sy, model: satellite });
          this.ctx.save();
          this.ctx.shadowColor = satellite.color;
          this.ctx.shadowBlur = 10;
          this.ctx.translate(sx, sy);
          this.ctx.rotate(phase + 0.4);
          this.ctx.fillStyle = satellite.color;
          this.ctx.fillRect(-3, -2, 6, 4);
          this.ctx.fillStyle = '#93C5FD';
          this.ctx.fillRect(-9, -2, 5, 4);
          this.ctx.fillRect(4, -2, 5, 4);
          this.ctx.strokeStyle = satellite.color;
          this.ctx.restore();
          if (this.showLabels && (this.cameraMode === 'earth' || this.camera.zoom > 1.25)) {
            this.ctx.font = "600 8px 'JetBrains Mono', monospace";
            this.ctx.fillStyle = satellite.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(satellite.name, sx, sy - 7);
          }
        }
      }

      // Planet Label
      if (planet.moons) {
        planet.moons.forEach((moonName, index) => {
          const moonAngle = planet.angle * (7 + index * 1.3) + index * 1.9;
          const moonDistance = pr * (2.1 + index * 0.48);
          const mx = px + Math.cos(moonAngle) * moonDistance;
          const my = py + Math.sin(moonAngle) * moonDistance * 0.55;
          this.ctx.fillStyle = '#CBD5E1';
          this.ctx.beginPath();
          this.ctx.arc(mx, my, Math.max(pr * 0.18, 1.5), 0, Math.PI * 2);
          this.ctx.fill();
          if (this.showLabels && this.camera.zoom > 1.1) {
            this.ctx.font = "500 8px 'JetBrains Mono', monospace";
            this.ctx.fillStyle = '#CBD5E1';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(moonName, mx, my - 5);
          }
        });
      }

      if (this.showLabels) {
        this.ctx.font = `500 ${Math.max(10 * this.camera.zoom, 9)}px 'Space Grotesk', sans-serif`;
        this.ctx.fillStyle = (planet.id === this.selectedPlanetId) ? '#38BDF8' : '#F5F7FF';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(planet.name, px, py + pr + 14);
      }
    }

    requestAnimationFrame(this.animate);
  }

  drawCrosshairTicks(x, y, r) {
    const tickLen = 4;
    this.ctx.strokeStyle = '#38BDF8';
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    // Top
    this.ctx.moveTo(x, y - r);
    this.ctx.lineTo(x, y - r - tickLen);
    // Bottom
    this.ctx.moveTo(x, y + r);
    this.ctx.lineTo(x, y + r + tickLen);
    // Left
    this.ctx.moveTo(x - r, y);
    this.ctx.lineTo(x - r - tickLen, y);
    // Right
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + r + tickLen, y);
    this.ctx.stroke();
  }
}

// Global initialization
window.SolarSystemSimulator = SolarSystemSimulator;
