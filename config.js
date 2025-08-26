// Configuración Bruno Melano Investment Consultation
// Datos de contacto y endpoints de integración

export const N8N_BASE_URL = 'https://YOUR_N8N_INSTANCE/webhook';
// Reemplazar con tu instancia real de n8n
// Ejemplos:
//   - 'https://n8n.brunomelano.com/webhook'
//   - 'https://your-n8n.domain.com/webhook'

/**
 * Endpoints para los flujos de n8n
 * Estos endpoints deben coincidir con los webhooks configurados en n8n
 */
export const ENDPOINTS = {
  leadCapture: '/investment-lead-capture',    // Captura principal de leads
  leadHot: '/investment-lead-priority',       // Leads de alta prioridad
  crmSync: '/investment-crm-sync',           // Sincronización con CRM
};

/**
 * Información de contacto de Bruno Melano
 * Esta información se usa en todos los CTAs y enlaces de contacto
 */
export const CONTACT = {
  phone: '+54 9 223 550 6585',
  email: 'contacto@brunomelano.com',
  whatsapp: 'https://wa.me/5492235506585',
  calendly: 'https://calendly.com/melanobruno'
};

/**
 * Mensajes predefinidos para WhatsApp según el contexto
 */
export const WHATSAPP_MESSAGES = {
  general: 'Hola Bruno, quiero información sobre tus servicios de consultoría de inversiones',
  urgent: 'Bruno, tengo una consulta URGENTE sobre inversiones',
  consultation: 'Hola Bruno, quiero agendar una consulta gratuita de inversiones',
  followUp: 'Hola Bruno, quiero hacer seguimiento de mi consulta de inversiones'
};

/**
 * Configuración de tracking y analytics
 */
export const TRACKING = {
  googleAnalytics: 'G-XXXXXXXXXX', // Reemplazar con tu GA4 ID
  facebookPixel: 'XXXXXXXXX',     // Reemplazar con tu Pixel ID
  enableTracking: false           // Cambiar a true cuando esté configurado
};

/**
 * Función utilitaria para construir URLs de n8n
 */
export const apiUrl = (path) => {
  const base = N8N_BASE_URL.replace(/\/+$/, ''); // sin slash final
  const p = String(path || '').replace(/^\/+/, ''); // sin slash inicial
  return `${base}/${p}`;
};

/**
 * Función para generar enlaces de WhatsApp con mensaje personalizado
 */
export const generateWhatsAppUrl = (messageKey = 'general', customMessage = '') => {
  const message = customMessage || WHATSAPP_MESSAGES[messageKey] || WHATSAPP_MESSAGES.general;
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
};

/**
 * Configuración de formularios
 */
export const FORM_CONFIG = {
  requiredFields: ['fullName', 'email', 'phone', 'investorProfile'],
  leadScoring: {
    'beginner': 25,
    'intermediate': 50,
    'advanced': 75,
    'professional': 100
  },
  urgentResponseTime: '30 minutos',
  standardResponseTime: '2 horas'
};

/**
 * Configuración del sistema MELANO NEXUS (para mostrar en el sitio)
 */
export const MELANO_NEXUS = {
  description: 'Sistema de IA avanzada para análisis de inversiones',
  features: [
    'Análisis de mercado en tiempo real 24/7',
    'Alertas automáticas de oportunidades',
    'Portfolio tracking con métricas detalladas',
    'Inteligencia artificial propietaria'
  ],
  roiPromedio: '127%',
  clientesAtendidos: '500+',
  capitalGestionado: '€2M+'
};

/**
 * Configuración de la IA Cuántica (Quantum AI)
 * Parte del ecosistema de Melano Inc
 */
export const QUANTUM_AI = {
  enabled: true,
  endpoint: 'https://quantum.melano.inc/api/analyze',
  model: 'luxia-quantum-v2'
};

/**
 * Configuración del Asistente Principal (Melania)
 */
export const ASSISTANT = {
  name: 'Melania',
  role: 'Asistente Principal',
  avatar: '🧠',
  welcome: [
    'Hola, soy Melania, tu asistente principal en Melano Inc. ¿En qué te ayudo hoy?',
    'Puedo guiarte con inversiones, agenda, y acceso a LUXIA/NOTORIUS.'
  ],
  capabilities: [
    'Orientación inicial y FAQs',
    'Captura y priorización de leads',
    'Derivación a WhatsApp o Calendly',
    'Accesos a LUXIA CRM y NOTORIUS (si corresponde)'
  ],
  language: ['es', 'en'],
  theme: {
    color: 'var(--gold)',
    accent: 'var(--gold-600)'
  }
};

// Configuración para debugging y desarrollo
export const DEBUG = {
  enabled: true,
  logLevel: 'info',
  mockN8nResponses: true // Simular respuestas cuando n8n no esté disponible
};

// Exportar todo como un objeto para fácil acceso
export default {
  N8N_BASE_URL,
  ENDPOINTS,
  CONTACT,
  WHATSAPP_MESSAGES,
  TRACKING,
  FORM_CONFIG,
  MELANO_NEXUS,
  QUANTUM_AI,
  ASSISTANT,
  DEBUG,
  apiUrl,
  generateWhatsAppUrl
};