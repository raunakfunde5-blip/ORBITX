/**
 * ORBITX - Core Application Controller
 * Handles HUD Mission Clock, navigation spy, mobile drawer, and component bridging.
 */

class OrbitxApp {
  constructor() {
    this.solarSimulator = null;
    this.init();
  }

  init() {
    this.startMissionClock();
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupImageFallbacks();
    this.setupBackToTop();
    this.initModules();
  }

  setupImageFallbacks() {
    document.querySelectorAll('img').forEach(image => {
      const applyFallback = () => {
        if (image.dataset.fallbackApplied) return;
        image.dataset.fallbackApplied = 'true';
        image.style.background = 'linear-gradient(135deg, rgba(56,189,248,.12), rgba(139,92,246,.16))';
        image.alt = image.alt ? `${image.alt} (image unavailable)` : 'Image unavailable';
        image.removeAttribute('src');
      };
      image.addEventListener('error', applyFallback, { once: true });
      if (image.complete && image.naturalWidth === 0 && image.getAttribute('src')) {
        applyFallback();
      }
    });

    document.addEventListener('error', event => {
      const element = event.target;
      if (element?.matches('.deep-observation-card img, .mission-card-media') && element.classList.contains('mission-card-media')) {
        element.style.backgroundImage = 'linear-gradient(135deg, rgba(56,189,248,.18), rgba(139,92,246,.22))';
      }
    }, true);
  }

  setupBackToTop() {
    const button = document.getElementById('orbitx-back-to-top');
    const progress = document.getElementById('orbitx-scroll-progress');
    if (!button || !progress) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
      button.classList.toggle('visible', window.scrollY > 600);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  startMissionClock() {
    const clockEl = document.getElementById('hud-utc-clock');
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds} UTC`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setupNavigation() {
    // Mobile Drawer Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const isOpen = navMenu.classList.contains('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.innerHTML = isOpen
          ? '<i class="fa-solid fa-xmark"></i>'
          : '<i class="fa-solid fa-bars"></i>';
      });
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', 'nav-menu');

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
          menuToggle.focus();
        }
      });

      // Close menu on link click
      const navLinks = navMenu.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
      });
    }

    // Smooth Scroll for Internal Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  setupScrollEffects() {
    const header = document.querySelector('.orbitx-header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      // Header glass blur on scroll
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Scroll Spy for Nav links
      let currentSection = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSection = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    });
  }

  initModules() {
    // Instantiate Solar System Simulator
    const solarCanvas = document.getElementById('solar-system-canvas');
    if (solarCanvas) {
      if (typeof window.SolarSystemSimulator === 'function') {
        this.solarSimulator = new window.SolarSystemSimulator('solar-system-canvas');
      }
    }
    const satelliteCanvas = document.getElementById('satellite-globe-canvas');
    if (satelliteCanvas && window.SatelliteExplorer) {
      this.satelliteExplorer = new window.SatelliteExplorer('satellite-globe-canvas');
    }
    const deepSection = document.getElementById('section-deep-space');
    const deepCanvas = document.getElementById('deep-space-canvas');
    if (deepSection && deepCanvas && 'IntersectionObserver' in window && window.DeepSpaceExplorer) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        if (!this.deepSpaceExplorer && typeof window.DeepSpaceExplorer === 'function') {
          this.deepSpaceExplorer = new window.DeepSpaceExplorer('deep-space-canvas');
        }
        observer.disconnect();
      }, { rootMargin: '300px' });
      observer.observe(deepSection);
    } else if (deepCanvas && typeof window.DeepSpaceExplorer === 'function') {
      this.deepSpaceExplorer = new window.DeepSpaceExplorer('deep-space-canvas');
    }
    const spacecraftCanvas = document.getElementById('spacecraft-stage-canvas');
    const missionSection = document.getElementById('section-mission-control');
    if (spacecraftCanvas && missionSection && window.SpacecraftExplorer) {
      const startExplorer = () => {
        if (!this.spacecraftExplorer && typeof window.SpacecraftExplorer === 'function') {
          this.spacecraftExplorer = new window.SpacecraftExplorer('spacecraft-stage-canvas');
        }
      };
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          startExplorer();
          observer.disconnect();
        }, { rootMargin: '300px' });
        observer.observe(missionSection);
      } else {
        startExplorer();
      }
    }
    const travelCanvas = document.getElementById('space-travel-canvas');
    const travelSection = document.getElementById('section-space-travel');
    if (travelCanvas && travelSection && window.SpaceTravelSimulator) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          this.spaceTravelSimulator = new window.SpaceTravelSimulator('space-travel-canvas');
          observer.disconnect();
        }, { rootMargin: '300px' });
        observer.observe(travelSection);
      } else {
        this.spaceTravelSimulator = new window.SpaceTravelSimulator('space-travel-canvas');
      }
    }
    if (document.getElementById('mission-command-center') && window.MissionCommandCenter) {
      this.missionCommandCenter = new window.MissionCommandCenter('command-earth-canvas');
    }
  }

  openPlanetInExplorer(planetId) {
    document.dispatchEvent(new CustomEvent('orbitx-object-selected', {
      detail: { objectId: planetId }
    }));
    const planetExplorerSec = document.getElementById('section-planet-explorer');
    if (planetExplorerSec) {
      planetExplorerSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // If planet explorer module is loaded, select the planet
    if (window.PlanetExplorer && window.PlanetExplorer.selectPlanet) {
      window.PlanetExplorer.selectPlanet(planetId);
    }
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.OrbitxApp = new OrbitxApp();
});
