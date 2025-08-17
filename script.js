// MELANO AI™ - Sistema Principal
// JavaScript principal para el CRM inmobiliario con IA

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

  validateField(field, value) {
    if (!value || value.trim() === '') return false;
    
    const config = window.MELANO_CONFIG;
    if (!config) return false;
    
    switch (field) {
      case 'email':
        return config.VALIDATION.email.test(value);
      case 'phone':
        return config.VALIDATION.phone.test(value.replace(/\s/g, ''));
      case 'name':
        return config.VALIDATION.name.test(value);
      default:
        return value.length >= 2;
    }
  },

  formatPhone(phone) {
    return phone.replace(/\D/g, '').replace(/^(\d{2})(\d{4})(\d{4})/, '+54 9 $1 $2 $3');
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

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
    const config = window.MELANO_CONFIG;
    if (!config) return 0;
    
    let score = 0;
    const factors = config.LEAD_SCORING.factors;
    
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
    const config = window.MELANO_CONFIG;
    if (!config) return 'cold';
    
    const thresholds = config.LEAD_SCORING.thresholds;
    if (score >= thresholds.hot) return 'hot';
    if (score >= thresholds.warm) return 'warm';
    return 'cold';
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
    console.log('📊 Analytics Event:', eventData);
  },

  startTimeTracking() {
    AppState.analytics.timeOnPage = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - AppState.analytics.timeOnPage;
      this.track('page_exit', { timeSpent });
    });
  }
};

// Sistema de Formularios
const FormSystem = {
  async submitForm(formData) {
    const config = window.MELANO_CONFIG;
    if (!config || AppState.isFormSubmitting) return;
    
    AppState.isFormSubmitting = true;
    
    try {
      this.showStatus('loading', config.MESSAGES.loading.form);
      
      const leadScore = LeadScoring.calculateScore(formData);
      const leadType = LeadScoring.getLeadType(leadScore);
      
      const payload = {
        ...formData,
        leadScore,
        leadType,
        timestamp: new Date().toISOString(),
        sessionId: AppState.sessionId,
        source: 'melano-ai-landing'
      };
      
      const response = await fetch(`${config.N8N_BASE_URL}${config.ENDPOINTS.LEAD_CAPTURE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        this.showStatus('success', config.MESSAGES.success.form);
        Analytics.track('form_submit_success', { leadScore, leadType });
        
        setTimeout(() => {
          this.redirectToWhatsApp(formData);
        }, 2000);
      } else {
        throw new Error('Network error');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showStatus('error', config.MESSAGES.error.network);
      
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
    const config = window.MELANO_CONFIG;
    if (!config) return;
    
    const message = `Hola Bruno! Soy ${formData.name} de ${formData.company}. Quiero una demo de MELANO AI. Mi WhatsApp: ${formData.phone}`;
    const whatsappUrl = `${config.CONTACT.whatsapp}&text=${encodeURIComponent(message)}`;
    
    this.showStatus('loading', config.MESSAGES.loading.redirect);
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1000);
  },

  validateForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const errors = [];
    
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
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        Utils.smoothScroll(target);
        Analytics.track('navigation_click', { target });
      });
    });
    
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
    this.animateSpots();
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
      el.style.transition = 'all 300ms ease';
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
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
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
    endDate.setDate(endDate.getDate() + 7);
    
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
        endDate.setDate(endDate.getDate() + 7);
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
  },

  animateSpots() {
    const spotsEl = document.getElementById('spots-left');
    if (spotsEl) {
      let spots = 6;
      setInterval(() => {
        if (Math.random() < 0.1) {
          spots = Math.max(3, spots - 1);
          spotsEl.textContent = spots;
        }
      }, 30000);
    }
  }
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 MELANO AI™ iniciando...');
  
  // Verificar configuración
  if (!window.MELANO_CONFIG) {
    console.error('❌ Configuración no cargada');
    return;
  }
  
  const config = window.MELANO_CONFIG;
  
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
    form.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('blur', () => {
        const isValid = Utils.validateField(field.name, field.value);
        field.classList.toggle('invalid', !isValid);
      });
    });
  }
  
  // Configurar WhatsApp flotante
  const waFloat = document.getElementById('floating-whatsapp');
  if (waFloat) {
    waFloat.href = config.CONTACT.whatsapp;
    waFloat.classList.remove('hide-nojs');
    
    waFloat.addEventListener('click', () => {
      Analytics.track('whatsapp_click', { source: 'floating_button' });
    });
  }
  
  // Configurar Calendly
  document.querySelectorAll('.calendly-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const url = trigger.dataset.calendlyUrl || config.CONTACT.calendly;
      
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
  
  console.log('✅ MELANO AI™ listo');
  
  // Exponer para debugging
  window.__MELANO_AI__ = {
    AppState,
    Utils,
    LeadScoring,
    Analytics,
    FormSystem,
    config
  };
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
  Analytics.track('javascript_error', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno
  });
  
  console.error('Global error:', e);
});