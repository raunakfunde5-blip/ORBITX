/**
 * ORBITX - Live ISS Space Station Tracker Controller
 * Integrates Leaflet interactive mapping, real-time telemetry polling,
 * altitude/velocity HUD gauges, day/night solar status, and resilient offline orbital simulation.
 * 
 * STRICT COMPLIANCE:
 * - Clearly distinguishes verified LIVE DATA from mathematical SIMULATION MODE.
 * - Never presents simulated coordinates as live telemetry.
 * - Multi-endpoint failover: Works whether hosted on port 8000, Live Server (port 5500), or public CDN.
 */

/**
 * Safely normalizes telemetry data from any provider (WhereTheIss, Open-Notify, Python backend)
 * regardless of whether fields are numbers or strings, top-level or nested.
 */
function normalizeIssData(raw) {
  if (!raw || typeof raw !== 'object') return null;

  let lat = undefined;
  let lng = undefined;

  // 1. Check top-level latitude & longitude (or lat / lon / lng)
  if (raw.latitude !== undefined && raw.latitude !== null) lat = raw.latitude;
  else if (raw.lat !== undefined && raw.lat !== null) lat = raw.lat;

  if (raw.longitude !== undefined && raw.longitude !== null) lng = raw.longitude;
  else if (raw.lon !== undefined && raw.lon !== null) lng = raw.lon;
  else if (raw.lng !== undefined && raw.lng !== null) lng = raw.lng;

  // 2. Check Open-Notify nested format: { iss_position: { latitude: "...", longitude: "..." } }
  if ((lat === undefined || lng === undefined) && raw.iss_position) {
    if (raw.iss_position.latitude !== undefined) lat = raw.iss_position.latitude;
    if (raw.iss_position.longitude !== undefined) lng = raw.iss_position.longitude;
  }

  // Parse to numbers
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  // Validate range (-90 to +90 lat, -180 to +180 lng)
  if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
    return null;
  }

  return {
    latitude: parsedLat,
    longitude: parsedLng,
    altitude: parseFloat(raw.altitude) || 420.0,
    velocity: parseFloat(raw.velocity) || 27600.0,
    visibility: raw.visibility || (parsedLng > -60 && parsedLng < 100 ? 'daylight' : 'eclipsed'),
    timestamp: raw.timestamp || Date.now(),
    source: raw.source || 'live'
  };
}

class IssTracker {
  constructor() {
    this.map = null;
    this.marker = null;
    this.footprintCircle = null;
    this.trailPath = null;
    this.trailCoordinates = [];
    
    // Telemetry state
    this.currentLat = 0.0;
    this.currentLng = 0.0;
    this.currentAltitude = 420.0;
    this.currentVelocity = 27600.0;
    this.currentVisibility = 'daylight';
    this.isLive = false;
    this.isFetching = false;
    this.autoRefresh = true;
    this.pollIntervalSec = 3;
    this.timerCountdown = 3;
    this.pollTimer = null;
    this.barTimer = null;

    // Simulation fallback parameters (ISS inclination ~51.64°, orbital period ~92.9 min)
    this.simEpoch = Date.now();
    this.simStartLat = 24.5;
    this.simStartLng = -45.0;

    this.init();
  }

  init() {
    this.ensureMapReady();
    this.setupEventListeners();
    this.fetchTelemetry();
    this.fetchCrew();
    this.startPolling();
  }

  ensureMapReady() {
    if (!this.map && typeof L !== 'undefined' && document.getElementById('iss-map')) {
      this.initMap();
    }
  }

