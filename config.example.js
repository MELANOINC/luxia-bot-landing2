// 🔧 CONFIGURACIÓN DE EJEMPLO - LUXIA BOT™ MELANO INC
// Copiar este archivo como 'config.js' y completar con tus datos reales

const CONFIG = {
    // 🚨 OBLIGATORIO: URL de tu instancia n8n
    N8N_BASE_URL: 'https://tu-n8n-instance.com',
    
    // 📱 OBLIGATORIO: Tu número de WhatsApp (formato internacional)
    WHATSAPP_NUMBER: '+506XXXXXXXX',
    
    // 📅 OBLIGATORIO: Tu enlace de Calendly
    CALENDLY_URL: 'https://calendly.com/tu-usuario',
    
    // 🎯 Configuración de leads calientes (presupuesto mínimo)
    HOT_LEAD_THRESHOLD: 1000,
    
    // 📧 Endpoints de n8n (mantener estos paths)
    ENDPOINTS: {
        LEAD_CAPTURE: '/lead-capture',
        LEAD_HOT: '/lead-hot', 
        CRM_SYNC: '/crm-sync'
    },
    
    // 🎨 Personalización (opcional)
    BRANDING: {
        COMPANY_NAME: 'Melano Inc',
        PRODUCT_NAME: 'Luxia Bot™',
        SUPPORT_EMAIL: 'soporte@melanoinc.com'
    }
};

// ⚠️ IMPORTANTE: 
// 1. Renombrar este archivo a 'config.js'
// 2. Completar todas las URLs con tus datos reales
// 3. Probar el formulario antes de lanzar

// 🚀 PASOS PARA ACTIVAR:
// 1. Configurar n8n workflows en los endpoints especificados
// 2. Verificar que WhatsApp abre correctamente
// 3. Confirmar que Calendly carga sin errores
// 4. Hacer test completo del formulario

export { CONFIG };
