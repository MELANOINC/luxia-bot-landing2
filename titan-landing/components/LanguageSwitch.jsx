"use client";

export default function LanguageSwitch({ lang, setLang }) {
  return (
    <div className="badge">
      <span>Language</span>
      <button className="btn" onClick={() => setLang('es')} style={{ padding: '6px 10px' }}>ES</button>
      <button className="btn" onClick={() => setLang('en')} style={{ padding: '6px 10px' }}>EN</button>
    </div>
  );
}