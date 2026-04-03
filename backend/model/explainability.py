"""
Explainability module for the Mental Health Decision Support System.

Provides SHAP (SHapley Additive exPlanations) based feature attribution
so clinicians can understand WHY a particular risk level was predicted.

This addresses the 'black-box' problem of ensemble models and is a key
contribution for Explainable AI (XAI) in healthcare research.
"""

import logging
import numpy as np

logger = logging.getLogger(__name__)

# Feature display names for frontend rendering
FEATURE_DISPLAY_NAMES = {
    'sleep_hours':        'Sleep Hours',
    'stress_level':       'Stress Level',
    'activity_level':     'Activity Level',
    'mood_score':         'Mood Score',
    'hydration_level':    'Hydration Level',
    'screen_time':        'Screen Time',
    'focus_efficiency':   'Focus Efficiency',
    'sleep_stress_ratio': 'Sleep-Stress Ratio',
    'lifestyle_score':    'Lifestyle Score',
    'digital_wellness':   'Digital Wellness',
    'risk_composite':     'Risk Composite Index',
}


def _try_import_shap():
    """Lazy-import SHAP to remain functional if shap is not installed."""
    try:
        import shap
        return shap
    except ImportError:
        logger.warning(
            "SHAP library not installed. Install with: pip install shap\n"
            "Falling back to built-in feature importance."
        )
        return None


def get_shap_explanation(model, X_background: np.ndarray, X_input: np.ndarray,
                         feature_names: list) -> dict:
    """
    Compute SHAP values for a single input observation.

    Parameters
    ----------
    model        : Trained scikit-learn model (RandomForest preferred)
    X_background : Background dataset array (used to compute base values)
    X_input      : Shape (1, n_features) — the single sample to explain
    feature_names: List of feature column names

    Returns
    -------
    dict with keys:
      shap_values      : list of SHAP values per feature (for predicted class)
      base_value       : expected model output baseline
      feature_names    : ordered list of feature names
      display_names    : human-readable feature labels
      feature_values   : actual input values
      direction        : 'increases_risk' or 'decreases_risk' per feature
      method           : 'shap' or 'feature_importance' (fallback)
    """
    shap = _try_import_shap()

    if shap is not None:
        return _shap_explanation(model, X_background, X_input, feature_names, shap)
    else:
        return _importance_fallback(model, X_input, feature_names)


def _shap_explanation(model, X_background, X_input, feature_names, shap_lib) -> dict:
    """Full SHAP-based explanation using TreeExplainer."""
    try:
        # Use a sample of background data to speed up computation
        bg_sample = X_background[:100] if len(X_background) > 100 else X_background

        explainer   = shap_lib.TreeExplainer(model, bg_sample)
        shap_values = explainer.shap_values(X_input)  # shape: (n_classes, 1, n_features)

        # Get SHAP values for the predicted class
        predicted_class_idx = np.argmax(model.predict_proba(X_input)[0])

        if isinstance(shap_values, list):
            # Multi-class: shap_values is a list of arrays, one per class
            sv_for_class = shap_values[predicted_class_idx][0]
            base_val     = explainer.expected_value[predicted_class_idx]
        else:
            sv_for_class = shap_values[0]
            base_val     = explainer.expected_value

        return _format_result(
            sv_for_class, float(base_val),
            X_input[0], feature_names, method='shap'
        )
    except Exception as e:
        logger.warning(f"SHAP computation failed ({e}), using fallback.")
        return _importance_fallback(model, X_input, feature_names)


def _importance_fallback(model, X_input, feature_names) -> dict:
    """
    Fallback when SHAP is unavailable.
    Uses model's built-in feature_importances_ as a proxy for attribution.
    """
    importances = getattr(model, 'feature_importances_', None)
    if importances is None:
        importances = np.ones(len(feature_names)) / len(feature_names)

    # Signed importance: positive if feature value pushes toward risk
    sv = importances * np.sign(X_input[0])

    return _format_result(
        sv, 0.0, X_input[0], feature_names, method='feature_importance'
    )


def _format_result(shap_vals, base_value, input_vals,
                   feature_names, method: str) -> dict:
    """Serialize SHAP result into a JSON-friendly dict."""
    explanation = []
    for fname, sv, fval in zip(feature_names, shap_vals, input_vals):
        explanation.append({
            'feature':      fname,
            'display_name': FEATURE_DISPLAY_NAMES.get(fname, fname),
            'shap_value':   round(float(sv), 5),
            'input_value':  round(float(fval), 4),
            'direction':    'increases_risk' if sv > 0 else 'decreases_risk',
        })

    # Sort by absolute SHAP value (most impactful first)
    explanation.sort(key=lambda x: abs(x['shap_value']), reverse=True)

    return {
        'explanation':  explanation,
        'base_value':   round(float(base_value), 5),
        'feature_names': feature_names,
        'method':       method,
    }


def get_global_feature_importance(model, feature_names: list) -> list:
    """
    Return global feature importance from the trained Random Forest.
    Used for the /api/feature-importance endpoint.

    Returns
    -------
    List of dicts: [{'feature': ..., 'importance': ...}, ...] sorted desc.
    """
    importances = getattr(model, 'feature_importances_',
                          np.ones(len(feature_names)) / len(feature_names))

    result = [
        {
            'feature':      name,
            'display_name': FEATURE_DISPLAY_NAMES.get(name, name),
            'importance':   round(float(imp), 5),
        }
        for name, imp in zip(feature_names, importances)
    ]
    result.sort(key=lambda x: x['importance'], reverse=True)
    return result
