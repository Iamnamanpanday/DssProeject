"""
API routes for the Mental Health Decision Support System.

Endpoints:
  GET  /api/health              — Health check
  GET  /api/info                — API metadata
  POST /api/predict             — Full multi-model prediction
  POST /api/wellness-score      — Continuous wellness score only
  POST /api/relapse-risk        — Relapse/churn probability
  POST /api/explain             — SHAP feature attribution
  GET  /api/compare-models      — Algorithm comparison table
  GET  /api/feature-importance  — Global RF feature importance
  GET  /api/analytics           — Aggregate prediction statistics
"""

import logging
from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

api_bp = Blueprint('api', __name__, url_prefix='/api')

# ── Required fields for all prediction-style endpoints ──────────────────────
REQUIRED_FIELDS = [
    'sleep_hours', 'stress_level', 'activity_level', 'mood_score',
    'hydration_level', 'screen_time', 'focus_efficiency'
]

# ── Simple in-memory analytics store (per-session) ──────────────────────────
_prediction_log: list = []


# ────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────

def _error(message: str, code: int = 400) -> Tuple[Dict, int]:
    return jsonify({'status': 'error', 'message': message}), code


def _success(data: Dict, code: int = 200) -> Tuple[Dict, int]:
    return jsonify({'status': 'success', 'data': data}), code


def _parse_and_validate(data: dict):
    """
    Validate JSON body contains all required numeric fields.
    Returns (parsed_dict, None) on success or (None, error_response) on failure.
    """
    parsed = {}
    for field in REQUIRED_FIELDS:
        if field not in data:
            return None, _error(f"Missing required field: '{field}'")
        try:
            parsed[field] = float(data[field])
        except (TypeError, ValueError):
            return None, _error(f"Field '{field}' must be numeric.")
    return parsed, None


