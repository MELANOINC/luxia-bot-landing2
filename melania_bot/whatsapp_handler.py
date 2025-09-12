"""
MELANIA BOT WhatsApp Handler
Twilio-based WhatsApp integration for automated sales conversations
"""

import os
import json
import httpx
from twilio.rest import Client
from typing import Dict, Any, Optional
import redis
from datetime import datetime

class WhatsAppHandler:
    def __init__(self):
        # Twilio credentials
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
        
        # Initialize Twilio client
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            print("Warning: Twilio credentials not configured")
        
        # Redis for conversation state
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        # High-converting message templates
        self.templates = {
            "welcome": """🤖 ¡Hola {name}! Soy MELANIA BOT de MELANO INC.

Vi tu interés en automatización IA. 

Nuestros sistemas han generado €5M+ para empresas como {company}.

¿Cuál es tu presupuesto mensual para automatización? 
💰 €2.5K - €8.5K - €25K+""",

            "budget_qualifier": """Perfecto, con €{budget} podemos implementar:

{plan_details}

¿Te muestro un demo en vivo ahora? Solo toma 10 minutos y verás exactamente cómo MELANIA BOT automatizará tu {business_type}.""",

            "demo_offer": """🔥 DEMO EXCLUSIVA disponible AHORA:

✅ Verás MELANIA BOT en acción
✅ ROI específico para tu negocio  
✅ Implementación paso a paso
✅ Pricing personalizado

¿Tienes 10 min ahora? O prefieres que te llame en 30 min?""",

            "closing": """⚡ ÚLTIMA OPORTUNIDAD esta semana:

Solo quedan 3 slots de implementación para {month}.

Tu inversión: €{amount}/mes
ROI esperado: €{roi}/mes (en 90 días)

Para reservar tu slot:
1️⃣ Confirma: "SÍ, QUIERO MI SLOT"
2️⃣ Te envío el link de pago
3️⃣ Empezamos mañana

¿Confirmamos?""",

            "payment_link": """💳 LINK DE PAGO SEGURO:

Plan: {plan_name}
Inversión: €{amount}/mes
Setup: {setup_fee}

Pagar con MercadoPago:
{mercadopago_link}

Pagar con PayPal: 
{paypal_link}

✅ Pago procesado = Implementación inmediata
❓ ¿Alguna pregunta antes de proceder?""",

            "urgency": """⏰ ATENCIÓN {name}:

Tu slot de implementación expira en 2 horas.

Después tendríamos que esperar hasta {next_month}.

¿Confirmamos tu MELANIA BOT ahora?

Responde "CONFIRMAR" para proceder."""
        }

    async def process_webhook(self, webhook_data: Dict[str, Any]):
        """Process incoming WhatsApp webhook from Twilio"""
        try:
            # Extract message data
            message_sid = webhook_data.get('MessageSid')
            from_number = webhook_data.get('From', '').replace('whatsapp:', '')
            to_number = webhook_data.get('To', '').replace('whatsapp:', '')
            message_body = webhook_data.get('Body', '')
            
            # Skip if not a user message
            if not from_number or not message_body:
                return
            
            print(f"WhatsApp message from {from_number}: {message_body}")
            
            # Get or create conversation state
            conversation = await self._get_conversation_state(from_number)
            
            # Process message and generate response
            response = await self._process_message(from_number, message_body, conversation)
            
            # Send response
            if response:
                await self.send_message(from_number, response)
            
            # Update conversation state
            await self._update_conversation_state(from_number, message_body, response)
            
        except Exception as e:
            print(f"Error processing WhatsApp webhook: {str(e)}")

    async def send_message(self, to_number: str, message: str) -> bool:
        """Send WhatsApp message via Twilio"""
        try:
            if not self.client:
                print(f"Simulated WhatsApp to {to_number}: {message}")
                return True
            
            # Format phone number
            if not to_number.startswith('whatsapp:'):
                to_number = f"whatsapp:{to_number}"
            
            # Send message
            message_obj = self.client.messages.create(
                body=message,
                from_=self.whatsapp_number,
                to=to_number
            )
            
            print(f"WhatsApp message sent: {message_obj.sid}")
            
            # Update stats
            today = datetime.now().strftime("%Y-%m-%d")
            self.redis_client.incr(f"stats:whatsapp:sent:{today}")
            
            return True
            
        except Exception as e:
            print(f"Error sending WhatsApp message: {str(e)}")
            return False

    async def send_welcome_message(self, phone: str, name: str, company: str = "tu empresa"):
        """Send welcome message to new lead"""
        try:
            message = self.templates["welcome"].format(
                name=name,
                company=company or "tu empresa"
            )
            
            await self.send_message(phone, message)
            
            # Set conversation state
            await self._set_conversation_state(phone, {
                "stage": "welcomed",
                "name": name,
                "company": company,
                "last_message": datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Error sending welcome message: {str(e)}")

    async def _get_conversation_state(self, phone: str) -> Dict[str, Any]:
        """Get conversation state from Redis"""
        try:
            state = self.redis_client.hgetall(f"whatsapp:conversation:{phone}")
            return dict(state) if state else {}
        except:
            return {}

    async def _set_conversation_state(self, phone: str, state: Dict[str, Any]):
        """Set conversation state in Redis"""
        try:
            self.redis_client.hset(f"whatsapp:conversation:{phone}", mapping=state)
            self.redis_client.expire(f"whatsapp:conversation:{phone}", 86400 * 7)  # 7 days
        except Exception as e:
            print(f"Error setting conversation state: {str(e)}")

    async def _update_conversation_state(self, phone: str, user_message: str, bot_response: str):
        """Update conversation state"""
        try:
            current_state = await self._get_conversation_state(phone)
            
            # Update state based on conversation flow
            new_stage = self._determine_next_stage(user_message, current_state.get("stage", "new"))
            
            updated_state = {
                **current_state,
                "stage": new_stage,
                "last_user_message": user_message,
                "last_bot_response": bot_response,
                "last_message": datetime.now().isoformat(),
                "message_count": str(int(current_state.get("message_count", "0")) + 1)
            }
            
            await self._set_conversation_state(phone, updated_state)
            
        except Exception as e:
            print(f"Error updating conversation state: {str(e)}")

    async def _process_message(self, phone: str, message: str, conversation: Dict) -> Optional[str]:
        """Process message and generate appropriate response"""
        try:
            message_lower = message.lower()
            stage = conversation.get("stage", "new")
            
            # Budget qualification responses
            if any(budget in message_lower for budget in ["2500", "2.5k", "starter"]):
                return self._get_plan_response("starter", conversation)
            elif any(budget in message_lower for budget in ["8500", "8.5k", "pro", "professional"]):
                return self._get_plan_response("professional", conversation)
            elif any(budget in message_lower for budget in ["25000", "25k", "enterprise"]):
                return self._get_plan_response("enterprise", conversation)
            
            # Intent-based responses
            if any(word in message_lower for word in ["demo", "ver", "mostrar"]):
                return self.templates["demo_offer"]
            elif any(word in message_lower for word in ["sí", "si", "yes", "confirmar", "quiero"]):
                if stage == "closing":
                    return await self._generate_payment_link(conversation)
                else:
                    return await self._move_to_closing(conversation)
            elif any(word in message_lower for word in ["no", "después", "later", "luego"]):
                return self._handle_objection(message_lower, conversation)
            elif any(word in message_lower for word in ["precio", "cost", "cuanto"]):
                return self._get_pricing_response(conversation)
            
            # Default: qualify budget if not done
            if stage in ["new", "welcomed"] and not conversation.get("budget_qualified"):
                return """Para mostrarte la solución perfecta, ¿cuál es tu presupuesto mensual para automatización?

💰 Opción A: €2,500/mes (Starter)
💰 Opción B: €8,500/mes (Pro) ⭐ 
💰 Opción C: €25,000/mes (Enterprise)

¿Cuál se ajusta mejor a tu empresa?"""
            
            # Fallback to AI engine
            from .ai_engine import melania_ai_instance
            ai_response = await melania_ai_instance.generate_response(
                message, 
                "whatsapp", 
                conversation
            )
            return ai_response.get("text")
            
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            return "Disculpa, tuve un problema técnico. ¿Puedes repetir tu consulta?"

    def _get_plan_response(self, plan: str, conversation: Dict) -> str:
        """Get response for specific plan"""
        plan_details = {
            "starter": """✅ MELANIA BOT Starter (€2,500/mes):
🤖 WhatsApp + Email automatizado
📈 CRM básico  
📊 Hasta 1,000 leads/mes
⚡ Setup: €1,500 (una vez)""",
            
            "professional": """⭐ MELANIA BOT Pro (€8,500/mes):
🚀 WhatsApp + Email + Webchat
🤖 IA avanzada con scoring
💳 Pagos MercadoPago + PayPal
📊 Analytics tiempo real
🎯 ROI garantizado 340%""",
            
            "enterprise": """👑 MELANIA BOT Enterprise (€25,000/mes):
💎 Personalización 100%
🏦 Integración sistemas existentes
🌐 Multiidioma ilimitado
📈 SLA 99.9% garantizado
👨‍💼 Equipo dedicado 24/7"""
        }
        
        return f"""{plan_details[plan]}

¿Te muestro cómo funcionaría específicamente para tu negocio?

Responde "DEMO" para ver en vivo ahora mismo."""

    def _determine_next_stage(self, message: str, current_stage: str) -> str:
        """Determine next conversation stage"""
        message_lower = message.lower()
        
        if any(budget in message_lower for budget in ["2500", "8500", "25000", "starter", "pro", "enterprise"]):
            return "budget_qualified"
        elif any(word in message_lower for word in ["demo", "ver", "mostrar"]) and current_stage == "budget_qualified":
            return "demo_requested"
        elif any(word in message_lower for word in ["sí", "si", "yes", "quiero"]) and current_stage == "demo_requested":
            return "closing"
        elif any(word in message_lower for word in ["confirmar", "pagar"]) and current_stage == "closing":
            return "payment"
        
        return current_stage

    async def _move_to_closing(self, conversation: Dict) -> str:
        """Move conversation to closing stage"""
        name = conversation.get("name", "")
        budget = conversation.get("budget", "8500")
        
        roi_multiplier = {"2500": 3, "8500": 4, "25000": 5}.get(budget, 4)
        roi = int(budget) * roi_multiplier
        
        return self.templates["closing"].format(
            month="diciembre 2024",
            amount=budget,
            roi=roi
        )

    async def _generate_payment_link(self, conversation: Dict) -> str:
        """Generate payment links for confirmed lead"""
        plan = conversation.get("plan", "professional")
        amount = conversation.get("budget", "8500")
        
        plan_names = {
            "starter": "MELANIA BOT Starter",
            "professional": "MELANIA BOT Pro", 
            "enterprise": "MELANIA BOT Enterprise"
        }
        
        # Generate actual payment links
        mercadopago_link = f"https://link.mercadopago.com/melanoinc?plan={plan}&amount={amount}"
        paypal_link = f"https://paypal.me/melanoinc/{amount}"
        
        return self.templates["payment_link"].format(
            plan_name=plan_names.get(plan, "MELANIA BOT Pro"),
            amount=amount,
            setup_fee="Incluido" if plan == "professional" else "€1,500",
            mercadopago_link=mercadopago_link,
            paypal_link=paypal_link
        )

    def _handle_objection(self, message: str, conversation: Dict) -> str:
        """Handle common objections"""
        if "caro" in message or "expensive" in message:
            return """Entiendo la inversión parece alta, pero mira:

Cliente SaaS con €8.5K/mes:
📈 Aumentó ventas 340% 
💰 Generó €28.9K/mes adicionales
⚡ ROI: €20.4K GANANCIA mensual

La inversión se paga sola en 30 días.

¿Te muestro casos similares a tu sector?"""
        
        elif "después" in message or "luego" in message:
            return """⏰ Te entiendo, pero ten en cuenta:

🔥 Solo implementamos 10 empresas/mes
📅 Próximo slot disponible: Febrero 2025
💸 Precio sube €1,000 en enero

¿Aseguramos tu slot ahora y empezamos en diciembre?"""
        
        else:
            return """¿Qué te preocupa específicamente?

🤔 ¿El ROI? Tengo casos de éxito
💰 ¿La inversión? Te muestro el retorno
⚡ ¿La implementación? Es más simple de lo que piensas

Cuéntame y lo resolvemos juntos."""

    def _get_pricing_response(self, conversation: Dict) -> str:
        """Get pricing response"""
        return """💰 PRECIOS MELANIA BOT 2024:

🟢 Starter: €2,500/mes + setup €1,500
⭐ Pro: €8,500/mes (setup incluido) 
👑 Enterprise: €25,000/mes (todo incluido)

🎯 ROI promedio: 340% en 90 días
📈 Payback period: 30-60 días

¿Cuál se ajusta a tu presupuesto?"""

# Singleton instance
whatsapp_handler_instance = WhatsAppHandler()