import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.status(200).send('OK');
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'FAIL',
      error: err && err.message ? err.message : String(err)
    });
  }
});

// MELANIA BOT Lead capture endpoint
app.post('/api/lead-capture', async (req, res) => {
  try {
    const { fullName, email, phone, company, service, budget, utm } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos obligatorios' 
      });
    }

    // Calculate lead score based on budget and service type
    let leadScore = 25;
    if (budget >= 25000) leadScore = 100; // Enterprise
    else if (budget >= 8500) leadScore = 75; // Pro
    else if (budget >= 2500) leadScore = 50; // Starter

    // Store lead in database (if available)
    const leadData = {
      full_name: fullName,
      email,
      phone,
      company: company || '',
      service: service || 'MELANIA BOT',
      budget: budget || 0,
      lead_score: leadScore,
      utm_source: utm?.source || '',
      utm_campaign: utm?.campaign || '',
      created_at: new Date().toISOString()
    };

    // Cache in Redis for immediate processing
    await redis.hset(`lead:${email}`, leadData);
    await redis.expire(`lead:${email}`, 86400); // 24 hours

    console.log('Lead captured:', leadData);

    res.json({
      success: true,
      message: 'Lead capturado exitosamente',
      leadScore,
      estimatedResponse: leadScore >= 75 ? '30 minutos' : '2 horas'
    });

  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Payment creation endpoint for MercadoPago
app.post('/api/payment/mercadopago', async (req, res) => {
  try {
    const { plan, customerData } = req.body;
    
    // Plan pricing
    const planPricing = {
      starter: { price: 2500, currency: 'EUR', name: 'MELANIA BOT Starter' },
      professional: { price: 8500, currency: 'EUR', name: 'MELANIA BOT Pro' },
      enterprise: { price: 25000, currency: 'EUR', name: 'MELANIA BOT Enterprise' }
    };

    const selectedPlan = planPricing[plan];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, error: 'Plan no válido' });
    }

    // In production, integrate with MercadoPago API
    // For now, return success response with payment link
    const paymentId = `mp_${Date.now()}_${plan}`;
    
    // Store payment intent in Redis
    await redis.hset(`payment:${paymentId}`, {
      plan,
      customer_email: customerData.email,
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      paymentId,
      redirectUrl: process.env.MERCADOPAGO_PAYMENT_URL || 'https://link.mercadopago.com/melanoinc',
      plan: selectedPlan
    });

  } catch (error) {
    console.error('Error creating MercadoPago payment:', error);
    res.status(500).json({ success: false, error: 'Error procesando pago' });
  }
});

// Payment creation endpoint for PayPal
app.post('/api/payment/paypal', async (req, res) => {
  try {
    const { plan, customerData } = req.body;
    
    // Plan pricing in USD for PayPal
    const planPricing = {
      starter: { price: 2750, currency: 'USD', name: 'MELANIA BOT Starter' },
      professional: { price: 9350, currency: 'USD', name: 'MELANIA BOT Pro' },
      enterprise: { price: 27500, currency: 'USD', name: 'MELANIA BOT Enterprise' }
    };

    const selectedPlan = planPricing[plan];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, error: 'Plan no válido' });
    }

    // In production, integrate with PayPal API
    const paymentId = `pp_${Date.now()}_${plan}`;
    
    // Store payment intent in Redis
    await redis.hset(`payment:${paymentId}`, {
      plan,
      customer_email: customerData.email,
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      paymentId,
      redirectUrl: process.env.PAYPAL_PAYMENT_URL || 'https://paypal.me/melanoinc',
      plan: selectedPlan
    });

  } catch (error) {
    console.error('Error creating PayPal payment:', error);
    res.status(500).json({ success: false, error: 'Error procesando pago' });
  }
});

// Payment confirmation endpoint
app.post('/api/payment/confirm', async (req, res) => {
  try {
    const { paymentId, status } = req.body;
    
    // Get payment data from Redis
    const paymentData = await redis.hgetall(`payment:${paymentId}`);
    if (!paymentData || !paymentData.plan) {
      return res.status(404).json({ success: false, error: 'Pago no encontrado' });
    }

    // Update payment status
    await redis.hset(`payment:${paymentId}`, 'status', status);
    
    if (status === 'completed') {
      // Grant access to the service
      await redis.hset(`user:${paymentData.customer_email}`, {
        plan: paymentData.plan,
        status: 'active',
        activated_at: new Date().toISOString()
      });
      
      console.log(`Payment confirmed for ${paymentData.customer_email}: ${paymentData.plan}`);
    }

    res.json({
      success: true,
      message: status === 'completed' ? 'Pago confirmado - Acceso activado' : 'Pago procesado',
      status
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, error: 'Error confirmando pago' });
  }
});

// MELANIA BOT webhook endpoint for external integrations
app.post('/webhook/melania-bot', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log('MELANIA BOT webhook received:', { type, data });
    
    // Process different webhook types
    switch (type) {
      case 'message_received':
        // Handle incoming messages from WhatsApp, Email, etc.
        await redis.lpush('melania:messages', JSON.stringify(data));
        break;
      case 'lead_qualified':
        // Handle qualified leads
        await redis.lpush('melania:qualified_leads', JSON.stringify(data));
        break;
      case 'sale_completed':
        // Handle completed sales
        await redis.lpush('melania:sales', JSON.stringify(data));
        break;
      default:
        console.log('Unknown webhook type:', type);
    }

    res.json({ success: true, message: 'Webhook procesado' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: 'Error procesando webhook' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MELANO INC Server running on port ${PORT}`);
  console.log(`🤖 MELANIA BOT endpoints ready`);
  console.log(`💳 Payment processing active (MercadoPago + PayPal)`);
});
