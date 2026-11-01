class OrbitxAssistant {
  constructor() {
    this.panel = document.getElementById('orbitx-ai-panel');
    this.launcher = document.getElementById('orbitx-ai-launcher');
    this.closeButton = document.getElementById('orbitx-ai-close');
    this.form = document.getElementById('orbitx-ai-form');
    this.input = document.getElementById('orbitx-ai-input');
    this.messages = document.getElementById('orbitx-ai-messages');
    this.objectSelect = document.getElementById('orbitx-ai-object');
    this.sendButton = document.getElementById('orbitx-ai-send');
    this.history = [];
    this.busy = false;
    this.bindEvents();
  }

  bindEvents() {
    this.launcher?.addEventListener('click', () => this.toggle(true));
    this.closeButton?.addEventListener('click', () => this.toggle(false));
    this.form?.addEventListener('submit', event => {
      event.preventDefault();
      this.send(this.input.value);
    });
    this.input?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.form.requestSubmit();
      }
    });
    document.querySelectorAll('[data-ai-prompt]').forEach(button => {
      button.addEventListener('click', () => this.send(button.dataset.aiPrompt));
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.panel?.classList.contains('open')) this.toggle(false);
    });
    document.addEventListener('orbitx-object-selected', event => {
      const objectId = String(event.detail?.objectId || '').toLowerCase();
      if ([...this.objectSelect.options].some(option => option.value === objectId)) {
        this.objectSelect.value = objectId;
      }
    });
  }

  toggle(open) {
    this.panel.classList.toggle('open', open);
    this.panel.setAttribute('aria-hidden', String(!open));
    this.launcher.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => this.input.focus(), 220);
  }

  getContext() {
    const objectId = this.objectSelect.value;
    if (!objectId || !window.PLANETS_DATA?.[objectId]) return { objectId, objectName: '', objectSummary: '' };
    const object = window.PLANETS_DATA[objectId];
    const summary = [
      object.category,
      object.diameterKm ? `${object.diameterKm.toLocaleString()} km diameter` : '',
      object.distanceFromSunKm ? `${object.distanceFromSunKm.toLocaleString()} km from the Sun` : '',
      object.orbitalPeriodDays ? `${object.orbitalPeriodDays.toLocaleString()} day orbital period` : '',
      ...(object.keyFacts || []).slice(0, 2)
    ].filter(Boolean).join('. ');
    return { objectId, objectName: object.name, objectSummary: summary };
  }

  addMessage(role, content, source = '') {
    const message = document.createElement('div');
    message.className = `orbitx-ai-message ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'orbitx-ai-bubble';
    bubble.textContent = content;
    message.appendChild(bubble);
    if (source) {
      const label = document.createElement('span');
      label.className = 'orbitx-ai-source';
      label.textContent = source;
      message.appendChild(label);
    }
    this.messages.appendChild(message);
    this.messages.scrollTop = this.messages.scrollHeight;
    return message;
  }

  async send(rawMessage) {
    const context = this.getContext();
    let question = rawMessage.trim();
    if (!question || this.busy) return;
    question = question.replace(/this object/gi, context.objectName || 'this object');
    this.input.value = '';
    this.addMessage('user', question);
    this.history.push({ role: 'user', content: question });
    this.busy = true;
    this.sendButton.disabled = true;
    const typing = this.addMessage('assistant', '');
    typing.classList.add('typing');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 22000);
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: this.history.slice(-12), context }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable.');
      typing.remove();
      const modeLabel = data.mode === 'AI_PROVIDER' ? 'AI PROVIDER' : 'LOCAL DEMO MODE';
      this.addMessage('assistant', data.answer, modeLabel);
      this.history.push({ role: 'assistant', content: data.answer });
    } catch (error) {
      typing.remove();
      this.addMessage('assistant', `${error.name === 'AbortError' ? 'The assistant response timed out.' : error.message} Try again in Local Demo Mode.`, 'ASSISTANT ERROR');
    } finally {
      this.busy = false;
      this.sendButton.disabled = false;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.ORBITX_ASSISTANT = new OrbitxAssistant());
} else {
  window.ORBITX_ASSISTANT = new OrbitxAssistant();
}
