class MelaniaAssistant {
  constructor(config) {
    this.config = config || {};
    this.isOpen = false;
    this.messages = [];
    this.container = null;
  }

  init() {
    this.renderWidget();
    this.attachEvents();
    this.boot();
  }

  renderWidget() {
    const html = `
      <div id="melania-assistant" class="melania-assistant">
        <button class="melania-toggle" aria-label="Abrir chat de ${this.config.name || 'Melania'}">${this.config.avatar || '🧠'}</button>
        <div class="melania-panel hidden" role="dialog" aria-label="Asistente ${this.config.name || 'Melania'}">
          <div class="melania-header">
            <div class="melania-avatar">${this.config.avatar || '🧠'}</div>
            <div class="melania-meta">
              <strong>${this.config.name || 'Melania'}</strong>
              <span>${this.config.role || 'Asistente Principal'}</span>
            </div>
            <button class="melania-close" aria-label="Cerrar">×</button>
          </div>
          <div class="melania-messages" aria-live="polite"></div>
          <form class="melania-input" autocomplete="off">
            <input type="text" name="message" placeholder="Escribe tu mensaje..." aria-label="Mensaje" />
            <button class="btn-send" type="submit">Enviar</button>
          </form>
          <div class="melania-quick">
            <button data-action="whatsapp">WhatsApp</button>
            <button data-action="calendly">Agendar</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    this.container = document.getElementById('melania-assistant');
  }

  attachEvents() {
    const toggle = this.container.querySelector('.melania-toggle');
    const panel = this.container.querySelector('.melania-panel');
    const closeBtn = this.container.querySelector('.melania-close');
    const form = this.container.querySelector('.melania-input');
    const quick = this.container.querySelector('.melania-quick');

    toggle.addEventListener('click', () => this.open());
    closeBtn.addEventListener('click', () => this.close());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="message"]');
      const text = String(input.value || '').trim();
      if (!text) return;
      this.addMessage({ from: 'user', text });
      input.value = '';
      this.respond(text);
    });

    quick.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'whatsapp') this.openWhatsApp();
      if (action === 'calendly') this.openCalendly();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) this.close();
    });
  }

  boot() {
    const welcomes = this.config.welcome || [];
    welcomes.forEach(w => this.addMessage({ from: 'bot', text: w }));
  }

  addMessage({ from, text }) {
    const list = this.container.querySelector('.melania-messages');
    const item = document.createElement('div');
    item.className = `msg ${from}`;
    item.textContent = text;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  }

  open() {
    this.container.querySelector('.melania-panel').classList.remove('hidden');
    this.isOpen = true;
  }

  close() {
    this.container.querySelector('.melania-panel').classList.add('hidden');
    this.isOpen = false;
  }

  respond(text) {
    const lower = text.toLowerCase();
    if (/(agenda|calendly|reunion|meeting)/.test(lower)) {
      this.addMessage({ from: 'bot', text: 'Puedo agendarte una reunión, abro Calendly.' });
      this.openCalendly();
      return;
    }
    if (/(whatsapp|contacto|hablar)/.test(lower)) {
      this.addMessage({ from: 'bot', text: 'Te derivo a WhatsApp para atención inmediata.' });
      this.openWhatsApp();
      return;
    }
    this.addMessage({ from: 'bot', text: 'Entendido. ¿Quieres que lo derive a WhatsApp o prefieres agendar una llamada?' });
  }

  openWhatsApp() {
    const url = (window?.AppConfig?.generateWhatsAppUrl?.('general'))
      || (window?.AppConfig?.CONTACT?.whatsapp)
      || 'https://wa.me/5492235506585';
    window.open(url, '_blank', 'noopener');
  }

  openCalendly() {
    const url = (window?.AppConfig?.CONTACT?.calendly)
      || 'https://calendly.com/melanobruno';
    if (window?.Calendly?.initPopupWidget) {
      window.Calendly.initPopupWidget({ url });
    } else {
      window.open(url, '_blank', 'noopener');
    }
  }
}

export default MelaniaAssistant;