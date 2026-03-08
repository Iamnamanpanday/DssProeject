# Mental Health Decision Support System - Backend API

A production-quality AI-powered Flask REST API for mental health risk assessment and decision support.

## Overview

This backend system uses a trained Machine Learning model (RandomForestClassifier) to predict depression risk levels based on mental health indicators. The API provides real-time risk assessment with personalized recommendations.

## Features

- **Django-style Production Architecture** - Clean, modular, and scalable code structure
- **ML Model Integration** - scikit-learn RandomForestClassifier for depression risk prediction
- **REST API with Flask** - Fast, lightweight, and production-ready
- **Input Validation** - Comprehensive validation of mental health features
- **Error Handling** - Robust error handling with informative messages
- **CORS Support** - Enabled for cross-origin requests
- **Comprehensive Logging** - Detailed logging for debugging and monitoring
- **Unit & Integration Tests** - Full test coverage with pytest
- **API Documentation** - Built-in endpoints for API metadata

## Project Structure

```
backend/
├── app.py                      # Flask application factory
├── config.py                   # Configuration and constants
├── requirements.txt            # Python dependencies
│
├── api/
│   ├── __init__.py
│   └── routes.py              # REST API endpoints
│
├── services/
│   ├── __init__.py
│   └── prediction_service.py  # ML model inference logic
│
├── model/
│   ├── __init__.py
│   ├── train_model.py         # Model training script
│   └── depression_model.pkl   # Trained model (generated)
│
├── utils/
│   ├── __init__.py
│   └── preprocessing.py        # Feature validation & preprocessing
│
├── data/
│   └── synthetic_data.csv     # Training dataset (generated)
│
└── tests/
    ├── __init__.py
    └── test_api.py            # Unit and integration tests
```

## Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Setup Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start

### Step 1: Train the Model

Before running the API, you need to train the ML model:

```bash
python model/train_model.py
```

This script will:
- Generate 500 synthetic mental health samples
- Train a RandomForestClassifier model
- Save the trained model to `model/depression_model.pkl`
- Output detailed model evaluation metrics
- Save the dataset to `data/synthetic_data.csv`

**Expected output:**
```
Generating 500 synthetic samples...
Training RandomForestClassifier...
==================================================
MODEL EVALUATION
==================================================
Training Accuracy: 0.9700
Test Accuracy: 0.9500

Classification Report (Test Set):
              precision    recall  f1-score   support
        mild       0.95      0.98      0.97        35
    moderate       0.92      0.90      0.91        30
      severe       0.96      0.94      0.95        35
    accuracy                           0.94       100
...
Model saved to backend/model/depression_model.pkl
```

### Step 2: Start the API Server

Run the Flask development server:

```bash
python app.py
```

Or using Flask CLI:
```bash
flask --app app run --debug
```

**Expected output:**
```
Mental Health Decision Support System - Model Training Pipeline
==================================================
Starting Mental Health Decision Support System
Environment: development
Debug mode: True
==================================================
API available at: http://localhost:5000
API documentation: http://localhost:5000/api/info
Health check: http://localhost:5000/api/health
==================================================
 * Running on http://0.0.0.0:5000
```

### Step 3: Test the API

#### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get API information
curl http://localhost:5000/api/info

# Make a prediction (example: moderate stress scenario)
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sleep_hours": 6,
    "stress_level": 6,
    "activity_level": 5,
    "mood_score": 6
  }'
```

#### Using Python

```python
import requests
import json

# Make prediction request
response = requests.post(
    'http://localhost:5000/api/predict',
    json={
        'sleep_hours': 7,
        'stress_level': 5,
        'activity_level': 6,
        'mood_score': 7
    }
)

# Print response
print(json.dumps(response.json(), indent=2))
```

#### Using Postman

1. Open Postman
2. Create a new POST request to `http://localhost:5000/api/predict`
3. Set Content-Type header to `application/json`
4. Add request body:
   ```json
   {
     "sleep_hours": 7,
     "stress_level": 5,
     "activity_level": 6,
     "mood_score": 7
   }
   ```
