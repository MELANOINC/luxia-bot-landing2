#!/usr/bin/env python3
"""
MELANIA BOT Integration Example for Event Clocking System
=========================================================

This script demonstrates how to integrate MELANIA BOT with the event clocking system
for real-time tracking of leads, conversions, and bot interactions.

Requirements:
- Python 3.7+
- requests library: pip install requests
- twilio library (for WhatsApp): pip install twilio
- openai library (for AI responses): pip install openai

Usage:
1. Set environment variables (see .env.example)
2. Run: python examples/melania_bot_integration.py
"""

import os
import json
import time
import requests
from datetime import datetime
from typing import Dict, Any, Optional

class MelaniaBotEventTracker:
    """Event tracking integration for MELANIA BOT"""
    
    def __init__(self, clocking_api_url: str, api_key: Optional[str] = None):
        self.clocking_api_url = clocking_api_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            'Content-Type': 'application/json'
        }
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
    
    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make API request to clocking system"""
        try:
            url = f"{self.clocking_api_url}{endpoint}"
            response = requests.post(url, json=data, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error tracking event: {e}")
            return {"success": False, "error": str(e)}
    
    def track_lead_captured(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track when a lead is captured by the bot"""
        event_data = {
            "event_type": "lead_captured",
            "customer_email": lead_data.get("email"),
            "customer_name": lead_data.get("name"),
            "customer_phone": lead_data.get("phone"),
            "source_name": "MELANIA_BOT",
            "source_type": "melania_bot",
            "event_data": {
                "capture_method": lead_data.get("capture_method", "bot_conversation"),
                "bot_stage": lead_data.get("bot_stage", "initial_contact"),
                "user_intent": lead_data.get("user_intent"),
                "conversation_id": lead_data.get("conversation_id")
            },
            "session_id": lead_data.get("session_id"),
            "utm_source": lead_data.get("utm_source"),
            "utm_medium": lead_data.get("utm_medium"),
            "utm_campaign": lead_data.get("utm_campaign")
        }
        return self._make_request("/api/clocking", event_data)
    
    def track_bot_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track bot interactions for analytics"""
        event_data = {
            "event_type": "bot_interaction",
            "customer_email": interaction_data.get("email"),
            "customer_name": interaction_data.get("name"),
            "customer_phone": interaction_data.get("phone"),
            "source_name": "MELANIA_BOT",
            "source_type": "melania_bot",
            "event_data": {
                "interaction_type": interaction_data.get("interaction_type"),
                "message_content": interaction_data.get("message_content"),
                "bot_response": interaction_data.get("bot_response"),
                "conversation_stage": interaction_data.get("conversation_stage"),
                "platform": interaction_data.get("platform", "whatsapp"),
                "intent_detected": interaction_data.get("intent_detected"),
                "confidence_score": interaction_data.get("confidence_score")
            },
            "session_id": interaction_data.get("session_id")
        }
        return self._make_request("/api/clocking", event_data)
    
    def track_whatsapp_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track WhatsApp messages specifically"""
        event_data = {
            "event_type": "whatsapp_message",
            "customer_email": message_data.get("email"),
            "customer_name": message_data.get("name"),
            "customer_phone": message_data.get("phone"),
            "source_name": "WHATSAPP_BOT",
            "source_type": "whatsapp_bot",
            "event_data": {
                "message_type": message_data.get("message_type"),
                "message_content": message_data.get("content"),
                "message_id": message_data.get("message_id"),
                "conversation_stage": message_data.get("conversation_stage"),
                "is_automated": message_data.get("is_automated", True)
            },
            "session_id": message_data.get("session_id")
        }
        return self._make_request("/api/clocking", event_data)
    
    def track_lead_qualified(self, qualification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track when a lead gets qualified"""
        event_data = {
            "event_type": "lead_qualified",
            "customer_email": qualification_data.get("email"),
            "customer_name": qualification_data.get("name"),
            "customer_phone": qualification_data.get("phone"),
            "source_name": "MELANIA_BOT",
            "event_data": {
                "qualification_score": qualification_data.get("score"),
                "qualification_criteria": qualification_data.get("criteria"),
                "qualified_by": "melania_bot_ai",
                "budget_range": qualification_data.get("budget_range"),
                "timeline": qualification_data.get("timeline"),
                "pain_points": qualification_data.get("pain_points")
            }
        }
        return self._make_request("/api/clocking", event_data)
    
    def track_demo_scheduled(self, demo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track when a demo is scheduled through the bot"""
        event_data = {
            "event_type": "demo_scheduled",
            "customer_email": demo_data.get("email"),
            "customer_name": demo_data.get("name"),
            "customer_phone": demo_data.get("phone"),
            "source_name": "MELANIA_BOT",
            "event_data": {
                "demo_date": demo_data.get("demo_date"),
                "demo_type": demo_data.get("demo_type", "live"),
                "scheduled_by": "melania_bot",
                "demo_url": demo_data.get("demo_url"),
                "calendar_link": demo_data.get("calendar_link"),
                "requested_topics": demo_data.get("requested_topics")
            }
        }
        return self._make_request("/api/clocking", event_data)


class MelaniaBotSimulator:
    """Simulates MELANIA BOT interactions for testing"""
    
    def __init__(self, event_tracker: MelaniaBotEventTracker):
        self.tracker = event_tracker
        self.conversation_sessions = {}
    
    def simulate_lead_conversation(self, phone_number: str):
        """Simulate a complete lead conversation flow"""
        session_id = f"sim_{int(time.time())}"
        
        # Step 1: Initial contact
        print(f"📱 Simulating WhatsApp conversation for {phone_number}")
        
        interaction_1 = {
            "phone": phone_number,
            "session_id": session_id,
            "interaction_type": "message",
            "message_content": "Hola! Me interesa saber más sobre sus servicios de IA",
            "bot_response": "¡Hola! Soy MELANIA, tu asistente de IA. ¿Cuál es tu nombre?",
            "conversation_stage": "greeting",
            "platform": "whatsapp",
            "intent_detected": "service_inquiry",
            "confidence_score": 0.95
        }
        result = self.tracker.track_bot_interaction(interaction_1)
        print(f"✅ Interaction tracked: {result.get('success', False)}")
        time.sleep(1)
        
        # Step 2: Capture lead info
        interaction_2 = {
            "phone": phone_number,
            "email": f"test_{int(time.time())}@example.com",
            "name": "Juan Pérez",
            "session_id": session_id,
            "interaction_type": "message",
            "message_content": "Mi nombre es Juan Pérez, mi email es juan@example.com",
            "bot_response": "Perfecto Juan! ¿En qué tipo de negocio trabajas?",
            "conversation_stage": "lead_capture",
            "platform": "whatsapp",
            "intent_detected": "personal_info",
            "confidence_score": 0.98
        }
        result = self.tracker.track_bot_interaction(interaction_2)
        print(f"✅ Interaction tracked: {result.get('success', False)}")
        
        # Track lead captured
        lead_data = {
            "email": f"test_{int(time.time())}@example.com",
            "name": "Juan Pérez",
            "phone": phone_number,
            "capture_method": "bot_conversation",
            "bot_stage": "lead_capture",
            "user_intent": "service_inquiry",
            "conversation_id": session_id,
            "session_id": session_id
        }
        result = self.tracker.track_lead_captured(lead_data)
        print(f"✅ Lead captured: {result.get('success', False)}")
        time.sleep(1)
        
        # Step 3: Qualification
        interaction_3 = {
            "phone": phone_number,
            "email": f"test_{int(time.time())}@example.com",
            "name": "Juan Pérez",
            "session_id": session_id,
            "interaction_type": "message",
            "message_content": "Tengo una empresa de marketing digital con 50 empleados",
            "bot_response": "¡Excelente! ¿Cuál es tu presupuesto para automatización?",
            "conversation_stage": "qualification",
            "platform": "whatsapp",
            "intent_detected": "business_info",
            "confidence_score": 0.92
        }
        result = self.tracker.track_bot_interaction(interaction_3)
        print(f"✅ Interaction tracked: {result.get('success', False)}")
        
        # Track qualification
        qualification_data = {
            "email": f"test_{int(time.time())}@example.com",
            "name": "Juan Pérez",
            "phone": phone_number,
            "score": 85,
            "criteria": ["has_budget", "decision_maker", "urgent_need"],
            "budget_range": "€5000-€15000",
            "timeline": "immediate",
            "pain_points": ["manual_processes", "low_efficiency"]
        }
        result = self.tracker.track_lead_qualified(qualification_data)
        print(f"✅ Lead qualified: {result.get('success', False)}")
        time.sleep(1)
        
        # Step 4: Demo scheduling
        demo_data = {
            "email": f"test_{int(time.time())}@example.com",
            "name": "Juan Pérez",
            "phone": phone_number,
            "demo_date": "2024-01-15 15:00:00",
            "demo_type": "live",
            "demo_url": "https://zoom.us/demo123",
            "calendar_link": "https://calendly.com/demo",
            "requested_topics": ["automation", "roi_analysis"]
        }
        result = self.tracker.track_demo_scheduled(demo_data)
        print(f"✅ Demo scheduled: {result.get('success', False)}")
        
        print(f"🎉 Simulation completed for {phone_number}")


def main():
    """Main function to run the integration example"""
    
    # Configuration
    CLOCKING_API_URL = os.getenv('CLOCKING_API_URL', 'http://localhost:3000')
    API_KEY = os.getenv('CLOCKING_API_KEY')  # Optional
    
    print("🤖 MELANIA BOT Event Clocking Integration Example")
    print("=" * 50)
    
    # Initialize tracker
    tracker = MelaniaBotEventTracker(CLOCKING_API_URL, API_KEY)
    
    # Test basic event tracking
    test_data = {
        "email": "test@example.com",
        "name": "Test User",
        "phone": "+1234567890",
        "capture_method": "api_test",
        "bot_stage": "testing",
        "user_intent": "testing"
    }
    
    print("📊 Testing basic event tracking...")
    result = tracker.track_lead_captured(test_data)
    print(f"Result: {result}")
    
    # Run simulation
    print("\n🎭 Running bot conversation simulation...")
    simulator = MelaniaBotSimulator(tracker)
    simulator.simulate_lead_conversation("+54911234567")
    
    print("\n✅ Integration example completed!")
    print("Check your dashboard at the clocking API URL to see the tracked events.")


if __name__ == "__main__":
    main()