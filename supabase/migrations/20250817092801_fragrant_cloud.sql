/*
  # Sistema Completo de Usuarios MELANO INC
  
  1. Configuración de Authentication
    - Email/password sin confirmación 
    - Auto-registro habilitado
    - Admin user: melanobruno@gmail.com
  
  2. Tablas de Usuario
    - `user_profiles` - Perfiles completos de usuarios
    - `subscription_plans` - Planes: Starter, Professional, Premium  
    - `user_subscriptions` - Suscripciones activas
    - `payment_history` - Historial de pagos
    - `user_sessions` - Tracking de uso
    - `user_preferences` - Configuraciones personales
  
  3. Sistema de Roles
    - `user_roles` - Roles: user, admin, premium
    - RLS policies por rol
    - Admin: Bruno Melano (melanobruno@gmail.com)
  
  4. Triggers y Funciones
    - Auto-creación de perfil al registrarse
    - Asignación automática de rol 'user'
    - Triggers de updated_at
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('user', 'admin', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'cancelled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, email, country, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'country', 'AR'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'es')
  );
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role);
  
  -- If it's Bruno Melano, make admin
  IF NEW.email = 'melanobruno@gmail.com' OR NEW.email = 'contacto1@brunomelano.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  phone text,
  country text DEFAULT 'AR',
  timezone text DEFAULT 'America/Argentina/Buenos_Aires',
  language text DEFAULT 'es',
  
  -- Investment profile
  investor_profile text DEFAULT 'beginner',
  investment_goals text,
  risk_tolerance text DEFAULT 'medium',
  
  -- Gamification
  melano_points integer DEFAULT 0 NOT NULL,
  daily_streak integer DEFAULT 0 NOT NULL,
  last_daily_check date,
  
  -- Referral system
  referral_code text UNIQUE,
  referred_by uuid REFERENCES user_profiles(id),
  
  -- KYC and verification
  kyc_verified boolean DEFAULT false NOT NULL,
  kyc_level text DEFAULT 'basic',
  
  -- Account status
  account_status text DEFAULT 'active',
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, role)
);

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text UNIQUE NOT NULL,
  name_es text NOT NULL,
  name_en text NOT NULL,
  description_es text,
  description_en text,
  
  -- Pricing
  price_ars integer NOT NULL,
  price_usd integer NOT NULL,
  
  -- Features
  features jsonb DEFAULT '[]'::jsonb NOT NULL,
  max_portfolio_size bigint,
  
  -- Access control
  includes_luxia boolean DEFAULT false,
  includes_notorius boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  
  -- Limits
  monthly_consultations integer DEFAULT 1,
  ai_signals_per_day integer DEFAULT 10,
  
  created_at timestamptz DEFAULT now()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id),
  
  status subscription_status DEFAULT 'pending',
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  
  -- Payment integration
  payment_method text DEFAULT 'mercadopago',
  stripe_subscription_id text,
  mercadopago_subscription_id text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id),
  
  -- Amount info
  amount_ars integer,
  amount_usd integer,
  currency text DEFAULT 'ars',
  
  -- Payment status
  status text DEFAULT 'pending',
  payment_method text,
  external_payment_id text,
  
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Sessions Table (tracking platform usage)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text NOT NULL,
  platform text, -- 'luxia', 'notorius', 'landing'
  
  -- Session data
  ip_address inet,
  user_agent text,
  
  -- Timing
  created_at timestamptz DEFAULT now() NOT NULL,
  last_activity timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '30 minutes') NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- App preferences
  luxia_settings jsonb DEFAULT '{}'::jsonb,
  notorius_settings jsonb DEFAULT '{}'::jsonb,
  
  -- Notifications
  notification_preferences jsonb DEFAULT '{"push": false, "email": true, "whatsapp": true}'::jsonb,
  
  -- UI preferences
  language text DEFAULT 'es',
  currency text DEFAULT 'ars',
  dashboard_layout jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_code, name_es, name_en, price_ars, price_usd, features, includes_luxia, includes_notorius, monthly_consultations, ai_signals_per_day) VALUES
('starter', 'Consulta Inicial', 'Initial Consultation', 15000, 150, 
 '["Análisis inicial de portfolio", "Estrategia personalizada", "Seguimiento 7 días"]'::jsonb, 
 false, false, 1, 5),

('professional', 'Gestión Profesional', 'Professional Management', 85000, 850,
 '["Gestión activa 24/7", "IA MELANO NEXUS completa", "WhatsApp prioritario", "Reportes semanales", "LUXIA CRM completo"]'::jsonb,
 true, false, 4, 50),

('premium', 'Gestión Premium', 'Premium Management', 250000, 2500,
 '["Acceso directo a Bruno", "Estrategias institucionales", "Diversificación global", "LUXIA + NOTORIUS completo", "Tokenización de activos"]'::jsonb,
 true, true, 999, 999)
ON CONFLICT (plan_code) DO UPDATE SET
  name_es = EXCLUDED.name_es,
  name_en = EXCLUDED.name_en,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  features = EXCLUDED.features,
  includes_luxia = EXCLUDED.includes_luxia,
  includes_notorius = EXCLUDED.includes_notorius;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role policies for admin operations
CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all payments" ON payment_history
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile after user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_id uuid, check_role app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get user subscription info
CREATE OR REPLACE FUNCTION get_user_subscription(user_id uuid)
RETURNS TABLE (
  plan_code text,
  includes_luxia boolean,
  includes_notorius boolean,
  status subscription_status,
  expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.plan_code,
    sp.includes_luxia,
    sp.includes_notorius,
    us.status,
    us.expires_at
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = $1 
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ language 'plpgsql' SECURITY DEFINER;