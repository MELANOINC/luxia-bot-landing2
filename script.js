// Luxia Bot™ Landing – lógica de formularios e integración n8n
// Autor: Melano Inc

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
    success: '#10b981',
    warn: '#f59e0b',
    error: '#ef4444'
  }[type] || 'var(--text-dim)');
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  // Normalizar checkbox readyToBook
  data.readyToBook = $('#readyToBook')?.checked || false;
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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // n8n típicamente devuelve 200/2xx con echo del último nodo
  return res.ok ? res.json().catch(() => ({})) : Promise.reject(new Error(`HTTP ${res.status}`));
}

/**
 * Reglas simples para marcar lead "caliente"
 * - readyToBook === true
 * - presupuesto alto (>= 1000)
 */
function isHotLead(data) {
  return Boolean(
    data.readyToBook === true ||
    data.budget === '1000-3000' ||
    data.budget === 'gt-3000'
  );
}

/**
 * Main
 */
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  const form = $('#demo-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn?.setAttribute('disabled', 'disabled');

    const raw = serializeForm(form);

    // Validaciones mínimas
    if (!raw.name || !validEmail(raw.email) || !raw.phone) {
      setStatus('Completá nombre, email válido y WhatsApp.', 'warn');
      btn?.removeAttribute('disabled');
      return;
    }

    const payload = {
      ...raw,
      name: raw.name?.trim(),
      email: raw.email?.trim(),
      phone: raw.phone?.trim(),
      company: raw.company?.trim() || null,
      budget: raw.budget || null,
      readyToBook: Boolean(raw.readyToBook),
      product: 'Luxia Bot',
      channel: 'web',
      source: 'landing',
      utm: parseUTM(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      page: location.href
    };

    // Envío secuencial con tolerancia a fallos
    try {
      setStatus('Enviando tu solicitud…', 'info');

      // 1) Captura de lead
      await postJson(ENDPOINTS.leadCapture, payload);

      // 2) Hot lead → alerta WhatsApp
      if (isHotLead(payload)) {
        await postJson(ENDPOINTS.leadHot, { ...payload, nivel: 'caliente' });
      }

      // 3) Sincronización CRM (Sheets / Notion)
      await postJson(ENDPOINTS.crmSync, payload);

      setStatus('¡Gracias! Te contactaremos en minutos por WhatsApp o email.', 'success');
      form.reset();

    } catch (err) {
      console.error('Error enviando datos:', err);
      // Mensaje amigable + hint si falta configurar N8N
      const hint = String(N8N_BASE_URL || '').includes('YOUR_N8N_PUBLIC_URL')
        ? ' (Configurá N8N_BASE_URL en config.js)'
        : '';
      setStatus('Hubo un problema al enviar. Intentá nuevamente.' + hint, 'error');

    } finally {
      btn?.removeAttribute('disabled');
    }
  });
});

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
    if (mainNav && !mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
      mainNav.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Active section highlighting
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
  function highlightActiveSection() {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current section link
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
          activeLink.classList.add('active');
        }
      }
    });
  }

  // Smooth scrolling with offset for fixed header
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
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
            mobileToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  // Reading progress indicator
  const progressBar = document.querySelector('.reading-progress');
  function updateReadingProgress() {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / documentHeight) * 100;
    if (progressBar) {
      progressBar.style.width = Math.min(scrolled, 100) + '%';
    }
  }

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

  // Throttled scroll event listener
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      highlightActiveSection();
      updateReadingProgress();
      toggleBackToTop();
    }, 10);
  });

  // Initialize on page load
  highlightActiveSection();
  updateReadingProgress();
  toggleBackToTop();

  // Keyboard navigation support
  document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.focus();
    }
  });

  // Focus management for accessibility
  navLinks.forEach(link => {
    link.addEventListener('focus', () => {
      link.classList.add('focused');
    });
    
    link.addEventListener('blur', () => {
      link.classList.remove('focused');
    });
  });
}