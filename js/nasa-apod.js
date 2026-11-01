/**
 * ORBITX - NASA APOD (Astronomy Picture of the Day) Controller
 * Secure backend API proxy consumer, cosmic date selector, HD lightbox modal,
 * audio narration, and resilient offline curated fallback.
 */

class NasaApodExplorer {
  constructor() {
    this.currentApod = null;
    this.curatedArchive = window.APOD_CURATED_ARCHIVE || [];
    this.isSpeaking = false;

    // Elements
    this.dateInput = document.getElementById('apod-date-input');
    this.loaderOverlay = document.getElementById('apod-loader');
    this.loaderText = document.getElementById('apod-loader-text');
    this.errorOverlay = document.getElementById('apod-error');
    this.errorMsg = document.getElementById('apod-error-msg');
    this.modal = document.getElementById('apod-modal');
    this.modalImg = document.getElementById('apod-modal-img');
    this.modalCaption = document.getElementById('apod-modal-caption');

    this.init();
  }

  init() {
    this.setupDateConstraints();
    this.setupEventListeners();
    this.renderCuratedArchive();

    // Initial load: Fetch latest live APOD
    this.fetchApod();
  }

  getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  setupDateConstraints() {
    if (!this.dateInput) return;
    const todayStr = this.getTodayDateString();
    this.dateInput.max = todayStr;
    this.dateInput.min = '1995-06-16'; // NASA APOD earliest start date
    this.dateInput.value = todayStr;
  }

