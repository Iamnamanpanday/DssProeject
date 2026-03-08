"""
Preprocessing utilities for feature normalization and validation.

This module provides functions to validate and preprocess input features
before passing them to the ML model for prediction.
"""

import numpy as np
from typing import Dict, Tuple, List
import logging

logger = logging.getLogger(__name__)


class FeaturePreprocessor:
    """
    Handles preprocessing of mental health features.
    
    This class provides methods for validating input features,
    normalizing values, and preparing data for model inference.
    """
    
    def __init__(self, feature_ranges: Dict[str, Dict[str, float]]):
        """
        Initialize the preprocessor with feature ranges.
        
        Args:
            feature_ranges: Dictionary mapping feature names to their valid ranges
                           e.g., {'sleep_hours': {'min': 0, 'max': 12}}
        """
        self.feature_ranges = feature_ranges
        self.required_features = list(feature_ranges.keys())
    
    def validate_input(self, data: Dict[str, float]) -> Tuple[bool, str]:
        """
        Validate input data against defined constraints.
        
        Args:
            data: Dictionary containing feature values
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check for missing features
        missing_features = [f for f in self.required_features if f not in data]
        if missing_features:
            return False, f"Missing required features: {', '.join(missing_features)}"
        
        # Validate each feature value
        for feature, ranges in self.feature_ranges.items():
            value = data[feature]
            
            # Check if value is numeric
            try:
                value = float(value)
            except (TypeError, ValueError):
                return False, f"Feature '{feature}' must be numeric"
            
            # Check value range
            if value < ranges['min'] or value > ranges['max']:
                return False, (
                    f"Feature '{feature}' must be between "
                    f"{ranges['min']} and {ranges['max']}, got {value}"
                )
        
        return True, ""
    
    def preprocess(self, data: Dict[str, float]) -> np.ndarray:
        """
        Preprocess and normalize input features.
        
        Args:
            data: Dictionary containing raw feature values
            
        Returns:
            Numpy array of preprocessed features in correct order
            
        Raises:
            ValueError: If validation fails
        """
        # Validate input
        is_valid, error_msg = self.validate_input(data)
        if not is_valid:
            logger.warning(f"Validation failed: {error_msg}")
            raise ValueError(error_msg)
        
        # Extract features in the correct order
        features = []
        for feature_name in self.required_features:
            value = float(data[feature_name])
            features.append(value)
        
        logger.debug(f"Preprocessed features: {features}")
        return np.array([features])
    
    def get_feature_stats(self, data: Dict[str, float]) -> Dict[str, float]:
        """
        Get statistical information about input features.
        
        Args:
            data: Dictionary containing feature values
            
        Returns:
            Dictionary with feature statistics
        """
        stats = {}
        for feature in self.required_features:
            if feature in data:
                value = float(data[feature])
                range_info = self.feature_ranges[feature]
                percentage = ((value - range_info['min']) / 
                             (range_info['max'] - range_info['min'])) * 100
                stats[feature] = {
                    'value': value,
                    'percentage_of_range': round(percentage, 2)
                }
        return stats
