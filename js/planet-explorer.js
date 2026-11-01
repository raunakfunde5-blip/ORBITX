/**
 * ORBITX - Planet Explorer Deep Dive Controller
 * Renders scientific metrics, 3D CSS planetary sphere, atmospheric breakdowns,
 * and a side-by-side planetary comparison engine.
 */

class PlanetExplorer {
  constructor() {
    this.currentPlanetId = 'earth';
    this.planetsData = window.PLANETS_DATA || {};
    this.comparePlanetA = 'earth';
    this.comparePlanetB = 'mars';

    this.init();
  }

  init() {
    this.renderTabs();
    this.setupEventListeners();
    this.selectPlanet(this.currentPlanetId);
    this.setupComparisonTool();
  }

  renderTabs() {
    const navStrip = document.getElementById('explorer-nav-strip');
    if (!navStrip) return;

    const planetOrder = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    navStrip.innerHTML = '';

    planetOrder.forEach(key => {
      const p = this.planetsData[key];
      if (!p) return;

      const btn = document.createElement('button');
      btn.className = `explorer-tab ${key === this.currentPlanetId ? 'active' : ''}`;
      btn.setAttribute('data-planet', key);
      btn.innerHTML = `
        <span class="explorer-tab-dot" style="background: ${p.color}; box-shadow: 0 0 8px ${p.color};"></span>
        <span>${p.name}</span>
      `;

      btn.addEventListener('click', () => {
        this.selectPlanet(key);
      });

      navStrip.appendChild(btn);
    });
  }

  setupEventListeners() {
    // Dropdown change for comparison tool
    const selectA = document.getElementById('compare-select-a');
    const selectB = document.getElementById('compare-select-b');

    if (selectA && selectB) {
      selectA.addEventListener('change', (e) => {
        this.comparePlanetA = e.target.value;
        this.renderComparison();
      });

      selectB.addEventListener('change', (e) => {
        this.comparePlanetB = e.target.value;
        this.renderComparison();
      });
    }
  }

