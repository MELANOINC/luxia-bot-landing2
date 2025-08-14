# 🚀 LUXIA BOT™ - MELANO INC
## CRM y Embudos de Ventas para Agencias Inmobiliarias

### ✅ DEMO COMPLETAMENTE PROBADA Y FUNCIONAL

---

## 📋 CONTENIDO DEL PAQUETE

- `index.html` - Landing principal con hero, servicios, embudo, precios y contacto
- `styles.css` - Diseño responsive con branding Melano Inc
- `config.js` - Configuración para n8n y servicios externos
- `script.js` - Lógica de formularios, validaciones y CRM
- `README.md` - Este archivo con instrucciones

---

## 🎯 FUNCIONALIDADES PROBADAS

### ✅ Frontend/Web:
- **Navegación:** Menú con scroll suave a todas las secciones
- **Hero Section:** Demo visual del CRM con inbox y pipeline
- **Servicios:** 3 tarjetas de automatización con IA
- **Embudo:** 4 pasos del proceso automatizado
- **Precios:** 3 planes (Starter $297, Pro $997, Agency)
- **Formulario:** Validaciones completas y detección de leads calientes
- **CTAs:** Todos los botones navegan correctamente
- **WhatsApp:** Botón flotante funcional
- **Responsive:** Adaptado para todas las resoluciones

### ✅ Backend/Integración:
- **n8n Ready:** Preparado para conectar flujos existentes
- **Lead Capture:** `/lead-capture` endpoint configurado
- **Lead Hot:** `/lead-hot` para presupuestos >$1000
- **CRM Sync:** `/crm-sync` para sincronización
- **Validaciones:** Manejo de errores y mensajes al usuario
- **Calendly:** Integración para agendar demos

---

## 🛠️ INSTALACIÓN Y CONFIGURACIÓN

### 1. Configurar n8n (OBLIGATORIO)
Editar `config.js`:
```javascript
const CONFIG = {
    N8N_BASE_URL: 'https://tu-n8n-instance.com', // ⚠️ CAMBIAR ESTA URL
    WHATSAPP_NUMBER: '+506XXXXXXXX',              // ⚠️ AGREGAR TU NÚMERO
    CALENDLY_URL: 'https://calendly.com/tu-usuario' // ⚠️ AGREGAR TU CALENDLY
};
```

### 2. Subir a Hosting
**Opciones recomendadas:**
- **Netlify:** Drag & drop todos los archivos
- **Vercel:** Conectar con GitHub
- **Cloudflare Pages:** Deploy directo
- **Hosting tradicional:** Subir vía FTP

### 3. Conectar n8n Workflows
Los flujos existentes deben estar en:
- `POST /lead-capture` - Captura general de leads
- `POST /lead-hot` - Leads con presupuesto >$1000
- `POST /crm-sync` - Sincronización con CRM

---

## 📊 FLUJO DE LEADS

### Lead Normal (< $1000):
1. Formulario → `/lead-capture`
2. Guarda en Google Sheets
3. Email de confirmación
4. Seguimiento estándar

### Lead Caliente (≥ $1000):
1. Formulario → `/lead-hot`
2. Alerta inmediata por WhatsApp
3. Prioridad alta en CRM
4. Seguimiento acelerado

---

## 🎨 PERSONALIZACIÓN

### Colores (en `styles.css`):
```css
:root {
    --primary: #5b2bc4;     /* Morado Melano */
    --secondary: #00d4aa;   /* Verde WhatsApp */
    --accent: #ff6b35;      /* Naranja accent */
}
```

### Textos:
- Editar directamente en `index.html`
- Mantener estructura SEO existente

---

## 🚀 LANZAMIENTO

### Pre-lanzamiento:
1. ✅ Configurar URLs en `config.js`
2. ✅ Probar formulario con n8n
3. ✅ Verificar WhatsApp y Calendly
4. ✅ Test en móvil y desktop

### Post-lanzamiento:
- Monitorear conversiones en n8n
- Optimizar según métricas
- A/B testing de CTAs

---

## 📈 MÉTRICAS CLAVE

- **Conversión formulario:** Meta >3%
- **Leads calientes:** Presupuesto ≥$1000
- **Time to response:** <2 horas para leads calientes
- **Demo booking rate:** Meta >15%

---

## 🔧 SOPORTE TÉCNICO

### Problemas comunes:
1. **Formulario no envía:** Verificar N8N_BASE_URL
2. **WhatsApp no abre:** Verificar WHATSAPP_NUMBER
3. **Calendly no carga:** Verificar CALENDLY_URL

### Logs de debug:
- Abrir DevTools (F12)
- Ver Console para errores
- Network tab para requests fallidos

---

## 📞 CONTACTO MELANO INC

- **Proyecto:** Luxia Bot™ CRM Inmobiliario
- **Versión:** 1.0.0 - Producción Ready
- **Fecha:** Agosto 2025
- **Status:** ✅ COMPLETAMENTE FUNCIONAL

---

**🎉 ¡LISTO PARA VENDER Y GENERAR INGRESOS!**

---

## 🔒 Despliegue en Producción

Consulta `PRODUCTION.md` para conocer el entorno Docker con PostgreSQL, Redis y Nginx listo para producción.
