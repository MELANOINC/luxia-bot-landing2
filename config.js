// Configuración de integración Luxia Bot™ (Melano Inc)
// Reemplazá los placeholders con tus valores reales antes de publicar.

export const N8N_BASE_URL = 'https://YOUR_N8N_PUBLIC_URL/webhook';
// Ejemplos válidos:
//   - 'https://n8n.tudominio.com/webhook'
//   - 'https://abcdefg.ngrok.io/webhook'
// Importante: no terminar con "/" (agregamos el path abajo)

/**
 * Endpoints de tus flujos n8n (ya incluidos en tus JSON):
 *  - 01_lead_capture_qualification.json  -> /lead-capture
 *  - 02_lead_hot_whatsapp_alert.json     -> /lead-hot
 *  - 03_webhook_crm_sync.json            -> /crm-sync
 */
export const ENDPOINTS = {
  leadCapture: '/lead-capture',
  leadHot: '/lead-hot',
  crmSync: '/crm-sync',
};

/**
 * Datos de contacto para CTAs.
 * - whatsapp: 'wa.me/XXXXXXXXXXX?text=...' o URL completa con https://
 * - calendly: URL pública de tu Calendly
 */
export const CONTACT = {
  whatsapp: 'wa.me/XXXXXXXXXXX?text=Quiero%20Luxia%20Bot', // Reemplazar
  calendly: 'https://calendly.com/TU_USUARIO/demo',        // Reemplazar
};

/**
 * Utilidad para formar URLs completas contra n8n.
 */
export const apiUrl = (path) => {
  const base = N8N_BASE_URL.replace(/\/+$/, ''); // sin slash final
  const p = String(path || '').replace(/^\/+/, ''); // sin slash inicial
  return `${base}/${p}`;
};
