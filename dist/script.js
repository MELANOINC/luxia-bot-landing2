// MELANO AI™ - Advanced CRM Landing Script
// Autor: Melano Inc - Revolutionary PropTech Solutions

import { N8N_BASE_URL, ENDPOINTS, apiUrl } from './config.js';

/**
 * Utilidades globales
 */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

/**
 * Sistema de notificaciones premium
 */
class NotificationSystem {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      cursor: pointer;
      max-width: 350px;
      word-wrap: break-word;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${this.getIcon(type)}</span>
        <span>${message}</span>
      </div>
    `;

    this.container.appendChild(notification);

    // Animación de entrada
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });

    // Auto-dismiss
    const timeoutId = setTimeout(() => {
      this.remove(notification);
    }, duration);

    // Click para cerrar
    notification.addEventListener('click', () => {
      clearTimeout(timeoutId);
      this.remove(notification);
    });
  }

  remove(notification) {
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getBackgroundColor(type) {
    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      info: 'linear-gradient(135deg, #5b2bc4, #4c1d95)',
      quantum: 'linear-gradient(135deg, #ff6b35, #5b2bc4)'
    };
    return colors[type] || colors.info;
  }

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      quantum: '🧠'
    };
    return icons[type] || icons.info;
  }
}

/**
 * Sistema de analytics avanzado
 */
class AnalyticsSystem {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.initTracking();
  }

  generateSessionId() {
    return 'melano_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  initTracking() {
    // Tiempo en página
    this.trackTimeOnPage();
    
    // Scroll tracking
    this.trackScrollDepth();
    
    // Click tracking
    this.trackClicks();
    
    // Form interactions
    this.trackFormInteractions();
  }

  trackEvent(eventName, properties = {}) {
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: this.sessionId,
      event: eventName,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      ...properties
    };

    this.events.push(event);
    this.sendEventToN8N(event);
  }

  async sendEventToN8N(event) {
    try {
      await fetch(apiUrl('/analytics'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  trackTimeOnPage() {
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_time', {
        duration: Date.now() - this.startTime,
        totalEvents: this.events.length
      });
    });
  }

  trackScrollDepth() {
    let maxScroll = 0;
    const sections = ['hero', 'ia-cuantica', 'automatizacion', 'casos-exito', 'precios', 'contacto'];
    const sectionViews = {};

    window.addEventListener('scroll', throttle(() => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestone scrolls
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          this.trackEvent('scroll_depth', { depth: scrollPercent });
        }
      }

      // Track section views
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section && this.isInViewport(section) && !sectionViews[sectionId]) {
          sectionViews[sectionId] = true;
          this.trackEvent('section_view', { section: sectionId });
        }
      });
    }, 250));
  }

  trackClicks() {
    document.addEventListener('click', (e) => {
      const element = e.target.closest('a, button, .btn');
      if (element) {
        this.trackEvent('click', {
          element: element.tagName.toLowerCase(),
          text: element.textContent?.trim().substring(0, 50),
          href: element.href,
          className: element.className,
          id: element.id
        });
      }
    });
  }

  trackFormInteractions() {
    const form = $('#demo-form');
    if (form) {
      // Form start
      form.addEventListener('focusin', (e) => {
        if (e.target.matches('input, select, textarea')) {
          this.trackEvent('form_start', {
            field: e.target.name || e.target.id
          });
        }
      }, { once: true });

      // Field interactions
      form.addEventListener('input', throttle((e) => {
        if (e.target.matches('input, select, textarea')) {
          this.trackEvent('field_interaction', {
            field: e.target.name || e.target.id,
            value_length: e.target.value?.length || 0
          });
        }
      }, 1000));

      // Form errors
      form.addEventListener('submit', (e) => {
        const invalidFields = form.querySelectorAll(':invalid');
        if (invalidFields.length > 0) {
          this.trackEvent('form_error', {
            invalid_fields: Array.from(invalidFields).map(field => field.name || field.id)
          });
        }
      });
    }
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

/**
 * Sistema de validación avanzado
 */
class AdvancedValidator {
  static validateEmail(email) {
    const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return pattern.test(email);
  }

  static validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15;
  }

  static validateRequired(value) {
    return value && value.toString().trim().length > 0;
  }

  static validateCompany(company) {
    return company && company.trim().length >= 2;
  }

  static getFieldError(field, value) {
    switch (field) {
      case 'name':
        if (!this.validateRequired(value)) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        break;
      case 'email':
        if (!this.validateRequired(value)) return 'El email es obligatorio';
        if (!this.validateEmail(value)) return 'Ingresa un email válido';
        break;
      case 'phone':
        if (!this.validateRequired(value)) return 'El WhatsApp es obligatorio';
        if (!this.validatePhone(value)) return 'Ingresa un número válido';
        break;
      case 'company':
        if (!this.validateRequired(value)) return 'El nombre de la inmobiliaria es obligatorio';
        if (!this.validateCompany(value)) return 'Ingresa un nombre válido';
        break;
      case 'agents':
        if (!this.validateRequired(value)) return 'Selecciona el número de agentes';
        break;
      case 'revenue':
        if (!this.validateRequired(value)) return 'Selecciona tu revenue mensual';
        break;
    }
    return null;
  }
}

/**
 * Sistema de detección de leads premium
 */
class LeadScoringSystem {
  static analyzeLeadQuality(formData) {
    let score = 0;
    const signals = [];

    // Revenue scoring
    const revenueScores = {
      'lt-100k': 10,
      '100k-500k': 25,
      '500k-1m': 50,
      '1m-5m': 75,
      '5m+': 100
    };
    const revenueScore = revenueScores[formData.revenue] || 0;
    score += revenueScore;
    if (revenueScore >= 50) signals.push('high_revenue');

    // Team size scoring
    const agentScores = {
      '1-5': 10,
      '6-15': 25,
      '16-30': 50,
      '31-50': 75,
      '50+': 100
    };
    const agentScore = agentScores[formData.agents] || 0;
    score += agentScore;
    if (agentScore >= 50) signals.push('large_team');

    // Urgency indicators
    if (formData.urgency) {
      score += 50;
      signals.push('urgent_need');
    }

    // Decision maker
    if (formData.decision) {
      score += 30;
      signals.push('decision_maker');
    }

    // Challenge analysis
    const highValueChallenges = ['scale', 'competition', 'efficiency'];
    if (highValueChallenges.includes(formData.challenge)) {
      score += 20;
      signals.push('high_value_challenge');
    }

    // Email domain analysis
    const email = formData.email?.toLowerCase() || '';
    if (email.includes('@gmail.') || email.includes('@yahoo.') || email.includes('@hotmail.')) {
      score -= 10;
      signals.push('personal_email');
    } else {
      score += 15;
      signals.push('corporate_email');
    }

    return {
      score: Math.min(score, 100),
      level: this.getLeadLevel(score),
      signals,
      isVIP: score >= 80,
      isHot: score >= 60,
      isWarm: score >= 40
    };
  }

  static getLeadLevel(score) {
    if (score >= 80) return 'VIP';
    if (score >= 60) return 'Hot';
    if (score >= 40) return 'Warm';
    return 'Cold';
  }

  static getFollowUpStrategy(analysis) {
    const { level, signals } = analysis;
    
    const strategies = {
      VIP: {
        priority: 'HIGHEST',
        responseTime: '< 15 minutos',
        channel: 'Llamada telefónica inmediata + WhatsApp',
        message: 'Lead VIP detectado - Contactar AHORA',
        assignTo: 'CEO/Director Comercial'
      },
      Hot: {
        priority: 'HIGH',
        responseTime: '< 1 hora',
        channel: 'WhatsApp + Email personalizado',
        message: 'Lead caliente - Contactar hoy',
        assignTo: 'Senior Sales Rep'
      },
      Warm: {
        priority: 'MEDIUM',
        responseTime: '< 4 horas',
        channel: 'Email + WhatsApp',
        message: 'Lead calificado - Seguimiento estándar',
        assignTo: 'Sales Rep'
      },
      Cold: {
        priority: 'LOW',
        responseTime: '< 24 horas',
        channel: 'Email automatizado',
        message: 'Lead para nurturing',
        assignTo: 'Marketing Automation'
      }
    };

    return strategies[level] || strategies.Cold;
  }
}

/**
 * Clase principal del formulario
 */
class MelanoFormSystem {
  constructor() {
    this.form = $('#demo-form');
    this.notifications = new NotificationSystem();
    this.analytics = new AnalyticsSystem();
    this.isSubmitting = false;
    this.init();
  }

  init() {
    if (!this.form) return;
    
    this.setupEventListeners();
    this.setupRealTimeValidation();
    this.trackFormViews();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Validación en tiempo real
    this.form.addEventListener('input', this.handleRealTimeValidation.bind(this));
    this.form.addEventListener('change', this.handleRealTimeValidation.bind(this));
  }

  setupRealTimeValidation() {
    const fields = this.form.querySelectorAll('input, select');
    fields.forEach(field => {
      field.addEventListener('blur', (e) => {
        this.validateField(e.target);
      });
    });
  }

  validateField(field) {
    const error = AdvancedValidator.getFieldError(field.name, field.value);
    this.showFieldError(field, error);
    return !error;
  }

  showFieldError(field, error) {
    // Remover error anterior
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    if (error) {
      field.style.borderColor = '#ef4444';
      const errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.style.cssText = `
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        font-weight: 600;
      `;
      errorEl.textContent = error;
      field.parentNode.appendChild(errorEl);
    } else {
      field.style.borderColor = '#10b981';
    }
  }

  trackFormViews() {
    this.analytics.trackEvent('form_view', {
      form_id: 'demo-form',
      page: 'contact'
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    this.analytics.trackEvent('form_submit_attempt');
    
    const formData = this.collectFormData();
    const validation = this.validateForm(formData);
    
    if (!validation.isValid) {
      this.handleValidationErrors(validation.errors);
      this.analytics.trackEvent('form_validation_error', {
        errors: validation.errors
      });
      return;
    }

    this.isSubmitting = true;
    this.setSubmitButton(true);

    try {
      await this.submitFormData(formData);
      this.handleSuccess();
      this.analytics.trackEvent('form_submit_success', {
        lead_score: formData.leadAnalysis.score,
        lead_level: formData.leadAnalysis.level
      });
    } catch (error) {
      this.handleError(error);
      this.analytics.trackEvent('form_submit_error', {
        error: error.message
      });
    } finally {
      this.isSubmitting = false;
      this.setSubmitButton(false);
    }
  }

  collectFormData() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());
    
    // Añadir datos adicionales
    data.urgency = $('#urgency')?.checked || false;
    data.decision = $('#decision')?.checked || false;
    data.timestamp = new Date().toISOString();
    data.sessionId = this.analytics.sessionId;
    data.utm = this.parseUTMParams();
    data.page_context = this.getPageContext();
    
    // Análisis de lead
    data.leadAnalysis = LeadScoringSystem.analyzeLeadQuality(data);
    data.followUpStrategy = LeadScoringSystem.getFollowUpStrategy(data.leadAnalysis);
    
    return data;
  }

  validateForm(data) {
    const errors = [];
    const requiredFields = ['name', 'email', 'phone', 'company', 'agents', 'revenue'];
    
    requiredFields.forEach(field => {
      const error = AdvancedValidator.getFieldError(field, data[field]);
      if (error) {
        errors.push({ field, message: error });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  handleValidationErrors(errors) {
    errors.forEach(({ field, message }) => {
      const fieldElement = this.form.querySelector(`[name="${field}"]`);
      if (fieldElement) {
        this.showFieldError(fieldElement, message);
        // Focus en el primer campo con error
        if (errors[0].field === field) {
          fieldElement.focus();
        }
      }
    });
    
    this.notifications.show(
      `Por favor corrige ${errors.length} campo${errors.length > 1 ? 's' : ''} marcado${errors.length > 1 ? 's' : ''} en rojo`,
      'error'
    );
  }

  async submitFormData(data) {
    const notifications = [];
    
    // 1. Lead capture principal
    this.updateStatus('Enviando tu solicitud de demo...', 'quantum');
    await this.sendToEndpoint(ENDPOINTS.leadCapture, data);
    notifications.push('Demo solicitada correctamente');

    // 2. Procesamiento especial para leads VIP/Hot
    if (data.leadAnalysis.isVIP) {
      this.updateStatus('Procesando como lead VIP...', 'quantum');
      await this.sendToEndpoint(ENDPOINTS.leadHot, {
        ...data,
        priority: 'VIP',
        alert_message: `🚨 LEAD VIP DETECTADO - Score: ${data.leadAnalysis.score}/100`,
        follow_up_strategy: data.followUpStrategy
      });
      notifications.push('Alerta VIP enviada al equipo');
    } else if (data.leadAnalysis.isHot) {
      this.updateStatus('Procesando como lead caliente...', 'quantum');
      await this.sendToEndpoint(ENDPOINTS.leadHot, {
        ...data,
        priority: 'HOT',
        alert_message: `🔥 LEAD CALIENTE - Score: ${data.leadAnalysis.score}/100`,
        follow_up_strategy: data.followUpStrategy
      });
      notifications.push('Alerta enviada al equipo de ventas');
    }

    // 3. Sincronización CRM
    this.updateStatus('Sincronizando con CRM...', 'info');
    await this.sendToEndpoint(ENDPOINTS.crmSync, data);
    notifications.push('Datos guardados en CRM');

    return notifications;
  }

  async sendToEndpoint(endpoint, data) {
    const response = await fetch(apiUrl(endpoint), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-ID': this.analytics.sessionId
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error en ${endpoint}: ${response.status}`);
    }

    return response.json().catch(() => ({}));
  }

  handleSuccess() {
    const leadLevel = this.form.dataset.leadLevel;
    const messages = {
      VIP: '🚀 ¡Demo VIP confirmada! Te contactaremos en los próximos 15 minutos por WhatsApp.',
      Hot: '🔥 ¡Solicitud recibida! Nuestro equipo te contactará en máximo 1 hora.',
      default: '✅ ¡Demo solicitada correctamente! Te contactaremos pronto para coordinar.'
    };

    this.notifications.show(
      messages[leadLevel] || messages.default,
      'success',
      8000
    );

    // Limpiar formulario
    this.form.reset();
    
    // Remover errores visuales
    this.form.querySelectorAll('.field-error').forEach(el => el.remove());
    this.form.querySelectorAll('input, select').forEach(field => {
      field.style.borderColor = '';
    });

    this.updateStatus('');

    // Redirect opcional para leads VIP
    if (leadLevel === 'VIP') {
      setTimeout(() => {
        this.notifications.show(
          '🎯 Redirigiendo a calendario VIP para agendar demo exclusiva...',
          'quantum'
        );
        // window.location.href = 'https://calendly.com/melano-vip-demo';
      }, 3000);
    }
  }

  handleError(error) {
    console.error('Form submission error:', error);
    
    let message = 'Hubo un problema al enviar tu solicitud. ';
    
    if (error.message.includes('Failed to fetch')) {
      message += 'Revisa tu conexión a internet e intenta nuevamente.';
    } else if (String(N8N_BASE_URL || '').includes('YOUR_N8N_PUBLIC_URL')) {
      message += 'El sistema está en configuración. Contacta por WhatsApp.';
    } else {
      message += 'Nuestro equipo ha sido notificado. Intenta nuevamente en unos minutos.';
    }

    this.notifications.show(message, 'error', 10000);
    this.updateStatus('');
  }

  setSubmitButton(loading) {
    const button = this.form.querySelector('button[type="submit"]');
    if (!button) return;

    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      button.innerHTML = '🧠 PROCESANDO CON IA CUÁNTICA...';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      button.innerHTML = '🧠 OBTENER DEMO DE IA CUÁNTICA';
    }
  }

  updateStatus(message, type = 'info') {
    const statusEl = $('#form-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.color = this.getStatusColor(type);
  }

  getStatusColor(type) {
    const colors = {
      quantum: '#5b2bc4',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#6b7280'
    };
    return colors[type] || colors.info;
  }

  parseUTMParams() {
    const params = new URLSearchParams(location.search);
    return {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      content: params.get('utm_content'),
      term: params.get('utm_term')
    };
  }

  getPageContext() {
    return {
      url: location.href,
      referrer: document.referrer,
      scrollDepth: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) || 0,
      timeOnPage: Date.now() - this.analytics.startTime,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
}

/**
 * Utilidades
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar sistema de formulario
  new MelanoFormSystem();
  
  // Smooth scrolling para navegación
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Header scroll effect
  const header = $('.site-header');
  if (header) {
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 15, 0.95)';
      } else {
        header.style.background = 'rgba(10, 10, 15, 0.85)';
      }
    }, 100));
  }

  // Lazy load de imágenes si las hubiera
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
});

// Exportar para uso global si es necesario
window.MelanoAI = {
  NotificationSystem,
  AnalyticsSystem,
  LeadScoringSystem,
  AdvancedValidator
};