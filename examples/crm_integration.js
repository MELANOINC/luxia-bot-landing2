#!/usr/bin/env node
/**
 * CRM Integration Example for Event Clocking System
 * =================================================
 * 
 * This script demonstrates how to integrate external CRM systems with the
 * event clocking API for automated lead tracking and sales pipeline management.
 * 
 * Requirements:
 * - Node.js 14+
 * - npm packages: axios, dotenv
 * 
 * Installation:
 * npm install axios dotenv
 * 
 * Usage:
 * 1. Configure environment variables (see .env.example)
 * 2. Run: node examples/crm_integration.js
 */

const axios = require('axios');
const { EventClockingClient } = require('../lib/event-clocking-client');

class CRMEventIntegration {
  constructor(clockingApiUrl, apiKey = null) {
    this.clockingClient = new EventClockingClient(clockingApiUrl, apiKey);
    this.crmMapping = {
      // Map CRM lead statuses to clocking event types
      'new': 'lead_captured',
      'contacted': 'bot_interaction',
      'qualified': 'lead_qualified',
      'proposal': 'proposal_sent',
      'negotiation': 'lead_hot',
      'demo_scheduled': 'demo_scheduled',
      'payment_initiated': 'payment_initiated',
      'closed_won': 'payment_completed',
      'closed_lost': 'conversion_failed'
    };
  }

  /**
   * Sync CRM lead to clocking system
   * @param {Object} crmLead - Lead data from CRM
   */
  async syncCRMLead(crmLead) {
    try {
      console.log(`📋 Syncing CRM lead: ${crmLead.email}`);

      // Map CRM status to event type
      const eventType = this.crmMapping[crmLead.status] || 'lead_captured';

      // Prepare event data
      const eventData = {
        event_type: eventType,
        customer_email: crmLead.email,
        customer_name: crmLead.name,
        customer_phone: crmLead.phone,
        source_name: 'EXTERNAL_CRM',
        source_type: 'external_api',
        external_id: crmLead.crm_id,
        event_data: {
          crm_status: crmLead.status,
          crm_source: crmLead.source,
          assigned_to: crmLead.assigned_to,
          lead_score: crmLead.score,
          company: crmLead.company,
          industry: crmLead.industry,
          budget: crmLead.budget,
          timeline: crmLead.timeline,
          pain_points: crmLead.pain_points || [],
          last_contact: crmLead.last_contact,
          next_followup: crmLead.next_followup
        },
        utm_source: crmLead.utm_source,
        utm_medium: crmLead.utm_medium,
        utm_campaign: crmLead.utm_campaign,
        country: crmLead.country,
        city: crmLead.city
      };

      // Add value for payment events
      if (eventType === 'payment_completed' && crmLead.deal_value) {
        eventData.event_value = crmLead.deal_value;
        eventData.currency = crmLead.currency || 'EUR';
      }

      const result = await this.clockingClient.clockEvent(eventData);
      console.log(`✅ Event tracked: ${result.success ? 'Success' : 'Failed'}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Error syncing CRM lead:`, error.message);
      throw error;
    }
  }

  /**
   * Sync payment confirmation from CRM
   * @param {Object} paymentData - Payment data from CRM
   */
  async syncPaymentConfirmation(paymentData) {
    try {
      console.log(`💰 Syncing payment: ${paymentData.amount} ${paymentData.currency}`);

      const result = await this.clockingClient.clockPaymentCompleted({
        amount: paymentData.amount,
        currency: paymentData.currency,
        email: paymentData.customer_email,
        name: paymentData.customer_name,
        phone: paymentData.customer_phone,
        source: 'EXTERNAL_CRM',
        paymentId: paymentData.transaction_id,
        paymentMethod: paymentData.payment_method,
        provider: paymentData.payment_provider,
        transactionId: paymentData.transaction_id,
        productName: paymentData.product_name,
        planType: paymentData.plan_type,
        subscriptionId: paymentData.subscription_id
      });

      console.log(`✅ Payment tracked: ${result.success ? 'Success' : 'Failed'}`);
      return result;
    } catch (error) {
      console.error(`❌ Error syncing payment:`, error.message);
      throw error;
    }
  }

