"""
Model Training Script for NER-SAFE Landslide Early Warning Engine.
Generates synthetic yet scientifically representative geomorphological data
for the North Eastern Region of India (Assam, Meghalaya, Sikkim, Nagaland, etc.),
trains a Scikit-Learn Random Forest pipeline, and saves the serialized model.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

def generate_ner_landslide_dataset(n_samples: int = 4000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    # 1. Continuous rainfall features (mm)
    rainfall_24h = np.random.gamma(shape=2.5, scale=25.0, size=n_samples) # 0 - 250 mm
    rainfall_6h = rainfall_24h * np.random.uniform(0.3, 0.6, size=n_samples)
    rainfall_3h = rainfall_6h * np.random.uniform(0.4, 0.7, size=n_samples)
    rainfall_1h = rainfall_3h * np.random.uniform(0.3, 0.6, size=n_samples)
    rainfall_intensity = rainfall_1h # mm/hr
    
    # 2. Geotechnical and Soil features
    # Soil moisture correlates with continuous rainfall
    base_moisture = np.random.uniform(25.0, 50.0, size=n_samples)
    soil_moisture = np.clip(base_moisture + (rainfall_24h * 0.35) + np.random.normal(0, 3, size=n_samples), 15.0, 99.0)
    
    # 3. Topographical and Terrain features (typical NER hills)
    slope_angle = np.clip(np.random.normal(loc=28.0, scale=10.0, size=n_samples), 5.0, 65.0)
    elevation = np.random.uniform(200.0, 3200.0, size=n_samples)
    historical_freq = np.random.poisson(lam=2.5, size=n_samples)
    distance_to_road = np.clip(np.random.exponential(scale=150.0, size=n_samples), 10.0, 1000.0)
    field_reports = np.random.binomial(n=3, p=0.25, size=n_samples)
    
    # 4. Latent geotechnical failure index (Coulomb safety factor proxy)
    # Higher rainfall + high slope + saturated soil + close to road cut increases probability
    slope_factor = (slope_angle / 45.0) ** 1.5
    moisture_factor = (soil_moisture / 75.0) ** 2.0
    rain_factor = (rainfall_24h / 100.0) ** 1.3
    road_cut_influence = np.where(distance_to_road < 100, 1.25, 1.0)
    history_influence = 1.0 + (historical_freq * 0.1)
    
    latent_risk = (
        0.30 * rain_factor +
        0.25 * moisture_factor +
        0.20 * slope_factor * road_cut_influence +
        0.15 * history_influence +
        0.10 * (field_reports * 0.3)
    )
    
    # Normalize risk score 0 - 100
    risk_score = np.clip(latent_risk * 45.0 + np.random.normal(0, 4, size=n_samples), 5.0, 98.0)
    
    # Labels: 0=Low, 1=Moderate, 2=High, 3=Critical
    labels = np.zeros(n_samples, dtype=int)
    labels[(risk_score >= 35) & (risk_score < 60)] = 1
    labels[(risk_score >= 60) & (risk_score < 80)] = 2
    labels[risk_score >= 80] = 3
    
    df = pd.DataFrame({
        "rainfall_1h": rainfall_1h,
        "rainfall_3h": rainfall_3h,
        "rainfall_6h": rainfall_6h,
        "rainfall_24h": rainfall_24h,
        "rainfall_intensity": rainfall_intensity,
        "soil_moisture": soil_moisture,
        "slope_angle": slope_angle,
        "elevation": elevation,
        "historical_landslide_freq": historical_freq,
        "distance_from_road": distance_to_road,
        "field_reports": field_reports,
        "risk_score": risk_score,
        "risk_level_label": labels
    })
    return df

def train_and_save_model(output_path: str = "backend/app/ml/landslide_model.joblib"):
    print("Generating synthetic NER terrain and precipitation dataset...")
    df = generate_ner_landslide_dataset()
    
    feature_cols = [
        "rainfall_1h", "rainfall_3h", "rainfall_6h", "rainfall_24h", "rainfall_intensity",
        "soil_moisture", "slope_angle", "elevation", "historical_landslide_freq",
        "distance_from_road", "field_reports"
    ]
    
    X = df[feature_cols]
    y_class = df["risk_level_label"]
    y_reg = df["risk_score"]
    
    X_train, X_test, y_train_cls, y_test_cls = train_test_split(X, y_class, test_size=0.2, random_state=42)
    _, _, y_train_reg, y_test_reg = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier & Regressor...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train_cls)
    
    reg = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
    reg.fit(X_train, y_train_reg)
    
    # Evaluate
    preds_cls = clf.predict(X_test)
    probs_cls = clf.predict_proba(X_test)
    print("Model Evaluation Report:")
    print(classification_report(y_test_cls, preds_cls, target_names=["LOW", "MODERATE", "HIGH", "CRITICAL"]))
    
    model_bundle = {
        "classifier": clf,
        "regressor": reg,
        "feature_names": feature_cols,
        "classes": ["LOW", "MODERATE", "HIGH", "CRITICAL"],
        "metadata": {
            "version": "RandomForest-v1.2-NER",
            "region": "North Eastern Region of India (Assam, Meghalaya, Sikkim, Nagaland, etc.)",
            "features_count": len(feature_cols)
        }
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(model_bundle, output_path)
    print(f"Saved trained landslide model bundle to {output_path}")

if __name__ == "__main__":
    train_and_save_model()
