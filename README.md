# NeuroSentinel

### AI-Based Mental Health Decision Support System

NeuroSentinel is an **AI-powered mental health decision support platform** that analyzes behavioral indicators such as sleep, stress, activity, and mood to estimate **depression risk levels** and provide intelligent recommendations.

The system combines **machine learning, behavioral analytics, and an interactive dashboard** to assist early detection and monitoring of mental health conditions.

---

# Overview

Mental health conditions such as depression often develop gradually and may go unnoticed until symptoms become severe. NeuroSentinel aims to provide a **data-driven early warning system** that helps individuals, clinicians, and wellness programs monitor mental health trends.

The platform collects behavioral indicators and applies machine learning models to classify depression risk into three categories:

* Mild
* Moderate
* Severe

Based on the prediction, the system generates actionable recommendations ranging from **lifestyle improvements to professional mental health intervention**.

---

# Key Features

### AI Depression Risk Classification

Machine learning model analyzes behavioral indicators to estimate mental health risk level.

### Behavioral Health Inputs

The system evaluates:

* Sleep duration
* Stress level
* Physical activity level
* Mood score

### Intelligent Recommendations

Based on predicted risk level, the system suggests:

* Self-care strategies
* Lifestyle improvements
* Therapist consultation
* Emergency support if needed

### Real-Time AI Dashboard

Interactive interface displaying:

* AI prediction results
* Mood tracking inputs
* Mental stability gauge
* Behavioral analytics

### Mental Health Trend Visualization

Charts track behavioral patterns and mental state trends over time.

### Relapse Risk Monitoring

Behavioral history is analyzed to detect patterns that may indicate **mental health decline or relapse risk**.

---

# System Architecture

```
Frontend (React / Tailwind / Framer Motion)
           │
           │ API Requests
           ▼
Backend API (Flask)
           │
           │ ML Inference
           ▼
Machine Learning Model
(Random Forest Classifier)
           │
           ▼
Data Storage
(Firebase / Local Storage)
```

---

# Technology Stack

### Frontend

* React
* TailwindCSS
* Framer Motion
* Chart.js

### Backend

* Python
* Flask
* Flask-CORS

### Machine Learning

* Scikit-learn
* Pandas
* NumPy
* Joblib

### Data Visualization

* Chart.js

---

# Machine Learning Model

The depression risk classifier uses behavioral indicators as input features.

### Input Features

| Feature        | Description                       |
| -------------- | --------------------------------- |
| sleep_hours    | Average hours of sleep            |
| stress_level   | Self-reported stress level (1–10) |
| activity_level | Physical activity level (1–10)    |
| mood_score     | Self-reported mood rating (1–10)  |

### Model

The current implementation uses:

**Random Forest Classifier**

Advantages:

* Robust to noisy behavioral data
* Handles nonlinear relationships
* Suitable for small datasets

Future versions may include:

* LSTM for mood time-series prediction
* Transformer-based sentiment analysis
* Clinical PHQ-9 scoring integration

---

# API Endpoints

### Health Check

```
GET /health
```

Response:

```
{
 "status": "running"
}
```

---

### Depression Risk Prediction

```
POST /predict
```

Example Request

```
{
 "sleep_hours": 5,
 "stress_level": 7,
 "activity_level": 3,
 "mood_score": 4
}
```

Example Response

```
{
 "risk_level": "moderate",
 "recommendation": "Consider speaking with a mental health professional and improving sleep habits."
}
```

---

# Project Structure

```
backend
│
├── app.py
├── config.py
├── requirements.txt
│
├── api
│   └── routes.py
│
├── services
│   └── prediction_service.py
│
├── model
│   ├── train_model.py
│   └── depression_model.pkl
│
├── utils
│   └── preprocessing.py
│
├── data
│   └── synthetic_data.csv
│
└── tests
    └── test_api.py
```

---

# Installation

Clone the repository

```
git clone https://github.com/yourusername/neurosentinel.git
cd neurosentinel
```

Create virtual environment

```
python -m venv venv
```

Activate environment

Windows

```
venv\Scripts\activate
```

Mac/Linux

```
source venv/bin/activate
```

Install dependencies

```
pip install -r requirements.txt
```

---

# Train Machine Learning Model

Run the training script

```
python model/train_model.py
```

This generates:

```
model/depression_model.pkl
```

---

# Run Backend Server

```
python app.py
```

Server will start at:

```
http://127.0.0.1:5000
```

---

# Frontend Integration

The frontend dashboard communicates with the backend using REST API requests.

Example fetch request:

```javascript
fetch("http://127.0.0.1:5000/predict", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
   sleep_hours: 6,
   stress_level: 5,
   activity_level: 4,
   mood_score: 6
 })
})
```

---

# Potential Applications

This system can be used by:

* Hospitals
* Mental health clinics
* Telehealth platforms
* Corporate wellness programs
* Universities
* Mental health research projects

---

# Ethical Considerations

NeuroSentinel is designed as a **decision support tool**, not a diagnostic system.

Predictions should **not replace professional medical evaluation**. The system is intended to assist early detection and encourage individuals to seek professional support when needed.

---

# Future Improvements

* Time-series mood analysis
* Personalized behavioral modeling
* Integration with wearable health devices
* NLP-based emotional sentiment detection
* Clinical depression screening questionnaires

---

# License

MIT License

---

# Author

AI / ML Research Project

NeuroSentinel — Intelligent Mental Health Monitoring
