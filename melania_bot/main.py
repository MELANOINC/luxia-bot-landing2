"""
MELANIA BOT - AI Automation Backend
Main FastAPI application for multichannel automation
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import redis
import json
import asyncio
from datetime import datetime
import httpx

# Import custom modules
from .ai_engine import MelaniaAI
from .whatsapp_handler import WhatsAppHandler
from .email_handler import EmailHandler
from .webhook_handler import WebhookHandler
from .lead_scorer import LeadScorer

app = FastAPI(
    title="MELANIA BOT API",
    description="AI Automation Backend for Premium High-Ticket Services",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

# Initialize handlers
melania_ai = MelaniaAI()
whatsapp_handler = WhatsAppHandler()
email_handler = EmailHandler()
webhook_handler = WebhookHandler()
lead_scorer = LeadScorer()

# Pydantic models
class LeadData(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = ""
    service: str = "AI Automation"
    budget: Optional[int] = 0
    message: Optional[str] = ""
    source: str = "website"
    utm_campaign: Optional[str] = ""
    utm_source: Optional[str] = ""

class MessageData(BaseModel):
    channel: str  # whatsapp, email, webchat
    from_user: str
    message: str
    lead_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}

class PaymentData(BaseModel):
    lead_email: str
    plan: str
    amount: float
    currency: str = "EUR"
    payment_method: str = "mercadopago"

@app.get("/")
async def root():
    return {
        "service": "MELANIA BOT API",
        "status": "active",
        "version": "1.0.0",
        "channels": ["whatsapp", "email", "webchat"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        redis_client.ping()
        
        return {
            "status": "healthy",
            "redis": "connected",
            "ai_engine": "active",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/api/lead/capture")
async def capture_lead(lead: LeadData, background_tasks: BackgroundTasks):
    """Capture and process new lead"""
    try:
        # Generate lead ID
        lead_id = f"lead_{int(datetime.now().timestamp())}_{lead.email.split('@')[0]}"
        
        # Calculate lead score
        score = lead_scorer.calculate_score(lead.dict())
        
        # Store lead data
        lead_data = {
            **lead.dict(),
            "lead_id": lead_id,
            "score": score,
            "status": "new",
            "created_at": datetime.now().isoformat(),
            "last_contact": "",
            "conversion_probability": score / 100
        }
        
        # Store in Redis
        redis_client.hset(f"lead:{lead_id}", mapping=lead_data)
        redis_client.sadd("leads:active", lead_id)
        
        # Queue background tasks
        background_tasks.add_task(process_new_lead, lead_id, lead_data)
        
        return {
            "success": True,
            "lead_id": lead_id,
            "score": score,
            "priority": "high" if score >= 80 else "medium" if score >= 50 else "low",
            "estimated_response": "30 minutes" if score >= 80 else "2 hours"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error capturing lead: {str(e)}")

@app.post("/api/message/process")
async def process_message(message: MessageData, background_tasks: BackgroundTasks):
    """Process incoming message from any channel"""
    try:
        # Generate response using AI
        ai_response = await melania_ai.generate_response(
            message.message,
            channel=message.channel,
            context=message.context
        )
        
        # Store conversation
        conversation_data = {
            "channel": message.channel,
            "from_user": message.from_user,
            "message": message.message,
            "ai_response": ai_response,
            "timestamp": datetime.now().isoformat(),
            "lead_id": message.lead_id
        }
        
        # Store in Redis
        redis_client.lpush(f"conversation:{message.from_user}", json.dumps(conversation_data))
        
        # Queue response sending
        background_tasks.add_task(send_response, message.channel, message.from_user, ai_response)
        
        return {
            "success": True,
            "response": ai_response,
            "channel": message.channel,
            "requires_human": ai_response.get("requires_human", False)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.post("/api/payment/initiate")
async def initiate_payment(payment: PaymentData):
    """Initiate payment process"""
    try:
        # Create payment record
        payment_id = f"pay_{int(datetime.now().timestamp())}"
        
        payment_data = {
            **payment.dict(),
            "payment_id": payment_id,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        # Store payment intent
        redis_client.hset(f"payment:{payment_id}", mapping=payment_data)
        
        # Generate payment URL based on method
        if payment.payment_method == "mercadopago":
            payment_url = f"https://link.mercadopago.com/melanoinc?amount={payment.amount}&plan={payment.plan}"
        else:  # PayPal
            payment_url = f"https://paypal.me/melanoinc/{payment.amount}"
        
        return {
            "success": True,
            "payment_id": payment_id,
            "payment_url": payment_url,
            "amount": payment.amount,
            "currency": payment.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initiating payment: {str(e)}")

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request_data: dict, background_tasks: BackgroundTasks):
    """Handle WhatsApp webhook"""
    try:
        background_tasks.add_task(whatsapp_handler.process_webhook, request_data)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WhatsApp webhook error: {str(e)}")

@app.post("/webhook/email")
async def email_webhook(request_data: dict, background_tasks: BackgroundTasks):
    """Handle email webhook"""
    try:
        background_tasks.add_task(email_handler.process_webhook, request_data)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email webhook error: {str(e)}")

@app.get("/api/stats/dashboard")
async def get_dashboard_stats():
    """Get real-time dashboard statistics"""
    try:
        # Get active leads
        active_leads = redis_client.scard("leads:active")
        
        # Get today's stats
        today = datetime.now().strftime("%Y-%m-%d")
        today_leads = redis_client.get(f"stats:leads:{today}") or 0
        today_conversions = redis_client.get(f"stats:conversions:{today}") or 0
        today_revenue = redis_client.get(f"stats:revenue:{today}") or 0
        
        # Get channel stats
        whatsapp_active = redis_client.get("stats:whatsapp:active") or 0
        email_active = redis_client.get("stats:email:active") or 0
        webchat_active = redis_client.get("stats:webchat:active") or 0
        
        return {
            "leads": {
                "total_active": int(active_leads),
                "today": int(today_leads),
                "conversion_rate": round((int(today_conversions) / max(int(today_leads), 1)) * 100, 1)
            },
            "revenue": {
                "today": float(today_revenue),
                "currency": "EUR"
            },
            "channels": {
                "whatsapp": int(whatsapp_active),
                "email": int(email_active),
                "webchat": int(webchat_active)
            },
            "melania_bot": {
                "status": "active",
                "uptime": "99.9%",
                "response_time": "< 2s"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

# Background tasks
async def process_new_lead(lead_id: str, lead_data: dict):
    """Process new lead in background"""
    try:
        # Send welcome message based on channel preference
        if lead_data.get("phone"):
            await whatsapp_handler.send_welcome_message(lead_data["phone"], lead_data["name"])
        
        if lead_data.get("email"):
            await email_handler.send_welcome_email(lead_data["email"], lead_data["name"])
        
        # Update lead status
        redis_client.hset(f"lead:{lead_id}", "status", "contacted")
        redis_client.hset(f"lead:{lead_id}", "last_contact", datetime.now().isoformat())
        
        # Update daily stats
        today = datetime.now().strftime("%Y-%m-%d")
        redis_client.incr(f"stats:leads:{today}")
        
    except Exception as e:
        print(f"Error processing lead {lead_id}: {str(e)}")

async def send_response(channel: str, user_id: str, response: dict):
    """Send AI response through appropriate channel"""
    try:
        if channel == "whatsapp":
            await whatsapp_handler.send_message(user_id, response["text"])
        elif channel == "email":
            await email_handler.send_message(user_id, response["text"], response.get("subject", "Respuesta de MELANIA BOT"))
        # Add webchat handling here
        
    except Exception as e:
        print(f"Error sending response via {channel}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)