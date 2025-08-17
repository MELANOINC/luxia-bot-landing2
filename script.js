// MELANO AI™ - CRM Inmobiliario con IA Cuántica
// Copyright 2025 Melano Inc. Todos los derechos reservados.

// Configuración global
window.MELANO_CONF = {
  webhookURL: "https://n8n.brunomelano.com/webhook/melano_lead",
  whatsappNumber: "+5492235506595",
  calendlyURL: "https://calendly.com/melanobruno",
  version: "2.1.0"
};

// Utilidades
const utils = {
  // Validación de email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validación de teléfono
  isValidPhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  // Formatear número de teléfono
  formatPhone(phone) {
    return phone.replace(/[\s\-\(\)]/g, '');
  },

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function
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
  }
};

// Sistema de Analytics
const analytics = {
  // Tracking de eventos
  track(event, properties = {}) {
    try {
      const data = {
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId()
        }
      };
      
      // Enviar a analytics endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(console.error);
      
      console.log('📊 Analytics:', event, properties);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  // Obtener session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('melano_session_id');
    if (!sessionId) {
      sessionId = utils.generateId();
      sessionStorage.setItem('melano_session_id', sessionId);
    }
    return sessionId;
  },

  // Tracking de formulario
  trackFormInteraction(field, value) {
    this.track('form_field_interaction', {
      field,
      hasValue: !!value,
      valueLength: value ? value.length : 0
    });
  }
};

// Sistema de Lead Scoring
const leadScoring = {
  // Calcular score de lead
  calculateScore(formData) {
    let score = 0;
    const factors = {
      // Email corporativo
      corporateEmail: formData.email && !formData.email.includes('@gmail.com') && !formData.email.includes('@hotmail.com') ? 15 : 0,
      
      // Número de agentes (indica tamaño de empresa)
      agentCount: this.getAgentScore(formData.agents),
      
      // Revenue mensual
      revenue: this.getRevenueScore(formData.revenue),
      
      // Urgencia
      urgency: formData.urgency ? 20 : 0,
      
      // Autoridad de decisión
      decision: formData.decision ? 25 : 0,
      
      // Completitud del formulario
      completeness: this.getCompletenessScore(formData)
    };

    score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    
    return {
      score: Math.min(100, score),
      factors,
      tier: this.getTier(score)
    };
  },

  getAgentScore(agents) {
    const scores = {
      '1-5': 5,
      '6-15': 10,
      '16-30': 15,
      '31-50': 20,
      '50+': 25
    };
    return scores[agents] || 0;
  },

  getRevenueScore(revenue) {
    const scores = {
      'lt-100k': 5,
      '100k-500k': 10,
      '500k-1m': 15,
      '1m-5m': 20,
      '5m+': 25
    };
    return scores[revenue] || 0;
  },

  getCompletenessScore(data) {
    const fields = ['name', 'email', 'phone', 'company', 'agents', 'revenue'];
    const completed = fields.filter(field => data[field] && data[field].trim()).length;
    return Math.round((completed / fields.length) * 15);
  },

  getTier(score) {
    if (score >= 80) return 'VIP';
    if (score >= 60) return 'HOT';
    if (score >= 40) return 'WARM';
    return 'COLD';
  }
};

