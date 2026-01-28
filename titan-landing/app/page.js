"use client";
import { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

export default function Page() {
  const [lang, setLang] = useState('es');
  return (
    <main>
      <Header lang={lang} setLang={setLang} />
      <div id="hero"><Hero lang={lang} /></div>
      <div id="features"><Features lang={lang} /></div>
      <div id="pricing"><Pricing lang={lang} /></div>
      <div id="contact"><ContactForm lang={lang} /></div>
      <Footer />
    </main>
  );
}