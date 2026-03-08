"""
Model training script for the Mental Health Decision Support System.

This script generates synthetic data, trains a RandomForestClassifier model,
and saves it for use in the prediction service.

Run this script before starting the API:
    python backend/model/train_model.py
"""

import logging
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def generate_synthetic_data(n_samples: int = 500) -> pd.DataFrame:
    """
    Generate synthetic mental health dataset with expanded feature set.
    """
    logger.info(f"Generating {n_samples} synthetic samples with 7 features...")
    
    np.random.seed(42)
    
    # Generate features
    sleep_hours = np.random.uniform(3, 12, n_samples)
    stress_level = np.random.randint(1, 11, n_samples)
    activity_level = np.random.randint(1, 11, n_samples)
    mood_score = np.random.randint(1, 11, n_samples)
    hydration_level = np.random.randint(1, 11, n_samples)
    screen_time = np.random.uniform(1, 14, n_samples)
    focus_efficiency = np.random.randint(1, 11, n_samples)
    
    # Generate target based on advanced feature logic
    # Depression risk increases with: high stress, low sleep, low activity, low mood, low hydration, high screen time, low focus
    depression_score = (
        (12 - sleep_hours) * 0.2 + 
        (stress_level) * 0.2 +
        (11 - activity_level) * 0.1 +
        (11 - mood_score) * 0.1 +
        (11 - hydration_level) * 0.15 +
        (screen_time) * 0.15 +
        (11 - focus_efficiency) * 0.1
    )
    
    depression_score += np.random.normal(0, 1, n_samples)
    
    # Classify into risk levels
    depression_score = (depression_score - depression_score.min()) / (
        depression_score.max() - depression_score.min()
    ) * 10
    
    def classify_risk(score):
        if score < 3.5: return 'mild'
        elif score < 6.8: return 'moderate'
        else: return 'severe'
    
    depression_risk = [classify_risk(score) for score in depression_score]
    
    return pd.DataFrame({
        'sleep_hours': sleep_hours,
        'stress_level': stress_level,
        'activity_level': activity_level,
        'mood_score': mood_score,
        'hydration_level': hydration_level,
        'screen_time': screen_time,
        'focus_efficiency': focus_efficiency,
        'depression_risk': depression_risk
    })


def train_model(X_train, y_train, X_test, y_test, feature_names):
    """Train a RandomForestClassifier model."""
    logger.info("Training Advanced RandomForestClassifier...")
    
    model = RandomForestClassifier(
        n_estimators=200,      
        max_depth=20,          
        min_samples_split=2,   
        min_samples_leaf=1,    
        random_state=42,       
        n_jobs=-1              
    )
    
    model.fit(X_train, y_train)
    
    # Test accuracy
    test_predictions = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, test_predictions)
    logger.info(f"Test Accuracy: {test_accuracy:.4f}")
    
    # Feature importance
    importances = model.feature_importances_
    logger.info("\nFeature Importance:")
    for name, importance in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
        logger.info(f"  {name}: {importance:.4f}")
    
    return model


def save_model(model, model_path: str) -> None:
    model_path = Path(model_path)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    logger.info(f"Model saved to {model_path}")


def save_data(df: pd.DataFrame, data_path: str) -> None:
    data_path = Path(data_path)
    data_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(data_path, index=False)


def main():
    logger.info("Mental Health Decision Support System - Model Training Pipeline v2.0")
    
    backend_dir = Path(__file__).parent.parent
    model_path = backend_dir / 'model' / 'depression_model.pkl'
    data_path = backend_dir / 'data' / 'synthetic_data.csv'
    
    df = generate_synthetic_data(n_samples=1000)
    save_data(df, str(data_path))
    
    feature_names = [
        'sleep_hours', 'stress_level', 'activity_level', 'mood_score',
        'hydration_level', 'screen_time', 'focus_efficiency'
    ]
    X = df[feature_names]
    y = df['depression_risk']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = train_model(X_train, y_train, X_test, y_test, feature_names)
    save_model(model, str(model_path))
    
    logger.info("\nModel training pipeline completed successfully!")


if __name__ == '__main__':
    main()

