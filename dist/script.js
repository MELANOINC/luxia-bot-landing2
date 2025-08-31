// MELANO AI™ - Sistema Principal
// Configuración y funcionalidades del CRM con IA Cuántica

import { N8N_BASE_URL, ENDPOINTS, CONTACT } from './config.js';

// Estado global de la aplicación
const AppState = {
  leads: [],
  currentUser: null,
  isLoading: false,
  formData: {}
};

// Configuración de CTAs y enlaces
function initCTALinks() {
  const waFloat = document.getElementById('floating-whatsapp');
  const waLink = (CONTACT && CONTACT.whatsapp) ? 
    (CONTACT.whatsapp.startsWith('http') ? CONTACT.whatsapp : ('https://' + CONTACT.whatsapp)) : 
    'https://wa.me/5492235506595?text=Quiero%20una%20demo%20de%20MELANO%20AI';

  if (waFloat) {
    waFloat.href = waLink;
    waFloat.classList.remove('hide-nojs');
  }
}

// Calendly triggers
function initCalendlyTriggers() {
  document.querySelectorAll('.calendly-trigger').forEach(el => {
    el.addEventListener('click', e => {
      const url = el.dataset.calendlyUrl || 'https://calendly.com/melanobruno';
      if (url.startsWith('http')) {
        e.preventDefault();
        if (window.Calendly && typeof Calendly.initPopupWidget === 'function') {
          Calendly.initPopupWidget({ url });
        } else {
          window.open(url, '_blank', 'noopener');
        }
      }
    });
  });
}

// Countdown timer
function initCountdown() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // 7 días desde hoy
  
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
      // Reset countdown
      endDate.setDate(endDate.getDate() + 7);
    }
  }
  
  updateCountdown();
  setInterval(updateCountdown, 60000); // Actualizar cada minuto
}

// Spots left animation
function animateSpots() {
  const spotsEl = document.getElementById('spots-left');
  if (spotsEl) {
    let spots = 8;
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% de probabilidad cada intervalo
        spots = Math.max(3, spots - 1);
        spotsEl.textContent = spots;
      }
    }, 30000); // Cada 30 segundos
  }
}

// Partículas de fondo
function initParticles() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const particlesContainer = document.getElementById('particles-bg');
  
  if (!particlesContainer) return;
  
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0.6';
  
  particlesContainer.appendChild(canvas);
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  const particles = [];
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1
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
      ctx.fillStyle = 'rgba(91, 43, 196, 0.3)';
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Sistema de Lead Scoring
const LeadScoring = {
  calculateScore(formData) {
    let score = 0;
    
    // Scoring basado en revenue mensual
    const revenueScores = {
      'lt-100k': 10,
      '100k-500k': 25,
      '500k-1m': 40,
      '1m-5m': 60,
      '5m+': 80
    };
    score += revenueScores[formData.revenue] || 0;
    
    // Scoring basado en número de agentes
    const agentScores = {
      '1-5': 15,
      '6-15': 30,
      '16-30': 50,
      '31-50': 70,
      '50+': 85
    };
    score += agentScores[formData.agents] || 0;
    
    // Bonus por urgencia
    if (formData.urgency) score += 15;
    
    // Bonus por autoridad de decisión
    if (formData.decision) score += 10;
    
    // Bonus por desafíos específicos
    const challengeBonus = {
      'lead-quality': 5,
      'conversion': 10,
      'follow-up': 8,
      'scale': 12,
      'competition': 15,
      'efficiency': 7
    };
    score += challengeBonus[formData.challenge] || 0;
    
    return Math.min(score, 100);
  },

  getLeadCategory(score) {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    if (score >= 40) return 'qualified';
    return 'cold';
  },

  getCategoryLabel(category) {
    const labels = {
      hot: '🔥 ULTRA-HOT',
      warm: '⭐ HOT',
      qualified: '👍 WARM',
      cold: '❄️ COLD'
    };
    return labels[category] || '❓ Unknown';
  }
};

// Gestión de formularios
const FormHandler = {
  async submitForm(formData) {
    try {
      const score = LeadScoring.calculateScore(formData);
      const category = LeadScoring.getLeadCategory(score);
      
      const leadData = {
        ...formData,
        score,
        category,
        timestamp: new Date().toISOString(),
        source: 'landing_page'
      };
      
      // Enviar a n8n (si está configurado)
      if (N8N_BASE_URL && ENDPOINTS.leadCapture) {
        await fetch(`${N8N_BASE_URL}${ENDPOINTS.leadCapture}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });
      }
      
      // Guardar localmente
      const leads = JSON.parse(localStorage.getItem('melano_leads') || '[]');
      leads.push(leadData);
      localStorage.setItem('melano_leads', JSON.stringify(leads));
      
      // Redirigir a WhatsApp con mensaje personalizado
      const message = this.createWhatsAppMessage(leadData);
      const waUrl = `https://wa.me/5492235506595?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      
      return { success: true, score, category };
      
    } catch (error) {
      console.error('Error submitting form:', error);
      return { success: false, error: error.message };
    }
  },

  createWhatsAppMessage(leadData) {
    const categoryEmoji = {
      hot: '🔥',
      warm: '⭐',
      qualified: '👍',
      cold: '❄️'
    };
    
    return `${categoryEmoji[leadData.category]} NUEVO LEAD SCORE: ${leadData.score}/100

👤 ${leadData.name}
🏢 ${leadData.company}
📧 ${leadData.email}
👥 ${leadData.agents} agentes
💰 Revenue: ${leadData.revenue}

${leadData.urgency ? '🚨 URGENTE: Necesita solución en 30 días' : ''}
${leadData.decision ? '✅ Tiene autoridad de decisión' : ''}

Desafío principal: ${leadData.challenge}

---
MELANO AI™ - Lead generado desde landing`;
  }
};

// Inicialización principal
function initApp() {
  // Inicializar componentes
  initCTALinks();
  initCalendlyTriggers();
  initCountdown();
  animateSpots();
  initParticles();
  
  // Configurar formulario principal
  const demoForm = document.getElementById('demo-form');
  if (demoForm) {
    demoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(demoForm);
      const data = {};
      
      formData.forEach((value, key) => {
        if (key === 'urgency' || key === 'decision') {
          data[key] = document.getElementById(key).checked;
        } else {
          data[key] = value;
        }
      });
      
      // Validación básica
      const requiredFields = ['name', 'email', 'phone', 'company', 'agents', 'revenue'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        document.getElementById('form-status').innerHTML = 
          `❌ Por favor completa: ${missingFields.join(', ')}`;
        return;
      }
      
      // Mostrar loading
      const submitBtn = demoForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '⏳ Procesando...';
      submitBtn.disabled = true;
      
      // Enviar formulario
      const result = await FormHandler.submitForm(data);
      
      if (result.success) {
        document.getElementById('form-status').innerHTML = 
          `✅ ¡Perfecto! Lead Score: ${result.score}/100 (${LeadScoring.getCategoryLabel(result.category)})`;
        demoForm.reset();
      } else {
        document.getElementById('form-status').innerHTML = 
          `❌ Error: ${result.error}`;
      }
      
      // Restaurar botón
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    });
  }
  
  // Animaciones y efectos visuales
  initVisualEffects();
}

// Efectos visuales adicionales
function initVisualEffects() {
  // Smooth scroll para navegación
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
  
  // Animaciones de aparición en scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observar elementos para animación
  document.querySelectorAll('.feature-quantum, .case-study, .price-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);

// Exportar funciones principales para uso externo
export { AppState, LeadScoring, FormHandler };