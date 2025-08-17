// MELANO AI™ - Sistema Principal
// JavaScript principal para el CRM inmobiliario con IA

import { 
  N8N_BASE_URL, 
  ENDPOINTS, 
  CONTACT, 
  APP_CONFIG, 
  VALIDATION, 
  MESSAGES, 
  LEAD_SCORING,
  DEBUG 
} from './config.js';

// Estado global de la aplicación
const AppState = {
  isFormSubmitting: false,
  currentSection: 'inicio',
  leadScore: 0,
  sessionId: null,
  analytics: {
    pageViews: 0,
    timeOnPage: Date.now(),
    interactions: []
  }
};

// Utilidades generales
const Utils = {
  // Debounce para optimizar performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Validación de campos
  validateField(field, value) {
    if (!value || value.trim() === '') return false;
    
    switch (field) {
      case 'email':
        return VALIDATION.email.test(value);
      case 'phone':
        return VALIDATION.phone.test(value.replace(/\s/g, ''));
      case 'name':
        return VALIDATION.name.test(value);
      default:
        return value.length >= 2;
    }
  },

  // Formatear teléfono
  formatPhone(phone) {
    return phone.replace(/\D/g, '').replace(/^(\d{2})(\d{4})(\d{4})/, '+54 9 $1 $2 $3');
  },

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Scroll suave
  smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

// Sistema de Lead Scoring
const LeadScoring = {
  calculateScore(formData) {
    let score = 0;
    const factors = LEAD_SCORING.factors;
    
    // Revenue scoring
    if (formData.revenue && factors.revenue[formData.revenue]) {
      score += factors.revenue[formData.revenue];
    }
    
    // Agents scoring
    if (formData.agents && factors.agents[formData.agents]) {
      score += factors.agents[formData.agents];
    }
    
    // Urgency bonus
    if (formData.urgency) {
      score += factors.urgency;
    }
    
    // Decision maker bonus
    if (formData.decision) {
      score += factors.decision;
    }
    
    // Challenge scoring
    if (formData.challenge && factors.challenge[formData.challenge]) {
      score += factors.challenge[formData.challenge];
    }
    
    return Math.min(score, 100);
  },

  getLeadType(score) {
    const thresholds = LEAD_SCORING.thresholds;
    if (score >= thresholds.hot) return 'hot';
    if (score >= thresholds.warm) return 'warm';
    return 'cold';
  },

  getRecommendedAction(score, leadType) {
    switch (leadType) {
      case 'hot':
        return 'Contactar inmediatamente por WhatsApp';
      case 'warm':
        return 'Agendar demo en 24-48h';
      case 'cold':
        return 'Nurturing automático por email';
      default:
        return 'Seguimiento estándar';
    }
  }
};

// Sistema de Analytics
const Analytics = {
  track(event, data = {}) {
    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: AppState.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };
    
    AppState.analytics.interactions.push(eventData);
    
    if (DEBUG) {
      console.log('📊 Analytics Event:', eventData);
    }
    
    // Enviar a n8n si está configurado
    this.sendToN8N(eventData);
  },

  async sendToN8N(data) {
    try {
      const response = await fetch(`${N8N_BASE_URL}${ENDPOINTS.ANALYTICS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (DEBUG) {
        console.warn('Analytics error:', error);
      }
    }
  },

  // Tracking de tiempo en página
  startTimeTracking() {
    AppState.analytics.timeOnPage = Date.now();
    
    // Track al salir de la página
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - AppState.analytics.timeOnPage;
      this.track('page_exit', { timeSpent });
    });
  }
};

// Sistema de Formularios
const FormSystem = {
  async submitForm(formData) {
    if (AppState.isFormSubmitting) return;
    
    AppState.isFormSubmitting = true;
    const statusEl = document.getElementById('form-status');
    
    try {
      // Mostrar loading
      this.showStatus('loading', MESSAGES.loading.form);
      
      // Calcular lead score
      const leadScore = LeadScoring.calculateScore(formData);
      const leadType = LeadScoring.getLeadType(leadScore);
      
      // Preparar datos para envío
      const payload = {
        ...formData,
        leadScore,
        leadType,
        timestamp: new Date().toISOString(),
        sessionId: AppState.sessionId,
        source: 'melano-ai-landing',
        userAgent: navigator.userAgent,
        referrer: document.referrer
      };
      
      // Enviar a n8n
      const response = await fetch(`${N8N_BASE_URL}${ENDPOINTS.LEAD_CAPTURE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: APP_CONFIG.forms.timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Éxito
      this.showStatus('success', MESSAGES.success.form);
      Analytics.track('form_submit_success', { leadScore, leadType });
      
      // Redirigir a WhatsApp después de 2 segundos
      setTimeout(() => {
        this.redirectToWhatsApp(formData);
      }, 2000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showStatus('error', MESSAGES.error.network);
      Analytics.track('form_submit_error', { error: error.message });
      
      // Fallback a WhatsApp
      setTimeout(() => {
        this.redirectToWhatsApp(formData);
      }, 3000);
      
    } finally {
      AppState.isFormSubmitting = false;
    }
  },

  showStatus(type, message) {
    const statusEl = document.getElementById('form-status');
    if (!statusEl) return;
    
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
  },

  redirectToWhatsApp(formData) {
    const message = `Hola Bruno! Soy ${formData.name} de ${formData.company}. Quiero una demo de MELANO AI. Mi WhatsApp: ${formData.phone}`;
    const whatsappUrl = `${CONTACT.whatsapp}&text=${encodeURIComponent(message)}`;
    
    this.showStatus('loading', MESSAGES.loading.redirect);
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1000);
  },

  validateForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const errors = [];
    
    // Validaciones requeridas
    if (!Utils.validateField('name', data.name)) {
      errors.push('Nombre inválido');
    }
    
    if (!Utils.validateField('email', data.email)) {
      errors.push('Email inválido');
    }
    
    if (!Utils.validateField('phone', data.phone)) {
      errors.push('Teléfono inválido');
    }
    
    if (!data.company || data.company.trim().length < 2) {
      errors.push('Nombre de empresa requerido');
    }
    
    if (!data.agents) {
      errors.push('Selecciona número de agentes');
    }
    
    if (!data.revenue) {
      errors.push('Selecciona revenue mensual');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data
    };
  }
};

// Sistema de Navegación
const Navigation = {
  init() {
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        Utils.smoothScroll(target);
        Analytics.track('navigation_click', { target });
      });
    });
    
    // Tracking de secciones visibles
    this.setupIntersectionObserver();
  },

  setupIntersectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          AppState.currentSection = entry.target.id;
          Analytics.track('section_view', { section: entry.target.id });
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
  }
};

