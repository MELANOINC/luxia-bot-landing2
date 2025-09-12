"""
MELANIA BOT Email Handler
SendGrid-based email automation for high-ticket lead nurturing
"""

import os
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from typing import Dict, Any, List, Optional
import redis
from datetime import datetime, timedelta

class EmailHandler:
    def __init__(self):
        # SendGrid configuration
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'melania@melanoinc.com')
        self.from_name = os.getenv('FROM_NAME', 'MELANIA BOT | MELANO INC')
        
        # Initialize SendGrid client
        if self.sendgrid_api_key:
            self.sg = sendgrid.SendGridAPIClient(api_key=self.sendgrid_api_key)
        else:
            self.sg = None
            print("Warning: SendGrid API key not configured")
        
        # Redis for email state tracking
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        # High-converting email templates
        self.email_templates = {
            "welcome": {
                "subject": "🤖 Tu MELANIA BOT está lista - Demo en 5 minutos",
                "template": """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>MELANIA BOT - Demo Personalizada</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #c49b45, #f4d03f); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🤖 MELANIA BOT</h1>
        <p style="color: white; margin: 5px 0;">Automatización IA Premium | MELANO INC</p>
    </div>
    
    <div style="padding: 30px 20px;">
        <h2>¡Hola {name}! 👋</h2>
        
        <p>Gracias por tu interés en <strong>MELANIA BOT</strong>.</p>
        
        <p>He revisado la información de <strong>{company}</strong> y creo que podemos generar un ROI increíble con nuestro sistema de automatización IA.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #c49b45; margin-top: 0;">🎯 Lo que verás en tu demo personalizada:</h3>
            <ul>
                <li>✅ MELANIA BOT automatizando ventas en WhatsApp</li>
                <li>✅ Email marketing que se ejecuta solo</li>
                <li>✅ CRM inteligente con scoring de leads</li>
                <li>✅ ROI específico para {company}</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{demo_link}" style="background: #c49b45; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🚀 VER DEMO AHORA (5 MIN)
            </a>
        </div>
        
        <p><strong>¿Prefieres hablar directo conmigo?</strong></p>
        <p>📞 WhatsApp: +54 9 223 550 6585<br>
        📅 O agenda una llamada: <a href="{calendar_link}">melanoinc.com/demo</a></p>
        
        <p>¡Hablamos pronto!</p>
        
        <p><strong>MELANIA BOT</strong><br>
        Especialista en Automatización IA<br>
        MELANO INC</p>
    </div>
    
    <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>MELANO INC | Automatización IA Premium<br>
        Buenos Aires, Argentina | +500 empresas automatizadas</p>
    </div>
</body>
</html>"""
            },
            
            "follow_up_demo": {
                "subject": "¿Viste la demo de MELANIA BOT? (ROI: 340%)",
                "template": """<p>Hola {name},</p>

<p>Ayer te envié el acceso a la demo de <strong>MELANIA BOT</strong> para {company}.</p>

<p>¿Pudiste verla?</p>

<p><strong>Si no la viste aún:</strong><br>
🎯 <a href="{demo_link}">Demo Personalizada - 5 minutos</a></p>

<p><strong>Si ya la viste:</strong><br>
¿Tienes alguna pregunta? Responde este email y hablamos.</p>

<p><strong>💰 Dato interesante:</strong> Nuestros clientes con presupuesto similar al tuyo (€{estimated_budget}) han generado un ROI promedio del 340% en los primeros 90 días.</p>

<p>¿Te interesa ver cómo podríamos lograr resultados similares para {company}?</p>

<p>Saludos,<br>
<strong>MELANIA BOT</strong></p>"""
            },
            
            "pricing_proposal": {
                "subject": "🎯 Propuesta personalizada para {company} - MELANIA BOT",
                "template": """<h2>Propuesta Exclusiva para {company}</h2>

<p>Hola {name},</p>

<p>Basándome en nuestra conversación, he preparado una propuesta específica para automatizar {company}:</p>

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3 style="color: #c49b45;">📋 PLAN RECOMENDADO: {recommended_plan}</h3>
    
    <p><strong>Inversión:</strong> €{monthly_cost}/mes</p>
    <p><strong>Setup:</strong> {setup_cost}</p>
    <p><strong>ROI Estimado:</strong> €{estimated_roi}/mes</p>
    
    <h4>✅ Incluye:</h4>
    {plan_features}
</div>

<p><strong>🔥 OFERTA ESPECIAL:</strong> Si confirmas antes del {deadline}, incluyo:</p>
<ul>
    <li>✅ Setup gratuito (valor €1,500)</li>
    <li>✅ Primer mes 50% descuento</li>
    <li>✅ Soporte prioritario 90 días</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
    <a href="{payment_link}" style="background: #c49b45; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        💳 CONFIRMAR IMPLEMENTACIÓN
    </a>
</div>

<p>¿Tienes alguna pregunta? Responde este email o llámame: +54 9 223 550 6585</p>

<p>Saludos,<br>
<strong>MELANIA BOT</strong></p>"""
            },
            
            "urgency_last_chance": {
                "subject": "⏰ ÚLTIMO DÍA: Tu slot de MELANIA BOT expira hoy",
                "template": """<h2 style="color: #d63031;">⚰️ SLOT EXPIRA HOY A LAS 23:59</h2>

<p>Hola {name},</p>

<p><strong>Este es mi último email sobre tu implementación de MELANIA BOT.</strong></p>

<p>Tu slot reservado para {company} expira hoy a las 23:59 hs.</p>

<p><strong>🔥 Lo que pierdes si no confirmas hoy:</strong></p>
<ul>
    <li>❌ Setup gratuito (€1,500)</li>
    <li>❌ Primer mes 50% OFF</li>
    <li>❌ Implementación inmediata</li>
    <li>❌ Precio actual (sube €1,000 en enero)</li>
</ul>

<p><strong>📈 Lo que ganas si confirmas AHORA:</strong></p>
<ul>
    <li>✅ ROI 340% promedio</li>
    <li>✅ Ventas automatizadas desde mañana</li>
    <li>✅ Recuperas inversión en 30 días</li>
</ul>

<div style="text-align: center; margin: 30px 0; padding: 20px; background: #fdcb6e; border-radius: 10px;">
    <h3 style="margin: 0;">⏰ CONFIRMAR ANTES DE 23:59</h3>
    <a href="{payment_link}" style="background: #d63031; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">
        🚨 CONFIRMAR AHORA
    </a>
</div>

<p><strong>Después de hoy:</strong> Próximo slot disponible en febrero 2025.</p>

<p>¿Confirmamos?</p>

<p><strong>MELANIA BOT</strong><br>
WhatsApp: +54 9 223 550 6585</p>"""
            }
        }

    async def send_welcome_email(self, email: str, name: str, company: str = ""):
        """Send welcome email to new lead"""
        try:
            demo_link = f"https://melanoinc.com/demo?email={email}"
            calendar_link = "https://calendly.com/melanoinc"
            
            html_content = self.email_templates["welcome"]["template"].format(
                name=name,
                company=company or "tu empresa",
                demo_link=demo_link,
                calendar_link=calendar_link
            )
            
            await self._send_email(
                to_email=email,
                subject=self.email_templates["welcome"]["subject"],
                html_content=html_content
            )
            
            # Schedule follow-up emails
            await self._schedule_follow_up_sequence(email, name, company)
            
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")

    async def send_pricing_proposal(self, email: str, name: str, company: str, plan: str, budget: int):
        """Send personalized pricing proposal"""
        try:
            plan_configs = {
                "starter": {
                    "monthly_cost": "2,500",
                    "setup_cost": "€1,500 (incluido en oferta)",
                    "estimated_roi": str(budget * 3),
                    "features": """
                    <ul>
                        <li>🤖 MELANIA BOT WhatsApp + Email</li>
                        <li>📈 CRM automatizado</li>
                        <li>📊 Hasta 1,000 leads/mes</li>
                        <li>💬 Soporte por chat</li>
                    </ul>"""
                },
                "professional": {
                    "monthly_cost": "8,500",
                    "setup_cost": "Incluido",
                    "estimated_roi": str(budget * 4),
                    "features": """
                    <ul>
                        <li>🚀 MELANIA BOT completa (WhatsApp + Email + Webchat)</li>
                        <li>🤖 IA avanzada con scoring</li>
                        <li>💳 Integración MercadoPago + PayPal</li>
                        <li>📊 Dashboard analytics tiempo real</li>
                        <li>⚡ Hasta 10,000 leads/mes</li>
                    </ul>"""
                },
                "enterprise": {
                    "monthly_cost": "25,000",
                    "setup_cost": "Incluido + equipo dedicado",
                    "estimated_roi": str(budget * 5),
                    "features": """
                    <ul>
                        <li>👑 MELANIA BOT 100% personalizada</li>
                        <li>🏦 Integración sistemas existentes</li>
                        <li>🌐 Multiidioma ilimitado</li>
                        <li>📈 SLA 99.9% garantizado</li>
                        <li>👨‍💼 Equipo dedicado 24/7</li>
                    </ul>"""
                }
            }
            
            config = plan_configs.get(plan, plan_configs["professional"])
            deadline = (datetime.now() + timedelta(days=3)).strftime("%d/%m/%Y")
            payment_link = f"https://melanoinc.com/payment?plan={plan}&email={email}"
            
            html_content = self.email_templates["pricing_proposal"]["template"].format(
                name=name,
                company=company,
                recommended_plan=plan.upper(),
                monthly_cost=config["monthly_cost"],
                setup_cost=config["setup_cost"],
                estimated_roi=config["estimated_roi"],
                plan_features=config["features"],
                deadline=deadline,
                payment_link=payment_link
            )
            
            await self._send_email(
                to_email=email,
                subject=self.email_templates["pricing_proposal"]["subject"].format(company=company),
                html_content=html_content
            )
            
        except Exception as e:
            print(f"Error sending pricing proposal: {str(e)}")

    async def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SendGrid"""
        try:
            if not self.sg:
                print(f"Simulated email to {to_email}: {subject}")
                return True
            
            from_email_obj = Email(self.from_email, self.from_name)
            to_email_obj = To(to_email)
            content = Content("text/html", html_content)
            
            mail = Mail(from_email_obj, to_email_obj, subject, content)
            
            response = self.sg.client.mail.send.post(request_body=mail.get())
            
            print(f"Email sent to {to_email}: Status {response.status_code}")
            
            # Update stats
            today = datetime.now().strftime("%Y-%m-%d")
            self.redis_client.incr(f"stats:email:sent:{today}")
            
            return response.status_code == 202
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    async def _schedule_follow_up_sequence(self, email: str, name: str, company: str):
        """Schedule automated follow-up email sequence"""
        try:
            # Store follow-up sequence in Redis
            sequence = [
                {"delay_hours": 24, "template": "follow_up_demo", "sent": False},
                {"delay_hours": 72, "template": "pricing_proposal", "sent": False},
                {"delay_hours": 168, "template": "urgency_last_chance", "sent": False}  # 7 days
            ]
            
            sequence_data = {
                "email": email,
                "name": name,
                "company": company,
                "created_at": datetime.now().isoformat(),
                "sequence": sequence
            }
            
            # Store in Redis with expiration
            self.redis_client.hset(f"email:sequence:{email}", mapping={
                "data": str(sequence_data)
            })
            self.redis_client.expire(f"email:sequence:{email}", 86400 * 30)  # 30 days
            
        except Exception as e:
            print(f"Error scheduling follow-up sequence: {str(e)}")

    async def process_webhook(self, webhook_data: Dict[str, Any]):
        """Process email webhook (opens, clicks, etc.)"""
        try:
            event_type = webhook_data.get('event')
            email = webhook_data.get('email')
            
            if event_type == 'open':
                # Track email open
                self.redis_client.incr(f"stats:email:opens:{datetime.now().strftime('%Y-%m-%d')}")
                print(f"Email opened by {email}")
                
            elif event_type == 'click':
                # Track email click
                url = webhook_data.get('url', '')
                self.redis_client.incr(f"stats:email:clicks:{datetime.now().strftime('%Y-%m-%d')}")
                print(f"Email clicked by {email}: {url}")
                
                # Trigger hot lead actions for high-intent clicks
                if 'payment' in url or 'demo' in url:
                    await self._handle_high_intent_action(email, url)
                    
        except Exception as e:
            print(f"Error processing email webhook: {str(e)}")

    async def _handle_high_intent_action(self, email: str, url: str):
        """Handle high-intent actions from email"""
        try:
            # Mark as hot lead
            self.redis_client.hset(f"lead:email:{email}", {
                "hot_lead": "true",
                "last_action": url,
                "action_timestamp": datetime.now().isoformat()
            })
            
            # Trigger immediate follow-up
            if 'payment' in url:
                # Send WhatsApp message for payment assistance
                print(f"High-intent payment action from {email} - triggering immediate follow-up")
            elif 'demo' in url:
                # Send demo confirmation
                print(f"Demo accessed by {email} - tracking engagement")
                
        except Exception as e:
            print(f"Error handling high-intent action: {str(e)}")

# Singleton instance
email_handler_instance = EmailHandler()