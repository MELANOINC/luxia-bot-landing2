"""
MELANIA BOT Lead Scorer
Intelligent lead scoring system for high-ticket automation services
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import re

class LeadScorer:
    def __init__(self):
        # Scoring weights for different criteria
        self.scoring_weights = {
            "budget": 0.35,      # Most important for high-ticket
            "company_size": 0.20,
            "industry": 0.15,
            "urgency": 0.10,
            "source": 0.10,
            "engagement": 0.10
        }
        
        # Budget scoring (primary indicator for high-ticket)
        self.budget_scores = {
            (0, 1000): 10,           # Very low budget
            (1000, 2500): 25,        # Below starter tier
            (2500, 5000): 50,        # Starter tier range
            (5000, 8500): 65,        # Between starter and pro
            (8500, 15000): 80,       # Pro tier range
            (15000, 25000): 90,      # Between pro and enterprise
            (25000, 50000): 95,      # Enterprise tier
            (50000, float('inf')): 100  # Premium enterprise
        }
        
        # Industry scoring (likelihood to need automation)
        self.industry_scores = {
            "saas": 95,
            "software": 95,
            "technology": 90,
            "e-commerce": 85,
            "ecommerce": 85,
            "marketing": 80,
            "agency": 80,
            "consulting": 75,
            "fintech": 90,
            "healthcare": 70,
            "education": 65,
            "real estate": 60,
            "retail": 55,
            "manufacturing": 45,
            "other": 40
        }
        
        # Company size indicators
        self.company_size_indicators = {
            "startup": 70,
            "small": 60,
            "medium": 80,
            "large": 90,
            "enterprise": 95,
            "corporation": 95
        }
        
        # Source quality scoring
        self.source_scores = {
            "direct": 90,           # Direct website visit
            "organic": 85,          # SEO
            "referral": 80,         # Referral traffic
            "linkedin": 75,         # LinkedIn ads
            "google_ads": 70,       # Google Ads
            "facebook": 60,         # Facebook ads
            "instagram": 55,        # Instagram
            "other": 40
        }
        
        # Urgency keywords
        self.urgency_keywords = {
            "high": ["urgent", "asap", "immediately", "now", "today", "urgente", "inmediato", "ahora"],
            "medium": ["soon", "quick", "fast", "pronto", "rápido"],
            "low": ["eventually", "maybe", "thinking", "considering", "tal vez", "pensando"]
        }

    def calculate_score(self, lead_data: Dict[str, Any]) -> int:
        """Calculate comprehensive lead score (0-100)"""
        try:
            total_score = 0
            
            # Budget score (most important)
            budget_score = self._score_budget(lead_data.get("budget", 0))
            total_score += budget_score * self.scoring_weights["budget"]
            
            # Company size score
            company_score = self._score_company_size(
                lead_data.get("company", ""),
                lead_data.get("message", "")
            )
            total_score += company_score * self.scoring_weights["company_size"]
            
            # Industry score
            industry_score = self._score_industry(
                lead_data.get("company", ""),
                lead_data.get("service", ""),
                lead_data.get("message", "")
            )
            total_score += industry_score * self.scoring_weights["industry"]
            
            # Urgency score
            urgency_score = self._score_urgency(lead_data.get("message", ""))
            total_score += urgency_score * self.scoring_weights["urgency"]
            
            # Source score
            source_score = self._score_source(
                lead_data.get("source", ""),
                lead_data.get("utm_source", ""),
                lead_data.get("utm_campaign", "")
            )
            total_score += source_score * self.scoring_weights["source"]
            
            # Engagement score
            engagement_score = self._score_engagement(lead_data)
            total_score += engagement_score * self.scoring_weights["engagement"]
            
            # Apply bonus multipliers
            total_score = self._apply_bonus_multipliers(total_score, lead_data)
            
            # Ensure score is between 0-100
            final_score = max(0, min(100, int(total_score)))
            
            return final_score
            
        except Exception as e:
            print(f"Error calculating lead score: {str(e)}")
            return 50  # Default medium score

    def _score_budget(self, budget: int) -> int:
        """Score based on budget range"""
        try:
            budget = int(budget) if budget else 0
            
            for (min_budget, max_budget), score in self.budget_scores.items():
                if min_budget <= budget < max_budget:
                    return score
            
            return 25  # Default if no match
            
        except:
            return 25

    def _score_company_size(self, company: str, message: str) -> int:
        """Score based on company size indicators"""
        try:
            text = f"{company} {message}".lower()
            
            # Look for explicit size indicators
            for size, score in self.company_size_indicators.items():
                if size in text:
                    return score
            
            # Infer size from other indicators
            if any(word in text for word in ["team of", "employees", "staff"]):
                # Extract number if present
                numbers = re.findall(r'\d+', text)
                if numbers:
                    team_size = int(numbers[0])
                    if team_size >= 100:
                        return 90  # Large company
                    elif team_size >= 20:
                        return 75  # Medium company
                    else:
                        return 60  # Small company
            
            # Enterprise indicators
            if any(word in text for word in ["fortune", "multinational", "global", "enterprise"]):
                return 95
            
            # SaaS/Tech indicators (typically well-funded)
            if any(word in text for word in ["saas", "app", "platform", "software", "tech"]):
                return 80
            
            return 60  # Default medium score
            
        except:
            return 60

    def _score_industry(self, company: str, service: str, message: str) -> int:
        """Score based on industry likelihood to need automation"""
        try:
            text = f"{company} {service} {message}".lower()
            
            # Direct industry matches
            for industry, score in self.industry_scores.items():
                if industry in text:
                    return score
            
            # Technology-related keywords
            tech_keywords = ["app", "platform", "digital", "online", "website", "software"]
            if any(keyword in text for keyword in tech_keywords):
                return 85
            
            # Service business indicators
            service_keywords = ["service", "consulting", "agency", "firm"]
            if any(keyword in text for keyword in service_keywords):
                return 75
            
            # E-commerce indicators
            ecom_keywords = ["store", "shop", "sell", "product", "inventory"]
            if any(keyword in text for keyword in ecom_keywords):
                return 80
            
            return 50  # Default
            
        except:
            return 50

    def _score_urgency(self, message: str) -> int:
        """Score based on urgency indicators in message"""
        try:
            message_lower = message.lower()
            
            # High urgency
            if any(keyword in message_lower for keyword in self.urgency_keywords["high"]):
                return 90
            
            # Medium urgency
            if any(keyword in message_lower for keyword in self.urgency_keywords["medium"]):
                return 70
            
            # Low urgency
            if any(keyword in message_lower for keyword in self.urgency_keywords["low"]):
                return 30
            
            # Time-based urgency
            if any(time in message_lower for time in ["this week", "this month", "esta semana", "este mes"]):
                return 80
            
            return 50  # Default
            
        except:
            return 50

    def _score_source(self, source: str, utm_source: str, utm_campaign: str) -> int:
        """Score based on traffic source quality"""
        try:
            # Combine all source information
            source_text = f"{source} {utm_source} {utm_campaign}".lower()
            
            # Direct matches
            for source_type, score in self.source_scores.items():
                if source_type in source_text:
                    return score
            
            # Paid search indicators (high intent)
            if any(term in source_text for term in ["google", "search", "cpc", "adwords"]):
                return 75
            
            # Social media paid
            if any(term in source_text for term in ["facebook", "instagram", "linkedin", "twitter"]):
                return 65
            
            return 50  # Default
            
        except:
            return 50

    def _score_engagement(self, lead_data: Dict[str, Any]) -> int:
        """Score based on engagement indicators"""
        try:
            score = 50  # Base score
            
            # Complete information provided
            required_fields = ["name", "email", "phone", "company"]
            completed_fields = sum(1 for field in required_fields if lead_data.get(field))
            completion_bonus = (completed_fields / len(required_fields)) * 30
            score += completion_bonus
            
            # Message length (longer = more engaged)
            message = lead_data.get("message", "")
            if len(message) > 100:
                score += 20
            elif len(message) > 50:
                score += 10
            
            # Specific service mentioned
            if lead_data.get("service") and lead_data["service"] != "general":
                score += 15
            
            return min(100, int(score))
            
        except:
            return 50

    def _apply_bonus_multipliers(self, base_score: float, lead_data: Dict[str, Any]) -> float:
        """Apply bonus multipliers for special conditions"""
        try:
            multiplier = 1.0
            
            # High-budget bonus
            budget = int(lead_data.get("budget", 0))
            if budget >= 25000:
                multiplier *= 1.1  # 10% bonus for enterprise budget
            
            # Premium industry bonus
            company = lead_data.get("company", "").lower()
            if any(term in company for term in ["saas", "fintech", "ai", "tech"]):
                multiplier *= 1.05  # 5% bonus for premium industries
            
            # Referral bonus
            source = lead_data.get("source", "").lower()
            if "referral" in source:
                multiplier *= 1.1  # 10% bonus for referrals
            
            # Complete profile bonus
            if all(lead_data.get(field) for field in ["name", "email", "phone", "company", "budget"]):
                multiplier *= 1.05  # 5% bonus for complete profiles
            
            return base_score * multiplier
            
        except:
            return base_score

    def get_lead_priority(self, score: int) -> str:
        """Get lead priority based on score"""
        if score >= 80:
            return "HOT"
        elif score >= 60:
            return "WARM"
        elif score >= 40:
            return "MEDIUM"
        else:
            return "COLD"

    def get_recommended_action(self, score: int, lead_data: Dict[str, Any]) -> Dict[str, str]:
        """Get recommended action based on lead score"""
        priority = self.get_lead_priority(score)
        
        actions = {
            "HOT": {
                "action": "immediate_call",
                "message": "Llamar en 15 minutos - Lead premium",
                "channel": "phone",
                "urgency": "immediate"
            },
            "WARM": {
                "action": "whatsapp_followup",
                "message": "Enviar WhatsApp personalizado en 30 min",
                "channel": "whatsapp",
                "urgency": "high"
            },
            "MEDIUM": {
                "action": "email_nurture",
                "message": "Secuencia de emails automatizada",
                "channel": "email",
                "urgency": "medium"
            },
            "COLD": {
                "action": "long_term_nurture",
                "message": "Nurturing de largo plazo",
                "channel": "email",
                "urgency": "low"
            }
        }
        
        return actions.get(priority, actions["MEDIUM"])

    def analyze_lead_potential(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive lead analysis"""
        score = self.calculate_score(lead_data)
        priority = self.get_lead_priority(score)
        recommended_action = self.get_recommended_action(score, lead_data)
        
        # Estimate conversion probability
        conversion_probability = min(95, score * 0.85)  # Max 95% probability
        
        # Estimate lifetime value based on budget
        budget = int(lead_data.get("budget", 0))
        if budget >= 25000:
            estimated_ltv = budget * 12 * 2  # 2 years enterprise
        elif budget >= 8500:
            estimated_ltv = budget * 12 * 1.5  # 1.5 years professional
        else:
            estimated_ltv = budget * 12  # 1 year starter
        
        return {
            "score": score,
            "priority": priority,
            "conversion_probability": round(conversion_probability, 1),
            "estimated_ltv": estimated_ltv,
            "recommended_action": recommended_action,
            "time_to_contact": "15 minutes" if score >= 80 else "30 minutes" if score >= 60 else "2 hours",
            "expected_close_time": "24-48 hours" if score >= 80 else "3-7 days" if score >= 60 else "2-4 weeks"
        }

# Singleton instance
lead_scorer_instance = LeadScorer()