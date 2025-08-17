// MELANO AI™ - Configuración del Sistema
// Configuración centralizada para el CRM inmobiliario con IA

// Configuración de endpoints y servicios
window.MELANO_CONFIG = {
  N8N_BASE_URL: 'https://n8n.brunomelano.com',
  
  ENDPOINTS: {
    LEAD_CAPTURE: '/webhook/melano_lead',
    WHATSAPP_WEBHOOK: '/webhook/waba_inbound',
    ANALYTICS: '/webhook/analytics',
    NOTIFICATIONS: '/webhook/notifications'
  },

  CONTACT: {
    whatsapp: 'https://wa.me/5492235506595?text=Quiero%20una%20demo%20de%20MELANO%20AI',
    phone: '+5492235506595',
    email: 'melanobruno@gmail.com',
    calendly: 'https://calendly.com/melanobruno'
  },

  APP_CONFIG: {
    name: 'MELANO AI™',
    version: '2.1.0',
    author: 'Bruno Melano',
    company: 'MELANO INC',
    domain: 'brunomelano.com'
  },

  VALIDATION: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    name: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,50}$/
  },

  MESSAGES: {
    success: {
      form: '¡Perfecto! Te contactaremos en las próximas 24 horas.',
      demo: 'Demo agendada exitosamente. Revisa tu email.',
      whatsapp: 'Redirigiendo a WhatsApp...'
    },
    
    error: {
      network: 'Error de conexión. Intenta nuevamente.',
      validation: 'Por favor completa todos los campos requeridos.',
      generic: 'Algo salió mal. Contacta por WhatsApp.',
      timeout: 'Tiempo agotado. Intenta nuevamente.'
    },
    
    loading: {
      form: 'Procesando tu solicitud...',
      demo: 'Agendando tu demo...',
      redirect: 'Redirigiendo...'
    }
  },

  LEAD_SCORING: {
    factors: {
      revenue: {
        'lt-100k': 10,
        '100k-500k': 25,
        '500k-1m': 40,
        '1m-5m': 60,
        '5m+': 80
      },
      agents: {
        '1-5': 15,
        '6-15': 30,
        '16-30': 50,
        '31-50': 70,
        '50+': 85
      },
      urgency: 20,
      decision: 25,
      challenge: {
        'lead-quality': 15,
        'conversion': 20,
        'follow-up': 18,
        'scale': 25,
        'competition': 22,
        'efficiency': 16
      }
    },
    
    thresholds: {
      hot: 70,
      warm: 40,
      cold: 20
    }
  }
};

console.log('✅ MELANO AI™ Config loaded');