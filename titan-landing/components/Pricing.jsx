"use client";

export default function Pricing({ lang }) {
  const copy = {
    es: {
      title: 'Precios transparentes',
      plan: 'Titan Pro',
      price: 'USD 149 / mes',
      features: ['Ejecuci\u00f3n multi-estrategia', 'Soporte prioritario', 'Actualizaciones semanales'],
      cta: 'Ir a Checkout'
    },
    en: {
      title: 'Transparent pricing',
      plan: 'Titan Pro',
      price: 'USD 149 / mo',
      features: ['Multi-strategy execution', 'Priority support', 'Weekly updates'],
      cta: 'Go to Checkout'
    }
  }[lang];

  const goCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert('Checkout unavailable');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 style={{ fontSize: 28, marginBottom: 18 }}>{copy.title}</h2>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{copy.plan}</div>
            <div className="h-sub" style={{ marginTop: 8 }}>{copy.price}</div>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)' }}>
            {copy.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <button className="btn primary" onClick={goCheckout}>{copy.cta}</button>
        </div>
      </div>
    </section>
  );
}