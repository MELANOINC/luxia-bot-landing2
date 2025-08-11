# 🌐 CÓMO SUBIR LUXIA BOT™ ONLINE - GUÍA PASO A PASO

## 🚀 OPCIÓN 1: NETLIFY (RECOMENDADO - MÁS FÁCIL)

### **Paso 1: Ir a Netlify**
1. Abrir navegador → `https://netlify.com`
2. Crear cuenta gratis (con email o GitHub)
3. Click en "Add new site" → "Deploy manually"

### **Paso 2: Subir archivos**
1. **Arrastrar toda la carpeta** `LUXIA_BOT_MELANO_INC_FINAL` al área de drop
2. **O comprimir en ZIP** y arrastrar el archivo ZIP
3. Netlify automáticamente:
   - Detecta que es HTML estático
   - Genera URL temporal (ej: `https://amazing-site-123456.netlify.app`)
   - ¡Tu sitio está ONLINE en 30 segundos!

### **Paso 3: Personalizar dominio (opcional)**
1. En dashboard Netlify → "Domain settings"
2. "Add custom domain" → escribir tu dominio
3. Seguir instrucciones DNS

---

## 🚀 OPCIÓN 2: VERCEL (TAMBIÉN MUY FÁCIL)

### **Paso 1: Ir a Vercel**
1. Abrir `https://vercel.com`
2. Crear cuenta gratis
3. Click "Add New" → "Project"

### **Paso 2: Subir**
1. Arrastrar carpeta `LUXIA_BOT_MELANO_INC_FINAL`
2. Click "Deploy"
3. ¡Listo! URL generada automáticamente

---

## 🚀 OPCIÓN 3: GITHUB PAGES (GRATIS PARA SIEMPRE)

### **Paso 1: Crear repositorio GitHub**
1. Ir a `https://github.com`
2. "New repository" → nombre: `luxia-bot-landing`
3. Marcar "Public"

### **Paso 2: Subir archivos**
1. "Upload files" → arrastrar todos los archivos de la carpeta
2. Commit changes

### **Paso 3: Activar GitHub Pages**
1. Settings → Pages
2. Source: "Deploy from branch"
3. Branch: "main"
4. ¡Tu sitio estará en: `https://tu-usuario.github.io/luxia-bot-landing`

---

## 🚀 OPCIÓN 4: HOSTING TRADICIONAL (cPanel/FTP)

### **Si ya tienes hosting:**
1. Abrir cPanel o FileManager
2. Ir a carpeta `public_html` o `www`
3. Subir todos los archivos de `LUXIA_BOT_MELANO_INC_FINAL`
4. ¡Listo! Disponible en tu dominio

### **Hostings recomendados baratos:**
- **Hostinger:** $1.99/mes
- **Namecheap:** $2.88/mes  
- **SiteGround:** $3.99/mes

---

## ⚡ MÉTODO MÁS RÁPIDO (5 MINUTOS):

### **NETLIFY DRAG & DROP:**
1. `https://netlify.com` → Sign up
2. "Sites" → "Add new site" → "Deploy manually"
3. **Arrastrar carpeta completa** `LUXIA_BOT_MELANO_INC_FINAL`
4. ¡ONLINE INMEDIATAMENTE!

**URL ejemplo:** `https://luxia-bot-melano.netlify.app`

---

## 🔧 CONFIGURACIÓN POST-SUBIDA:

### **1. Editar config.js:**
```javascript
const CONFIG = {
    N8N_BASE_URL: 'https://tu-n8n-real.com',  // ⚠️ CAMBIAR
    WHATSAPP_NUMBER: '+506XXXXXXXX',          // ⚠️ TU NÚMERO
    CALENDLY_URL: 'https://calendly.com/tu-usuario' // ⚠️ TU CALENDLY
};
```

### **2. Probar formulario:**
- Llenar formulario completo
- Verificar que llegue a n8n
- Confirmar WhatsApp abre correctamente

---

## 💰 COSTOS:

| Plataforma | Costo | Dominio personalizado |
|------------|-------|----------------------|
| **Netlify** | GRATIS | $12/año |
| **Vercel** | GRATIS | $20/año |
| **GitHub Pages** | GRATIS | $12/año |
| **Hosting tradicional** | $24-48/año | Incluido |

---

## 🎯 RECOMENDACIÓN FINAL:

### **Para lanzamiento inmediato:**
1. **NETLIFY** (5 minutos, gratis, profesional)
2. Drag & drop de la carpeta completa
3. Configurar config.js con tus datos reales
4. ¡EMPEZAR A VENDER!

### **Para negocio serio:**
1. Comprar dominio personalizado (ej: `luxiabot.com`)
2. Conectar con Netlify
3. Configurar email profesional
4. Lanzar campañas de marketing

---

## 📞 SOPORTE:
Si tienes problemas, revisar:
- Console del navegador (F12)
- Logs de Netlify/Vercel
- Configuración de n8n

**¡Tu landing estará online en menos de 10 minutos!** 🚀
