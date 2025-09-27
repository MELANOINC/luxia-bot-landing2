import Stripe from 'stripe';

let stripeInstance = null;

export function getStripe() {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    stripeInstance = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return stripeInstance;
}