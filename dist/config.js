// MELANO AI™ - Configuración de integración premium
// Sistema CRM inmobiliario con IA Cuántica

/**
 * CONFIGURACIÓN PRINCIPAL
 * =====================
 * Actualiza estas URLs con tus servicios reales antes del deploy
 */

// 🚨 CRÍTICO: URL base de tu instancia n8n
export const N8N_BASE_URL = 'https://YOUR_N8N_PUBLIC_URL/webhook';
// Ejemplos válidos:
//   - 'https://n8n.melanoinc.com/webhook'
//   - 'https://abc123.ngrok.io/webhook'
//   - 'https://melano-n8n.herokuapp.com/webhook'

/**
 * ENDPOINTS DE N8N
 * ================
 * Estos paths corresponden a los webhooks configurados en n8n
 */
export const ENDPOINTS = {
  // Captura principal de leads (todos los leads)
  leadCapture: '/lead-capture',
  
  // Leads calientes/VIP (score alto, urgencia, decisores)
  leadHot: '/lead-hot',
  
  // Sincronización con CRM (Sheets, Notion, Airtable, etc.)
  crmSync: '/crm-sync',
  
  // Analytics y tracking de eventos
  analytics: '/analytics',
  
  // Webhook para actualizaciones de estado
  statusUpdate: '/status-update'
};

/**
 * INFORMACIÓN DE CONTACTO
 * =======================
 * CTAs de WhatsApp y Calendly
 */
export const CONTACT = {
  // WhatsApp principal (formato internacional)
  whatsapp: 'wa.me/5492235506595?text=Quiero%20una%20demo%20de%20MELANO%20AI%20cuántica',
  
  // Calendly para demos
  calendly: 'https://calendly.com/melanobruno/demo-melano-ai',
  
  // Calendly VIP (para leads premium)
  calendlyVIP: 'https://calendly.com/melanobruno/vip-demo',
  
  // Email de soporte
  supportEmail: 'contacto1@brunomelano.com',
  
  // Teléfono de contacto
  phone: '+5492235506595'
};

/**
 * CONFIGURACIÓN DE LEAD SCORING
 * =============================
 * Parámetros para clasificación de leads
 */
export const LEAD_SCORING = {
  // Umbrales de scoring
  thresholds: {
    vip: 80,      // Score >= 80: Lead VIP
    hot: 60,      // Score >= 60: Lead caliente  
    warm: 40,     // Score >= 40: Lead tibio
    cold: 0       // Score < 40: Lead frío
  },
  
  // Pesos por campo
  weights: {
    revenue: {
      'lt-100k': 10,
      '100k-500k': 25,
      '500k-1m': 50,
      '1m-5m': 75,
      '5m+': 100
    },
    agents: {
      '1-5': 10,
      '6-15': 25,
      '16-30': 50,
      '31-50': 75,
      '50+': 100
    },
    urgency: 50,        // Checkbox "necesito implementar en 30 días"
    decision: 30,       // Checkbox "tengo autoridad de decisión"
    corporateEmail: 15, // Email corporativo vs personal
    challenge: {
      'lead-quality': 10,
      'conversion': 15,
      'follow-up': 20,
      'scale': 30,
      'competition': 25,
      'efficiency': 20
    }
  }
};

/**
 * CONFIGURACIÓN DE RESPUESTA AUTOMÁTICA
 * =====================================
 */
export const AUTO_RESPONSE = {
  // Tiempos de respuesta por tipo de lead
  responseTime: {
    VIP: 15,      // minutos
    Hot: 60,      // minutos
    Warm: 240,    // minutos (4 horas)
    Cold: 1440    // minutos (24 horas)
  },
  
  // Canales de contacto por tipo
  channels: {
    VIP: ['phone', 'whatsapp', 'email'],
    Hot: ['whatsapp', 'email'],
    Warm: ['email', 'whatsapp'],
    Cold: ['email']
  },
  
  // Asignación de responsables
  assignment: {
    VIP: 'CEO/Director Comercial',
    Hot: 'Senior Sales Rep',
    Warm: 'Sales Rep',
    Cold: 'Marketing Automation'
  }
};

/**
 * CONFIGURACIÓN DE ANALYTICS
 * ==========================
 */
