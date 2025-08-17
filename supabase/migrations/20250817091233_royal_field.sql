/*
  # Sistema de Usuarios MELANO INC - Registro y Suscripciones

  1. New Tables
    - `user_profiles` - Perfiles de usuarios con datos adicionales
    - `subscriptions` - Suscripciones activas (LUXIA, NOTORIUS)
    - `user_sessions` - Sesiones de acceso a plataformas
    - `payment_history` - Historial de pagos
    - `user_preferences` - Configuraciones personales

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access based on subscription status

  3. Features
    - Multi-plan subscriptions (Starter, Professional, Premium)
    - Access control for LUXIA CRM and NOTORIUS
    - Payment tracking and subscription management
    - User preferences and settings
*/

-- User Profiles Extension
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text DEFAULT 'AR',
  language text DEFAULT 'es',
  preferred_currency text DEFAULT 'ars',
  investor_profile text CHECK (investor_profile IN ('beginner', 'intermediate', 'advanced', 'professional')),
  investment_goals text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text UNIQUE NOT NULL,
  name_es text NOT NULL,
  name_en text NOT NULL,
  price_ars integer NOT NULL,
  price_usd integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  max_portfolio_size bigint,
  includes_luxia boolean DEFAULT false,
  includes_notorius boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert default plans
INSERT INTO subscription_plans (plan_code, name_es, name_en, price_ars, price_usd, features, max_portfolio_size, includes_luxia, includes_notorius, priority_support) 
VALUES 
  ('starter', 'Consulta Inicial', 'Initial Consultation', 15000, 150, 
   '["Análisis inicial", "Estrategia personalizada", "MELANO NEXUS básico", "Seguimiento 7 días"]', 
   100000, false, false, false),
  ('professional', 'Gestión Profesional', 'Professional Management', 85000, 850,
   '["Gestión activa 24/7", "IA MELANO NEXUS completa", "WhatsApp prioritario", "Reportes semanales", "NOTORIUS Smart Contracts"]',
   5000000, true, true, true),
  ('premium', 'Gestión Premium', 'Premium Management', 250000, 2500,
   '["Acceso directo a Bruno", "Estrategias institucionales", "Diversificación global", "Target ROI: 200%+", "Tokenización NOTORIUS"]',
   null, true, true, true)
ON CONFLICT (plan_code) DO NOTHING;

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  payment_method text DEFAULT 'mercadopago',
  stripe_subscription_id text,
  mercadopago_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment History
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id),
  amount_ars integer,
  amount_usd integer,
  currency text DEFAULT 'ars',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  external_payment_id text,
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Sessions (for tracking platform access)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text CHECK (platform IN ('luxia', 'notorius')),
  session_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_minutes integer
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  luxia_settings jsonb DEFAULT '{}',
  notorius_settings jsonb DEFAULT '{}',
  notification_preferences jsonb DEFAULT '{"email": true, "whatsapp": true, "push": false}',
  dashboard_layout jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can read own payments"
  ON payment_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid uuid)
RETURNS TABLE (
  has_active_subscription boolean,
  plan_code text,
  includes_luxia boolean,
  includes_notorius boolean,
  expires_at timestamptz
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    CASE WHEN us.status = 'active' AND (us.expires_at IS NULL OR us.expires_at > now()) 
         THEN true ELSE false END,
    sp.plan_code,
    sp.includes_luxia,
    sp.includes_notorius,
    us.expires_at
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);