  /**
   * Sync demo scheduling from CRM calendar
   * @param {Object} demoData - Demo scheduling data
   */
  async syncDemoScheduling(demoData) {
    try {
      console.log(`📅 Syncing demo: ${demoData.demo_date}`);

      const result = await this.clockingClient.clockDemoScheduled({
        email: demoData.customer_email,
        name: demoData.customer_name,
        phone: demoData.customer_phone,
        source: 'EXTERNAL_CRM',
        demoDate: demoData.demo_date,
        demoType: demoData.demo_type,
        scheduledBy: demoData.scheduled_by,
        demoUrl: demoData.demo_url,
        calendarLink: demoData.calendar_link,
        requestedTopics: demoData.requested_topics
      });

      console.log(`✅ Demo tracked: ${result.success ? 'Success' : 'Failed'}`);
      return result;
    } catch (error) {
      console.error(`❌ Error syncing demo:`, error.message);
      throw error;
    }
  }

  /**
   * Bulk sync CRM data
   * @param {Array} crmLeads - Array of CRM leads
   */
  async bulkSyncCRM(crmLeads) {
    console.log(`📊 Starting bulk sync of ${crmLeads.length} CRM leads...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const lead of crmLeads) {
      try {
        await this.syncCRMLead(lead);
        successCount++;
        
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.error(`Failed to sync lead ${lead.email}:`, error.message);
      }
    }

    console.log(`📈 Bulk sync completed: ${successCount} success, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };
  }

  /**
   * Get dashboard data for CRM integration
   */
  async getCRMDashboard() {
    try {
      const dashboard = await this.clockingClient.getDashboard();
      console.log('📊 CRM Dashboard Data:', JSON.stringify(dashboard, null, 2));
      return dashboard;
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error.message);
      throw error;
    }
  }

  /**
   * Setup real-time CRM event monitoring
   */
  setupRealTimeMonitoring() {
    console.log('🔄 Setting up real-time CRM event monitoring...');

    const eventSource = this.clockingClient.createRealTimeConnection((eventData) => {
      console.log('📡 Real-time event received:', eventData);
      
      // Process real-time events for CRM updates
      if (eventData.type === 'new_event') {
        this.processCRMEvent(eventData);
      }
    });

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error('🔌 Real-time connection error:', error);
    };

    return eventSource;
  }

  /**
   * Process incoming real-time events for CRM updates
   * @param {Object} eventData - Real-time event data
   */
  processCRMEvent(eventData) {
    // Here you would typically update your CRM system
    // based on the incoming clocking events
    
    console.log(`🔄 Processing CRM event: ${eventData.event_type} for ${eventData.customer_email}`);

    // Example: Update lead score in CRM
    if (eventData.event_type === 'lead_qualified') {
      console.log(`📈 Lead qualified: ${eventData.customer_email} - Update CRM lead score`);
    }

    // Example: Create follow-up task for hot leads
    if (eventData.event_type === 'lead_hot') {
      console.log(`🔥 Hot lead detected: ${eventData.customer_email} - Create urgent follow-up task`);
    }

    // Example: Move to closed-won stage on payment
    if (eventData.event_type === 'payment_completed') {
      console.log(`💰 Payment completed: ${eventData.customer_email} - Move to closed-won in CRM`);
    }
  }
}

/**
 * Example CRM data simulator
 */
