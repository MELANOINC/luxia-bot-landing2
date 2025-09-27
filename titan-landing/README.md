# Titan Bot\u2122 Landing (MELANO INC\u2122)

Premium bilingual landing with Stripe Checkout, WhatsApp CTA, and email contact.

## Tech Stack
- Next.js 14 (App Router)
- React 18
- Stripe Checkout API
- Nodemailer SMTP

## Setup
1. Copy `.env.example` to `.env.local` and fill values:
```
cp .env.example .env.local
```

2. Install dependencies:
```
npm install
```

3. Run locally:
```
npm run dev
```

4. Build:
```
npm run build && npm start
```

## Environment Variables
- STRIPE_SECRET_KEY: Stripe secret (test or live)
- STRIPE_PRICE_ID: Price ID for subscription/one-time
- STRIPE_SUCCESS_URL / STRIPE_CANCEL_URL: Post-checkout redirects
- SMTP_*: SMTP credentials for contact form
- CONTACT_TO / CONTACT_FROM: Email addresses
- NEXT_PUBLIC_WHATSAPP_NUMBER: WhatsApp CTA number (E.164)
- NEXT_PUBLIC_SITE_URL: Canonical site URL

## Deploy
### Vercel (recommended)
- Import the repo in Vercel
- Add env vars from `.env.example`
- Set Build Command: `npm run build`, Output: `.next`

### Netlify
- Adapter not required; use Next on Netlify build plugin or Netlify Next runtime
- Build Command: `npm run build`
- Publish directory: `.next`

## Stripe Checkout
- Update `STRIPE_PRICE_ID`
- The Pricing CTA calls `/api/checkout` to create a Checkout Session

## Contact Form
- `/api/contact` sends mail via SMTP using Nodemailer

## Branding
- Company: MELANO INC\u2122
- Slogan: "El crecimiento del mañana comienza con las decisiones de hoy"

## License
Proprietary \u00a9 MELANO INC\u2122