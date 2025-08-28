import { NextResponse } from 'next/server';
import { getStripe } from '../../../lib/stripe';

export async function POST() {
  try {
    const stripe = getStripe();
    const price = process.env.STRIPE_PRICE_ID;
    if (!price) throw new Error('Missing STRIPE_PRICE_ID');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?canceled=true`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}

export async function GET() {
  // Optional GET to just create and redirect directly from link
  const res = await POST();
  const data = await res.json();
  if (data?.url) {
    return NextResponse.redirect(data.url);
  }
  return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
}