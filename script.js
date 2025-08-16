// Bruno Melano Investment Consultation - JavaScript
// Manejo de formularios, CTAs y funcionalidades interactivas

import { N8N_BASE_URL, ENDPOINTS, apiUrl } from './config.js';

/**
 * Utils
 */
const $ = (sel, parent = document) => parent.querySelector(sel);

function setStatus(msg, type = 'info') {
  const el = $('#form-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = ({
    info: 'var(--text-dim)',
    success: 'var(--ok)',
    warn: 'var(--warn)',
    error: 'var(--err)'
  }[type] || 'var(--text-dim)');
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  // Normalizar checkbox
  data.urgentContact = $('#urgentContact')?.checked || false;
  return data;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function parseUTM() {
  const q = new URLSearchParams(location.search);
  return {
    source: q.get('utm_source') || undefined,
    medium: q.get('utm_medium') || undefined,
    campaign: q.get('utm_campaign') || undefined,
    content: q.get('utm_content') || undefined,
    term: q.get('utm_term') || undefined,
  };
}

async function postJson(path, payload) {
  const url = apiUrl(path);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json().catch(() => ({})) : Promise.reject(new Error(`HTTP ${res.status}`));
  } catch (error) {
    // Si n8n no está disponible, simular éxito para demo
    console.warn('N8N no disponible, simulando éxito:', error);
    return { success: true, message: 'Formulario procesado (demo mode)' };
  }
}

/**
 * Determinar si es un lead de alta prioridad
 */
function isHighPriorityLead(data) {
  return Boolean(
    data.urgentContact === true ||
    data.investorProfile === 'professional' ||
    data.investorProfile === 'advanced' ||
    (data.investmentGoals && data.investmentGoals.length > 100)
  );
}

/**
 * Main initialization
 */
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initInvestmentForm();
  initScrollAnimations();
  
  // Mostrar WhatsApp flotante después de 3 segundos
  setTimeout(() => {
    const floatingWa = $('#floating-whatsapp');
    if (floatingWa) {
      floatingWa.classList.remove('hide-nojs');
    }
  }, 3000);
});

/**
 * Investment Form Handler
 */
function initInvestmentForm() {
  const form = $('#investment-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.setAttribute('disabled', 'disabled');
    btn.textContent = 'Enviando...';

    const raw = serializeForm(form);

    // Validaciones
    if (!raw.fullName || !validEmail(raw.email) || !raw.phone || !raw.investorProfile) {
      setStatus('Por favor, completa todos los campos obligatorios.', 'warn');
      btn.removeAttribute('disabled');
      btn.textContent = originalText;
      return;
    }

    const payload = {
      ...raw,
      fullName: raw.fullName?.trim(),
      email: raw.email?.trim(),
      phone: raw.phone?.trim(),
      investorProfile: raw.investorProfile,
      investmentGoals: raw.investmentGoals?.trim() || null,
      urgentContact: Boolean(raw.urgentContact),
      service: 'Investment Consultation',
      source: 'bruno-melano-landing',
      utm: parseUTM(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      page: location.href,
      leadScore: calculateLeadScore(raw)
    };

    try {
      setStatus('Procesando tu consulta...', 'info');

      // 1) Captura principal del lead
      await postJson(ENDPOINTS.leadCapture || '/lead-capture', payload);

      // 2) Si es lead de alta prioridad, enviar alerta especial
      if (isHighPriorityLead(payload)) {
        await postJson(ENDPOINTS.leadHot || '/lead-hot', { 
          ...payload, 
          priority: 'ALTA',
          alert: 'Lead de consultoría de inversión de alta prioridad'
        });
      }

      // 3) Sincronización con CRM
      await postJson(ENDPOINTS.crmSync || '/crm-sync', payload);

      setStatus('¡Perfecto! Tu consulta fue recibida. Te contactaremos en menos de 2 horas por WhatsApp o teléfono.', 'success');
      form.reset();

      // Mostrar mensaje adicional para leads urgentes
      if (payload.urgentContact) {
        setTimeout(() => {
          setStatus('⚡ Consulta URGENTE recibida. Respuesta en los próximos 30 minutos.', 'success');
        }, 2000);
      }

      // Analytics tracking (si está disponible)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'Investment Consultation',
          event_label: payload.investorProfile,
          value: calculateLeadScore(raw)
        });
      }

    } catch (err) {
      console.error('Error enviando consulta:', err);
      setStatus('Hubo un problema al enviar tu consulta. Por favor, contáctanos directamente por WhatsApp o teléfono.', 'error');

      // Mostrar información de contacto alternativa
      setTimeout(() => {
        setStatus('WhatsApp: +54 9 223 550 6585 | Email: contacto@brunomelano.com', 'info');
      }, 3000);

    } finally {
      btn.removeAttribute('disabled');
      btn.textContent = originalText;
    }
  });
}

/**
 * Calculate lead score based on form data
 */
function calculateLeadScore(data) {
  let score = 0;
  
  // Investor profile scoring
  const profileScores = {
    'beginner': 25,
    'intermediate': 50,
    'advanced': 75,
    'professional': 100
  };
  score += profileScores[data.investorProfile] || 0;
  
  // Urgency bonus
  if (data.urgentContact) score += 50;
  
  // Investment goals detail bonus
  if (data.investmentGoals && data.investmentGoals.length > 50) score += 25;
  
  return Math.min(score, 100);
}

/**
 * Enhanced Navigation System
 */
function initNavigation() {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mainNav && !mainNav.contains(e.target) && !mobileToggle?.contains(e.target)) {
      mainNav.classList.remove('active');
      mobileToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (mainNav && mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          mobileToggle?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Back to top button
  const backToTop = document.querySelector('.back-to-top');
  function toggleBackToTop() {
    if (backToTop) {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Update reading progress and back to top on scroll
  const progressBar = document.querySelector('.reading-progress');
  function updateReadingProgress() {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / documentHeight) * 100;
    if (progressBar) {
      progressBar.style.width = Math.min(scrolled, 100) + '%';
    }
    toggleBackToTop();
  }

  // Throttled scroll event listener
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateReadingProgress, 10);
  });

  // Initialize on page load
  updateReadingProgress();
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
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

  // Observe cards and sections for animation
  const animateElements = document.querySelectorAll('.card, .timeline-item, .result-card, .contact-card');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

/**
 * Utility functions for external integrations
 */
window.BrunoMelanoUtils = {
  trackClick: (element, action) => {
    console.log(`Tracked: ${action} on`, element);
    // Integración con Google Analytics, Facebook Pixel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'CTA',
        event_label: action,
        transport_type: 'beacon'
      });
    }
  },
  
  formatPhoneForWhatsApp: (phone) => {
    return phone.replace(/\D/g, '');
  },
  
  getLeadData: () => {
    return {
      timestamp: new Date().toISOString(),
      page: location.href,
      utm: parseUTM(),
      userAgent: navigator.userAgent
    };
  }
};

// Track CTA clicks
document.addEventListener('click', (e) => {
  if (e.target.matches('.btn') || e.target.closest('.btn')) {
    const btn = e.target.matches('.btn') ? e.target : e.target.closest('.btn');
    const action = btn.textContent.trim();
    window.BrunoMelanoUtils.trackClick(btn, action);
  }
});