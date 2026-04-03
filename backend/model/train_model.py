"""
Model training pipeline for the Mental Health Decision Support System.

This script implements a comprehensive ML pipeline including:
  - Feature engineering with derived composite features
  - Multi-algorithm comparative study (7 classifiers)
  - Ridge regression for continuous wellness scoring
  - Relapse/churn logistic regression model
  - 10-Fold Stratified Cross-Validation for all models
  - GridSearchCV hyperparameter tuning for Random Forest
  - Saves all trained models for use in the prediction service

Run this script before starting the API:
    python backend/model/train_model.py
"""

import logging
import warnings
import pandas as pd
import numpy as np
from pathlib import Path

# Scikit-learn imports
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression, Ridge, Lasso
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import (
    train_test_split, StratifiedKFold, cross_val_score, GridSearchCV
)
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    roc_auc_score, mean_squared_error, r2_score, f1_score
)
from sklearn.preprocessing import LabelEncoder, StandardScaler

import joblib

warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Model paths ──────────────────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).parent.parent
MODEL_DIR   = BACKEND_DIR / 'model'
DATA_DIR    = BACKEND_DIR / 'data'

CLASSIFIER_PATH      = MODEL_DIR / 'depression_model.pkl'
REGRESSION_PATH      = MODEL_DIR / 'wellness_regression_model.pkl'
RELAPSE_PATH         = MODEL_DIR / 'relapse_model.pkl'
SCALER_PATH          = MODEL_DIR / 'scaler.pkl'
LABEL_ENCODER_PATH   = MODEL_DIR / 'label_encoder.pkl'
COMPARISON_CSV_PATH  = DATA_DIR  / 'model_comparison.csv'
DATA_PATH            = DATA_DIR  / 'synthetic_data.csv'

# Base feature columns (7 raw inputs)
BASE_FEATURES = [
    'sleep_hours', 'stress_level', 'activity_level', 'mood_score',
    'hydration_level', 'screen_time', 'focus_efficiency'
]

# All features including engineered ones
ALL_FEATURES = [
    'sleep_hours', 'stress_level', 'activity_level', 'mood_score',
    'hydration_level', 'screen_time', 'focus_efficiency',
    'sleep_stress_ratio', 'lifestyle_score', 'digital_wellness', 'risk_composite'
]


# ─────────────────────────────────────────────────────────────────────────────
# 1.  DATA GENERATION
# ─────────────────────────────────────────────────────────────────────────────

def generate_synthetic_data(n_samples: int = 1500) -> pd.DataFrame:
    """
    Generate synthetic mental health dataset with expanded + engineered features.

    Returns a DataFrame with raw features, derived features, a continuous
    depression score, and a 3-class risk label.
    """
    logger.info(f"Generating {n_samples} synthetic samples…")
    np.random.seed(42)

    # ── Raw features ──────────────────────────────────────────────────────
    sleep_hours      = np.random.uniform(3, 12, n_samples)
    stress_level     = np.random.randint(1, 11, n_samples).astype(float)
    activity_level   = np.random.randint(1, 11, n_samples).astype(float)
    mood_score       = np.random.randint(1, 11, n_samples).astype(float)
    hydration_level  = np.random.randint(1, 11, n_samples).astype(float)
    screen_time      = np.random.uniform(1, 14, n_samples)
    focus_efficiency = np.random.randint(1, 11, n_samples).astype(float)

    # ── Engineered features ───────────────────────────────────────────────
    # sleep_stress_ratio: high sleep + low stress → better mental health
    sleep_stress_ratio = sleep_hours / (stress_level + 1e-9)

    # lifestyle_score: composite of physical activity, hydration, focus (0–10)
    lifestyle_score = (activity_level + hydration_level + focus_efficiency) / 3.0

    # digital_wellness: inverted screen time (less screen = better)
    digital_wellness = 14.0 - screen_time

    # risk_composite: weighted vulnerability index (higher = worse)
    risk_composite = (
        (12 - sleep_hours)   * 0.20 +
        stress_level         * 0.20 +
        (11 - activity_level)* 0.10 +
        (11 - mood_score)    * 0.10 +
        (11 - hydration_level)* 0.15 +
        screen_time          * 0.15 +
        (11 - focus_efficiency)* 0.10
    )

    # ── Continuous depression score (0-10, used for regression target) ────
    depression_score = risk_composite + np.random.normal(0, 0.8, n_samples)
    depression_score = np.clip(depression_score, 0, None)
    depression_score = (
        (depression_score - depression_score.min()) /
        (depression_score.max() - depression_score.min()) * 10
    )

    # ── Wellness score (0-100, inverse of depression score) ───────────────
    wellness_score = 100 - (depression_score * 10)

    # ── 3-class label ─────────────────────────────────────────────────────
    def classify_risk(s):
        if s < 3.5:  return 'mild'
        elif s < 6.8: return 'moderate'
        else:         return 'severe'

    depression_risk = [classify_risk(s) for s in depression_score]

    df = pd.DataFrame({
        'sleep_hours':       sleep_hours,
        'stress_level':      stress_level,
        'activity_level':    activity_level,
        'mood_score':        mood_score,
        'hydration_level':   hydration_level,
        'screen_time':       screen_time,
        'focus_efficiency':  focus_efficiency,
        # Engineered
        'sleep_stress_ratio': sleep_stress_ratio,
        'lifestyle_score':    lifestyle_score,
        'digital_wellness':   digital_wellness,
        'risk_composite':     risk_composite,
        # Targets
        'depression_score':  depression_score,
        'wellness_score':    wellness_score,
        'depression_risk':   depression_risk,
    })

    logger.info(
        f"Dataset ready — class distribution:\n{df['depression_risk'].value_counts().to_string()}"
    )
    return df