  selectPlanet(planetId) {
    if (!this.planetsData[planetId]) return;
    this.currentPlanetId = planetId;

    // Update active tab styles
    const tabs = document.querySelectorAll('.explorer-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-planet') === planetId);
    });

    const planet = this.planetsData[planetId];
    this.renderShowcase(planet);
  }

  renderShowcase(planet) {
    // 1. Visual 3D sphere & atmosphere glow
    const sphere = document.getElementById('planet-3d-sphere');
    const atmosphereGlow = document.getElementById('planet-atmosphere-glow');
    const saturnRings = document.getElementById('planet-saturn-rings');
    const categoryBadge = document.getElementById('planet-category-badge');

    if (sphere) {
      sphere.style.background = planet.textureStyle;
      sphere.style.backgroundImage = planet.textureImage
        ? `url("${planet.textureImage}")`
        : planet.textureStyle;
      sphere.style.backgroundSize = 'cover';
      sphere.style.backgroundPosition = 'center';
      sphere.style.boxShadow = `inset -25px -25px 40px rgba(0, 0, 0, 0.8), 0 0 45px ${planet.glowColor}`;
    }

    if (atmosphereGlow) {
      atmosphereGlow.style.background = planet.glowColor;
    }

    if (saturnRings) {
      saturnRings.style.display = planet.hasRings ? 'block' : 'none';
    }

    if (categoryBadge) {
      categoryBadge.innerHTML = `<i class="fa-solid fa-atom"></i> ${planet.category}`;
    }

    // 2. Headings & summary text
    const nameHeading = document.getElementById('planet-name-heading');
    const orderTag = document.getElementById('planet-order-tag');
    const taglineText = document.getElementById('planet-tagline-text');
    const summaryPara = document.getElementById('planet-summary-para');

    if (nameHeading) nameHeading.textContent = planet.name;
    if (orderTag) {
      const orderMap = {
        sun: 'CENTRAL STAR',
        mercury: 'PLANET 01',
        venus: 'PLANET 02',
        earth: 'PLANET 03',
        mars: 'PLANET 04',
        jupiter: 'PLANET 05',
        saturn: 'PLANET 06',
        uranus: 'PLANET 07',
        neptune: 'PLANET 08'
      };
      orderTag.textContent = orderMap[planet.id] || 'CELESTIAL BODY';
    }
    if (taglineText) taglineText.textContent = planet.tagline;
    if (summaryPara) summaryPara.textContent = planet.scientificSummary;

    // 3. 6 Scientific Spec Cards
    const valDiameter = document.getElementById('spec-val-diameter');
    const subDiameter = document.getElementById('spec-sub-diameter');
    if (valDiameter) valDiameter.textContent = `${planet.diameterKm.toLocaleString()} km`;
    if (subDiameter) subDiameter.textContent = `${planet.diameterRelativeEarth}x Earth`;

    const valDistance = document.getElementById('spec-val-distance');
    const subDistance = document.getElementById('spec-sub-distance');
    if (valDistance) valDistance.textContent = planet.distanceFromSunAu > 0 ? `${planet.distanceFromSunAu} AU` : '0 AU';
    if (subDistance) subDistance.textContent = planet.distanceFromSunKm > 0 ? `${(planet.distanceFromSunKm / 1e6).toFixed(1)}M km` : 'Center of System';

    const valPeriod = document.getElementById('spec-val-period');
    const subPeriod = document.getElementById('spec-sub-period');
    if (valPeriod) valPeriod.textContent = planet.orbitalPeriodDays > 0 ? `${planet.orbitalPeriodDays} d` : 'N/A';
    if (subPeriod) subPeriod.textContent = planet.orbitalPeriodDays > 365 ? `${(planet.orbitalPeriodDays / 365.25).toFixed(1)} Earth yrs` : 'Days per orbit';

    const valTemp = document.getElementById('spec-val-temp');
    const subTemp = document.getElementById('spec-sub-temp');
    if (valTemp) valTemp.textContent = `${planet.surfaceTempC} °C`;
    if (subTemp) subTemp.textContent = `${Math.round(planet.surfaceTempC + 273.15)} Kelvin`;

    const valGravity = document.getElementById('spec-val-gravity');
    const subGravity = document.getElementById('spec-sub-gravity');
    if (valGravity) valGravity.textContent = `${planet.gravityMs2} m/s²`;
    if (subGravity) subGravity.textContent = `${planet.gravityRelativeEarth}x Earth gravity`;

    const valMoons = document.getElementById('spec-val-moons');
    const subMoons = document.getElementById('spec-sub-moons');
    if (valMoons) valMoons.textContent = planet.moonsCount;
    if (subMoons) subMoons.textContent = planet.moonsCount === 1 ? 'Natural Satellite' : 'Natural Satellites';

    // 4. Atmospheric Composition Bars
    const atmoContainer = document.getElementById('atmosphere-bars-grid');
    if (atmoContainer && planet.atmosphere) {
      atmoContainer.innerHTML = '';
      planet.atmosphere.forEach(item => {
        const row = document.createElement('div');
        row.className = 'atmo-row';
        row.innerHTML = `
          <span class="atmo-element">${item.element}</span>
          <div class="atmo-progress-track">
            <div class="atmo-progress-fill" style="width: ${Math.min(item.percentage, 100)}%;"></div>
          </div>
          <span class="atmo-percent">${item.percentage}%</span>
        `;
        atmoContainer.appendChild(row);
      });
    }

    // 5. Scientific Key Facts
    const factsContainer = document.getElementById('planet-facts-grid');
    if (factsContainer && planet.keyFacts) {
      factsContainer.innerHTML = '';
      planet.keyFacts.forEach(fact => {
        const item = document.createElement('div');
        item.className = 'fact-item';
        item.innerHTML = `
          <i class="fa-solid fa-satellite-dish"></i>
          <span>${fact}</span>
        `;
        factsContainer.appendChild(item);
      });
    }
  }

  setupComparisonTool() {
    const selectA = document.getElementById('compare-select-a');
    const selectB = document.getElementById('compare-select-b');
    if (!selectA || !selectB) return;

    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    selectA.innerHTML = '';
    selectB.innerHTML = '';

    planets.forEach(key => {
      const p = this.planetsData[key];
      if (!p) return;

      const optA = document.createElement('option');
      optA.value = key;
      optA.textContent = p.name;
      if (key === this.comparePlanetA) optA.selected = true;
      selectA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = key;
      optB.textContent = p.name;
      if (key === this.comparePlanetB) optB.selected = true;
      selectB.appendChild(optB);
    });

    this.renderComparison();
  }

  renderComparison() {
    const tableBody = document.getElementById('compare-table-body');
    if (!tableBody) return;

    const pA = this.planetsData[this.comparePlanetA];
    const pB = this.planetsData[this.comparePlanetB];
    if (!pA || !pB) return;

    const metrics = [
      {
        label: 'Category',
        valA: pA.category,
        valB: pB.category
      },
      {
        label: 'Distance from Sun',
        valA: `${pA.distanceFromSunAu} AU (${(pA.distanceFromSunKm / 1e6).toFixed(1)}M km)`,
        valB: `${pB.distanceFromSunAu} AU (${(pB.distanceFromSunKm / 1e6).toFixed(1)}M km)`
      },
      {
        label: 'Mean Diameter',
        valA: `${pA.diameterKm.toLocaleString()} km`,
        valB: `${pB.diameterKm.toLocaleString()} km`
      },
      {
        label: 'Mean Temperature',
        valA: `${pA.surfaceTempC} °C`,
        valB: `${pB.surfaceTempC} °C`
      },
      {
        label: 'Orbital Period',
        valA: `${pA.orbitalPeriodDays} Earth days`,
        valB: `${pB.orbitalPeriodDays} Earth days`
      },
      {
        label: 'Surface Gravity',
        valA: `${pA.gravityMs2} m/s² (${pA.gravityRelativeEarth}g)`,
        valB: `${pB.gravityMs2} m/s² (${pB.gravityRelativeEarth}g)`
      },
      {
        label: 'Confirmed Moons',
        valA: `${pA.moonsCount}`,
        valB: `${pB.moonsCount}`
      }
    ];

    tableBody.innerHTML = '';
    metrics.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-muted); font-weight: 500;">${m.label}</td>
        <td class="val-col" style="color: ${pA.color};">${m.valA}</td>
        <td class="val-col" style="color: ${pB.color};">${m.valB}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
}

// Global bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.PlanetExplorer = new PlanetExplorer();
});
