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

# Model directory (all model artifacts live here)
MODEL_DIR  = BASE_DIR / 'model'
DATA_DIR   = BASE_DIR / 'data'

# Individual model artifact paths
MODEL_PATH           = MODEL_DIR / 'depression_model.pkl'
REGRESSION_PATH      = MODEL_DIR / 'wellness_regression_model.pkl'
RELAPSE_PATH         = MODEL_DIR / 'relapse_model.pkl'
SCALER_PATH          = MODEL_DIR / 'scaler.pkl'
LABEL_ENCODER_PATH   = MODEL_DIR / 'label_encoder.pkl'
DATA_PATH            = DATA_DIR  / 'synthetic_data.csv'
COMPARISON_CSV_PATH  = DATA_DIR  / 'model_comparison.csv'

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