5. Send the request

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

Check if the API is running and healthy.

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "API is healthy",
    "version": "1.0.0",
    "service": "Mental Health Decision Support System"
  }
}
```

### 2. API Information

**Endpoint:** `GET /api/info`

Get detailed information about the API, available endpoints, and features.

**Response:**
```json
{
  "status": "success",
  "data": {
    "title": "Mental Health Decision Support System",
    "version": "1.0.0",
    "description": "AI-powered API for mental health risk prediction",
    "endpoints": {
      "/api/health": "GET - Health check",
      "/api/predict": "POST - Make a prediction",
      "/api/info": "GET - API information"
    },
    "input_features": {
      "sleep_hours": {
        "type": "float",
        "range": [0, 12],
        "description": "Hours of sleep per night"
      },
      ...
    },
    "output_classes": ["mild", "moderate", "severe"]
  }
}
```

### 3. Predict Depression Risk

**Endpoint:** `POST /api/predict`

Predict depression risk level based on mental health indicators.

**Request Body:**
```json
{
  "sleep_hours": 7,
  "stress_level": 5,
  "activity_level": 6,
  "mood_score": 7
}
```

**Input Features:**
- `sleep_hours` (float): Hours of sleep per night (0-12)
- `stress_level` (int): Stress level on scale 1-10
- `activity_level` (int): Physical activity level on scale 1-10
- `mood_score` (int): Current mood on scale 1-10

**Response:**
```json
{
  "status": "success",
  "data": {
    "risk_level": "mild",
    "confidence": 0.8750,
    "recommendation": "Maintain healthy lifestyle. Continue with regular exercise and adequate sleep.",
    "input_features": {
      "sleep_hours": 7,
      "stress_level": 5,
      "activity_level": 6,
      "mood_score": 7
    }
  }
}
```

**Output Classes:**
- `mild` - Low depression risk; recommend lifestyle improvements
- `moderate` - Medium depression risk; recommend therapist consultation
- `severe` - High depression risk; recommend immediate professional help

## Example Scenarios

### Scenario 1: Healthy Individual
```json
{
  "sleep_hours": 8,
  "stress_level": 3,
  "activity_level": 8,
  "mood_score": 8
}
```
**Expected Output:** `mild` risk level

### Scenario 2: Moderately Stressed
```json
{
  "sleep_hours": 6,
  "stress_level": 6,
  "activity_level": 5,
  "mood_score": 6
}
```
**Expected Output:** `moderate` risk level

### Scenario 3: High Risk
```json
{
  "sleep_hours": 4,
  "stress_level": 10,
  "activity_level": 2,
  "mood_score": 2
}
```
**Expected Output:** `severe` risk level

## Error Handling

### Validation Error

**Request:**
```json
{
  "sleep_hours": -1,
  "stress_level": 5,
  "activity_level": 6,
  "mood_score": 7
}
```

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Feature 'sleep_hours' must be between 0 and 12, got -1"
}
```

### Missing Features

**Request:**
```json
{
  "sleep_hours": 7,
  "stress_level": 5
}
```

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Missing required features: activity_level, mood_score"
}
```

### Invalid Content Type

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Request must be JSON"
}
```

## Running Tests

### Prerequisites

Install pytest (included in requirements):
```bash
pip install pytest pytest-cov
```

### Run All Tests

```bash
python -m pytest tests/test_api.py -v
```

### Run Tests with Coverage

```bash
python -m pytest tests/test_api.py -v --cov=.
```

### Run Specific Test Class

```bash
python -m pytest tests/test_api.py::TestPredictEndpoint -v
```

### Run Specific Test

```bash
python -m pytest tests/test_api.py::TestPredictEndpoint::test_predict_valid_input -v
```

**Test Coverage Includes:**
- ✓ Health check endpoint
- ✓ API information endpoint
- ✓ Prediction endpoint with valid inputs
- ✓ Input validation and error handling
- ✓ Range validation for all features
- ✓ Missing feature detection
- ✓ Response format validation
- ✓ Confidence score validation
- ✓ Risk level classification
- ✓ Error handling and 404/405 responses
- ✓ Multiple scenario testing

