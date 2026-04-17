"""
Heart Disease Prediction - Flask Backend
=========================================
Run:  python app.py
Then open: http://127.0.0.1:5000
"""

from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import os

app = Flask(__name__)

# ── Load trained model ─────────────────────────────────────────
MODEL_PATH = os.path.join("model", "model.joblib")
SCALER_PATH = os.path.join("model", "scaler.joblib")
model  = None
scaler = None

def load_artifacts():
    global model, scaler
    try:
        
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    except FileNotFoundError:
        print(f"⚠️  Model file not found at {MODEL_PATH}")

    try:
        scaler = joblib.load(SCALER_PATH)
        print(f"✅ Scaler loaded from {SCALER_PATH}")
    except FileNotFoundError:
        # Scaler is optional – prediction still works without it
        print(f"ℹ️  No scaler found at {SCALER_PATH} — using raw input values.")

load_artifacts()


# ── Column order MUST match the order used during model training ──
FEATURE_COLUMNS = [
    "age",
    "sex",
    "chest_pain_type",
    "resting_bp",
    "cholesterol",
    "fasting_blood_sugar",
    "resting_ecg",
    "max_heart_rate",
    "exercise_angina",
    "oldpeak",
    "st_slope",
]

# Validation ranges – used to catch obviously bad inputs
VALIDATION_RULES = {
    "age":                (1,   120),
    "sex":                (0,     1),
    "chest_pain_type":    (0,     3),
    "resting_bp":         (50,  250),
    "cholesterol":        (0,   700),
    "fasting_blood_sugar":(0,     1),
    "resting_ecg":        (0,     2),
    "max_heart_rate":     (50,  250),
    "exercise_angina":    (0,     1),
    "oldpeak":            (-5,    7),
    "st_slope":           (0,     2),
}


# ── Routes ─────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """Receive JSON from frontend, run model, return prediction."""

    if model is None:
        return jsonify({
            "success": False,
            "error": "Model not loaded. Place heart_model.pkl in the model/ folder."
        }), 500

    data = request.get_json(force=True)

    # ── 1. Parse & validate inputs ──────────────────────────────
    features = []
    errors   = []

    for col in FEATURE_COLUMNS:
        raw = data.get(col)

        # Missing field
        if raw is None or str(raw).strip() == "":
            errors.append(f"'{col}' is required.")
            continue

        # Must be numeric
        try:
            val = float(raw)
        except (ValueError, TypeError):
            errors.append(f"'{col}' must be a number.")
            continue

        # Range check
        lo, hi = VALIDATION_RULES[col]
        if not (lo <= val <= hi):
            errors.append(f"'{col}' must be between {lo} and {hi}.")
            continue

        features.append(val)

    if errors:
        return jsonify({"success": False, "error": " | ".join(errors)}), 400

    # ── 2. Scale if scaler is available ─────────────────────────
    X = np.array(features).reshape(1, -1)
    if scaler is not None:
        X = scaler.transform(X)

    # ── 3. Predict ───────────────────────────────────────────────
    prediction   = int(model.predict(X)[0])
    probability  = model.predict_proba(X)[0].tolist() if hasattr(model, "predict_proba") else None

    risk_label   = "High Risk" if prediction == 1 else "Low Risk"
    risk_level   = "high"      if prediction == 1 else "low"
    confidence   = round(probability[prediction] * 100, 1) if probability else None

    return jsonify({
        "success":     True,
        "prediction":  prediction,
        "risk_label":  risk_label,
        "risk_level":  risk_level,
        "confidence":  confidence,
        "probability": probability,
    })

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)