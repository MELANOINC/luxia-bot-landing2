export default function Features({ lang }) {
  const copy = {
    es: {
      title: 'Arquitectura de alto rendimiento',
      items: [
        { h: 'Estrategias combinadas', p: 'Scalping, arbitraje y tendencia con gestión de riesgo unificada.' },
        { h: 'Monitoreo 24/7', p: 'Alertas en tiempo real y panel de control por cliente.' },
        { h: 'Backtesting & Live', p: 'Validación histórica y despliegue con un clic.' },
        { h: 'Multi-broker API', p: 'Kraken, Binance, Bybit. Integración modular.' }
      ]
    },
    en: {
      title: 'High-performance architecture',
      items: [
        { h: 'Combined strategies', p: 'Scalping, arbitrage, trend with unified risk management.' },
        { h: '24/7 monitoring', p: 'Real-time alerts and per-client control panel.' },
        { h: 'Backtesting & Live', p: 'Historical validation and one-click deploy.' },
        { h: 'Multi-broker API', p: 'Kraken, Binance, Bybit. Modular integration.' }
      ]
    }
  }[lang];

  return (
    <section className="section">
      <div className="container">
        <h2 style={{ fontSize: 28, marginBottom: 18 }}>{copy.title}</h2>
        <div className="grid">
          {copy.items.map((it, idx) => (
            <div key={idx} className="card" style={{ gridColumn: 'span 6' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{it.h}</div>
              <div style={{ color: 'var(--muted)' }}>{it.p}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}