// Sistema de Formularios
const formHandler = {
  init() {
    const form = document.getElementById('demo-form');
    if (!form) return;

    // Event listeners
    form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Tracking de campos
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('change', () => {
        analytics.trackFormInteraction(field.name, field.value);
      });
    });

    // Validación en tiempo real
    this.setupRealTimeValidation(form);
  },

  setupRealTimeValidation(form) {
    const emailField = form.querySelector('#email');
    const phoneField = form.querySelector('#phone');

    if (emailField) {
      emailField.addEventListener('blur', () => {
        this.validateField(emailField, utils.isValidEmail(emailField.value));
      });
    }

    if (phoneField) {
      phoneField.addEventListener('blur', () => {
        this.validateField(phoneField, utils.isValidPhone(phoneField.value));
      });
    }
  },

  validateField(field, isValid) {
    field.classList.toggle('error', !isValid);
    field.classList.toggle('valid', isValid);
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validación
    if (!this.validateForm(data)) {
      this.showStatus('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Calcular lead score
    const scoring = leadScoring.calculateScore(data);
    
    // Preparar datos para envío
    const leadData = {
      ...data,
      score: scoring.score,
      tier: scoring.tier,
      timestamp: new Date().toISOString(),
      source: 'web_form',
      sessionId: analytics.getSessionId(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.showStatus('Procesando solicitud...', 'loading');
    
    try {
      // Enviar a webhook
      const response = await fetch(window.MELANO_CONF.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        // Tracking de conversión
        analytics.track('form_submitted', {
          leadTier: scoring.tier,
          leadScore: scoring.score,
          formType: 'demo_request'
        });

        this.showStatus('¡Solicitud enviada! Te contactaremos en las próximas 2 horas.', 'success');
        
        // Redirect a WhatsApp para leads VIP
        if (scoring.tier === 'VIP') {
          setTimeout(() => {
            const waMessage = `Hola! Soy ${data.name} de ${data.company}. Acabo de solicitar una demo VIP de MELANO AI. Mi email: ${data.email}`;
            const waURL = `https://wa.me/${window.MELANO_CONF.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(waMessage)}`;
            window.open(waURL, '_blank');
          }, 2000);
        }
        
        form.reset();
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showStatus('Error al enviar. Intenta nuevamente o contáctanos por WhatsApp.', 'error');
      
      // Fallback a WhatsApp
      setTimeout(() => {
        const waMessage = `Hola! Soy ${data.name} de ${data.company}. Quiero una demo de MELANO AI. Email: ${data.email}`;
        const waURL = `https://wa.me/${window.MELANO_CONF.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(waMessage)}`;
        window.open(waURL, '_blank');
      }, 3000);
    }
  },

  validateForm(data) {
    const required = ['name', 'email', 'phone', 'company'];
    return required.every(field => data[field] && data[field].trim());
  },

  showStatus(message, type) {
    const statusEl = document.getElementById('form-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }, 5000);
    }
  }
};

// Sistema de Navegación
const navigation = {
  init() {
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Analytics
          analytics.track('navigation_click', {
            target: anchor.getAttribute('href'),
            text: anchor.textContent.trim()
          });
        }
      });
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', utils.debounce(() => {
      const currentScroll = window.pageYOffset;
      const header = document.querySelector('.site-header');
      
      if (header) {
        if (currentScroll > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        
        if (currentScroll > lastScroll && currentScroll > 200) {
          header.classList.add('hidden');
        } else {
          header.classList.remove('hidden');
        }
      }
      
      lastScroll = currentScroll;
    }, 10));
  }
};

// Sistema de Animaciones
const animations = {
  init() {
    // Intersection Observer para animaciones
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Analytics de sección vista
          analytics.track('section_viewed', {
            section: entry.target.id || entry.target.className
          });
        }
      });
    }, { threshold: 0.1 });

    // Observar secciones
    document.querySelectorAll('section, .case-study, .feature-quantum').forEach(el => {
      observer.observe(el);
    });

    // Animación de números
    this.animateCounters();
  },

  animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .result-big, .proof-number');
    
    counters.forEach(counter => {
      const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
      if (isNaN(target)) return;
      
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        
        const prefix = counter.textContent.match(/^[^\d]*/)[0];
        const suffix = counter.textContent.match(/[^\d]*$/)[0];
        counter.textContent = prefix + Math.floor(current) + suffix;
      }, 40);
    });
  }
};

// Sistema de Partículas
const particles = {
  init() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('particles-bg');
    
    if (!container) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    
    const particleArray = [];
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
    
    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      particleArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: this.getRandomColor()
      });
    }
    
    // Animar partículas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particleArray.forEach(particle => {
        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Rebote en bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  },

  getRandomColor() {
    const colors = [
      'rgba(91, 43, 196, 0.6)',   // Púrpura cuántico
      'rgba(255, 107, 53, 0.6)',  // Naranja energético
      'rgba(0, 212, 170, 0.6)',   // Verde aqua
      'rgba(255, 215, 0, 0.6)'    // Dorado premium
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
};

// Sistema de Countdown
const countdown = {
  init() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 6); // 6 días desde hoy
    endDate.setHours(23, 59, 59, 999);
    
    const update = () => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      
      if (distance < 0) {
        // Reset countdown
        endDate.setDate(endDate.getDate() + 7);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      const elements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes')
      };
      
      if (elements.days) elements.days.textContent = days.toString().padStart(2, '0');
      if (elements.hours) elements.hours.textContent = hours.toString().padStart(2, '0');
      if (elements.minutes) elements.minutes.textContent = minutes.toString().padStart(2, '0');
    };
    
    update();
    setInterval(update, 60000); // Actualizar cada minuto
  }
};

