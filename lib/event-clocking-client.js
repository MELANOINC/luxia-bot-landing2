// Event Clocking Client Library
// For easy integration with bots, CRM systems, and external applications

class EventClockingClient {
  constructor(apiBaseUrl, apiKey = null) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    this.apiKey = apiKey;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      this.defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  /**
   * Record a new event in the clocking system
   * @param {Object} eventData - Event data to record
   * @returns {Promise<Object>} API response
   */
  async clockEvent(eventData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/clocking`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`API Error: ${response.status} - ${error.error || 'Failed to record event'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording event:', error);
      throw error;
    }
  }

  /**
   * Record a lead capture event
   * @param {Object} leadData - Lead information
   * @returns {Promise<Object>} API response
   */
  async clockLeadCaptured(leadData) {
    const eventData = {
      event_type: 'lead_captured',
      customer_email: leadData.email,
      customer_name: leadData.name,
      customer_phone: leadData.phone,
      source_name: leadData.source || 'UNKNOWN',
      event_data: {
        form_data: leadData.formData || {},
        referrer: leadData.referrer,
        landing_page: leadData.landingPage
      },
      utm_source: leadData.utmSource,
      utm_medium: leadData.utmMedium,
      utm_campaign: leadData.utmCampaign,
      country: leadData.country,
      city: leadData.city
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a qualified lead event
   * @param {Object} leadData - Lead qualification data
   * @returns {Promise<Object>} API response
   */
  async clockLeadQualified(leadData) {
    const eventData = {
      event_type: 'lead_qualified',
      customer_email: leadData.email,
      customer_name: leadData.name,
      customer_phone: leadData.phone,
      source_name: leadData.source || 'CRM',
      event_data: {
        qualification_score: leadData.score,
        qualification_criteria: leadData.criteria,
        qualified_by: leadData.qualifiedBy
      }
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a hot lead event
   * @param {Object} leadData - Hot lead data
   * @returns {Promise<Object>} API response
   */
  async clockLeadHot(leadData) {
    const eventData = {
      event_type: 'lead_hot',
      customer_email: leadData.email,
      customer_name: leadData.name,
      customer_phone: leadData.phone,
      source_name: leadData.source || 'CRM',
      event_data: {
        urgency_level: leadData.urgencyLevel || 'high',
        trigger_event: leadData.triggerEvent,
        expected_value: leadData.expectedValue
      }
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a demo scheduled event
   * @param {Object} demoData - Demo scheduling data
   * @returns {Promise<Object>} API response
   */
  async clockDemoScheduled(demoData) {
    const eventData = {
      event_type: 'demo_scheduled',
      customer_email: demoData.email,
      customer_name: demoData.name,
      customer_phone: demoData.phone,
      source_name: demoData.source || 'WEBSITE',
      event_data: {
        demo_date: demoData.demoDate,
        demo_type: demoData.demoType || 'live',
        scheduled_by: demoData.scheduledBy,
        demo_url: demoData.demoUrl
      }
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a payment initiation event
   * @param {Object} paymentData - Payment initiation data
   * @returns {Promise<Object>} API response
   */
  async clockPaymentInitiated(paymentData) {
    const eventData = {
      event_type: 'payment_initiated',
      event_value: paymentData.amount,
      currency: paymentData.currency || 'EUR',
      customer_email: paymentData.email,
      customer_name: paymentData.name,
      customer_phone: paymentData.phone,
      source_name: paymentData.source || 'PAYMENT_SYSTEM',
      external_id: paymentData.paymentId,
      event_data: {
        payment_method: paymentData.paymentMethod,
        payment_provider: paymentData.provider,
        product_name: paymentData.productName,
        plan_type: paymentData.planType
      }
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a payment completion event
   * @param {Object} paymentData - Payment completion data
   * @returns {Promise<Object>} API response
   */
  async clockPaymentCompleted(paymentData) {
    const eventData = {
      event_type: 'payment_completed',
      event_value: paymentData.amount,
      currency: paymentData.currency || 'EUR',
      customer_email: paymentData.email,
      customer_name: paymentData.name,
      customer_phone: paymentData.phone,
      source_name: paymentData.source || 'PAYMENT_SYSTEM',
      external_id: paymentData.paymentId,
      event_data: {
        payment_method: paymentData.paymentMethod,
        payment_provider: paymentData.provider,
        transaction_id: paymentData.transactionId,
        product_name: paymentData.productName,
        plan_type: paymentData.planType,
        subscription_id: paymentData.subscriptionId
      }
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a bot interaction event
   * @param {Object} interactionData - Bot interaction data
   * @returns {Promise<Object>} API response
   */
  async clockBotInteraction(interactionData) {
    const eventData = {
      event_type: 'bot_interaction',
      customer_email: interactionData.email,
      customer_name: interactionData.name,
      customer_phone: interactionData.phone,
      source_name: interactionData.botName || 'MELANIA_BOT',
      source_type: 'melania_bot',
      event_data: {
        interaction_type: interactionData.interactionType, // 'message', 'button_click', 'menu_selection'
        message_content: interactionData.messageContent,
        bot_response: interactionData.botResponse,
        conversation_stage: interactionData.conversationStage,
        platform: interactionData.platform // 'whatsapp', 'webchat', 'telegram'
      },
      session_id: interactionData.sessionId
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record an email interaction event
   * @param {Object} emailData - Email interaction data
   * @returns {Promise<Object>} API response
   */
  async clockEmailInteraction(emailData) {
    const eventData = {
      event_type: emailData.interactionType || 'email_opened', // 'email_opened', 'email_clicked'
      customer_email: emailData.email,
      customer_name: emailData.name,
      source_name: 'EMAIL_CAMPAIGNS',
      source_type: 'email_bot',
      event_data: {
        campaign_id: emailData.campaignId,
        email_subject: emailData.subject,
        link_clicked: emailData.linkClicked,
        email_template: emailData.template
      },
      external_id: emailData.messageId
    };

    return this.clockEvent(eventData);
  }

  /**
   * Record a WhatsApp message event
   * @param {Object} whatsappData - WhatsApp interaction data
   * @returns {Promise<Object>} API response
   */
  async clockWhatsAppMessage(whatsappData) {
    const eventData = {
      event_type: 'whatsapp_message',
      customer_email: whatsappData.email,
      customer_name: whatsappData.name,
      customer_phone: whatsappData.phone,
      source_name: 'WHATSAPP_BOT',
      source_type: 'whatsapp_bot',
      event_data: {
        message_type: whatsappData.messageType, // 'incoming', 'outgoing'
        message_content: whatsappData.content,
        message_id: whatsappData.messageId,
        conversation_stage: whatsappData.conversationStage
      },
      session_id: whatsappData.sessionId
    };

    return this.clockEvent(eventData);
  }

  /**
   * Get recent events from the clocking system
   * @param {Object} options - Query options
   * @returns {Promise<Object>} API response
   */
  async getRecentEvents(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.source) params.append('source', options.source);
      if (options.event_type) params.append('event_type', options.event_type);

      const response = await fetch(`${this.apiBaseUrl}/api/clocking/recent?${params}`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent events:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   * @param {Object} options - Query options
   * @returns {Promise<Object>} API response
   */
  async getAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.period) params.append('period', options.period);
      if (options.source) params.append('source', options.source);

      const response = await fetch(`${this.apiBaseUrl}/api/clocking/analytics?${params}`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary
   * @returns {Promise<Object>} API response
   */
  async getDashboard() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/clocking/dashboard`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Create a real-time connection for events
   * @param {Function} onEvent - Callback for new events
   * @returns {EventSource} Server-sent events connection
   */
  createRealTimeConnection(onEvent) {
    const eventSource = new EventSource(`${this.apiBaseUrl}/api/clocking/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Error parsing real-time event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
    };

    return eventSource;
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventClockingClient;
} else if (typeof window !== 'undefined') {
  window.EventClockingClient = EventClockingClient;
}

// Export for ES6 modules
export default EventClockingClient;