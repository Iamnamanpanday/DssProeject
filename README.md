# NeuroSentinel: Mental Health Decision Support System (DSS)

A professional-grade, AI-powered Mental Health Monitoring Dashboard and Decision Support System (DSS). NeuroSentinel synchronizes human biological markers in real-time to provide longitudinal risk analysis, wellness forecasting, and automated clinical interventions.

![NeuroSentinel Dashboard](https://raw.githubusercontent.com/Iamnamanpanday/DssProeject/main/frontend/public/placeholder.jpg)

---

## 🚀 Advanced DSS Features

### 1. Multi-Model Architecture
NeuroSentinel operates on a complex AI backbone consisting of three specialized research-grade models:
- **Primary Risk Classifier (Random Forest)**: Categorizes current state into **Mild**, **Moderate**, or **Severe** risk using a tuned 200-tree ensemble.
- **Wellness severity Regressor (Ridge)**: Predicts a granular **Wellness Score (0-100)** to track subtle improvements or declines.
- **Relapse / Churn Predictor (Logistic Regression)**: Analyzes the "Delta" (change) between observations to forecast the probability of a risk-level worsening.

### 2. Deep Insights Analytics
A professional telemetry dashboard organized into logical work-tabs:
- **Overview Tab**: Unified health cards, baseline Radar comparisons, and historical risk distribution.
- **Trend Modeling Tab**: Longitudinal tracking of Mood vs. Stress correlations (Line Charts) to identify triggers.
- **Predictive DSS Tab**: Continuous Wellness Index area charts and an **AI Trajectory Engine** forecasting future risk windows with confidence intervals.

### 3. Explainability (SHAP)
Integrated **SHAP (SHapley Additive exPlanations)** values reveal the "Why" behind every AI decision, visualizing exactly which features (like Sleep deficit or screen-time spikes) are driving the current risk analysis.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Recharts.
- **Backend**: Python 3.10+, Flask REST API, Scikit-learn, SHAP, Pandas, Joblib.
- **Dev Tools**: Docker support, PowerShell automated scripts.

---

## 🏁 Quick Start

### 1. Prerequisites
- **Python 3.10+** (in `backend/`)
- **Node.js 18+** (in `frontend/`)

### 2. Automated Launch
Run the automated startup script from the root directory:
```powershell
.\start_system.ps1
```
This script initializes the Python virtual environment, installs dependencies for both layers, and launches the Backend (Port 5000) and Frontend (Port 3000) concurrently.

### 3. Research Mode (Re-train AI)
To regenerate the synthetic data and re-train the analytical models, run:
```bash
python backend/model/train_model.py
```

---

## 📂 Project Structure

- `/frontend`: Next.js dashboard application with professional DSS telemetry.
- `/backend`: Flask AI server, ML pipeline, and SHAP explainability service.
- `algorithm_mapping.md`: Technical documentation of applied ML strategies.
- `train_model_explanation.md`: Comprehensive breakdown of the training pipeline logic.

---

## ⚖️ License
This project is licensed under the MIT License.