// Sistema de Spots Disponibles
const spotsSystem = {
  init() {
    const spotsEl = document.getElementById('spots-left');
    if (!spotsEl) return;
    
    let spots = 8; // Número inicial realista
    
    // Simular reducción de spots
    const reduceSpots = () => {
      if (Math.random() < 0.15 && spots > 2) { // 15% probabilidad
        spots--;
        spotsEl.textContent = spots;
        
        // Analytics
        analytics.track('spots_reduced', { remainingSpots: spots });
        
        // Efecto visual
        spotsEl.style.transform = 'scale(1.2)';
        spotsEl.style.color = '#ff6b35';
        setTimeout(() => {
          spotsEl.style.transform = 'scale(1)';
          spotsEl.style.color = '';
        }, 300);
      }
    };
    
    // Reducir spots cada 45-90 segundos
    setInterval(reduceSpots, Math.random() * 45000 + 45000);
  }
};

// Sistema de WhatsApp
const whatsappSystem = {
  init() {
    const waButton = document.getElementById('floating-whatsapp');
    if (!waButton) return;

    // Configurar enlace
    const waMessage = "Hola! Quiero una demo VIP de MELANO AI. ¿Pueden contactarme?";
    const waURL = `https://wa.me/${window.MELANO_CONF.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(waMessage)}`;
    
    waButton.href = waURL;
    waButton.classList.remove('hide-nojs');

    // Analytics
    waButton.addEventListener('click', () => {
      analytics.track('whatsapp_clicked', {
        source: 'floating_button',
        message: waMessage
      });
    });

    // Mostrar después de 10 segundos
    setTimeout(() => {
      waButton.classList.add('show');
    }, 10000);
  }
};

// Sistema de Demo Interactivo
const demoSystem = {
  init() {
    this.animatePredictions();
    this.animatePipeline();
    this.updateMetrics();
  },

  animatePredictions() {
    const predictions = document.querySelectorAll('.prediction-item');
    
    predictions.forEach((pred, index) => {
      setTimeout(() => {
        pred.classList.add('animate-in');
      }, index * 500);
    });

    // Actualizar scores periódicamente
    setInterval(() => {
      predictions.forEach(pred => {
        const scoreEl = pred.querySelector('.prediction-score');
        if (scoreEl && Math.random() < 0.3) {
          const currentScore = parseInt(scoreEl.textContent.match(/\d+/)[0]);
          const newScore = Math.max(45, Math.min(95, currentScore + (Math.random() - 0.5) * 4));
          scoreEl.textContent = scoreEl.textContent.replace(/\d+%/, Math.round(newScore) + '%');
        }
      });
    }, 15000);
  },

  animatePipeline() {
    const stages = document.querySelectorAll('.pipeline-stage');
    
    stages.forEach((stage, index) => {
      setTimeout(() => {
        stage.classList.add('animate-in');
      }, index * 300);
    });
  },

  updateMetrics() {
    const revenueEl = document.querySelector('.quantum-text');
    const probabilityEl = document.querySelector('.success-text');
    
    if (revenueEl) {
      setInterval(() => {
        const current = parseFloat(revenueEl.textContent.replace(/[^\d.]/g, ''));
        const variation = (Math.random() - 0.5) * 0.2;
        const newValue = Math.max(1.8, Math.min(2.8, current + variation));
        revenueEl.textContent = `$${newValue.toFixed(1)}M`;
      }, 8000);
    }
  }
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 MELANO AI™ CRM Iniciando...');
  
  // Inicializar sistemas
  formHandler.init();
  navigation.init();
  animations.init();
  particles.init();
  countdown.init();
  spotsSystem.init();
  whatsappSystem.init();
  demoSystem.init();
  
  // Analytics inicial
  analytics.track('page_loaded', {
    page: 'landing',
    version: window.MELANO_CONF.version
  });
  
  console.log('✅ MELANO AI™ CRM Listo');
});

// Manejo de errores global
window.addEventListener('error', (e) => {
  console.error('Error capturado:', e.error);
  analytics.track('javascript_error', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno
  });
});

// Exportar para debug
window.MELANO_AI = {
  utils,
  analytics,
  leadScoring,
  formHandler,
  version: window.MELANO_CONF.version
};