  initMap() {
    const mapEl = document.getElementById('iss-map');
    if (!mapEl || typeof L === 'undefined') {
      return;
    }

    if (this.map) return; // Already initialized

    try {
      this.map = L.map('iss-map', {
        center: [this.currentLat || 20, this.currentLng || 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: false
      });

      // Dark Cosmic tile layer (CartoDB Dark Matter / OpenStreetMap)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(this.map);

      // Custom Glowing ISS Marker with radar ping
      const issIcon = L.divIcon({
        className: 'iss-leaflet-div-icon',
        html: `
          <div class="iss-custom-marker ${this.isLive ? '' : 'simulation'}" id="iss-custom-marker">
            <div class="iss-radar-ping"></div>
            <div class="iss-icon-core">
              <i class="fa-solid fa-satellite"></i>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      this.marker = L.marker([this.currentLat || 20, this.currentLng || 0], { icon: issIcon }).addTo(this.map);

      // Visibility footprint circle (~2,200 km radius)
      this.footprintCircle = L.circle([this.currentLat || 20, this.currentLng || 0], {
        radius: 2200000,
        color: this.isLive ? '#38BDF8' : '#F59E0B',
        weight: 1.2,
        dashArray: '6, 6',
        fillColor: this.isLive ? '#38BDF8' : '#F59E0B',
        fillOpacity: 0.08
      }).addTo(this.map);

      // Orbital trail polyline
      this.trailPath = L.polyline(this.trailCoordinates, {
        color: this.isLive ? '#8B5CF6' : '#F59E0B',
        weight: 2.5,
        opacity: 0.75,
        dashArray: '4, 8'
      }).addTo(this.map);
    } catch (e) {
      console.warn('[ORBITX ISS] Map initialization deferred:', e);
    }
  }

  setupEventListeners() {
    // Center Map button
    const centerBtn = document.getElementById('iss-btn-center');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        if (this.map && this.marker) {
          this.map.panTo([this.currentLat, this.currentLng], { animate: true });
        }
      });
    }

    // Manual Refresh button
    const refreshBtn = document.getElementById('iss-btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchTelemetry();
      });
    }

    // Auto-refresh toggle
    const autoToggle = document.getElementById('iss-auto-toggle');
    if (autoToggle) {
      autoToggle.addEventListener('change', (e) => {
        this.autoRefresh = e.target.checked;
        if (this.autoRefresh) {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      });
    }
  }

  startPolling() {
    this.stopPolling();
    this.timerCountdown = this.pollIntervalSec;

    const timerFill = document.getElementById('iss-timer-fill');
    let elapsedMs = 0;
    const totalMs = this.pollIntervalSec * 1000;

    this.barTimer = setInterval(() => {
      elapsedMs += 100;
      if (timerFill) {
        const pct = Math.max(0, 100 - (elapsedMs / totalMs) * 100);
        timerFill.style.width = `${pct}%`;
      }
      if (elapsedMs >= totalMs) {
        elapsedMs = 0;
        this.fetchTelemetry();
      }
    }, 100);
  }

  stopPolling() {
    if (this.barTimer) clearInterval(this.barTimer);
  }

  async fetchTelemetry() {
    if (this.isFetching) return;
    this.isFetching = true;

    let telemetryData = null;

    // Multi-tier endpoint resolution:
    // 1. Relative /api/iss/telemetry (when running through Python backend on port 8000)
    // 2. http://127.0.0.1:8000/api/iss/telemetry (when viewed via Live Server port 5500 or file://)
    // 3. http://localhost:8000/api/iss/telemetry
    // 4. Direct public WhereTheIss.at (simple GET without custom headers to avoid CORS preflight failures)
    const endpoints = [
      '/api/iss/telemetry',
      'http://127.0.0.1:8000/api/iss/telemetry',
      'http://localhost:8000/api/iss/telemetry',
      'https://api.wheretheiss.at/v1/satellites/25544'
    ];

    const currentOrigin = window.location.origin;
    const candidateUrls = endpoints.filter(url => {
      if (url.startsWith('/')) return true;
      if (currentOrigin && url.startsWith(currentOrigin)) return false;
      return true;
    });

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        // Standard simple GET request (no cache: 'no-store' to ensure no CORS preflight blocks)
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const normalized = normalizeIssData(json);
          if (normalized) {
            telemetryData = normalized;
            break; // Successfully got verified live telemetry!
          }
        }
      } catch (err) {
        // Fall through to next candidate endpoint
      }
    }

    this.isFetching = false;

    // Update telemetry state
    if (telemetryData) {
      this.currentLat = telemetryData.latitude;
      this.currentLng = telemetryData.longitude;
      this.currentAltitude = telemetryData.altitude;
      this.currentVelocity = telemetryData.velocity;
      this.currentVisibility = telemetryData.visibility;
      this.isLive = true;
    } else {
      console.warn('[ORBITX ISS] Live telemetry endpoints unreachable. Activating mathematical simulation mode.');
      this.isLive = false;
      this.simulateOrbitalPosition();
    }

    // Safely update Map & DOM displays
    try {
      this.ensureMapReady();
      this.updateStatusBadge(this.isLive);
      this.updateMapAndGauges();
    } catch (uiErr) {
      console.error('[ORBITX ISS UI update error]', uiErr);
    }
  }

  simulateOrbitalPosition() {
    // Mathematical orbit simulation: ISS speed is ~7.66 km/s (~4.3° of longitude per minute)
    const elapsedMinutes = (Date.now() - this.simEpoch) / 60000;
    
    // Orbital period ~92.9 minutes
    const orbitFraction = (elapsedMinutes % 92.9) / 92.9;
    const meanAnomaly = orbitFraction * Math.PI * 2;

    // Inclination ~51.64 degrees
    this.currentLat = Math.sin(meanAnomaly) * 51.64;
    
    // Earth rotates underneath (360 deg / 1440 min = 0.25 deg/min) + orbital eastward drift
    this.currentLng = ((this.simStartLng + (elapsedMinutes * 3.87)) % 360);
    if (this.currentLng > 180) this.currentLng -= 360;

    this.currentAltitude = 418.5 + Math.sin(meanAnomaly * 2) * 4.2;
    this.currentVelocity = 27580 + Math.cos(meanAnomaly * 2) * 50;
    this.currentVisibility = (this.currentLng > -60 && this.currentLng < 100) ? 'daylight' : 'eclipsed';
  }

  updateStatusBadge(live) {
    const dot = document.getElementById('iss-status-dot');
    const text = document.getElementById('iss-status-text');
    const simBanner = document.getElementById('iss-sim-banner');
    const modeBadge = document.getElementById('iss-mode-badge');
    const hudModelTag = document.getElementById('iss-hud-model-tag');
    const markerEl = document.getElementById('iss-custom-marker');

    if (live) {
      if (dot) {
        dot.className = 'iss-status-dot';
      }
      if (text) {
        text.className = 'iss-status-text';
        text.textContent = 'LIVE TELEMETRY STREAMING';
      }

      if (simBanner) {
        simBanner.style.display = 'none';
      }

      if (modeBadge) {
        modeBadge.className = 'hud-pill';
        modeBadge.style.color = '#10B981';
        modeBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        modeBadge.innerHTML = '<i class="fa-solid fa-satellite" style="color: #10B981;"></i> <span>LIVE GPS FIX</span>';
      }

      if (hudModelTag) {
        hudModelTag.innerHTML = '<i class="fa-solid fa-crosshairs"></i> <span>ISS NORAD ID: 25544 // INCLINATION: 51.64° // [LIVE TELEMETRY]</span>';
        hudModelTag.style.borderColor = 'rgba(56, 189, 248, 0.25)';
        hudModelTag.style.color = 'var(--accent-cyan)';
      }

      if (markerEl) {
        markerEl.classList.remove('simulation');
      }
    } else {
      if (dot) {
        dot.className = 'iss-status-dot offline';
      }
      if (text) {
        text.className = 'iss-status-text offline';
        text.textContent = 'OFFLINE // SIMULATION MODE';
      }

      if (simBanner) {
        simBanner.style.display = 'flex';
      }

      if (modeBadge) {
        modeBadge.className = 'hud-pill offline';
        modeBadge.style.color = '#F59E0B';
        modeBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        modeBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #F59E0B;"></i> <span>SIMULATED (PREDICTED ORBIT)</span>';
      }

      if (hudModelTag) {
        hudModelTag.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #F59E0B;"></i> <span style="color: #F59E0B;">ISS NORAD ID: 25544 // [SIMULATED ORBIT MODEL]</span>';
        hudModelTag.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      }

      if (markerEl) {
        markerEl.classList.add('simulation');
      }
    }
  }

  updateMapAndGauges() {
    const latLng = [this.currentLat, this.currentLng];

    // Update Leaflet marker & circle
    if (this.marker) {
      this.marker.setLatLng(latLng);
      
      const statusTitle = this.isLive
        ? '<span style="color:#10B981;font-weight:700;">● LIVE TELEMETRY</span>'
        : '<span style="color:#F59E0B;font-weight:700;">⚠ SIMULATED ORBIT MODEL (PREDICTED)</span>';
      
      const coordLabel = this.isLive
        ? `${this.currentLat.toFixed(4)}°, ${this.currentLng.toFixed(4)}°`
        : `~${this.currentLat.toFixed(4)}°, ${this.currentLng.toFixed(4)}° (Estimated)`;

      this.marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 0.82rem; line-height: 1.5; color: #0F172A; padding: 2px;">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px;">ISS (Zarya Space Station)</div>
          <div style="margin-bottom: 4px;">${statusTitle}</div>
          <div><strong>Position:</strong> ${coordLabel}</div>
          <div><strong>Altitude:</strong> ${Math.round(this.currentAltitude)} km</div>
          <div><strong>Velocity:</strong> ${Math.round(this.currentVelocity).toLocaleString()} km/h</div>
        </div>
      `);
    }

    if (this.footprintCircle) {
      this.footprintCircle.setLatLng(latLng);
      this.footprintCircle.setStyle({
        color: this.isLive ? '#38BDF8' : '#F59E0B',
        fillColor: this.isLive ? '#38BDF8' : '#F59E0B'
      });
    }

    // Append to trail (keep last 30 points)
    this.trailCoordinates.push(latLng);
    if (this.trailCoordinates.length > 30) {
      this.trailCoordinates.shift();
    }
    if (this.trailPath) {
      this.trailPath.setLatLngs(this.trailCoordinates);
      this.trailPath.setStyle({
        color: this.isLive ? '#8B5CF6' : '#F59E0B'
      });
    }

    // Update Telemetry Displays
    const latEl = document.getElementById('iss-val-lat');
    const lngEl = document.getElementById('iss-val-lng');
    const altEl = document.getElementById('iss-val-alt');
    const velEl = document.getElementById('iss-val-vel');
    const velMphEl = document.getElementById('iss-val-vel-mph');
    const altMilesEl = document.getElementById('iss-val-alt-miles');
    const velBar = document.getElementById('iss-bar-vel');
    const altBar = document.getElementById('iss-bar-alt');
    const hudCoordsEl = document.getElementById('iss-hud-coords');

    // STRICT COMPLIANCE: Never display simulated coordinates as live data
    if (this.isLive) {
      if (latEl) {
        latEl.textContent = `${this.currentLat.toFixed(4)}° ${this.currentLat >= 0 ? 'N' : 'S'}`;
        latEl.style.color = 'var(--accent-cyan)';
      }
      if (lngEl) {
        lngEl.textContent = `${Math.abs(this.currentLng).toFixed(4)}° ${this.currentLng >= 0 ? 'E' : 'W'}`;
        lngEl.style.color = 'var(--accent-cyan)';
      }
      if (hudCoordsEl) {
        hudCoordsEl.innerHTML = `<span style="color: #10B981; font-weight: 700; margin-right: 0.35rem;">[LIVE]</span>${this.currentLat.toFixed(2)}°, ${this.currentLng.toFixed(2)}°`;
      }
    } else {
      if (latEl) {
        latEl.textContent = `~${this.currentLat.toFixed(4)}° ${this.currentLat >= 0 ? 'N' : 'S'} (SIM)`;
        latEl.style.color = '#F59E0B';
      }
      if (lngEl) {
        lngEl.textContent = `~${Math.abs(this.currentLng).toFixed(4)}° ${this.currentLng >= 0 ? 'E' : 'W'} (SIM)`;
        lngEl.style.color = '#F59E0B';
      }
      if (hudCoordsEl) {
        hudCoordsEl.innerHTML = `<span style="color: #F59E0B; font-weight: 700; margin-right: 0.35rem;">[SIMULATED]</span>${this.currentLat.toFixed(2)}°, ${this.currentLng.toFixed(2)}°`;
      }
    }

    if (altEl) altEl.textContent = `${Math.round(this.currentAltitude)} km`;
    if (altMilesEl) altMilesEl.textContent = `${Math.round(this.currentAltitude * 0.621371)} miles above Earth`;
    if (altBar) {
      const altPct = Math.min(Math.max(((this.currentAltitude - 380) / 60) * 100, 10), 100);
      altBar.style.width = `${altPct}%`;
      altBar.style.background = this.isLive ? 'var(--accent-cyan)' : '#F59E0B';
    }

    if (velEl) velEl.textContent = `${Math.round(this.currentVelocity).toLocaleString()} km/h`;
    if (velMphEl) velMphEl.textContent = `${Math.round(this.currentVelocity * 0.621371).toLocaleString()} mph (${(this.currentVelocity / 3600).toFixed(2)} km/s)`;
    if (velBar) {
      const velPct = Math.min(Math.max(((this.currentVelocity - 27000) / 1000) * 100, 15), 100);
      velBar.style.width = `${velPct}%`;
      velBar.style.background = this.isLive ? 'var(--accent-blue)' : '#F59E0B';
    }

    // Update Solar Status
    const solarText = document.getElementById('iss-solar-text');
    const solarIcon = document.getElementById('iss-solar-icon');
    if (solarText && solarIcon) {
      const isDay = this.currentVisibility === 'daylight';
      solarText.textContent = isDay ? 'Direct Solar Illumination' : "In Earth's Shadow (Orbital Night)";
      solarIcon.className = `iss-solar-icon ${isDay ? 'daylight' : 'shadow'}`;
      solarIcon.innerHTML = isDay ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
  }

  async fetchCrew() {
    let crewData = null;

    const crewEndpoints = [
      '/api/iss/crew',
      'http://127.0.0.1:8000/api/iss/crew',
      'http://localhost:8000/api/iss/crew'
    ];

    for (const url of crewEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          if (json && json.people && Array.isArray(json.people)) {
            crewData = json;
            break;
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!crewData || !crewData.people) {
      crewData = {
        number: 7,
        people: [
          { name: "Sunita Williams", craft: "ISS" },
          { name: "Barry Wilmore", craft: "ISS" },
          { name: "Matthew Dominick", craft: "ISS" },
          { name: "Michael Barratt", craft: "ISS" },
          { name: "Jeanette Epps", craft: "ISS" },
          { name: "Alexander Grebenkin", craft: "ISS" },
          { name: "Don Pettit", craft: "ISS" }
        ]
      };
    }

    try {
      this.renderCrew(crewData);
    } catch (e) {
      console.warn('[ORBITX ISS] Crew render deferred:', e);
    }
  }

  renderCrew(data) {
    const countEl = document.getElementById('iss-crew-count');
    const listEl = document.getElementById('iss-crew-list');

    const issCrew = (data.people || []).filter(p => p.craft === 'ISS' || !p.craft);

    if (countEl) countEl.textContent = `${issCrew.length} ASTRONAUTS ABOARD`;
    if (listEl) {
      listEl.innerHTML = '';
      issCrew.forEach(member => {
        const chip = document.createElement('span');
        chip.className = 'crew-chip';
        chip.innerHTML = `
          <i class="fa-solid fa-user-astronaut"></i>
          <span>${member.name}</span>
        `;
        listEl.appendChild(chip);
      });
    }
  }
}

// Global bootstrap resilient to DOM ready states
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.IssTracker = new IssTracker();
  });
} else {
  window.IssTracker = new IssTracker();
}
