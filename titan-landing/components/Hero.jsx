"use client";
import Link from 'next/link';

export default function Hero({ lang }) {
  const copy = {
    es: {
      title: 'Titan Bot\u2122: rendimiento superior con IA en mercados 24/7',
      subtitle: 'Scalping, arbitraje y tendencias con ejecución de nivel institucional. Configuración en minutos. Control total.',
      ctaWhats: 'Hablar por WhatsApp',
      ctaCheckout: 'Comenzar ahora'
    },
    en: {
      title: 'Titan Bot\u2122: AI-powered performance in 24/7 markets',
      subtitle: 'Scalping, arbitrage, and trends with institutional-grade execution. Setup in minutes. Full control.',
      ctaWhats: 'Chat on WhatsApp',
      ctaCheckout: 'Start now'
    }
  }[lang];

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001112233';
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, quiero Titan Bot\u2122')}`;

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="badge" style={{ margin: '0 auto 16px', width: 'fit-content' }}>
            <span>AI. Automation. Impact.</span>
          </div>
          <h1>{copy.title}</h1>
          <p className="h-sub" style={{ maxWidth: 820, margin: '0 auto 24px' }}>{copy.subtitle}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a className="btn" href={waUrl} target="_blank" rel="noreferrer">
              {copy.ctaWhats}
            </a>
            <Link className="btn primary" href="/api/checkout" prefetch={false}>
              {copy.ctaCheckout}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}