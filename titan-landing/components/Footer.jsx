export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>\u00a9 {year} MELANO INC\u2122. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#pricing">Pricing</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}