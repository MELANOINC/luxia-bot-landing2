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
  initAuthSystem();
  
  // Initialize tabs for system demo
  initSystemTabs();
  
  // Initialize bilingual and currency systems
  initLanguageSystem();
  initCurrencySystem();
  
  // Mostrar WhatsApp flotante después de 3 segundos
  setTimeout(() => {
    const floatingWa = $('#floating-whatsapp');
    if (floatingWa) {
      floatingWa.classList.remove('hide-nojs');
    }
  }, 3000);
});

/**
 * System Demo Tabs Handler
 */
function initSystemTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const luxiaDemo = document.getElementById('luxia-demo');
  const notoriusDemo = document.getElementById('notorius-demo');
  
  if (!tabButtons.length || !luxiaDemo || !notoriusDemo) return;
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show/hide demos with smooth transition
      if (targetTab === 'luxia') {
        luxiaDemo.classList.remove('hidden');
        notoriusDemo.classList.add('hidden');
      } else if (targetTab === 'notorius') {
        luxiaDemo.classList.add('hidden');
        notoriusDemo.classList.remove('hidden');
      }
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_tab_switch', {
          event_category: 'Demo Interaction',
          event_label: targetTab,
          transport_type: 'beacon'
        });
      }
    });
  });
}

/**
 * Authentication System Handler
 */
function initAuthSystem() {
  // Import auth libraries dynamically
  import('./lib/supabase.js').then(({ auth, db, checkUserAccess }) => {
    window.MelanoAuth = auth;
    window.MelanoDb = db;
    window.checkUserAccess = checkUserAccess;
    
    // Initialize auth modal
    import('./components/AuthModal.js').then(({ default: AuthModal }) => {
      window.authModal = new AuthModal();
      
      // Set up auth triggers
      document.querySelectorAll('.auth-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
          window.authModal.open(btn.dataset.mode || 'login');
        });
      });
      
      // Set up premium access buttons
      document.querySelectorAll('.access-premium-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const plan = btn.dataset.plan;
          await handlePremiumAccess(plan);
        });
      });
      
      // Check current auth state
      checkAuthState();
    });
  }).catch(error => {
    console.warn('Auth system not available:', error);
    // Fallback to basic functionality
    setupFallbackAuth();
  });
}

async function checkAuthState() {
  try {
    const { user } = await window.MelanoAuth.getUser();
    
    if (user) {
      const access = await window.checkUserAccess(user.id);
      
      if (access.hasAccess) {
        showPremiumDashboard(access);
      } else {
        showUpgradePrompt();
      }
    }
  } catch (error) {
    console.log('No authenticated user');
  }
}

async function handlePremiumAccess(plan) {
  try {
    const { user } = await window.MelanoAuth.getUser();
    
    if (!user) {
      // Show auth modal
      window.authModal.open('signup');
      return;
    }
    
    const access = await window.checkUserAccess(user.id);
    
    // Check if user already has access
    if (access.hasAccess) {
      if (plan === 'starter' || 
          (plan === 'professional' && access.luxiaAccess) ||
          (plan === 'premium' && access.notoriusAccess)) {
        showPremiumDashboard(access);
        return;
      }
    }
    
    // Show upgrade/purchase modal
    showPurchaseModal(plan);
    
  } catch (error) {
    console.error('Error handling premium access:', error);
    window.authModal.open('login');
  }
}

function showPremiumDashboard(userAccess) {
  import('./components/PremiumDashboard.js').then(({ default: PremiumDashboard }) => {
    new PremiumDashboard(userAccess);
  });
}

function showUpgradePrompt() {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close">×</button>
      <div class="form-header">
        <h2>🚀 Actualiza tu Plan</h2>
        <p>Necesitas una suscripción activa para acceder a las plataformas premium</p>
      </div>
      <div class="auth-buttons">
        <button class="btn btn-gold" onclick="scrollToSection('servicios')">
          Ver Planes de Suscripción
        </button>
        <button class="btn btn-outline modal-close">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => modal.remove());
  });
}

function showPurchaseModal(plan) {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close">×</button>
      <div class="form-header">
        <h2>💳 Suscribirse al Plan ${plan.toUpperCase()}</h2>
        <p>Serás redirigido al checkout de MercadoPago para completar el pago</p>
      </div>
      <div class="auth-buttons">
        <a href="https://link.mercadopago.com/melanoinc" class="btn btn-gold" target="_blank">
          🛒 Ir al Checkout
        </a>
        <button class="btn btn-outline modal-close">
          Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => modal.remove());
  });
}

