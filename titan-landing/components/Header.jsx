"use client";
import Image from 'next/image';
import LanguageSwitch from './LanguageSwitch';

export default function Header({ lang, setLang }) {
  return (
    <header className="section" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.svg" alt="MELANO INC" width={32} height={32} />
          <div>
            <div style={{ fontWeight: 700 }}>MELANO INC\u2122</div>
            <div className="h-sub" style={{ margin: 0, fontSize: 12 }}>
              El crecimiento del mañana comienza con las decisiones de hoy
            </div>
          </div>
        </div>
        <LanguageSwitch lang={lang} setLang={setLang} />
      </div>
    </header>
  );
}