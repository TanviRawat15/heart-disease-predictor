# CardioScan — Heart Disease Prediction Web App

A clean Flask web application that serves your trained ML model for
real-time cardiovascular risk prediction.

---

## Project Structure

```
heart_predict/
│
├── app.py                      ← Flask backend (main entry point)
├── requirements.txt            ← Python dependencies
│
├── model/
│   ├── heart_model.pkl         ← ✅ YOUR TRAINED MODEL (place here)
│   └── scaler.pkl              ← ✅ YOUR SCALER (place here, optional)
│
├── templates/
│   └── index.html              ← Frontend HTML page
│
└── static/
    ├── css/
    │   └── style.css           ← Dark theme styles
    ├── js/
    │   └── main.js             ← Frontend JS (form + API call)
    └── images/
        └── feature_importance.png  ← (optional) feature importance chart
```

---

## Step-by-Step Setup

### Step 1 — Place your model files

Copy your trained model and scaler from Google Colab into the `model/` folder:

```
heart_predict/model/heart_model.pkl   ← required
heart_predict/model/scaler.pkl        ← optional (if you used StandardScaler)
```

**To download from Colab**, run this in a Colab cell:

```python
from google.colab import files

# Save and download model
import pickle

with open("heart_model.pkl", "wb") as f:
    pickle.dump(model, f)          # your trained model variable

with open("scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)         # your StandardScaler variable

files.download("heart_model.pkl")
files.download("scaler.pkl")
```

---

### Step 2 — (Optional) Add feature importance image

If you have a feature importance chart, save it as:

```
static/images/feature_importance.png
```

To generate one in Colab (for Random Forest):

```python
import matplotlib.pyplot as plt
import numpy as np

importances = best_model.feature_importances_
feature_names = [
    "Age", "Sex", "Chest Pain", "Resting BP", "Cholesterol",
    "Fasting BS", "Resting ECG", "Max HR", "Exercise Angina",
    "Oldpeak", "ST Slope"
]
indices = np.argsort(importances)

plt.figure(figsize=(8, 6))
plt.barh(range(len(indices)), importances[indices], color="#e05c5c")
plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
plt.title("Feature Importance", fontsize=14)
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150)
files.download("feature_importance.png")
```

---

### Step 3 — Install Python dependencies

Open a terminal in the `heart_predict/` folder and run:

```bash
pip install -r requirements.txt
```

---

### Step 4 — Run the Flask app

```bash
python app.py
```

You should see:

```
✅ Model loaded from model/heart_model.pkl
 * Running on http://127.0.0.1:5000
```

---

### Step 5 — Open in browser

Visit: **http://127.0.0.1:5000**

Fill in the health data form and click **"Analyse Risk"** to get a prediction.

---

## Column / Feature Order

The model expects features in this **exact order** (must match training):

| # | Feature Name          | Range      | Type     |
|---|-----------------------|------------|----------|
| 1 | age                   | 1 – 120    | Integer  |
| 2 | sex                   | 0 or 1     | Binary   |
| 3 | chest_pain_type       | 0 – 3      | Category |
| 4 | resting_bp            | 50 – 250   | Integer  |
| 5 | cholesterol           | 0 – 700    | Integer  |
| 6 | fasting_blood_sugar   | 0 or 1     | Binary   |
| 7 | resting_ecg           | 0 – 2      | Category |
| 8 | max_heart_rate        | 50 – 250   | Integer  |
| 9 | exercise_angina       | 0 or 1     | Binary   |
|10 | oldpeak               | -5 – 7     | Float    |
|11 | st_slope              | 0 – 2      | Category |

> ⚠️ If your model was trained with different column names or order,
> update the `FEATURE_COLUMNS` list in `app.py` to match.

---

## Prediction Output

| Prediction | Meaning                              |
|------------|--------------------------------------|
| 1          | **High Risk** — disease likely       |
| 0          | **Low Risk** — disease less likely   |

---

## Troubleshooting

| Problem                            | Fix                                          |
|------------------------------------|----------------------------------------------|
| "Model not loaded" error           | Confirm `heart_model.pkl` is in `model/`     |
| Prediction always wrong            | Check column order matches training           |
| Feature importance image missing   | Place PNG at `static/images/feature_importance.png` |
| Port already in use                | Change `port=5000` in `app.py` to `5001`     |
| CORS errors (browser)              | Run both frontend & backend from `app.py`    |

---

*This project is for educational purposes only and not intended as
a substitute for professional medical advice.*
