# 🚀 DEPLOY LUXIA BOT™ - GUÍA PASO A PASO DEFINITIVA

## ⚡ MÉTODO 1: VERCEL (RECOMENDADO - 5 MINUTOS)

### **🔥 OPCIÓN A: DRAG & DROP (MÁS FÁCIL)**

#### **Paso 1: Preparar archivos**
1. Comprimir carpeta `LUXIA_BOT_MELANO_INC_FINAL` en ZIP
2. O tener la carpeta lista para arrastrar

#### **Paso 2: Ir a Vercel**
- Abrir: `https://vercel.com`
- Click "Sign Up" (esquina superior derecha)
- Elegir "Continue with GitHub" (más confiable)
- Autorizar con tu cuenta GitHub

#### **Paso 3: Deploy directo**
- En dashboard: "Add New..." → "Project"
- **ARRASTRAR** carpeta completa o ZIP
- Vercel detecta automáticamente que es HTML estático
- Click "Deploy"
- ¡LISTO! URL generada: `https://luxia-bot-xxx.vercel.app`

---

### **🔥 OPCIÓN B: GITHUB + VERCEL (MÁS PROFESIONAL)**

#### **Paso 1: Subir a GitHub**
1. Ir a `https://github.com`
2. "New repository" → nombre: `luxia-bot-melano`
3. Marcar "Public"
4. "Upload files" → arrastrar todos los archivos
5. Commit changes

#### **Paso 2: Conectar con Vercel**
1. En Vercel: "Import Git Repository"
2. Seleccionar tu repo `luxia-bot-melano`
3. Deploy automático
4. URL: `https://luxia-bot-melano.vercel.app`

---

## 🏢 MÉTODO 2: HOSTINGER (HOSTING TRADICIONAL)

### **Paso 1: Comprar hosting**
- Ir a: `https://hostinger.com`
- Plan "Premium" ($2.99/mes)
- Incluye dominio gratis
- Completar compra

### **Paso 2: Acceder a File Manager**
- Login en hPanel de Hostinger
- "File Manager" → "public_html"

### **Paso 3: Subir archivos**
**MÉTODO ZIP:**
1. Comprimir `LUXIA_BOT_MELANO_INC_FINAL` en ZIP
2. Upload ZIP a `public_html`
3. Click derecho → "Extract"
4. Mover archivos de subcarpeta a `public_html` directamente

**MÉTODO INDIVIDUAL:**
1. Upload cada archivo: index.html, styles.css, script.js, config.js
2. Verificar estructura en `public_html`

### **Resultado:**
- Tu sitio: `https://tudominio.com`
- Email incluido: `contacto@tudominio.com`

---

## 🎯 CONFIGURACIÓN POST-DEPLOY

### **1. Editar config.js (OBLIGATORIO)**

**En Vercel:**
- Dashboard → Tu proyecto → "Functions" → Editar archivos
- O re-deploy con config.js actualizado

**En Hostinger:**
- File Manager → Editar config.js directamente

**Configuración requerida:**
```javascript
const CONFIG = {
    N8N_BASE_URL: 'https://tu-n8n-real.com',     // ⚠️ CAMBIAR
    WHATSAPP_NUMBER: '+506XXXXXXXX',             // ⚠️ TU NÚMERO
    CALENDLY_URL: 'https://calendly.com/tu-usuario' // ⚠️ TU CALENDLY
};
```

### **2. Probar sitio completo**
- [ ] Navegación entre secciones
- [ ] Formulario con validaciones
- [ ] WhatsApp abre correctamente
- [ ] Calendly carga sin errores
- [ ] Responsive en móvil

---

## 🔧 ALTERNATIVAS RÁPIDAS

### **NETLIFY (TAMBIÉN GRATIS):**
1. `https://netlify.com` → Sign up
2. "Sites" → "Deploy manually"
3. Arrastrar carpeta completa
4. ¡Online en 30 segundos!

### **GITHUB PAGES (100% GRATIS):**
1. Subir archivos a GitHub repo
2. Settings → Pages → Deploy from branch
3. URL: `https://tu-usuario.github.io/repo-name`

---

## 📊 COMPARACIÓN FINAL

| Plataforma | Tiempo | Costo | Facilidad | Dominio |
|------------|--------|-------|-----------|---------|
| **Vercel** | 5 min | GRATIS | ⭐⭐⭐⭐⭐ | .vercel.app |
| **Netlify** | 2 min | GRATIS | ⭐⭐⭐⭐⭐ | .netlify.app |
| **GitHub Pages** | 10 min | GRATIS | ⭐⭐⭐⭐ | .github.io |
| **Hostinger** | 15 min | $2.99/mes | ⭐⭐⭐ | .com/.net |

---

## 🎯 MI RECOMENDACIÓN:

### **Para EMPEZAR YA:**
1. **VERCEL** con GitHub
2. 5 minutos total
3. URL profesional
4. SSL automático
5. Deploy automático en cada cambio

### **Para NEGOCIO SERIO:**
1. **HOSTINGER** con dominio personalizado
2. Email corporativo incluido
3. Más control del hosting
4. Soporte 24/7

---

## ✅ CHECKLIST FINAL

### **Pre-deploy:**
- [ ] Carpeta `LUXIA_BOT_MELANO_INC_FINAL` lista
- [ ] Todos los archivos incluidos
- [ ] README.md revisado

### **Post-deploy:**
- [ ] Sitio carga sin errores
- [ ] config.js configurado con datos reales
- [ ] Formulario probado
- [ ] WhatsApp y Calendly funcionando
- [ ] URL guardada y compartida

---

## 🚨 IMPORTANTE

**Después del deploy, DEBES:**
1. Configurar config.js con tus datos reales
2. Probar el formulario completo
3. Verificar integración n8n
4. Confirmar WhatsApp y Calendly

**¡Tu CRM inmobiliario estará online y generando leads!** 🎉

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisar Console del navegador (F12)
2. Verificar config.js
3. Confirmar n8n endpoints activos
4. Probar en modo incógnito

**¡LISTO PARA VENDER Y GENERAR INGRESOS!** 💰
