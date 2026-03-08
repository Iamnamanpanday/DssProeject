"""
Unit and integration tests for the Mental Health Decision Support System API.

Run tests:
    python -m pytest backend/tests/test_api.py -v

Or with coverage:
    python -m pytest backend/tests/test_api.py -v --cov=backend
"""

import pytest
import json
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import create_app
from config import FEATURE_RANGES


@pytest.fixture
def app():
    """
    Create and configure a Flask test application.
    
    Yields:
        Flask application instance configured for testing
    """
    app = create_app()
    app.config['TESTING'] = True
    yield app


@pytest.fixture
def client(app):
    """
    Create a test client for the Flask app.
    
    Args:
        app: Flask application fixture
    
    Yields:
        Flask test client
    """
    yield app.test_client()


class TestHealthEndpoint:
    """Tests for the health check endpoint."""
    
    def test_health_check_returns_200(self, client):
        """Test that health endpoint returns 200 status."""
        response = client.get('/api/health')
        assert response.status_code == 200
    
    def test_health_check_response_format(self, client):
        """Test that health endpoint returns proper format."""
        response = client.get('/api/health')
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert 'data' in data
        assert 'message' in data['data']
        assert 'version' in data['data']
    
    def test_health_check_contains_version(self, client):
        """Test that health response contains version info."""
        response = client.get('/api/health')
        data = json.loads(response.data)
        
        assert data['data']['version'] == '1.0.0'


class TestInfoEndpoint:
    """Tests for the API information endpoint."""
    
    def test_info_endpoint_returns_200(self, client):
        """Test that info endpoint returns 200 status."""
        response = client.get('/api/info')
        assert response.status_code == 200
    
    def test_info_endpoint_response_structure(self, client):
        """Test that info endpoint returns complete metadata."""
        response = client.get('/api/info')
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert 'data' in data
        assert 'title' in data['data']
        assert 'endpoints' in data['data']
        assert 'input_features' in data['data']
        assert 'output_classes' in data['data']
    
    def test_info_endpoint_output_classes(self, client):
        """Test that info endpoint lists correct output classes."""
        response = client.get('/api/info')
        data = json.loads(response.data)
        
        classes = data['data']['output_classes']
        assert 'mild' in classes
        assert 'moderate' in classes
        assert 'severe' in classes


class TestPredictEndpoint:
    """Tests for the prediction endpoint."""
    
    def test_predict_endpoint_requires_json(self, client):
        """Test that predict endpoint requires JSON content type."""
        response = client.post(
            '/api/predict',
            data='not json',
            content_type='text/plain'
        )
        assert response.status_code == 400
    
    def test_predict_valid_input(self, client):
        """Test prediction with valid input data."""
        valid_input = {
            'sleep_hours': 7,
            'stress_level': 5,
            'activity_level': 6,
            'mood_score': 7
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(valid_input),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
    
    def test_predict_response_structure(self, client):
        """Test that prediction response has correct structure."""
        valid_input = {
            'sleep_hours': 7,
            'stress_level': 5,
            'activity_level': 6,
            'mood_score': 7
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(valid_input),
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        assert 'data' in data
        assert 'risk_level' in data['data']
        assert 'confidence' in data['data']
        assert 'recommendation' in data['data']
        assert 'input_features' in data['data']
    
    def test_predict_risk_level_valid(self, client):
        """Test that predicted risk level is one of valid classes."""
        valid_input = {
            'sleep_hours': 7,
            'stress_level': 5,
            'activity_level': 6,
            'mood_score': 7
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(valid_input),
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        risk_level = data['data']['risk_level']
        
        assert risk_level in ['mild', 'moderate', 'severe']
    
    def test_predict_confidence_in_range(self, client):
        """Test that confidence score is between 0 and 1."""
        valid_input = {
            'sleep_hours': 7,
            'stress_level': 5,
            'activity_level': 6,
            'mood_score': 7
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(valid_input),
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        confidence = data['data']['confidence']
        
        assert 0 <= confidence <= 1
    
    @pytest.mark.parametrize('feature,value', [
        ('sleep_hours', -1),      # Out of range
        ('stress_level', 0),      # Below minimum
        ('activity_level', 11),   # Above maximum
        ('mood_score', 15),       # Out of range
    ])
    def test_predict_invalid_ranges(self, client, feature, value):
        """Test prediction with out-of-range values."""
        invalid_input = {
            'sleep_hours': 7,
            'stress_level': 5,
            'activity_level': 6,
            'mood_score': 7,
            feature: value
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(invalid_input),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_predict_missing_features(self, client):
        """Test prediction with missing required features."""
        incomplete_input = {
            'sleep_hours': 7,
            'stress_level': 5
            # Missing activity_level and mood_score
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(incomplete_input),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_predict_high_stress_scenario(self, client):
        """Test scenario: high stress → elevated risk."""
        high_stress_input = {
            'sleep_hours': 4,   # Low sleep
            'stress_level': 10,  # High stress
            'activity_level': 2, # Low activity
            'mood_score': 2      # Low mood
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(high_stress_input),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        risk_level = data['data']['risk_level']
        
        # High stress should result in moderate or severe risk
        assert risk_level in ['moderate', 'severe']
    
    def test_predict_healthy_scenario(self, client):
        """Test scenario: healthy indicators → mild risk."""
        healthy_input = {
            'sleep_hours': 8,    # Good sleep
            'stress_level': 3,   # Low stress
            'activity_level': 8, # High activity
            'mood_score': 8      # Good mood
        }
        
        response = client.post(
            '/api/predict',
            data=json.dumps(healthy_input),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        risk_level = data['data']['risk_level']
        
        # Healthy indicators should result in mild risk
        assert risk_level == 'mild'


class TestRootEndpoint:
    """Tests for the root endpoint."""
    
    def test_root_endpoint_returns_200(self, client):
        """Test that root endpoint works."""
        response = client.get('/')
        assert response.status_code == 200
    
    def test_root_endpoint_contains_info(self, client):
        """Test that root endpoint provides helpful information."""
        response = client.get('/')
        data = json.loads(response.data)
        
        assert 'title' in data
        assert 'version' in data
        assert 'documentation' in data


class TestErrorHandling:
    """Tests for error handling."""
    
    def test_404_error(self, client):
        """Test 404 error handling."""
        response = client.get('/nonexistent/endpoint')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['status'] == 'error'
    
    def test_405_error(self, client):
        """Test 405 error (method not allowed)."""
        response = client.get('/api/predict')  # GET instead of POST
        assert response.status_code == 405
        data = json.loads(response.data)
        assert data['status'] == 'error'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