  setupEventListeners() {
    // Date input change
    if (this.dateInput) {
      this.dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
          this.fetchApod(e.target.value);
        }
      });
    }

    // Quick Button: Today
    const btnToday = document.getElementById('apod-btn-today');
    if (btnToday) {
      btnToday.addEventListener('click', () => {
        this.fetchApod();
      });
    }

    // Quick Button: Yesterday
    const btnYesterday = document.getElementById('apod-btn-yesterday');
    if (btnYesterday) {
      btnYesterday.addEventListener('click', () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        if (this.dateInput) this.dateInput.value = dateStr;
        this.fetchApod(dateStr);
      });
    }

    // Quick Button: Random
    const btnRandom = document.getElementById('apod-btn-random');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        this.fetchRandomApod();
      });
    }

    // Retry Button on error
    const btnRetry = document.getElementById('apod-btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        const date = this.dateInput ? this.dateInput.value : this.getTodayDateString();
        this.fetchApod(date);
      });
    }

    // Fullscreen Image Click (Open Modal)
    const mediaContainer = document.getElementById('apod-media-container');
    if (mediaContainer) {
      mediaContainer.addEventListener('click', () => {
        this.openModal();
      });
    }

    // Modal Close
    const modalClose = document.getElementById('apod-modal-close');
    if (modalClose && this.modal) {
      modalClose.addEventListener('click', () => {
        this.closeModal();
      });

      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Escape Key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Audio narration toggle button
    const audioBtn = document.getElementById('apod-btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.toggleNarration();
      });
    }
  }

  showLoader(statusMessage = 'CONTACTING NASA DEEP SPACE NETWORK...') {
    if (this.loaderOverlay) {
      if (this.loaderText) this.loaderText.textContent = statusMessage;
      this.loaderOverlay.style.display = 'flex';
    }
    if (this.errorOverlay) this.errorOverlay.style.display = 'none';
  }

  hideLoader() {
    if (this.loaderOverlay) {
      this.loaderOverlay.style.display = 'none';
    }
  }

  showError(message) {
    this.hideLoader();
    if (this.errorOverlay) {
      if (this.errorMsg) this.errorMsg.textContent = message;
      this.errorOverlay.style.display = 'flex';
    }
  }

  async fetchApod(dateString) {
    const isToday = !dateString || dateString === this.getTodayDateString();
    this.showLoader(isToday ? 'CONTACTING NASA DEEP SPACE NETWORK...' : `POINTING TELEMETRY TO ${dateString}...`);

    // Stop ongoing audio narration if switching dates
    if (this.isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }

    try {
      // 1. First attempt: Secure backend proxy endpoint (/api/nasa/apod)
      // When requesting today, omit date parameter so NASA serves the latest published APOD
      const pathSuffix = isToday ? '/api/nasa/apod' : `/api/nasa/apod?date=${dateString}`;
      const candidateUrls = [
        pathSuffix,
        `http://127.0.0.1:8000${pathSuffix}`,
        `http://localhost:8000${pathSuffix}`
      ];

      let data = null;
      for (const url of candidateUrls) {
        try {
          const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            const json = await response.json();
            if (json.title && (json.url || json.hdurl)) {
              data = json;
              break;
            }
          }
        } catch (fetchErr) {
          // Continue to next candidate endpoint
        }
      }

      if (data) {
        if (data.date && this.dateInput) {
          this.dateInput.value = data.date;
        }
        this.renderApodData(data);
        this.hideLoader();
        return;
      }

      // If backend responded with non-ok or error, throw to fallback
      throw new Error('Backend proxy APOD endpoints unavailable');
    } catch (err) {
      console.warn(`[ORBITX APOD] Backend proxy fetch failed (${err.message}). Using resilient curated fallback.`);
      
      // 2. Resilient Fallback: Match requested date or select curated entry
      const matched = this.curatedArchive.find(item => item.date === dateString);
      if (matched) {
        this.renderApodData(matched);
        this.hideLoader();
      } else {
        // Use first curated highlight or random curated
        const fallback = this.curatedArchive[0];
        if (fallback) {
          this.renderApodData({
            ...fallback,
            explanation: `[OFFLINE TELEMETRY ARCHIVE: Showing highlighted record for ${fallback.date}] — ${fallback.explanation}`
          });
          this.hideLoader();
        } else {
          this.showError('Unable to connect to NASA Deep Space Network. Please check connection.');
        }
      }
    }
  }

  fetchRandomApod() {
    // Generate a random date between 1995-06-16 and today
    const start = new Date(1996, 0, 1).getTime();
    const end = new Date().getTime();
    const randomTime = start + Math.random() * (end - start);
    const d = new Date(randomTime);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const randomDateStr = `${y}-${m}-${day}`;

    if (this.dateInput) this.dateInput.value = randomDateStr;
    this.fetchApod(randomDateStr);
  }

  renderApodData(data) {
    this.currentApod = data;

    // Elements
    const titleEl = document.getElementById('apod-title');
    const dateEl = document.getElementById('apod-date-badge');
    const explanationEl = document.getElementById('apod-explanation');
    const creditEl = document.getElementById('apod-credit');
    const imgEl = document.getElementById('apod-image');

    if (titleEl) titleEl.textContent = data.title || 'Cosmic Observation';
    if (dateEl) dateEl.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${data.date || 'Observation Date'}`;
    if (explanationEl) explanationEl.textContent = data.explanation || 'Scientific description unavailable.';
    if (creditEl) creditEl.textContent = data.copyright ? `Credit: ${data.copyright}` : 'Credit: NASA / JPL / STScI (Public Domain)';

    // Image loading with smooth fade-in
    if (imgEl) {
      imgEl.style.opacity = '0';
      const imageUrl = data.url || data.hdurl;
      
      const tempImg = new Image();
      tempImg.onload = () => {
        imgEl.src = imageUrl;
        imgEl.alt = data.title || 'NASA APOD';
        imgEl.style.opacity = '1';
      };
      tempImg.onerror = () => {
        // Fallback placeholder image
        imgEl.src = 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80';
        imgEl.style.opacity = '1';
      };
      tempImg.src = imageUrl;
    }
  }

  renderCuratedArchive() {
    const grid = document.getElementById('apod-curated-grid');
    if (!grid || !this.curatedArchive.length) return;

    grid.innerHTML = '';
    this.curatedArchive.forEach(item => {
      const card = document.createElement('div');
      card.className = 'curated-card';
      card.innerHTML = `
        <div class="curated-thumb-wrapper">
          <img src="${item.url}" alt="${item.title}" class="curated-thumb" loading="lazy">
        </div>
        <div class="curated-card-body">
          <div class="curated-card-date">${item.date} • ${item.category || 'Deep Space'}</div>
          <div class="curated-card-title">${item.title}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.dateInput) this.dateInput.value = item.date;
        this.renderApodData(item);
        const stage = document.getElementById('section-nasa-data');
        if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      grid.appendChild(card);
    });
  }

  openModal() {
    if (!this.currentApod || !this.modal) return;
    const highResUrl = this.currentApod.hdurl || this.currentApod.url;
    if (this.modalImg) this.modalImg.src = highResUrl;
    if (this.modalCaption) this.modalCaption.textContent = `${this.currentApod.title} (${this.currentApod.date})`;
    this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
  }

  toggleNarration() {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio narration is not supported in this browser.');
      return;
    }

    const audioBtn = document.getElementById('apod-btn-audio');

    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (audioBtn) audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Listen to Briefing</span>';
    } else {
      if (!this.currentApod || !this.currentApod.explanation) return;
      const utterance = new SpeechSynthesisUtterance(this.currentApod.explanation);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
        if (audioBtn) audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Listen to Briefing</span>';
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (audioBtn) audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Listen to Briefing</span>';
      };

      window.speechSynthesis.speak(utterance);
      this.isSpeaking = true;
      if (audioBtn) audioBtn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>Stop Briefing</span>';
    }
  }
}

// Global bootstrap resilient to DOM ready states
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.NasaApodExplorer = new NasaApodExplorer();
  });
} else {
  window.NasaApodExplorer = new NasaApodExplorer();
}
