import './globals.css';
import { Inter } from 'next/font/google';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Titan Bot\u2122 by MELANO INC\u2122',
    template: '%s | Titan Bot\u2122'
  },
  description: 'AI trading bot for scalping, arbitrage, and trend strategies. Premium automation by MELANO INC\u2122.',
  keywords: [
    'Titan Bot',
    'MELANO INC',
    'AI trading bot',
    'scalping',
    'arbitrage',
    'trend following',
    'automation',
    'SaaS'
  ],
  openGraph: {
    title: 'Titan Bot\u2122 by MELANO INC\u2122',
    description: 'AI trading bot for scalping, arbitrage, and trend strategies.',
    url: '/',
    siteName: 'Titan Bot\u2122',
    images: [
      { url: '/og-image.svg', width: 1200, height: 630, alt: 'Titan Bot by MELANO INC' }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Titan Bot\u2122 by MELANO INC\u2122',
    description: 'AI trading bot for scalping, arbitrage, and trend strategies.',
    images: ['/og-image.svg']
  }
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}