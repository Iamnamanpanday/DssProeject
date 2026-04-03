"""
Flask application factory for the Mental Health Decision Support System API.

This module initializes the Flask application, configures extensions,
registers blueprints, and sets up error handlers.

Run the application:
    python backend/app.py

Or using Flask development server:
    flask --app backend.app run --debug
"""

import logging
import os
from flask import Flask, jsonify
from flask_cors import CORS
from pathlib import Path

# Import configuration and services
from config import (
    DEBUG, FLASK_ENV, SECRET_KEY, CORS_ORIGINS,
    MODEL_DIR, FEATURE_RANGES, RECOMMENDATIONS,
    LOG_LEVEL, LOG_FORMAT, API_TITLE, API_DESCRIPTION
)
from api.routes import api_bp
from services.prediction_service import PredictionService
from services.chatbot_service import ChatbotService
from utils.preprocessing import FeaturePreprocessor

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT
)
logger = logging.getLogger(__name__)


def create_app():
    """
    Create and configure the Flask application.
    
    This factory function initializes the Flask app with all necessary
    configurations, extensions, and blueprints.
    
    Returns:
        Configured Flask application instance
    """
    # Create Flask application
    app = Flask(__name__)
    
    # Configure Flask
    app.config['DEBUG'] = DEBUG
    app.config['ENV'] = FLASK_ENV
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['JSON_SORT_KEYS'] = False
    
    logger.info(f"Creating Flask app in {FLASK_ENV} mode")
    
    # Enable CORS
    CORS(app, origins=CORS_ORIGINS)
    logger.info("CORS enabled")
    
    # Initialize services
    try:
        # Initialize feature preprocessor
        feature_preprocessor = FeaturePreprocessor(FEATURE_RANGES)
        app.feature_preprocessor = feature_preprocessor
        logger.info("Feature preprocessor initialized")
        
        # Initialize prediction service (multi-model)
        prediction_service = PredictionService(
            model_dir=str(MODEL_DIR),
            recommendations=RECOMMENDATIONS
        )
        app.prediction_service = prediction_service
        logger.info("Prediction service initialized")

        # Initialize chatbot service
        app.chatbot_service = ChatbotService()
        logger.info("Chatbot service initialized")
    except FileNotFoundError as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        logger.error("Please run 'python backend/model/train_model.py' to train the model first")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during service initialization: {str(e)}")
        raise
    
    # Register blueprints
    app.register_blueprint(api_bp)
    logger.info("API blueprints registered")
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def home():
        """Root endpoint providing API documentation."""
        return jsonify({
            'title': API_TITLE,
            'description': API_DESCRIPTION,
            'version': '1.0.0',
            'documentation': '/api/info',
            'health_check': '/api/health',
            'predict_endpoint': '/api/predict'
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        logger.warning(f"404 error: {error}")
        return jsonify({
            'status': 'error',
            'message': 'Endpoint not found',
            'code': 404
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 errors."""
        logger.warning(f"405 error: {error}")
        return jsonify({
            'status': 'error',
            'message': 'Method not allowed',
            'code': 405
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors."""
        logger.error(f"500 error: {error}")
        return jsonify({
            'status': 'error',
            'message': 'Internal server error',
            'code': 500
        }), 500
    
    logger.info("Flask application created successfully")
    return app


# Create application instance
if __name__ == '__main__':
    app = create_app()
    
    logger.info(f"Starting {API_TITLE}")
    logger.info(f"Environment: {FLASK_ENV}")
    logger.info(f"Debug mode: {DEBUG}")
    logger.info("="*50)
    logger.info("API available at: http://localhost:5000")
    logger.info("API documentation: http://localhost:5000/api/info")
    logger.info("Health check: http://localhost:5000/api/health")
    logger.info("="*50)
    
    # Run development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=DEBUG
    )