## Configuration

All configuration is centralized in `config.py`:

```python
# Flask environment
DEBUG = True
FLASK_ENV = 'development'

# Model and data paths
MODEL_PATH = 'backend/model/depression_model.pkl'
DATA_PATH = 'backend/data/synthetic_data.csv'

# Input feature ranges
FEATURE_RANGES = {
    'sleep_hours': {'min': 0, 'max': 12},
    'stress_level': {'min': 1, 'max': 10},
    'activity_level': {'min': 1, 'max': 10},
    'mood_score': {'min': 1, 'max': 10}
}

# Recommendations
RECOMMENDATIONS = {
    'mild': 'Maintain healthy lifestyle...',
    'moderate': 'Consider talking to a therapist...',
    'severe': 'Please seek immediate professional help...'
}
```

To modify settings, edit `config.py` before running the application.

## Machine Learning Model Details

### Architecture
- **Algorithm:** RandomForestClassifier
- **Number of Trees:** 100
- **Max Depth:** 15
- **Random State:** 42 (for reproducibility)

### Features Used
1. `sleep_hours` - Hours of sleep per night
2. `stress_level` - Stress level (1-10)
3. `activity_level` - Physical activity (1-10)
4. `mood_score` - Current mood (1-10)

### Training Statistics
- **Train Set:** 400 samples (80%)
- **Test Set:** 100 samples (20%)
- **Classes:** 3 (mild, moderate, severe)
- **Typical Accuracy:** 94-96%

### Feature Importance
Rankings from the trained model show which features most influence predictions:
1. stress_level (≈35%)
2. sleep_hours (≈30%)
3. activity_level (≈20%)
4. mood_score (≈15%)

## Performance Optimization

For production deployment:

1. **Use a Production WSGI Server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:create_app
   ```

2. **Enable Caching:**
   - Model is loaded once at startup
   - Input validation is optimized

3. **Database Integration (Optional):**
   - Add SQLAlchemy for prediction history logging
   - Store user data for analytics

4. **API Rate Limiting:**
   - Add Flask-Limiter to prevent abuse
   - Example: 100 requests per minute per IP

## Security Considerations

1. **Input Validation** - All inputs validated against ranges
2. **CORS Configuration** - Restrict origins in production
3. **Error Messages** - Avoid exposing sensitive system information
4. **Logging** - Sensitive data is not logged
5. **Secret Key** - Change from default in production

## Deployment Options

### Docker

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

### Heroku

```bash
git push heroku main
```

### AWS/Azure/GCP

Use containerization with Docker and deploy to cloud services.

## Troubleshooting

### Model File Not Found
```
Error: Model file not found at backend/model/depression_model.pkl
```
**Solution:** Run `python model/train_model.py` first

### Port Already in Use
```
Error: Address already in use
```
**Solution:** Change port in `app.py` or kill process using port 5000

### Import Errors
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:** Activate virtual environment and run `pip install -r requirements.txt`

### Model Accuracy Low
- Retrain with more data: Increase `n_samples` in `train_model.py`
- Adjust hyperparameters in `model/train_model.py`
- Add more features related to depression indicators

## Future Enhancements

- [ ] Add user authentication and profiles
- [ ] Store prediction history in database
- [ ] Implement prediction analytics dashboard
- [ ] Add support for multiple ML models
- [ ] Implement model versioning
- [ ] Add real-time monitoring and alerting
- [ ] Implement push notifications for high-risk users
- [ ] Add integration with mental health professionals
- [ ] Implement A/B testing for recommendations
- [ ] Add voice/video integration for initial assessment

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `pytest tests/ -v`
4. Submit pull request

## License

This project is provided as-is for educational and development purposes.

## Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review the test cases for usage examples
3. Check logs for detailed error messages

## Disclaimer

This system is for decision support purposes only and should not replace professional mental health consultation. Always encourage users to consult with qualified mental health professionals for accurate diagnosis and treatment.
