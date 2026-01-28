"use client";
import { useState } from 'react';

export default function ContactForm({ lang }) {
  const t = {
    es: { title: 'Hablemos', name: 'Nombre', email: 'Email', msg: 'Mensaje', send: 'Enviar', ok: 'Mensaje enviado', err: 'Error al enviar' },
    en: { title: 'Let\'s talk', name: 'Name', email: 'Email', msg: 'Message', send: 'Send', ok: 'Message sent', err: 'Send failed' }
  }[lang];

  const [state, setState] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error('Request failed');
      alert(t.ok);
      setState({ name: '', email: '', message: '' });
    } catch (e) {
      console.error(e);
      alert(t.err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 style={{ fontSize: 28, marginBottom: 18 }}>{t.title}</h2>
        <form className="card" onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <input required placeholder={t.name} value={state.name} onChange={e => setState(s => ({ ...s, name: e.target.value }))} className="card" style={{ padding: 12 }} />
          <input required type="email" placeholder={t.email} value={state.email} onChange={e => setState(s => ({ ...s, email: e.target.value }))} className="card" style={{ padding: 12 }} />
          <textarea required placeholder={t.msg} value={state.message} onChange={e => setState(s => ({ ...s, message: e.target.value }))} className="card" rows={5} style={{ padding: 12 }} />
          <button className="btn primary" type="submit" disabled={loading}>{loading ? '...' : t.send}</button>
        </form>
      </div>
    </section>
  );
}