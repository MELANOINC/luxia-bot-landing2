-- MELANIA BOT Database Initialization
-- This script creates the necessary tables for the MELANIA BOT system

-- Lead tracking table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    service VARCHAR(100) DEFAULT 'AI Automation',
    budget INTEGER DEFAULT 0,
    lead_score INTEGER DEFAULT 50,
    status VARCHAR(50) DEFAULT 'new',
    source VARCHAR(100),
    utm_campaign VARCHAR(255),
    utm_source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    lead_id VARCHAR(255),
    channel VARCHAR(50) NOT NULL, -- whatsapp, email, webchat
    from_user VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    ai_response TEXT,
    intent VARCHAR(100),
    sentiment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    lead_email VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    provider_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    lead_id VARCHAR(255),
    channel VARCHAR(50),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    webhook_id VARCHAR(255) UNIQUE NOT NULL,
    webhook_type VARCHAR(50) NOT NULL,
    source VARCHAR(100),
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(lead_email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_webhooks_type ON webhook_events(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhook_events(processed);

-- Insert sample data for development
INSERT INTO leads (lead_id, full_name, email, phone, company, budget, lead_score, status) VALUES
('lead_sample_1', 'Demo Lead 1', 'demo1@melanoinc.com', '+5492235506585', 'Tech Startup SaaS', 8500, 85, 'new'),
('lead_sample_2', 'Demo Lead 2', 'demo2@melanoinc.com', '+5492235506586', 'E-commerce Premium', 25000, 95, 'qualified')
ON CONFLICT (lead_id) DO NOTHING;

-- Create database user for application (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'melania_app') THEN
        CREATE USER melania_app WITH PASSWORD 'melania_app_password';
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO melania_app;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO melania_app;
    END IF;
END
$$;