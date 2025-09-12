/*
  # Event Clocking System for CRM and Bot Integration
  
  This migration creates the event tracking system that connects:
  - Sales events from bots and external systems
  - Lead conversion tracking 
  - Payment confirmations
  - Real-time analytics for dashboard
  
  Tables:
    - `clocking_events` - All tracked events (sales, leads, payments, conversions)
    - `clocking_sources` - Event sources (bots, websites, external APIs)
    - `clocking_analytics` - Aggregated metrics for dashboard
*/

-- Create enum types for event tracking
DO $$ BEGIN
  CREATE TYPE event_type AS ENUM (
    'lead_captured', 
    'lead_qualified', 
    'lead_hot', 
    'demo_scheduled', 
    'proposal_sent', 
    'payment_initiated', 
    'payment_completed', 
    'payment_failed',
    'subscription_created',
    'subscription_activated',
    'conversion_completed',
    'bot_interaction',
    'email_opened',
    'email_clicked',
    'whatsapp_message',
    'call_completed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE source_type AS ENUM ('melania_bot', 'website', 'whatsapp_bot', 'email_bot', 'external_api', 'crm_manual', 'webhook');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Event Sources table
CREATE TABLE IF NOT EXISTS clocking_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text UNIQUE NOT NULL,
  source_type source_type NOT NULL,
  description text,
  api_key text, -- For external integrations
  webhook_url text,
  is_active boolean DEFAULT true,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Main Events table - stores all tracked events
CREATE TABLE IF NOT EXISTS clocking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_type event_type NOT NULL,
  event_status event_status DEFAULT 'pending',
  external_id text, -- ID from external system (bot, CRM, etc.)
  
  -- Event source
  source_id uuid REFERENCES clocking_sources(id),
  source_name text, -- Denormalized for quick access
  
  -- Event data
  event_data jsonb DEFAULT '{}'::jsonb,
  event_value decimal(15,2), -- Monetary value (sales, payments)
  currency text DEFAULT 'EUR',
  
  -- Lead/Customer information
  customer_email text,
  customer_name text,
  customer_phone text,
  customer_id uuid, -- Link to user_profiles if available
  
  -- Context information
  session_id text,
  user_agent text,
  ip_address inet,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  -- Location data
  country text,
  city text,
  
  -- Timing
  event_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Search optimization
  CONSTRAINT valid_event_value CHECK (event_value >= 0)
);

-- Real-time analytics aggregation table
CREATE TABLE IF NOT EXISTS clocking_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  period_type text NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  
  -- Source
  source_id uuid REFERENCES clocking_sources(id),
  source_name text,
  
  -- Metrics
  total_events integer DEFAULT 0,
  leads_captured integer DEFAULT 0,
  leads_qualified integer DEFAULT 0,
  demos_scheduled integer DEFAULT 0,
  payments_completed integer DEFAULT 0,
  total_revenue decimal(15,2) DEFAULT 0,
  conversion_rate decimal(5,2) DEFAULT 0, -- Percentage
  
  -- Event type breakdown
  event_breakdown jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(period_type, period_start, source_id)
);

-- Lead Scoring table (derived from events)
CREATE TABLE IF NOT EXISTS lead_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead identification
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  customer_id uuid REFERENCES user_profiles(id),
  
  -- Scoring
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  score_breakdown jsonb DEFAULT '{}'::jsonb,
  
  -- Status
  lead_status text DEFAULT 'cold', -- cold, warm, hot, qualified, converted
  last_interaction timestamptz,
  next_followup timestamptz,
  
  -- Source tracking
  first_source_id uuid REFERENCES clocking_sources(id),
  last_source_id uuid REFERENCES clocking_sources(id),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(customer_email)
);

