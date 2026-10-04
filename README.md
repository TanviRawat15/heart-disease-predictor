# CardioScan — Heart Disease Prediction Web App

CardioScan is a machine-learning web application that predicts the risk of heart disease from basic clinical inputs. The trained model is served through a Flask API and deployed using Docker on an AWS EC2 instance.

## Project Overview

The application:
- Takes 11 clinical features as input.
- Uses a trained ML model and scaler to generate a prediction.
- Provides the prediction and confidence through a Flask API.
- Runs inside a Docker container.
- Is deployed on AWS EC2 using a private Amazon ECR image repository.
- Uses GitHub Actions to automatically run tests on every push and pull request.

## Architecture

### Application architecture

```text
User
  ↓
Web Interface
  ↓
Flask API (/predict)
  ↓
Scaler → ML Model
  ↓
Prediction + Risk Level
```

### Cloud deployment architecture

```text
User / Browser
      ↓
AWS EC2
      ↓
Docker Container
      ↓
Flask Application
      ↓
ML Model
```

The Docker image is stored in Amazon ECR and pulled by the EC2 instance.

## Technologies

- Python
- Flask
- Scikit-learn
- NumPy
- Joblib
- Docker
- Amazon ECR
- Amazon EC2
- GitHub Actions
