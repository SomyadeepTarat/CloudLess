#!/usr/bin/env python3
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

print("Creating synthetic training data...")
# Create synthetic training data
np.random.seed(42)
X = np.random.rand(500, 14)  # 14 features
y = np.random.uniform(5, 60, 500)  # RAM usage 5-60 MB

print("Training model...")
# Train model
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X, y)

print("Saving model...")
# Save model
joblib.dump(model, 'ram_model.pkl')
print("✓ Model trained and saved successfully")
