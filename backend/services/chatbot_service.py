"""
Chatbot service for context-aware mental health support.

This service uses keyword matching and the user's current health risk context
to provide personalized wellness guidance.
"""

import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class ChatbotService:
    """
    Mental Health Assistant Service.
    Provides empathetic, context-driven responses to user queries.
    """
    
    def __init__(self):
        # Response templates categorized by topic
        self.responses = {
            "sleep": [
                "I see your sleep score is {sleep}. Aiming for 7-9 hours is ideal. Have you tried a digital detox an hour before bed?",
                "Consistent sleep patterns are huge for mood stability. Try to keep your wake-up time the same even on weekends.",
                "Since you mentioned sleep, consider keeping your room cool and dark to improve quality."
            ],
            "stress": [
                "Your stress level is at {stress}. That's significant. Let's try a 4-7-8 breathing exercise: inhale for 4, hold for 7, exhale for 8.",
                "Stress can manifest physically. Are you feeling tension in your shoulders? Progressive muscle relaxation might help.",
                "When stress is high, it helps to break your tasks into smaller, manageable chunks."
            ],
            "activity": [
                "Physical movement is a natural antidepressant. Even a 10-minute walk can shift your mood score!",
                "I noticed your activity score. Would you be open to a gentle stretch or a short yoga session today?",
                "Don't worry about intensity. Just moving your body helps release those feel-good endorphins."
            ],
            "mood": [
                "It's brave to track your mood consistently. Remember that 'moderate' or 'severe' days are a signal to be extra kind to yourself.",
                "Mood changes are normal. How does your current {mood}/10 mood compare to your baseline?",
                "When mood feels low, connection helps. Is there a friend or family member you could text today?"
            ],
            "crisis": [
                "I'm hearing that things are very difficult right now. Please consider reaching out to the Vandrevala Foundation (1860-266-2345) or iCall (9152987821) immediately.",
                "Your safety is the priority. If you're feeling overwhelmed, please contact a professional or a crisis hotline. You don't have to face this alone.",
                "I am an AI, and while I want to help, please speak with a human professional right away if you're in distress."
            ],
            "generic": [
                "I'm here to listen. How else can I support your wellbeing journey today?",
                "That's interesting. How do you feel that connects to your overall mental health metrics?",
                "NeuroSentinel is here to help you track these patterns over time. What's on your mind?"
            ]
        }

    def get_response(self, message: str, context: Dict) -> str:
        """
        Generate a response based on the message content and user context.
        """
        message = message.lower()
        risk_level = context.get('risk_level', 'mild')
        
        # Priority 1: Crisis detection
        crisis_keywords = ['hurt', 'kill', 'end it', 'suicide', 'die', 'depressed', 'can\'t go on']
        if any(kw in message for kw in crisis_keywords) or risk_level == 'severe':
            return self.responses["crisis"][0]
            
        # Priority 2: Keyword matching
        if any(kw in message for kw in ['sleep', 'tired', 'insomnia', 'awake']):
            return self.responses["sleep"][0].format(sleep=context.get('sleep', '?'))
            
        if any(kw in message for kw in ['stress', 'anxious', 'worried', 'panic', 'tension']):
            return self.responses["stress"][0].format(stress=context.get('stress', '?'))
            
        if any(kw in message for kw in ['exercise', 'active', 'walk', 'gym', 'move']):
            return self.responses["activity"][0]
            
        if any(kw in message for kw in ['mood', 'sad', 'happy', 'feeling', 'emotion']):
            return self.responses["mood"][0].format(mood=context.get('mood', '?'))
            
        # Fallback to generic
        import random
        return random.choice(self.responses["generic"])
