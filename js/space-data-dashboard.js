class SpaceDataDashboard {
  constructor() {
    this.refreshButton = document.getElementById('live-data-refresh');
    this.refreshButton?.addEventListener('click', () => this.refresh());
    this.refresh();
  }

  async getJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  setStatus(elementId, label, state) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = `${label}: ${state}`;
    element.className = `data-source-status ${state === 'LIVE' || state === 'CACHED' ? 'live' : state === 'UNAVAILABLE' ? 'unavailable' : ''}`;
  }

  async refresh() {
    if (this.refreshButton) this.refreshButton.disabled = true;
    await Promise.all([this.loadMars(), this.loadWeather(), this.loadIss()]);
    if (this.refreshButton) this.refreshButton.disabled = false;
  }

  async loadMars() {
    const gallery = document.getElementById('live-mars-gallery');
    const meta = document.getElementById('live-mars-meta');
    try {
      const data = await this.getJson('/api/nasa/mars-photos');
      gallery.replaceChildren();
      data.photos.slice(0, 6).forEach(photo => {
        const image = document.createElement('img');
        image.src = photo.image_url;
        image.alt = `${photo.rover || 'Mars rover'} camera image`;
        image.loading = 'lazy';
        gallery.appendChild(image);
      });
      if (!data.photos.length) gallery.textContent = data.error || 'No recent rover images are available.';
      meta.textContent = `${data.attribution || ''} | Retrieved ${data.retrieved_at || 'timestamp unavailable'}`;
      this.setStatus('live-data-mars-status', 'MARS', data.cache || 'LIVE');
    } catch (error) {
      gallery.textContent = error.message;
      meta.textContent = 'No fallback data claimed as live.';
      this.setStatus('live-data-mars-status', 'MARS', 'UNAVAILABLE');
    }
  }

  async loadWeather() {
    const summary = document.getElementById('live-weather-summary');
    const meta = document.getElementById('live-weather-meta');
    try {
      const data = await this.getJson('/api/nasa/space-weather');
      summary.replaceChildren();
      const list = document.createElement('ul');
      list.className = 'live-weather-list';
      const entries = data.flares.slice(0, 3).map(flare => ({
        name: flare.class_type || 'Solar flare',
        time: flare.begin_time
      }));
      data.geomagnetic_storms.slice(0, 2).forEach(storm => entries.push({
        name: `Geomagnetic storm${storm.kp_index != null ? ` (Kp ${storm.kp_index})` : ''}`,
        time: storm.start_time
      }));
      if (!entries.length) {
        const empty = document.createElement('li');
        empty.textContent = 'No reported events in this seven-day window.';
        list.appendChild(empty);
      } else {
        entries.forEach(entry => {
          const item = document.createElement('li');
          item.textContent = `${entry.name}${entry.time ? ` - ${entry.time}` : ''}`;
          list.appendChild(item);
        });
      }
      summary.appendChild(list);
      meta.textContent = `${data.attribution || data.source} | Retrieved ${data.retrieved_at || 'timestamp unavailable'}`;
      this.setStatus('live-data-weather-status', 'SPACE WEATHER', data.cache || 'LIVE');
    } catch (error) {
      summary.textContent = error.message;
      meta.textContent = 'Verified provider data is currently unavailable.';
      this.setStatus('live-data-weather-status', 'SPACE WEATHER', 'UNAVAILABLE');
    }
  }

  async loadIss() {
    const summary = document.getElementById('live-iss-summary');
    const meta = document.getElementById('live-iss-meta');
    try {
      const data = await this.getJson('/api/iss/telemetry');
      summary.innerHTML = '';
      const fields = [
        ['Latitude', `${Number(data.latitude).toFixed(2)} deg`],
        ['Longitude', `${Number(data.longitude).toFixed(2)} deg`],
        ['Altitude', `${Number(data.altitude).toFixed(0)} km`],
        ['Velocity', `${Number(data.velocity).toFixed(0)} km/h`]
      ];
      fields.forEach(([label, value]) => {
        const item = document.createElement('div');
        const strong = document.createElement('strong');
        const span = document.createElement('span');
        strong.textContent = value;
        span.textContent = label;
        item.append(strong, span);
        summary.appendChild(item);
      });
      const observed = data.timestamp ? new Date(Number(data.timestamp) * 1000).toISOString() : 'timestamp unavailable';
      meta.textContent = `Provider: ${data.source || 'unknown'} | Observed: ${observed}`;
      this.setStatus('live-data-iss-status', 'ISS', 'LIVE');
    } catch (error) {
      summary.textContent = error.message;
      meta.textContent = 'No simulated position shown as live.';
      this.setStatus('live-data-iss-status', 'ISS', 'UNAVAILABLE');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SpaceDataDashboard());
} else {
  new SpaceDataDashboard();
}
