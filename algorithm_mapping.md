# Model & Algorithm Mapping: Mental Health DSS

This document provides a technical map of where and how every algorithm is utilized across the Project's Backend and Frontend layers.

---

## 1. The "Tournament" Algorithms
During the **Training Phase** (`train_model.py`), the system runs a comparative study across 7 distinct algorithms to validate performance.

| Algorithm | Role / Usage |
| :--- | :--- |
| **Random Forest** | Selected as the **Primary Classifier** due to high accuracy and robustness. |
| **Logistic Regression** | Used for the **Relapse Predictor** (Binary classification of "Worsened" vs "Stable"). |
| **Support Vector Machine (SVM)** | Evaluated in the comparison study; known for handling high-dimensional boundaries. |
| **Gradient Boosting** | Evaluated in the comparison study; used for its powerful ensemble learning. |
| **K-Nearest Neighbors (KNN)** | Evaluated in comparison; simplest instance-based classification. |
| **Decision Tree** | Evaluated in comparison; provides a baseline for the Random Forest. |
| **Naive Bayes** | Evaluated in comparison; used as a probabilistic baseline. |

> [!NOTE]
> The results of this comparison are saved to `model_comparison.csv` and visualized in the **"Model Comparison"** chart on the Dashboard to provide transparency (DSS Principle).

---

## 2. Production Models (Inference)
When you click **"Initialize Analysis"** in the UI, the `PredictionService` (`prediction_service.py`) runs these specific models in parallel:

### A. Primary Risk Classifier
- **Model**: `RandomForestClassifier` (Tuned via GridSearchCV).
- **Location**: `depression_model.pkl`.
- **How**: It transforms the 7 base features + 4 engineered features into a multi-class prediction (**Mild, Moderate, Severe**).
- **UI Output**: Determines the "Risk Level" badge and the color scheme of the entire dashboard.

### B. Wellness Severity Regressor
- **Model**: `Ridge Regression`.
- **Location**: `wellness_regression_model.pkl`.
- **How**: Predicts the **Stability Percentage** (0–100%) as a continuous value.
- **UI Output**: Drives the **Stability Gauge** and the **Wellness Index Area Chart** in Deep Insights.

### C. Relapse/Churn Predictor
- **Model**: `Logistic Regression`.
- **Location**: `relapse_model.pkl`.
- **How**: It calculates the "Delta" (change) between your current state and your previous check-in.
- **UI Output**: Drives the **"Predictive Trajectory"** section, showing the % probability of your risk level worsening.

---

## 3. Explainability & Analysis
These are specialized algorithms used to pull the "curtain" back on why the AI made a certain decision.

### SHAP (SHapley Additive exPlanations)
- **Algorithm**: `TreeExplainer` (for Random Forest).
- **Location**: `backend/model/explainability.py`.
- **Usage**: Calculates the **Feature Contributions** (e.g., "Why is my risk Severe? Because Sleep is -2.4 and Stress is +3.1").
- **UI Output**: Visualized as the **"Feature Impact"** bars in the analysis card.

### Feature Engineering (Heuristic Models)
- **Functions**: `engineer_features()`.
- **Location**: Shared between `train_model.py` and `prediction_service.py`.
- **Equation**: Combines raw inputs into logic like `sleep_stress_ratio` and `digital_wellness`. 
- **Usage**: These engineered values are used as inputs for *all* the models above.

---

## 4. Frontend Fallback (Local Model)
If the Python backend is offline, the frontend uses a **Heuristic Local Model** to ensure the app stays functional.

- **Location**: `frontend/lib/dashboard-utils.ts` -> `calculateRiskLevel()`.
- **Algorithm**: Weighted scoring (Heuristic).
- **Usage**: Immediately estimates risk and wellness based on hard-coded weights derived from the trained AI models.
- **UI Output**: Provides the "Local Estimate" warning banner and basic risk level results.