# ────────────────────────────────────────────────────────────────────────────
# Utility / meta endpoints
# ────────────────────────────────────────────────────────────────────────────

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check — confirms API and all models are ready."""
    svc = current_app.prediction_service
    return _success({
        'message':       'API is healthy',
        'version':       '3.0.0',
        'service':       'Mental Health Decision Support System',
        'models_loaded': svc.is_ready(),
    })


@api_bp.route('/info', methods=['GET'])
def info():
    """Return API metadata and endpoint documentation."""
    return _success({
        'title':       'Mental Health Decision Support System',
        'version':     '3.0.0',
        'description': 'Multi-model AI API for mental health risk prediction',
        'models': {
            'classifier':  'Random Forest (7-class comparison, GridSearchCV tuned)',
            'regressor':   'Ridge Regression (continuous wellness score 0-100)',
            'relapse':     'Logistic Regression (churn/relapse probability)',
        },
        'endpoints': {
            'POST /api/predict':            'Full multi-model prediction',
            'POST /api/wellness-score':     'Continuous wellness score only',
            'POST /api/relapse-risk':       'Relapse/churn probability',
            'POST /api/explain':            'SHAP feature attribution',
            'GET  /api/compare-models':     'Algorithm comparison table',
            'GET  /api/feature-importance': 'Global RF feature importance',
            'GET  /api/analytics':          'Aggregate prediction statistics',
        },
        'input_features': {f: '(numeric)' for f in REQUIRED_FIELDS},
        'output_classes': ['mild', 'moderate', 'severe'],
    })


# ────────────────────────────────────────────────────────────────────────────
# Core prediction endpoints
# ────────────────────────────────────────────────────────────────────────────

@api_bp.route('/predict', methods=['POST'])
def predict():
    """
    Run all three models and return a unified rich prediction.

    Request body (JSON):
      { "sleep_hours": 6.5, "stress_level": 7, "activity_level": 4,
        "mood_score": 5, "hydration_level": 6,
        "screen_time": 8, "focus_efficiency": 5 }

    Response includes:
      - risk_level, confidence, probabilities dict
      - wellness_score (0-100, continuous)
      - relapse_risk (0-1 probability)
      - recommendation text
      - all input + engineered feature values
    """
    if not request.is_json:
        return _error("Request must be JSON")

    data = request.get_json()
    parsed, err = _parse_and_validate(data)
    if err:
        return err

    try:
        svc    = current_app.prediction_service
        result = svc.full_prediction(parsed)

        # Log for analytics
        _prediction_log.append({
            'risk_level':     result['risk_level'],
            'wellness_score': result['wellness_score'],
            'relapse_risk':   result['relapse_risk'],
            'confidence':     result['confidence'],
        })

        logger.info(
            f"Prediction: {result['risk_level']} | WS={result['wellness_score']} "
            f"| Relapse={result['relapse_risk']}"
        )
        return _success(result)

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return _error("Failed to make prediction", code=500)


@api_bp.route('/wellness-score', methods=['POST'])
def wellness_score():
    """
    Return ONLY the continuous wellness score (0-100).
    Useful for trend-tracking dashboards.
    """
    if not request.is_json:
        return _error("Request must be JSON")

    data = request.get_json()
    parsed, err = _parse_and_validate(data)
    if err:
        return err

    try:
        svc   = current_app.prediction_service
        X_raw = svc.engineer_features(parsed)
        score = svc.predict_wellness_score(X_raw)

        return _success({
            'wellness_score':  score,
            'interpretation': (
                'Excellent' if score >= 80 else
                'Good'      if score >= 60 else
                'Fair'      if score >= 40 else
                'Poor'
            ),
        })
    except Exception as e:
        logger.error(f"Wellness score error: {e}", exc_info=True)
        return _error("Failed to compute wellness score", code=500)


@api_bp.route('/relapse-risk', methods=['POST'])
def relapse_risk():
    """
    Predict probability that the user's mental health will worsen.

    Optionally accepts 'previous_reading' dict to compute feature deltas.
    Without it, neutral (zero-delta) assumption is used.
    """
    if not request.is_json:
        return _error("Request must be JSON")

    data = request.get_json()
    parsed, err = _parse_and_validate(data)
    if err:
        return err

    previous_raw = data.get('previous_reading')

    try:
        svc   = current_app.prediction_service
        X_raw = svc.engineer_features(parsed)

        # Get current risk for relapse model
        risk_level, _, _ = svc.predict_risk(X_raw)

        prev_X = None
        if previous_raw:
            prev_parsed = {f: float(previous_raw.get(f, parsed[f])) for f in REQUIRED_FIELDS}
            prev_X = svc.engineer_features(prev_parsed)

        prob = svc.predict_relapse_risk(X_raw, risk_level, prev_X)

        return _success({
            'relapse_probability':  prob,
            'current_risk':         risk_level,
            'risk_interpretation': (
                'High risk of worsening'       if prob > 0.6 else
                'Moderate risk of worsening'   if prob > 0.4 else
                'Low risk — condition stable'
            ),
        })
    except Exception as e:
        logger.error(f"Relapse risk error: {e}", exc_info=True)
        return _error("Failed to compute relapse risk", code=500)


@api_bp.route('/explain', methods=['POST'])
def explain():
    """
    Return SHAP feature attribution for a single prediction.

    Shows which features INCREASED vs DECREASED the risk, ranked by impact.
    """
    if not request.is_json:
        return _error("Request must be JSON")

    data = request.get_json()
    parsed, err = _parse_and_validate(data)
    if err:
        return err

    try:
        svc         = current_app.prediction_service
        explanation = svc.explain_prediction(parsed)
        return _success(explanation)
    except Exception as e:
        logger.error(f"Explanation error: {e}", exc_info=True)
        return _error("Failed to generate explanation", code=500)


# ────────────────────────────────────────────────────────────────────────────
# Research / analytics endpoints
# ────────────────────────────────────────────────────────────────────────────

@api_bp.route('/compare-models', methods=['GET'])
def compare_models():
    """
    Return the multi-algorithm comparative study table.

    Columns: Algorithm, Test Accuracy, Macro F1, CV Mean (10-fold), CV Std
    Generated at training time by train_model.py.
    """
    try:
        svc  = current_app.prediction_service
        rows = svc.get_model_comparison()
        return _success({
            'algorithms_compared': len(rows),
            'metric_descriptions': {
                'Test Accuracy':    'Accuracy on 20% held-out test set',
                'Macro F1':         'Macro-averaged F1 across all 3 classes',
                'CV Mean (10-fold)':'Mean accuracy over 10-fold stratified CV',
                'CV Std':           'Standard deviation of CV fold scores',
            },
            'results': rows,
        })
    except Exception as e:
        logger.error(f"Model comparison error: {e}", exc_info=True)
        return _error("Failed to retrieve model comparison", code=500)


@api_bp.route('/feature-importance', methods=['GET'])
def feature_importance():
    """
    Return global feature importance from the tuned Random Forest model.
    Sorted by importance descending.
    """
    try:
        svc  = current_app.prediction_service
        data = svc.get_feature_importance()
        return _success({'feature_importance': data})
    except Exception as e:
        logger.error(f"Feature importance error: {e}", exc_info=True)
        return _error("Failed to retrieve feature importance", code=500)


@api_bp.route('/analytics', methods=['GET'])
def analytics():
    """
    Return aggregate statistics across all predictions made this session.

    Provides:
      - total predictions
      - risk level distribution (%)
      - average wellness score
      - average relapse probability
      - average model confidence
    """
    if not _prediction_log:
        return _success({'message': 'No predictions made yet.', 'total_predictions': 0})

    import numpy as np

    total = len(_prediction_log)
    risks = [p['risk_level'] for p in _prediction_log]
    ws    = [p['wellness_score'] for p in _prediction_log]
    rp    = [p['relapse_risk'] for p in _prediction_log]
    conf  = [p['confidence'] for p in _prediction_log]

    from collections import Counter
    risk_counts = Counter(risks)

    return _success({
        'total_predictions':      total,
        'risk_distribution': {
            k: {'count': v, 'percent': round(v / total * 100, 1)}
            for k, v in risk_counts.items()
        },
        'average_wellness_score':    round(float(np.mean(ws)), 2),
        'average_relapse_risk':      round(float(np.mean(rp)), 4),
        'average_confidence':        round(float(np.mean(conf)), 4),
    })


# ────────────────────────────────────────────────────────────────────────────
# Chat endpoint (unchanged from v1)
# ────────────────────────────────────────────────────────────────────────────

@api_bp.route('/chat', methods=['POST'])
def chat():
    """AI-powered chat assistant with mental health context."""
    if not request.is_json:
        return _error("Request must be JSON")

    data    = request.get_json()
    message = data.get('message', '')
    context = data.get('context', {})

    try:
        reply = current_app.chatbot_service.get_response(message, context)
        return _success({'reply': reply})
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        return _error("Failed to get chat response", code=500)