export const ANALYTICS = {
  // Eventos importantes a trackear
  events: [
    'page_view',
    'section_view',
    'form_start',
    'form_submit',
    'button_click',
    'scroll_depth',
    'time_on_page',
    'lead_scored'
  ],
  
  // Integración con Google Analytics 4
  ga4: {
    measurementId: 'G-XXXXXXXXXX', // Reemplazar con tu GA4 ID
    enabled: false // Cambiar a true cuando configures GA4
  },
  
  // Facebook Pixel
  facebook: {
    pixelId: '123456789012345', // Reemplazar con tu Pixel ID
    enabled: false // Cambiar a true cuando configures FB Pixel
  }
};

/**
 * CONFIGURACIÓN REGIONAL
 * ======================
 */
export const LOCALIZATION = {
  // Zona horaria principal
  timezone: 'America/Argentina/Buenos_Aires',
  
  // Moneda
  currency: 'USD',
  
  // Idioma principal
  language: 'es',
  
  // Formato de teléfono
  phoneFormat: '+54 9 XX XXXX XXXX',
  
  // Países objetivo
  targetCountries: ['AR', 'MX', 'CO', 'CL', 'PE', 'UY']
};

/**
 * CONFIGURACIÓN DE DESARROLLO
 * ===========================
 */
export const DEV_CONFIG = {
  // Modo debug (mostrar logs en consola)
  debug: process.env.NODE_ENV !== 'production',
  
  // Simular delays de red en desarrollo
  simulateNetworkDelay: false,
  
  // Endpoints de testing
  testEndpoints: {
    leadCapture: '/test-lead-capture',
    leadHot: '/test-lead-hot'
  }
};

/**
 * UTILIDADES
 * ==========
 */

// Construir URL completa para endpoint
export const apiUrl = (path) => {
  const base = N8N_BASE_URL.replace(/\/+$/, ''); // Remover slash final
  const endpoint = String(path || '').replace(/^\/+/, ''); // Remover slash inicial
  return `${base}/${endpoint}`;
};

// Verificar si la configuración está completa
export const isConfigured = () => {
  return !N8N_BASE_URL.includes('YOUR_N8N_PUBLIC_URL') && 
         CONTACT.whatsapp !== 'wa.me/XXXXXXXXXXX' &&
         CONTACT.calendly !== 'https://calendly.com/TU_USUARIO';
};

// Obtener configuración de lead scoring
export const getLeadScoringConfig = () => LEAD_SCORING;

// Obtener configuración de contacto
export const getContactConfig = () => CONTACT;

/**
 * VALIDACIÓN DE CONFIGURACIÓN
 * ===========================
 */
if (DEV_CONFIG.debug) {
  console.group('🔧 MELANO AI™ Configuration');
  console.log('N8N Base URL:', N8N_BASE_URL);
  console.log('Configured:', isConfigured() ? '✅' : '❌');
  console.log('WhatsApp:', CONTACT.whatsapp);
  console.log('Calendly:', CONTACT.calendly);
  console.groupEnd();
  
  if (!isConfigured()) {
    console.warn('⚠️ MELANO AI™: Configuración incompleta. Ver config.js');
  }
}

/**
 * INSTRUCCIONES DE CONFIGURACIÓN
 * ==============================
 * 
 * 1. N8N SETUP:
 *    - Configura webhooks en n8n con los paths definidos en ENDPOINTS
 *    - Actualiza N8N_BASE_URL con tu URL pública
 *    - Testea cada endpoint manualmente
 * 
 * 2. WHATSAPP:
 *    - Actualiza CONTACT.whatsapp con tu número
 *    - Formato: wa.me/COUNTRYCODEPHONENUMBER
 *    - Ejemplo: wa.me/5492235506595
 * 
 * 3. CALENDLY:
 *    - Crea eventos en Calendly para demos
 *    - Actualiza URLs en CONTACT
 *    - Configura diferentes calendarios para VIP/regular
 * 
 * 4. ANALYTICS:
 *    - Configura GA4 si necesitas tracking avanzado
 *    - Agrega Facebook Pixel para retargeting
 *    - Los eventos se envían automáticamente a n8n
 * 
 * 5. TESTING:
 *    - Usa DEV_CONFIG para debugging
 *    - Testea formulario completo antes de producción
 *    - Verifica que todos los webhooks respondan
 */

export default {
  N8N_BASE_URL,
  ENDPOINTS,
  CONTACT,
  LEAD_SCORING,
  AUTO_RESPONSE,
  ANALYTICS,
  LOCALIZATION,
  DEV_CONFIG,
  apiUrl,
  isConfigured,
  getLeadScoringConfig,
  getContactConfig
};