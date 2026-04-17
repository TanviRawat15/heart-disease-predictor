/**
 * CardioScan — main.js
 * Handles form validation, API call to Flask backend,
 * and result rendering.
 */

/* ── Selectors ─────────────────────────────────────────── */
const form       = document.getElementById("predictForm");
const submitBtn  = document.getElementById("submitBtn");
const btnInner   = submitBtn.querySelector(".btn-inner");
const btnLoading = document.getElementById("btnLoading");
const globalErr  = document.getElementById("globalError");

const resultCard  = document.getElementById("resultCard");
const resultIcon  = document.getElementById("resultIcon");
const resultLabel = document.getElementById("resultLabel");
const resultSub   = document.getElementById("resultSub");
const confFill    = document.getElementById("confFill");
const confPct     = document.getElementById("confPct");
const confWrap    = document.getElementById("confWrap");
const resetBtn    = document.getElementById("resetBtn");

/* ── Helpers ────────────────────────────────────────────── */

/** Show/hide loading state on submit button */
function setLoading(on) {
  submitBtn.disabled = on;
  btnInner.hidden    = on;
  btnLoading.hidden  = !on;
}

/** Scroll element into view smoothly */
function scrollTo(el) {
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Clear all inline field errors */
function clearErrors() {
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
  document.querySelectorAll("input, select").forEach(el => el.classList.remove("error"));
  globalErr.textContent = "";
}

/** Set an error on a specific field */
function setFieldError(name, msg) {
  const errEl = document.getElementById(`err-${name}`);
  const inputEl = form.querySelector(`[name="${name}"]`);
  if (errEl)   errEl.textContent = msg;
  if (inputEl) inputEl.classList.add("error");
}

/* ── Collect form data ──────────────────────────────────── */
function collectFormData() {
  const data = {};
  let valid  = true;

  // Text/number inputs
  const numberFields = [
    { name: "age",            label: "Age",              min: 1,  max: 120 },
    { name: "resting_bp",     label: "Resting BP",       min: 50, max: 250 },
    { name: "cholesterol",    label: "Cholesterol",      min: 0,  max: 700 },
    { name: "max_heart_rate", label: "Max Heart Rate",   min: 50, max: 250 },
    { name: "oldpeak",        label: "Oldpeak",          min: -5, max: 7   },
  ];

  numberFields.forEach(({ name, label, min, max }) => {
    const el  = form.querySelector(`[name="${name}"]`);
    const val = el ? el.value.trim() : "";

    if (val === "") {
      setFieldError(name, `${label} is required.`);
      valid = false;
    } else if (isNaN(parseFloat(val))) {
      setFieldError(name, `${label} must be a number.`);
      valid = false;
    } else if (parseFloat(val) < min || parseFloat(val) > max) {
      setFieldError(name, `${label} must be between ${min} and ${max}.`);
      valid = false;
    } else {
      data[name] = parseFloat(val);
    }
  });

  // Select dropdowns
  const selectFields = ["chest_pain_type", "resting_ecg", "st_slope"];
  selectFields.forEach(name => {
    const el  = form.querySelector(`[name="${name}"]`);
    const val = el ? el.value : "";
    if (val === "" || val === null) {
      setFieldError(name, "Please select an option.");
      valid = false;
    } else {
      data[name] = parseFloat(val);
    }
  });

  // Radio buttons
  const radioFields = ["sex", "fasting_blood_sugar", "exercise_angina"];
  radioFields.forEach(name => {
    const checked = form.querySelector(`[name="${name}"]:checked`);
    if (!checked) {
      setFieldError(name, "Please select an option.");
      valid = false;
    } else {
      data[name] = parseFloat(checked.value);
    }
  });

  return valid ? data : null;
}

/* ── Render prediction result ───────────────────────────── */
function showResult(data) {
  const isHigh = data.risk_level === "high";

  // Icon
  resultIcon.textContent = isHigh ? "💔" : "💚";
  resultIcon.className   = "result-icon " + data.risk_level;

  // Label
  resultLabel.textContent = data.risk_label;
  resultLabel.className   = "result-label " + data.risk_level;

  // Subtitle message
  if (isHigh) {
    resultSub.textContent =
      "The model indicates elevated cardiovascular risk based on your inputs. " +
      "Please consult a cardiologist for a full evaluation.";
  } else {
    resultSub.textContent =
      "The model indicates a lower risk of heart disease based on your inputs. " +
      "Maintain a healthy lifestyle and continue regular check-ups.";
  }

  // Confidence bar
  if (data.confidence !== null && data.confidence !== undefined) {
    confWrap.style.display = "block";
    confFill.className     = "confidence-fill " + data.risk_level;
    confPct.textContent    = `${data.confidence}% confident`;

    // Animate after next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        confFill.style.width = `${data.confidence}%`;
      });
    });
  } else {
    confWrap.style.display = "none";
  }

  // Show card
  resultCard.hidden = false;
  scrollTo(resultCard);
}

/* ── Submit handler ─────────────────────────────────────── */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const payload = collectFormData();
  if (!payload) {
    globalErr.textContent = "Please fix the errors above before submitting.";
    return;
  }

  setLoading(true);
  globalErr.textContent = "";

  try {
    const response = await fetch("/predict", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      globalErr.textContent = result.error || "Prediction failed. Please try again.";
      setLoading(false);
      return;
    }

    showResult(result);

  } catch (err) {
    console.error("Fetch error:", err);
    globalErr.textContent =
      "Could not reach the server. Make sure Flask is running on port 5000.";
  }

  setLoading(false);
});

/* ── Reset handler ──────────────────────────────────────── */
resetBtn.addEventListener("click", () => {
  resultCard.hidden = true;
  confFill.style.width = "0%";
  clearErrors();
  form.reset();
  scrollTo(form);
});
