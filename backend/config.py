"""
Configuration module for the Mental Health Decision Support System API.

This module contains all configuration variables for the Flask application,
including environment settings, API configurations, and paths.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Project root directory
BASE_DIR = Path(__file__).parent

# Flask configuration
DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS configuration
CORS_ORIGINS = ['*']

# Model paths
MODEL_PATH = BASE_DIR / 'model' / 'depression_model.pkl'
DATA_PATH = BASE_DIR / 'data' / 'synthetic_data.csv'

# API configuration
API_VERSION = '1.0.0'
API_TITLE = 'Mental Health Decision Support System'
API_DESCRIPTION = 'AI-powered API for mental health risk prediction'

# Input validation ranges
FEATURE_RANGES = {
    'sleep_hours': {'min': 0, 'max': 12},
    'stress_level': {'min': 1, 'max': 10},
    'activity_level': {'min': 1, 'max': 10},
    'mood_score': {'min': 1, 'max': 10},
    'hydration_level': {'min': 1, 'max': 10},
    'screen_time': {'min': 0, 'max': 15},
    'focus_efficiency': {'min': 1, 'max': 10}
}


# Risk levels
RISK_LEVELS = ['mild', 'moderate', 'severe']

# Recommendations mapping
RECOMMENDATIONS = {
    'mild': 'Maintain healthy lifestyle. Continue with regular exercise and adequate sleep.',
    'moderate': 'Consider talking to a therapist and improving sleep habits. Manage stress through meditation or relaxation techniques.',
    'severe': 'Please seek immediate professional mental health support. Contact a mental health professional or crisis hotline immediately.'
}

# Logging configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
