import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# Test 1: Home page loads
def test_home_page(client):
    response = client.get("/")
    assert response.status_code == 200


# Test 2: Valid prediction works
def test_valid_prediction(client):
    data = {
        "age": 50,
        "sex": 1,
        "chest_pain_type": 0,
        "resting_bp": 120,
        "cholesterol": 200,
        "fasting_blood_sugar": 0,
        "resting_ecg": 0,
        "max_heart_rate": 150,
        "exercise_angina": 0,
        "oldpeak": 1.0,
        "st_slope": 1
    }

    response = client.post("/predict", json=data)

    assert response.status_code == 200

    result = response.get_json()
    assert result["success"] is True
    assert "prediction" in result
    assert "risk_label" in result


# Test 3: Missing input is rejected
def test_missing_input(client):
    data = {
        "age": 50,
        "sex": 1
    }

    response = client.post("/predict", json=data)

    assert response.status_code == 400


# Test 4: Invalid age is rejected
def test_invalid_age(client):
    data = {
        "age": 150,
        "sex": 1,
        "chest_pain_type": 0,
        "resting_bp": 120,
        "cholesterol": 200,
        "fasting_blood_sugar": 0,
        "resting_ecg": 0,
        "max_heart_rate": 150,
        "exercise_angina": 0,
        "oldpeak": 1.0,
        "st_slope": 1
    }

    response = client.post("/predict", json=data)

    assert response.status_code == 400