class CRMDataSimulator {
  static generateSampleLeads(count = 5) {
    const leads = [];
    const statuses = ['new', 'contacted', 'qualified', 'demo_scheduled', 'payment_initiated'];
    const companies = ['TechCorp', 'MarketingPro', 'StartupXYZ', 'Enterprise Inc', 'Innovation Co'];
    const industries = ['Technology', 'Marketing', 'Healthcare', 'Finance', 'Education'];

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now();
      leads.push({
        crm_id: `CRM_${timestamp}_${i}`,
        email: `lead${i + 1}@example.com`,
        name: `Lead User ${i + 1}`,
        phone: `+1234567${String(i).padStart(3, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        source: 'website',
        assigned_to: 'sales_rep_1',
        score: Math.floor(Math.random() * 100),
        company: companies[Math.floor(Math.random() * companies.length)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        budget: Math.floor(Math.random() * 50000) + 5000,
        timeline: Math.random() > 0.5 ? 'immediate' : '3-6 months',
        pain_points: ['inefficiency', 'high costs', 'manual processes'],
        last_contact: new Date().toISOString(),
        next_followup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'ai_automation',
        country: 'Spain',
        city: 'Madrid',
        deal_value: Math.floor(Math.random() * 25000) + 2500,
        currency: 'EUR'
      });
    }

    return leads;
  }

  static generateSamplePayment() {
    const timestamp = Date.now();
    return {
      transaction_id: `TXN_${timestamp}`,
      customer_email: 'customer@example.com',
      customer_name: 'Premium Customer',
      customer_phone: '+1234567890',
      amount: 8500,
      currency: 'EUR',
      payment_method: 'card',
      payment_provider: 'stripe',
      product_name: 'MELANIA BOT Professional Plan',
      plan_type: 'professional',
      subscription_id: `SUB_${timestamp}`
    };
  }

  static generateSampleDemo() {
    return {
      customer_email: 'prospect@example.com',
      customer_name: 'Potential Customer',
      customer_phone: '+1234567891',
      demo_date: '2024-01-20 14:00:00',
      demo_type: 'live',
      scheduled_by: 'sales_rep_1',
      demo_url: 'https://zoom.us/demo456',
      calendar_link: 'https://calendly.com/sales-demo',
      requested_topics: ['automation', 'pricing', 'implementation']
    };
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔗 CRM Integration Example for Event Clocking System');
  console.log('=' * 55);

  // Configuration
  const CLOCKING_API_URL = process.env.CLOCKING_API_URL || 'http://localhost:3000';
  const API_KEY = process.env.CLOCKING_API_KEY; // Optional

  // Initialize CRM integration
  const crmIntegration = new CRMEventIntegration(CLOCKING_API_URL, API_KEY);

  try {
    // 1. Test single lead sync
    console.log('\n🧪 Testing single lead sync...');
    const sampleLeads = CRMDataSimulator.generateSampleLeads(1);
    await crmIntegration.syncCRMLead(sampleLeads[0]);

    // 2. Test payment sync
    console.log('\n💳 Testing payment sync...');
    const samplePayment = CRMDataSimulator.generateSamplePayment();
    await crmIntegration.syncPaymentConfirmation(samplePayment);

    // 3. Test demo sync
    console.log('\n📅 Testing demo sync...');
    const sampleDemo = CRMDataSimulator.generateSampleDemo();
    await crmIntegration.syncDemoScheduling(sampleDemo);

    // 4. Test bulk sync
    console.log('\n📊 Testing bulk CRM sync...');
    const bulkLeads = CRMDataSimulator.generateSampleLeads(5);
    await crmIntegration.bulkSyncCRM(bulkLeads);

    // 5. Get dashboard data
    console.log('\n📈 Fetching CRM dashboard...');
    await crmIntegration.getCRMDashboard();

    // 6. Setup real-time monitoring (commented out for demo)
    // console.log('\n🔄 Setting up real-time monitoring...');
    // const eventSource = crmIntegration.setupRealTimeMonitoring();
    // 
    // setTimeout(() => {
    //   console.log('Closing real-time connection...');
    //   eventSource.close();
    // }, 10000);

    console.log('\n✅ CRM Integration example completed successfully!');
    console.log('💡 Check your clocking dashboard to see the synchronized events.');

  } catch (error) {
    console.error('\n❌ CRM Integration failed:', error.message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  CRMEventIntegration,
  CRMDataSimulator
};