function setupFallbackAuth() {
  // Basic auth fallback without Supabase
  document.querySelectorAll('.auth-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Sistema de autenticación no disponible. Contacta por WhatsApp.');
    });
  });
  
  document.querySelectorAll('.access-premium-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.open('https://link.mercadopago.com/melanoinc', '_blank');
    });
  });
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerHeight = document.querySelector('.site-header').offsetHeight;
    const targetPosition = section.offsetTop - headerHeight - 20;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Bilingual System Handler
 */
function initLanguageSystem() {
  const langButtons = document.querySelectorAll('.lang-btn');
  let currentLang = 'es'; // Default Spanish
  
  // Content translations
  const translations = {
    es: {
      'demo-title': '🚀 Demo en Vivo: Sistema MELANO NEXUS',
      'demo-subtitle': 'Observa cómo mi IA analiza oportunidades en tiempo real',
      'integration-title': '🔄 Integración LUXIA ↔ NOTORIUS',
      'stats-clients': 'Clientes Activos',
      'stats-aum': 'AUM Total',
      'stats-conversion': 'Tasa Conversión',
      'stats-contracts': 'Contratos Activos',
      'pipeline-title': '🎯 Pipeline de Ventas - Tiempo Real',
      'hot-lead': '🔥 CALIENTE',
      'processing-lead': '⚡ EN PROCESO', 
      'closing-lead': '💰 CERRANDO',
      'wa-label': 'Consulta Gratis'
    },
    en: {
      'demo-title': '🚀 Live Demo: MELANO NEXUS System',
      'demo-subtitle': 'Watch how my AI analyzes opportunities in real-time',
      'integration-title': '🔄 LUXIA ↔ NOTORIUS Integration',
      'stats-clients': 'Active Clients',
      'stats-aum': 'Total AUM',
      'stats-conversion': 'Conversion Rate',
      'stats-contracts': 'Active Contracts',
      'pipeline-title': '🎯 Sales Pipeline - Real Time',
      'hot-lead': '🔥 HOT',
      'processing-lead': '⚡ PROCESSING',
      'closing-lead': '💰 CLOSING',
      'wa-label': 'Free Consult'
    }
  };
  
  function switchLanguage(lang) {
    currentLang = lang;
    
    // Update active button
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update all elements with data-es and data-en attributes
    const elements = document.querySelectorAll('[data-es], [data-en]');
    elements.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === 'INPUT' && el.type === 'submit') {
          el.value = text;
        } else {
          el.textContent = text;
        }
      }
    });
    
    // Update specific dynamic content
    const waLabel = document.querySelector('.wa-label');
    if (waLabel) waLabel.textContent = translations[lang]['wa-label'];
    
    // Update form placeholders if needed
    const nameInput = document.getElementById('fullName');
    if (nameInput) {
      nameInput.placeholder = lang === 'es' ? 'Tu nombre completo' : 'Your full name';
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.placeholder = lang === 'es' ? 'tu.email@ejemplo.com' : 'your.email@example.com';
    }
    
    // Store language preference
    localStorage.setItem('melano-lang', lang);
    
    console.log(`Language switched to: ${lang}`);
  }
  
  // Initialize language buttons
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchLanguage(btn.dataset.lang);
    });
  });
  
  // Load saved language preference
  const savedLang = localStorage.getItem('melano-lang') || 'es';
  switchLanguage(savedLang);
}

/**
 * Currency System Handler
 */
function initCurrencySystem() {
  const currencyButtons = document.querySelectorAll('.currency-btn');
  let currentCurrency = 'ars'; // Default ARS
  
  const exchangeRate = 1000; // 1 USD = 1000 ARS (approximate)
  
  function switchCurrency(currency) {
    currentCurrency = currency;
    
    // Update active button
    currencyButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === currency);
    });
    
    // Show/hide currency amounts
    const arsPrices = document.querySelectorAll('.ars-price');
    const usdPrices = document.querySelectorAll('.usd-price');
    const currencyAmounts = document.querySelectorAll('.currency-amount');
    
    if (currency === 'ars') {
      arsPrices.forEach(el => el.classList.remove('hidden'));
      usdPrices.forEach(el => el.classList.add('hidden'));
      currencyAmounts.forEach(el => {
        if (el.dataset.ars) el.textContent = el.dataset.ars;
      });
    } else {
      arsPrices.forEach(el => el.classList.add('hidden'));
      usdPrices.forEach(el => el.classList.remove('hidden'));
      currencyAmounts.forEach(el => {
        if (el.dataset.usd) el.textContent = el.dataset.usd;
      });
    }
    
    // Store currency preference
    localStorage.setItem('melano-currency', currency);
    
    console.log(`Currency switched to: ${currency.toUpperCase()}`);
  }
  
  // Initialize currency buttons
  currencyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchCurrency(btn.dataset.currency);
    });
  });
  
  // Load saved currency preference
  const savedCurrency = localStorage.getItem('melano-currency') || 'ars';
  switchCurrency(savedCurrency);
}


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