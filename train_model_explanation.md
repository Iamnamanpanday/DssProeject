# Mental Health AI: Training Pipeline Explanation (`train_model.py`)

The `train_model.py` script is the backbone of the Decision Support System (DSS). It handles everything from data creation to the training of multiple specialized AI models.

---

## 1. Data Generation & Feature Engineering
Since real-world medical data is sensitive, the script generates **synthetic data** (1,500 samples) that mimics real human patterns.

### Raw Features (The Inputs)
The model takes 7 base inputs from the user:
- `sleep_hours`, `stress_level`, `activity_level`, `mood_score`, `hydration_level`, `screen_time`, `focus_efficiency`.

### Engineered Features (The "Intelligence")
To make the AI smarter, the script creates **Composite Features** that capture complex relationships:
- **Sleep-Stress Ratio**: High sleep + Low stress = High Resilience.
- **Lifestyle Score**: Average of activity, hydration, and focus.
- **Digital Wellness**: Inverted screen time (less screen = better).
- **Risk Composite**: A weighted index combining all factors to determine a vulnerability score.

---

## 2. The Multi-Model Strategy
The DSS doesn't rely on just one model. It uses three distinct types of AI:

### A. The Primary Classifier (Risk Level)
- **Algorithm**: Random Forest (tuned with `GridSearchCV`).
- **Goal**: Categorizes the user into **Mild**, **Moderate**, or **Severe** risk.
- **Tuning**: It automatically tests different combinations of "trees" and "depths" to find the most accurate configuration.

### B. The Wellness Regressor (Continuous Score)
- **Algorithm**: Ridge Regression.
- **Goal**: Predicts a granular **Wellness Score (0-100)**.
- **Why?**: While a category (e.g., "Moderate") is helpful, a continuous score allows clinicians to see small improvements or declines (e.g., moving from 45 to 52).

### C. The Relapse Predictor (Future Risk)
- **Algorithm**: Logistic Regression.
- **Goal**: Predicts the probability of **Relapse/Churn**.
- **How?**: It analyzes the "Delta" (the change) between two points in time. If your sleep is dropping while stress is rising, this model flags a high probability that your risk level will worsen soon.

---

## 3. Validation Techniques
To ensure the models are "professional grade," the script uses:
- **10-Fold Stratified Cross-Validation**: Splits the data into 10 parts and rotates them for training/testing. This ensures the model isn't "guessing" and works well on unseen data.
- **Feature Importance**: The script logs which factors (like Sleep or Stress) were the most important in making a decision.

---

## 4. Pipeline Workflow
1. **Generate Data**: Creates the `synthetic_data.csv`.
2. **Pre-processing**: Uses `StandardScaler` to normalize the data (making sure a stress level of 10 isn't treated the same as 10 hours of sleep).
3. **Compare**: Runs a "Tournament" of 7 algorithms (SVM, KNN, Naive Bayes, etc.) and saves the results to `model_comparison.csv`.
4. **Train**: Fits the best models on the full dataset.
5. **Save**: Exports the models as `.pkl` files (Pickles) so the Backend API can load them instantly when you click "Analyze" in the UI.

---

> [!TIP]
> You can run this entire pipeline yourself by executing:
> `python backend/model/train_model.py`
> This will refresh all models and update the `model_comparison.csv` used in your dashboard.
