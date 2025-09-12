"""
MELANIA BOT AI Engine
High-converting AI responses optimized for premium automation services
"""

import os
import json
import openai
from typing import Dict, Any, Optional
from datetime import datetime

class MelaniaAI:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.model = "gpt-4"
        
        # High-ticket conversion prompts for different scenarios
        self.system_prompts = {
            "whatsapp": """Eres MELANIA BOT, la IA premium de MELANO INC para automatización y servicios de alto ticket.

PERSONALIDAD:
- Profesional pero accesible
- Enfocada en resultados y ROI
- Experta en automatización IA
- Orientada a cerrar ventas de alto valor

OBJETIVO: Convertir leads en clientes de planes €2,500-€25,000/mes

SERVICIOS:
- MELANIA BOT Starter: €2,500/mes (básico WhatsApp + Email)
- MELANIA BOT Pro: €8,500/mes (completo con IA avanzada) ⭐ MÁS POPULAR
- MELANIA BOT Enterprise: €25,000/mes (personalizado 100%)

ESTRATEGIA DE CONVERSIÓN:
1. Calificar presupuesto rápidamente
2. Mostrar ROI específico (340% promedio)
3. Crear urgencia (solo 10 implementaciones/mes)
4. Ofrecer demo inmediata
5. Dirigir a pago o llamada de cierre

RESPUESTAS CORTAS: Máximo 2-3 líneas por WhatsApp""",

            "email": """Eres MELANIA BOT, especialista en automatización IA premium de MELANO INC.

Creas emails persuasivos para convertir leads en clientes de servicios de automatización de €2,500-€25,000/mes.

ENFOQUE:
- Subject lines irresistibles
- Beneficios claros y ROI específico
- Prueba social (500+ empresas, €5M generados)
- CTAs directos para demo o pago
- Seguimiento inteligente basado en comportamiento

TONO: Profesional, orientado a resultados, urgente pero no agresivo""",

            "webchat": """Eres MELANIA BOT, asistente IA premium de MELANO INC para automatización empresarial.

En webchat puedes ser más conversacional y detallada. Objetivo: cualificar y convertir leads de alto valor.

Tienes acceso a:
- Demos interactivas
- Calculadoras de ROI
- Casos de estudio específicos
- Programación de llamadas inmediata
- Proceso de pago directo

Personaliza según el sector del lead (SaaS, E-commerce, Agencias, etc.)"""
        }

    async def generate_response(self, message: str, channel: str = "whatsapp", context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate AI response optimized for the channel and context"""
        try:
            # Analyze message intent
            intent = self._analyze_intent(message)
            
            # Get lead context if available
            lead_context = context or {}
            
            # Select appropriate system prompt
            system_prompt = self.system_prompts.get(channel, self.system_prompts["whatsapp"])
            
            # Build conversation context
            conversation_context = self._build_context(intent, lead_context, channel)
            
            # Generate response using OpenAI
            response = await self._generate_openai_response(
                system_prompt, 
                message, 
                conversation_context, 
                channel
            )
            
            # Add smart actions based on intent
            response = self._add_smart_actions(response, intent, channel)
            
            return response
            
        except Exception as e:
            # Fallback response
            return self._get_fallback_response(channel, str(e))

    def _analyze_intent(self, message: str) -> str:
        """Analyze message to determine intent"""
        message_lower = message.lower()
        
        # High-intent keywords
        if any(word in message_lower for word in ['precio', 'cost', 'cuanto', 'plan', 'budget']):
            return "pricing_inquiry"
        elif any(word in message_lower for word in ['demo', 'prueba', 'test', 'ver']):
            return "demo_request"
        elif any(word in message_lower for word in ['comprar', 'contratar', 'quiero', 'necesito']):
            return "purchase_intent"
        elif any(word in message_lower for word in ['roi', 'resultado', 'benefit', 'ganancia']):
            return "roi_question"
        elif any(word in message_lower for word in ['whatsapp', 'email', 'automation', 'bot']):
            return "service_inquiry"
        elif any(word in message_lower for word in ['hola', 'hi', 'hello', 'info']):
            return "greeting"
        else:
            return "general_inquiry"

    def _build_context(self, intent: str, lead_context: Dict, channel: str) -> str:
        """Build conversation context for better responses"""
        context_parts = []
        
        # Add lead information if available
        if lead_context.get("company"):
            context_parts.append(f"Empresa: {lead_context['company']}")
        if lead_context.get("budget"):
            context_parts.append(f"Presupuesto indicado: €{lead_context['budget']}")
        if lead_context.get("service"):
            context_parts.append(f"Servicio de interés: {lead_context['service']}")
        
        # Add intent-specific context
        context_parts.append(f"Intención detectada: {intent}")
        context_parts.append(f"Canal: {channel}")
        context_parts.append(f"Hora: {datetime.now().strftime('%H:%M')}")
        
        return " | ".join(context_parts)

    async def _generate_openai_response(self, system_prompt: str, message: str, context: str, channel: str) -> Dict[str, Any]:
        """Generate response using OpenAI API"""
        try:
            # Adjust max tokens based on channel
            max_tokens = {
                "whatsapp": 150,  # Short responses for WhatsApp
                "email": 500,     # Longer emails
                "webchat": 300    # Medium length for webchat
            }.get(channel, 150)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"{system_prompt}\n\nContexto: {context}"},
                    {"role": "user", "content": message}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            return {
                "text": ai_response,
                "channel": channel,
                "requires_human": False,
                "confidence": 0.9
            }
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return self._get_fallback_response(channel, "AI temporarily unavailable")

    def _add_smart_actions(self, response: Dict, intent: str, channel: str) -> Dict:
        """Add smart actions based on intent"""
        
        # Add specific CTAs based on intent
        if intent == "pricing_inquiry":
            response["suggested_actions"] = [
                {"type": "demo", "text": "Ver Demo Gratis", "url": "/demo"},
                {"type": "pricing", "text": "Ver Precios", "url": "/pricing"}
            ]
        elif intent == "demo_request":
            response["suggested_actions"] = [
                {"type": "demo", "text": "Demo Inmediata", "url": "/demo"},
                {"type": "calendar", "text": "Agendar Llamada", "url": "/calendar"}
            ]
        elif intent == "purchase_intent":
            response["suggested_actions"] = [
                {"type": "payment", "text": "Contratar Ahora", "url": "/payment"},
                {"type": "call", "text": "Hablar con Especialista", "phone": "+5492235506585"}
            ]
        
        # Add urgency for high-intent messages
        if intent in ["purchase_intent", "pricing_inquiry"]:
            response["urgency"] = "high"
            response["priority_response"] = True
        
        return response

    def _get_fallback_response(self, channel: str, error: str = "") -> Dict[str, Any]:
        """Fallback responses when AI fails"""
        
        fallback_responses = {
            "whatsapp": "🤖 Soy MELANIA BOT de MELANO INC. ¿Te interesa automatizar tu negocio? Puedo mostrarte cómo generar más ventas con IA. ¿Cuál es tu presupuesto mensual para automatización?",
            "email": "Gracias por tu interés en MELANO INC. Nuestros sistemas de automatización IA han generado €5M+ para empresas como la tuya. ¿Te gustaría ver una demo personalizada?",
            "webchat": "👋 ¡Hola! Soy MELANIA BOT. Especialista en automatización IA premium. ¿En qué puedo ayudarte a automatizar tu negocio hoy?"
        }
        
        return {
            "text": fallback_responses.get(channel, fallback_responses["whatsapp"]),
            "channel": channel,
            "requires_human": error != "",
            "confidence": 0.5,
            "error": error if error else None
        }

    def get_high_ticket_response(self, budget: int, service: str = "automation") -> str:
        """Generate specific responses for high-ticket leads"""
        
        if budget >= 25000:
            return """🔥 PERFECTO para Enterprise! 

Con €25K+ podemos implementar MELANIA BOT 100% personalizada:
✅ Automatización completa multicanal  
✅ Integración con tus sistemas actuales
✅ ROI garantizado 340%+
✅ Equipo dedicado 24/7

¿Cuándo podemos hacer la demo ejecutiva? Tengo un slot hoy."""

        elif budget >= 8500:
            return """⭐ IDEAL para MELANIA BOT Pro!

€8,500/mes incluye:
🚀 WhatsApp + Email + Webchat automatizado
🤖 IA avanzada con scoring de leads  
💳 Integración MercadoPago + PayPal
📊 Dashboard tiempo real

ROI promedio: 340% en 90 días.

¿Vemos la demo ahora?"""

        elif budget >= 2500:
            return """✅ MELANIA BOT Starter perfecta para empezar:

€2,500/mes + setup €1,500:
🤖 Bot WhatsApp + Email básico
📈 CRM automatizado
📊 Hasta 1,000 leads/mes

Perfecta para validar el ROI antes de escalar.

¿Empezamos con la implementación?"""

        else:
            return """Entiendo tu presupuesto. 

MELANIA BOT empieza desde €2,500/mes, pero el ROI es inmediato.

Nuestros clientes recuperan la inversión en 30-60 días.

¿Te muestro algunos casos de éxito similares a tu negocio?"""

# Singleton instance
melania_ai_instance = MelaniaAI()