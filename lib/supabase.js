// Supabase Configuration - MELANO INC
// Authentication and Database Client

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Authentication helpers
export const auth = {
  // Sign up with email/password
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName || '',
          phone: userData.phone || '',
          investor_profile: userData.investorProfile || '',
          country: userData.country || 'AR',
          language: userData.language || 'es'
        }
      }
    })
    return { data, error }
  },

  // Sign in with email/password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Update user profile
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })
    return { data, error }
  }
}

// Database helpers
export const db = {
  // User profiles
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Subscriptions
  async getUserSubscription(userId) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  },

  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_usd', { ascending: true })
    return { data, error }
  },

  async createSubscription(userId, planId, paymentData = {}) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        payment_method: paymentData.method || 'mercadopago',
        stripe_subscription_id: paymentData.stripeId,
        mercadopago_subscription_id: paymentData.mercadopagoId
      })
      .select()
      .single()
    return { data, error }
  },

  // Payment history
  async addPayment(paymentData) {
    const { data, error } = await supabase
      .from('payment_history')
      .insert(paymentData)
      .select()
      .single()
    return { data, error }
  },

  async getUserPayments(userId) {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // User preferences
  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async updateUserPreferences(userId, preferences) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // Session tracking
  async startSession(userId, platform, sessionData = {}) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        platform,
        session_data: sessionData,
        ip_address: sessionData.ip,
        user_agent: navigator.userAgent
      })
      .select()
      .single()
    return { data, error }
  },

  async endSession(sessionId, durationMinutes) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes
      })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  }
}

// Subscription status checker
export async function checkUserAccess(userId) {
  try {
    const { data: subscription, error } = await db.getUserSubscription(userId)
    
    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Error checking subscription:', error)
      return {
        hasAccess: false,
        plan: null,
        luxiaAccess: false,
        notoriusAccess: false
      }
    }

    if (!subscription) {
      return {
        hasAccess: false,
        plan: null,
        luxiaAccess: false,
        notoriusAccess: false
      }
    }

    // Check if subscription is still valid
    const now = new Date()
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
    const isValid = !expiresAt || expiresAt > now

    if (!isValid) {
      return {
        hasAccess: false,
        plan: subscription.subscription_plans?.plan_code,
        luxiaAccess: false,
        notoriusAccess: false
      }
    }

    return {
      hasAccess: true,
      plan: subscription.subscription_plans?.plan_code,
      luxiaAccess: subscription.subscription_plans?.includes_luxia || false,
      notoriusAccess: subscription.subscription_plans?.includes_notorius || false,
      subscription
    }
  } catch (error) {
    console.error('Error checking user access:', error)
    return {
      hasAccess: false,
      plan: null,
      luxiaAccess: false,
      notoriusAccess: false
    }
  }
}

// Real-time subscription for auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

export default supabase