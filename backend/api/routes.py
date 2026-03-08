"""
API routes for the Mental Health Decision Support System.

This module defines all REST API endpoints for the application,
including prediction endpoints and health checks.
"""

import logging
from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

# Create blueprint for API routes
api_bp = Blueprint('api', __name__, url_prefix='/api')


def create_error_response(message: str, status_code: int = 400) -> Tuple[Dict, int]:
    """
    Create a standardized error response.
    
    Args:
        message: Error message
        status_code: HTTP status code
    
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify({
        'status': 'error',
        'message': message
    }), status_code


def create_success_response(data: Dict, status_code: int = 200) -> Tuple[Dict, int]:
    """
    Create a standardized success response.
    
    Args:
        data: Response data
        status_code: HTTP status code
    
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify({
        'status': 'success',
        'data': data
    }), status_code


@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify API is running.
    
    Returns:
        JSON response indicating API health status
    """
    logger.info("Health check endpoint called")
    return create_success_response({
        'message': 'API is healthy',
        'version': '1.0.0',
        'service': 'Mental Health Decision Support System'
    })


@api_bp.route('/predict', methods=['POST'])
def predict():
    """
    Predict depression risk level based on mental health indicators.
    
    Expected JSON input:
    {
        "sleep_hours": 7.5,
        "stress_level": 6,
        "activity_level": 5,
        "mood_score": 6
    }
    
    Returns:
        JSON response with prediction, confidence, and recommendation
        
    Example response:
    {
        "status": "success",
        "data": {
            "risk_level": "moderate",
            "confidence": 0.8234,
            "recommendation": "Consider talking to a therapist..."
        }
    }
    """
    try:
        # Validate request has JSON
        if not request.is_json:
            logger.warning("Request received without JSON content type")
            return create_error_response(
                "Request must be JSON",
                status_code=400
            )
        
        # Get the prediction service from app context
        prediction_service = current_app.prediction_service
        feature_preprocessor = current_app.feature_preprocessor
        
        # Get JSON data
        data = request.get_json()
        logger.info(f"Prediction request received with data: {data}")
        
        # Validate and preprocess input
        try:
            preprocessed_features = feature_preprocessor.preprocess(data)
            feature_stats = feature_preprocessor.get_feature_stats(data)
        except ValueError as e:
            logger.warning(f"Preprocessing error: {str(e)}")
            return create_error_response(str(e), status_code=400)
        
        # Make prediction
        try:
            prediction_result = prediction_service.full_prediction(
                preprocessed_features
            )
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return create_error_response(
                "Failed to make prediction",
                status_code=500
            )
        
        # Add input features to response
        prediction_result['input_features'] = {
            'sleep_hours': float(data.get('sleep_hours', 0)),
            'stress_level': float(data.get('stress_level', 0)),
            'activity_level': float(data.get('activity_level', 0)),
            'mood_score': float(data.get('mood_score', 0)),
            'hydration_level': float(data.get('hydration_level', 0)),
            'screen_time': float(data.get('screen_time', 0)),
            'focus_efficiency': float(data.get('focus_efficiency', 0))
        }

        
        logger.info(f"Prediction successful: {prediction_result}")
        return create_success_response(prediction_result)
    
    except Exception as e:
        logger.error(f"Unexpected error in predict endpoint: {str(e)}")
        return create_error_response(
            "Internal server error",
            status_code=500
        )


@api_bp.route('/chat', methods=['POST'])
def chat():
    """
    Get AI-powered assistant response using current context.
    
    Expected JSON input:
    {
        "message": "I'm having trouble sleeping.",
        "context": {
            "risk_level": "moderate",
            "sleep": 4.5,
            ...
        }
    }
    """
    try:
        if not request.is_json:
            return create_error_response("Request must be JSON", status_code=400)
            
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', {})
        
        chatbot_service = current_app.chatbot_service
        reply = chatbot_service.get_response(message, context)
        
        return create_success_response({'reply': reply})
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return create_error_response("Failed to get chat response", status_code=500)


@api_bp.route('/info', methods=['GET'])
def info():
    """
    Get information about the API and model.
    
    Returns:
        JSON response with API metadata
    """
    logger.info("Info endpoint called")
    return create_success_response({
        'title': 'Mental Health Decision Support System',
        'version': '1.0.0',
        'description': 'AI-powered API for mental health risk prediction',
        'endpoints': {
            '/api/health': 'GET - Health check',
            '/api/predict': 'POST - Make a prediction',
            '/api/info': 'GET - API information'
        },
        'input_features': {
            'sleep_hours': {
                'type': 'float',
                'range': [0, 12],
                'description': 'Hours of sleep per night'
            },
            'stress_level': {
                'type': 'integer',
                'range': [1, 10],
                'description': 'Stress level on a scale of 1-10'
            },
            'activity_level': {
                'type': 'integer',
                'range': [1, 10],
                'description': 'Physical activity level on a scale of 1-10'
            },
            'mood_score': {
                'type': 'integer',
                'range': [1, 10],
                'description': 'Current mood level on a scale of 1-10'
            }
        },
        'output_classes': ['mild', 'moderate', 'severe']
    })