// Sistema de Animaciones
const Animations = {
  init() {
    this.setupScrollAnimations();
    this.initParticles();
    this.startCountdown();
    this.animateStats();
  },

  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card-glow, .feature-quantum, .case-study');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `all ${APP_CONFIG.ui.animationDuration}ms ease`;
      observer.observe(el);
    });
  },

  initParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('particles-bg');
    
    if (!container) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    
    const particles = [];
    
    for (let i = 0; i < APP_CONFIG.ui.particlesCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 43, 196, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  },

  startCountdown() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + APP_CONFIG.ui.countdownDays);
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      const daysEl = document.getElementById('days');
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      
      if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
      
      if (distance < 0) {
        endDate.setDate(endDate.getDate() + APP_CONFIG.ui.countdownDays);
      }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 60000);
  },

  animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number, .result-big, .proof-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateNumber(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
  },

  animateNumber(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/\D/g, ''));
    const prefix = text.match(/^[^\d]*/)[0];
    const suffix = text.match(/[^\d]*$/)[0];
    
    if (isNaN(number)) return;
    
    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        current = number;
        clearInterval(timer);
      }
      element.textContent = prefix + Math.floor(current) + suffix;
    }, 30);
  }
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
  // Generar session ID
  AppState.sessionId = Utils.generateId();
  
  // Inicializar sistemas
  Navigation.init();
  Animations.init();
  Analytics.startTimeTracking();
  
  // Configurar formulario
  const form = document.getElementById('demo-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const validation = FormSystem.validateForm(form);
      
      if (!validation.isValid) {
        FormSystem.showStatus('error', validation.errors.join(', '));
        return;
      }
      
      await FormSystem.submitForm(validation.data);
    });
    
    // Validación en tiempo real
    if (APP_CONFIG.forms.validateOnBlur) {
      form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('blur', () => {
          const isValid = Utils.validateField(field.name, field.value);
          field.classList.toggle('invalid', !isValid);
        });
      });
    }
  }
  
  // Configurar WhatsApp flotante
  const waFloat = document.getElementById('floating-whatsapp');
  if (waFloat) {
    waFloat.href = CONTACT.whatsapp;
    waFloat.classList.remove('hide-nojs');
    
    waFloat.addEventListener('click', () => {
      Analytics.track('whatsapp_click', { source: 'floating_button' });
    });
  }
  
  // Configurar Calendly
  document.querySelectorAll('.calendly-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const url = trigger.dataset.calendlyUrl || CONTACT.calendly;
      
      if (url.startsWith('http')) {
        e.preventDefault();
        
        if (window.Calendly && typeof Calendly.initPopupWidget === 'function') {
          Calendly.initPopupWidget({ url });
        } else {
          window.open(url, '_blank', 'noopener');
        }
        
        Analytics.track('calendly_click', { url });
      }
    });
  });
  
  // Tracking inicial
  Analytics.track('page_load', {
    referrer: document.referrer,
    userAgent: navigator.userAgent
  });
  
  // Spots animation
  const spotsEl = document.getElementById('spots-left');
  if (spotsEl) {
    let spots = 8;
    setInterval(() => {
      if (Math.random() < 0.1) {
        spots = Math.max(3, spots - 1);
        spotsEl.textContent = spots;
      }
    }, 30000);
  }
  
  if (DEBUG) {
    console.log('🚀 MELANO AI™ initialized', {
      version: APP_CONFIG.version,
      sessionId: AppState.sessionId,
      config: APP_CONFIG
    });
    
    // Exponer para debugging
    window.__MELANO_AI__ = {
      AppState,
      Utils,
      LeadScoring,
      Analytics,
      FormSystem,
      config: { N8N_BASE_URL, ENDPOINTS, CONTACT, APP_CONFIG }
    };
  }
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
  Analytics.track('javascript_error', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno
  });
  
  if (DEBUG) {
    console.error('Global error:', e);
  }
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        if (DEBUG) {
          console.log('SW registered: ', registration);
        }
      })
      .catch(registrationError => {
        if (DEBUG) {
          console.log('SW registration failed: ', registrationError);
        }
      });
  });
}