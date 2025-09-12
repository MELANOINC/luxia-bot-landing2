"""
MELANIA BOT - AI Automation Backend
Premium multichannel automation system for high-ticket services
"""

__version__ = "1.0.0"
__author__ = "MELANO INC"
__description__ = "AI Automation Backend for Premium High-Ticket Services"

# Import main modules
from .main import app
from .ai_engine import MelaniaAI, melania_ai_instance
from .whatsapp_handler import WhatsAppHandler, whatsapp_handler_instance
from .email_handler import EmailHandler, email_handler_instance
from .lead_scorer import LeadScorer, lead_scorer_instance
from .webhook_handler import WebhookHandler, webhook_handler_instance

__all__ = [
    "app",
    "MelaniaAI",
    "melania_ai_instance",
    "WhatsAppHandler", 
    "whatsapp_handler_instance",
    "EmailHandler",
    "email_handler_instance",
    "LeadScorer",
    "lead_scorer_instance",
    "WebhookHandler",
    "webhook_handler_instance"
]