"""
MELANIA BOT Webhook Handler
Central webhook processing for all external integrations
"""

from typing import Dict, Any, Optional
import json
import redis
from datetime import datetime

class WebhookHandler:
    def __init__(self):
        # Redis for webhook event storage
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        # Webhook event processors
        self.processors = {
            "payment": self._process_payment_webhook,
            "whatsapp": self._process_whatsapp_webhook,
            "email": self._process_email_webhook,
            "calendar": self._process_calendar_webhook,
            "crm": self._process_crm_webhook
        }

    async def process_webhook(self, webhook_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming webhook based on type"""
        try:
            # Log webhook event
            event_id = f"webhook_{int(datetime.now().timestamp())}"
            
            webhook_event = {
                "id": event_id,
                "type": webhook_type,
                "data": data,
                "timestamp": datetime.now().isoformat(),
                "processed": False
            }
            
            # Store event
            self.redis_client.hset(f"webhook:{event_id}", mapping={
                "event": json.dumps(webhook_event)
            })
            
            # Process based on type
            processor = self.processors.get(webhook_type)
            if processor:
                result = await processor(data)
                
                # Mark as processed
                webhook_event["processed"] = True
                webhook_event["result"] = result
                self.redis_client.hset(f"webhook:{event_id}", mapping={
                    "event": json.dumps(webhook_event)
                })
                
                return {"success": True, "event_id": event_id, "result": result}
            else:
                print(f"Unknown webhook type: {webhook_type}")
                return {"success": False, "error": f"Unknown webhook type: {webhook_type}"}
                
        except Exception as e:
            print(f"Error processing webhook: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _process_payment_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process payment webhook (MercadoPago, PayPal, etc.)"""
        try:
            payment_id = data.get("payment_id") or data.get("id")
            status = data.get("status")
            amount = data.get("amount")
            customer_email = data.get("customer_email") or data.get("payer", {}).get("email")
            
            if status in ["approved", "completed", "success"]:
                # Payment successful
                print(f"Payment successful: {payment_id} - {amount} for {customer_email}")
                
                # Update lead status
                if customer_email:
                    self.redis_client.hset(f"lead:email:{customer_email}", {
                        "status": "customer",
                        "payment_status": "paid",
                        "payment_id": payment_id,
                        "payment_date": datetime.now().isoformat()
                    })
                
                # Trigger onboarding sequence
                await self._trigger_onboarding(customer_email, data.get("plan", "professional"))
                
                # Update daily revenue stats
                today = datetime.now().strftime("%Y-%m-%d")
                self.redis_client.incrbyfloat(f"stats:revenue:{today}", float(amount or 0))
                self.redis_client.incr(f"stats:conversions:{today}")
                
                return {"action": "onboarding_triggered", "customer": customer_email}
                
            elif status in ["pending", "in_process"]:
                # Payment pending
                print(f"Payment pending: {payment_id}")
                return {"action": "payment_pending", "payment_id": payment_id}
                
            else:
                # Payment failed
                print(f"Payment failed: {payment_id}")
                await self._handle_payment_failure(customer_email, payment_id)
                return {"action": "payment_failed", "payment_id": payment_id}
                
        except Exception as e:
            print(f"Error processing payment webhook: {str(e)}")
            return {"error": str(e)}

    async def _process_whatsapp_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process WhatsApp webhook from Twilio"""
        try:
            from .whatsapp_handler import whatsapp_handler_instance
            await whatsapp_handler_instance.process_webhook(data)
            return {"action": "whatsapp_message_processed"}
            
        except Exception as e:
            print(f"Error processing WhatsApp webhook: {str(e)}")
            return {"error": str(e)}

    async def _process_email_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process email webhook from SendGrid"""
        try:
            from .email_handler import email_handler_instance
            await email_handler_instance.process_webhook(data)
            return {"action": "email_event_processed"}
            
        except Exception as e:
            print(f"Error processing email webhook: {str(e)}")
            return {"error": str(e)}

    async def _process_calendar_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process calendar webhook (Calendly, etc.)"""
        try:
            event_type = data.get("event")
            
            if event_type == "invitee.created":
                # New appointment scheduled
                invitee = data.get("payload", {}).get("invitee", {})
                email = invitee.get("email")
                name = invitee.get("name")
                event_start = data.get("payload", {}).get("event", {}).get("start_time")
                
                print(f"New appointment scheduled: {name} ({email}) at {event_start}")
                
                # Update lead status
                if email:
                    self.redis_client.hset(f"lead:email:{email}", {
                        "status": "scheduled",
                        "appointment_date": event_start,
                        "last_action": "demo_scheduled"
                    })
                
                # Send confirmation message
                await self._send_demo_confirmation(email, name, event_start)
                
                return {"action": "demo_scheduled", "email": email}
                
            return {"action": "calendar_event_processed"}
            
        except Exception as e:
            print(f"Error processing calendar webhook: {str(e)}")
            return {"error": str(e)}

    async def _process_crm_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process CRM webhook (HubSpot, Salesforce, etc.)"""
        try:
            # Handle CRM updates
            event_type = data.get("event_type")
            contact_data = data.get("contact", {})
            
            if event_type == "contact.created":
                print(f"New CRM contact: {contact_data.get('email')}")
            elif event_type == "deal.updated":
                print(f"CRM deal updated: {data.get('deal', {}).get('id')}")
            
            return {"action": "crm_event_processed"}
            
        except Exception as e:
            print(f"Error processing CRM webhook: {str(e)}")
            return {"error": str(e)}

    async def _trigger_onboarding(self, customer_email: str, plan: str):
        """Trigger customer onboarding sequence"""
        try:
            # Create onboarding tasks
            onboarding_tasks = [
                {"task": "send_welcome_email", "delay_minutes": 0},
                {"task": "schedule_kickoff_call", "delay_minutes": 60},
                {"task": "create_slack_channel", "delay_minutes": 120},
                {"task": "setup_melania_bot", "delay_minutes": 1440}  # 24 hours
            ]
            
            # Store onboarding sequence
            onboarding_data = {
                "customer_email": customer_email,
                "plan": plan,
                "status": "active",
                "tasks": onboarding_tasks,
                "created_at": datetime.now().isoformat()
            }
            
            self.redis_client.hset(f"onboarding:{customer_email}", mapping={
                "data": json.dumps(onboarding_data)
            })
            
            print(f"Onboarding sequence triggered for {customer_email} ({plan})")
            
        except Exception as e:
            print(f"Error triggering onboarding: {str(e)}")

    async def _handle_payment_failure(self, customer_email: str, payment_id: str):
        """Handle payment failure"""
        try:
            if customer_email:
                # Send payment failure recovery sequence
                print(f"Payment failed for {customer_email}: {payment_id}")
                
                # Could trigger recovery email sequence here
                # await self._send_payment_recovery_email(customer_email)
                
        except Exception as e:
            print(f"Error handling payment failure: {str(e)}")

    async def _send_demo_confirmation(self, email: str, name: str, appointment_time: str):
        """Send demo confirmation message"""
        try:
            # Send WhatsApp confirmation if phone available
            lead_data = self.redis_client.hgetall(f"lead:email:{email}")
            phone = lead_data.get("phone")
            
            if phone:
                from .whatsapp_handler import whatsapp_handler_instance
                confirmation_message = f"""✅ ¡Demo confirmada {name}!

📅 Fecha: {appointment_time}
🎯 MELANIA BOT personalizada para tu negocio
⏱️ Duración: 30 minutos

Te enviaré el link 15 min antes.

¿Alguna pregunta específica que quieras que cubramos?"""
                
                await whatsapp_handler_instance.send_message(phone, confirmation_message)
            
        except Exception as e:
            print(f"Error sending demo confirmation: {str(e)}")

# Singleton instance
webhook_handler_instance = WebhookHandler()