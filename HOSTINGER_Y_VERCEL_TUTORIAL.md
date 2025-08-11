# 🚀 CÓMO SUBIR A HOSTINGER Y VERCEL - TUTORIAL COMPLETO

## 🌟 VERCEL (RECOMENDADO - MÁS FÁCIL Y GRATIS)

### **PASO A PASO VERCEL:**

#### **1. Crear cuenta Vercel**
- Ir a: `https://vercel.com`
- Click "Sign Up"
- Elegir "Continue with GitHub" (recomendado) o email

#### **2. Subir proyecto**
- En dashboard, click "Add New..." → "Project"
- Seleccionar "Browse All Templates" → "Other"
- **MÉTODO 1 - Drag & Drop:**
  - Arrastrar carpeta `LUXIA_BOT_MELANO_INC_FINAL` completa
  - Click "Deploy"
  - ¡LISTO! URL generada automáticamente

#### **3. Configurar dominio personalizado (opcional)**
- En proyecto → "Settings" → "Domains"
- Agregar tu dominio personalizado

### **✅ VENTAJAS VERCEL:**
- ✅ **100% GRATIS** para sitios estáticos
- ✅ **Deploy en 30 segundos**
- ✅ **SSL automático** (HTTPS)
- ✅ **CDN global** (carga rápida mundial)
- ✅ **Dominio gratis** (.vercel.app)

---

## 🏢 HOSTINGER (HOSTING TRADICIONAL)

### **PASO A PASO HOSTINGER:**

#### **1. Comprar hosting**
- Ir a: `https://hostinger.com`
- Elegir plan "Premium" ($2.99/mes)
- Incluye dominio gratis por 1 año
- Completar compra

#### **2. Acceder a cPanel**
- Ir a hPanel (panel de Hostinger)
- Buscar "File Manager" o "Administrador de archivos"
- Click para abrir

#### **3. Subir archivos**
- En File Manager, ir a carpeta `public_html`
- **MÉTODO 1 - Upload directo:**
  - Click "Upload" 
  - Seleccionar todos los archivos de `LUXIA_BOT_MELANO_INC_FINAL`
  - Subir uno por uno: index.html, styles.css, script.js, config.js

- **MÉTODO 2 - ZIP:**
  - Comprimir carpeta `LUXIA_BOT_MELANO_INC_FINAL` en ZIP
  - Upload el ZIP a `public_html`
  - Click derecho → "Extract" para descomprimir
  - Mover archivos de la subcarpeta a `public_html` directamente

#### **4. Verificar estructura**
Tu `public_html` debe tener:
```
public_html/
├── index.html
├── styles.css
├── script.js
├── config.js
├── README.md
└── otros archivos...
```

#### **5. Probar sitio**
- Tu sitio estará en: `https://tudominio.com`
- O en subdominio temporal de Hostinger

### **✅ VENTAJAS HOSTINGER:**
- ✅ **Dominio incluido** (.com, .net, etc.)
- ✅ **Email profesional** incluido
- ✅ **Soporte 24/7** en español
- ✅ **cPanel familiar** para muchos usuarios

---

## 🎯 COMPARACIÓN RÁPIDA:

| Característica | VERCEL | HOSTINGER |
|----------------|--------|-----------|
| **Costo** | GRATIS | $2.99/mes |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Velocidad setup** | 2 minutos | 10 minutos |
| **Dominio** | .vercel.app gratis | .com incluido |
| **Email** | No | Sí incluido |
| **SSL** | Automático | Automático |

---

## 🚀 MI RECOMENDACIÓN:

### **Para LANZAMIENTO RÁPIDO:**
**USAR VERCEL** - Razones:
1. **Gratis total**
2. **Deploy en 2 minutos**
3. **No necesitas tarjeta de crédito**
4. **SSL automático**
5. **Perfecto para landing pages**

### **Para NEGOCIO SERIO:**
**USAR HOSTINGER** - Razones:
1. **Dominio profesional** (.com)
2. **Email corporativo** (contacto@tudominio.com)
3. **Más control** del hosting
4. **Soporte técnico** 24/7

---

## ⚡ TUTORIAL VERCEL SÚPER RÁPIDO:

### **3 PASOS - 2 MINUTOS:**

1. **Ir a vercel.com** → Sign up con GitHub
2. **"Add New Project"** → Arrastrar carpeta `LUXIA_BOT_MELANO_INC_FINAL`
3. **Click "Deploy"** → ¡LISTO!

**URL ejemplo:** `https://luxia-bot-melano.vercel.app`

---

## 🔧 CONFIGURACIÓN POST-SUBIDA (AMBOS):

### **Editar config.js:**
```javascript
const CONFIG = {
    N8N_BASE_URL: 'https://tu-n8n-real.com',
    WHATSAPP_NUMBER: '+506XXXXXXXX',
    CALENDLY_URL: 'https://calendly.com/tu-usuario'
};
```

### **En Vercel:**
- Dashboard → Tu proyecto → "Functions" → Editar archivos
- O re-deploy con config.js actualizado

### **En Hostinger:**
- File Manager → Editar config.js directamente
- Guardar cambios

---

## 🎯 DECISIÓN FINAL:

### **¿Quieres empezar YA y gratis?**
→ **VERCEL** (2 minutos, $0)

### **¿Quieres algo más profesional?**
→ **HOSTINGER** (10 minutos, $2.99/mes)

**Ambos funcionan perfectamente con tu landing LUXIA BOT™**

¿Con cuál quieres que te ayude paso a paso?
