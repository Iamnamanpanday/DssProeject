"""
Prediction service module for mental health risk prediction.

This module contains the core business logic for loading the trained ML model,
making predictions, and generating recommendations based on predictions.
"""

import logging
import joblib
from typing import Dict, Tuple
from pathlib import Path
import numpy as np

logger = logging.getLogger(__name__)


class PredictionService:
    """
    Service for managing ML model predictions and recommendations.
    
    This class handles model loading, inference, and recommendation generation
    for the Mental Health Decision Support System.
    """
    
    def __init__(self, model_path: str, recommendations: Dict[str, str]):
        """
        Initialize the prediction service.
        
        Args:
            model_path: Path to the serialized model file (depression_model.pkl)
            recommendations: Dictionary mapping risk levels to recommendation strings
        """
        self.model_path = Path(model_path)
        self.recommendations = recommendations
        self.model = None
        self._load_model()
    
    def _load_model(self) -> None:
        """
        Load the trained ML model from disk.
        
        Raises:
            FileNotFoundError: If model file does not exist
            Exception: If model loading fails
        """
        try:
            if not self.model_path.exists():
                raise FileNotFoundError(
                    f"Model file not found at {self.model_path}. "
                    "Please train the model first using train_model.py"
                )
            
            self.model = joblib.load(self.model_path)
            logger.info(f"Model loaded successfully from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def is_model_loaded(self) -> bool:
        """
        Check if the model is loaded and ready for inference.
        
        Returns:
            True if model is loaded, False otherwise
        """
        return self.model is not None
    
    def predict(self, features: np.ndarray) -> Tuple[str, float]:
        """
        Make a prediction using the trained model.
        
        Args:
            features: Numpy array of preprocessed features [sleep_hours, stress_level, 
                     activity_level, mood_score]
        
        Returns:
            Tuple of (predicted_class, confidence)
            - predicted_class: One of ['mild', 'moderate', 'severe']
            - confidence: Probability of the predicted class
        
        Raises:
            ValueError: If model is not loaded
            Exception: If prediction fails
        """
        if not self.is_model_loaded():
            raise ValueError("Model is not loaded. Please initialize the service properly.")
        
        try:
            # Make prediction
            prediction = self.model.predict(features)
            probabilities = self.model.predict_proba(features)
            
            # Get the predicted class and its confidence
            predicted_class = prediction[0]
            confidence = np.max(probabilities[0])
            
            logger.info(
                f"Prediction made: {predicted_class} (confidence: {confidence:.2f})"
            )
            
            return predicted_class, float(confidence)
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def get_recommendation(self, risk_level: str) -> str:
        """
        Get recommendation based on predicted risk level.
        
        Args:
            risk_level: One of ['mild', 'moderate', 'severe']
        
        Returns:
            Recommendation string for the given risk level
        
        Raises:
            ValueError: If risk level is unknown
        """
        if risk_level not in self.recommendations:
            raise ValueError(
                f"Unknown risk level: {risk_level}. "
                f"Valid levels are: {list(self.recommendations.keys())}"
            )
        
        return self.recommendations[risk_level]
    
    def full_prediction(
        self, 
        features: np.ndarray
    ) -> Dict[str, any]:
        """
        Make a complete prediction including risk level and recommendation.
        
        Args:
            features: Numpy array of preprocessed features
        
        Returns:
            Dictionary containing:
            - risk_level: Predicted depression risk level
            - confidence: Confidence score (0-1)
            - recommendation: Personalized recommendation
        """
        try:
            # Get prediction
            risk_level, confidence = self.predict(features)
            
            # Get recommendation
            recommendation = self.get_recommendation(risk_level)
            
            result = {
                'risk_level': risk_level,
                'confidence': round(confidence, 4),
                'recommendation': recommendation
            }
            
            logger.info(f"Full prediction completed: {result}")
            return result
        except Exception as e:
            logger.error(f"Full prediction failed: {str(e)}")
            raise
