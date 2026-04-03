"""
Prediction service module for the Mental Health Decision Support System.

Manages three distinct ML models:
  1. Primary Classifier   — RandomForest → mild / moderate / severe
  2. Wellness Regressor   — Ridge        → continuous wellness score (0-100)
  3. Relapse Predictor    — Logistic Reg → P(worsened next observation)

Also exposes the model comparison table generated at training time.
"""

import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from pathlib import Path

from model.explainability import get_shap_explanation, get_global_feature_importance

logger = logging.getLogger(__name__)

# ── Feature columns in the order the scalers expect ──────────────────────────
ALL_FEATURES = [
    'sleep_hours', 'stress_level', 'activity_level', 'mood_score',
    'hydration_level', 'screen_time', 'focus_efficiency',
    'sleep_stress_ratio', 'lifestyle_score', 'digital_wellness', 'risk_composite'
]

RISK_ORDER = {'mild': 0, 'moderate': 1, 'severe': 2}


class PredictionService:
    """
    Service for managing all ML model predictions.

    Loads the primary classifier, regression model, relapse model, and the
    shared feature scaler.  Exposes rich prediction results for the API layer.
    """

    def __init__(self, model_dir: str, recommendations: Dict[str, str]):
        self.model_dir       = Path(model_dir)
        self.recommendations = recommendations

        # Model objects (set by _load_all)
        self.classifier    = None
        self.regressor     = None
        self.relapse_bundle = None   # dict with 'model', 'scaler', 'feature_names'
        self.scaler        = None
        self.label_encoder = None
        self.comparison_df = None   # pd.DataFrame loaded from model_comparison.csv

        self._load_all()

    # ─────────────────────────────────────────────────────────────────────────
    # Loading
    # ─────────────────────────────────────────────────────────────────────────

    def _load_artifact(self, filename: str, label: str):
        path = self.model_dir / filename
        if not path.exists():
            raise FileNotFoundError(
                f"{label} not found at {path}. "
                "Please run 'python backend/model/train_model.py' first."
            )
        obj = joblib.load(path)
        logger.info(f"Loaded {label} from {path}")
        return obj

    def _load_all(self) -> None:
        self.classifier     = self._load_artifact('depression_model.pkl',        'Classifier')
        self.regressor      = self._load_artifact('wellness_regression_model.pkl','Regressor')
        self.relapse_bundle = self._load_artifact('relapse_model.pkl',           'Relapse model')
        self.scaler         = self._load_artifact('scaler.pkl',                  'Feature scaler')
        self.label_encoder  = self._load_artifact('label_encoder.pkl',           'Label encoder')

        # Load comparison CSV (may not exist on first run)
        comparison_path = self.model_dir.parent / 'data' / 'model_comparison.csv'
        if comparison_path.exists():
            self.comparison_df = pd.read_csv(comparison_path)
            logger.info("Model comparison table loaded.")
        else:
            logger.warning("model_comparison.csv not found — /compare-models will be empty.")

    def is_ready(self) -> bool:
        return all([
            self.classifier is not None,
            self.regressor  is not None,
            self.relapse_bundle is not None,
            self.scaler     is not None,
        ])

    # ─────────────────────────────────────────────────────────────────────────
    # Feature Engineering (mirrors train_model.py)
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def engineer_features(raw: Dict[str, float]) -> np.ndarray:
        """
        Compute derived features from raw inputs and return a scaled-ready array.

        Parameters
        ----------
        raw : dict with keys matching BASE_FEATURES

        Returns
        -------
        np.ndarray of shape (1, 11) — all features including engineered ones
        """
        sh  = float(raw['sleep_hours'])
        sl  = float(raw['stress_level'])
        al  = float(raw['activity_level'])
        ms  = float(raw['mood_score'])
        hl  = float(raw['hydration_level'])
        st  = float(raw['screen_time'])
        fe  = float(raw['focus_efficiency'])

        sleep_stress_ratio = sh / (sl + 1e-9)
        lifestyle_score    = (al + hl + fe) / 3.0
        digital_wellness   = 14.0 - st
        risk_composite     = (
            (12 - sh) * 0.20 + sl * 0.20 + (11 - al) * 0.10 +
            (11 - ms) * 0.10 + (11 - hl) * 0.15 + st * 0.15 + (11 - fe) * 0.10
        )

        return np.array([[sh, sl, al, ms, hl, st, fe,
                          sleep_stress_ratio, lifestyle_score,
                          digital_wellness, risk_composite]])

    # ─────────────────────────────────────────────────────────────────────────
    # Individual predictions
    # ─────────────────────────────────────────────────────────────────────────

    def predict_risk(self, X_raw: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """
        Classify depression risk and return class probabilities.

        Returns
        -------
        (risk_level, confidence, probabilities_dict)
        """
        X_s = self.scaler.transform(X_raw)
        proba         = self.classifier.predict_proba(X_s)[0]
        classes       = self.classifier.classes_          # e.g. ['mild','moderate','severe']
        predicted_idx = np.argmax(proba)
        risk_level    = classes[predicted_idx]
        confidence    = float(proba[predicted_idx])
        prob_dict     = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}

        return risk_level, confidence, prob_dict

    def predict_wellness_score(self, X_raw: np.ndarray) -> float:
        """
        Predict a continuous wellness score (0-100).
        Higher = better mental health.
        """
        X_s = self.scaler.transform(X_raw)
        score = float(self.regressor.predict(X_s)[0])
        return round(max(0.0, min(100.0, score)), 2)

    def predict_relapse_risk(self, X_raw: np.ndarray,
                             current_risk: str,
                             previous_X_raw: np.ndarray = None) -> float:
        """
        Predict probability of relapse (worsening) at the next observation.

        If no previous observation is provided, uses zero deltas (neutral).

        Returns
        -------
        float: probability of worsening (0-1)
        """
        if previous_X_raw is None:
            delta = np.zeros(X_raw.shape)
        else:
            delta = X_raw - previous_X_raw

        risk_enc = RISK_ORDER.get(current_risk, 1)
        relapse_features = np.hstack([delta[0], [risk_enc]])   # shape (12,)

        bundle  = self.relapse_bundle
        X_r_s   = bundle['scaler'].transform(relapse_features.reshape(1, -1))
        prob    = float(bundle['model'].predict_proba(X_r_s)[0][1])  # P(worsened)
        return round(prob, 4)

    # ─────────────────────────────────────────────────────────────────────────
    # Full combined prediction
    # ─────────────────────────────────────────────────────────────────────────

    def full_prediction(self, raw_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Run all three models and return a unified response.

        Parameters
        ----------
        raw_features : dict with 7 base feature keys

        Returns
        -------
        dict with:
          risk_level       : str   'mild' | 'moderate' | 'severe'
          confidence       : float (0-1)
          probabilities    : dict  {class: prob}
          wellness_score   : float (0-100)
          relapse_risk     : float (0-1)
          recommendation   : str
          input_features   : dict (echoes inputs + engineered values)
        """
        X_raw = self.engineer_features(raw_features)

        risk_level, confidence, prob_dict = self.predict_risk(X_raw)
        wellness_score  = self.predict_wellness_score(X_raw)
        relapse_risk    = self.predict_relapse_risk(X_raw, risk_level)
        recommendation  = self.recommendations.get(risk_level, '')

        # Engineered feature values for transparency
        feats = {name: round(float(v), 4) for name, v in zip(ALL_FEATURES, X_raw[0])}

        return {
            'risk_level':     risk_level,
            'confidence':     round(confidence, 4),
            'probabilities':  prob_dict,
            'wellness_score': wellness_score,
            'relapse_risk':   relapse_risk,
            'recommendation': recommendation,
            'input_features': feats,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # Explainability
    # ─────────────────────────────────────────────────────────────────────────

    def explain_prediction(self, raw_features: Dict[str, float],
                           X_background: np.ndarray = None) -> Dict[str, Any]:
        """
        Return SHAP/feature-importance explanation for a single prediction.

        Parameters
        ----------
        raw_features  : same as full_prediction
        X_background  : optional background array for SHAP (uses zeros if None)
        """
        X_raw = self.engineer_features(raw_features)
        X_s   = self.scaler.transform(X_raw)

        if X_background is None:
            X_background = np.zeros((5, X_s.shape[1]))

        explanation = get_shap_explanation(
            self.classifier, X_background, X_s, ALL_FEATURES
        )

        risk_level, confidence, prob_dict = self.predict_risk(X_raw)
        explanation['predicted_class']  = risk_level
        explanation['confidence']        = round(confidence, 4)
        explanation['probabilities']     = prob_dict

        return explanation

    # ─────────────────────────────────────────────────────────────────────────
    # Analytics helpers
    # ─────────────────────────────────────────────────────────────────────────

    def get_model_comparison(self) -> List[Dict]:
        """Return the multi-algorithm comparison table as a list of dicts."""
        if self.comparison_df is None:
            return []
        return self.comparison_df.to_dict(orient='records')

    def get_feature_importance(self) -> List[Dict]:
        """Return global feature importance from the primary classifier."""
        return get_global_feature_importance(self.classifier, ALL_FEATURES)

    def get_recommendation(self, risk_level: str) -> str:
        if risk_level not in self.recommendations:
            raise ValueError(f"Unknown risk level: {risk_level}")
        return self.recommendations[risk_level]