def generate_relapse_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Simulate longitudinal 'relapse' data from the base dataset.

    For each user we simulate a second observation and compute delta features.
    Label = 1 if the user's risk level worsened (churn), 0 otherwise.
    """
    logger.info("Generating relapse/churn dataset…")
    np.random.seed(123)
    n = len(df)

    # Simulate T+1 readings with some random drift
    df2 = df[ALL_FEATURES].copy()
    noise = np.random.normal(0, 0.5, df2.shape)
    df2 = df2 + noise

    # Delta features: how each metric changed
    delta = df2[ALL_FEATURES].values - df[ALL_FEATURES].values

    risk_order = {'mild': 0, 'moderate': 1, 'severe': 2}
    # Simulate T+1 risk (add stronger noise to depression_score to decide)
    dep2 = df['depression_score'] + np.random.normal(0.3, 1.0, n)
    dep2 = np.clip(dep2, 0, 10)

    def classify_risk(s):
        if s < 3.5:   return 'mild'
        elif s < 6.8: return 'moderate'
        else:         return 'severe'

    risk_t0 = df['depression_risk'].map(risk_order)
    risk_t1 = pd.Series([classify_risk(s) for s in dep2]).map(risk_order)
    worsened = (risk_t1 > risk_t0).astype(int)

    delta_df = pd.DataFrame(delta, columns=[f'delta_{c}' for c in ALL_FEATURES])
    delta_df['current_risk_encoded'] = risk_t0.values
    delta_df['worsened'] = worsened.values

    logger.info(
        f"Relapse dataset ready — worsened: {worsened.sum()}, stable: {(worsened == 0).sum()}"
    )
    return delta_df


# ─────────────────────────────────────────────────────────────────────────────
# 2.  COMPARISON: 7-ALGORITHM STUDY
# ─────────────────────────────────────────────────────────────────────────────

CLASSIFIERS = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, solver='lbfgs', multi_class='auto'),
    "Decision Tree":       DecisionTreeClassifier(max_depth=10, random_state=42),
    "Random Forest":       RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, random_state=42),
    "SVM":                 SVC(kernel='rbf', probability=True, random_state=42),
    "KNN":                 KNeighborsClassifier(n_neighbors=5),
    "Naive Bayes":         None,  # placeholder — replaced below to keep import clean
}

# Import NaiveBayes here to keep top-level imports tidy
from sklearn.naive_bayes import GaussianNB
CLASSIFIERS["Naive Bayes"] = GaussianNB()


def compare_all_classifiers(
    X_train_s, X_test_s, y_train, y_test, X_full, y_full
) -> pd.DataFrame:
    """
    Train every classifier and collect: accuracy, macro F1, and 10-fold CV mean ± std.

    Parameters
    ----------
    X_train_s, X_test_s : scaled feature matrices for train / test
    y_train, y_test      : class labels
    X_full, y_full       : full (scaled) dataset for cross-validation
    """
    logger.info("=" * 60)
    logger.info("COMPARATIVE ALGORITHM STUDY")
    logger.info("=" * 60)

    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    results = []

    for name, clf in CLASSIFIERS.items():
        clf.fit(X_train_s, y_train)
        y_pred = clf.predict(X_test_s)

        acc    = accuracy_score(y_test, y_pred)
        f1     = f1_score(y_test, y_pred, average='macro')
        cv_sc  = cross_val_score(clf, X_full, y_full, cv=cv, scoring='accuracy', n_jobs=-1)

        results.append({
            'Algorithm':       name,
            'Test Accuracy':   round(acc, 4),
            'Macro F1':        round(f1, 4),
            'CV Mean (10-fold)': round(cv_sc.mean(), 4),
            'CV Std':          round(cv_sc.std(), 4),
        })

        logger.info(
            f"  {name:<22} | Acc={acc:.4f} | F1={f1:.4f} "
            f"| 10-CV: {cv_sc.mean():.4f} ± {cv_sc.std():.4f}"
        )

    df_results = pd.DataFrame(results).sort_values('CV Mean (10-fold)', ascending=False)
    logger.info("=" * 60)
    return df_results


# ─────────────────────────────────────────────────────────────────────────────
# 3.  PRIMARY CLASSIFIER — Random Forest w/ GridSearchCV Tuning
# ─────────────────────────────────────────────────────────────────────────────

def tune_and_train_classifier(X_train_s, y_train, X_test_s, y_test) -> RandomForestClassifier:
    """
    Tune Random Forest with GridSearchCV then evaluate on test split.
    Returns the best-fitted model.
    """
    logger.info("Hyperparameter tuning — RandomForestClassifier…")

    param_grid = {
        'n_estimators': [100, 200],
        'max_depth':    [10, 20, None],
        'min_samples_split': [2, 5],
    }
    base_rf = RandomForestClassifier(random_state=42, n_jobs=-1)
    grid = GridSearchCV(
        base_rf, param_grid, cv=5, scoring='accuracy',
        n_jobs=-1, verbose=0
    )
    grid.fit(X_train_s, y_train)

    best = grid.best_estimator_
    y_pred = best.predict(X_test_s)
    acc = accuracy_score(y_test, y_pred)

    logger.info(f"Best params: {grid.best_params_}")
    logger.info(f"Best CV score: {grid.best_score_:.4f}")
    logger.info(f"Test accuracy: {acc:.4f}")
    logger.info("\nClassification Report:\n" + classification_report(y_test, y_pred))

    # Feature importances
    importances = best.feature_importances_
    logger.info("Feature Importances (top-5):")
    for feat, imp in sorted(zip(ALL_FEATURES, importances), key=lambda x: -x[1])[:5]:
        logger.info(f"   {feat:<22}: {imp:.4f}")

    return best


# ─────────────────────────────────────────────────────────────────────────────
# 4.  REGRESSION MODEL — Continuous Wellness Score
# ─────────────────────────────────────────────────────────────────────────────

def train_regression_model(X_train_s, y_reg_train, X_test_s, y_reg_test) -> Ridge:
    """
    Trains a Ridge Regression model to predict a continuous wellness score (0-100).

    Motivation: unlike binary/multi-class classifiers, regression provides a
    fine-grained severity index clinicians can track over time.
    """
    logger.info("Training Ridge Regression — Wellness Score prediction…")

    # Compare Ridge vs Lasso
    for name, reg in [("Ridge", Ridge(alpha=1.0)), ("Lasso", Lasso(alpha=0.1))]:
        reg.fit(X_train_s, y_reg_train)
        pred = reg.predict(X_test_s)
        r2   = r2_score(y_reg_test, pred)
        rmse = np.sqrt(mean_squared_error(y_reg_test, pred))
        logger.info(f"  {name:<6} | R²={r2:.4f} | RMSE={rmse:.4f}")

    # Use Ridge as primary
    best_reg = Ridge(alpha=1.0)
    best_reg.fit(X_train_s, y_reg_train)

    pred = best_reg.predict(X_test_s)
    logger.info(f"Ridge R²:   {r2_score(y_reg_test, pred):.4f}")
    logger.info(f"Ridge RMSE: {np.sqrt(mean_squared_error(y_reg_test, pred)):.4f}")

    return best_reg


# ─────────────────────────────────────────────────────────────────────────────
# 5.  RELAPSE / CHURN PREDICTION — Logistic Regression
# ─────────────────────────────────────────────────────────────────────────────

def train_relapse_model(relapse_df: pd.DataFrame) -> LogisticRegression:
    """
    Trains a Logistic Regression model to predict mental health relapse (churn).

    Input  : delta features (change between two consecutive observations)
    Output : P(worsened) — probability that the user's risk category increased
    """
    logger.info("Training Relapse/Churn Logistic Regression model…")

    feature_cols = [c for c in relapse_df.columns if c != 'worsened']
    X = relapse_df[feature_cols].values
    y = relapse_df['worsened'].values

    scaler_r = StandardScaler()
    X_scaled = scaler_r.fit_transform(X)

    X_tr, X_te, y_tr, y_te = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    # 10-fold CV on Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42)
    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    cv_scores = cross_val_score(lr, X_scaled, y, cv=cv, scoring='accuracy')
    logger.info(f"Relapse LR 10-fold CV: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    lr.fit(X_tr, y_tr)
    y_pred = lr.predict(X_te)
    acc = accuracy_score(y_te, y_pred)
    logger.info(f"Relapse model test accuracy: {acc:.4f}")
    logger.info("\n" + classification_report(y_te, y_pred, target_names=["Stable", "Relapse"]))

    # Bundle: model + its own scaler + feature names
    relapse_bundle = {
        'model':         lr,
        'scaler':        scaler_r,
        'feature_names': feature_cols,
    }
    return relapse_bundle


# ─────────────────────────────────────────────────────────────────────────────
# 6.  SAVE / LOAD HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def save_artifact(obj, path: Path, label: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(obj, path)
    logger.info(f"Saved {label} → {path}")


# ─────────────────────────────────────────────────────────────────────────────
# 7.  MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def main():
    logger.info("=" * 60)
    logger.info("Mental Health DSS — Research-Level Training Pipeline v3.0")
    logger.info("=" * 60)

    # ── Step 1: Generate data ─────────────────────────────────────────────
    df = generate_synthetic_data(n_samples=1500)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    logger.info(f"Dataset saved → {DATA_PATH}")

    # ── Step 2: Prepare features / targets ───────────────────────────────
    X = df[ALL_FEATURES]
    y_class = df['depression_risk']
    y_reg   = df['wellness_score']

    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y_class)

    # Scale features (required for LR, SVM, KNN, Ridge)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/test split (stratified)
    X_tr, X_te, y_tr, y_te = train_test_split(
        X_scaled, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )
    _, _, y_reg_tr, y_reg_te = train_test_split(
        X_scaled, y_reg, test_size=0.2, random_state=42
    )
    # String-label split for classifiers that can handle string targets
    X_str_tr, X_str_te, y_str_tr, y_str_te = train_test_split(
        X_scaled, y_class, test_size=0.2, random_state=42, stratify=y_class
    )

    # ── Step 3: 7-algorithm comparison ───────────────────────────────────
    comparison_df = compare_all_classifiers(
        X_str_tr, X_str_te, y_str_tr, y_str_te,
        X_scaled, y_class
    )
    comparison_df.to_csv(COMPARISON_CSV_PATH, index=False)
    logger.info(f"Model comparison table saved → {COMPARISON_CSV_PATH}")
    logger.info(f"\n{comparison_df.to_string(index=False)}")

    # ── Step 4: Hyperparameter-tuned primary classifier ──────────────────
    primary_clf = tune_and_train_classifier(X_str_tr, y_str_tr, X_str_te, y_str_te)

    # ── Step 5: Ridge regression wellness model ───────────────────────────
    reg_model = train_regression_model(X_tr, y_reg_tr, X_te, y_reg_te)

    # ── Step 6: Relapse / churn model ────────────────────────────────────
    relapse_df     = generate_relapse_data(df)
    relapse_bundle = train_relapse_model(relapse_df)

    # ── Step 7: Save all artifacts ────────────────────────────────────────
    save_artifact(primary_clf,     CLASSIFIER_PATH,    "Primary Classifier (RandomForest)")
    save_artifact(reg_model,       REGRESSION_PATH,    "Regression Model (Ridge)")
    save_artifact(relapse_bundle,  RELAPSE_PATH,       "Relapse Bundle (LogisticRegression)")
    save_artifact(scaler,          SCALER_PATH,        "Shared Feature Scaler")
    save_artifact(le,              LABEL_ENCODER_PATH, "Label Encoder")

    logger.info("=" * 60)
    logger.info("All models saved successfully. Pipeline complete!")
    logger.info("=" * 60)
    logger.info(f"  Classifier : {CLASSIFIER_PATH}")
    logger.info(f"  Regression : {REGRESSION_PATH}")
    logger.info(f"  Relapse    : {RELAPSE_PATH}")
    logger.info(f"  Scaler     : {SCALER_PATH}")
    logger.info(f"  Encoder    : {LABEL_ENCODER_PATH}")
    logger.info(f"  Comparison : {COMPARISON_CSV_PATH}")


if __name__ == '__main__':
    main()