-- Insert default sources
INSERT INTO clocking_sources (source_name, source_type, description) VALUES
('MELANIA_BOT', 'melania_bot', 'Primary MELANIA BOT automation system'),
('WEBSITE_FORM', 'website', 'Landing page contact forms'),
('WHATSAPP_BOT', 'whatsapp_bot', 'WhatsApp automation bot'),
('EMAIL_CAMPAIGNS', 'email_bot', 'Email marketing automation'),
('EXTERNAL_CRM', 'external_api', 'External CRM integrations'),
('MANUAL_ENTRY', 'crm_manual', 'Manual CRM entries'),
('WEBHOOK_GENERIC', 'webhook', 'Generic webhook integrations')
ON CONFLICT (source_name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clocking_events_timestamp ON clocking_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clocking_events_type ON clocking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_clocking_events_status ON clocking_events(event_status);
CREATE INDEX IF NOT EXISTS idx_clocking_events_source ON clocking_events(source_id);
CREATE INDEX IF NOT EXISTS idx_clocking_events_customer_email ON clocking_events(customer_email);
CREATE INDEX IF NOT EXISTS idx_clocking_events_external_id ON clocking_events(external_id);
CREATE INDEX IF NOT EXISTS idx_clocking_events_customer_id ON clocking_events(customer_id);

CREATE INDEX IF NOT EXISTS idx_clocking_analytics_period ON clocking_analytics(period_type, period_start, source_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_email ON lead_scores(customer_email);
CREATE INDEX IF NOT EXISTS idx_lead_scores_status ON lead_scores(lead_status);
CREATE INDEX IF NOT EXISTS idx_lead_scores_score ON lead_scores(score DESC);

-- Triggers for updated_at
CREATE TRIGGER update_clocking_sources_updated_at
  BEFORE UPDATE ON clocking_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clocking_events_updated_at
  BEFORE UPDATE ON clocking_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clocking_analytics_updated_at
  BEFORE UPDATE ON clocking_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_scores_updated_at
  BEFORE UPDATE ON lead_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate lead score based on events
CREATE OR REPLACE FUNCTION calculate_lead_score(p_customer_email text)
RETURNS integer AS $$
DECLARE
  base_score integer := 0;
  event_rec record;
BEGIN
  -- Base scoring algorithm
  FOR event_rec IN 
    SELECT event_type, COUNT(*) as event_count, MAX(event_timestamp) as last_event
    FROM clocking_events 
    WHERE customer_email = p_customer_email 
    GROUP BY event_type
  LOOP
    CASE event_rec.event_type
      WHEN 'lead_captured' THEN base_score := base_score + 10;
      WHEN 'lead_qualified' THEN base_score := base_score + 20;
      WHEN 'lead_hot' THEN base_score := base_score + 30;
      WHEN 'demo_scheduled' THEN base_score := base_score + 40;
      WHEN 'proposal_sent' THEN base_score := base_score + 50;
      WHEN 'payment_initiated' THEN base_score := base_score + 70;
      WHEN 'payment_completed' THEN base_score := base_score + 100;
      WHEN 'bot_interaction' THEN base_score := base_score + (event_rec.event_count * 2);
      WHEN 'email_opened' THEN base_score := base_score + (event_rec.event_count * 1);
      WHEN 'email_clicked' THEN base_score := base_score + (event_rec.event_count * 3);
      WHEN 'whatsapp_message' THEN base_score := base_score + (event_rec.event_count * 5);
      ELSE base_score := base_score + 1;
    END CASE;
  END LOOP;

  -- Cap at 100
  IF base_score > 100 THEN
    base_score := 100;
  END IF;

  RETURN base_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update lead score when events are added
CREATE OR REPLACE FUNCTION update_lead_score_on_event()
RETURNS TRIGGER AS $$
DECLARE
  new_score integer;
  lead_status_val text;
BEGIN
  -- Calculate new score
  new_score := calculate_lead_score(NEW.customer_email);
  
  -- Determine lead status based on score
  IF new_score >= 80 THEN
    lead_status_val := 'hot';
  ELSIF new_score >= 60 THEN
    lead_status_val := 'qualified';
  ELSIF new_score >= 30 THEN
    lead_status_val := 'warm';
  ELSE
    lead_status_val := 'cold';
  END IF;
  
  -- Upsert lead score
  INSERT INTO lead_scores (
    customer_email, 
    customer_name, 
    customer_phone, 
    customer_id,
    score, 
    lead_status,
    last_interaction,
    first_source_id,
    last_source_id
  ) VALUES (
    NEW.customer_email,
    NEW.customer_name,
    NEW.customer_phone,
    NEW.customer_id,
    new_score,
    lead_status_val,
    NEW.event_timestamp,
    NEW.source_id,
    NEW.source_id
  )
  ON CONFLICT (customer_email) DO UPDATE SET
    score = new_score,
    lead_status = lead_status_val,
    last_interaction = NEW.event_timestamp,
    last_source_id = NEW.source_id,
    customer_name = COALESCE(NEW.customer_name, lead_scores.customer_name),
    customer_phone = COALESCE(NEW.customer_phone, lead_scores.customer_phone),
    customer_id = COALESCE(NEW.customer_id, lead_scores.customer_id),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update lead scores
CREATE TRIGGER update_lead_score_trigger
  AFTER INSERT ON clocking_events
  FOR EACH ROW 
  WHEN (NEW.customer_email IS NOT NULL)
  EXECUTE FUNCTION update_lead_score_on_event();

-- Function to aggregate analytics (run periodically)
CREATE OR REPLACE FUNCTION aggregate_analytics(
  p_period_type text DEFAULT 'daily',
  p_source_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  period_start_val timestamptz;
  period_end_val timestamptz;
  source_rec record;
BEGIN
  -- Determine period based on type
  CASE p_period_type
    WHEN 'hourly' THEN
      period_start_val := date_trunc('hour', now() - interval '1 hour');
      period_end_val := date_trunc('hour', now());
    WHEN 'daily' THEN
      period_start_val := date_trunc('day', now() - interval '1 day');
      period_end_val := date_trunc('day', now());
    WHEN 'weekly' THEN
      period_start_val := date_trunc('week', now() - interval '1 week');
      period_end_val := date_trunc('week', now());
    WHEN 'monthly' THEN
      period_start_val := date_trunc('month', now() - interval '1 month');
      period_end_val := date_trunc('month', now());
    ELSE
      RAISE EXCEPTION 'Invalid period type: %', p_period_type;
  END CASE;

  -- Aggregate for each source (or specific source)
  FOR source_rec IN 
    SELECT id, source_name 
    FROM clocking_sources 
    WHERE (p_source_id IS NULL OR id = p_source_id)
      AND is_active = true
  LOOP
    INSERT INTO clocking_analytics (
      period_type,
      period_start,
      period_end,
      source_id,
      source_name,
      total_events,
      leads_captured,
      leads_qualified,
      demos_scheduled,
      payments_completed,
      total_revenue,
      conversion_rate,
      event_breakdown
    )
    SELECT 
      p_period_type,
      period_start_val,
      period_end_val,
      source_rec.id,
      source_rec.source_name,
      COUNT(*) as total_events,
      COUNT(*) FILTER (WHERE event_type = 'lead_captured') as leads_captured,
      COUNT(*) FILTER (WHERE event_type = 'lead_qualified') as leads_qualified,
      COUNT(*) FILTER (WHERE event_type = 'demo_scheduled') as demos_scheduled,
      COUNT(*) FILTER (WHERE event_type = 'payment_completed') as payments_completed,
      COALESCE(SUM(event_value) FILTER (WHERE event_type = 'payment_completed'), 0) as total_revenue,
      CASE 
        WHEN COUNT(*) FILTER (WHERE event_type = 'lead_captured') > 0 
        THEN (COUNT(*) FILTER (WHERE event_type = 'payment_completed')::decimal / COUNT(*) FILTER (WHERE event_type = 'lead_captured') * 100)
        ELSE 0
      END as conversion_rate,
      jsonb_object_agg(event_type, COUNT(*)) as event_breakdown
    FROM clocking_events
    WHERE source_id = source_rec.id
      AND event_timestamp >= period_start_val
      AND event_timestamp < period_end_val
    GROUP BY source_rec.id, source_rec.source_name
    HAVING COUNT(*) > 0
    ON CONFLICT (period_type, period_start, source_id) DO UPDATE SET
      total_events = EXCLUDED.total_events,
      leads_captured = EXCLUDED.leads_captured,
      leads_qualified = EXCLUDED.leads_qualified,
      demos_scheduled = EXCLUDED.demos_scheduled,
      payments_completed = EXCLUDED.payments_completed,
      total_revenue = EXCLUDED.total_revenue,
      conversion_rate = EXCLUDED.conversion_rate,
      event_breakdown = EXCLUDED.event_breakdown,
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE clocking_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE clocking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE clocking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow service role and admins full access
CREATE POLICY "Service role can manage all clocking data" ON clocking_sources
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all events" ON clocking_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all analytics" ON clocking_analytics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all lead scores" ON lead_scores
  FOR ALL USING (auth.role() = 'service_role');

-- Admin users can read all data
CREATE POLICY "Admins can read all clocking sources" ON clocking_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all events" ON clocking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all analytics" ON clocking_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all lead scores" ON lead_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can only see their own lead scores
CREATE POLICY "Users can see their own lead score" ON lead_scores
  FOR SELECT USING (
    customer_id = auth.uid() OR 
    customer_email = auth.email()
  );